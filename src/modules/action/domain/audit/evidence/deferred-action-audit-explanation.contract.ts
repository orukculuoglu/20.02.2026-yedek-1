import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * DeferredActionAuditExplanation - Structural explanation for deferred actions
 * References decision rationale, evidence, and action identity
 */
export interface DeferredActionAuditExplanation {
  readonly candidateActionId: string;
  readonly decisionRationaleIds: NonEmptyReadonlyArray<string>;
  readonly evidenceReferenceIds?: NonEmptyReadonlyArray<string>;
}
