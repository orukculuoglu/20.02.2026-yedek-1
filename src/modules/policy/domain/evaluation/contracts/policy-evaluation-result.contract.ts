import type { MatchedRulesOutcome } from "./matched-rules-outcome.contract.js";
import type { UnmatchedRulesOutcome } from "./unmatched-rules-outcome.contract.js";
import type { BlockedOutcome } from "./blocked-outcome.contract.js";
import type { DeferredOutcome } from "./deferred-outcome.contract.js";
import type { EvaluationRationale } from "./evaluation-rationale.contract.js";
import type { Explanation } from "./explanation.contract.js";

/**
 * PolicyEvaluationResult - Complete structural aggregation of single-policy evaluation outcome
 * Pure structural result definition with no execution state, workflow semantics, or action dispatch.
 * Single-policy aligned: input and result both model one policy evaluation.
 * Structurally enforced: must contain at least one outcome (rule outcome or boundary outcome).
 *
 * Rule outcomes are discriminated:
 * - Variant 1: matchedRulesOutcome (rules matched)
 * - Variant 2: unmatchedRulesOutcome (rules did not match)
 *
 * Boundary outcomes are optional and may be combined with rule outcomes:
 * - blockedOutcome: policy evaluation blocked
 * - deferredOutcome: policy evaluation deferred
 *
 * At least one element (rule outcome or boundary outcome) must be present.
 */
export type PolicyEvaluationResult =
  | {
      readonly evaluationId: string;
      readonly policyId: string;
      readonly ruleOutcome: MatchedRulesOutcome;
      readonly blockedOutcome?: BlockedOutcome;
      readonly deferredOutcome?: DeferredOutcome;
      readonly rationales: ReadonlyArray<EvaluationRationale>;
      readonly explanation: Explanation;
    }
  | {
      readonly evaluationId: string;
      readonly policyId: string;
      readonly ruleOutcome: UnmatchedRulesOutcome;
      readonly blockedOutcome?: BlockedOutcome;
      readonly deferredOutcome?: DeferredOutcome;
      readonly rationales: ReadonlyArray<EvaluationRationale>;
      readonly explanation: Explanation;
    }
  | {
      readonly evaluationId: string;
      readonly policyId: string;
      readonly blockedOutcome: BlockedOutcome;
      readonly deferredOutcome?: DeferredOutcome;
      readonly rationales: ReadonlyArray<EvaluationRationale>;
      readonly explanation: Explanation;
    }
  | {
      readonly evaluationId: string;
      readonly policyId: string;
      readonly deferredOutcome: DeferredOutcome;
      readonly rationales: ReadonlyArray<EvaluationRationale>;
      readonly explanation: Explanation;
    };
