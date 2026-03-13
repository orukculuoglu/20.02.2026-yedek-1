/**
 * Data Engine Timeline Candidate
 *
 * Input to the timeline building engine.
 * Contains acceptance evaluations to be converted to timeline entries.
 *
 * Flows from: Phase 12 (Acceptance Engine)
 * Flows to: buildOperationalTimeline()
 */

import type { DataEngineAcceptanceEvaluation } from '../../acceptance/models/DataEngineAcceptanceEvaluation';

/**
 * Input model for timeline generation
 *
 * Wraps acceptance evaluations from Phase 12 with timeline context.
 */
export interface DataEngineTimelineCandidate {
  /**
   * Vehicle identity
   */
  identityId: string;

  /**
   * Source entity reference for traceability
   */
  sourceEntityRef: string;

  /**
   * Acceptance evaluations from Phase 12
   * These are converted to timeline entries
   */
  acceptanceEvaluations: DataEngineAcceptanceEvaluation[];

  /**
   * Timestamp when timeline is generated
   */
  timelineGeneratedAt: string;
}

/**
 * Helper to get evaluations by status
 */
export function getEvaluationsByStatus(
  candidate: DataEngineTimelineCandidate,
  status: string
): DataEngineAcceptanceEvaluation[] {
  return candidate.acceptanceEvaluations.filter((e) => e.acceptanceStatus === status);
}

/**
 * Helper to count evaluations by status
 */
export function countEvaluationsByStatus(
  candidate: DataEngineTimelineCandidate,
  status: string
): number {
  return getEvaluationsByStatus(candidate, status).length;
}
