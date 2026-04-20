import type { NonEmptyReadonlyArray } from "../../thresholds/contracts/non-empty-readonly-array.type.js";
import type { EvaluationRationale } from "./evaluation-rationale.contract.js";

/**
 * UnmatchedRulesOutcome - Structural outcome when rules in a policy did not match evaluation input
 * Pure definition of an unmatched rule evaluation outcome with no execution consequences or state.
 * Identifies which rules did not match, plus rationale references.
 */
export interface UnmatchedRulesOutcome {
  /**
   * Identifiers of the rules that did not match the evaluation input
   * Required: at least one rule did not match to form an unmatched outcome
   */
  readonly unmatchedRuleIds: NonEmptyReadonlyArray<string>;

  /**
   * Rationale references explaining why these rules did not match
   * Optional collection; may be empty if reason is implicit in rule non-matching
   */
  readonly rationales: ReadonlyArray<EvaluationRationale>;
}
