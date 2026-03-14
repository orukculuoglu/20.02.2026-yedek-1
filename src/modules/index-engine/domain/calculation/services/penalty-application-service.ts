import { IndexPenalty } from '../schemas/index-penalty';
import { PenaltyType } from '../enums/penalty-type';
import { IndexInput } from '../../input/schemas/index-input';

/**
 * PenaltyApplicationService applies penalties to scores based on data issues.
 * Provides deterministic penalty calculation and application.
 */
export class PenaltyApplicationService {
  /**
   * Evaluates an input and applies appropriate penalties.
   * 
   * @param input - The IndexInput to evaluate
   * @returns Array of penalties to apply
   */
  static evaluatePenalties(input: IndexInput): IndexPenalty[] {
    const penalties: IndexPenalty[] = [];

    // Check for missing data
    if (input.eventCount === 0) {
      penalties.push({
        penaltyType: PenaltyType.MISSING_DATA,
        label: 'No events recorded',
        penaltyValue: 0.5,
        reason: 'Input contains zero events, indicating missing or no data',
      });
    }

    // Check for stale data
    if (input.snapshot.stale) {
      penalties.push({
        penaltyType: PenaltyType.STALE_DATA,
        label: 'Data is stale',
        penaltyValue: 0.15,
        reason: `Data older than freshness threshold (freshnessSeconds: ${input.snapshot.freshnessSeconds})`,
      });
    }

    // Check for low confidence
    if (input.snapshot.dataCompletenessPercent !== undefined && input.snapshot.dataCompletenessPercent < 60) {
      penalties.push({
        penaltyType: PenaltyType.LOW_CONFIDENCE,
        label: 'Low data completeness',
        penaltyValue: 0.2,
        reason: `Data completeness only ${input.snapshot.dataCompletenessPercent}% (threshold: 60%)`,
      });
    }

    // Check for incomplete evidence
    if (input.evidence.length < 3) {
      penalties.push({
        penaltyType: PenaltyType.INCOMPLETE_EVIDENCE,
        label: 'Insufficient evidence pieces',
        penaltyValue: 0.1,
        reason: `Only ${input.evidence.length} evidence pieces (minimum recommended: 3)`,
      });
    }

    // Check for poor data quality
    if (input.dataQualityScore < 0.6) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Poor data quality',
        penaltyValue: 0.15,
        reason: `Data quality score ${input.dataQualityScore} below threshold (0.6)`,
      });
    }

    // Check for missing data flags
    if (input.snapshot.missingDataFlags.length > 0) {
      penalties.push({
        penaltyType: PenaltyType.MISSING_DATA,
        label: 'Missing data flags detected',
        penaltyValue: 0.05 * input.snapshot.missingDataFlags.length,
        reason: `Data quality issues: ${input.snapshot.missingDataFlags.join(', ')}`,
        evidenceRefIds: input.snapshot.missingDataFlags,
      });
    }

    return penalties;
  }

  /**
   * Applies penalties to a score.
   * Reduces score by penalty values (subtractive model).
   * 
   * @param baseScore - Starting score
   * @param penalties - Penalties to apply
   * @returns Score after penalties
   */
  static applyPenalties(baseScore: number, penalties: IndexPenalty[]): number {
    let score = baseScore;

    for (const penalty of penalties) {
      score = score - penalty.penaltyValue;
    }

    // Clamp to valid range
    return Math.max(0.0, Math.min(1.0, score));
  }

  /**
   * Calculates total penalty value.
   * 
   * @param penalties - Array of penalties
   * @returns Sum of all penalty values
   */
  static calculateTotalPenalty(penalties: IndexPenalty[]): number {
    return penalties.reduce((total, p) => total + p.penaltyValue, 0);
  }
}
