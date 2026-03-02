# Phase 6.3: Event Queue + Retry — Acceptance Tests

## Overview
Phase 6.3 implements a resilient client-side event delivery pipeline with local persistence and automatic retry. This document describes the acceptance tests to verify the implementation.

---

## Test 1: Enable REAL API with Invalid BaseURL → Trigger Event → Verify QUEUED Status

### Setup
1. Open DataEngine view in DEV mode
2. Modify `VITE_API_BASE_URL` environment variable to point to invalid/unreachable endpoint:
   - Example: `VITE_API_BASE_URL=http://localhost:9999` (non-existent port)
   - **Ensure** `VITE_USE_REAL_API=true` is set
3. Reload the app

### Test Steps
1. Trigger an event (e.g., search for vehicle or generate recommendations)
2. Observe the Event Stream section shows the event immediately
3. Check browser console for `[DataEngineEventSender]` logs

### Expected Results
- ✅ Event appears in "Event Stream (Ingestion)" table immediately
- ✅ Console shows: `[DataEngineEventSender] REAL mode - POST failed, enqueueing for retry`
- ✅ `[DataEngineEventQueue] Event queued` log shows event ID with sanitized payload
- ✅ Queue diagnostics badge now shows `1 event(s) pending retry`
- ✅ "Flush Now" button becomes enabled (not grayed out)
- ✅ No UI errors or frozen states

---

## Test 2: Verify localStorage Persistence with Redacted Fields

### Setup
From Test 1, queue should have at least 1 pending event

### Test Steps
1. Open browser DevTools → Application → Local Storage
2. Find key: `DATA_ENGINE_EVENT_QUEUE_V1`
3. Examine the stored JSON array
4. Look for event payload fields

### Expected Results
- ✅ Key `DATA_ENGINE_EVENT_QUEUE_V1` exists in localStorage
- ✅ Value is valid JSON array with events
- ✅ Each event has structure:
  ```json
  {
    "id": "q-1698765432-abc1xyz",
    "createdAt": "2026-03-03T14:30:00.000Z",
    "attempts": 0,
    "nextRetryAt": "2026-03-03T14:30:00.000Z",
    "payload": { /* PII-redacted */ }
  }
  ```
- ✅ Payload contains **NO** VIN, plate, phone, email, or identity fields
- ✅ If VIN/plate/phone were in original event, they show as `***REDACTED***`
- ✅ Safe fields (vehicleId, eventType, source) are present and readable

**Example:**
```json
{
  "payload": {
    "eventId": "evt-20260303-xyz",
    "eventType": "RECOMMENDATIONS_GENERATED",
    "source": "RISK_ENGINE",
    "vehicleId": "VEH-12345",      // Safe: ID only
    "vin": "***REDACTED***",        // Redacted: VIN pattern detected
    "plate": "***REDACTED***",      // Redacted: Plate pattern detected
    "occurredAt": "2026-03-03T14:30:00Z"  // Safe: timestamp
  }
}
```

---

## Test 3: Fix BaseURL / Flush Queue → Verify Sent Count & Queue Drains

### Setup
From Test 2, queue has persisted events

### Test Steps
1. Fix `VITE_API_BASE_URL` to point to a real backend (or switch to MOCK mode):
   - Switch: `VITE_USE_REAL_API=false` (MOCK mode easier to test)
   - Reload the app
2. Queue worker should auto-attempt retry every 15 seconds
   - Alternatively, manually click "Flush Now" button in DEV badge
3. Observe the queue diagnostics badge

### Expected Results
- ✅ Queue size counter decreases
- ✅ Console shows: `[DataEngineEventQueue] Event sent successfully` for each event
- ✅ Console shows: `[DataEngineEventQueue] Flush complete: { sent: N, failed: 0, remaining: 0 }`
- ✅ Queue diagnostics badge now shows `0 event(s) pending retry` or `No events queued (✓ clean)`
- ✅ "Flush Now" button becomes disabled (grayed out)
- ✅ localStorage `DATA_ENGINE_EVENT_QUEUE_V1` is empty array `[]`

---

## Test 4: Verify Exponential Backoff Increases nextRetryAt After Failures

### Setup
1. Enable REAL API mode with invalid BaseURL (Test 1 setup)
2. Have at least 1 queued event

