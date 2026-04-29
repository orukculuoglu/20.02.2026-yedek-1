import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * AuditExplanationView - Consumption view for audit explanations
 * Reference-only: no narrative generation or UI formatting
 */
export interface AuditExplanationView {
  readonly explanationReferenceId: string;
  readonly decisionRationaleIds?: NonEmptyReadonlyArray<string>;
  readonly evidenceReferenceIds?: NonEmptyReadonlyArray<string>;
}
