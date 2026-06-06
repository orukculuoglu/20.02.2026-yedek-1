/**
 * Fleet Connector Evaluation Pipeline
 * 
 * Pure deterministic pipeline that composes the intake evaluator and
 * routing orchestrator to transform normalized vehicles into service
 * routing requests.
 * 
 * This pipeline:
 * - Takes normalized vehicle evaluation input
 * - Runs through fleet connector intake evaluator
 * - Orchestrates routing for all service routing candidates
 * - Returns evaluation result and routing result together
 * - Never generates IDs or timestamps
 * - Never mutates inputs
 * - Never calls external systems
 * - Never emits events
 * - Never dispatches service actions
 * - Never persists anything
 * - Remains fully deterministic and reproducible
 */

import {
  evaluateFleetConnectorIntake,
  FleetIntakeEvaluatorRuntimeInput,
} from '../evaluation';

import {
  orchestrateFleetConnectorRouting,
  FleetRoutingOrchestratorRuntimeInput,
} from '../routing-orchestration';

import { FleetConnectorEvaluationPipelineRuntimeInput } from './fleet-connector-evaluation-pipeline.input';
import {
  FleetConnectorEvaluationPipelineStatus,
  FleetConnectorEvaluationPipelineResult,
} from './fleet-connector-evaluation-pipeline.result';

/**
 * runFleetConnectorEvaluationPipeline
 * 
 * Pure deterministic pipeline for normalized vehicle evaluation and routing.
 * 
 * Takes evaluation input and orchestrates the complete pipeline:
 * 1. Evaluates the normalized vehicle through intake evaluator
 * 2. Orchestrates routing for all service routing candidates
 * 3. Returns combined evaluation and routing results
 * 
 * Determinism guarantees:
 * - evaluationResultId is caller-provided, used as-is
 * - createdAt is caller-provided, used as-is
 * - All generated IDs are caller-provided, consumed in order
 * - No internal ID generation
 * - No internal timestamp generation
 * - No network calls
 * - No mutation of inputs
 * - No event emission
 * - No service dispatch
 * - No persistence
 * - Fully reproducible given same input
 * 
 * @param input - Pipeline runtime input with evaluation input, all IDs, and timestamp
 * @returns Pipeline result with evaluation result, routing result, and status
 */
export function runFleetConnectorEvaluationPipeline(
  input: FleetConnectorEvaluationPipelineRuntimeInput
): FleetConnectorEvaluationPipelineResult {
  const {
    evaluationInput,
    policy,
    evaluationResultId,
    createdAt,
    generatedFindingIds,
    generatedSignalIds,
    generatedCandidateIds,
    routingIds,
  } = input;

  // ============================================
  // PHASE 1: EVALUATION
  // ============================================

  // Build evaluator runtime input with all caller-provided IDs
  const evaluatorInput: FleetIntakeEvaluatorRuntimeInput = {
    evaluationInput,
    policy,
    evaluationResultId,
    createdAt,
    generatedFindingIds,
    generatedSignalIds,
    generatedCandidateIds,
  };

  // Call evaluator to produce evaluation result
  const evaluationResult = evaluateFleetConnectorIntake(evaluatorInput);

  // ============================================
  // PHASE 2: ROUTING ORCHESTRATION
  // ============================================

  // Build orchestrator runtime input with evaluation result and routing IDs
  const orchestratorInput: FleetRoutingOrchestratorRuntimeInput = {
    evaluationResult,
    routingIds,
    createdAt,
  };

  // Call orchestrator to produce routing result
  const routingResult = orchestrateFleetConnectorRouting(orchestratorInput);

  // ============================================
  // PHASE 3: PIPELINE STATUS CALCULATION
  // ============================================

  // Determine pipeline status based on evaluation and routing results
  let pipelineStatus: FleetConnectorEvaluationPipelineStatus;

  // Check if evaluation was unsuccessful
  if (
    evaluationResult.status === 'rejected' ||
    evaluationResult.status === 'quarantined'
  ) {
    // Evaluation failed - pipeline failed
    pipelineStatus = FleetConnectorEvaluationPipelineStatus.FAILED;
  } else if (routingResult.status === 'no-candidates') {
    // Evaluation succeeded but no candidates to route - pipeline completed without routing
    pipelineStatus = FleetConnectorEvaluationPipelineStatus.EVALUATED_WITHOUT_ROUTING;
  } else if (
    routingResult.status === 'completed-with-rejections' ||
    routingResult.status === 'failed'
  ) {
    // Routing had rejections - pipeline completed with routing rejections
    pipelineStatus = FleetConnectorEvaluationPipelineStatus.COMPLETED_WITH_ROUTING_REJECTIONS;
  } else if (routingResult.status === 'completed') {
    // All successful - pipeline completed
    pipelineStatus = FleetConnectorEvaluationPipelineStatus.COMPLETED;
  } else {
    // Fallback (should not reach here)
    pipelineStatus = FleetConnectorEvaluationPipelineStatus.COMPLETED;
  }

  // ============================================
  // RESULT RETURN
  // ============================================

  return {
    status: pipelineStatus,
    evaluationResult,
    routingResult,
  };
}
