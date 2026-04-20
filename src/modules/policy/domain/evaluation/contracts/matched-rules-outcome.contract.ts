import type { NonEmptyReadonlyArray } from "../../thresholds/contracts/non-empty-readonly-array.type.js";
import type { EvaluationRationale } from "./evaluation-rationale.contract.js";

/**
 * MatchedRulesOutcome - Structural outcome when rules in a policy matched evaluation input
 * Pure definition of a matched rule evaluation outcome with no execution consequences or state.
 * Identifies which rules matched, plus rationale references.
 */
export interface MatchedRulesOutcome {
  /**
   * Identifiers of the rules that matched the evaluation input
   * Required: at least one rule matched to form a matched outcome
   */
  readonly matchedRuleIds: NonEmptyReadonlyArray<string>;

  /**
   * Rationale references explaining why these rules matched
   * Optional collection; may be empty if rationale is implicit in rule matching
   */
  readonly rationales: ReadonlyArray<EvaluationRationale>;
}
