/**
 * IndexExplanation provides human-readable and machine-readable interpretation
 * of an IndexRecord score, band, and key contributing factors.
 */
export interface IndexExplanation {
  /**
   * Human-readable summary of the index findings
   */
  summary: string;

  /**
   * Primary factors contributing positively to the score
   */
  positiveFactors: string[];

  /**
   * Primary factors contributing negatively to the score
   */
  negativeFactors: string[];

  /**
   * Recommended actions based on the index band
   */
  recommendedActions: string[];

  /**
   * Contextual comparison (e.g., "compared to fleet average", "compared to baseline")
   */
  comparison?: string;

  /**
   * Trend information (e.g., "improving", "stable", "degrading")
   */
  trend?: string;

  /**
   * Next review date recommendation
   */
  nextReviewDate?: Date;
}
