import type { ActionCandidateRationaleCode } from "./action-candidate-rationale-code.enum.js";

/**
 * ActionCandidateRationale - Structural rationale reference for action candidates
 * Pure reference structure with no decision logic or narrative generation.
 * Carries a rationale code and reference IDs linking to related structural definitions.
 */
export interface ActionCandidateRationale {
  /**
   * Classification code explaining why this candidate action exists
   */
  readonly rationaleCode: ActionCandidateRationaleCode;

  /**
   * Reference identifier to the policy that contributed to this rationale
   * Optional; present when rationale is policy-specific
   */
  readonly policyReferenceId?: string;

  /**
   * Reference identifier to the rule that contributed to this rationale
   * Optional; present when rationale is rule-specific
   */
  readonly ruleReferenceId?: string;

  /**
   * Reference identifier to the policy evaluation that contributed to this rationale
   * Optional; present when rationale is evaluation-specific
   */
  readonly evaluationReferenceId?: string;

  /**
   * Reference identifier to the threshold that contributed to this rationale
   * Optional; present when rationale is threshold-specific
   */
  readonly thresholdReferenceId?: string;

  /**
   * Reference identifier to the approval boundary that contributed to this rationale
   * Optional; present when rationale is boundary-specific
   */
  readonly approvalBoundaryReferenceId?: string;
}
