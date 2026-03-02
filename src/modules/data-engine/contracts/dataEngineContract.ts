/**
 * Data Engine Backend Contract
 * Standardized envelope format for all Data Engine events
 * 
 * Features:
 * - Schema versioning for evolution (DE-1.0)
 * - Idempotency keys for safe retries
 * - Tenant isolation
 * - PII-safe subject + payload
 * - Lightweight ID generation (no crypto)
 */

/**
 * Event type enumeration
 * Extensible for future event kinds
 */
export type DataEngineEventType =
  | "RISK_RECOMMENDATION"
  | "RISK_INDEX_SNAPSHOT"
  | "WORKORDER_HISTORY_VIEW"
  | "SEARCH_INTENT"
  | "ORDER_EXECUTION";

/**
 * PII-safe subject (identifier only)
 * Contains only safe identifiers, no personal data
 */
export interface DataEngineSubject {
  vehicleId?: string;           // Safe: Vehicle ID
  workOrderId?: string;         // Safe: Work order ID
}

/**
 * Event envelope - contains all necessary metadata for backend
 * 
 * Design:
 * - schemaVersion: Enables evolution (DE-1.0)
 * - idempotencyKey: Safe retry (backend deduplication)
 * - tenantId: Multi-tenant support
 * - subject: PII-safe identifiers
 * - payload: Event-specific data (should be PII-redacted before creating envelope)
 */
export interface DataEngineEventEnvelope<TPayload = unknown> {
  schemaVersion: "DE-1.0";              // Locked version
  eventId: string;                      // Unique event ID
  eventType: DataEngineEventType;       // Event type
  occurredAt: string;                   // ISO 8601 timestamp (client time)
  tenantId: string;                     // Tenant for isolation
  subject: DataEngineSubject;           // PII-safe subject
  payload: TPayload;                    // Event-specific data (pre-sanitized)
  idempotencyKey: string;               // Hash of subject + payload for dedup
  meta?: {                              // Optional metadata
    source?: string;                    // Source system
    env?: string;                       // Environment (dev/prod)
    appVersion?: string;                // App version
  };
}

/**
 * Send result from data engine sender
 * 
 * Statuses:
 * - SENT: Successfully sent to backend
 * - QUEUED: Added to local queue for retry
 * - FAILED: Permanent failure (rare, logged)
 */
export interface DataEngineSendResult {
  status: "SENT" | "QUEUED" | "FAILED";
  eventId: string;
  queuedCount?: number;                 // Number of events in queue (if QUEUED)
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Generate a unique event ID
 * Format: ${timestamp}-${random}
 */
export function makeEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Generate current timestamp in ISO 8601 format
 */
export function makeOccurredAt(): string {
  return new Date().toISOString();
}

/**
 * Generate idempotency key from input
 * Safe for deduplication on backend
 * 
 * Algorithm:
 * 1. Stringify input
 * 2. Sum character codes (lightweight hash)
 * 3. Return short stable string
 */
export function makeIdempotencyKey(input: unknown): string {
  const stringified = JSON.stringify(input);
  
  // Lightweight string hash (sum of char codes)
  let hash = 0;
  for (let i = 0; i < stringified.length; i++) {
    const char = stringified.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & 0xffffffff; // Keep it 32-bit
  }
  
  // Convert to hex string
  const hexHash = Math.abs(hash).toString(16);
  
  // Return short, deterministic string
  return `key-${hexHash}`;
}
