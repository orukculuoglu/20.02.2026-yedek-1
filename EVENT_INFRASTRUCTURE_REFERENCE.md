# Event Emission & Local Event Store Infrastructure - Complete Reference

**Last Updated:** March 7, 2026  
**Scope:** Data Engine event pipeline, local storage, and event queuing  
**Environment:** Frontend (browser) only - localStorage-backed, mock/real API support

---

## 1. Event Emission Patterns

### Primary Emission Function

**File:** [src/modules/data-engine/ingestion/dataEngineEventSender.ts](src/modules/data-engine/ingestion/dataEngineEventSender.ts)

```typescript
export async function sendDataEngineEvent(
  evt: DataEngineEventEnvelope
): Promise<SendEventResult>
```

**Behavior:**
- **MOCK mode** (default): Routes to `ingestDataEngineEvent()` for local ingestion
- **REAL mode** (VITE_USE_REAL_API=true): POST to `/data-engine/events` with fallback to local ingestion
- **Fire-and-forget**: Non-blocking, handles errors gracefully
- **Result:** `{ ok: boolean, mode: "MOCK" | "REAL", fallbackUsed?: boolean, error?: string }`

### Ingestion Entry Point

**File:** [src/modules/data-engine/ingestion/dataEngineIngestion.ts](src/modules/data-engine/ingestion/dataEngineIngestion.ts)

```typescript
export async function ingestDataEngineEvent(evt: DataEngineEventEnvelope): Promise<void>
```

**Process:**
1. Validates `piiSafe === true` (rejects unsafe events)
2. Adds `ingestedAt` timestamp
3. Passes to outbox pattern (`ingestWithOutbox()`)
4. Maintains circular buffer (500 events max)
5. Persists to localStorage (DEV only)

### Domain-Specific Emitters

**Risk Indices:**
```typescript
// File: src/modules/data-engine/api/dataEngineApiClient.ts
async function emitRiskIndicesEvent(
  req: GetDataEngineIndicesRequest,
  indices: DataEngineIndex[]
): Promise<void>
```
- Event Type: `RISK_INDICES_UPDATED`
- Fire-and-forget pattern
- Only for `domain === "risk"`

**Insurance Indices:**
```typescript
// File: services/dataEngineIndices.ts
async function emitInsuranceIndicesEvent(
  vehicleId: string,
  indices: DataEngineIndex[]
): Promise<void>
```
- Event Type: `INSURANCE_INDICES_UPDATED`
- Fire-and-forget pattern
- Calls `sendDataEngineEvent(insuranceEvent)`

**Part Indices:**
```typescript
// File: services/dataEngineIndices.ts
function emitPartIndicesEvent(
  vehicleId: string,
  indices: DataEngineIndex[]
): void
```
- Event Type: `PART_INDICES_UPDATED`
- Non-blocking, error handling optional

**Insurance Domain Snapshot:**
```typescript
// File: src/modules/insurance-domain/insuranceDomainDataEngineIntegration.ts
export async function emitInsuranceDomainSnapshot(
  vehicleId: string,
  aggregate: InsuranceDomainAggregate
): Promise<DataEngineSendResult>
```
- Event Type: `RISK_INDEX_SNAPSHOT`
- Uses Phase 6 sender infrastructure

**Market Valuation Snapshot:**
```typescript
// File: src/modules/market-valuation/marketValuationDataEngineIntegration.ts
export async function emitMarketValuationSnapshot(
  vehicleId: string,
  aggregate: MarketValuationAggregate
): Promise<DataEngineSendResult>
```
- Event Type: `RISK_INDEX_SNAPSHOT`
- Valuation-specific payload

---

## 2. Local Event Store Infrastructure

### A. Storage Adapter Pattern

**File:** [src/modules/data-engine/storage/storageAdapter.ts](src/modules/data-engine/storage/storageAdapter.ts)

