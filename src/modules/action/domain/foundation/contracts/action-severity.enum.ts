/**
 * ActionSeverity - Bounded vocabulary for action severity classification
 * Identifies the severity or intensity level of an action.
 * Pure vocabulary; no scoring logic or severity computation.
 */
export enum ActionSeverity {
  /**
   * Low severity: action has minimal impact or urgency
   */
  LOW = "low",

  /**
   * Medium severity: action has moderate impact or urgency
   */
  MEDIUM = "medium",

  /**
   * High severity: action has significant impact or urgency
   */
  HIGH = "high",

  /**
   * Critical severity: action has critical impact or requires immediate attention
   */
  CRITICAL = "critical",
}

/**
 * ActionSeverity value type for serialized action severity strings
 */
export type ActionSeverityValue = `${ActionSeverity}`;

/**
 * All values in ActionSeverity for bounded collection usage
 */
export const ACTION_SEVERITIES_ALL = Object.freeze([
  ActionSeverity.LOW,
  ActionSeverity.MEDIUM,
  ActionSeverity.HIGH,
  ActionSeverity.CRITICAL,
] as const);
