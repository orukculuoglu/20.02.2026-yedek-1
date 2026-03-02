# Data Engine Events API Contract

## Endpoint: POST /data-engine/events

### Purpose
Receive and persist standardized events from Data Engine module for analytics, auditing, and operational intelligence.

---

## Request

### HTTP Method
```
POST /data-engine/events
```

### Headers
```
Content-Type: application/json
x-tenant-id: <tenant-id>           # Required: Tenant identifier
x-role: <user-role>                # Required: User role (ops, admin, viewer, etc.)
Authorization: Bearer <token>      # Optional: Auth token if enabled
```

### Request Body
```typescript
DataEngineEventEnvelope<TPayload> {
  eventId: string;                            // Unique event identifier
  eventType: "RISK_INDICES_UPDATED" 
           | "RECOMMENDATIONS_GENERATED" 
           | "VEHICLE_HISTORY_UPDATED";      // Event type
  source: "BAKIM_MERKEZI" 
        | "AUTO_EKSPERTIZ" 
        | "RISK_ENGINE" 
        | "DATA_ENGINE";                     // Source system
  vehicleId: string;                          // Vehicle ID (required, allow "UNKNOWN")
  occurredAt: string;                         // ISO 8601 timestamp
  schemaVersion: "1.0";                       // Schema version for evolution
  payload: TPayload;                          // Type-specific payload (see below)
  tags?: Record<string, string | number | boolean>;  // Optional metadata
  piiSafe: true;                              // MUST be true (enforced)
}
```

### Payload Types

#### 1. RISK_INDICES_UPDATED
```typescript
{
  indices: {
    key: string;                    // Index key (e.g., "collision_risk")
    value: number;                  // Index value (0.0-1.0 range)
    confidence: number;             // Confidence score (0.0-1.0)
    updatedAt: string;              // ISO 8601 timestamp
    meta?: Record<string, any>;     // Optional metadata
  }[]
}
```

#### 2. RECOMMENDATIONS_GENERATED
```typescript
{
  recommendations: {
    actionType: string;             // Action type (e.g., "SCHEDULE_INSPECTION")
    priorityScore: number;          // Priority (0.0-1.0)
    recommendation: string;         // Recommendation text
    reason: StructuredReasonCode;   // Structured reason code
    generatedFrom: {                // Audit trail
      source: string;
      eventTime: string;
      context?: Record<string, any>;
    }
  }[]
}
```

#### 3. VEHICLE_HISTORY_UPDATED
```typescript
{
  timelineCount?: number;           // Total events in timeline
  lastUpdateAt?: string;            // Last update timestamp
}
```

---

## Response

### Success (200 OK)
```json
{
  "ok": true,
  "eventId": "evt-20260303-abc123"
}
```

### Error (4xx/5xx)
```json
{
  "ok": false,
  "error": "Invalid payload: piiSafe must be true"
}
```

---

## Validation Rules

### Client-Side (Frontend)
- ✅ `piiSafe` must always be `true`
- ✅ `vehicleId` required (allow "UNKNOWN" for special cases)
- ✅ `payload` required and must match event type
- ✅ `eventType` must be a known enum value
- ✅ `source` must be a known enum value
- ✅ No VIN, plate number, or identity data in payload

### Server-Side (Backend - REQUIRED)
- ✅ Re-validate `piiSafe === true`, reject if false
- ✅ Validate `eventId` is unique (prevent duplicates)
- ✅ Validate `vehicleId` is valid UUID or "UNKNOWN"
- ✅ Validate `occurredAt` is valid ISO 8601 timestamp
- ✅ Validate `schemaVersion === "1.0"` (fail on unknown versions)
- ✅ Scan payload for suspicious keys (VIN patterns, email, phone)
- ✅ Reject events with PII fields (case-insensitive keyword scan)
- ✅ Enforce tenant isolation: Check `x-tenant-id` header
- ✅ Log all rejections with reason (for audit)

---

## Security Notes

