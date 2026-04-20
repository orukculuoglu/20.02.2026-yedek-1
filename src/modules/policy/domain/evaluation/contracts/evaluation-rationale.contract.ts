import type { EvaluationRationaleCode } from "./evaluation-rationale-code.enum.js";

/**
 * EvaluationRationale - Structural rationale reference for evaluation outcomes
 * Pure reference structure with no runtime justification logic or narrative generation.
 * Carries a rationale code and reference IDs linking to related structural definitions.
 */
export interface EvaluationRationale {
  /**
   * Classification code explaining why this rationale applies
   */
  readonly rationaleCode: EvaluationRationaleCode;

  /**
   * Reference identifier to the rule that contributed to this rationale outcome
   * Optional; present only when rationale is rule-specific
   */
  readonly ruleReferenceId?: string;

  /**
   * Reference identifier to the threshold that contributed to this rationale outcome
   * Optional; present only when rationale is threshold-specific
   */
  readonly thresholdReferenceId?: string;

  /**
   * Reference identifier to the approval boundary that contributed to this rationale outcome
   * Optional; present only when rationale is boundary-specific
   */
  readonly approvalBoundaryReferenceId?: string;

  /**
   * Reference identifier to evidence that was evaluated or found missing
   * Optional; present only when rationale is evidence-specific
   */
  readonly evidenceReferenceId?: string;
}
