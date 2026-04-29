/**
 * Audit consumption kind classification vocabulary
 */
export enum AuditConsumptionKind {
  ACTION_LOG_VIEW = "action_log_view",
  POLICY_TRACE_VIEW = "policy_trace_view",
  EVIDENCE_DECISION_VIEW = "evidence_decision_view",
  AUDIT_EXPLANATION_VIEW = "audit_explanation_view",
  AUDIT_SUMMARY_VIEW = "audit_summary_view",
}

export const AUDIT_CONSUMPTION_KINDS_ALL: ReadonlyArray<AuditConsumptionKind> = [
  AuditConsumptionKind.ACTION_LOG_VIEW,
  AuditConsumptionKind.POLICY_TRACE_VIEW,
  AuditConsumptionKind.EVIDENCE_DECISION_VIEW,
  AuditConsumptionKind.AUDIT_EXPLANATION_VIEW,
  AuditConsumptionKind.AUDIT_SUMMARY_VIEW,
];

export type AuditConsumptionKindValue = `${AuditConsumptionKind}`;
