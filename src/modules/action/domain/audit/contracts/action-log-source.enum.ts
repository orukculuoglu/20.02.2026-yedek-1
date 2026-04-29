/**
 * ActionLogSource - Bounded vocabulary for action audit log source classification
 * Identifies the structural source that generated the audit log entry.
 * Pure vocabulary for log record sourcing; no resolution or routing behavior.
 */
export enum ActionLogSource {
  /**
   * Source: policy foundation / evaluation
   */
  POLICY_FOUNDATION = "policy_foundation",

  /**
   * Source: action runtime / candidates / selection
   */
  ACTION_RUNTIME = "action_runtime",

  /**
   * Source: execution boundary / handoff
   */
  EXECUTION_BOUNDARY = "execution_boundary",

  /**
   * Source: outcome flow
   */
  OUTCOME_FLOW = "outcome_flow",

  /**
   * Source: system
   */
  SYSTEM = "system",
}

/**
 * ActionLogSource value type for serialized source strings
 */
export type ActionLogSourceValue = `${ActionLogSource}`;

/**
 * All values in ActionLogSource for bounded collection usage
 */
export const ACTION_LOG_SOURCES_ALL = Object.freeze([
  ActionLogSource.POLICY_FOUNDATION,
  ActionLogSource.ACTION_RUNTIME,
  ActionLogSource.EXECUTION_BOUNDARY,
  ActionLogSource.OUTCOME_FLOW,
  ActionLogSource.SYSTEM,
] as const);
