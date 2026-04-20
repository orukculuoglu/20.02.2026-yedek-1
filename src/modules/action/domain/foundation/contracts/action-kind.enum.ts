/**
 * ActionKind - Bounded vocabulary for action type classification
 * Identifies the kind or category of action to be taken.
 * Pure vocabulary; no runtime interpretation or execution logic.
 */
export enum ActionKind {
  /**
   * Alert or notification action: communicates information or condition
   */
  ALERT = "alert",

  /**
   * Recommendation action: suggests a course of action for human evaluation
   */
  RECOMMEND = "recommend",

  /**
   * Automatic action: triggers automated system behavior without requiring external approval
   */
  AUTO_ACT = "auto_act",

  /**
   * Defer action: postpones action execution to a later time or condition
   */
  DEFER = "defer",

  /**
   * Escalation action: raises the issue to a higher authority or priority level
   */
  ESCALATE = "escalate",
}

/**
 * ActionKind value type for serialized action kind strings
 */
export type ActionKindValue = `${ActionKind}`;

/**
 * All values in ActionKind for bounded collection usage
 */
export const ACTION_KINDS_ALL = Object.freeze([
  ActionKind.ALERT,
  ActionKind.RECOMMEND,
  ActionKind.AUTO_ACT,
  ActionKind.DEFER,
  ActionKind.ESCALATE,
] as const);
