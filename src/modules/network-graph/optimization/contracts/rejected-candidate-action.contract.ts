/**
 * Rejected Candidate Action Contract
 * Defines a candidate action that is not carried forward.
 * Structural-only: no execution, no implicit rejection reasoning.
 * Links back to source candidate action.
 * Rejection reason is explicitly bounded (not implicit inference).
 * 
 * REJECTED ACTION SEMANTICS (Phase 3 - Intermediate Clarification - MODEL A):
 * - Rejected means: action did NOT pass feasibility evaluation (failed a feasibility-relevant constraint)
 * - Rejected does NOT mean: action was not selected by the selection strategy
 * - Rejected does NOT mean: action is permanently forbidden (it failed this evaluation, not permanently barred)
 * - Rejected does NOT mean: action is policy-prohibited (it violated a concrete feasibility constraint only)
 * - Rejected does NOT mean: action is inferior or low-priority (it was structurally infeasible, not competitively ranked)
 * - Rejected action is a terminal decision state: no, exclude this from final output
 * - Rejected action is structural: just marks final exclusion, no hidden semantics
 * - Rejected action is bounded: rejection reason is explicit (RejectionKind), not inferred
 */

import type { ActionCategory } from "./optimization-action-category";
import type { RejectionKind } from "./optimization-action-separation-kind";

/**
 * RejectedCandidateAction
 * Represents a candidate action that has been rejected and not carried forward.
 * Terminal decision state: no, this action is excluded from final result.
 * Rejection kind is explicitly bounded - caller provides explicit reason.
 * Structural-only: no implicit policy override or hidden rejection logic.
 * 
 * Traceability: RejectedCandidateAction → SourceCandidateAction → OriginalCandidate
 * All intermediate IDs preserved to maintain complete audit trail.
 */
export interface RejectedCandidateAction {
  /** Unique identifier for this rejected action state (caller-provided, deterministic ID) */
  readonly rejectedActionId: string;

  /** Reference to source candidate action that was rejected (caller-provided) */
  readonly sourceCandidateActionId: string;

  /** Category inherited from source candidate (caller-provided, bounded to ActionCategory) */
  readonly category: ActionCategory;

  /** Explicit rejection reason - caller must specify why rejected (caller-provided, bounded to RejectionKind) */
  readonly rejectionKind: RejectionKind;
}

/**
 * Rejected candidate action behavior:
 * 
 * REJECTION SEMANTICS:
 * - Rejected means: this action was not included in final result
 * - Rejected means: this action either failed feasibility evaluation or didn't make selection limit
 * - Rejected does NOT mean: action is permanently forbidden (it just wasn't selected)
 * - Rejected does NOT mean: action is policy-prohibited (it failed feasibility check only)
 * - Rejected does NOT mean: action is low-priority or inferior (it lost selection competition)
 * - Rejected does NOT mean: action has been or will be actively blocked or denied
 * 
 * EXPLICIT REJECTION REASON (FEASIBILITY ONLY):
 * - Rejection reason (RejectionKind) is ONLY "feasibility_violated"
 * - Caller must specify that rejection is due to feasibility constraint violation
 * - Rejection reason is deterministic: same constraints + same candidates = same feasibility result
 * - No hidden policy override or silent filtering
 * - No selection-based rejection reasons (non-selected feasible stays in runtime, not rejected)
 * - Rejection reason is available for audit and traceability
 * 
 * NON-SELECTED FEASIBLE DISTINCTION:
 * - Feasible candidates that don't make the selection limit are NOT rejected
 * - They are intermediate state: SelectionResult.nonSelectedFeasibleActions
 * - They do NOT appear in final OptimizationResult.rejectedCandidates
 * - They remain in runtime context only (not propagated to final result)
 * - Selection non-inclusion is not rejection (different semantic category)
 * 
 * STRUCTURAL-ONLY:
 * - Maintains link to source candidate for traceability
 * - No implicit inference of rejection cause
 * - No hidden policy override semantics
 * - No execution status or blocking state
 * - No severity, priority, or decision flags
 * - Rejected action ≠ forbidden action (just not selected this time)
 * - All values are caller-provided; no generation or inference
 * 
 * DETERMINISTIC SEMANTICS:
 * - Same candidate + same feasibility-relevant constraints = same rejection always
 * - No probabilistic rejection, no hidden filtering, no silent exclusions
 * - Infeasible candidates are explicitly rejected with RejectionKind (not hidden)
 * - Non-selected feasible actions are explicitly NOT rejected (they stay in runtime)
 * - Boundary between feasible/infeasible is sharp and deterministic
 */
