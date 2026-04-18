/**
 * Optimization Feasibility Evaluator Contract
 * Defines the deterministic feasibility evaluation boundary.
 * Transforms candidate actions into feasible and rejected references based on constraints.
 * Runtime does not generate IDs - caller provides all identifiers.
 */

import type { OptimizationInput } from "./optimization-input.contract";
import type { ActionCategory } from "./optimization-action-category";
import type { RejectionKind } from "./optimization-action-separation-kind";

/**
 * FeasibleCandidateReference
 * Minimal reference to a candidate that passed feasibility evaluation.
 * Caller will use this reference to construct full FeasibleAction with caller-provided ID.
 */
export interface FeasibleCandidateReference {
  /** Reference to the source candidate action */
  readonly sourceCandidateActionId: string;

  /** Category inherited from source candidate */
  readonly category: ActionCategory;
}

/**
 * RejectedCandidateReference
 * Minimal reference to a candidate that failed feasibility evaluation.
 * Caller will use this reference to construct full RejectedCandidateAction with caller-provided ID.
 */
export interface RejectedCandidateReference {
  /** Reference to the source candidate action */
  readonly sourceCandidateActionId: string;

  /** Category inherited from source candidate */
  readonly category: ActionCategory;

  /** Explicit rejection reason - why candidate was rejected */
  readonly rejectionKind: RejectionKind;
}

/**
 * FeasibilityEvaluationResult
 * Explicit output of feasibility evaluation.
 * Carries references to feasible and rejected candidates (without IDs).
 * Caller is responsible for creating FeasibleAction and RejectedCandidateAction objects with IDs.
 */
export interface FeasibilityEvaluationResult {
  /** Candidate references that satisfied all feasibility boundaries */
  readonly feasibleCandidates: readonly FeasibleCandidateReference[];

  /** Candidate references that violated feasibility boundaries and were rejected */
  readonly rejectedCandidates: readonly RejectedCandidateReference[];
}

/**
 * OptimizationFeasibilityEvaluator
 * Defines the deterministic feasibility evaluation boundary.
 * Evaluates candidate actions against explicit feasibility constraints.
 * Same input always produces same output (deterministic).
 * No ID generation - all identifiers caller-provided only.
 */
export interface OptimizationFeasibilityEvaluator {
  /**
   * Deterministic feasibility evaluation function.
   * Transforms OptimizationInput into FeasibilityEvaluationResult.
   * Evaluates each candidate action against constraints.
   * @param input - Explicit optimization input with candidates and constraints
   * @returns Feasibility evaluation result with references to feasible and rejected candidates
   */
  readonly evaluate: (input: OptimizationInput) => FeasibilityEvaluationResult;
}

/**
 * Optimization feasibility evaluator behavior:
 * - Deterministic boundary: same input always produces same output
 * - Explicit transformation: OptimizationInput → FeasibilityEvaluationResult
 * - Evaluates candidates only against feasibility boundaries (constraints)
 * - Produces references to feasible and rejected candidates (caller provides IDs)
 * - Feasible reference ≠ selected action (no selection logic)
 * - No scoring, no ranking, no recommendation
 * - No mutation of input state
 * - No generated identifiers
 */