### Test Steps
1. In browser DevTools, open the stored queue event: `DATA_ENGINE_EVENT_QUEUE_V1`
2. Note the `nextRetryAt` timestamp (e.g., `2026-03-03T14:30:00Z`)
3. Wait 2-3 seconds
4. Force a flush attempt:
   - Click "Flush Now" button in DataEngine view
   - Or call `flushQueue()` in console
5. Check localStorage again: `DATA_ENGINE_EVENT_QUEUE_V1`
6. Compare `nextRetryAt` values

### Expected Results
- ✅ After first failure:
  - `attempts: 0` → `attempts: 1`
  - `nextRetryAt` moved forward by ~10 seconds (5s * 2^1 = 10s)
- ✅ After second failure:
  - `attempts: 1` → `attempts: 2`
  - `nextRetryAt` moved forward by ~20 seconds (5s * 2^2 = 20s)
- ✅ After third failure:
  - `attempts: 2` → `attempts: 3`
  - `nextRetryAt` moved forward by ~40 seconds (5s * 2^3 = 40s)
- ✅ Backoff continues doubling until capped at 60 minutes
- ✅ Event has `lastError` field with human-readable error message (no PII)

**Example progression:**
```json
// Attempt 0
{ "attempts": 0, "nextRetryAt": "2026-03-03T14:30:00Z" }

// After 1st failure (10s delay)
{ "attempts": 1, "nextRetryAt": "2026-03-03T14:30:10Z", "lastError": "Network error..." }

// After 2nd failure (20s more)
{ "attempts": 2, "nextRetryAt": "2026-03-03T14:30:30Z", "lastError": "Network error..." }

// After 3rd failure (40s more)
{ "attempts": 3, "nextRetryAt": "2026-03-03T14:31:10Z", "lastError": "Network error..." }
```

---

## Test 5: Verify Queue Cap at 500 Events (Oldest Dropped)

### Setup
1. Enable REAL API mode with invalid BaseURL
2. Have console open for logs

### Test Steps
1. Programmatically enqueue 510 events:
   ```javascript
   import { enqueueEvent } from './src/modules/data-engine/eventQueue';
   for (let i = 0; i < 510; i++) {
     enqueueEvent({ eventId: `test-${i}`, vehicleId: 'VEH-TEST', type: 'test' });
   }
   ```
2. Check localStorage `DATA_ENGINE_EVENT_QUEUE_V1`
3. Check console for warning logs

### Expected Results
- ✅ Queue size remains at maximum 500 events
- ✅ Console shows warning: `[DataEngineEventQueue] Queue exceeded 500 events, dropped 10 oldest`
- ✅ Oldest 10 events are removed from queue
- ✅ Newest 500 events remain in localStorage
- ✅ Queue diagnostics badge shows `500 event(s) pending retry`

---

## Test 6: Queue Persistence Across Page Reload

### Setup
1. Have at least 5 events in the queue
2. Note the queue size in DEV badge

### Test Steps
1. Fully reload the page (Ctrl+R or Cmd+R)
2. Wait for app to initialize
3. Check Event Queue diagnostics badge

### Expected Results
- ✅ Queue size shows the same number of events as before reload
- ✅ All queued events are restored from localStorage
- ✅ Queue worker starts and begins auto-retry
- ✅ Console shows: `[DataEngineEventQueue] Loaded 5 queued events from storage`

---

## Test 7: No PII in Queue Storage (Comprehensive Scan)

### Setup
1. Create an event with all possible PII fields:
   ```javascript
   enqueueEvent({
     vin: "1HGCM82633A004352",
     plate: "34 ABC 1234",
     tckn: "12345678901",
     phone: "+905551234567",
     email: "test@example.com",
     address: "Istanbul, Turkey",
     license: "DL12345",
     registration: "REG12345",
     chassis: "1HGCM82633A004352",
     vehicleId: "VEH-12345",  // Safe to keep
     eventType: "TEST"        // Safe to keep
   });
   ```
2. Check localStorage `DATA_ENGINE_EVENT_QUEUE_V1`

### Expected Results
- ✅ All PII fields show `***REDACTED***`
- ✅ Safe fields (`vehicleId`, `eventType`, etc.) remain untouched
- ✅ No actual VIN, plate, phone, email, TCKN, address in storage
- ✅ Recursive redaction works (nested PII also redacted)