**Interface:**
```typescript
interface StorageAdapter {
  append(envelope: DataEngineEventEnvelope): Promise<boolean>;
  getAll(): Promise<DataEngineEventEnvelope[]>;
  getByStream(tenantId: string, vehicleId?: string): Promise<DataEngineEventEnvelope[]>;
  hasIdempotencyKey(key: string): Promise<boolean>;
  getStats(): Promise<StorageStats>;
  clear(): Promise<void>;
}

interface StorageStats {
  count: number;                    // Total events stored
  tenantIds: string[];              // Unique tenant IDs
  lastAppendedAt?: string;          // ISO timestamp of last append
}
```

**DevStorageAdapter (Current Implementation):**
- Uses localStorage: `LENT_DATA_ENGINE_OUTBOX_V1`
- Idempotency tracking: `LENT_DATA_ENGINE_OUTBOX_V1:IDEMPOTENCY`
- Capacity: 500 events (FIFO when exceeded)
- In-memory Set for fast idempotency checks

**Key Methods:**
```typescript
// Append with idempotency check
async append(envelope): Promise<boolean>
  → Returns false if envelope.idempotencyKey already seen
  → Maintains 500-event limit

// Get events by stream (vehicle filtering)
async getByStream(tenantId: string, vehicleId?: string): Promise<DataEngineEventEnvelope[]>
  → Filters by tenantId (required)
  → Filters by vehicleId (optional)
  
// Get storage stats
async getStats(): Promise<StorageStats>
  → count: number of events
  → tenantIds: unique tenant IDs
  → lastAppendedAt: most recent event timestamp
```

### B. Event Outbox Pattern (Idempotency & SaaS)

**File:** [src/modules/data-engine/ingestion/eventOutbox.ts](src/modules/data-engine/ingestion/eventOutbox.ts)

```typescript
export async function ingestWithOutbox(
  envelope: DataEngineEventEnvelope
): Promise<boolean>
```

**Process:**
1. **Enrich** envelope with defaults (tenantId, streamKey, idempotencyKey)
2. **Check idempotency** via `adapter.hasIdempotencyKey()`
3. **Append to storage** via `adapter.append()`
4. **Push to event log** via `pushUnifiedDataEngineEventLog()`
5. **Apply to snapshots** via `applyDataEngineEventToSnapshot()`
6. **Return:** true if new event, false if duplicate

**Envelope Enrichment:**
```typescript
export function enrichEnvelopeWithDefaults<T extends DataEngineEventEnvelope>(
  envelope: T
): T {
  return {
    ...envelope,
    tenantId: envelope.tenantId || 'dev',
    idempotencyKey: envelope.idempotencyKey || envelope.eventId,
    streamKey: envelope.streamKey || `${tenantId}:${vehicleId}`,
  };
}
```

### C. Ingestion Buffer (In-Memory Circular Buffer)

**File:** [src/modules/data-engine/ingestion/dataEngineIngestion.ts](src/modules/data-engine/ingestion/dataEngineIngestion.ts)

```typescript
export async function ingestDataEngineEvent(evt: DataEngineEventEnvelope): Promise<void>
export function getDataEngineEvents(filter?: DataEngineEventFilter): DataEngineEventEnvelope[]
export function clearDataEngineEvents(): void
export function getDataEngineBufferStats(): { totalEvents, bufferLimit, storageKey }
```

**Buffer Properties:**
- Capacity: 500 events
- localStorage key: `LENT_DATA_ENGINE_EVENTS_V1`
- Return order: newest first
- Filtering: vehicleId, eventType, source, time range

**Example Query:**
```typescript
// Get all risk events for vehicle "11" in last hour
const events = getDataEngineEvents({
  vehicleId: '11',
  eventType: 'RISK_INDICES_UPDATED',
  fromTime: new Date(Date.now() - 3600000).toISOString(),
});
```

### D. Local Event Store (DEV-Only Append-Only)

**File:** [src/modules/data-engine/store/localEventStore.ts](src/modules/data-engine/store/localEventStore.ts)

```typescript
export function appendEvent(envelope: DataEngineEventEnvelope<any>): void
export function getStoredEvents(): DataEngineEventEnvelope<any>[]
export function clearStoredEvents(): void
export function replayToSnapshots(options?: { vehicleId?: string }): Map<string, VehicleStateSnapshot>
export function getStoreStats(): { count, lastEventId?, lastOccurredAt? }
```

