import type { OutcomeLinkage } from "./outcome-linkage.contract.js";
import type { OutcomeRationale } from "./outcome-rationale.contract.js";

/**
 * SuccessActionOutcome - Structural definition of a successful action outcome
 * Pure structural definition of an action that executed successfully.
 * Contains outcome identity, linkage references, and optional rationale.
 * No execution result payload, delivery status, or audit trail.
 */
export interface SuccessActionOutcome {
  /**
   * Unique identifier for this outcome
   */
  readonly outcomeId: string;

  /**
   * Linkage references connecting outcome to action flow
   */
  readonly linkage: OutcomeLinkage;

  /**
   * Optional rationale references explaining this successful outcome
   * May be empty if success rationale is implicit
   */
  readonly outcomeRationales: ReadonlyArray<OutcomeRationale>;
}
