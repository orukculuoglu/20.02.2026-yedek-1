/**
 * Data Engine Score Candidate
 *
 * Input to the scoring engine.
 * Contains priority candidates that will be transformed into scores.
 *
 * Flows from: Phase 10 (Priority Candidate Preparation)
 * Flows to: calculateVehicleScores()
 */

import type { DataEnginePriorityCandidateType } from '../../prioritization/types/DataEnginePriorityCandidateType';

/**
 * Priority candidate representation
 * Must match Phase 10 output structure
 */
export interface PriorityCandidateInput {
  candidateId: string;
  candidateType: DataEnginePriorityCandidateType;
  identityId: string;
  sourceEntityRef: string;
  candidateValue: unknown; // Type varies by candidateType
  confidence: number;
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Input model for score calculation
 *
 * Wraps priority candidates from Phase 10 with calculation context.
 */
export interface DataEngineScoreCandidate {
  /**
   * Vehicle identity
   */
  identityId: string;

  /**
   * Source entity reference for traceability
   */
  sourceEntityRef: string;

  /**
   * Priority candidates from Phase 10
   * These are the signals used to calculate scores
   */
  priorityCandidates: PriorityCandidateInput[];

  /**
   * Timestamp when scoring is requested
   */
  calculatedAt: string;
}

/**
 * Helper to extract candidates by type
 */
export function getPriorityCandidatesByType(
  candidate: DataEngineScoreCandidate,
  type: DataEnginePriorityCandidateType
): PriorityCandidateInput[] {
  return candidate.priorityCandidates.filter((c) => c.candidateType === type);
}

/**
 * Helper to count candidates by type
 */
export function countPriorityCandidatesByType(
  candidate: DataEngineScoreCandidate,
  type: DataEnginePriorityCandidateType
): number {
  return getPriorityCandidatesByType(candidate, type).length;
}
