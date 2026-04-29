import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * EvidenceDecisionAuditView - Consumption view for evidence / decision audit
 * Reference-only: no evidence resolution or narrative generation
 */
export interface EvidenceDecisionAuditView {
  readonly evidenceDecisionAuditReferenceId: string;
  readonly evidenceReferenceIds?: NonEmptyReadonlyArray<string>;
  readonly decisionRationaleIds?: NonEmptyReadonlyArray<string>;
  readonly explanationReferenceIds?: NonEmptyReadonlyArray<string>;
}
