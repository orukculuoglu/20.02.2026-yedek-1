/**
 * Fleet Intake Service Candidate Contract
 * 
 * Defines the contract for service routing candidates during evaluation.
 * 
 * Service candidates are potential routing opportunities identified during
 * evaluation that MAY eventually become actual service routing requests,
 * but remain candidates only at this stage.
 * 
 * Important: This contract represents CANDIDATE status only.
 * - Candidates are NOT converted to actual routing requests here
 * - No Data Engine events are emitted
 * - No external updates are triggered
 * - This is part of the evaluation flow, not the routing flow
 * 
 * Each candidate is:
 * - Status-tracked (candidate, suppressed, promoted, rejected)
 * - Source-justified through enum codes
 * - Priority-classified for potential promotion
 * - Traceable to the evaluation input
 * 
 * Contract-only: contains no runtime candidate logic or promotion logic.
 */

import {
  FleetServiceRoutingSource,
  FleetServiceRoutingReasonCode,
  FleetServiceRoutingPriority,
  FleetServiceTargetType,
} from './fleet-service-routing.contract';

/**
 * FleetIntakeServiceCandidateStatus
 * 
 * Lifecycle status of a service routing candidate.
 */
export enum FleetIntakeServiceCandidateStatus {
  /** Candidate is valid and waiting for promotion decision */
  CANDIDATE = 'candidate',
  
  /** Candidate was suppressed by policy or evaluation logic */
  SUPPRESSED = 'suppressed',
  
  /** Candidate was promoted to actual routing request */
  PROMOTED = 'promoted',
  
  /** Candidate was rejected and will not be promoted */
  REJECTED = 'rejected',
}

/**
 * FleetIntakeServiceRoutingCandidate
 * 
 * A potential service routing opportunity identified during evaluation.
 * 
 * Important safety principles:
 * - This is a CANDIDATE contract only
 * - Candidates do NOT automatically trigger routing requests
 * - Candidates are not converted to FleetServiceRoutingRequest here
 * - No Data Engine event emission at this stage
 * - No external system updates from this contract
 * - No external transformation or sync models
 * 
 * Safety principles:
 * - vehicleId is optional (may not exist yet)
 * - If present, vehicleId is Fleet domain operational identity only
 * - No direct external identity mapping
 * - No unstructured text fields
 * - All information encoded in enum types and reason codes
 * - Timestamps are caller-provided
 */
export interface FleetIntakeServiceRoutingCandidate {
  /** Unique identifier for this candidate */
  candidateId: string;
  
  /** Evaluation input that produced this candidate */
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
  
  /** What triggered this candidate */
  source: FleetServiceRoutingSource;
  
  /** Why the candidate is being proposed */
  reasonCode: FleetServiceRoutingReasonCode;
  
  /** Urgency of potential routing if promoted */
  priority: FleetServiceRoutingPriority;
  
  /** Type of service target if promoted */
  targetServiceType: FleetServiceTargetType;
  
  /** Current status of this candidate */
  status: FleetIntakeServiceCandidateStatus;
  
  /**
   * When this candidate was created.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller at candidate creation time.
   */
  createdAt: string;
}
