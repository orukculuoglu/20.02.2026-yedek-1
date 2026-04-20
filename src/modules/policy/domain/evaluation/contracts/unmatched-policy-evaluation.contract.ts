import type { NonEmptyReadonlyArray } from "../../thresholds/contracts/non-empty-readonly-array.type.js";
import type { EvaluationRationale } from "./evaluation-rationale.contract.js";

/**
 * UnmatchedPolicyEvaluation - Structural result section for policies that did not match evaluation
 * Pure definition of an unmatched policy outcome with no execution consequences or state.
 * Identifies which policy and which rules did not match, plus rationale references.
 */
export interface UnmatchedPolicyEvaluation {
  /**
   * Identifier of the policy that did not match the evaluation input
   */
  readonly policyId: string;

  /**
   * Identifiers of the rules in the policy that did not match the evaluation input
   * Required: at least one rule did not match to form an unmatched policy outcome
   */
  readonly unmatchedRuleIds: NonEmptyReadonlyArray<string>;

  /**
   * Rationale references explaining why this policy was not matched
   * Optional collection; may be empty if reason is implicit in rule non-matching
   */
  readonly rationales: ReadonlyArray<EvaluationRationale>;
}
