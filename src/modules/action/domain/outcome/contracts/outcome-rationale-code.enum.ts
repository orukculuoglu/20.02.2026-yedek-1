/**
 * OutcomeRationaleCode - Bounded vocabulary for action outcome rationale
 * Identifies why an action outcome was recorded.
 * Captures only outcome-surface reasons using neutral structural language.
 * Pure vocabulary; no execution engine, dispatch, or audit semantics.
 */
export enum OutcomeRationaleCode {
  /**
   * Outcome: success outcome recorded
   */
  SUCCESS_OUTCOME_RECORDED = "success_outcome_recorded",

  /**
   * Outcome: failed outcome recorded
   */
  FAILED_OUTCOME_RECORDED = "failed_outcome_recorded",

  /**
   * Outcome: blocked outcome recorded
   */
  BLOCKED_OUTCOME_RECORDED = "blocked_outcome_recorded",

  /**
   * Outcome: expired outcome recorded
   */
  EXPIRED_OUTCOME_RECORDED = "expired_outcome_recorded",

  /**
   * Outcome: cancelled outcome recorded
   */
  CANCELLED_OUTCOME_RECORDED = "cancelled_outcome_recorded",

  /**
   * Outcome: deferred outcome recorded
   */
  DEFERRED_OUTCOME_RECORDED = "deferred_outcome_recorded",
}

/**
 * OutcomeRationaleCode value type for serialized outcome rationale code strings
 */
export type OutcomeRationaleCodeValue = `${OutcomeRationaleCode}`;

/**
 * All values in OutcomeRationaleCode for bounded collection usage
 */
export const OUTCOME_RATIONALE_CODES_ALL = Object.freeze([
  OutcomeRationaleCode.SUCCESS_OUTCOME_RECORDED,
  OutcomeRationaleCode.FAILED_OUTCOME_RECORDED,
  OutcomeRationaleCode.BLOCKED_OUTCOME_RECORDED,
  OutcomeRationaleCode.EXPIRED_OUTCOME_RECORDED,
  OutcomeRationaleCode.CANCELLED_OUTCOME_RECORDED,
  OutcomeRationaleCode.DEFERRED_OUTCOME_RECORDED,
] as const);
