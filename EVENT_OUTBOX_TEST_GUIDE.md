## Event Outbox Pattern - SaaS Architecture Test Guide

**Status:** ✅ Implementation Complete v0.1  
**Build:** ✅ SUCCESS (31.61s, 0 errors)  
**Date:** March 5, 2026

---

## Overview

This guide verifies the Event Outbox pattern implementation - a SaaS-ready event ingestion layer with:
- **Multi-tenant support** via `tenantId` field
- **Event sourcing** via `streamKey` (tenant:vehicle partitioning)
- **Idempotency** via `idempotencyKey` with duplicate detection
- **Storage abstraction** via `StorageAdapter` interface (pluggable backends)
- **Backward compatibility** (existing pipelines still work)

---

## Architecture

```
Event Created
    ↓
ingestDataEngineEvent(envelope) [async]
    ↓
ingestWithOutbox(envelope)
    ├─ Enrich with defaults (tenantId='dev', streamKey, idempotencyKey)
    ├─ Check idempotency (skip if seen before)
    ├─ Append via StorageAdapter
    └─ Continue to existing pipeline:
        ├─ pushUnifiedDataEngineEventLog() [event stream UI]
        └─ applyDataEngineEventToSnapshot() [snapshot read-model]

Storage Layer (pluggable):
├─ DEV: DevStorageAdapter (localStorage + memory)  
└─ PROD: ProdStorageAdapter (API placeholder, no-op for now)
```

---

## Files Created/Modified

### New Files
1. **src/modules/data-engine/storage/storageAdapter.ts** (250 lines)
   - StorageAdapter interface
   - DevStorageAdapter implementation (localStorage + idempotency keys)
   - ProdStorageAdapter placeholder
   - getStorageAdapter() factory function

2. **src/modules/data-engine/ingestion/eventOutbox.ts** (150 lines)
   - ingestWithOutbox() main function
   - Envelope enrichment with defaults
   - Idempotency checks
   - Pipeline coordination
   - Helper exports for testing

### Modified Files
1. **src/modules/data-engine/contracts/dataEngineEventTypes.ts**
   - Added `tenantId` field to DataEngineEventEnvelope
   - Added `streamKey` field 
   - Added `idempotencyKey` field
   - Added enrichEnvelopeWithDefaults() helper function

2. **src/modules/data-engine/ingestion/dataEngineIngestion.ts**
   - Imported ingestWithOutbox
   - Made ingestDataEngineEvent async
   - Updated to call ingestWithOutbox before event pipeline

3. **src/modules/data-engine/ingestion/dataEngineEventSender.ts**
   - Updated sendDataEngineEvent to await ingestDataEngineEvent calls

---

## Test Scenarios

### Scenario 1: Basic Event Ingestion
**Objective:** Verify event ingestion flow works end-to-end

```javascript
// Step 1: Create and send an event
const evt = {
  eventId: 'evt-1',
  eventType: 'RISK_INDICES_UPDATED',
  source: 'RISK_ENGINE',
  vehicleId: '11',
  occurredAt: new Date().toISOString(),
  schemaVersion: '1.0',
  piiSafe: true,
  payload: { indices: [{ key: 'trustIndex', value: 75 }] }
};

// Step 2: Send via existing API (will call ingestWithOutbox internally)
await sendDataEngineEvent(evt);

// Step 3: Verify storage
const adapter = getOutboxAdapter();
const stats = await adapter.getStats();
console.log('Events stored:', stats.count); // Expected: 1
```

**Expected Results:**
- ✅ Event appears in localStorage under `LENT_DATA_ENGINE_OUTBOX_V1`
- ✅ Event appears in event stream (DataEngine Event Log panel)
- ✅ Snapshot updated with risk indices
- ✅ Storage stats show count=1

---

### Scenario 2: Idempotency - Duplicate Event Detection
**Objective:** Verify duplicate events are rejected at storage layer

```javascript
const evt = {
  eventId: 'evt-1', // SAME ID as Scenario 1
  eventType: 'RISK_INDICES_UPDATED',
  source: 'RISK_ENGINE',
  vehicleId: '11',
  occurredAt: new Date().toISOString(),
  schemaVersion: '1.0',
  piiSafe: true,
  payload: { indices: [{ key: 'trustIndex', value: 75 }] }
};

// Send the same event twice
await sendDataEngineEvent(evt); // First: appended
await sendDataEngineEvent(evt); // Second: skipped (duplicate)

// Verify
const stats = await adapter.getStats();
console.log('Events stored:', stats.count); // Expected: 1 (not 2!)
```

**Expected Results:**
- ✅ Second ingestion returns false (duplicate)
- ✅ Storage count remains 1 (no double-store)
- ✅ No error thrown
- ✅ Debug log: "[EventOutbox] Duplicate detected"

---

