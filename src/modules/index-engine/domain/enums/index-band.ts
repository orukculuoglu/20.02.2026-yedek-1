/**
 * Index Band represents the classification range of an index score.
 * Bands are deterministic ranges based on the numerical score (0.0 - 1.0).
 * 
 * - CRITICAL: Score 0.0-0.2 (severe issue, immediate action required)
 * - HIGH: Score 0.2-0.4 (significant issue, urgent attention needed)
 * - MEDIUM: Score 0.4-0.7 (moderate issue, planned action recommended)
 * - LOW: Score 0.7-0.9 (minor issue, monitor and address as convenient)
 * - OPTIMAL: Score 0.9-1.0 (excellent condition, maintain current state)
 */
export enum IndexBand {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  OPTIMAL = 'OPTIMAL',
}

/**
 * Deterministic function to calculate IndexBand from a numerical score.
 * Score must be between 0.0 and 1.0.
 * 
 * @param score - The numerical index score (0.0-1.0)
 * @returns The corresponding IndexBand
 */
export function calculateIndexBand(score: number): IndexBand {
  if (score < 0.2) return IndexBand.CRITICAL;
  if (score < 0.4) return IndexBand.HIGH;
  if (score < 0.7) return IndexBand.MEDIUM;
  if (score < 0.9) return IndexBand.LOW;
  return IndexBand.OPTIMAL;
}
