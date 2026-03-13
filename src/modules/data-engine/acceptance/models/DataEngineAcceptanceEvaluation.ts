/**
 * Data Engine Acceptance Evaluation
 *
 * Represents a single acceptance evaluation result.
 * Maps a score to an acceptance status using deterministic thresholds.
 *
 * One evaluation per score family + one overall evaluation.
 */

import type { DataEngineAcceptanceStatus } from '../types/DataEngineAcceptanceStatus';
import type { DataEngineAcceptanceEvaluationType } from '../types/DataEngineAcceptanceEvaluationType';

/**
 * Single vehicle acceptance evaluation
 *
 * Captures the evaluation of one score against acceptance criteria.
 */
export interface DataEngineAcceptanceEvaluation {
  /**
   * Deterministic evaluation ID
   * Generated as SHA-256(identityId + evaluationType + sourceEntityRef + acceptanceStatus)
   */
  evaluationId: string;

  /**
   * Evaluation type (component health, service dependency, etc.)
   */
  evaluationType: DataEngineAcceptanceEvaluationType;

  /**
   * Acceptance status (ACCEPTED, WATCH, ESCALATE, REJECTED)
   */
  acceptanceStatus: DataEngineAcceptanceStatus;

  /**
   * Vehicle identity reference
   */
  identityId: string;

  /**
   * Source entity reference for traceability
   */
  sourceEntityRef: string;

  /**
   * Score IDs this evaluation is based on
   * Ensures full traceability back to Phase 11
   */
  sourceScoreRefs: string[];

  /**
   * Textual explanation of the evaluation decision
   *
   * Examples:
   * - "Score 75 exceeds watchMax (70) but below escalateMax (90) → WATCH"
   * - "Score 35 within acceptedMax (40) → ACCEPTED"
   * - "Score 92 exceeds escalateMax (90) → ESCALATE"
   */
  evaluationBasis: string;

  /**
   * Deterministic threshold rule applied
   *
   * Examples:
   * - "acceptedMax: 40"
   * - "watchMax: 70"
   * - "escalateMax: 90"
   */
  thresholdApplied: string;

  /**
   * Confidence in evaluation (0-1)
   * Inherited/aggregated from source score confidence
   */
  confidence: number;

  /**
   * ISO 8601 timestamp of evaluation
   */
  evaluatedAt: string;

  /**
   * Extension properties for domain-specific metadata
   */
  properties: Record<string, unknown>;
}

/**
 * Factory function for creating evaluations
 */
export function createEvaluation(
  evaluationId: string,
  evaluationType: DataEngineAcceptanceEvaluationType,
  acceptanceStatus: DataEngineAcceptanceStatus,
  identityId: string,
  sourceEntityRef: string,
  sourceScoreRefs: string[],
  evaluationBasis: string,
  thresholdApplied: string,
  confidence: number,
  properties: Record<string, unknown> = {}
): DataEngineAcceptanceEvaluation {
  return {
    evaluationId,
    evaluationType,
    acceptanceStatus,
    identityId,
    sourceEntityRef,
    sourceScoreRefs,
    evaluationBasis,
    thresholdApplied,
    confidence,
    evaluatedAt: new Date().toISOString(),
    properties,
  };
}
