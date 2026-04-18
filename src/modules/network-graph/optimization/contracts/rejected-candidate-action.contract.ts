/**
 * Rejected Candidate Action Contract
 * Defines a candidate action that is not carried forward.
 * Structural-only: no execution, no implicit rejection reasoning.
 * Links back to source candidate action.
 * Rejection reason is explicitly bounded (not implicit inference).
 */

import type { ActionCategory } from "./optimization-action-category";
import type { RejectionKind } from "./optimization-action-separation-kind";

/**
 * RejectedCandidateAction
 * Represents a candidate action that has been rejected and not carried forward.
 * Rejection kind is explicitly bounded - caller provides explicit reason.
 * Structural-only: no implicit policy override or hidden rejection logic.
 */
export interface RejectedCandidateAction {
  /** Unique identifier for this rejected action state (caller-provided) */
  readonly rejectedActionId: string;

  /** Reference to source candidate action (caller-provided) */
  readonly sourceCandidateActionId: string;

  /** Category inherited from source candidate (caller-provided, bounded to ActionCategory) */
  readonly category: ActionCategory;

  /** Explicit rejection reason - caller must specify why rejected (caller-provided, bounded) */
  readonly rejectionKind: RejectionKind;
}

/**
 * Rejected candidate action behavior:
 * - Structural-only: candidate has been rejected and not carried forward
 * - Maintains link to source candidate for traceability
 * - Rejection reason is explicitly bounded (caller provides RejectionKind)
 * - No implicit inference of rejection cause
 * - No hidden policy override semantics
 * - All values are caller-provided; no generation or inference
 */
