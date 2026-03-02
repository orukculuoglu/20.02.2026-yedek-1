# Phase 6.4: Data Engine Backend Contract + Sender Adapter — Test Guide

## Overview

Phase 6.4 implements a clean, type-safe contract layer for Data Engine events with:
- Standardized envelope format (schema version DE-1.0)
- Mock (local queue) and Real (HTTP) sender implementations
- Automatic fallback from HTTP to queue on failure
- Idempotency keys for safe retries
- Full PII validation (no VIN/plate/phone/email in envelopes)

---

## Quick Test (Browser Console)

### 1. Test MOCK Sender (Default)

```javascript
// Import and run test
import("/services/dataService")
  .then(m => m.testDataEngineSender())
  .then(result => {
    console.log("RESULT:", result);
    // Expected (MOCK mode):
    // { status: "QUEUED", eventId: "...", queuedCount: 1 }
  })
  .catch(err => console.error("ERROR:", err));
```

**Expected Output (MOCK Mode):**
```json
{
  "status": "QUEUED",
  "eventId": "1698765432-abc123xyz",
  "queuedCount": 1
}
```

### 2. Switch to REAL Mode + Test

Set environment variable:
```
VITE_USE_REAL_API=true
```

Reload app, then repeat test:
```javascript
import("/services/dataService")
  .then(m => m.testDataEngineSender())
  .then(result => console.log("RESULT:", result))
  .catch(err => console.error("ERROR:", err));
```

**Expected Output (REAL Mode, Success):**
```json
{
  "status": "SENT",
  "eventId": "1698765432-abc123xyz"
}
```

**Expected Output (REAL Mode, Fallback):**
```json
{
  "status": "QUEUED",
  "eventId": "1698765432-abc123xyz",
  "queuedCount": 1,
  "error": {
    "code": "NETWORK_ERROR",
    "message": "Network error - API endpoint unreachable"
  }
}
```

---

## Manual Testing

### Test 1: Verify Contract Types

```javascript
import { 
  makeEventId, 
  makeOccurredAt, 
  makeIdempotencyKey 
} from "/src/modules/data-engine/contracts/dataEngineContract.js";

// Test ID generation
const eventId = makeEventId();
console.log("Event ID:", eventId);
// Expected: Format like "1698765432-abc123"

// Test timestamp
const ts = makeOccurredAt();
console.log("Timestamp:", ts);
// Expected: ISO 8601 UTC timestamp

// Test idempotency key
const key = makeIdempotencyKey({ vehicleId: "VEH-11", data: { x: 1 } });
console.log("Idempotency Key:", key);
// Expected: Format like "key-abc123def456"
// Same input always produces same key (deterministic)
```

### Test 2: Verify PII Validation

```javascript
import { getMockSender } from "/src/modules/data-engine/adapters/dataEngineSender.js";

const sender = getMockSender();

// Try to send envelope with PII → Should error
try {
  await sender.send({
    schemaVersion: "DE-1.0",
    eventId: "test-1",
    eventType: "RISK_RECOMMENDATION",
    occurredAt: new Date().toISOString(),
    tenantId: "LENT-CORP",
    subject: {
      vehicleId: "VEH-11",
      vin: "1HGCM82633A004352",  // ← PII field!
    },
    payload: {},
    idempotencyKey: "key-123",
  });
} catch (error) {
  console.log("Expected error:", error.message);
  // Expected: "PII field detected in subject: vin - use vehicleId or workOrderId only"
}
```

### Test 3: Sender Routing (MOCK vs REAL)

```javascript
import { getDataEngineSender } from "/src/modules/data-engine/adapters/dataEngineSender.js";
import { isRealApiEnabled } from "/services/apiClient.js";

// Check current mode
const realMode = isRealApiEnabled();
console.log("Real API enabled:", realMode);

// Get sender
const sender = getDataEngineSender();
console.log("Sender type:", sender.constructor.name);
// Expected (MOCK mode): "MockQueueSender"
// Expected (REAL mode): "HttpSender"
```

### Test 4: Queue State Inspection (MOCK Mode)

```javascript
import { getMockSender } from "/src/modules/data-engine/adapters/dataEngineSender.js";

const mockSender = getMockSender();

// Check queue
const queue = mockSender.getQueuedEvents();
console.log("Queued events:", queue.length);
console.log("Queue contents:", queue);
// Expected: Array of DataEngineEventEnvelope objects

// Clear queue
mockSender.clearQueue();
console.log("Queue after clear:", mockSender.getQueuedEvents().length);
// Expected: 0
```

### Test 5: HTTP Sender Fallback (REAL Mode)

```javascript
import { getHttpSender } from "/src/modules/data-engine/adapters/dataEngineSender.js";

// Only works if REAL mode enabled (VITE_USE_REAL_API=true)
const httpSender = getHttpSender();

// Check fallback queue (populated on POST failure)
const fallbackQueue = httpSender.getFallbackQueue();
console.log("Fallback queue size:", fallbackQueue.length);

// Clear fallback queue
httpSender.clearFallbackQueue();
console.log("Fallback queue after clear:", httpSender.getFallbackQueue().length);
```

---

## Test Envelope Structure

The contract defines envelopes like this:

