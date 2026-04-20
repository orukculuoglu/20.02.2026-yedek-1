import type { SelectionRationale } from "./selection-rationale.contract.js";

/**
 * SuppressedAction - Structural definition of a suppressed action
 * Pure structural definition of a valid candidate action that is suppressed from final selection.
 * Distinguishes from rejection: candidate remains structurally valid but is suppressed.
 * Contains reference to candidate and optional suppression rationale.
 * No suppression engine logic or runtime behavior.
 */
export interface SuppressedAction {
  /**
   * Unique identifier for this suppression result
   */
  readonly suppressedActionId: string;

  /**
   * Reference identifier to the candidate action that was suppressed
   */
  readonly candidateActionId: string;

  /**
   * Optional rationale references explaining why this action was suppressed
   * May be empty if suppression rationale is implicit
   */
  readonly suppressionRationales: ReadonlyArray<SelectionRationale>;
}
