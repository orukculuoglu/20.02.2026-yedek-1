/**
 * IndexPenalty represents a penalty applied to a score based on negative factors.
 * Enables transparent explanation of score reductions.
 */
export interface IndexPenalty {
  /**
   * The type of penalty being applied
   */
  penaltyType: string;

  /**
   * Human-readable label for this penalty
   */
  label: string;

  /**
   * The penalty value to reduce the score (0.0 - 1.0)
   * Subtracted from the score or applied as reduction factor
   */
  penaltyValue: number;

  /**
   * Explanation of why this penalty was applied
   */
  reason: string;

  /**
   * References to evidence supporting this penalty
   */
  evidenceRefIds?: string[];
}
