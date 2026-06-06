/**
 * Fleet Service Routing Contract
 * 
 * Defines the contract for routing fleet maintenance/service requests.
 * 
 * Service routing decisions are triggered by:
 * - Readiness gate evaluations
 * - Maintenance signals
 * - Risk signals
 * - Connector intake (external system status changes)
 * - Manual review
 * 
 * Note:
 * - No Data Engine event emission in this step
 * - No unstructured text fields
 * - Outcome routing is data-driven by reason and priority
 */

/**
 * FleetServiceRoutingSource
 * 
 * What triggered the service routing decision.
 */
export enum FleetServiceRoutingSource {
  /** Readiness gate evaluation (vehicle fitness for rental) */
  READINESS_GATE = 'readiness-gate',
  
  /** Maintenance signal (scheduled maintenance due) */
  MAINTENANCE_SIGNAL = 'maintenance-signal',
  
  /** Service status (external system status change) */
  SERVICE_STATUS = 'service-status',
  
  /** Risk signal (risk score above threshold) */
  RISK_SIGNAL = 'risk-signal',
  
  /** Manual review/request from operator */
  MANUAL_REVIEW = 'manual-review',
  
  /** Fleet connector intake (external fleet system event) */
  CONNECTOR_INTAKE = 'connector-intake',
}

/**
 * FleetServiceRoutingReasonCode
 * 
 * Why the vehicle needs service routing.
 * Drives target service selection and priority.
 */
export enum FleetServiceRoutingReasonCode {
  /** Maintenance service is due */
  MAINTENANCE_DUE = 'maintenance-due',
  
  /** Maintenance service is overdue */
  MAINTENANCE_OVERDUE = 'maintenance-overdue',
  
  /** Vehicle has operational/safety risk */
  OPERATIONAL_RISK = 'operational-risk',
  
  /** Vehicle is blocked from rental (external system) */
  RENTAL_BLOCKED = 'rental-blocked',
  
  /** External service request is open */
  SERVICE_STATUS_OPEN = 'service-status-open',
  
  /** Incident/issue reported */
  INCIDENT_REVIEW = 'incident-review',
  
  /** Data quality or integration issue requires review */
  DATA_QUALITY_REVIEW = 'data-quality-review',
}

/**
 * FleetServiceRoutingPriority
 * 
 * Urgency of service routing.
 * Determines SLA and escalation.
 */
export enum FleetServiceRoutingPriority {
  /** Low priority (can wait) */
  LOW = 'low',
  
  /** Normal priority (standard SLA) */
  NORMAL = 'normal',
  
  /** High priority (escalated) */
  HIGH = 'high',
  
  /** Critical priority (immediate action required) */
  CRITICAL = 'critical',
}

/**
 * FleetServiceRoutingStatus
 * 
 * Lifecycle status of a routing request.
 */
export enum FleetServiceRoutingStatus {
  /** Routing request created */
  CREATED = 'created',
  
  /** Routing request sent to target service */
  SENT = 'sent',
  
  /** Target service accepted the routing */
  ACCEPTED = 'accepted',
  
  /** Target service rejected the routing */
  REJECTED = 'rejected',
  
  /** Service action completed */
  COMPLETED = 'completed',
  
  /** Routing cancelled */
  CANCELLED = 'cancelled',
}

/**
 * FleetServiceTargetType
 * 
 * Category of service provider that handles the routing.
 */
export enum FleetServiceTargetType {
  /** Authorized OEM/brand service center */
  AUTHORIZED_SERVICE = 'authorized-service',
  
  /** Independent service/repair shop */
  INDEPENDENT_SERVICE = 'independent-service',
  
  /** Tire service specialist */
  TIRE_SERVICE = 'tire-service',
  
  /** Body repair/painting shop */
  BODY_REPAIR = 'body-repair',
  
  /** Inspection center */
  INSPECTION_CENTER = 'inspection-center',
  
  /** Internal review queue (no external routing) */
  INTERNAL_REVIEW = 'internal-review',
}

/**
 * FleetServiceRoutingRequest
 * 
 * A service routing request for a fleet vehicle.
 * 
 * This contract represents a decision to route a vehicle to service,
 * triggered by various signals or manual action.
 * 
 * Security:
 * - No unstructured text fields
 * - vehicleId is Fleet domain operational identity only
 * - No Data Engine event emission in this step
 * 
 * Timestamps:
 * - Caller-provided (ISO 8601 format expected)
 * - Timestamps supplied externally, not generated
 */
export interface FleetServiceRoutingRequest {
  /** Unique identifier for this routing request */
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
  
  /**
   * ID of the connector that triggered this routing (optional).
   * Only set if source is CONNECTOR_INTAKE.
   */
  connectorId?: string;
  
  /** What triggered this routing request */
  source: FleetServiceRoutingSource;
  
  /** Why the vehicle needs service (service reason code) */
  reasonCode: FleetServiceRoutingReasonCode;
  
  /** Priority/urgency of the request */
  priority: FleetServiceRoutingPriority;
  
  /** Type of service provider to route to */
  targetServiceType: FleetServiceTargetType;
  
  /** Current status of the routing request */
  status: FleetServiceRoutingStatus;
  
  /**
   * ISO 8601 timestamp when routing request was created.
   * Caller-provided.
   */
  createdAt: string;
}
