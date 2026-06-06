/**
 * Fleet Routing Orchestrator Runtime Input
 * 
 * Defines the runtime input structure for the routing orchestrator.
 * 
 * The orchestrator converts Fleet Connector intake evaluation results
 * into internal Fleet Service Routing Requests by orchestrating the
 * routing bridge across all service routing candidates.
 */

import { FleetIntakeEvaluationResult } from '../contracts';

/**
 * FleetRoutingOrchestratorRuntimeInput
 * 
 * Complete runtime input for the routing orchestrator.
 * 
 * Determinism principles:
 * - All routing IDs are caller-provided
 * - All timestamps are caller-provided (ISO 8601 strings)
 * - No internal generation of IDs or timestamps
 * - Orchestrator is pure transformation only
 * - One routing ID per candidate
 */
export interface FleetRoutingOrchestratorRuntimeInput {
  /**
   * The complete evaluation result from fleet connector intake evaluator.
   * 
   * Contains serviceRoutingCandidates array that will be promoted to requests.
   * Orchestrator will not mutate this object.
   * 
   * May have empty serviceRoutingCandidates array.
   */
  evaluationResult: FleetIntakeEvaluationResult;
  
  /**
   * Pre-allocated unique IDs for routing requests.
   * 
   * One ID per candidate in evaluationResult.serviceRoutingCandidates.
   * IDs are matched by array index: routingIds[i] for candidates[i]
   * 
   * Provided by caller to maintain determinism.
   * Used as-is in promoted FleetServiceRoutingRequest objects.
   * 
   * Must have length >= number of candidates.
   * Each ID must be non-empty string.
   */
  routingIds: string[];
  
  /**
   * When these routing requests were created.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller.
   * Used for all promoted routing requests.
   * 
   * Must be non-empty string.
   */
  createdAt: string;
}
