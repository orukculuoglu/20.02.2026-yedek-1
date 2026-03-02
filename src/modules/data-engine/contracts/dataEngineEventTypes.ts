/**
 * Data Engine Event Types & Envelope
 * Standardized event structure for data ingestion across all modules
 * 
 * Design Principles:
 * - PII-safe by design: No VIN, plate, or identity info
 * - Backend-ready: Can be shipped to real backend API
 * - Module-agnostic: Supports events from Bakım Merkezi, Risk Engine, etc.
 * - Type-safe: Full TypeScript support for all event shapes
 * - Observable: Each event has source, timestamp, and metadata
 */

/**
 * Data source that emitted this event
 */
export type DataEngineEventSource =
  | "BAKIM_MERKEZI"      // Repair center / maintenance events
  | "AUTO_EKSPERTIZ"     // AutoExpert / Vehicle intelligence
  | "RISK_ENGINE"        // Risk recommendation engine
  | "DATA_ENGINE";       // Data Engine indices calculation

/**
 * Event type classification
 */
export type DataEngineEventType =
  | "RISK_INDICES_UPDATED"     // Risk metrics computed
  | "RECOMMENDATIONS_GENERATED" // Risk recommendations created
  | "VEHICLE_HISTORY_UPDATED";  // Vehicle timeline modified

/**
 * Typed payload for RISK_INDICES_UPDATED events
 * Contains computed risk indices for a vehicle domain
 */
export interface RiskIndicesUpdatedPayload {
  indices: Array<{
    key: string;                // e.g., "trustIndex", "maintenanceDiscipline"
    value: number;              // 0-100 normalized
    confidence: number;         // 0-100, data quality signal
    updatedAt: string;          // ISO 8601
    meta?: Record<string, any>; // Rich context (sanitized in UI)
  }>;
}

/**
 * Typed payload for RECOMMENDATIONS_GENERATED events
 * Contains risk recommendations + audit trail
 */
export interface RecommendationsGeneratedPayload {
  recommendations: Array<{
    actionType: string;         // e.g., "MAINTENANCE_CHECK", "INSURANCE_REVIEW"
    priorityScore: number;      // 0-100
    recommendation: string;     // User-facing message
    reason: string;             // Why this recommendation
    generatedFrom?: {           // Audit trail (PII-safe)
      source?: string;          // e.g., "EXPERTISE", "FLEET_TELEMETRY"
      eventTime?: string;       // ISO timestamp
      eventId?: string;         // Source event ID
    };
  }>;
}

/**
 * Typed payload for VEHICLE_HISTORY_UPDATED events
 * Summary of vehicle timeline changes
 */
export interface VehicleHistoryUpdatedPayload {
  timelineCount?: number;       // Total events in timeline
  lastUpdateAt?: string;        // ISO timestamp of latest event
}

/**
 * Union type for all payload shapes
 */
export type DataEngineEventPayload =
  | RiskIndicesUpdatedPayload
  | RecommendationsGeneratedPayload
  | VehicleHistoryUpdatedPayload
  | Record<string, any>;        // Fallback for custom payloads

/**
 * Standard envelope for all data engine events
 * PII-safe by design: No vehicle identifiers beyond vehicleId
 */
export interface DataEngineEventEnvelope<TPayload = DataEngineEventPayload> {
  // Identification
  eventId: string;                     // UUID or timestamp-based unique ID
  eventType: DataEngineEventType;
  source: DataEngineEventSource;

  // Context (vehicleId only, no VIN/plate)
  vehicleId: string;                   // Primary vehicle identifier (safe)

  // Timing
  occurredAt: string;                  // ISO 8601 timestamp when event occurred
  ingestedAt?: string;                 // ISO 8601 timestamp when ingested (added by ingestion layer)

  // Schema
  schemaVersion: "1.0";                // Enables future evolution

  // Data
  payload: TPayload;

  // Observability (PII-free)
  tags?: Record<string, string | number | boolean>;

  // Safety declaration
  piiSafe: true;                       // MUST ALWAYS be true in frontend events
}

/**
 * Type guard: Check if event is PII-safe
 */
export function isPiiSafeEvent(
  evt: any
): evt is DataEngineEventEnvelope {
  return (
    evt &&
    typeof evt === "object" &&
    evt.piiSafe === true &&
    "eventId" in evt &&
    "eventType" in evt &&
    "source" in evt &&
    "vehicleId" in evt &&
    "occurredAt" in evt &&
    "schemaVersion" in evt &&
    "payload" in evt
  );
}

/**
 * Generate unique event ID
 * Pattern: ${timestampMs}-${randomString}
 */
export function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Event filter for querying ingested events
 */
export interface DataEngineEventFilter {
  vehicleId?: string;
  eventType?: DataEngineEventType;
  source?: DataEngineEventSource;
  fromTime?: string;        // ISO timestamp
  toTime?: string;          // ISO timestamp
}
