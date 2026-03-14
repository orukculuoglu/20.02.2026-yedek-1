import { IndexInputSnapshot } from './schemas/index-input-snapshot';

/**
 * Validates IndexInputSnapshot contracts.
 */
export class IndexInputSnapshotValidator {
  /**
   * Validates a complete IndexInputSnapshot object.
   * 
   * @param snapshot - The IndexInputSnapshot to validate
   * @throws Error with detailed validation failure message
   */
  static validate(snapshot: IndexInputSnapshot): void {
    this.validateSnapshotId(snapshot.snapshotId);
    this.validateCapturedAt(snapshot.capturedAt);
    this.validateFreshnessSeconds(snapshot.freshnessSeconds);
    this.validateTemporalCoverage(snapshot.temporalCoverage);
    this.validateMissingDataFlags(snapshot.missingDataFlags);
    this.validateOptionalFields(snapshot);
  }

  private static validateSnapshotId(snapshotId: string): void {
    if (!snapshotId || typeof snapshotId !== 'string') {
      throw new Error('IndexInputSnapshot.snapshotId must be a non-empty string');
    }
  }

  private static validateCapturedAt(capturedAt: Date): void {
    if (!(capturedAt instanceof Date) || isNaN(capturedAt.getTime())) {
      throw new Error('IndexInputSnapshot.capturedAt must be a valid Date');
    }
  }

  private static validateFreshnessSeconds(freshnessSeconds: number): void {
    if (typeof freshnessSeconds !== 'number' || freshnessSeconds < 0) {
      throw new Error('IndexInputSnapshot.freshnessSeconds must be a non-negative number');
    }
  }

  private static validateTemporalCoverage(temporalCoverage: string): void {
    if (typeof temporalCoverage !== 'string' || !temporalCoverage.trim()) {
      throw new Error('IndexInputSnapshot.temporalCoverage must be a non-empty string');
    }
  }

  private static validateMissingDataFlags(flags: string[]): void {
    if (!Array.isArray(flags)) {
      throw new Error('IndexInputSnapshot.missingDataFlags must be an array');
    }
    flags.forEach((flag, index) => {
      if (typeof flag !== 'string' || !flag.trim()) {
        throw new Error(`IndexInputSnapshot.missingDataFlags[${index}] must be a non-empty string`);
      }
    });
  }

  private static validateOptionalFields(snapshot: IndexInputSnapshot): void {
    if (snapshot.totalDataPoints !== undefined && typeof snapshot.totalDataPoints !== 'number') {
      throw new Error('IndexInputSnapshot.totalDataPoints must be a number');
    }

    if (snapshot.dataCompletenessPercent !== undefined) {
      if (typeof snapshot.dataCompletenessPercent !== 'number') {
        throw new Error('IndexInputSnapshot.dataCompletenessPercent must be a number');
      }
      if (snapshot.dataCompletenessPercent < 0 || snapshot.dataCompletenessPercent > 100) {
        throw new Error('IndexInputSnapshot.dataCompletenessPercent must be between 0 and 100');
      }
    }
  }
}
