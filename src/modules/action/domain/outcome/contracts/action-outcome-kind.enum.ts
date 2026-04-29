/**
 * ActionOutcomeKind - Bounded vocabulary for action outcome classification
 * Identifies the structural outcome kind that occurred for an action after handoff.
 * Pure vocabulary; no execution, delivery, or retry semantics.
 */
export enum ActionOutcomeKind {
  /**
   * Action executed successfully
   */
  SUCCESS = "success",

  /**
   * Action execution failed
   */
  FAILED = "failed",

  /**
   * Action blocked from execution
   */
  BLOCKED = "blocked",

  /**
   * Action expired
   */
  EXPIRED = "expired",

  /**
   * Action cancelled
   */
  CANCELLED = "cancelled",

  /**
   * Action deferred from execution
   */
  DEFERRED = "deferred",
}

/**
 * ActionOutcomeKind value type for serialized outcome kind strings
 */
export type ActionOutcomeKindValue = `${ActionOutcomeKind}`;

/**
 * All values in ActionOutcomeKind for bounded collection usage
 */
export const ACTION_OUTCOME_KINDS_ALL = Object.freeze([
  ActionOutcomeKind.SUCCESS,
  ActionOutcomeKind.FAILED,
  ActionOutcomeKind.BLOCKED,
  ActionOutcomeKind.EXPIRED,
  ActionOutcomeKind.CANCELLED,
  ActionOutcomeKind.DEFERRED,
] as const);
