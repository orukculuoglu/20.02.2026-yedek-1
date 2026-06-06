/**
 * Fleet Intake Readiness Signal Contract
 * 
 * Defines the contract for readiness signals generated during evaluation.
 * 
 * Readiness signals indicate whether the normalized record represents
 * a vehicle that is ready for rental, requires monitoring, needs approval,
 * or is blocked from Fleet Rental operations.
 * 
 * Each signal is:
 * - Type-classified (ready, monitor, approval-required, etc.)
 * - Reason-justified through enum codes
 * - Optionally linked to a Fleet domain vehicle ID
 * - Used to inform Fleet Rental readiness gate
 * 
 * Contract-only: contains no runtime signal logic.
 */

/**
 * FleetIntakeReadinessSignalType
 * 
 * Classification of vehicle readiness status.
 * Informs Fleet Rental readiness gate decisions.
 */
export enum FleetIntakeReadinessSignalType {
  /** Vehicle is ready for rental operations */
  READY = 'ready',
  
  /** Vehicle is usable but requires ongoing monitoring */
  MONITOR = 'monitor',
  
  /** Vehicle requires operator approval before rental use */
  APPROVAL_REQUIRED = 'approval-required',
  
  /** Vehicle requires maintenance before rental use */
  MAINTENANCE_REQUIRED = 'maintenance-required',
  
  /** Vehicle is blocked from rental operations */
  BLOCKED = 'blocked',
  
  /** Vehicle requires manual review before processing */
  QUARANTINE = 'quarantine',
}

/**
 * FleetIntakeReadinessReasonCode
 * 
 * Justification for the readiness signal type.
 * Explains why the vehicle has the assigned readiness status.
 */
export enum FleetIntakeReadinessReasonCode {
  /** Operational state is clean and complete */
  CLEAN_OPERATIONAL_STATE = 'clean-operational-state',
  
  /** Operational context is incomplete (missing data) */
  INCOMPLETE_OPERATIONAL_CONTEXT = 'incomplete-operational-context',
  
  /** Scheduled maintenance is due */
  MAINTENANCE_DUE = 'maintenance-due',
  
  /** Maintenance is overdue */
  MAINTENANCE_OVERDUE = 'maintenance-overdue',
  
  /** Rental state is blocked (external system) */
  RENTAL_STATE_BLOCKED = 'rental-state-blocked',
  
  /** Service request is open (external system) */
  SERVICE_OPEN = 'service-open',
  
  /** Data quality findings pose risk */
  DATA_QUALITY_RISK = 'data-quality-risk',
  
  /** Record requires manual review */
  MANUAL_REVIEW_REQUIRED = 'manual-review-required',
}

/**
 * FleetIntakeReadinessSignal
 * 
 * A readiness signal generated during evaluation.
 * 
 * Safety principles:
 * - vehicleId is optional because evaluation happens before materialization
 * - If present, vehicleId is Fleet domain operational identity only
 * - No direct external identity mapping
 * - No unstructured text fields
 * - All information encoded in enum types and reason codes
 * - Timestamps are caller-provided
 */
export interface FleetIntakeReadinessSignal {
  /** Unique identifier for this signal */
  signalId: string;
  
  /** Evaluation input that produced this signal */
  evaluationInputId: string;
  
  /** Connector context */
  connectorId: string;
  
  /** Tenant context */
  tenantId: string;
  
  /** Fleet context (optional) */
  fleetId?: string;
  
  /**
   * Fleet domain vehicle ID (optional).
   * 
   * Present only if the evaluation has access to Fleet domain materialization.
   * If present, represents Fleet operational identity only.
   * Does NOT represent external system vehicle identity.
   * Never contains sensitive identifiers or direct mappings to external systems.
   */
  vehicleId?: string;
  
  /** Type of readiness signal */
  signalType: FleetIntakeReadinessSignalType;
  
  /** Reason code justifying this signal */
  reasonCode: FleetIntakeReadinessReasonCode;
  
  /**
   * When this signal was created.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller at signal creation time.
   */
  createdAt: string;
}
