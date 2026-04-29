import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";
import type { AuditEvidenceReference } from "./audit-evidence-reference.contract.js";
import type { DecisionRationale } from "./decision-rationale.contract.js";
import type { SelectedActionAuditExplanation } from "./selected-action-audit-explanation.contract.js";
import type { RejectedActionAuditExplanation } from "./rejected-action-audit-explanation.contract.js";
import type { SuppressedActionAuditExplanation } from "./suppressed-action-audit-explanation.contract.js";
import type { DeferredActionAuditExplanation } from "./deferred-action-audit-explanation.contract.js";
import type { EvidenceDecisionLinkage } from "./evidence-decision-linkage.contract.js";
import type { AuditSummary } from "./audit-summary.contract.js";

/**
 * EvidenceDecisionAuditBase - Base structure for evidence / decision audit aggregate
 */
interface EvidenceDecisionAuditBase {
  readonly auditId: string;
  readonly evidenceReferences?: NonEmptyReadonlyArray<AuditEvidenceReference>;
  readonly decisionRationales?: NonEmptyReadonlyArray<DecisionRationale>;
  readonly selectedExplanations?: ReadonlyArray<SelectedActionAuditExplanation>;
  readonly rejectedExplanations?: ReadonlyArray<RejectedActionAuditExplanation>;
  readonly suppressedExplanations?: ReadonlyArray<SuppressedActionAuditExplanation>;
  readonly deferredExplanations?: ReadonlyArray<DeferredActionAuditExplanation>;
  readonly linkages?: ReadonlyArray<EvidenceDecisionLinkage>;
  readonly summary?: AuditSummary;
}

/**
 * EvidenceDecisionAudit - Non-hollow evidence / decision audit aggregate
 * Union ensures at least one meaningful audit section is present.
 */
export type EvidenceDecisionAudit =
  | (EvidenceDecisionAuditBase & { readonly evidenceReferences: NonEmptyReadonlyArray<AuditEvidenceReference> })
  | (EvidenceDecisionAuditBase & { readonly decisionRationales: NonEmptyReadonlyArray<DecisionRationale> })
  | (EvidenceDecisionAuditBase & { readonly selectedExplanations: NonEmptyReadonlyArray<SelectedActionAuditExplanation> })
  | (EvidenceDecisionAuditBase & { readonly rejectedExplanations: NonEmptyReadonlyArray<RejectedActionAuditExplanation> })
  | (EvidenceDecisionAuditBase & { readonly suppressedExplanations: NonEmptyReadonlyArray<SuppressedActionAuditExplanation> })
  | (EvidenceDecisionAuditBase & { readonly deferredExplanations: NonEmptyReadonlyArray<DeferredActionAuditExplanation> });
