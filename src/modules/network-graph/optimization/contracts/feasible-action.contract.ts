/**
 * Feasible Action Contract
 * Defines an action that has passed explicit feasibility boundaries.
 * Structural-only: no execution, no selection state, no scoring.
 * Links back to the source candidate action.
 */

import type { ActionCategory } from "./optimization-action-category";

/**
 * FeasibleAction
 * Represents a candidate action that has passed explicit feasibility boundaries.
 * Structural-only proposal of an evaluated action.
 * Does not imply selection.
 * Does not carry score, recommendation, or execution state.
 */
export interface FeasibleAction {
  /** Unique identifier for this feasible action state (caller-provided) */
  readonly feasibleActionId: string;

  /** Reference to the source candidate action (caller-provided) */
  readonly sourceCandidateActionId: string;

  /** Category inherited from source candidate (caller-provided, bounded to ActionCategory) */
  readonly category: ActionCategory;
}

/**
 * Feasible action behavior:
 * - Structural-only: action has passed feasibility evaluation
 * - Maintains link to source candidate action for traceability
 * - No implicit selection or recommendation
 * - No score, confidence, or execution state
 * - Feasible action ≠ selected action
 * - All values are caller-provided; no generation or inference
 */
