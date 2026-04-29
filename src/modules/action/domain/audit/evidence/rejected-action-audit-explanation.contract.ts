import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * RejectedActionAuditExplanation - Structural explanation for rejected actions
 * References decision rationale, evidence, and action identity
 */
export interface RejectedActionAuditExplanation {
  readonly candidateActionId: string;
  readonly decisionRationaleIds: NonEmptyReadonlyArray<string>;
  readonly evidenceReferenceIds?: NonEmptyReadonlyArray<string>;
}
