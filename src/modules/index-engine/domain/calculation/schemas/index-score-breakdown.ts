/**
 * IndexScoreBreakdown provides detailed tracing of score calculation steps.
 * Shows the path from raw factors through normalization to final score.
 */
export interface IndexScoreBreakdown {
  /**
   * Base score before any adjustments
   * Typically the weighted sum of normalized factors
   */
  baseScore: number;

  /**
   * Score after factor weighting is applied
   * Intermediate step in calculation
   */
  weightedScore: number;

  /**
   * Total penalty applied to the score
   * Sum of all individual penalties
   */
  penaltyScore: number;

  /**
   * Final score after all adjustments
   * This is the normalized score (0.0 - 1.0) delivered to the output
   */
  finalScore: number;

  /**
   * Whether normalization was applied in this calculation
   */
  normalizationApplied: boolean;

  /**
   * Optional: Details about normalization if applied
   */
  normalizationDetails?: {
    strategy: string;
    minValue: number;
    maxValue: number;
  };
}
