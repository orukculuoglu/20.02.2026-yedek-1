/**
 * Policy Evaluation Surface - Pure declarative evaluation contract layer
 * Defines how single-policy evaluation inputs and results are structurally represented.
 * Contains no runtime behavior, execution logic, or workflow semantics.
 * No hidden semantics: all structural choices are explicit.
 */

// Rule selection vocabulary
export type { RuleSelection } from "./rule-selection.contract.js";

// Evaluation rationale vocabulary and structure
export { EvaluationRationaleCode, ALL_EVALUATION_RATIONALE_CODES } from "./evaluation-rationale-code.enum.js";
export type { EvaluationRationale } from "./evaluation-rationale.contract.js";

// Explanation vocabulary and structure
export { ExplanationCode, ALL_EXPLANATION_CODES } from "./explanation-code.enum.js";
export type { Explanation } from "./explanation.contract.js";

// Evaluation outcome sections
export type { MatchedRulesOutcome } from "./matched-rules-outcome.contract.js";
export type { UnmatchedRulesOutcome } from "./unmatched-rules-outcome.contract.js";
export type { BlockedOutcome } from "./blocked-outcome.contract.js";
export type { DeferredOutcome } from "./deferred-outcome.contract.js";

// Core evaluation contracts
export type { PolicyEvaluationInput } from "./policy-evaluation-input.contract.js";
export type { PolicyEvaluationResult } from "./policy-evaluation-result.contract.js";
