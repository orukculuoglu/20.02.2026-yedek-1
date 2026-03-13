/**
 * Data Engine Score
 *
 * Represents a single calculated intelligence score.
 * Scores are deterministic and reproducible.
 *
 * Each score:
 * - Traces back to one or more priority candidates
 * - Includes explanation (scoreBasis)
 * - Reports signal confidence
 * - Uses deterministic ID generation (SHA-256)
 */

import type { DataEngineScoreType } from '../types/DataEngineScoreType';

/**
 * Single Vehicle Intelligence Score
 *
 * Captures a deterministic score calculation with full traceability.
 */
export interface DataEngineScore {
  /**
   * Deterministic score ID
   * Generated as SHA-256(identityId + scoreType + sourceEntityRef)
   */
  scoreId: string;

  /**
   * Score type classification
   */
  scoreType: DataEngineScoreType;

  /**
   * Vehicle identity reference
   */
  identityId: string;

  /**
   * Source entity reference for traceability
   */
  sourceEntityRef: string;

  /**
   * Priority candidate references this score is calculated from
   * Ensures full traceability back to candidates
   */
  sourcePriorityCandidateRefs: string[];

  /**
   * Numeric score value (0-100)
   * 0 = lowest likelihood/intensity
   * 100 = highest likelihood/intensity
   */
  scoreValue: number;

  /**
   * Textual explanation of score calculation
   *
   * Examples:
   * - "High recurrence (3 patterns) + medium evidence (2 signals) = 72"
   * - "Dense cluster (3 services) + high actor concentration = 85"
   * - "Temporal anomaly with 3 events in narrow window = 68"
   * - "3-domain convergence: component + service + actor = 91"
   */
  scoreBasis: string;

  /**
   * Confidence in score reliability (0-1)
   *
   * 0.0 = low confidence (few signals, weak evidence)
   * 0.5 = moderate confidence (adequate signals)
   * 1.0 = high confidence (strong multi-source evidence)
   *
   * Reflects signal quality and quantity in source candidates
   */
  confidence: number;

  /**
   * ISO 8601 timestamp of score calculation
   */
  calculatedAt: string;

  /**
   * Extension properties for domain-specific metadata
   */
  properties: Record<string, unknown>;
}

/**
 * Factory function for creating scores with explicit control
 */
export function createScore(
  scoreId: string,
  scoreType: DataEngineScoreType,
  identityId: string,
  sourceEntityRef: string,
  sourcePriorityCandidateRefs: string[],
  scoreValue: number,
  scoreBasis: string,
  confidence: number,
  properties: Record<string, unknown> = {}
): DataEngineScore {
  // Validate score value range
  if (scoreValue < 0 || scoreValue > 100) {
    throw new Error(`Invalid score value: ${scoreValue}. Must be between 0 and 100.`);
  }

  // Validate confidence range
  if (confidence < 0 || confidence > 1) {
    throw new Error(`Invalid confidence: ${confidence}. Must be between 0 and 1.`);
  }

  return {
    scoreId,
    scoreType,
    identityId,
    sourceEntityRef,
    sourcePriorityCandidateRefs,
    scoreValue,
    scoreBasis,
    confidence,
    calculatedAt: new Date().toISOString(),
    properties,
  };
}
