import type { OutcomeLinkage } from "./outcome-linkage.contract.js";
import type { OutcomeRationale } from "./outcome-rationale.contract.js";

/**
 * BlockedOutcome - Structural definition of a blocked action outcome
 * Pure structural definition of an action that was blocked from execution.
 * Contains outcome identity, linkage references, and optional rationale.
 * No enforcement logic or block/unblock state machine.
 */
export interface BlockedOutcome {
  /**
   * Unique identifier for this outcome
   */
  readonly outcomeId: string;

  /**
   * Linkage references connecting outcome to action flow
   */
  readonly linkage: OutcomeLinkage;

  /**
   * Optional reference identifier to the blocking constraint
   */
  readonly blockingConstraintId?: string;

  /**
   * Optional rationale references explaining why this action was blocked
   * May be empty if blocking rationale is implicit
   */
  readonly outcomeRationales: ReadonlyArray<OutcomeRationale>;
}
