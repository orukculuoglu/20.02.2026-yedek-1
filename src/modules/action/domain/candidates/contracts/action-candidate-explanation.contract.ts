import type { ActionCandidateExplanationCode } from "./action-candidate-explanation-code.enum.js";

/**
 * ActionCandidateExplanation - Structural explanation contract for action candidates
 * Pure reference structure with no runtime messaging, localization, or text generation.
 * Carries an explanation code and a reference key for external consumption.
 */
export interface ActionCandidateExplanation {
  /**
   * Classification code explaining the structural category of this candidate action
   */
  readonly explanationCode: ActionCandidateExplanationCode;

  /**
   * Message key reference for external consumption
   * References a bounded message key that may be used by consumption layers for rendering.
   * No message formatting, parameter substitution, or localization logic included.
   */
  readonly messageKeyReference: string;
}
