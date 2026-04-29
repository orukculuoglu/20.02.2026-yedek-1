/**
 * Decision audit kind classification vocabulary
 */
export enum DecisionAuditKind {
  ACTION_SELECTED_DECISION = "action_selected_decision",
  ACTION_REJECTED_DECISION = "action_rejected_decision",
  ACTION_SUPPRESSED_DECISION = "action_suppressed_decision",
  ACTION_DEFERRED_DECISION = "action_deferred_decision",
  HANDOFF_DECISION = "handoff_decision",
  OUTCOME_DECISION = "outcome_decision",
}

export const DECISION_AUDIT_KINDS_ALL: ReadonlyArray<DecisionAuditKind> = [
  DecisionAuditKind.ACTION_SELECTED_DECISION,
  DecisionAuditKind.ACTION_REJECTED_DECISION,
  DecisionAuditKind.ACTION_SUPPRESSED_DECISION,
  DecisionAuditKind.ACTION_DEFERRED_DECISION,
  DecisionAuditKind.HANDOFF_DECISION,
  DecisionAuditKind.OUTCOME_DECISION,
];

export type DecisionAuditKindValue = `${DecisionAuditKind}`;
