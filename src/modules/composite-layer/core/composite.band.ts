/**
 * CompositeBand defines score ranges and severity classifications
 * Deterministic mapping from numerical score to categorical band
 */
export interface CompositeBand {
  /**
   * Label for this band (VERY_LOW, LOW, MODERATE, HIGH, CRITICAL)
   */
  label: string;

  /**
   * Minimum score (inclusive) for this band
   */
  min: number;

  /**
   * Maximum score (exclusive) for this band
   */
  max: number;

  /**
   * Severity ranking (1=least severe, 5=most severe)
   * Used for cross-system comparisons
   */
  severityRank: number;

  /**
   * Human-readable description of this band
   */
  description?: string;
}

/**
 * Standard composite bands with deterministic cutoff points
 */
export const CompositeBands: CompositeBand[] = [
  {
    label: 'VERY_LOW',
    min: 0.0,
    max: 0.2,
    severityRank: 1,
    description: 'Excellent condition, minimal risk',
  },
  {
    label: 'LOW',
    min: 0.2,
    max: 0.4,
    severityRank: 2,
    description: 'Good condition, low risk',
  },
  {
    label: 'MODERATE',
    min: 0.4,
    max: 0.6,
    severityRank: 3,
    description: 'Fair condition, moderate risk',
  },
  {
    label: 'HIGH',
    min: 0.6,
    max: 0.8,
    severityRank: 4,
    description: 'Poor condition, elevated risk',
  },
  {
    label: 'CRITICAL',
    min: 0.8,
    max: 1.0,
    severityRank: 5,
    description: 'Very poor condition, severe risk',
  },
];

/**
 * Resolve score to aggregate band
 * Deterministic: same input always produces same output
 *
 * @param score - Normalized score (0.0 - 1.0)
 * @returns Band that this score falls into, or undefined if no match
 */
export function resolveCompositeBand(score: number): CompositeBand | undefined {
  // Handle edge case: score of exactly 1.0 should fall into CRITICAL band
  if (score === 1.0) {
    return CompositeBands[CompositeBands.length - 1]; // CRITICAL
  }

  return CompositeBands.find((band) => score >= band.min && score < band.max);
}
