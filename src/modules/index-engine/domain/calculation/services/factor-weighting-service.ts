import { IndexFactor } from '../schemas/index-factor';
import { WeightingProfile } from '../schemas/index-calculation-request';

/**
 * FactorWeightingService handles weighting and contribution calculation of factors.
 * Deterministically applies weights to normalized factors.
 */
export class FactorWeightingService {
  /**
   * Calculates total weighted score from factors and applies profile weights.
   * 
   * @param factors - Array of factors with normalized values
   * @param profile - Weighting profile defining factor weights
   * @returns Weighted score (sum of contributions)
   */
  static calculateWeightedScore(factors: IndexFactor[], profile: WeightingProfile): number {
    if (factors.length === 0) {
      return 0.5; // Default neutral score
    }

    let totalContribution = 0;
    let totalWeight = 0;

    for (const factor of factors) {
      const factorWeight = this.getFactorWeight(factor, profile);
      const contribution = factor.normalizedValue * factorWeight;
      
      totalContribution += contribution;
      totalWeight += factorWeight;

      // Update factor with calculated contribution
      factor.weight = factorWeight;
      factor.contribution = contribution;
    }

    // Normalize by total weight to maintain 0-1 range
    if (totalWeight === 0) {
      return 0.5;
    }

    return totalContribution / totalWeight;
  }

  /**
   * Gets the effective weight for a factor, considering confidence multipliers.
   * 
   * @param factor - The factor to weight
   * @param profile - Weighting profile
   * @returns Effective weight for this factor
   */
  private static getFactorWeight(factor: IndexFactor, profile: WeightingProfile): number {
    // Get base weight from profile by category or default
    let weight = profile.weights[factor.category || 'default'] ?? 
                 profile.weights['default'] ?? 
                 0.5;

    // Apply confidence multiplier if confidence is low
    if (profile.lowConfidenceMultiplier !== undefined && factor.confidence < 0.7) {
      weight *= profile.lowConfidenceMultiplier;
    }

    return Math.max(0, Math.min(1, weight)); // Clamp to 0-1
  }

  /**
   * Normalizes weights so they sum to 1.0 (if all categories present)
   */
  static normalizeWeights(weights: Record<string, number>): Record<string, number> {
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    if (total === 0) {
      return weights;
    }

    const normalized: Record<string, number> = {};
    for (const [key, value] of Object.entries(weights)) {
      normalized[key] = value / total;
    }
    return normalized;
  }
}
