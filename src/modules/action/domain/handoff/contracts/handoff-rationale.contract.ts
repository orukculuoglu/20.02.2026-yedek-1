import type { HandoffRationaleCode } from "./handoff-rationale-code.enum.js";

/**
 * HandoffRationale - Structural rationale reference for execution boundary handoff outcomes
 * Pure reference structure with no execution logic or dispatch algorithms.
 * Carries a rationale code and optional reference IDs linking to source structures.
 */
export interface HandoffRationale {
  /**
   * Classification code explaining why this action is in its current handoff state
   */
  readonly rationaleCode: HandoffRationaleCode;

  /**
   * Optional reference identifier to the selected action
   */
  readonly selectedActionId?: string;

  /**
   * Optional reference identifier to an approval boundary
   */
  readonly approvalBoundaryId?: string;

  /**
   * Optional reference identifier to a blocking constraint
   */
  readonly blockingConstraintId?: string;
}
