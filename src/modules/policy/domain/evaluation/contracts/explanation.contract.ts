import type { ExplanationCode } from "./explanation-code.enum.js";

/**
 * Explanation - Structural explanation contract for evaluation results
 * Pure reference structure with no runtime messaging, localization, or text generation.
 * Carries an explanation code and a reference key for external consumption.
 */
export interface Explanation {
  /**
   * Classification code explaining the structural category of this evaluation result
   */
  readonly explanationCode: ExplanationCode;

  /**
   * Message key reference for external consumption
   * References a bounded message key that may be used by consumption layers for rendering.
   * No message formatting, parameter substitution, or localization logic included.
   */
  readonly messageKeyReference: string;
}
