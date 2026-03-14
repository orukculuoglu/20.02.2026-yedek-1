import { IndexExplanation } from './schemas/index-explanation';

/**
 * Validates IndexExplanation contracts.
 */
export class IndexExplanationValidator {
  /**
   * Validates a complete IndexExplanation object.
   * 
   * @param explanation - The IndexExplanation to validate
   * @throws Error with detailed validation failure message
   */
  static validate(explanation: IndexExplanation): void {
    this.validateSummary(explanation.summary);
    this.validatePositiveFactors(explanation.positiveFactors);
    this.validateNegativeFactors(explanation.negativeFactors);
    this.validateRecommendedActions(explanation.recommendedActions);
    this.validateOptionalFields(explanation);
  }

  private static validateSummary(summary: string): void {
    if (typeof summary !== 'string' || !summary.trim()) {
      throw new Error('IndexExplanation.summary must be a non-empty string');
    }
  }

  private static validatePositiveFactors(factors: string[]): void {
    if (!Array.isArray(factors)) {
      throw new Error('IndexExplanation.positiveFactors must be an array');
    }
    if (factors.length === 0) {
      throw new Error('IndexExplanation.positiveFactors must contain at least one factor');
    }
    factors.forEach((factor, index) => {
      if (typeof factor !== 'string' || !factor.trim()) {
        throw new Error(`IndexExplanation.positiveFactors[${index}] must be a non-empty string`);
      }
    });
  }

  private static validateNegativeFactors(factors: string[]): void {
    if (!Array.isArray(factors)) {
      throw new Error('IndexExplanation.negativeFactors must be an array');
    }
    if (factors.length === 0) {
      throw new Error('IndexExplanation.negativeFactors must contain at least one factor');
    }
    factors.forEach((factor, index) => {
      if (typeof factor !== 'string' || !factor.trim()) {
        throw new Error(`IndexExplanation.negativeFactors[${index}] must be a non-empty string`);
      }
    });
  }

  private static validateRecommendedActions(actions: string[]): void {
    if (!Array.isArray(actions)) {
      throw new Error('IndexExplanation.recommendedActions must be an array');
    }
    if (actions.length === 0) {
      throw new Error('IndexExplanation.recommendedActions must contain at least one action');
    }
    actions.forEach((action, index) => {
      if (typeof action !== 'string' || !action.trim()) {
        throw new Error(`IndexExplanation.recommendedActions[${index}] must be a non-empty string`);
      }
    });
  }

  private static validateOptionalFields(explanation: IndexExplanation): void {
    if (explanation.nextReviewDate !== undefined) {
      if (!(explanation.nextReviewDate instanceof Date) || isNaN(explanation.nextReviewDate.getTime())) {
        throw new Error('IndexExplanation.nextReviewDate must be a valid Date');
      }
    }
  }
}
