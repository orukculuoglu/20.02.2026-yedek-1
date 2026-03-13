/**
 * Data Engine Acceptance Result
 *
 * Output from the acceptance evaluation engine.
 * Contains all evaluation results and summary statistics.
 *
 * Flows from: evaluateAcceptanceCriteria()
 * Flows to: Phase 13 (Timeline/Workflow Engine)
 */

import type { DataEngineAcceptanceEvaluation } from './DataEngineAcceptanceEvaluation';
import type { DataEngineAcceptanceStatus } from '../types/DataEngineAcceptanceStatus';

/**
 * Status distribution statistics
 *
 * Tracks how many evaluations resulted in each status
 */
export interface AcceptanceStatusDistribution {
  [status: string]: number;
}

/**
 * Summary statistics for acceptance evaluation
 */
export interface AcceptanceSummary {
  /**
   * Total number of evaluations
   */
  totalEvaluations: number;

  /**
   * Distribution of evaluations by status
   */
  statusDistribution: AcceptanceStatusDistribution;

  /**
   * Count of ACCEPTED evaluations
   */
  acceptedCount: number;

  /**
   * Count of WATCH evaluations
   */
  watchCount: number;

  /**
   * Count of ESCALATE evaluations
   */
  escalateCount: number;

  /**
   * Count of REJECTED evaluations
   */
  rejectedCount: number;

  /**
   * Overall vehicle acceptance status
   * Determined by the most severe status across all evaluations
   */
  overallStatus: DataEngineAcceptanceStatus;

  /**
   * Average confidence across all evaluations
   */
  averageConfidence: number | null;
}

/**
 * Result of acceptance evaluation
 *
 * Contains all evaluations with comprehensive summary
 */
export interface DataEngineAcceptanceResult {
  /**
   * All acceptance evaluations
   */
  evaluations: DataEngineAcceptanceEvaluation[];

  /**
   * Summary statistics
   */
  summary: AcceptanceSummary;

  /**
   * Timestamp of evaluation
   */
  evaluatedAt: string;
}

/**
 * Helper to calculate summary from evaluations
 */
export function calculateAcceptanceSummary(
  evaluations: DataEngineAcceptanceEvaluation[],
  overallStatus: DataEngineAcceptanceStatus
): AcceptanceSummary {
  const distribution: AcceptanceStatusDistribution = {};
  let acceptedCount = 0;
  let watchCount = 0;
  let escalateCount = 0;
  let rejectedCount = 0;
  let sumConfidence = 0;

  for (const evaluation of evaluations) {
    // Track distribution
    distribution[evaluation.acceptanceStatus] = (distribution[evaluation.acceptanceStatus] || 0) + 1;

    // Count by status
    switch (evaluation.acceptanceStatus) {
      case 'ACCEPTED':
        acceptedCount++;
        break;
      case 'WATCH':
        watchCount++;
        break;
      case 'ESCALATE':
        escalateCount++;
        break;
      case 'REJECTED':
        rejectedCount++;
        break;
    }

    // Accumulate confidence
    sumConfidence += evaluation.confidence;
  }

  const totalEvaluations = evaluations.length;
  const averageConfidence = totalEvaluations > 0 ? sumConfidence / totalEvaluations : null;

  return {
    totalEvaluations,
    statusDistribution: distribution,
    acceptedCount,
    watchCount,
    escalateCount,
    rejectedCount,
    overallStatus,
    averageConfidence,
  };
}

/**
 * Helper to create result
 */
export function createAcceptanceResult(
  evaluations: DataEngineAcceptanceEvaluation[],
  overallStatus: DataEngineAcceptanceStatus,
  evaluatedAt: string
): DataEngineAcceptanceResult {
  return {
    evaluations,
    summary: calculateAcceptanceSummary(evaluations, overallStatus),
    evaluatedAt,
  };
}
