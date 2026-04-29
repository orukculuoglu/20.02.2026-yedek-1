import type { OutcomeLinkage } from "./outcome-linkage.contract.js";
import type { OutcomeRationale } from "./outcome-rationale.contract.js";

/**
 * FailedActionOutcome - Structural definition of a failed action outcome
 * Pure structural definition of an action that failed during execution.
 * Contains outcome identity, linkage references, and optional rationale.
 * No retry behavior, recovery logic, or exception handling.
 */
export interface FailedActionOutcome {
  /**
   * Unique identifier for this outcome
   */
  readonly outcomeId: string;

  /**
   * Linkage references connecting outcome to action flow
   */
  readonly linkage: OutcomeLinkage;

  /**
   * Optional rationale references explaining this failed outcome
   * May be empty if failure rationale is implicit
   */
  readonly outcomeRationales: ReadonlyArray<OutcomeRationale>;
}
