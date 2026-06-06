/**
 * Fleet Service Outcome Contract
 * 
 * Defines the contract for service routing outcomes.
 * 
 * Represents the completion and result of a service routing request.
 * Outcomes remain internal to our system.
 * 
 * Scope:
 * - Internal outcomes only
 * - No unstructured text fields
 * - Decision and outcome tracking only
 */

/**
 * FleetServiceOutcomeStatus
 * 
 * Overall outcome of the service request.
 */
export enum FleetServiceOutcomeStatus {
  /** Service action completed */
  COMPLETED = 'completed',
  
  /** Service action failed */
  FAILED = 'failed',
  
  /** Service action cancelled */
  CANCELLED = 'cancelled',
  
  /** Service action requires follow-up */
  REQUIRES_FOLLOW_UP = 'requires-follow-up',
}

/**
 * FleetServiceOutcomeResultCode
 * 
 * Specific result of the service action.
 * Drives next action determination.
 */
export enum FleetServiceOutcomeResultCode {
  /** Service work completed successfully */
  SERVICE_COMPLETED = 'service-completed',
  
  /** No action was necessary */
  NO_ACTION_NEEDED = 'no-action-needed',
  
  /** Parts are needed (on order or backordered) */
  PARTS_REQUIRED = 'parts-required',
  
  /** Vehicle must remain blocked/out of service */
  VEHICLE_BLOCKED = 'vehicle-blocked',
  
  /** Reinspection required */
  REINSPECTION_REQUIRED = 'reinspection-required',
  
  /** Insufficient data to make a decision */
  DATA_INSUFFICIENT = 'data-insufficient',
}

/**
 * FleetServiceOutcomeNextAction
 * 
 * What happens next with the vehicle.
 * Determines the vehicle's operational state.
 */
export enum FleetServiceOutcomeNextAction {
  /** Release vehicle for rental (operational readiness restored) */
  RELEASE_FOR_RENTAL = 'release-for-rental',
  
  /** Keep vehicle blocked (not for rental) */
  KEEP_BLOCKED = 'keep-blocked',
  
  /** Request approval before proceeding */
  REQUEST_APPROVAL = 'request-approval',
  
  /** Route to another service (escalation) */
  ROUTE_TO_SERVICE = 'route-to-service',
  
  /** Continue monitoring (no immediate action) */
  MONITOR = 'monitor',
  
  /** Archive/close routing (no further action) */
  ARCHIVE = 'archive',
}

/**
 * FleetServiceRoutingOutcome
 * 
 * Outcome of a service routing request.
 * 
 * This contract represents the completion and result of a routing decision.
 * Outcomes remain internal; no external system updates are performed.
 * 
 * Security:
 * - No unstructured text fields
 * - No external update fields
 * - Result remains internal to our system
 * 
 * Timestamps:
 * - Caller-provided (ISO 8601 format expected)
 * - Timestamps supplied externally, not generated
 */
export interface FleetServiceRoutingOutcome {
  /** Unique identifier for this outcome */
  outcomeId: string;
  
  /** ID of the routing request this outcome resolves */
  routingId: string;
  
  /** Fleet ID within our system */
  fleetId: string;
  
  /**
   * Vehicle ID (Fleet domain operational identity).
   * F-prefixed ID format (e.g., "F-FLEET001-V-abc123")
   * 
   * This is the safe domain-scoped identifier, not a cross-domain mapping.
   */
  vehicleId: string;
  
  /** Overall outcome status */
  outcomeStatus: FleetServiceOutcomeStatus;
  
  /** Specific result code */
  resultCode: FleetServiceOutcomeResultCode;
  
  /** What happens next with the vehicle */
  nextAction: FleetServiceOutcomeNextAction;
  
  /**
   * ISO 8601 timestamp when outcome was determined/completed.
   * Caller-provided.
   */
  completedAt: string;
}
