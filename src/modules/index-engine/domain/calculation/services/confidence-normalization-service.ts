/**
 * ConfidenceNormalizationService handles confidence score derivation.
 * Combines multiple confidence inputs into a composite confidence score.
 */
export class ConfidenceNormalizationService {
  /**
   * Derives overall confidence from multiple input signals.
   * Uses weighted combination of confidence factors.
   * 
   * @param inputConfidence - Confidence from input data (0.0-1.0)
   * @param dataQualityScore - Data quality score from input (0.0-1.0)
   * @param factorConfidences - Array of factor confidences
   * @param penaltyCount - Number of penalties applied (reduces confidence)
   * @returns Composite confidence score (0.0-1.0)
   */
  static deriveConfidence(
    inputConfidence: number,
    dataQualityScore: number,
    factorConfidences: number[],
    penaltyCount: number = 0
  ): number {
    // Average factor confidences
    const avgFactorConfidence = factorConfidences.length > 0
      ? factorConfidences.reduce((sum, c) => sum + c, 0) / factorConfidences.length
      : 0.7;

    // Penalty reduction: each penalty reduces confidence by ~0.05
    const penaltyReduction = Math.min(0.3, penaltyCount * 0.05);

    // Weighted combination
    let confidence = 
      (inputConfidence * 0.25) +
      (dataQualityScore * 0.35) +
      (avgFactorConfidence * 0.40);

    // Apply penalty reduction
    confidence = confidence * (1 - penaltyReduction);

    // Clamp to valid range
    return Math.max(0.0, Math.min(1.0, confidence));
  }

  /**
   * Adjusts confidence based on data freshness.
   * Older data = lower confidence
   * 
   * @param baseConfidence - Starting confidence
   * @param freshnessSeconds - Seconds since data was fresh
   * @param halfLifeSeconds - Seconds until confidence drops to 50% (default 86400 = 1 day)
   * @returns Adjusted confidence
   */
  static adjustForFreshness(
    baseConfidence: number,
    freshnessSeconds: number,
    halfLifeSeconds: number = 86400
  ): number {
    // Exponential decay: confidence = baseConfidence * 0.5^(freshnessSeconds / halfLifeSeconds)
    const decayFactor = Math.pow(0.5, freshnessSeconds / halfLifeSeconds);
    const adjusted = baseConfidence * decayFactor;

    return Math.max(0.0, Math.min(1.0, adjusted));
  }

  /**
   * Adjusts confidence based on data completeness.
   * Missing data = lower confidence
   * 
   * @param baseConfidence - Starting confidence
   * @param completenessPercent - Data completeness 0-100
   * @returns Adjusted confidence
   */
  static adjustForCompleteness(baseConfidence: number, completenessPercent: number): number {
    // Linear adjustment: if 80% complete, multiply by 0.8
    const completeness = Math.max(0, Math.min(100, completenessPercent)) / 100;
    return baseConfidence * completeness;
  }
}
