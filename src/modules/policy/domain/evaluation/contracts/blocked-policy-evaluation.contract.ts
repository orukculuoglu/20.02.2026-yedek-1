import type { NonEmptyReadonlyArray } from "../../thresholds/contracts/non-empty-readonly-array.type.js";
import type { EvaluationRationale } from "./evaluation-rationale.contract.js";

/**
 * BlockedPolicyEvaluation - Structural result section for policies blocked by approval boundaries
 * Pure definition of a blocked policy outcome with no enforcement behavior or workflow state.
 * Identifies which policy is blocked and what boundary(ies) block it.
 */
export interface BlockedPolicyEvaluation {
  /**
   * Identifier of the policy that is blocked
   */
  readonly policyId: string;

  /**
   * Identifiers of the approval boundaries blocking this policy
   * Required: at least one boundary blocks the policy
   */
  readonly blockedByApprovalBoundaryIds: NonEmptyReadonlyArray<string>;

  /**
   * Rationale references explaining the blocking
   * Optional collection; may include BLOCKED_BY_APPROVAL_BOUNDARY rationale codes
   */
  readonly rationales: ReadonlyArray<EvaluationRationale>;
}
