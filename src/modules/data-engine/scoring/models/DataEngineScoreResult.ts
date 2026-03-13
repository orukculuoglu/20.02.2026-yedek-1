/**
 * Data Engine Score Result
 *
 * Output from the scoring engine.
 * Contains all calculated scores and summary statistics.
 *
 * Flows from: calculateVehicleScores()
 * Flows to: Phase 12 (Acceptance Criteria Engine)
 */

import type { DataEngineScore } from './DataEngineScore';
import type { DataEngineScoreType } from '../types/DataEngineScoreType';

/**
 * Score distribution statistics
 *
 * Tracks how many scores of each type were calculated
 */
export interface ScoreDistribution {
  [scoreType: string]: number;
}

/**
 * Summary statistics for score calculation
 */
export interface ScoreSummary {
  /**
   * Total number of scores calculated
   */
  totalScores: number;

  /**
   * Distribution of scores by type
   */
  scoreDistribution: ScoreDistribution;

  /**
   * Highest score value (0-100)
   */
  highestScore: number | null;

  /**
   * Lowest score value (0-100)
   */
  lowestScore: number | null;

  /**
   * Average score value
   */
  averageScore: number | null;

  /**
   * Average confidence across all scores
   */
  averageConfidence: number | null;

  /**
   * Scores with high confidence (>= 0.7)
   */
  highConfidenceScoreCount: number;

  /**
   * Scores with medium confidence (0.4-0.7)
   */
  mediumConfidenceScoreCount: number;

  /**
   * Scores with low confidence (< 0.4)
   */
  lowConfidenceScoreCount: number;
}

/**
 * Result of vehicle score calculation
 *
 * Contains all calculated scores with comprehensive summary
 */
export interface DataEngineScoreResult {
  /**
   * All calculated vehicle scores
   */
  vehicleScores: DataEngineScore[];

  /**
   * Summary statistics
   */
  summary: ScoreSummary;

  /**
   * Timestamp of calculation
   */
  calculatedAt: string;
}

/**
 * Helper to calculate summary from scores
 */
export function calculateScoreSummary(scores: DataEngineScore[]): ScoreSummary {
  const distribution: ScoreDistribution = {};
  let highest: number | null = null;
  let lowest: number | null = null;
  let sumValues = 0;
  let sumConfidence = 0;
  let highConfidenceScoreCount = 0;
  let mediumConfidenceScoreCount = 0;
  let lowConfidenceScoreCount = 0;

  for (const score of scores) {
    // Track distribution
    distribution[score.scoreType] = (distribution[score.scoreType] || 0) + 1;

    // Track score value range
    if (highest === null || score.scoreValue > highest) {
      highest = score.scoreValue;
    }
    if (lowest === null || score.scoreValue < lowest) {
      lowest = score.scoreValue;
    }

    // Accumulate for averages
    sumValues += score.scoreValue;
    sumConfidence += score.confidence;

    // Count confidence levels
    if (score.confidence >= 0.7) {
      highConfidenceScoreCount++;
    } else if (score.confidence >= 0.4) {
      mediumConfidenceScoreCount++;
    } else {
      lowConfidenceScoreCount++;
    }
  }

  const totalScores = scores.length;
  const averageScore = totalScores > 0 ? sumValues / totalScores : null;
  const averageConfidence = totalScores > 0 ? sumConfidence / totalScores : null;

  return {
    totalScores,
    scoreDistribution: distribution,
    highestScore: highest,
    lowestScore: lowest,
    averageScore,
    averageConfidence,
    highConfidenceScoreCount,
    mediumConfidenceScoreCount,
    lowConfidenceScoreCount,
  };
}

/**
 * Helper to create result
 */
export function createScoreResult(
  vehicleScores: DataEngineScore[],
  calculatedAt: string
): DataEngineScoreResult {
  return {
    vehicleScores,
    summary: calculateScoreSummary(vehicleScores),
    calculatedAt,
  };
}
