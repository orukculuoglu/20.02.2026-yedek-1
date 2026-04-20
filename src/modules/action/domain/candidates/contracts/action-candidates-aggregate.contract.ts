import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";
import type { ActionCandidate } from "./action-candidate.contract.js";

/**
 * ActionCandidatesAggregate - Structural aggregation of action candidates
 * Pure structural aggregation with no ranking, scoring, or selection logic.
 * Structurally enforced: must contain at least one candidate.
 * An empty candidates aggregate is impossible at the type level.
 */
export interface ActionCandidatesAggregate {
  /**
   * Collection of action candidates
   * Required: at least one candidate must be present
   */
  readonly candidates: NonEmptyReadonlyArray<ActionCandidate>;
}
