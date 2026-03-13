/**
 * Example Acceptance Criteria Cases — Phase 12
 *
 * Realistic demonstrations of Phase 12 acceptance evaluation.
 * Shows how Phase 11 vehicle scores transform to acceptance statuses.
 *
 * These examples demonstrate:
 * 1. All scores within accepted thresholds
 * 2. Mixed statuses (some accepted, some watch/escalate)
 * 3. High-severity composite case with escalation
 * 4. Edge case with high confidence consensus
 */

import type { DataEngineAcceptanceCandidate } from '../models/DataEngineAcceptanceCandidate';
import { evaluateAcceptanceCriteria } from '../engine/evaluateAcceptanceCriteria';
import type { DataEngineScore } from '../../scoring/models/DataEngineScore';
import { createScore } from '../../scoring/models/DataEngineScore';
import {
  COMPONENT_HEALTH_SCORE,
  SERVICE_DEPENDENCY_SCORE,
  ACTOR_CONCENTRATION_SCORE,
  USAGE_INTENSITY_SCORE,
  COMPOSITE_RISK_SCORE,
} from '../../scoring/types/DataEngineScoreType';

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: All Scores Accepted
// ─────────────────────────────────────────────────────────────────────────────

const scoreAccepted1: DataEngineScore = createScore(
  'score-001',
  COMPONENT_HEALTH_SCORE,
  'VEH-2024-005',
  'ENTITY-ALL-ACCEPTED-001',
  [],
  25,
  'Component health low degradation',
  0.82,
  {}
);

const scoreAccepted2: DataEngineScore = createScore(
  'score-002',
  SERVICE_DEPENDENCY_SCORE,
  'VEH-2024-005',
  'ENTITY-ALL-ACCEPTED-001',
  [],
  35,
  'Service dependency low',
  0.75,
  {}
);

const scoreAccepted3: DataEngineScore = createScore(
  'score-003',
  ACTOR_CONCENTRATION_SCORE,
  'VEH-2024-005',
  'ENTITY-ALL-ACCEPTED-001',
  [],
  40,
  'Actor concentration moderate',
  0.78,
  {}
);

export const exampleAllAccepted: DataEngineAcceptanceCandidate = {
  identityId: 'VEH-2024-005',
  sourceEntityRef: 'ENTITY-ALL-ACCEPTED-001',
  evaluatedAt: '2024-02-01T18:00:00Z',
  vehicleScores: [scoreAccepted1, scoreAccepted2, scoreAccepted3],
};

