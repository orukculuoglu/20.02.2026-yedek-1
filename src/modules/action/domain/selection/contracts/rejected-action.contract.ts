import type { SelectionRationale } from "./selection-rationale.contract.js";

/**
 * RejectedAction - Structural definition of a final rejected action
 * Pure structural definition of a candidate action that was not selected.
 * Contains reference to candidate and optional rejection rationale.
 * No ranking logic, score computation, or runtime rejection behavior.
 */
export interface RejectedAction {
  /**
   * Unique identifier for this rejection result
   */
  readonly rejectedActionId: string;

  /**
   * Reference identifier to the candidate action that was rejected
   */
  readonly candidateActionId: string;

  /**
   * Optional rationale references explaining why this action was rejected
   * May be empty if rejection rationale is implicit
   */
  readonly rejectionRationales: ReadonlyArray<SelectionRationale>;
}