**Properties:**
- localStorage key: `DE_LOCAL_EVENT_STORE_V1`
- DEV-only: No-op in production
- Capacity: 500 events
- PII-safe: Sanitizes meta, VIN, plate patterns
- Preserves: payload.indices (safe content)

**Storage Format:**
```typescript
interface LocalEventStoreFormat {
  version: '1.0';
  events: [
    {
      storedAt: string;            // ISO 8601 timestamp
      sanitizedEnvelope: DataEngineEventEnvelope;
    },
    ...
  ];
}
```

**Sanitization Removes:**
- Keys: `meta`, `vin`, `plate`, `plaka`, `chassis`, `tckn`, `email`, `phone`, `address`
- VIN patterns: 17-char alphanumeric sequences
- TR plate patterns: Turkish license plate formats

**Replay for Testing:**
```typescript
// Replay all events to rebuild snapshots
const snapshots = replayToSnapshots();
// Map<vehicleId, VehicleStateSnapshot>

// Replay vehicle-specific events
const snapshot = replayToSnapshots({ vehicleId: '11' });
```

---

## 3. Event Data Structures

### Standard Event Envelope

**File:** [src/modules/data-engine/contracts/dataEngineEventTypes.ts](src/modules/data-engine/contracts/dataEngineEventTypes.ts)

```typescript
interface DataEngineEventEnvelope<TPayload = DataEngineEventPayload> {
  // Identification
  eventId: string;                     // Unique UUID/timestamp-based ID
  eventType: DataEngineEventType;      // Event classification
  source: DataEngineEventSource;       // Where event originated

  // Context (PII-safe)
  vehicleId: string;                   // Required, primary identifier (no VIN/plate)

  // SaaS Support
  tenantId?: string;                   // Multi-tenant partition (default: 'dev')
  streamKey?: string;                  // Event stream key (default: `${tenantId}:${vehicleId}`)
  idempotencyKey?: string;             // Deduplication key (default: eventId)

  // Timing
  occurredAt: string;                  // ISO 8601 timestamp when event occurred
  ingestedAt?: string;                 // ISO 8601 timestamp when ingested

  // Schema
  schemaVersion: '1.0';                // For future evolution

  // Data
  payload: TPayload;                   // Type-specific payload

  // Observability
  tags?: Record<string, string | number | boolean>;

  // Safety
  piiSafe: true;                       // MUST be true; enforced by validator
}
```

### Event Types

```typescript
type DataEngineEventType =
  | "RISK_INDICES_UPDATED"             // Risk metrics computed
  | "INSURANCE_INDICES_UPDATED"        // Insurance metrics computed
  | "PART_INDICES_UPDATED"             // Part metrics computed
  | "RECOMMENDATIONS_GENERATED"        // Risk recommendations
  | "VEHICLE_HISTORY_UPDATED"          // Vehicle timeline modified
  | "RISK_INDEX_SNAPSHOT";             // Complete risk snapshot
```

### Event Sources

```typescript
type DataEngineEventSource =
  | "BAKIM_MERKEZI"                    // Repair center/maintenance
  | "AUTO_EKSPERTIZ"                   // Vehicle intelligence
  | "RISK_ENGINE"                      // Risk engine
  | "DATA_ENGINE";                     // Data engine indices
```

### Payload Structures

**Risk Indices:**
```typescript
interface RiskIndicesUpdatedPayload {
  indices: Array<{
    key: string;                       // e.g., "trustIndex", "maintenanceDiscipline"
    value: number;                     // 0-100 normalized
    confidence: number;                // 0-100, data quality signal
    updatedAt: string;                 // ISO 8601
    meta?: Record<string, any>;        // Sanitized context
  }>;
}
```

**Generic Indices:**
```typescript
interface IndicesUpdatedPayload {
  indices: Array<{
    key: string;                       // e.g., "supplyStressIndex"
    value: number;                     // 0-100
    confidence?: number;               // 0-100
    updatedAt?: string;                // ISO 8601
  }>;
}
```

