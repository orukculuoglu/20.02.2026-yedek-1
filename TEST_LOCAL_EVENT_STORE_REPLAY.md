# Local Event Store + Replay Testing Guide

## Overview
This document verifies the DEV-only Local Event Store + Replay implementation for Data Engine deterministic testing.

**Platform:** Development environment only (`import.meta.env.DEV`)
**Storage:** Browser localStorage (`DE_LOCAL_EVENT_STORE_V1`)
**Capacity:** 500 events max (append-only, bounded)
**PII-Safety:** Removes meta objects, VIN/plate patterns before persistence

## Test Procedure

### Step A: Open DataEngine View and Generate Mock Events

1. Navigate to **DataEngine** view (development environment)
2. Locate the **"Local Event Store (DEV)"** panel (yellow/amber styled section)
   - Should show: "0 events stored (max 500)"
3. Generate mock Risk/Insurance/Part events:
   - Use existing "Generate Mock Risk" / "Generate Mock Insurance" buttons in other DEV sections
   - Or manually trigger event ingestion from other Data Engine domain panels
4. Watch the Local Event Store counter increment

**Expected Result:** Event count increases from 0 to N (e.g., 5 events)

---

### Step B: Confirm Store Count Increases

1. Check the **"Local Event Store (DEV)"** panel counter
2. It should display: "5 events stored (max 500)" (or actual count)
3. Below the counter, you should see:
   - **Last Event ID:** (UUID or timestamp-based ID substring)
   - **Last Occurred:** (Recent timestamp, e.g., "14:32:45")

**Expected Result:** Statistics displayed, count matches events generated

---

### Step C: Hard Refresh Page and Confirm Persistence

1. Press **F5** (or Ctrl+R) to hard refresh the page
2. Go back to **DataEngine** view
3. Check the **"Local Event Store (DEV)"** panel counter again

**Expected Result:**
- Event count **persists** (e.g., still shows "5 events stored")
- This confirms localStorage persistence is working
- No events are lost on page refresh

---

### Step D: Execute Replay and Verify Snapshot Rebuild

1. In **"Local Event Store (DEV)"** panel, click **"Replay (All Events)"** button
2. System should replay all stored events through the vehicleStateReducer
3. A success message should appear: **"5 snapshot(s) loaded from replay"** (in green)
4. Open **"VehicleState Snapshot (DEV)"** panel below
5. Enter a **Vehicle ID** that was used in the generated events (e.g., "11")
6. Click "Temizle" or press Enter to load the snapshot

**Expected Result:**
- Snapshot displays with Risk/Insurance/Part indices from replayed events
- Indices match the latest events generated in Step A
- Confidence values and timestamps are accurate
- Snapshot shows domain-specific `lastUpdatedAt` for each domain

**Example Output:**
```
Vehicle ID: 11
Son Güncelleme: 4.3.2026 14:35:22

Son Event
Domain: risk
Event Type: RISK_INDICES_UPDATED
Saat: 14:32:45
Kaynak: MOCK_GENERATOR

Risk Indices
Avg Conf: 85.5%
- trustIndex: 87 (85% güven)
- reliabilityIndex: 92 (90% güven)
- maintenanceDiscipline: 78 (80% güven)

[Additional indices...]
```

---

### Step E: Replay by Vehicle ID (Optional Filter)

1. In **"Local Event Store (DEV)"** panel, enter a specific **Vehicle ID** (e.g., "12") in the text input
2. Click **"Replay (Filter)"** button
3. Only events for that Vehicle ID should be replayed

**Expected Result:**
- Snapshot count decreases (if fewer events for that vehicle)
- "2 snapshot(s) loaded from replay" (example for vehicle ID 12)
- When you load that specific vehicle in VehicleState Snapshot, data appears

---

### Step F: Test Clear Store Function

1. In **"Local Event Store (DEV)"** panel, click **"Clear Store"** button
2. Confirm the dialog: "Store temizlenecek. Devam et?"
3. Click **"Tamam"** (Yes)

**Expected Result:**
- Event counter resets to **"0 events stored (max 500)"**
- Stats section disappears (no last event info)
- Replay buttons become disabled
- `useReplayedSnapshots` flag resets, clearing any replayed data
- Hard refresh confirms the store is empty (no persisted data)

---

### Step G: Verify PII Sanitization (Manual Inspection)

1. In **"Local Event Store (DEV)"** panel, expand **"Last Event JSON (Inspector)"** section
2. Review the sanitized event payload

**Expected:**
- No `meta` objects in payload
- No VIN values (17-char alphanumeric patterns removed)
- No TR plate numbers (e.g., "34ABC1234" patterns removed)
- Only `vehicleId`, indices (key/value/confidence), timestamps, and eventType present

