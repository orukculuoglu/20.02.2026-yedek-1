/**
 * Fleet Routing Orchestrator
 * 
 * Pure deterministic orchestrator that converts Fleet Connector intake
 * evaluation results into internal Fleet Service Routing Requests by
 * orchestrating the routing bridge across all service routing candidates.
 * 
 * This orchestrator:
 * - Takes a complete evaluation result with service routing candidates
 * - Uses routing bridge to promote each candidate
 * - Collects promoted requests and bridge results
 * - Calculates outcome status based on promotions/rejections
 * - Never generates IDs or timestamps
 * - Never mutates inputs
 * - Never calls external systems
 * - Never emits events
 * - Never dispatches service actions
 * - Never persists anything
 * - Remains fully deterministic and reproducible
 */

import { promoteFleetIntakeCandidateToRoutingRequest } from '../routing-bridge';

import { FleetRoutingOrchestratorRuntimeInput } from './fleet-routing-orchestrator.input';
import {
  FleetRoutingOrchestratorStatus,
  FleetRoutingOrchestratorResult,
} from './fleet-routing-orchestrator.result';

/**
 * orchestrateFleetConnectorRouting
 * 
 * Pure deterministic orchestrator for candidate batch promotion.
 * 
 * Takes a complete evaluation result with service routing candidates and
 * orchestrates the routing bridge to promote each candidate into an internal
 * routing request. Collects all promoted requests and bridge results for
 * complete observability.
 * 
 * Determinism guarantees:
 * - routingIds are caller-provided, used in order as-is
 * - createdAt is caller-provided, used as-is for all promotions
 * - No internal ID generation
 * - No internal timestamp generation
 * - No network calls
 * - No mutation of evaluation result or candidates
 * - No event emission
 * - No service dispatch
 * - No persistence
 * - Fully reproducible given same input
 * 
 * @param input - Orchestrator runtime input with evaluation result, routing IDs, and timestamp
 * @returns Orchestrator result with promoted requests, bridge results, and status
 */
export function orchestrateFleetConnectorRouting(
  input: FleetRoutingOrchestratorRuntimeInput
): FleetRoutingOrchestratorResult {
  const { evaluationResult, routingIds, createdAt } = input;

  // ============================================
  // NO CANDIDATES CHECK
  // ============================================

  // If evaluation result has no service routing candidates, return immediately
  if (!evaluationResult.serviceRoutingCandidates || evaluationResult.serviceRoutingCandidates.length === 0) {
    return {
      status: FleetRoutingOrchestratorStatus.NO_CANDIDATES,
      requests: [],
      bridgeResults: [],
    };
  }

  // ============================================
  // CANDIDATE PROMOTION PHASE
  // ============================================

  const requests: any[] = [];
  const bridgeResults: any[] = [];

  // Iterate through each candidate in order
  for (let i = 0; i < evaluationResult.serviceRoutingCandidates.length; i++) {
    const candidate = evaluationResult.serviceRoutingCandidates[i];
    const routingId = routingIds[i];

    // Call routing bridge to promote this candidate
    const bridgeResult = promoteFleetIntakeCandidateToRoutingRequest({
      candidate,
      routingId,
      createdAt,
    });

    // Add bridge result to complete results array
    bridgeResults.push(bridgeResult);

    // If promotion succeeded, add request to requests array
    if (bridgeResult.request) {
      requests.push(bridgeResult.request);
    }
  }

  // ============================================
  // STATUS CALCULATION
  // ============================================

  // Count promoted and rejected outcomes
  const promotedCount = requests.length;
  const rejectedCount = bridgeResults.filter(
    (result) => result.status === 'rejected'
  ).length;

  // Determine status based on counts
  let status: FleetRoutingOrchestratorStatus;

  if (promotedCount === 0 && rejectedCount === 0) {
    // All candidates were suppressed
    status = FleetRoutingOrchestratorStatus.COMPLETED;
  } else if (promotedCount > 0 && rejectedCount === 0) {
    // All promoted, no rejections
    status = FleetRoutingOrchestratorStatus.COMPLETED;
  } else if (promotedCount > 0 && rejectedCount > 0) {
    // Some promoted, some rejected
    status = FleetRoutingOrchestratorStatus.COMPLETED_WITH_REJECTIONS;
  } else if (promotedCount === 0 && rejectedCount > 0) {
    // No promotions, at least one rejection
    status = FleetRoutingOrchestratorStatus.FAILED;
  } else {
    // Fallback (should not reach here)
    status = FleetRoutingOrchestratorStatus.COMPLETED;
  }

  // ============================================
  // RESULT RETURN
  // ============================================

  return {
    status,
    requests,
    bridgeResults,
  };
}
