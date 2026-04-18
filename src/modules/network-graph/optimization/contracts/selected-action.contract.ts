/**
 * Selected Action Contract
 * Defines an action chosen for final optimization output.
 * Structural-only: no execution, no recommendation, no decision flags.
 * Links back to source feasible action and candidate for full traceability.
 */

import type { ActionCategory } from "./optimization-action-category";

/**
 * SelectedAction
 * Represents a feasible action chosen for final optimization output.
 * Structural-only: action has been selected from feasible set.
 * Does not execute or apply the action.
 * Does not carry score, recommendation, or execution state.
 */
export interface SelectedAction {
  /** Unique identifier for this selected action state (caller-provided) */
  readonly selectedActionId: string;

  /** Reference to source feasible action (caller-provided) */
  readonly sourceFeasibleActionId: string;

  /** Reference to original candidate action for full traceability (caller-provided) */
  readonly sourceCandidateActionId: string;

  /** Category inherited from candidate action (caller-provided, bounded to ActionCategory) */
  readonly category: ActionCategory;
}

/**
 * Selected action behavior:
 * - Structural-only: action has been selected for final output
 * - Maintains chain of references: selected → feasible → candidate
 * - No implicit execution or application
 * - No score, recommendation, or decision flags
 * - Selected action ≠ executed action
 * - All values are caller-provided; no generation or inference
 */
