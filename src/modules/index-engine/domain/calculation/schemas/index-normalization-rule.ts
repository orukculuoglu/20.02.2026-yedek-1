import { NormalizationStrategy } from '../enums/normalization-strategy';

/**
 * IndexNormalizationRule defines how raw scores are normalized to standard range.
 * Enables different normalization strategies for different calculation contexts.
 */
export interface IndexNormalizationRule {
  /**
   * Minimum raw value in the expected input range
   */
  minValue: number;

  /**
   * Maximum raw value in the expected input range
   */
  maxValue: number;

  /**
   * Strategy to use for normalization
   */
  normalizationStrategy: NormalizationStrategy;

  /**
   * If true, clamp normalized score to [0.0, 1.0] range
   * If false, allow values outside this range (for composite calculations)
   */
  clamp: boolean;

  /**
   * Optional: Target value for sigmoid normalization (inflection point)
   * Used with SIGMOID strategy
   */
  sigmoid?: {
    midpoint: number;
    steepness: number;
  };

  /**
   * Optional: Reference percentile data for PERCENTILE strategy
   * Maps percentile rank to normalized score
   */
  percentileRef?: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
}
