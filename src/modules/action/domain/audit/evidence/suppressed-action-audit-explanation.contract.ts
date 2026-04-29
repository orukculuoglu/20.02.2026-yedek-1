import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * SuppressedActionAuditExplanation - Structural explanation for suppressed actions
 * References decision rationale, evidence, and action identity
 */
export interface SuppressedActionAuditExplanation {
  readonly candidateActionId: string;
  readonly decisionRationaleIds: NonEmptyReadonlyArray<string>;
  readonly evidenceReferenceIds?: NonEmptyReadonlyArray<string>;
}
