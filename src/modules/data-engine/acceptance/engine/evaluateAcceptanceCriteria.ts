/**
 * Data Engine Acceptance Criteria Engine
 *
 * Evaluates vehicle scores against deterministic acceptance criteria.
 *
 * Core responsibilities:
 * - Apply acceptance thresholds to scores
 * - Generate evaluations for each score family
 * - Generate overall acceptance status
 * - Preserve full traceability
 * - Remain deterministic
 *
 * Determinism guarantee:
 * Same input + same policy → same evaluations (reproducible)
 * No randomness, deterministic ID generation via SHA-256
 */

import { createHash } from 'crypto';
import type { DataEngineScoreCandidate } from '../../scoring/models/DataEngineScoreCandidate';
import type { DataEngineAcceptanceCandidate } from '../models/DataEngineAcceptanceCandidate';
import { getScoreByType } from '../models/DataEngineAcceptanceCandidate';
import type { DataEngineAcceptanceEvaluation } from '../models/DataEngineAcceptanceEvaluation';
import { createEvaluation } from '../models/DataEngineAcceptanceEvaluation';
import type { DataEngineAcceptanceResult } from '../models/DataEngineAcceptanceResult';
import { createAcceptanceResult } from '../models/DataEngineAcceptanceResult';
import { DEFAULT_ACCEPTANCE_POLICY, getThresholdsForType } from '../models/DataEngineAcceptancePolicy';
import type { DataEngineAcceptancePolicy } from '../models/DataEngineAcceptancePolicy';
import {
  ACCEPTED,
  WATCH,
  ESCALATE,
  REJECTED,
  getMostSevereStatus,
  type DataEngineAcceptanceStatus,
} from '../types/DataEngineAcceptanceStatus';
import {
  COMPONENT_HEALTH_EVALUATION,
  SERVICE_DEPENDENCY_EVALUATION,
  ACTOR_CONCENTRATION_EVALUATION,
  USAGE_INTENSITY_EVALUATION,
  COMPOSITE_RISK_EVALUATION,
  OVERALL_ACCEPTANCE_EVALUATION,
  type DataEngineAcceptanceEvaluationType,
} from '../types/DataEngineAcceptanceEvaluationType';
import {
  COMPONENT_HEALTH_SCORE,
  SERVICE_DEPENDENCY_SCORE,
  ACTOR_CONCENTRATION_SCORE,
  USAGE_INTENSITY_SCORE,
  COMPOSITE_RISK_SCORE,
} from '../../scoring/types/DataEngineScoreType';

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC ID GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate deterministic evaluation ID
 *
 * Formula: SHA-256(identityId + evaluationType + sourceEntityRef + acceptanceStatus)
 */
function generateEvaluationId(
  identityId: string,
  evaluationType: string,
  sourceEntityRef: string,
  acceptanceStatus: string
): string {
  const input = `${identityId}:${evaluationType}:${sourceEntityRef}:${acceptanceStatus}`;
  return createHash('sha256').update(input).digest('hex').substring(0, 16);
}

// ─────────────────────────────────────────────────────────────────────────────
// EVALUATION MAPPING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map score type to evaluation type
 */