/**
 * Expected Result:
 *
 * evaluations (4 total):
 * - COMPONENT_HEALTH_EVALUATION: ACCEPTED (25 <= 40)
 * - SERVICE_DEPENDENCY_EVALUATION: ACCEPTED (35 <= 45)
 * - ACTOR_CONCENTRATION_EVALUATION: ACCEPTED (40 <= 50)
 * - OVERALL_ACCEPTANCE_EVALUATION: ACCEPTED (most severe = ACCEPTED)
 *
 * summary: {
 *   totalEvaluations: 4,
 *   statusDistribution: { "ACCEPTED": 4 },
 *   acceptedCount: 4,
 *   watchCount: 0,
 *   escalateCount: 0,
 *   rejectedCount: 0,
 *   overallStatus: "ACCEPTED"
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: Mixed Statuses (Some Watch/Escalate)
// ─────────────────────────────────────────────────────────────────────────────

const scoreMixed1: DataEngineScore = createScore(
  'score-004',
  COMPONENT_HEALTH_SCORE,
  'VEH-2024-006',
  'ENTITY-MIXED-002',
  [],
  78,
  'Component health elevated degradation',
  0.88,
  {}
);

const scoreMixed2: DataEngineScore = createScore(
  'score-005',
  SERVICE_DEPENDENCY_SCORE,
  'VEH-2024-006',
  'ENTITY-MIXED-002',
  [],
  52,
  'Service dependency moderate',
  0.76,
  {}
);

const scoreMixed3: DataEngineScore = createScore(
  'score-006',
  USAGE_INTENSITY_SCORE,
  'VEH-2024-006',
  'ENTITY-MIXED-002',
  [],
  38,
  'Usage intensity uniform',
  0.71,
  {}
);

export const exampleMixedStatuses: DataEngineAcceptanceCandidate = {
  identityId: 'VEH-2024-006',
  sourceEntityRef: 'ENTITY-MIXED-002',
  evaluatedAt: '2024-02-01T18:00:00Z',
  vehicleScores: [scoreMixed1, scoreMixed2, scoreMixed3],
};

/**
 * Expected Result:
 *
 * evaluations (4 total):
 * - COMPONENT_HEALTH_EVALUATION: ESCALATE (78 exceeds watchMax (70) but <= escalateMax (90))
 * - SERVICE_DEPENDENCY_EVALUATION: WATCH (52 exceeds acceptedMax (45) but <= watchMax (72))
 * - USAGE_INTENSITY_EVALUATION: ACCEPTED (38 <= acceptedMax (42))
 * - OVERALL_ACCEPTANCE_EVALUATION: ESCALATE (most severe = ESCALATE)
 *
 * summary: {
 *   totalEvaluations: 4,
 *   statusDistribution: {
 *     "ACCEPTED": 1,
 *     "WATCH": 1,
 *     "ESCALATE": 1,
 *     "ESCALATE": 1 (overall)
 *   },
 *   acceptedCount: 1,
 *   watchCount: 1,
 *   escalateCount: 2,
 *   rejectedCount: 0,
 *   overallStatus: "ESCALATE"
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: High-Severity Composite Case
// ─────────────────────────────────────────────────────────────────────────────

const scoreComposite1: DataEngineScore = createScore(
  'score-007',
  COMPONENT_HEALTH_SCORE,
  'VEH-2024-007',
  'ENTITY-SEVERE-003',
  [],
  85,
  'Critical component degradation',
  0.92,
  {}
);

const scoreComposite2: DataEngineScore = createScore(
  'score-008',
  SERVICE_DEPENDENCY_SCORE,
  'VEH-2024-007',
  'ENTITY-SEVERE-003',
  [],
  82,
  'High service dependency',
  0.89,
  {}
);

const scoreComposite3: DataEngineScore = createScore(
  'score-009',
  COMPOSITE_RISK_SCORE,
  'VEH-2024-007',
  'ENTITY-SEVERE-003',
  [],
  91,
  'Critical multi-domain convergence',
  0.94,
  {}
);

export const exampleHighSeverityComposite: DataEngineAcceptanceCandidate = {
  identityId: 'VEH-2024-007',
  sourceEntityRef: 'ENTITY-SEVERE-003',
  evaluatedAt: '2024-02-01T18:00:00Z',
  vehicleScores: [scoreComposite1, scoreComposite2, scoreComposite3],
};

/**
 * Expected Result:
 *
 * evaluations (4 total):
 * - COMPONENT_HEALTH_EVALUATION: ESCALATE (85 in escalate range)
 * - SERVICE_DEPENDENCY_EVALUATION: ESCALATE (82 in escalate range)
 * - COMPOSITE_RISK_EVALUATION: REJECTED (91 > escalateMax 88)
 * - OVERALL_ACCEPTANCE_EVALUATION: REJECTED (most severe = REJECTED)
 *
 * summary: {
 *   totalEvaluations: 4,
 *   statusDistribution: {
 *     "ESCALATE": 2,
 *     "REJECTED": 2
 *   },
 *   acceptedCount: 0,
 *   watchCount: 0,
 *   escalateCount: 2,
 *   rejectedCount: 2,
 *   overallStatus: "REJECTED"
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 4: High Confidence Consensus (All Watch)
// ─────────────────────────────────────────────────────────────────────────────

const scoreHighConf1: DataEngineScore = createScore(
  'score-010',
  COMPONENT_HEALTH_SCORE,
  'VEH-2024-008',
  'ENTITY-WATCH-CONSENSUS-004',
  [],
  62,
  'Component moderate degradation',
  0.96,
  {}
);

const scoreHighConf2: DataEngineScore = createScore(
  'score-011',
  SERVICE_DEPENDENCY_SCORE,
  'VEH-2024-008',
  'ENTITY-WATCH-CONSENSUS-004',
  [],
  58,
  'Service moderate dependency',
  0.93,
  {}
);

const scoreHighConf3: DataEngineScore = createScore(
  'score-012',
  ACTOR_CONCENTRATION_SCORE,
  'VEH-2024-008',
  'ENTITY-WATCH-CONSENSUS-004',
  [],
  63,
  'Actor moderate concentration',
  0.94,
  {}
);

export const exampleHighConfidenceWatch: DataEngineAcceptanceCandidate = {
  identityId: 'VEH-2024-008',
  sourceEntityRef: 'ENTITY-WATCH-CONSENSUS-004',
  evaluatedAt: '2024-02-01T18:00:00Z',
  vehicleScores: [scoreHighConf1, scoreHighConf2, scoreHighConf3],
};

/**
 * Expected Result:
 *
 * evaluations (4 total):
 * - COMPONENT_HEALTH_EVALUATION: WATCH (62 in watch range, confidence 0.96)
 * - SERVICE_DEPENDENCY_EVALUATION: WATCH (58 in watch range, confidence 0.93)
 * - ACTOR_CONCENTRATION_EVALUATION: WATCH (63 in watch range, confidence 0.94)
 * - OVERALL_ACCEPTANCE_EVALUATION: WATCH (most severe = WATCH, avg conf 0.94)
 *
 * summary: {
 *   totalEvaluations: 4,
 *   statusDistribution: { "WATCH": 4 },
 *   acceptedCount: 0,
 *   watchCount: 4,
 *   escalateCount: 0,
 *   rejectedCount: 0,
 *   overallStatus: "WATCH",
 *   averageConfidence: 0.94
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// Test/Demonstration Function
// ─────────────────────────────────────────────────────────────────────────────

export function demonstratePhase12Evaluation(): void {
  console.log('=== Phase 12 Acceptance Criteria Evaluation ===\n');

  // Example 1
  console.log('Example 1: All Scores Accepted');
  const result1 = evaluateAcceptanceCriteria(exampleAllAccepted);
  console.log(`  Overall Status: ${result1.summary.overallStatus}`);
  console.log(`  Accepted: ${result1.summary.acceptedCount}`);
  console.log(`  Watch: ${result1.summary.watchCount}`);
  console.log(`  Escalate: ${result1.summary.escalateCount}`);
  console.log(`  Rejected: ${result1.summary.rejectedCount}`);
  console.log();

  // Example 2
  console.log('Example 2: Mixed Statuses');
  const result2 = evaluateAcceptanceCriteria(exampleMixedStatuses);
  console.log(`  Overall Status: ${result2.summary.overallStatus}`);
  console.log(`  Accepted: ${result2.summary.acceptedCount}`);
  console.log(`  Watch: ${result2.summary.watchCount}`);
  console.log(`  Escalate: ${result2.summary.escalateCount}`);
  console.log(`  Rejected: ${result2.summary.rejectedCount}`);
  console.log();

  // Example 3
  console.log('Example 3: High-Severity Composite');
  const result3 = evaluateAcceptanceCriteria(exampleHighSeverityComposite);
  console.log(`  Overall Status: ${result3.summary.overallStatus}`);
  console.log(`  Accepted: ${result3.summary.acceptedCount}`);
  console.log(`  Watch: ${result3.summary.watchCount}`);
  console.log(`  Escalate: ${result3.summary.escalateCount}`);
  console.log(`  Rejected: ${result3.summary.rejectedCount}`);
  console.log();

  // Example 4
  console.log('Example 4: High Confidence Watch Consensus');
  const result4 = evaluateAcceptanceCriteria(exampleHighConfidenceWatch);
  console.log(`  Overall Status: ${result4.summary.overallStatus}`);
  console.log(`  Accepted: ${result4.summary.acceptedCount}`);
  console.log(`  Watch: ${result4.summary.watchCount}`);
  console.log(`  Average Confidence: ${result4.summary.averageConfidence}`);
}
