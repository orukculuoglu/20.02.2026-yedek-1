import { IndexType } from '../../enums/index-type';
import { IndexInput } from '../../input/schemas/index-input';

/**
 * WeightingProfile defines how factors should be weighted in a calculation.
 * Allows different weighting strategies per index type.
 */
export interface WeightingProfile {
  /**
   * Profile identifier
   */
  profileId: string;

  /**
   * Named weights for different factor categories
   * Example: { 'reliability': 0.4, 'recency': 0.3, 'coverage': 0.3 }
   */
  weights: Record<string, number>;

  /**
   * Optional: Confidence multiplier for low-confidence data
   * If data confidence < threshold, apply this multiplier to the factor weight
   */
  lowConfidenceMultiplier?: number;
}

/**
 * IndexCalculationRequest is the input to a calculation.
 * Contains all information needed to calculate an index score.
 */
export interface IndexCalculationRequest {
  /**
   * The type of index to calculate
   */
  indexType: IndexType;

  /**
   * The prepared input data from the Index Engine input layer
   */
  input: IndexInput;

  /**
   * Optional: Calculation context (e.g., 'daily', 'alert-driven', 'batch')
   */
  calculationContext?: string;

  /**
   * Optional: Weighting profile to use for this calculation
   * If not provided, default weighting for indexType will be used
   */
  weightingProfile?: WeightingProfile;

  /**
   * ISO 8601 timestamp when this request was made
   */
  requestedAt: Date;

  /**
   * Optional: Metadata or additional context
   */
  metadata?: Record<string, unknown>;
}