### PII Protection
- **Frontend Guarantee:** All events marked `piiSafe: true` contain NO VIN, plate, email, phone, or identity data
- **Payload Fields:** Only safe identifiers (vehicleId, timestamps, metrics, structured codes)
- **Backend Audit:** Must re-validate no suspicious keys in payload JSON

### Tenant Isolation
- All events tagged with `x-tenant-id` header
- Backend must associate event to tenant and prevent cross-tenant leakage
- Query filters must include tenant partition key

### Audit Trail
- `generatedFrom` field preserves source system + timestamp
- Server should store event with:
  - Original `occurredAt` (client time)
  - Server-side `ingestedAt` timestamp
  - `x-tenant-id` from header
  - Request metadata (user role, source IP)

---

## Example Flow

### 1. Frontend - MOCK Mode (Default)
```typescript
// VITE_USE_REAL_API = false
const envelope = {
  eventId: "evt-20260303-xyz",
  eventType: "RECOMMENDATIONS_GENERATED",
  source: "RISK_ENGINE",
  vehicleId: "VEH-12345",
  occurredAt: "2026-03-03T14:30:00Z",
  schemaVersion: "1.0",
  payload: { recommendations: [...] },
  piiSafe: true,
};

// sendDataEngineEvent() → ingestDataEngineEvent() locally
// Event appears in Event Stream immediately
// No HTTP call made
```

### 2. Frontend - REAL Mode (Backend Enabled)
```typescript
// VITE_USE_API_ENABLED = true
const envelope = { /* same as above */ };

// sendDataEngineEvent() → POST /data-engine/events
// Backend response: { ok: true, eventId: "evt-20260303-xyz" }
// Event persisted to database
// Frontend Event Stream also shows it (local fallback)
```

### 3. Frontend - REAL Mode (Fallback)
```typescript
// VITE_USE_API_ENABLED = true, but backend offline
const envelope = { /* same as above */ };

// sendDataEngineEvent() → POST /data-engine/events
// Network error or timeout
// Graceful fallback: ingestDataEngineEvent() locally
// FallbackUsed = true logged (DEV only)
// Event appears in Event Stream (local ingestion)
// No UI impact
```

---

## Performance Expectations

| Scenario | Latency | Guarantee |
|----------|---------|-----------|
| MOCK mode (local) | < 5ms | Synchronous, no network |
| REAL mode (success) | < 500ms (p95) | HTTP POST + DB write |
| REAL mode (fallback) | < 10ms | Local ingestion after timeout |
| Event Stream display | Real-time | < 100ms after emit |

---

## Backwards Compatibility

- **Schema Version:** `1.0` (supports evolution via schemaVersion field)
- **Breaking Changes:** Only allowed in new schema version (2.0+)
- **Current Constraints:**
  - All new fields optional (use `?` in TypeScript)
  - Existing fields immutable
  - Payload structure fixed per eventType

---

## Future Enhancements (Out of Current Scope)

- Event filtering API: GET /data-engine/events?vehicleId=...&eventType=...
- Event archival: Configurable retention policies
- Real-time subscriptions: WebSocket /data-engine/events/stream
- Event analytics: POST /data-engine/analytics with aggregations
- Cross-tenant access control: Fine-grained role-based filtering

---

## Testing Checklist

### Unit Tests
- [ ] Validate envelope structure (missing fields, wrong types)
- [ ] Validate piiSafe enforcement (must reject piiSafe: false)
- [ ] Validate eventType enum (reject unknown types)
- [ ] Validate payload shape per eventType

### Integration Tests
- [ ] POST /data-engine/events succeeds with valid envelope
- [ ] Response includes correct eventId
- [ ] Backend re-validates piiSafe === true
- [ ] Backend detects PII patterns (VIN, email, phone)
- [ ] Tenant isolation enforced (event marked with tenant)
- [ ] Fallback path works (frontend local ingestion)

### Smoke Tests (Production)
- [ ] Event appears in analytics 30s after POST
- [ ] Event Stream displays 50 most recent events
- [ ] MOCK mode works (no backend required)
- [ ] REAL mode with fallback works (backend optional)

---

**Schema Version:** 1.0  
**Last Updated:** 2026-03-03  
**Owner:** Data Engine Team
