/**
 * Fleet Intake Evaluator Runtime Input
 * 
 * Defines the runtime input structure for the evaluator.
 * 
 * All IDs and timestamps are caller-provided for determinism.
 * The evaluator must not generate IDs or timestamps internally.
 */

import {
  FleetIntakeEvaluationInput,
  FleetIntakeEvaluationPolicy,
} from '../contracts';

/**
 * FleetIntakeEvaluatorRuntimeInput
 * 
 * Complete runtime input for the evaluator.
 * 
 * Determinism principles:
 * - All IDs are caller-provided
 * - All timestamps are caller-provided (ISO 8601 strings)
 * - Generated findings/signals/candidates use pre-allocated IDs
 * - If an ID is needed but not available, that item is not generated
 * - Evaluator returns a valid result with whatever was successfully generated
 */
export interface FleetIntakeEvaluatorRuntimeInput {
  /**
   * The evaluation input containing the normalized record to evaluate.
   */
  evaluationInput: FleetIntakeEvaluationInput;
  
  /**
   * Optional evaluation policy to guide decision-making.
   * 
   * If provided, policy rules control which findings are generated,
   * when candidates are created, and overall acceptance logic.
   * 
   * If not provided, defaults to permissive evaluation.
   */
  policy?: FleetIntakeEvaluationPolicy;
  
  /**
   * Pre-allocated unique ID for the evaluation result.
   * 
   * Provided by caller to maintain determinism.
   * Used as-is in returned FleetIntakeEvaluationResult.
   */
  evaluationResultId: string;
  
  /**
   * When this evaluation was created.
   * 
   * Format: ISO 8601 string (e.g., "2026-06-06T10:30:00Z")
   * Provided by caller.
   */
  createdAt: string;
  
  /**
   * Pre-allocated unique IDs for data quality findings.
   * 
   * Array is consumed in order as findings are generated.
   * If array has fewer IDs than potential findings, some findings
   * are not generated (deterministic choice: skip finding).
   * 
   * This ensures output is fully deterministic - all IDs are
   * caller-provided and consumed in order.
   */
  generatedFindingIds: string[];
  
  /**
   * Pre-allocated unique IDs for readiness signals.
   * 
   * Array is consumed in order as signals are generated.
   * Typically only one main signal is generated per evaluation,
   * so this array usually has length 1.
   * 
   * If array is empty when a signal is needed, the evaluator
   * returns with rejected status and no signals (safe fallback).
   */
  generatedSignalIds: string[];
  
  /**
   * Pre-allocated unique IDs for service routing candidates.
   * 
   * Array is consumed in order as candidates are generated.
   * If array has fewer IDs than potential candidates, some candidates
   * are not generated (deterministic choice: skip candidate).
   * 
   * This ensures all output is deterministic and caller-controlled.
   */
  generatedCandidateIds: string[];
}
