/**
 * ActionLogEventKind - Bounded vocabulary for action audit log event classification
 * Identifies the structural event kind that was logged in the action audit trail.
 * Pure vocabulary; no event processing, storage, or replay semantics.
 */
export enum ActionLogEventKind {
  /**
   * Event: action candidate was recorded
   */
  ACTION_CANDIDATE_RECORDED = "action_candidate_recorded",

  /**
   * Event: action was selected
   */
  ACTION_SELECTED_RECORDED = "action_selected_recorded",

  /**
   * Event: action was rejected
   */
  ACTION_REJECTED_RECORDED = "action_rejected_recorded",

  /**
   * Event: action was suppressed
   */
  ACTION_SUPPRESSED_RECORDED = "action_suppressed_recorded",

  /**
   * Event: action was deferred
   */
  ACTION_DEFERRED_RECORDED = "action_deferred_recorded",

  /**
   * Event: execution handoff was recorded
   */
  EXECUTION_HANDOFF_RECORDED = "execution_handoff_recorded",

  /**
   * Event: approval-pending handoff was recorded
   */
  APPROVAL_PENDING_HANDOFF_RECORDED = "approval_pending_handoff_recorded",

  /**
   * Event: blocked handoff was recorded
   */
  BLOCKED_HANDOFF_RECORDED = "blocked_handoff_recorded",

  /**
   * Event: deferred handoff was recorded
   */
  DEFERRED_HANDOFF_RECORDED = "deferred_handoff_recorded",

  /**
   * Event: action outcome was recorded
   */
  ACTION_OUTCOME_RECORDED = "action_outcome_recorded",
}

/**
 * ActionLogEventKind value type for serialized event kind strings
 */
export type ActionLogEventKindValue = `${ActionLogEventKind}`;

/**
 * All values in ActionLogEventKind for bounded collection usage
 */
export const ACTION_LOG_EVENT_KINDS_ALL = Object.freeze([
  ActionLogEventKind.ACTION_CANDIDATE_RECORDED,
  ActionLogEventKind.ACTION_SELECTED_RECORDED,
  ActionLogEventKind.ACTION_REJECTED_RECORDED,
  ActionLogEventKind.ACTION_SUPPRESSED_RECORDED,
  ActionLogEventKind.ACTION_DEFERRED_RECORDED,
  ActionLogEventKind.EXECUTION_HANDOFF_RECORDED,
  ActionLogEventKind.APPROVAL_PENDING_HANDOFF_RECORDED,
  ActionLogEventKind.BLOCKED_HANDOFF_RECORDED,
  ActionLogEventKind.DEFERRED_HANDOFF_RECORDED,
  ActionLogEventKind.ACTION_OUTCOME_RECORDED,
] as const);
