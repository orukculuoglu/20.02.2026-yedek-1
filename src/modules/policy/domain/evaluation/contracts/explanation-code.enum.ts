/**
 * ExplanationCode - Bounded vocabulary for structural evaluation result explanation classification
 * Identifies the structural explanation category for an evaluation result.
 * Pure vocabulary; no runtime interpretation, narrative generation, or messaging logic.
 */
export enum ExplanationCode {
  /**
   * All policy rules matched the evaluation input
   */
  ALL_RULES_MATCHED = "ALL_RULES_MATCHED",

  /**
   * Some policy rules matched and some did not match the evaluation input
   */
  SOME_RULES_MATCHED = "SOME_RULES_MATCHED",

  /**
   * No policy rules matched the evaluation input
   */
  NO_RULES_MATCHED = "NO_RULES_MATCHED",

  /**
   * Policy evaluation result was blocked by an approval boundary
   */
  POLICY_BLOCKED = "POLICY_BLOCKED",

  /**
   * Policy evaluation result was deferred by an approval boundary or scheduled condition
   */
  POLICY_DEFERRED = "POLICY_DEFERRED",

  /**
   * Policy evaluation could not complete due to insufficient evidence availability
   */
  INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE",

  /**
   * Policy evaluation detected one or more threshold value breaches
   */
  THRESHOLD_BREACH_DETECTED = "THRESHOLD_BREACH_DETECTED",

  /**
   * Policy evaluation result requires approval before progression
   */
  APPROVAL_REQUIRED = "APPROVAL_REQUIRED",
}

/**
 * All values in ExplanationCode for bounded collection usage
 */
export const ALL_EXPLANATION_CODES = Object.freeze([
  ExplanationCode.ALL_RULES_MATCHED,
  ExplanationCode.SOME_RULES_MATCHED,
  ExplanationCode.NO_RULES_MATCHED,
  ExplanationCode.POLICY_BLOCKED,
  ExplanationCode.POLICY_DEFERRED,
  ExplanationCode.INSUFFICIENT_EVIDENCE,
  ExplanationCode.THRESHOLD_BREACH_DETECTED,
  ExplanationCode.APPROVAL_REQUIRED,
] as const);
