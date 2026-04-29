import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";

/**
 * EvidenceDecisionLinkage - Two-sided evidence-decision linkage
 * Requires both evidence and decision rationale references to be non-empty.
 */
export interface EvidenceDecisionLinkage {
  readonly linkageId: string;
  readonly evidenceReferenceIds: NonEmptyReadonlyArray<string>;
  readonly decisionRationaleIds: NonEmptyReadonlyArray<string>;
}