### Scenario 3: Multi-Tenant Partitioning
**Objective:** Verify events are properly partitioned by tenant

```javascript
// Create events for 2 tenants
const evt1 = {
  eventId: 'evt-1',
  tenantId: 'tenant-A',
  vehicleId: '11',
  eventType: 'RISK_INDICES_UPDATED',
  source: 'RISK_ENGINE',
  occurredAt: new Date().toISOString(),
  schemaVersion: '1.0',
  piiSafe: true,
  payload: { indices: [] }
};

const evt2 = {
  ...evt1,
  eventId: 'evt-2',
  tenantId: 'tenant-B',
  vehicleId: '22'
};

// Send both
await sendDataEngineEvent(evt1);
await sendDataEngineEvent(evt2);

// Query by tenant
const adapter = getOutboxAdapter();
const stream1 = await adapter.getByStream('tenant-A', '11');
const stream2 = await adapter.getByStream('tenant-B', '22');

console.log('Tenant-A events:', stream1.length); // Expected: 1
console.log('Tenant-B events:', stream2.length); // Expected: 1
console.log('Total events:', (await adapter.getStats()).count); // Expected: 2
```

**Expected Results:**
- ✅ Events are stored separately by tenant
- ✅ getByStream() correctly filters by tenantId and vehicleId
- ✅ Stats show 2 unique tenants
- ✅ streamKey defaults to `{{tenantId}}:{{vehicleId}}`

---

### Scenario 4: Envelope Enrichment with Defaults
**Objective:** Verify missing SaaS fields are populated with defaults

```javascript
// Create a "legacy" event without SaaS fields
const evt = {
  eventId: 'evt-1',
  eventType: 'RISK_INDICES_UPDATED',
  source: 'RISK_ENGINE',
  vehicleId: '11',
  occurredAt: new Date().toISOString(),
  schemaVersion: '1.0',
  piiSafe: true,
  payload: { indices: [] }
  // NOTE: No tenantId, streamKey, or idempotencyKey
};

await sendDataEngineEvent(evt);

// Verify enrichment
const adapter = getOutboxAdapter();
const allEvents = await adapter.getAll();
const stored = allEvents[0];

console.log('tenantId:', stored.tenantId);          // Expected: 'dev'
console.log('streamKey:', stored.streamKey);        // Expected: 'dev:11'
console.log('idempotencyKey:', stored.idempotencyKey); // Expected: 'evt-1'
```

**Expected Results:**
- ✅ tenantId defaults to 'dev'
- ✅ idempotencyKey defaults to eventId
- ✅ streamKey defaults to `dev:11`
- ✅ Original eventId preserved

---

### Scenario 5: Storage Limits (Max 500 Events)
**Objective:** Verify storage adapter respects 500-event limit

```javascript
// Create 510 events
for (let i = 0; i < 510; i++) {
  await sendDataEngineEvent({
    eventId: `evt-${i}`,
    eventType: 'RISK_INDICES_UPDATED',
    source: 'RISK_ENGINE',
    vehicleId: `v${i % 5}`,
    occurredAt: new Date(Date.now() - i * 1000).toISOString(),
    schemaVersion: '1.0',
    piiSafe: true,
    payload: { indices: [] }
  });
}

// Verify only last 500 are kept
const stats = await adapter.getStats();
console.log('Events stored:', stats.count); // Expected: 500
```

**Expected Results:**
- ✅ Only 500 most recent events retained
- ✅ Older events (0-9) are dropped
- ✅ No errors thrown
- ✅ lastAppendedAt updated

---

### Scenario 6: Backward Compatibility (Event Stream)
**Objective:** Verify existing event log UI still works with new outbox

```javascript
// In DataEngine.tsx, event stream should still populate:
// - Local Event Store count
// - Event list display
// - Snapshot indices

await sendDataEngineEvent({
  eventId: 'evt-1',
  eventType: 'INSURANCE_INDICES_UPDATED',
  source: 'RISK_ENGINE',
  vehicleId: '11',
  occurredAt: new Date().toISOString(),
  schemaVersion: '1.0',
  piiSafe: true,
  payload: { indices: [{ key: 'riskScore', value: 45, confidence: 90 }] }
});

// In UI, verify:
// 1. Event appears in "Event Stream" panel
// 2. Snapshot shows updated riskScore=45
// 3. Event log shows event with metadata
```

**Expected Results:**
- ✅ Event appears in event stream panel
- ✅ Snapshot panel shows updated indices
- ✅ No breaking changes to event UI
- ✅ Replay functionality still works

---

### Scenario 7: Idempotency Key Override
**Objective:** Verify custom idempotency keys work (advanced use case)