```typescript
interface DataEngineEventEnvelope<T> {
  schemaVersion: "DE-1.0";           // Fixed version
  eventId: string;                   // Unique ID (e.g., "1698765432-abc123")
  eventType: DataEngineEventType;    // One of: RISK_RECOMMENDATION, RISK_INDEX_SNAPSHOT, etc.
  occurredAt: string;                // ISO 8601 timestamp
  tenantId: string;                  // Tenant for isolation
  subject: {                         // PII-safe identifiers only
    vehicleId?: string;              // OK: Vehicle ID
    workOrderId?: string;            // OK: Work order ID
  };
  payload: T;                        // Event-specific data (should be pre-sanitized)
  idempotencyKey: string;            // Hash for dedup on backend
  meta?: {
    source?: string;                 // Source system
    env?: string;                    // dev, prod, etc.
    appVersion?: string;             // App version
  };
}
```

---

## Test Cases by Scenario

### Scenario 1: All Tests Pass (MOCK Mode)

**Setup:**
- `VITE_USE_REAL_API=false` (default)
- App running locally

**Test Steps:**
1. Open browser console
2. Run `testDataEngineSender()` → Expect `{ status: "QUEUED", ... }`
3. Check queue: `getMockSender().getQueuedEvents().length` → Expect 1
4. Clear queue: `getMockSender().clearQueue()`

**Expected Result:** ✅ All steps succeed

### Scenario 2: REAL Mode with Working Backend

**Setup:**
- `VITE_USE_REAL_API=true`
- Backend `/data-engine/events` endpoint is running and healthy
- App running

**Test Steps:**
1. Run `testDataEngineSender()` → Expect `{ status: "SENT", ... }`
2. Verify no entries in fallback queue

**Expected Result:** ✅ Event sent successfully

### Scenario 3: REAL Mode with Offline Backend

**Setup:**
- `VITE_USE_REAL_API=true`
- Backend `/data-engine/events` is offline or unreachable
- App running

**Test Steps:**
1. Run `testDataEngineSender()` → Expect `{ status: "QUEUED", ..., error: {...} }`
2. Check fallback queue: `getHttpSender().getFallbackQueue().length` → Expect 1
3. Verify error message is non-PII

**Expected Result:** ✅ Event queued locally, fallback works

### Scenario 4: PII Rejection

**Setup:**
- App running (any mode)

**Test Steps:**
1. Try sending envelope with VIN field in subject → Catch error
2. Error message should indicate PII detected

**Expected Result:** ✅ Error caught, no PII sent

---

## Performance Considerations

### MOCK Sender
- **Latency:** < 1ms (synchronous queue add)
- **Memory:** ~500 events max, ~1KB per event = ~500KB max
- **CPU:** Negligible

### HTTP Sender
- **Latency:** 100-500ms (typical HTTP POST, p95)
- **Memory:** ~500 events in fallback on connection loss
- **CPU:** Negligible

### Idempotency Key Generation
- **Latency:** < 1ms (string hash, no crypto)
- **Deterministic:** Same input always produces same key

---

## Debugging Tips

### Enable DEV Logs

```javascript
// Set debug mode
import.meta.env.DEV = true;

// Logs will output to console with prefixes:
// [MockQueueSender] ...
// [HttpSender] ...
```

### Inspect Envelope

```javascript
import { 
  makeEventId, 
  makeOccurredAt, 
  makeIdempotencyKey 
} from "/src/modules/data-engine/contracts/dataEngineContract.js";

const envelope = {
  schemaVersion: "DE-1.0",
  eventId: makeEventId(),
  eventType: "RISK_INDEX_SNAPSHOT",
  occurredAt: makeOccurredAt(),
  tenantId: "LENT-CORP",
  subject: { vehicleId: "VEH-11" },
  payload: { data: "..." },
  idempotencyKey: makeIdempotencyKey({ vehicleId: "VEH-11" }),
};

console.log(JSON.stringify(envelope, null, 2));
```

### Check Mode

```javascript
import { isRealApiEnabled } from "/services/apiClient.js";
console.log("Real API enabled:", isRealApiEnabled());
// → true or false
```

---

## Acceptance Criteria Checklist

- [ ] `testDataEngineSender()` returns QUEUED in MOCK mode
- [ ] `testDataEngineSender()` returns SENT in REAL mode (if backend available)
- [ ] Fallback to QUEUED works when backend offline
- [ ] PII validation rejects VIN/plate/phone/email
- [ ] Idempotency keys are deterministic
- [ ] No errors in build (npm run build)
- [ ] TypeScript strict mode passes
- [ ] No circular imports
- [ ] Sender can be reset for test isolation
- [ ] Queue size capped at 500
- [ ] All DEV logs use [DataEngineSender] prefix

---

## Known Limitations

1. **No Backend Yet**
   - Phase 6.4 provides the contract but backend `/data-engine/events` not implemented
   - Test hook will QUEUE events (fallback) when REAL mode enabled
   - Phase 6.5+ will implement backend

2. **Idempotency via Key (Not ID)**
   - idempotencyKey is deterministic hash of subject + payload
   - Backend should use this for deduplication, not eventId
   - eventId is unique per client creation, may repeat if retried

3. **No Encryption**
   - Envelopes sent as plain JSON
   - HTTPS required for security
   - Trust backend authentication/authorization

---

## Next Steps

- **Phase 6.5:** Backend implementation of `/data-engine/events`
- **Phase 6.6:** Event analytics dashboard
- **Phase 6.7:** Real-time subscriptions (WebSocket)

---

**Test Document Version:** 1.0  
**Last Updated:** 2026-03-03  
**Status:** Ready for QA ✅
