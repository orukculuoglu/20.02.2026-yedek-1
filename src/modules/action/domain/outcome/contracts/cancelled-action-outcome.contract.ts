import type { OutcomeLinkage } from "./outcome-linkage.contract.js";
import type { OutcomeRationale } from "./outcome-rationale.contract.js";

/**
 * CancelledActionOutcome - Structural definition of a cancelled action outcome
 * Pure structural definition of an action that was cancelled.
 * Contains outcome identity, linkage references, and optional rationale.
 * No cancellation execution behavior or actor workflow state.
 */
export interface CancelledActionOutcome {
  /**
   * Unique identifier for this outcome
   */
  readonly outcomeId: string;

  /**
   * Linkage references connecting outcome to action flow
   */
  readonly linkage: OutcomeLinkage;

  /**
   * Optional reference identifier to the cancellation context
   */
  readonly cancellationReferenceId?: string;

  /**
   * Optional rationale references explaining why this action was cancelled
   * May be empty if cancellation rationale is implicit
   */
  readonly outcomeRationales: ReadonlyArray<OutcomeRationale>;
}
