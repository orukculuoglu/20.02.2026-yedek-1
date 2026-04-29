import type { OutcomeRationaleCode } from "./outcome-rationale-code.enum.js";

/**
 * OutcomeRationale - Structural rationale reference for action outcomes
 * Pure reference structure with no outcome generation or tracking logic.
 * Carries a rationale code and optional reference IDs linking to source structures.
 */
export interface OutcomeRationale {
  /**
   * Classification code explaining why this outcome occurred
   */
  readonly rationaleCode: OutcomeRationaleCode;

  /**
   * Optional reference identifier to the selected action
   */
  readonly selectedActionId?: string;

  /**
   * Optional reference identifier to the handoff
   */
  readonly handoffId?: string;

  /**
   * Optional reference identifier to constraint or context
   */
  readonly contextReferenceId?: string;
}