---

## Test 8: App Startup Auto-Flush

### Setup
1. Ensure at least 10 events in queue (invalid API setup)
2. Note the queue size before reload

### Test Steps
1. Switch to MOCK mode: `VITE_USE_REAL_API=false`
2. Reload the page
3. Wait 2 seconds for app to initialize
4. Check queue diagnostics badge

### Expected Results
- ✅ On app startup, queue is immediately flushed (auto-flush on boot)
- ✅ All 10 events are sent successfully (MOCK mode ingests them locally)
- ✅ Queue size returns to 0
- ✅ Console shows: `[DataEngineEventQueue] Worker sent events: { sent: 10, failed: 0, remaining: 0 }`

---

## Test 9: MaxRetries Enforcement (Events Dropped After 12 Failures)

### Setup
1. Enable REAL API with invalid BaseURL
2. Have at least 1 event in queue

### Test Steps
1. Manually trigger flush 13 times via "Flush Now" button (or programmatically)
2. After each flush, check the event's `attempts` count
3. Watch console for drop warning

### Expected Results
- ✅ After 12 failures: `attempts: 12`, event still in queue
- ✅ On 13th failure:
  - `attempts: 13`, event should be REMOVED from queue
  - Console shows: `[DataEngineEventQueue] Event exceeded max retries (12), removing: {eventId,...}`
- ✅ Queue size decreases by 1
- ✅ Event is gone from localStorage

---

## Performance / Load Tests

### Test 10: Queue Worker Does Not Block UI

### Setup
1. Have 50+ events in queue
2. Enable REAL API with invalid API

### Test Steps
1. Click "Flush Now" button
2. While flush is in progress, try to interact with UI (scroll, click, type)
3. Monitor for UI lag

### Expected Results
- ✅ UI remains responsive (no freezing)
- ✅ Flush happens in background
- ✅ No console errors
- ✅ UI updates reflect final queue state after flush completes

---

## Rollback / Compatibility Test

### Test 11: Phase 6.1 + 6.2 Still Work (No Breaking Changes)

### Setup
1. Disable Event Queue (uninstall Phase 6.3) — set `VITE_USE_REAL_API=false`
2. Run app

### Test Steps
1. Generate an event
2. Verify it appears in Event Stream (Phase 6.1)
3. Check sender mode shows "MOCK (Local)" (Phase 6.2)

### Expected Results
- ✅ Phase 6.1 event ingestion works unchanged
- ✅ Phase 6.2 MOCK mode works unchanged
- ✅ No errors in console
- ✅ No breaking changes to existing views

---

## Checklist for QA Sign-Off

- [ ] Test 1: Queuing works, event appears in stream
- [ ] Test 2: localStorage has redacted payload
- [ ] Test 3: Flush drains queue successfully
- [ ] Test 4: Exponential backoff increases delays correctly
- [ ] Test 5: Queue capped at 500, oldest dropped
- [ ] Test 6: Queue persists across page reload
- [ ] Test 7: All PII redacted (comprehensive scan)
- [ ] Test 8: App startup auto-flushes queued events
- [ ] Test 9: Events removed after 12 retries
- [ ] Test 10: UI not blocked during queue flush
- [ ] Test 11: Phase 6.1 + 6.2 still work (no breaking changes)

---

## Known Limitations / Future Enhancements

1. **No Backend Persistence Yet**
   - Phase 6.3 is purely client-side
   - Backend `/data-engine/events` endpoint needed for real persistence (Phase 6.4)
   - Current implementation keeps events in localStorage, limited to ~5MB browser limit

2. **Manual Flush Only (Timer-Based Retry)**
   - Queue worker auto-retries every 15 seconds (configurable)
   - No real-time event delivery (no WebSocket)
   - Manual "Flush Now" button for immediate retry (DEV only)

3. **No Event Deduplication**
   - If same event is queued twice, both remain in queue
   - Future: Add eventId-based deduplication

4. **No Priority Queue**
   - All events treated equally
   - Future: Support priority levels (critical → retry sooner)

---

**Phase 6.3 Status:** Ready for QA ✅  
**Last Updated:** 2026-03-03  
**Owner:** Data Engine Team