**Recommendations:**
```typescript
interface RecommendationsGeneratedPayload {
  recommendations: Array<{
    actionType: string;                // e.g., "MAINTENANCE_CHECK"
    priorityScore: number;             // 0-100
    recommendation: string;            // User-facing message
    reason: string;                    // Why recommended
    generatedFrom?: {
      source?: string;                 // Event source
      eventTime?: string;              // ISO timestamp
      eventId?: string;                // Source event ID
    };
  }>;
}
```

---

## 4. Vehicle ID Association & Filtering

### How vehicleId is Used

**Required Field:**
```typescript
envelope.vehicleId: string;  // Always required, only safe identifier
```

**Stream Filtering:**
```typescript
// Get events for specific vehicle
const events = await adapter.getByStream('dev', 'vehicle-11');
```

**Stream Key Generation:**
```typescript
// Auto-generated during enrichment
streamKey: `${tenantId}:${vehicleId}`
// Example: "dev:vehicle-11"
```

**Buffer Filtering:**
```typescript
// Query specific vehicle
const vehicleEvents = getDataEngineEvents({
  vehicleId: '11',
  eventType: 'RISK_INDICES_UPDATED',
});
```

**Local Store Filtering:**
```typescript
// No direct filtering in localEventStore
// But can filter results after retrieval
const allEvents = getStoredEvents();
const vehicleEvents = allEvents.filter(e => e.vehicleId === '11');
```

**Replay by Vehicle:**
```typescript
// Rebuild snapshots for specific vehicle
const snapshot = replayToSnapshots({ vehicleId: '11' });
// Returns: Map<'11', VehicleStateSnapshot>
```

### PII Safety

- ✅ **Safe:** vehicleId (internal identifier only)
- ❌ **Never included:** VIN, license plate, chassis number, TCKN
- ❌ **Never included:** Email, phone, address
- ✅ **Preserved:** payload.indices (key/value/confidence only)
- ✅ **Preserved:** eventType, source, timestamps

---

## 5. Event Queue (Retry & Delivery)

### Retry Queue with Exponential Backoff

**File:** [src/modules/data-engine/eventQueue.ts](src/modules/data-engine/eventQueue.ts)

```typescript
export function enqueueEvent(payload: any): void
export async function flushQueue(sendFn: (payload: any) => Promise<void>): Promise<FlushResult>
export function startQueueWorker(sendFn, opts?: { intervalMs? }): { stop() }
export function getQueueStats(): { size, oldestAt?, newestAt?, oldestRetryAt? }
```

**Properties:**
- localStorage key: `DATA_ENGINE_EVENT_QUEUE_V1`
- Capacity: 500 events
- Max retries: 12 (≈68 minutes backoff)
- Backoff formula: `min(60min, 5s * 2^attempts)`
- PII-safe: Sanitizes payload before persistence

**Queue Structure:**
```typescript
interface QueuedEvent {
  id: string;                          // Queue-unique ID
  createdAt: string;                   // ISO timestamp
  attempts: number;                    // Number of send attempts
  nextRetryAt: string;                 // ISO timestamp for next retry
  payload: any;                        // PII-redacted payload
  lastError?: string;                  // Last error message
}
```

**Automatic Worker:**
```typescript
// Start auto-retry worker
const worker = startQueueWorker(sendDataEngineEventPayload, { intervalMs: 15000 });

// Stop worker
worker.stop();
```

---

## 6. Storage Locations

| Storage | Key | Purpose | Capacity | DEV-Only |
|---------|-----|---------|----------|----------|
| localStorage | `LENT_DATA_ENGINE_OUTBOX_V1` | Event outbox (idempotency) | 500 events | No |
| localStorage | `LENT_DATA_ENGINE_OUTBOX_V1:IDEMPOTENCY` | Seen idempotency keys | 500 keys | No |
| localStorage | `LENT_DATA_ENGINE_EVENTS_V1` | Ingestion buffer | 500 events | Yes |
| localStorage | `DE_LOCAL_EVENT_STORE_V1` | Append-only store (testing) | 500 events | Yes |
| localStorage | `DATA_ENGINE_EVENT_QUEUE_V1` | Retry queue | 500 events | No |

