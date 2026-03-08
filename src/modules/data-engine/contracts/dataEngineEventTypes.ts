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
  | "RISK_INDICES_UPDATED"           // Risk metrics computed
  | "INSURANCE_INDICES_UPDATED"      // Insurance metrics computed
  | "PART_INDICES_UPDATED"           // Part metrics computed
  | "RECOMMENDATIONS_GENERATED"      // Risk recommendations created
  | "VEHICLE_HISTORY_UPDATED"        // Vehicle timeline modified
  | "VEHICLE_INTELLIGENCE_AGGREGATED"; // Vehicle intelligence summary aggregated

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
 * Phase 9.1: VEHICLE_INTELLIGENCE_AGGREGATED event payload
 * Lightweight intelligence summary after aggregate calculation
 * Stored in snapshot for UI consumption
 * PII-safe: No raw data, only computed scores and counts
 */
export interface VehicleIntelligenceAggregatedPayload {
  // Composite score and level
  compositeScore: number;              // 0-100, unified intelligence score
  compositeLevel: string;              // "low-risk", "medium-risk", "high-risk"
  
  // Domain-specific indices
  trustIndex: number;                  // 0-100, data trustworthiness
  reliabilityIndex: number;            // 0-100, mechanical reliability
  maintenanceDiscipline: number;       // 0-100, service history quality
  
  // Risk components from aggregate
  structuralRisk: number;              // 0-100, damage/wear risk
  mechanicalRisk: number;              // 0-100, OBD/fault code risk
  insuranceRisk: number;               // 0-100, claims/correlation risk
  serviceGapScore: number;             // 0-100, maintenance gaps
  
  // Data quality metrics
  dataSourceCount: number;             // Number of data sources used
  confidence: number;                  // 0-100, analysis confidence
  
  // Timing
  analysisTimestamp: string;           // ISO 8601, when analysis was performed
  aggregatedAt?: string;               // ISO 8601, when event was created
}

/**
 * Generic indices payload (PII-safe)
 * Used for PART_INDICES_UPDATED and similar domain events
 * Contains ONLY key, value, confidence, updatedAt (no meta)
 */
export interface IndicesUpdatedPayload {
  indices: Array<{
    key: string;                // e.g., "supplyStressIndex", "priceVolatility"
    value: number;              // 0-100 normalized
    confidence?: number;         // 0-100, data quality signal
    updatedAt?: string;          // ISO 8601
  }>;
}

/**
 * Union type for all payload shapes
 */
export type DataEngineEventPayload =
  | RiskIndicesUpdatedPayload
  | IndicesUpdatedPayload
  | RecommendationsGeneratedPayload
  | VehicleHistoryUpdatedPayload
  | VehicleIntelligenceAggregatedPayload
  | Record<string, any>;        // Fallback for custom payloads

/**
 * Standard envelope for all data engine events
 * PII-safe by design: No vehicle identifiers beyond vehicleId
 * SaaS-ready: Multi-tenant, idempotency, event sourcing support
 */
export interface DataEngineEventEnvelope<TPayload = DataEngineEventPayload> {
  // Identification
  eventId: string;                     // UUID or timestamp-based unique ID
  eventType: DataEngineEventType;
  source: DataEngineEventSource;

  // Context (vehicleId only, no VIN/plate)
  vehicleId: string;                   // Primary vehicle identifier (safe)

  // SaaS & Event Sourcing (new)
  tenantId?: string;                   // Multi-tenant partition (default: "dev")
  streamKey?: string;                  // Event stream key (default: `${tenantId}:${vehicleId}`)
  idempotencyKey?: string;             // Deduplication key (default: eventId)

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
 * Enrich envelope with SaaS defaults if not already set
 * Ensures tenantId, idempotencyKey, and streamKey are populated
 */
export function enrichEnvelopeWithDefaults<T extends DataEngineEventEnvelope>(
  envelope: T
): T {
  const tenantId = envelope.tenantId || 'dev';
  return {
    ...envelope,
    tenantId,
    idempotencyKey: envelope.idempotencyKey || envelope.eventId,
    streamKey: envelope.streamKey || `${tenantId}:${envelope.vehicleId}`,
  };
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
