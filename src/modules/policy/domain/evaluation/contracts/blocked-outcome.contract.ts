import type { NonEmptyReadonlyArray } from "../../thresholds/contracts/non-empty-readonly-array.type.js";
import type { EvaluationRationale } from "./evaluation-rationale.contract.js";

/**
 * BlockedOutcome - Structural outcome when policy evaluation is blocked by approval boundaries
 * Pure definition of a blocked evaluation outcome with no enforcement behavior or workflow state.
 * Identifies what approval boundary(ies) block progression.
 */
export interface BlockedOutcome {
  /**
   * Identifiers of the approval boundaries blocking this policy evaluation
   * Required: at least one boundary blocks the policy
   */
  readonly blockedByBoundaryIds: NonEmptyReadonlyArray<string>;

  /**
   * Rationale references explaining the blocking
   * Optional collection; may include BLOCKED_BY_APPROVAL_BOUNDARY rationale codes
   */
  readonly rationales: ReadonlyArray<EvaluationRationale>;
}
