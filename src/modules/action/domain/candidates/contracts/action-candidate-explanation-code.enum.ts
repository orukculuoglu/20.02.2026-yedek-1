/**
 * ActionCandidateExplanationCode - Bounded vocabulary for structural explanation of action candidates
 * Identifies the candidate structural origin and derivation basis.
 * Captures only candidate-structural classification, not downstream runtime state or requirements.
 * Pure vocabulary; no narrative generation or localization logic.
 */
export enum ActionCandidateExplanationCode {
  /**
   * Candidate is a direct action from policy definition
   */
  DIRECT_POLICY_ACTION = "direct_policy_action",

  /**
   * Candidate is a derived action from policy in combination with evaluation outcome
   */
  DERIVED_FROM_EVALUATION = "derived_from_evaluation",
}

/**
 * ActionCandidateExplanationCode value type for serialized explanation code strings
 */
export type ActionCandidateExplanationCodeValue = `${ActionCandidateExplanationCode}`;

/**
 * All values in ActionCandidateExplanationCode for bounded collection usage
 */
export const ACTION_CANDIDATE_EXPLANATION_CODES_ALL = Object.freeze([
  ActionCandidateExplanationCode.DIRECT_POLICY_ACTION,
  ActionCandidateExplanationCode.DERIVED_FROM_EVALUATION,
] as const);
