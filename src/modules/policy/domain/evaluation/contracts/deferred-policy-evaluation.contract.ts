import type { NonEmptyReadonlyArray } from "../../thresholds/contracts/non-empty-readonly-array.type.js";
import type { EvaluationRationale } from "./evaluation-rationale.contract.js";

/**
 * DeferredPolicyEvaluation - Structural result section for policies deferred by approval boundaries
 * Pure definition of a deferred policy outcome with no scheduling, queueing, or retry behavior.
 * Identifies which policy is deferred and what boundary(ies) defer it.
 */
export interface DeferredPolicyEvaluation {
  /**
   * Identifier of the policy that is deferred
   */
  readonly policyId: string;

  /**
   * Identifiers of the approval boundaries deferring this policy
   * Required: at least one boundary defers the policy
   */
  readonly deferredByApprovalBoundaryIds: NonEmptyReadonlyArray<string>;

  /**
   * Rationale references explaining the deferral
   * Optional collection; may include DEFERRED_BY_APPROVAL_BOUNDARY or related rationale codes
   */
  readonly rationales: ReadonlyArray<EvaluationRationale>;
}