**Example Sanitized Event:**
```json
{
  "eventId": "1709556745123-abc123def456",
  "eventType": "RISK_INDICES_UPDATED",
  "source": "MOCK_GENERATOR",
  "vehicleId": "11",
  "occurredAt": "2026-03-04T14:32:45.123Z",
  "schemaVersion": "1.0",
  "payload": {
    "indices": [
      {
        "key": "trustIndex",
        "value": 87,
        "confidence": 85.5
      }
    ]
  }
}
```

---

## Multi-Domain Event Type Testing (Risk, Part, Insurance)

### Verify All 3 Event Types Accumulate Equally

This test confirms that ALL eventTypes (RISK_INDICES_UPDATED, PART_INDICES_UPDATED, INSURANCE_INDICES_UPDATED) are stored without filtering.

#### Setup: Console Commands to Trigger All 3 Domains

```javascript
// Open browser console (F12) and run these commands sequentially

// Generate Risk event
import("/services/dataService.ts").then(m => m.getDataEngineIndices({
  domain: "risk",
  vehicleId: "11",
  vin: "TESTVIN123456789",
  plate: "34ABC1234"
}));

// Generate Part event  
import("/services/dataService.ts").then(m => m.getDataEngineIndices({
  domain: "part",
  vehicleId: "11"
}));

// Generate Insurance event
import("/services/dataService.ts").then(m => m.getDataEngineIndices({
  domain: "insurance",
  vehicleId: "11"
}));
```

#### Validation Step 1: Check Event Count Increases

```javascript
// In console, check store stats
window.__deStoreStats()
// Expected output: { count: 3, lastEventId: "...", lastOccurredAt: "..." }
```

#### Validation Step 2: Check EventType Breakdown

```javascript
// NEW function: Get count by eventType
window.__deStoreEventTypes()
// Expected output: 
// {
//   "RISK_INDICES_UPDATED": 1,
//   "PART_INDICES_UPDATED": 1,
//   "INSURANCE_INDICES_UPDATED": 1
// }
```

**CRITICAL SUCCESS CRITERIA:**
- ✅ All three eventTypes have count > 0
- ✅ All three eventTypes accumulated equally (no filtering)
- ✅ Total count matches sum of all eventTypes
- ❌ If only INSURANCE appears, Risk/Part events are being filtered or not emitted

#### Validation Step 3: Inspect Each Event Type

```javascript
// Get all events and filter by type
const events = window.__deStore.getStoredEvents();

// Risk events
console.log('Risk events:', events.filter(e => e.eventType === 'RISK_INDICES_UPDATED'));

// Part events
console.log('Part events:', events.filter(e => e.eventType === 'PART_INDICES_UPDATED'));

// Insurance events
console.log('Insurance events:', events.filter(e => e.eventType === 'INSURANCE_INDICES_UPDATED'));
```

**Expected:** Each array contains at least 1 event with:
- ✅ `eventType` properly preserved
- ✅ `payload.indices` array intact (not deleted by sanitization)
- ✅ `vehicleId` set to "11"
- ✅ `occurredAt` timestamp present

#### Example Risk Event Payload (After Sanitization):
```json
{
  "eventId": "1709556745123-risk-abc123",
  "eventType": "RISK_INDICES_UPDATED",
  "source": "DATA_ENGINE",
  "vehicleId": "11",
  "occurredAt": "2026-03-04T14:35:22.000Z",
  "schemaVersion": "1.0",
  "payload": {
    "indices": [
      {
        "key": "trustIndex",
        "value": 87,
        "confidence": 85.5,
        "updatedAt": "2026-03-04T14:35:22.000Z",
        "meta": { "description": "Trust-based risk calculation" }
      },
      {
        "key": "reliabilityIndex",
        "value": 92,
        "confidence": 90,
        "updatedAt": "2026-03-04T14:35:22.000Z"
      }
    ]
  },
  "piiSafe": true
}
```

#### Example Part Event Payload (After Sanitization):
```json
{
  "eventId": "1709556745124-part-def456",
  "eventType": "PART_INDICES_UPDATED",
  "source": "DATA_ENGINE",
  "vehicleId": "11",
  "occurredAt": "2026-03-04T14:35:23.000Z",
  "schemaVersion": "1.0",
  "payload": {
    "indices": [
      {
        "key": "criticalPartsCount",
        "value": 3,
        "confidence": 85,
        "updatedAt": "2026-03-04T14:35:23.000Z"
      },
      {
        "key": "supplyStressIndex",
        "value": 68,
        "confidence": 78,
        "updatedAt": "2026-03-04T14:35:23.000Z"
      },
      {
        "key": "priceVolatilityIndex",
        "value": 42,
        "confidence": 72,
        "updatedAt": "2026-03-04T14:35:23.000Z"
      },
      {
        "key": "estimatedMaintenanceCost",
        "value": 5234,
        "confidence": 81,
        "updatedAt": "2026-03-04T14:35:23.000Z"
      }
    ]
  },
  "piiSafe": true
}
```

