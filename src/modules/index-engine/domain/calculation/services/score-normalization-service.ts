import { NormalizationStrategy } from '../enums/normalization-strategy';
import { IndexNormalizationRule } from '../schemas/index-normalization-rule';

/**
 * ScoreNormalizationService provides deterministic score normalization.
 * Converts raw scores to the standard 0.0-1.0 range using various strategies.
 */
export class ScoreNormalizationService {
  /**
   * Normalizes a raw score using the specified rule and strategy.
   * 
   * @param rawScore - The un-normalized score
   * @param rule - Normalization rule defining the strategy and bounds
   * @returns Normalized score (typically 0.0-1.0 if clamped)
   */
  static normalize(rawScore: number, rule: IndexNormalizationRule): number {
    let normalized: number;

    switch (rule.normalizationStrategy) {
      case NormalizationStrategy.LINEAR:
        normalized = this.normalizeLinear(rawScore, rule.minValue, rule.maxValue);
        break;
      case NormalizationStrategy.SIGMOID:
        normalized = this.normalizeSigmoid(rawScore, rule);
        break;
      case NormalizationStrategy.LOG:
        normalized = this.normalizeLog(rawScore, rule.minValue, rule.maxValue);
        break;
      case NormalizationStrategy.PERCENTILE:
        normalized = this.normalizePercentile(rawScore, rule);
        break;
      case NormalizationStrategy.BOUNDED:
        normalized = this.normalizeBounded(rawScore, rule.minValue, rule.maxValue);
        break;
      default:
        throw new Error(`Unknown normalization strategy: ${rule.normalizationStrategy}`);
    }

    if (rule.clamp) {
      return Math.max(0.0, Math.min(1.0, normalized));
    }

    return normalized;
  }

  /**
   * Linear normalization: maps [min, max] to [0, 1]
   */
  private static normalizeLinear(value: number, min: number, max: number): number {
    if (min === max) return 0.5;
    return (value - min) / (max - min);
  }

  /**
   * Sigmoid normalization: S-curve mapping
   * Maps value to smooth curve from 0 to 1
   */
  private static normalizeSigmoid(value: number, rule: IndexNormalizationRule): number {
    const sigmoid = rule.sigmoid || { midpoint: (rule.minValue + rule.maxValue) / 2, steepness: 1 };
    const scaled = (value - sigmoid.midpoint) * sigmoid.steepness;
    return 1 / (1 + Math.exp(-scaled));
  }

  /**
   * Logarithmic normalization: for exponential distributions
   * Maps [min, max] using log scale
   */
  private static normalizeLog(value: number, min: number, max: number): number {
    if (min <= 0 || max <= 0) {
      throw new Error('Log normalization requires positive min/max values');
    }
    const logMin = Math.log(min);
    const logMax = Math.log(max);
    const logValue = Math.log(Math.max(min, value));
    return (logValue - logMin) / (logMax - logMin);
  }

  /**
   * Percentile normalization: maps value based on percentile reference data
   */
  private static normalizePercentile(value: number, rule: IndexNormalizationRule): number {
    if (!rule.percentileRef) {
      throw new Error('Percentile normalization requires percentileRef data');
    }

    const ref = rule.percentileRef;

    if (value <= ref.p10) return 0.1;
    if (value <= ref.p25) return 0.25 - 0.15 * ((ref.p25 - value) / (ref.p25 - ref.p10));
    if (value <= ref.p50) return 0.5 - 0.25 * ((ref.p50 - value) / (ref.p50 - ref.p25));
    if (value <= ref.p75) return 0.75 - 0.25 * ((ref.p75 - value) / (ref.p75 - ref.p50));
    if (value <= ref.p90) return 0.9 - 0.15 * ((ref.p90 - value) / (ref.p90 - ref.p75));

    return 1.0;
  }

  /**
   * Bounded normalization: linear with strict clamping
   * Ensures score stays within bounds
   */
  private static normalizeBounded(value: number, min: number, max: number): number {
    const linear = this.normalizeLinear(value, min, max);
    return Math.max(0.0, Math.min(1.0, linear));
  }
}
