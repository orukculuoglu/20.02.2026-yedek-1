import type { OutcomeLinkage } from "./outcome-linkage.contract.js";
import type { OutcomeRationale } from "./outcome-rationale.contract.js";

/**
 * ExpiredOutcome - Structural definition of an expired action outcome
 * Pure structural definition of an action that expired.
 * Contains outcome identity, linkage references, and optional rationale.
 * No scheduler logic or timeout engine.
 */
export interface ExpiredOutcome {
  /**
   * Unique identifier for this outcome
   */
  readonly outcomeId: string;

  /**
   * Linkage references connecting outcome to action flow
   */
  readonly linkage: OutcomeLinkage;

  /**
   * Optional reference identifier to the expiry constraint
   */
  readonly expiryConstraintId?: string;

  /**
   * Optional rationale references explaining why this action expired
   * May be empty if expiry rationale is implicit
   */
  readonly outcomeRationales: ReadonlyArray<OutcomeRationale>;
}
