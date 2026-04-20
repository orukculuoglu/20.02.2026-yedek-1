/**
 * EvaluationRationaleCode - Bounded vocabulary for structural evaluation rationale classification
 * Identifies the structural reason or category explaining an evaluation outcome.
 * Pure vocabulary; no runtime interpretation or decision logic.
 */
export enum EvaluationRationaleCode {
  /**
   * One or more rules in the policy matched against the evaluation input
   */
  RULE_MATCHED = "RULE_MATCHED",

  /**
   * One or more rules in the policy did not match against the evaluation input
   */
  RULE_NOT_MATCHED = "RULE_NOT_MATCHED",

  /**
   * A threshold value breach was detected during evaluation
   */
  THRESHOLD_BREACHED = "THRESHOLD_BREACHED",

  /**
   * A threshold value was not breached during evaluation
   */
  THRESHOLD_NOT_BREACHED = "THRESHOLD_NOT_BREACHED",

  /**
   * An approval boundary is blocking progression through the policy path
   */
  BLOCKED_BY_APPROVAL_BOUNDARY = "BLOCKED_BY_APPROVAL_BOUNDARY",

  /**
   * An approval boundary is deferring progression through the policy path
   */
  DEFERRED_BY_APPROVAL_BOUNDARY = "DEFERRED_BY_APPROVAL_BOUNDARY",

  /**
   * Escalation approval boundary requires escalated review
   */
  ESCALATED_FOR_APPROVAL = "ESCALATED_FOR_APPROVAL",

  /**
   * Confirmation approval boundary requires confirmation before progression
   */
  REQUIRES_CONFIRMATION = "REQUIRES_CONFIRMATION",

  /**
   * Required evidence was not available during evaluation
   */
  EVIDENCE_MISSING = "EVIDENCE_MISSING",

  /**
   * Evaluation of this policy component was skipped
   */
  EVALUATION_SKIPPED = "EVALUATION_SKIPPED",
}

/**
 * All values in EvaluationRationaleCode for bounded collection usage
 */
export const ALL_EVALUATION_RATIONALE_CODES = Object.freeze([
  EvaluationRationaleCode.RULE_MATCHED,
  EvaluationRationaleCode.RULE_NOT_MATCHED,
  EvaluationRationaleCode.THRESHOLD_BREACHED,
  EvaluationRationaleCode.THRESHOLD_NOT_BREACHED,
  EvaluationRationaleCode.BLOCKED_BY_APPROVAL_BOUNDARY,
  EvaluationRationaleCode.DEFERRED_BY_APPROVAL_BOUNDARY,
  EvaluationRationaleCode.ESCALATED_FOR_APPROVAL,
  EvaluationRationaleCode.REQUIRES_CONFIRMATION,
  EvaluationRationaleCode.EVIDENCE_MISSING,
  EvaluationRationaleCode.EVALUATION_SKIPPED,
] as const);
