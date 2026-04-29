import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * SelectedActionAuditExplanation - Structural explanation for selected actions
 * References decision rationale, evidence, and action identity
 */
export interface SelectedActionAuditExplanation {
  readonly selectedActionId: string;
  readonly candidateActionId: string;
  readonly decisionRationaleIds: NonEmptyReadonlyArray<string>;
  readonly evidenceReferenceIds?: NonEmptyReadonlyArray<string>;
}
