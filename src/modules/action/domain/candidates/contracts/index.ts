/**
 * Action Candidate Surface - Pure declarative action candidate definition layer
 * Defines how action candidates are structurally represented at compile time.
 * Contains no generation logic, scoring, selection, or execution semantics.
 */

// Action origin vocabulary
export { ActionOrigin, ACTION_ORIGINS_ALL } from "./action-origin.enum.js";
export type { ActionOriginValue } from "./action-origin.enum.js";

// Policy-to-action and evaluation-to-action reference surfaces
export type { PolicyActionReference } from "./policy-action-reference.contract.js";
export {
  EvaluationActionOutcomeType,
  EVALUATION_ACTION_OUTCOME_TYPES_ALL,
} from "./evaluation-action-reference.contract.js";
export type { EvaluationActionOutcomeTypeValue, EvaluationActionReference } from "./evaluation-action-reference.contract.js";

// Action candidate rationale vocabulary and structure
export {
  ActionCandidateRationaleCode,
  ACTION_CANDIDATE_RATIONALE_CODES_ALL,
} from "./action-candidate-rationale-code.enum.js";
export type { ActionCandidateRationaleCodeValue } from "./action-candidate-rationale-code.enum.js";
export type { ActionCandidateRationale } from "./action-candidate-rationale.contract.js";

// Action candidate explanation vocabulary and structure
export {
  ActionCandidateExplanationCode,
  ACTION_CANDIDATE_EXPLANATION_CODES_ALL,
} from "./action-candidate-explanation-code.enum.js";
export type { ActionCandidateExplanationCodeValue } from "./action-candidate-explanation-code.enum.js";
export type { ActionCandidateExplanation } from "./action-candidate-explanation.contract.js";

// Core action candidate contracts
export type { ActionCandidate } from "./action-candidate.contract.js";
export type { ActionCandidatesAggregate } from "./action-candidates-aggregate.contract.js";
