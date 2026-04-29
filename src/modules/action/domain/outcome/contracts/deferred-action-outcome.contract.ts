import type { OutcomeLinkage } from "./outcome-linkage.contract.js";
import type { OutcomeRationale } from "./outcome-rationale.contract.js";

/**
 * DeferredActionOutcome - Structural definition of a deferred action outcome
 * Pure structural definition of an action that was deferred from execution.
 * Contains outcome identity, linkage references, and optional rationale.
 * No scheduling logic, queue semantics, or retry behavior.
 */
export interface DeferredActionOutcome {
  /**
   * Unique identifier for this outcome
   */
  readonly outcomeId: string;

  /**
   * Linkage references connecting outcome to action flow
   */
  readonly linkage: OutcomeLinkage;

  /**
   * Optional reference identifier to the deferral constraint
   */
  readonly deferralConstraintId?: string;

  /**
   * Optional rationale references explaining why this action was deferred
   * May be empty if deferral rationale is implicit
   */
  readonly outcomeRationales: ReadonlyArray<OutcomeRationale>;
}