---

## 7. Code Examples

### Example 1: Emit Risk Indices Event

```typescript
// File: src/modules/data-engine/api/dataEngineApiClient.ts
import { sendDataEngineEvent } from '../ingestion/dataEngineEventSender';
import { makeEventId, makeOccurredAt } from '../contracts/dataEngineContract';

async function emitRiskIndicesEvent(
  vehicleId: string,
  indices: DataEngineIndex[]
): Promise<void> {
  const event: DataEngineEventEnvelope<RiskIndicesUpdatedPayload> = {
    eventId: makeEventId(),
    eventType: 'RISK_INDICES_UPDATED',
    source: 'DATA_ENGINE',
    vehicleId,
    occurredAt: makeOccurredAt(),
    schemaVersion: '1.0',
    payload: {
      indices: indices.map(idx => ({
        key: idx.key,
        value: idx.value,
        confidence: idx.confidence,
        updatedAt: idx.updatedAt,
        meta: idx.meta,
      })),
    },
    piiSafe: true,
  };

  try {
    await sendDataEngineEvent(event);
  } catch (error) {
    console.warn('[DataEngineApiClient] Failed to send event:', error);
    // Silent failure - event already queued
  }
}
```

### Example 2: Query Events by Vehicle

```typescript
// Browser console or code
import { getDataEngineEvents } from 'src/modules/data-engine/ingestion/dataEngineIngestion';

// Get all events for vehicle 11
const vehicleEvents = getDataEngineEvents({
  vehicleId: '11',
});
console.log(vehicleEvents);

// Get recent risk events for vehicle 11
const recentRisk = getDataEngineEvents({
  vehicleId: '11',
  eventType: 'RISK_INDICES_UPDATED',
  fromTime: new Date(Date.now() - 3600000).toISOString(),
});
```

### Example 3: Replay Events (DEV Testing)

```typescript
// DOM console (exposed at index.tsx)
// Build snapshots from all stored events
const snapshots = window.__deStore.replayToSnapshots();
console.log(snapshots);

// Get specific vehicle snapshot
const vehicle11 = snapshots.get('11');
console.log(vehicle11.risk.indices);

// Check store stats
const stats = window.__deStore.getStoreStats();
console.log(`${stats.count} events stored`);

// Check queue stats
const queueStats = window.__deStoreQueue?.getStats?.();
console.log(queueStats);
```

### Example 4: Get Storage Statistics

```typescript
import { getOutboxAdapter } from 'src/modules/data-engine/ingestion/eventOutbox';

const adapter = getOutboxAdapter();
const stats = await adapter.getStats();
console.log({
  count: stats.count,
  tenants: stats.tenantIds,
  lastAppended: stats.lastAppendedAt,
});
```

### Example 5: Get Events by Stream (Vehicle)

```typescript
import { getOutboxAdapter } from 'src/modules/data-engine/ingestion/eventOutbox';

const adapter = getOutboxAdapter();
const vehicleEvents = await adapter.getByStream('dev', 'vehicle-11');
console.log(vehicleEvents);
```

---

## 8. Debugging & Console API

### DevTool API (Exposed at index.tsx)

```typescript
window.__deStore = {
  appendEvent(envelope),          // Add event to store
  getStoredEvents(),              // Get all stored events
  getStoreStats(),                // Get store statistics
  clearStoredEvents(),            // Clear all events (DEV)
  replayToSnapshots(options),     // Replay events to snapshots
  getFirstStoredEvent(),          // Get first stored event
  getLastStoredEvent(),           // Get last stored event
};

window.__deStoreRaw(),            // Get raw localStorage JSON
window.__deStoreStats(),          // Get quick stats
window.__deStoreReplayAll(),      // Replay all events (dispatches custom event)
window.__deStoreReplayVehicle(vehicleId);  // Replay vehicle events
window.__deStoreEventTypes(),     // Get event type breakdown
```

### Queue API (if exposed)

```typescript
window.__deStoreQueue = {
  getQueueStats(),
  getQueuedEvents(),
  flushQueue(),
  startQueueWorker(),
};
```

