/**
 * Audit evidence kind classification vocabulary
 */
export enum AuditEvidenceKind {
  POLICY_EVIDENCE = "policy_evidence",
  RULE_EVIDENCE = "rule_evidence",
  THRESHOLD_EVIDENCE = "threshold_evidence",
  APPROVAL_BOUNDARY_EVIDENCE = "approval_boundary_evidence",
  ACTION_CANDIDATE_EVIDENCE = "action_candidate_evidence",
  ACTION_SELECTION_EVIDENCE = "action_selection_evidence",
  HANDOFF_EVIDENCE = "handoff_evidence",
  OUTCOME_EVIDENCE = "outcome_evidence",
}

export const AUDIT_EVIDENCE_KINDS_ALL: ReadonlyArray<AuditEvidenceKind> = [
  AuditEvidenceKind.POLICY_EVIDENCE,
  AuditEvidenceKind.RULE_EVIDENCE,
  AuditEvidenceKind.THRESHOLD_EVIDENCE,
  AuditEvidenceKind.APPROVAL_BOUNDARY_EVIDENCE,
  AuditEvidenceKind.ACTION_CANDIDATE_EVIDENCE,
  AuditEvidenceKind.ACTION_SELECTION_EVIDENCE,
  AuditEvidenceKind.HANDOFF_EVIDENCE,
  AuditEvidenceKind.OUTCOME_EVIDENCE,
];

export type AuditEvidenceKindValue = `${AuditEvidenceKind}`;
