import type { SelectionRationale } from "./selection-rationale.contract.js";

/**
 * DeferredAction - Structural definition of a deferred action
 * Pure structural definition of a candidate action that cannot be selected at this time.
 * Candidate is valid but selection is deferred pending condition resolution.
 * Contains reference to candidate and optional deferral rationale.
 * No scheduling logic, queue semantics, or retry behavior.
 */
export interface DeferredAction {
  /**
   * Unique identifier for this deferral result
   */
  readonly deferredActionId: string;

  /**
   * Reference identifier to the candidate action that was deferred
   */
  readonly candidateActionId: string;

  /**
   * Optional rationale references explaining why this action was deferred
   * May be empty if deferral rationale is implicit
   */
  readonly deferralRationales: ReadonlyArray<SelectionRationale>;
}
