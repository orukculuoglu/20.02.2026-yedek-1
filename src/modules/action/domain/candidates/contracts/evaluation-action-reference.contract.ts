/**
 * EvaluationActionOutcomeType - Bounded vocabulary for which policy evaluation outcome type led to a candidate
 * Pure vocabulary; no evaluation logic.
 */
export enum EvaluationActionOutcomeType {
  /**
   * Candidate derived from matched evaluation outcome
   */
  MATCHED = "matched",

  /**
   * Candidate derived from unmatched evaluation outcome
   */
  UNMATCHED = "unmatched",

  /**
   * Candidate derived from blocked evaluation outcome
   */
  BLOCKED = "blocked",

  /**
   * Candidate derived from deferred evaluation outcome
   */
  DEFERRED = "deferred",
}

/**
 * EvaluationActionOutcomeType value type for serialized outcome type strings
 */
export type EvaluationActionOutcomeTypeValue = `${EvaluationActionOutcomeType}`;

/**
 * All values in EvaluationActionOutcomeType for bounded collection usage
 */
export const EVALUATION_ACTION_OUTCOME_TYPES_ALL = Object.freeze([
  EvaluationActionOutcomeType.MATCHED,
  EvaluationActionOutcomeType.UNMATCHED,
  EvaluationActionOutcomeType.BLOCKED,
  EvaluationActionOutcomeType.DEFERRED,
] as const);

/**
 * EvaluationActionReference - Minimal reference to the evaluation source of an action candidate
 * Pure reference structure with no evaluation loading or resolution behavior.
 * Links candidate back to the evaluation that produced it.
 */
export interface EvaluationActionReference {
  /**
   * Identifier of the policy evaluation that is a source of this candidate action
   */
  readonly evaluationId: string;

  /**
   * Classification of which evaluation outcome type led to this candidate
   */
  readonly outcomeType: EvaluationActionOutcomeType;
}
