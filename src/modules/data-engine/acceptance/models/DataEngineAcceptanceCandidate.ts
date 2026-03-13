/**
 * Data Engine Acceptance Candidate
 *
 * Input to the acceptance evaluation engine.
 * Contains vehicle scores from Phase 11 to be evaluated against criteria.
 *
 * Flows from: Phase 11 (Scoring Engine)
 * Flows to: evaluateAcceptanceCriteria()
 */

import type { DataEngineScore } from '../../scoring/models/DataEngineScore';
import type { DataEngineAcceptancePolicy } from './DataEngineAcceptancePolicy';

/**
 * Input model for acceptance evaluation
 *
 * Wraps scores from Phase 11 with evaluation context.
 */
export interface DataEngineAcceptanceCandidate {
  /**
   * Vehicle identity
   */
  identityId: string;

  /**
   * Source entity reference for traceability
   */
  sourceEntityRef: string;

  /**
   * Vehicle scores from Phase 11
   * These are evaluated against acceptance criteria
   */
  vehicleScores: DataEngineScore[];

  /**
   * Timestamp when evaluation is requested
   */
  evaluatedAt: string;

  /**
   * Optional custom acceptance policy
   * If not provided, DEFAULT_ACCEPTANCE_POLICY will be used
   */
  acceptancePolicy?: DataEngineAcceptancePolicy;
}

/**
 * Helper to get all scores of a specific type
 */
export function getScoresByType(
  candidate: DataEngineAcceptanceCandidate,
  scoreType: string
): DataEngineScore[] {
  return candidate.vehicleScores.filter((s) => s.scoreType === scoreType);
}

/**
 * Helper to get a single score of a type (first match)
 */
export function getScoreByType(
  candidate: DataEngineAcceptanceCandidate,
  scoreType: string
): DataEngineScore | undefined {
  return candidate.vehicleScores.find((s) => s.scoreType === scoreType);
}
