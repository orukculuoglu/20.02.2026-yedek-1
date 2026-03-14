import { IndexBand, calculateIndexBand } from '../../enums/index-band';

/**
 * BandDerivationService deterministically derives IndexBand from score.
 * Ensures consistency between score and band classification.
 */
export class BandDerivationService {
  /**
   * Derives the proper band for a normalized score.
   * Uses the same function as phase 1 for consistency.
   * 
   * @param score - Normalized score (0.0-1.0)
   * @returns The corresponding IndexBand
   */
  static deriveBand(score: number): IndexBand {
    return calculateIndexBand(score);
  }

  /**
   * Validates that band matches score.
   * Throws error if mismatch detected.
   * 
   * @param score - Normalized score
   * @param band - Claimed band
   * @throws Error if mismatch
   */
  static validateBandConsistency(score: number, band: IndexBand): void {
    const expectedBand = this.deriveBand(score);
    if (band !== expectedBand) {
      throw new Error(`Band ${band} is inconsistent with score ${score}. Expected: ${expectedBand}`);
    }
  }

  /**
   * Gets band boundaries for a specific band.
   * 
   * @param band - The band to get boundaries for
   * @returns Min and max score for band
   */
  static getBandBoundaries(band: IndexBand): { min: number; max: number } {
    switch (band) {
      case IndexBand.CRITICAL:
        return { min: 0.0, max: 0.2 };
      case IndexBand.HIGH:
        return { min: 0.2, max: 0.4 };
      case IndexBand.MEDIUM:
        return { min: 0.4, max: 0.7 };
      case IndexBand.LOW:
        return { min: 0.7, max: 0.9 };
      case IndexBand.OPTIMAL:
        return { min: 0.9, max: 1.0 };
      default:
        throw new Error(`Unknown band: ${band}`);
    }
  }

  /**
   * Gets the midpoint score for a band.
   * Useful for visualization or defaults.
   * 
   * @param band - The band
   * @returns Midpoint score
   */
  static getBandMidpoint(band: IndexBand): number {
    const bounds = this.getBandBoundaries(band);
    return (bounds.min + bounds.max) / 2;
  }
}