#### Example Insurance Event Payload (After Sanitization):
```json
{
  "eventId": "1709556745125-insurance-ghi789",
  "eventType": "INSURANCE_INDICES_UPDATED",
  "source": "DATA_ENGINE",
  "vehicleId": "11",
  "occurredAt": "2026-03-04T14:35:24.000Z",
  "schemaVersion": "1.0",
  "payload": {
    "indices": [
      {
        "key": "coverageRiskLevel",
        "value": 6,
        "confidence": 92,
        "updatedAt": "2026-03-04T14:35:24.000Z"
      },
      {
        "key": "claimHistoryScore",
        "value": 78,
        "confidence": 88,
        "updatedAt": "2026-03-04T14:35:24.000Z"
      }
    ]
  },
  "piiSafe": true
}
```

#### Troubleshooting Multi-Domain Events

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Only INSURANCE events in store | `window.__deStoreEventTypes()` shows only `INSURANCE_INDICES_UPDATED` | Check if Risk/Part events are being emitted (see console logs for emitRiskIndicesEvent/emitPartIndicesEvent) |
| Risk events missing | RISK count is 0 | Verify dataEngineApiClient.emitRiskIndicesEvent is called after fetchFromMockImplementation |
| Part events missing | PART count is 0 | Verify dataEngineIndices.emitPartIndicesEvent is called and properly awaited |
| Indices arrays are empty | `payload.indices` is `[]` or `undefined` | Check sanitization logic - may be overly aggressive deleting field data |
| eventType is corrupted | `eventType` becomes "unknown" or disappears | Verify sanitization preserves eventType and doesn't treat it as sensitive field |

---

## Boundary Testing

### Test: Bounded Storage (≤500 Events)

1. Generate 600+ mock events (can be automated via console)
2. Check Local Event Store counter
3. **Expected:** Count remains at **500** (oldest events discarded)

### Test: Empty Store Behavior

1. Start fresh (empty localStorage)
2. Open DataEngine view
3. **Expected:** Local Event Store shows "0 events stored", all buttons disabled
4. Generate first event
5. **Expected:** Counter becomes "1", replay buttons enabled

### Test: Replay Empty Store

1. Clear store (Step F)
2. Try to click "Replay (All Events)"
3. **Expected:** Button remains disabled (count === 0)

---

## Performance Expectations

| Metric | Expected |
|--------|----------|
| Store Append Time | < 10ms |
| Replay Time (100 events) | < 100ms |
| Snapshot Load Time | < 5ms |
| localStorage Size (500 events) | ~2-5 MB (depending on payload size) |
| Page Refresh Time | No impact (async persistence) |

---

## Troubleshooting

### Issue: Store Count Not Increasing
- **Cause:** Events are being generated but not reaching `pushUnifiedDataEngineEventLog()`
- **Solution:** 
  - Check that `appendEvent()` is called in eventLogger.ts
  - Verify `import.meta.env.DEV` is true (development environment)
  - Check browser console for `[LocalEventStore]` debug messages

### Issue: Replay Doesn't Show Data
- **Cause:** Replayed snapshots not being displayed
- **Solution:**
  - Verify "Replay (All Events)" button was clicked and completed
  - Check for the green success message
  - Reload page and check if snapshot persists
  - Inspect Raw JSON to verify event structure

### Issue: Snapshots After Replay Don't Match
- **Cause:** Reducer logic or event payload mismatch
- **Solution:**
  - Compare last replayed event JSON with new event payload
  - Verify `applyDataEngineEventToSnapshot()` reducer logic
  - Check for domain type matching in reducer

### Issue: localStorage Quota Exceeded
- **Cause:** Too many events or large payloads
- **Solution:**
  - Clear store and restart
  - Reduce MAX_EVENTS constant (currently 500)
  - Ensure PII sanitization is removing verbose metadata

---

## Build Verification

Run:
```bash
npm run build
```

**Expected:** Zero TypeScript errors, successful compilation.

---

## Checklist

- [ ] Event count persists across hard refresh
- [ ] Replay (All) rebuilds snapshots with matching indices
- [ ] Replay (Filter) works for specific Vehicle IDs
- [ ] Clear Store resets counter and UI state  
- [ ] PII sanitization visible in JSON inspector
- [ ] No errors in browser console
- [ ] npm run build succeeds with 0 TS errors
- [ ] DEV-only gating works (no-op in production)

---

## Phase Reference

- **Phase 6.8:** VehicleState Snapshot architecture
- **Phase 6.9:** Local Event Store + Replay (THIS)
- **Depends on:** vehicleStateReducer, snapshotAccessor, DataEngineEventEnvelope

## Files Modified

| File | Change |
|------|--------|
| src/modules/data-engine/store/localEventStore.ts | **NEW** |
| src/modules/data-engine/eventLogger.ts | Wire `appendEvent()` call |
| views/DataEngine.tsx | Add DEV-only UI panel + state |

---

**Last Updated:** March 4, 2026
**Status:** Ready for testing