function getEvaluationTypeForScoreType(scoreType: string): DataEngineAcceptanceEvaluationType | null {
  switch (scoreType) {
    case COMPONENT_HEALTH_SCORE:
      return COMPONENT_HEALTH_EVALUATION;
    case SERVICE_DEPENDENCY_SCORE:
      return SERVICE_DEPENDENCY_EVALUATION;
    case ACTOR_CONCENTRATION_SCORE:
      return ACTOR_CONCENTRATION_EVALUATION;
    case USAGE_INTENSITY_SCORE:
      return USAGE_INTENSITY_EVALUATION;
    case COMPOSITE_RISK_SCORE:
      return COMPOSITE_RISK_EVALUATION;
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCEPTANCE STATUS DETERMINATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determine acceptance status based on score and thresholds
 */
function determineAcceptanceStatus(
  scoreValue: number,
  policy: DataEngineAcceptancePolicy,
  evaluationType: DataEngineAcceptanceEvaluationType
): {
  status: DataEngineAcceptanceStatus;
  thresholdApplied: string;
} {
  const thresholds = getThresholdsForType(policy, evaluationType);

  if (scoreValue <= thresholds.acceptedMax) {
    return {
      status: ACCEPTED,
      thresholdApplied: `acceptedMax: ${thresholds.acceptedMax}`,
    };
  }

  if (scoreValue <= thresholds.watchMax) {
    return {
      status: WATCH,
      thresholdApplied: `watchMax: ${thresholds.watchMax}`,
    };
  }

  if (scoreValue <= thresholds.escalateMax) {
    return {
      status: ESCALATE,
      thresholdApplied: `escalateMax: ${thresholds.escalateMax}`,
    };
  }

  return {
    status: REJECTED,
    thresholdApplied: `above escalateMax: ${thresholds.escalateMax}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EVALUATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluate acceptance criteria for vehicle scores
 *
 * Transforms scores into acceptance evaluations using deterministic policy.
 *
 * @param candidate Acceptance candidate with vehicle scores from Phase 11
 * @returns Acceptance result with all evaluations and summary
 */
export function evaluateAcceptanceCriteria(
  candidate: DataEngineAcceptanceCandidate
): DataEngineAcceptanceResult {
  // Use provided policy or default
  const policy = candidate.acceptancePolicy || DEFAULT_ACCEPTANCE_POLICY;
  const evaluations: DataEngineAcceptanceEvaluation[] = [];
  const statusesForOverall: DataEngineAcceptanceStatus[] = [];

  // Evaluate each score
  for (const score of candidate.vehicleScores) {
    const evaluationType = getEvaluationTypeForScoreType(score.scoreType);

    if (!evaluationType) {
      // Skip unknown score types
      continue;
    }

    // Determine acceptance status
    const { status, thresholdApplied } = determineAcceptanceStatus(
      score.scoreValue,
      policy,
      evaluationType
    );

    // Generate evaluation basis
    let evaluationBasis = `Score ${score.scoreValue}`;
    if (status === ACCEPTED) {
      evaluationBasis += ` within acceptedMax → ${status}`;
    } else if (status === WATCH) {
      evaluationBasis += ` exceeds acceptedMax but within watchMax → ${status}`;
    } else if (status === ESCALATE) {
      evaluationBasis += ` exceeds watchMax but within escalateMax → ${status}`;
    } else {
      evaluationBasis += ` exceeds escalateMax → ${status}`;
    }

    // Create evaluation
    const evaluation = createEvaluation(
      generateEvaluationId(
        candidate.identityId,
        evaluationType,
        candidate.sourceEntityRef,
        status
      ),
      evaluationType,
      status,
      candidate.identityId,
      candidate.sourceEntityRef,
      [score.scoreId],
      evaluationBasis,
      thresholdApplied,
      score.confidence,
      { scoreValue: score.scoreValue, scoreBasis: score.scoreBasis }
    );

    evaluations.push(evaluation);
    statusesForOverall.push(status);
  }

  // Determine overall status (most severe)
  const overallStatus = getMostSevereStatus(statusesForOverall);

  // Create overall evaluation
  const allScoreIds = candidate.vehicleScores.map((s) => s.scoreId);
  const overallEvaluation = createEvaluation(
    generateEvaluationId(
      candidate.identityId,
      OVERALL_ACCEPTANCE_EVALUATION,
      candidate.sourceEntityRef,
      overallStatus
    ),
    OVERALL_ACCEPTANCE_EVALUATION,
    overallStatus,
    candidate.identityId,
    candidate.sourceEntityRef,
    allScoreIds,
    `Overall status determined by most severe individual evaluation: ${overallStatus}`,
    'overall',
    candidate.vehicleScores.length > 0
      ? candidate.vehicleScores.reduce((sum, s) => sum + s.confidence, 0) /
          candidate.vehicleScores.length
      : 0.5,
    { derivedFrom: `${evaluations.length} evaluations` }
  );

  evaluations.push(overallEvaluation);

  return createAcceptanceResult(evaluations, overallStatus, new Date().toISOString());
}
