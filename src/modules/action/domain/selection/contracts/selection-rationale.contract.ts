import type { SelectionRationaleCode } from "./selection-rationale-code.enum.js";

/**
 * SelectionRationale - Structural rationale reference for final action selection outcomes
 * Pure reference structure with no selection logic or decision algorithms.
 * Carries a rationale code and optional reference IDs linking to source structures.
 */
export interface SelectionRationale {
  /**
   * Classification code explaining why this action was selected/rejected/suppressed/deferred
   */
  readonly rationaleCode: SelectionRationaleCode;

  /**
   * Optional reference identifier to the policy that contributed to this selection outcome
   */
  readonly policyReferenceId?: string;

  /**
   * Optional reference identifier to the candidate action this rationale applies to
   */
  readonly candidateReferenceId?: string;

  /**
   * Optional reference identifier to a conflicting candidate (used for suppression rationale)
   */
  readonly conflictingCandidateId?: string;
}
