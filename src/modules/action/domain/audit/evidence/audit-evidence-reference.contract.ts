import type { AuditEvidenceKind } from "./audit-evidence-kind.enum.js";

/**
 * AuditEvidenceReferenceBase - Base structure for audit evidence references
 */
interface AuditEvidenceReferenceBase {
  readonly evidenceReferenceId: string;
  readonly evidenceKind?: AuditEvidenceKind;
  readonly policyId?: string;
  readonly ruleId?: string;
  readonly thresholdId?: string;
  readonly approvalBoundaryId?: string;
  readonly candidateActionId?: string;
  readonly selectedActionId?: string;
  readonly handoffId?: string;
  readonly outcomeId?: string;
}

/**
 * AuditEvidenceReference - Non-hollow evidence reference
 * Union ensures at least one structural reference is required beyond evidenceReferenceId.
 */
export type AuditEvidenceReference =
  | (AuditEvidenceReferenceBase & { readonly policyId: string })
  | (AuditEvidenceReferenceBase & { readonly ruleId: string })
  | (AuditEvidenceReferenceBase & { readonly thresholdId: string })
  | (AuditEvidenceReferenceBase & { readonly approvalBoundaryId: string })
  | (AuditEvidenceReferenceBase & { readonly candidateActionId: string })
  | (AuditEvidenceReferenceBase & { readonly selectedActionId: string })
  | (AuditEvidenceReferenceBase & { readonly handoffId: string })
  | (AuditEvidenceReferenceBase & { readonly outcomeId: string });
