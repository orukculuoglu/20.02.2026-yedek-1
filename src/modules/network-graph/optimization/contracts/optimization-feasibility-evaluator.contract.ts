/**
 * Optimization Feasibility Evaluator Contract
 * Defines the deterministic feasibility evaluation boundary.
 * Transforms candidate actions into feasible and rejected references based on constraints.
 * Runtime does not generate IDs - caller provides all identifiers.
 * 
 * FEASIBILITY BOUNDARY CLOSURE (Phase 2):
 * This contract formally defines what constraints are evaluable at feasibility time.
 * 
 * WHAT IS EVALUATED (Feasibility-Relevant Constraints):
 * - ForbiddenActionConstraint: Is candidate.candidateId in the forbidden list? If yes → REJECTED
 * - RegionalRestrictionConstraint: For regional_balancing candidates only:
 *   Is candidate.destinationRegionId in the allowed regions? If no → REJECTED
 * 
 * WHAT IS NOT EVALUATED (Deferred Constraints):
 * - CapacityConstraint: Requires runtime capacity state (not candidate property)
 * - StockConstraint: Requires runtime stock state (not candidate property)
 * - SLATimeConstraint: Requires runtime timing state (not candidate property)
 * - RequiredActionConstraint: Selection requirement (not feasibility check)
 * - DeterministicControlConstraint: Ordering preference (not feasibility check)
 * 
 * ELIMINATION OF FAKE COMPLETENESS:
 * This boundary is intentionally tight. Constraints that require runtime state or selection context
 * are explicitly NOT evaluated here. This means:
 * - A feasible candidate ≠ a selected candidate
 * - Feasibility-relevant constraints are checked only against candidate properties
 * - Deferred constraints are preserved but not applied at feasibility time
 * - Later phases (selection, execution) may consume deferred constraints as needed
 * 
 * DETERMINISTIC FEASIBILITY DOCTRINE:
 * - Same constraints + same candidates → same feasibility result every time
 * - Feasibility-relevant constraints always evaluated (no silent skipping)
 * - Deferred constraints never evaluated (no surprise application at wrong phase)
 * - All candidate property checks are type-safe and deterministic
 * - No generated IDs, no mutation, no fallback semantics
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
 * 
 * Important: Feasibility result represents ONLY the outcome of feasibility-relevant constraints.
 * Other constraints are not evaluated and must not be assumed to have been checked.
 */
export interface FeasibilityEvaluationResult {
  /** Candidate references that satisfied all feasibility-relevant constraints */
  readonly feasibleCandidates: readonly FeasibleCandidateReference[];

  /** Candidate references that violated feasibility-relevant constraints and were rejected */
  readonly rejectedCandidates: readonly RejectedCandidateReference[];
}

/**
 * OptimizationFeasibilityEvaluator
 * Defines the deterministic feasibility evaluation boundary.
 * Evaluates candidate actions against feasibility-relevant constraints ONLY.
 * Same input always produces same output (deterministic).
 * No ID generation - all identifiers caller-provided only.
 * 
 * CONTRACT:
 * - EVALUATES: ForbiddenActionConstraint, RegionalRestrictionConstraint (for regional candidates only)
 * - DOES NOT EVALUATE: CapacityConstraint, StockConstraint, SLATimeConstraint, RequiredActionConstraint, DeterministicControlConstraint
 * - Deferred constraints are preserved in input but not applied during evaluation
 * - Caller must explicitly handle deferred constraints in later phases if needed
 */
export interface OptimizationFeasibilityEvaluator {
  /**
   * Deterministic feasibility evaluation function.
   * Transforms OptimizationInput into FeasibilityEvaluationResult.
   * Evaluates each candidate action against feasibility-relevant constraints ONLY.
   * 
   * Constraint Evaluation Specifics:
   * - ForbiddenActionConstraint: All candidates checked; forbidden candidates rejected immediately
   * - RegionalRestrictionConstraint: Only regional_balancing candidates checked; others ignored
   * - All other constraints: Silently skipped (not applicable to feasibility evaluation)
   * 
   * @param input - Explicit optimization input with candidates and constraints
   * @returns Feasibility evaluation result with references to feasible and rejected candidates
   *          (result represents feasibility-relevant constraint evaluation only)
   */
  readonly evaluate: (input: OptimizationInput) => FeasibilityEvaluationResult;
}

/**
 * Optimization feasibility evaluator behavior:
 * - Deterministic boundary: same input always produces same output
 * - Explicit transformation: OptimizationInput → FeasibilityEvaluationResult
 * - Evaluates candidates ONLY against feasibility-relevant constraints
 * - Deferred constraints are silently not evaluated (not surprise-evaluated later)
 * - Produces references to feasible and rejected candidates (caller provides IDs)
 * - Feasible reference ≠ selected action (no selection logic)
 * - Feasibility result ≠ complete optimization result (deferred constraints pending)
 * - No scoring, no ranking, no recommendation
 * - No mutation of input state
 * - No generated identifiers
 * 
 * Candidate vs Feasible Boundary:
 * - Candidate: proposed action from caller
 * - Feasible: candidate that passed feasibility-relevant constraints
 * - Selected: feasible candidate chosen by selection phase (later)
 * - These boundaries remain clean and distinct
 */


