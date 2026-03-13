/**
 * Example Score Calculation Cases — Phase 11
 *
 * Realistic demonstrations of Phase 11 deterministic scoring.
 * Shows how Phase 10 priority candidates transform into scores.
 *
 * These examples demonstrate:
 * 1. Component-focused scoring
 * 2. Multi-domain scoring with composite risk
 * 3. Service-focused scoring
 * 4. High-confidence convergent scoring
 */

import type { DataEngineScoreCandidate } from '../models/DataEngineScoreCandidate';
import { calculateVehicleScores } from '../engine/calculateVehicleScores';
import { DataEnginePriorityCandidateType } from '../../prioritization/types/DataEnginePriorityCandidateType';

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: Component-Focused Scoring
// ─────────────────────────────────────────────────────────────────────────────

export const exampleComponentFocusedScoring: DataEngineScoreCandidate = {
  identityId: 'VEH-2024-001',
  sourceEntityRef: 'ENTITY-COMPONENT-FOCUS-001',
  calculatedAt: '2024-02-01T17:00:00Z',
  priorityCandidates: [
    {
      candidateId: 'CAND-COMP-001',
      candidateType: DataEnginePriorityCandidateType.COMPONENT_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-001',
      sourceEntityRef: 'ENTITY-COMPONENT-FOCUS-001',
      candidateValue: {
        componentId: 'brake_pad',
        recurrenceLevel: 'high_recurrence',
      },
      confidence: 0.85,
      createdAt: '2024-02-01T16:00:00Z',
    },
    {
      candidateId: 'CAND-COMP-002',
      candidateType: DataEnginePriorityCandidateType.COMPONENT_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-001',
      sourceEntityRef: 'ENTITY-COMPONENT-FOCUS-001',
      candidateValue: {
        componentId: 'suspension_arm',
        recurrenceLevel: 'medium_recurrence',
      },
      confidence: 0.72,
      createdAt: '2024-02-01T16:00:00Z',
    },
  ],
};

