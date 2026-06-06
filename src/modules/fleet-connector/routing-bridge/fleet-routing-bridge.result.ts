/**
 * Fleet Routing Bridge Result
 * 
 * Defines the result structure from routing bridge transformation.
 * 
 * The bridge either successfully promotes a candidate to a routing request,
 * or rejects it with a specific enumerated reason.
 */

import { FleetServiceRoutingRequest } from '../contracts';

/**
 * FleetRoutingBridgeStatus
 * 
 * Outcome status of the bridge transformation.
 */
export enum FleetRoutingBridgeStatus {
  /** Candidate was successfully promoted to routing request */
  PROMOTED = 'promoted',
  
  /** Candidate was suppressed (not eligible for promotion) */
  SUPPRESSED = 'suppressed',
  
  /** Candidate was rejected due to validation failure */
  REJECTED = 'rejected',
}

/**
 * FleetRoutingBridgeRejectReason
 * 
 * Enumerated reasons for rejection.
 * No free-text messages - all reasons are standardized.
 */
export enum FleetRoutingBridgeRejectReason {
  /** Candidate status is not "candidate" (already promoted/rejected/suppressed) */
  CANDIDATE_NOT_PROMOTABLE = 'candidate-not-promotable',
  
  /** Candidate is missing fleetId or fleetId is empty */
  MISSING_FLEET_ID = 'missing-fleet-id',
  
  /** Candidate is missing vehicleId or vehicleId is empty */
  MISSING_VEHICLE_ID = 'missing-vehicle-id',
  
  /** Bridge input is missing routingId or routingId is empty */
  MISSING_ROUTING_ID = 'missing-routing-id',
  
  /** Bridge input is missing createdAt or createdAt is empty */
  MISSING_CREATED_AT = 'missing-created-at',
}

/**
 * FleetRoutingBridgeResult
 * 
 * Complete result from routing bridge transformation.
 * 
 * If status is "promoted", request will be present.
 * If status is "rejected", rejectReason will be present.
 * If status is "suppressed", neither request nor reason is present.
 * 
 * Safety principles:
 * - No free-text message fields
 * - No raw data fields
 * - All information encoded in enum statuses and reasons
 */
export interface FleetRoutingBridgeResult {
  /** Outcome of the bridge transformation */
  status: FleetRoutingBridgeStatus;
  
  /**
   * Promoted routing request (if status is "promoted").
   * 
   * This is the internal routing request ready for workflow processing.
   * Will be undefined if status is not "promoted".
   */
  request?: FleetServiceRoutingRequest;
  
  /**
   * Rejection reason (if status is "rejected").
   * 
   * Standardized enum code explaining why promotion failed.
   * Will be undefined if status is not "rejected".
   */
  rejectReason?: FleetRoutingBridgeRejectReason;
}
