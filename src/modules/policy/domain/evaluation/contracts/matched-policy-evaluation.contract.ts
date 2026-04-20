import type { NonEmptyReadonlyArray } from "../../thresholds/contracts/non-empty-readonly-array.type.js";
import type { EvaluationRationale } from "./evaluation-rationale.contract.js";

/**
 * MatchedPolicyEvaluation - Structural result section for policies that matched evaluation
 * Pure definition of a matched policy outcome with no execution consequences or state.
 * Identifies which policy and which rules matched, plus rationale references.
 */
export interface MatchedPolicyEvaluation {
  /**
   * Identifier of the policy that matched the evaluation input
   */
  readonly policyId: string;

  /**
   * Identifiers of the rules in the policy that matched the evaluation input
   * Required: at least one rule matched to form a matched policy outcome
   */
  readonly matchedRuleIds: NonEmptyReadonlyArray<string>;

  /**
   * Rationale references explaining why this policy was matched
   * Optional collection; may be empty if rationale is implicit in rule matching
   */
  readonly rationales: ReadonlyArray<EvaluationRationale>;
}
