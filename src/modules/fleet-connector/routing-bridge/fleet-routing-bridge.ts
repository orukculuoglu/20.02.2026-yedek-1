/**
 * Fleet Routing Bridge
 * 
 * Pure deterministic bridge that converts Fleet Connector intake service
 * routing candidates into internal Fleet Service Routing Requests.
 * 
 * This bridge:
 * - Takes a service routing candidate from the evaluator
 * - Validates that it's eligible for promotion
 * - Creates an internal routing request if valid
 * - Returns structured result with promotion or rejection outcome
 * - Never generates IDs or timestamps
 * - Never mutates inputs
 * - Never calls external systems
 * - Never emits events
 * - Remains fully deterministic
 */

import {
  FleetServiceRoutingRequest,
  FleetServiceRoutingStatus,
  FleetIntakeServiceCandidateStatus,
} from '../contracts';

import { FleetRoutingBridgeRuntimeInput } from './fleet-routing-bridge.input';
import {
  FleetRoutingBridgeStatus,
  FleetRoutingBridgeRejectReason,
  FleetRoutingBridgeResult,
} from './fleet-routing-bridge.result';

/**
 * promoteFleetIntakeCandidateToRoutingRequest
 * 
 * Pure deterministic bridge for candidate promotion.
 * 
 * Takes a service routing candidate from the intake evaluator and converts it
 * to an internal fleet service routing request if it passes validation.
 * 
 * Determinism guarantees:
 * - routingId is caller-provided, used as-is
 * - createdAt is caller-provided, used as-is
 * - No internal ID generation
 * - No internal timestamp generation
 * - No network calls
 * - No mutation of inputs
 * - No event emission
 * - Fully reproducible given same input
 * 
 * @param input - Bridge runtime input with candidate and caller-provided IDs/timestamps
 * @returns Bridge result with promotion or rejection outcome
 */
export function promoteFleetIntakeCandidateToRoutingRequest(
  input: FleetRoutingBridgeRuntimeInput
): FleetRoutingBridgeResult {
  const { candidate, routingId, createdAt } = input;

  // ============================================
  // VALIDATION PHASE
  // ============================================

  // Rule 1: Candidate must have status "candidate"
  if (candidate.status !== FleetIntakeServiceCandidateStatus.CANDIDATE) {
    return {
      status: FleetRoutingBridgeStatus.REJECTED,
      rejectReason: FleetRoutingBridgeRejectReason.CANDIDATE_NOT_PROMOTABLE,
    };
  }

  // Rule 2: Candidate must have fleetId
  if (!candidate.fleetId || candidate.fleetId.trim() === '') {
    return {
      status: FleetRoutingBridgeStatus.REJECTED,
      rejectReason: FleetRoutingBridgeRejectReason.MISSING_FLEET_ID,
    };
  }

  // Rule 3: Candidate must have vehicleId
  if (!candidate.vehicleId || candidate.vehicleId.trim() === '') {
    return {
      status: FleetRoutingBridgeStatus.REJECTED,
      rejectReason: FleetRoutingBridgeRejectReason.MISSING_VEHICLE_ID,
    };
  }

  // Rule 4: routingId must be provided and non-empty
  if (!routingId || routingId.trim() === '') {
    return {
      status: FleetRoutingBridgeStatus.REJECTED,
      rejectReason: FleetRoutingBridgeRejectReason.MISSING_ROUTING_ID,
    };
  }

  // Rule 5: createdAt must be provided and non-empty
  if (!createdAt || createdAt.trim() === '') {
    return {
      status: FleetRoutingBridgeStatus.REJECTED,
      rejectReason: FleetRoutingBridgeRejectReason.MISSING_CREATED_AT,
    };
  }

  // ============================================
  // PROMOTION PHASE
  // ============================================

  // All validations passed - promote candidate to routing request
  const request: FleetServiceRoutingRequest = {
    routingId,
    fleetId: candidate.fleetId,
    vehicleId: candidate.vehicleId,
    connectorId: candidate.connectorId,
    source: candidate.source,
    reasonCode: candidate.reasonCode,
    priority: candidate.priority,
    targetServiceType: candidate.targetServiceType,
    status: FleetServiceRoutingStatus.CREATED,
    createdAt,
  };

  return {
    status: FleetRoutingBridgeStatus.PROMOTED,
    request,
  };
}
