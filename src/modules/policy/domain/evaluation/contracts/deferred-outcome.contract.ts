import type { NonEmptyReadonlyArray } from "../../thresholds/contracts/non-empty-readonly-array.type.js";
import type { EvaluationRationale } from "./evaluation-rationale.contract.js";

/**
 * DeferredOutcome - Structural outcome when policy evaluation is deferred by approval boundaries
 * Pure definition of a deferred evaluation outcome with no scheduling, queueing, or retry behavior.
 * Identifies what approval boundary(ies) defer progression.
 */
export interface DeferredOutcome {
  /**
   * Identifiers of the approval boundaries deferring this policy evaluation
   * Required: at least one boundary defers the policy
   */
  readonly deferredByBoundaryIds: NonEmptyReadonlyArray<string>;

  /**
   * Rationale references explaining the deferral
   * Optional collection; may include DEFERRED_BY_APPROVAL_BOUNDARY or related rationale codes
   */
  readonly rationales: ReadonlyArray<EvaluationRationale>;
}
