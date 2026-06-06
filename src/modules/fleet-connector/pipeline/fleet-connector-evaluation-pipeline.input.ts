/**
 * Fleet Connector Evaluation Pipeline Runtime Input
 * 
 * Defines the runtime input structure for the evaluation pipeline.
 * 
 * The pipeline composes the intake evaluator and routing orchestrator
 * to transform normalized vehicles into routing requests.
 */

import {
  FleetIntakeEvaluationInput,
  FleetIntakeEvaluationPolicy,
} from '../contracts';

/**
 * FleetConnectorEvaluationPipelineRuntimeInput
 * 
 * Complete runtime input for the evaluation pipeline.
 * 
 * Determinism principles:
 * - All IDs are caller-provided
 * - All timestamps are caller-provided (ISO 8601 strings)
 * - No internal generation of IDs or timestamps
 * - Pipeline is pure composition only
 * - One ID per generated entity (finding, signal, candidate, routing request)
 */
export interface FleetConnectorEvaluationPipelineRuntimeInput {
  /**
   * The evaluation input from fleet connector intake.
   * 
   * Provides normalized vehicle context for evaluation.
   * Pipeline will not mutate this object.
   */
  evaluationInput: FleetIntakeEvaluationInput;
  
  /**
   * Optional evaluation policy override.
   * 
   * If not provided, evaluator uses default policy.
   * Pipeline will not mutate this object.
   */
  policy?: FleetIntakeEvaluationPolicy;
  
  /**
   * Pre-allocated unique ID for the evaluation result.
   * 
   * Provided by caller to maintain determinism.
   * Used as-is in returned FleetIntakeEvaluationResult.
   * 
   * Must be non-empty string.
   */
  evaluationResultId: string;
  
  /**
   * When this pipeline execution was created.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller.
   * Used for both evaluation and routing results.
   * 
   * Must be non-empty string.
   */
  createdAt: string;
  
  /**
   * Pre-allocated unique IDs for generated findings.
   * 
   * One ID per potential data quality finding.
   * IDs are consumed by evaluator in order during evaluation phase.
   * 
   * Must have sufficient IDs for maximum possible findings.
   * Each ID must be non-empty string.
   */
  generatedFindingIds: string[];
  
  /**
   * Pre-allocated unique IDs for generated readiness signals.
   * 
   * One ID per readiness signal generated.
   * IDs are consumed by evaluator in order during readiness phase.
   * 
   * Must have sufficient IDs for maximum possible signals.
   * Each ID must be non-empty string.
   */
  generatedSignalIds: string[];
  
  /**
   * Pre-allocated unique IDs for generated service routing candidates.
   * 
   * One ID per candidate generated.
   * IDs are consumed by evaluator in order during candidate generation phase.
   * 
   * Must have sufficient IDs for maximum possible candidates.
   * Each ID must be non-empty string.
   */
  generatedCandidateIds: string[];
  
  /**
   * Pre-allocated unique IDs for routing requests.
   * 
   * One ID per service routing candidate that may be promoted.
   * IDs are consumed by orchestrator in order during promotion phase.
   * 
   * Must have sufficient IDs for maximum possible routing requests.
   * Each ID must be non-empty string.
   */
  routingIds: string[];
}
