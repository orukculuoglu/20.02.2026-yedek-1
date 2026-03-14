/**
 * IndexFactor represents a single factor contributing to the final index score.
 * Enables detailed explainability of what drove the score.
 */
export interface IndexFactor {
  /**
   * Unique identifier for this factor
   */
  factorId: string;

  /**
   * Human-readable label for this factor
   */
  label: string;

  /**
   * The raw, un-normalized value of this factor
   */
  rawValue: number | string | boolean;

  /**
   * The normalized value (typically 0.0 - 1.0, or as-is for composite factors)
   */
  normalizedValue: number;

  /**
   * Weight given to this factor in the overall calculation (0.0 - 1.0)
   * Higher weight = more important for final score
   */
  weight: number;

  /**
   * The actual contribution of this factor to the final score
   * Calculated as: normalizedValue * weight
   */
  contribution: number;

  /**
   * Confidence in this factor (0.0 - 1.0)
   * Indicates data quality or reliability
   */
  confidence: number;

  /**
   * References to evidence pieces supporting this factor
   */
  evidenceRefIds?: string[];

  /**
   * Optional: Classification or category of this factor
   */
  category?: string;
}
