import { IndexType } from '../../enums/index-type';
import { IndexSubjectType } from '../../enums/index-subject-type';
import { IndexBand } from '../../enums/index-band';
import { IndexExplanation } from '../../schemas/index-explanation';
import { IndexFactor } from './index-factor';
import { IndexScoreBreakdown } from './index-score-breakdown';
import { IndexPenalty } from './index-penalty';

/**
 * IndexCalculationResult is the output of a calculation.
 * Contains the score, confidence, breakdown, and full explainability.
 */
export interface IndexCalculationResult {
  /**
   * The type of index that was calculated
   */
  indexType: IndexType;

  /**
   * The type of entity this index was calculated for
   */
  subjectType: IndexSubjectType;

  /**
   * The unique identifier of the entity
   */
  subjectId: string;

  /**
   * The raw (un-normalized) score before any adjustments
   */
  rawScore: number;

  /**
   * The final normalized score (0.0 - 1.0)
   * This is the primary output value
   */
  normalizedScore: number;

  /**
   * The classification band derived from the normalized score
   * CRITICAL | HIGH | MEDIUM | LOW | OPTIMAL
   */
  band: IndexBand;

  /**
   * Overall confidence in this result (0.0 - 1.0)
   * Reflects data quality, completeness, and calculation certainty
   */
  confidence: number;

  /**
   * Detailed breakdown of how the score was calculated
   */
  breakdown: IndexScoreBreakdown;

  /**
   * Individual factors that contributed to the score
   */
  factors: IndexFactor[];

  /**
   * Penalties applied during calculation
   */
  penalties: IndexPenalty[];

  /**
   * Human-readable and machine-readable explanation
   */
  explanation: IndexExplanation;

  /**
   * ISO 8601 timestamp when calculation was performed
   */
  calculatedAt: Date;

  /**
   * Optional: Calculation context or metadata
   */
  metadata?: Record<string, unknown>;
}