```javascript
// Two events with same idempotencyKey but different eventIds
const evt1 = {
  eventId: 'evt-1',
  idempotencyKey: 'custom-key-123',
  eventType: 'RISK_INDICES_UPDATED',
  source: 'RISK_ENGINE',
  vehicleId: '11',
  occurredAt: new Date().toISOString(),
  schemaVersion: '1.0',
  piiSafe: true,
  payload: { indices: [] }
};

const evt2 = {
  ...evt1,
  eventId: 'evt-2' // Different eventId
  // SAME idempotencyKey: 'custom-key-123'
};

await sendDataEngineEvent(evt1);
const result = await sendDataEngineEvent(evt2);

console.log('Second ingestion result:', result); // Expected: false (duplicate)
const stats = await adapter.getStats();
console.log('Events stored:', stats.count); // Expected: 1
```

**Expected Results:**
- ✅ Second event rejected due to idempotency key match
- ✅ Only evt1 stored (evt2 rejected)
- ✅ Count=1, not 2

---

## DEV Mode Testing Utilities

### Console API (window object exposures)

```javascript
// Get outbox adapter (testing only)
const adapter = window.__deStore?.outboxAdapter || get Out boxAdapter();

// Storage stats
const stats = await adapter.getStats();
console.log(stats);
// {
//   count: 5,
//   tenantIds: ['dev', 'tenant-A'],
//   lastAppendedAt: '2026-03-05T...'
// }

// Get all events
const allEvents = await adapter.getAll();
console.log(allEvents[0]);

// Clear (dangerous!)
// await adapter.clear(); // DEV only

// Check specific stream
const events = await adapter.getByStream('dev', '11');
console.log('Events for v11:', events.length);
```

---

## Verification Checklist

- [ ] Build succeeds with 0 TypeScript errors
- [ ] Scenario 1: Basic ingestion works (event stored + displayed)
- [ ] Scenario 2: Duplicate events are rejected
- [ ] Scenario 3: Multi-tenant events properly partitioned
- [ ] Scenario 4: Missing SaaS fields auto-populated
- [ ] Scenario 5: Storage limit enforced at 500 events
- [ ] Scenario 6: Event stream UI still functional
- [ ] Scenario 7: Custom idempotency keys respected
- [ ] localStorage contains events under`LENT_DATA_ENGINE_OUTBOX_V1`
- [ ] Idempotency keys tracked under `LENT_DATA_ENGINE_OUTBOX_V1:IDEMPOTENCY`
- [ ] No breaking changes to existing features
- [ ] DEV-only code gated with `import.meta.env.DEV`
- [ ] Console output shows [EventOutbox] prefixes for debugging
- [ ] Async/await chain works end-to-end

---

## Troubleshooting

### "Could not resolve storageAdapter" error
- **Cause:** Import path mismatch
- **Fix:** Ensure eventOutbox.ts imports from `'../storage/storageAdapter'` not `'./storageAdapter'`

### Duplicate events still appearing in UI
- **Cause:** Existing appendEvent function also checks idempotency?
- **Verification:** Check localEventStore.ts for separate idempotency logic
- **Note:** The two storage layers (outbox + local event store) are separate concerns

### Storage not persisting across page refresh
- **Cause:** localStorage might be disabled or quota exceeded
- **Debug:** Check browser DevTools → Storage → localStorage for LENT_DATA_ENGINE_OUTBOX_V1 key
- **Note:** This is expected if localStorage is disabled in DEV

### Async/await errors in sendDataEngineEvent
- **Cause:** Callers not awaiting the function
- **Fix:** Update all calls to `await sendDataEngineEvent()`
- **Grep:** Search for `sendDataEngineEvent` and check all callers use `await`

---

## Next Steps (Out of Scope)

1. **PROD Storage Adapter:**
   - Replace ProdStorageAdapter no-op with real API backend
   - POST /data-engine/events with event envelope + idempotency key
   - Retry queue if backend unavailable

2. **Event Sourcing:**
   - Use streamKey to reconstruct full audit trail per vehicle
   - Implement snapshot versioning (v1, v2, etc.)
   - Add time-travel debugging

3. **Performance:**
   - Index events by vehicleId + timestamp
   - Batch saves (100 events → flush)
   - Archive old events (>30 days) to cold storage

4. **Observability:**
   - Add telemetry metric: outbox.duplicates_rejected
   - Add metric: outbox.storage_adapter.latency
   - Add alert: outbox storage approaching max (450+ events)

---

## References

- [EVENT_OUTBOX_ARCHITECTURE.md](./EVENT_OUTBOX_ARCHITECTURE.md) - Detailed design
- [dataEngineEventTypes.ts](../src/modules/data-engine/contracts/dataEngineEventTypes.ts) - Type definitions
- [eventOutbox.ts](../src/modules/data-engine/ingestion/eventOutbox.ts) - Implementation
- [storageAdapter.ts](../src/modules/data-engine/storage/storageAdapter.ts) - Storage layer

---

**Test Version:** 0.1  
**Last Updated:** March 5, 2026