/**
 * Expected Scoring Result:
 *
 * vehicleScores:
 * - COMPONENT_HEALTH_SCORE: 75
 *   (2 component candidates, high recurrence boost)
 *   Source: CAND-COMP-001, CAND-COMP-002
 *
 * summary: {
 *   totalScores: 1,
 *   scoreDistribution: { "COMPONENT_HEALTH_SCORE": 1 },
 *   highestScore: 75,
 *   lowestScore: 75,
 *   averageScore: 75,
 *   highConfidenceScoreCount: 1
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: Multi-Domain Scoring with Composite Risk
// ─────────────────────────────────────────────────────────────────────────────

export const exampleMultiDomainScoring: DataEngineScoreCandidate = {
  identityId: 'VEH-2024-002',
  sourceEntityRef: 'ENTITY-MULTI-DOMAIN-002',
  calculatedAt: '2024-02-01T17:00:00Z',
  priorityCandidates: [
    // Component candidate
    {
      candidateId: 'CAND-COMP-003',
      candidateType: DataEnginePriorityCandidateType.COMPONENT_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-MULTI-DOMAIN-002',
      candidateValue: {
        componentId: 'oil_system',
        recurrenceLevel: 'high_recurrence',
      },
      confidence: 0.88,
      createdAt: '2024-02-01T16:00:00Z',
    },
    // Service candidate
    {
      candidateId: 'CAND-SERV-001',
      candidateType: DataEnginePriorityCandidateType.SERVICE_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-MULTI-DOMAIN-002',
      candidateValue: {
        serviceType: 'MAINTENANCE_RECORD',
        intensity: 'dense_cluster',
      },
      confidence: 0.81,
      createdAt: '2024-02-01T16:00:00Z',
    },
    // Actor candidate
    {
      candidateId: 'CAND-ACTOR-001',
      candidateType: DataEnginePriorityCandidateType.ACTOR_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-MULTI-DOMAIN-002',
      candidateValue: {
        actorId: 'WORKSHOP_A:MECHANIC',
        concentrationLevel: 'high_concentration',
      },
      confidence: 0.79,
      createdAt: '2024-02-01T16:00:00Z',
    },
    // Composite candidate
    {
      candidateId: 'CAND-COMP-004',
      candidateType: DataEnginePriorityCandidateType.COMPOSITE_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-MULTI-DOMAIN-002',
      candidateValue: {
        domains: ['component', 'service', 'actor'],
        domainCount: 3,
      },
      confidence: 0.85,
      createdAt: '2024-02-01T16:00:00Z',
    },
  ],
};

/**
 * Expected Scoring Result:
 *
 * vehicleScores:
 * - COMPONENT_HEALTH_SCORE: 80
 *   (1 component, high recurrence)
 * - SERVICE_DEPENDENCY_SCORE: 72
 *   (1 service, dense cluster)
 * - ACTOR_CONCENTRATION_SCORE: 55
 *   (1 actor, high concentration baseline)
 * - COMPOSITE_RISK_SCORE: 85
 *   (1 composite with 3 domains, strong convergence)
 *
 * summary: {
 *   totalScores: 4,
 *   scoreDistribution: {
 *     "COMPONENT_HEALTH_SCORE": 1,
 *     "SERVICE_DEPENDENCY_SCORE": 1,
 *     "ACTOR_CONCENTRATION_SCORE": 1,
 *     "COMPOSITE_RISK_SCORE": 1
 *   },
 *   highestScore: 85,
 *   lowestScore: 55,
 *   averageScore: 73,
 *   highConfidenceScoreCount: 4
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: Service-Focused Scoring
// ─────────────────────────────────────────────────────────────────────────────

export const exampleServiceFocusedScoring: DataEngineScoreCandidate = {
  identityId: 'VEH-2024-003',
  sourceEntityRef: 'ENTITY-SERVICE-FOCUS-003',
  calculatedAt: '2024-02-01T17:00:00Z',
  priorityCandidates: [
    {
      candidateId: 'CAND-SERV-002',
      candidateType: DataEnginePriorityCandidateType.SERVICE_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-SERVICE-FOCUS-003',
      candidateValue: {
        serviceType: 'MAINTENANCE_RECORD',
        intensity: 'dense_cluster',
      },
      confidence: 0.92,
      createdAt: '2024-02-01T16:00:00Z',
    },
    {
      candidateId: 'CAND-SERV-003',
      candidateType: DataEnginePriorityCandidateType.SERVICE_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-SERVICE-FOCUS-003',
      candidateValue: {
        serviceType: 'DIAGNOSTIC_INSPECTION',
        intensity: 'moderate_cluster',
      },
      confidence: 0.76,
      createdAt: '2024-02-01T16:00:00Z',
    },
  ],
};

/**
 * Expected Scoring Result:
 *
 * vehicleScores:
 * - SERVICE_DEPENDENCY_SCORE: 72
 *   (2 service candidates, dense and moderate clusters)
 *   Source: CAND-SERV-002, CAND-SERV-003
 *
 * summary: {
 *   totalScores: 1,
 *   scoreDistribution: { "SERVICE_DEPENDENCY_SCORE": 1 },
 *   highestScore: 72,
 *   lowestScore: 72,
 *   averageScore: 72,
 *   highConfidenceScoreCount: 1
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 4: High-Confidence Convergent Scoring
// ─────────────────────────────────────────────────────────────────────────────

export const exampleHighConfidenceConvergence: DataEngineScoreCandidate = {
  identityId: 'VEH-2024-004',
  sourceEntityRef: 'ENTITY-HIGH-CONVERGENCE-004',
  calculatedAt: '2024-02-01T17:00:00Z',
  priorityCandidates: [
    // Component with very high confidence
    {
      candidateId: 'CAND-COMP-005',
      candidateType: DataEnginePriorityCandidateType.COMPONENT_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-HIGH-CONVERGENCE-004',
      candidateValue: {
        componentId: 'transmission',
        recurrenceLevel: 'high_recurrence',
      },
      confidence: 0.95,
      createdAt: '2024-02-01T16:00:00Z',
    },
    // Service with high confidence
    {
      candidateId: 'CAND-SERV-004',
      candidateType: DataEnginePriorityCandidateType.SERVICE_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-HIGH-CONVERGENCE-004',
      candidateValue: {
        serviceType: 'MAINTENANCE_RECORD',
        intensity: 'dense_cluster',
      },
      confidence: 0.93,
      createdAt: '2024-02-01T16:00:00Z',
    },
    // Temporal with high confidence
    {
      candidateId: 'CAND-TEMP-001',
      candidateType: DataEnginePriorityCandidateType.TEMPORAL_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-HIGH-CONVERGENCE-004',
      candidateValue: {
        timeWindow: '2024-01-20',
        densityLevel: 'high_density',
      },
      confidence: 0.91,
      createdAt: '2024-02-01T16:00:00Z',
    },
    // Composite convergence
    {
      candidateId: 'CAND-COMP-006',
      candidateType: DataEnginePriorityCandidateType.COMPOSITE_PRIORITY_CANDIDATE,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-HIGH-CONVERGENCE-004',
      candidateValue: {
        domains: ['component', 'service', 'temporal'],
        domainCount: 3,
      },
      confidence: 0.92,
      createdAt: '2024-02-01T16:00:00Z',
    },
  ],
};

/**
 * Expected Scoring Result:
 *
 * vehicleScores:
 * - COMPONENT_HEALTH_SCORE: 85
 *   (High recurrence + 0.95 confidence)
 * - SERVICE_DEPENDENCY_SCORE: 72
 *   (Dense cluster + 0.93 confidence)
 * - USAGE_INTENSITY_SCORE: 68
 *   (High density + 0.91 confidence)
 * - COMPOSITE_RISK_SCORE: 90
 *   (3-domain convergence with high confidence)
 *
 * summary: {
 *   totalScores: 4,
 *   scoreDistribution: {
 *     "COMPONENT_HEALTH_SCORE": 1,
 *     "SERVICE_DEPENDENCY_SCORE": 1,
 *     "USAGE_INTENSITY_SCORE": 1,
 *     "COMPOSITE_RISK_SCORE": 1
 *   },
 *   highestScore: 90,
 *   lowestScore: 68,
 *   averageScore: 79,
 *   averageConfidence: 0.93 (very high),
 *   highConfidenceScoreCount: 4
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// Test/Demonstration Function
// ─────────────────────────────────────────────────────────────────────────────

export function demonstratePhase11Scoring(): void {
  console.log('=== Phase 11 Deterministic Scoring Engine ===\n');

  // Example 1
  console.log('Example 1: Component-Focused Scoring');
  const result1 = calculateVehicleScores(exampleComponentFocusedScoring);
  console.log(`  Total Scores: ${result1.summary.totalScores}`);
  console.log(`  Score Types: ${Object.keys(result1.summary.scoreDistribution).join(', ')}`);
  result1.vehicleScores.forEach((score) => {
    console.log(
      `    • ${score.scoreType}: ${score.scoreValue} (confidence: ${score.confidence})`
    );
  });
  console.log();

  // Example 2
  console.log('Example 2: Multi-Domain Scoring with Composite Risk');
  const result2 = calculateVehicleScores(exampleMultiDomainScoring);
  console.log(`  Total Scores: ${result2.summary.totalScores}`);
  console.log(`  Average Score: ${result2.summary.averageScore}`);
  console.log(`  Average Confidence: ${result2.summary.averageConfidence}`);
  result2.vehicleScores.forEach((score) => {
    console.log(
      `    • ${score.scoreType}: ${score.scoreValue} (confidence: ${score.confidence})`
    );
  });
  console.log();

  // Example 3
  console.log('Example 3: Service-Focused Scoring');
  const result3 = calculateVehicleScores(exampleServiceFocusedScoring);
  console.log(`  Total Scores: ${result3.summary.totalScores}`);
  console.log(`  Score Range: ${result3.summary.lowestScore}-${result3.summary.highestScore}`);
  result3.vehicleScores.forEach((score) => {
    console.log(`    • ${score.scoreType}: ${score.scoreValue}`);
  });
  console.log();

  // Example 4
  console.log('Example 4: High-Confidence Convergence');
  const result4 = calculateVehicleScores(exampleHighConfidenceConvergence);
  console.log(`  Total Scores: ${result4.summary.totalScores}`);
  console.log(
    `  High Confidence Scores: ${result4.summary.highConfidenceScoreCount}/${result4.summary.totalScores}`
  );
  result4.vehicleScores.forEach((score) => {
    console.log(
      `    • ${score.scoreType}: ${score.scoreValue} (confidence: ${score.confidence})`
    );
  });
}