---

## 9. Flow Diagram

```
User Action / Domain Module
        ↓
emitRiskIndicesEvent() / emitInsuranceIndicesEvent() / etc.
        ↓
sendDataEngineEvent()
        ├─→ MOCK Mode: YES
        │   └─→ ingestDataEngineEvent() [local]
        │       ├─→ Validate piiSafe
        │       ├─→ ingestWithOutbox()
        │       │   ├─→ enrichEnvelopeWithDefaults()
        │       │   ├─→ Check idempotency (StorageAdapter)
        │       │   ├─→ Append to storage (StorageAdapter)
        │       │   ├─→ pushUnifiedDataEngineEventLog()
        │       │   └─→ applyDataEngineEventToSnapshot()
        │       ├─→ Keep in circular buffer (500 max)
        │       └─→ Persist to localStorage
        │
        └─→ REAL Mode: TRY
            ├─→ POST /data-engine/events (with auth)
            ├─→ Success: Return ok=true
            └─→ Failure:
                ├─→ enqueueEvent() [retry queue]
                └─→ ingestDataEngineEvent() [fallback]

Storage Layers:
├─ StorageAdapter (outbox, idempotency)
│  └─ localStorage: LENT_DATA_ENGINE_OUTBOX_V1
├─ Ingestion Buffer
│  └─ localStorage: LENT_DATA_ENGINE_EVENTS_V1
├─ Local Event Store (DEV)
│  └─ localStorage: DE_LOCAL_EVENT_STORE_V1
└─ Event Queue (retry)
   └─ localStorage: DATA_ENGINE_EVENT_QUEUE_V1
```

---

## 10. Integration Points

### Where Events Are Currently Generated

| Module | Path | Event Type | vehicleId Source |
|--------|------|------------|--------------------|
| Data Engine API | [src/modules/data-engine/api/dataEngineApiClient.ts](src/modules/data-engine/api/dataEngineApiClient.ts) | `RISK_INDICES_UPDATED` | Request param |
| Data Engine Indices | [services/dataEngineIndices.ts](services/dataEngineIndices.ts) | `INSURANCE_INDICES_UPDATED`, `PART_INDICES_UPDATED` | Function param |
| Insurance Domain | [src/modules/insurance-domain/insuranceDomainDataEngineIntegration.ts](src/modules/insurance-domain/insuranceDomainDataEngineIntegration.ts) | `RISK_INDEX_SNAPSHOT` | Function param |
| Market Valuation | [src/modules/market-valuation/marketValuationDataEngineIntegration.ts](src/modules/market-valuation/marketValuationDataEngineIntegration.ts) | `RISK_INDEX_SNAPSHOT` | Function param |

### Where Events Are Consumed

| Consumer | Path | Purpose |
|----------|------|---------|
| Vehicle State | [src/modules/vehicle-state/vehicleStateReducer.ts](src/modules/vehicle-state/vehicleStateReducer.ts) | Apply to snapshots |
| Event Logger | [src/modules/data-engine/eventLogger.ts](src/modules/data-engine/eventLogger.ts) | Unified event log |
| UI Views | [views/DataEngine.tsx](views/DataEngine.tsx) | Display event stats |
| Local Store | [src/modules/data-engine/store/localEventStore.ts](src/modules/data-engine/store/localEventStore.ts) | DEV testing/replay |

---

## Summary

This document covers the complete event infrastructure for the Data Engine system:

1. **Emission**: Multiple emitters (risk, insurance, part, snapshots) → `sendDataEngineEvent()`
2. **Ingestion**: Single ingestion path via `ingestDataEngineEvent()` + outbox pattern
3. **Storage**: Multi-layer (outbox, buffer, local store, queue) with vehicleId-based filtering support
4. **Replay**: Deterministic event replay for testing and snapshot rebuilding
5. **Delivery**: Mock mode (local) or REAL mode (API with fallback + queue retry)
6. **Safety**: PII-safe by design, idempotency guaranteed, tenant-aware

All events carry **vehicleId** as required field, enabling filtering and stream-based queries at every layer.
