/**
 * Optimization Runtime Orchestrator Contract
 * Defines the deterministic optimization runtime orchestration boundary.
 * Composes feasibility evaluation and deterministic selection into single explicit runtime flow.
 * No scoring, no ranking, no recommendation - structural orchestration only.
 * All identifiers caller-provided only - no runtime generation.
 */

import type { OptimizationInput } from "./optimization-input.contract";
import type { OptimizationResult } from "./optimization-result.contract";

/**
 * OptimizationRuntimeOrchestrationInput
 * Explicit structural input for optimization orchestration.
 * Composes optimization problem definition, control parameters, and result identifier.
 * All inputs caller-provided; no defaults, no inference, no generation, no hidden semantics.
 * All intermediate action IDs are reused from source identifiers (no generation).
 */
export interface OptimizationRuntimeOrchestrationInput {
  /** Explicit optimization problem definition (objective, constraints, tie-break, candidates) */
  readonly optimization: OptimizationInput;

  /** Selection control: maximum number of actions to select from feasible pool */
  readonly selectionLimit: number;

  /** Unique result identifier for OptimizationResult (caller-provided, reused from orchestration output) */
  readonly resultId: string;
}

/**
 * OptimizationRuntimeOrchestrator
 * Defines the deterministic optimization runtime orchestration boundary.
 * Composes Phase 1 (feasibility evaluation) and Phase 2 (selection strategy) into complete runtime.
 * Same input always produces same output (deterministic).
 * No ID generation - all identifiers reused from caller-provided sources.
 */
export interface OptimizationRuntimeOrchestrator {
  /**
   * Deterministic orchestration function.
   * Transforms OptimizationRuntimeOrchestrationInput into OptimizationResult.
   * Explicit flow: evaluate feasibility → construct feasible actions (reuse source IDs) →
   *               select from feasible → construct selected actions (reuse feasible IDs) →
   *               construct result with caller-provided resultId.
   * @param input - Explicit orchestration input with optimization, limit, and result ID
   * @returns Explicit optimization result with selected actions and rejected candidates
   */
  readonly orchestrate: (
    input: OptimizationRuntimeOrchestrationInput,
  ) => OptimizationResult;
}

/**
 * Optimization runtime orchestrator behavior:
 * - Deterministic boundary: same input always produces same output
 * - Explicit composition: feasibility evaluation + selection strategy in sequence
 * - Orchestration flow: OptimizationInput → (Phase 1) → FeasibleActions → (Phase 2) → OptimizationResult
 * - Traceability maintained: candidate → feasible/rejected → selected
 * - ID reuse (no generation): resultId from input, feasibleActionId/rejectedActionId from sourceCandidateActionId,
 *   selectedActionId from sourceFeasibleActionId
 * - All identifiers traced to caller-provided sources
 * - No scoring, ranking, recommendation, or decision logic
 * - No mutation of input state
 * - Selection is not execution (result is selection, not application)
 * - Orchestration is not recommendation (no confidence, no scoring, no priority)
 */

