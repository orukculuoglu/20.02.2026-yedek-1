/**
 * Example Timeline Calculation Cases
 *
 * Four realistic scenarios demonstrating timeline generation
 * from different acceptance evaluation patterns.
 */

import { createHash } from 'crypto';
import type { DataEngineTimelineCandidate } from '../models/DataEngineTimelineCandidate';
import type { DataEngineAcceptanceEvaluation } from '../../acceptance/models/DataEngineAcceptanceEvaluation';
import {
  COMPONENT_HEALTH_EVALUATION,
  SERVICE_DEPENDENCY_EVALUATION,
  ACTOR_CONCENTRATION_EVALUATION,
  USAGE_INTENSITY_EVALUATION,
  COMPOSITE_RISK_EVALUATION,
} from '../../acceptance/types/DataEngineAcceptanceEvaluationType';
import { buildOperationalTimeline } from '../engine/buildOperationalTimeline';

/**
 * SCENARIO 1: All Evaluations ACCEPTED
 *
 * Vehicle passes all acceptance criteria with high confidence.
 * Result: Minimal timeline entries (monitoring only)
 */
export function exampleScenario1_AllAccepted(): DataEngineTimelineCandidate {
  const timestamp = new Date().toISOString();

  const acceptanceEvaluations: DataEngineAcceptanceEvaluation[] = [
    {
      evaluationId: 'eval-001-component',
      identityId: 'vehicle-001',
      sourceEntityRef: 'component-health-score',
      evaluationType: COMPONENT_HEALTH_EVALUATION,
      acceptanceStatus: 'ACCEPTED',
      confidence: 0.92,
      evaluationBasis: 'All components within normal operating parameters',
      thresholdApplied: 'acceptedMax: 40',
      sourceScoreRefs: ['score-001-component'],
      evaluatedAt: timestamp,
      properties: {},
    },
    {
      evaluationId: 'eval-001-service',
      identityId: 'vehicle-001',
      sourceEntityRef: 'service-dependency-score',
      evaluationType: SERVICE_DEPENDENCY_EVALUATION,
      acceptanceStatus: 'ACCEPTED',
      confidence: 0.88,
      evaluationBasis: 'Service dependency within acceptable thresholds',
      thresholdApplied: 'acceptedMax: 35',
      sourceScoreRefs: ['score-001-service'],
      evaluatedAt: timestamp,
      properties: {},
    },
    {
      evaluationId: 'eval-001-composite',
      identityId: 'vehicle-001',
      sourceEntityRef: 'composite-risk-score',
      evaluationType: COMPOSITE_RISK_EVALUATION,
      acceptanceStatus: 'ACCEPTED',
      confidence: 0.94,
      evaluationBasis: 'Multi-domain risk alignment acceptable',
      thresholdApplied: 'acceptedMax: 38',
      sourceScoreRefs: ['score-001-composite'],
      evaluatedAt: timestamp,
      properties: {},
    },
  ];

  return {
    identityId: 'vehicle-001',
    sourceEntityRef: 'priority-candidate-001',
    acceptanceEvaluations,
    timelineGeneratedAt: timestamp,
  };
}

/**
 * SCENARIO 2: Mixed WATCH and ESCALATE
 *
 * Vehicle has some concerning signals requiring monitoring and inspection.
 * Result: Multiple monitoring and inspection entries
 */
export function exampleScenario2_MixedWatchEscalate(): DataEngineTimelineCandidate {
  const timestamp = new Date().toISOString();

  const acceptanceEvaluations: DataEngineAcceptanceEvaluation[] = [
    {
      evaluationId: 'eval-002-component',
      identityId: 'vehicle-002',
      sourceEntityRef: 'component-health-score',
      evaluationType: COMPONENT_HEALTH_EVALUATION,
      acceptanceStatus: 'WATCH',
      confidence: 0.72,
      evaluationBasis: 'Hydraulic system showing mild degradation - monitor for trends',
      thresholdApplied: 'watchMax: 70',
      sourceScoreRefs: ['score-002-component'],
      evaluatedAt: timestamp,
      properties: {},
    },
    {
      evaluationId: 'eval-002-service',
      identityId: 'vehicle-002',
      sourceEntityRef: 'service-dependency-score',
      evaluationType: SERVICE_DEPENDENCY_EVALUATION,
      acceptanceStatus: 'ESCALATE',
      confidence: 0.81,
      evaluationBasis: 'Service interval approaching - schedule preventive maintenance',
      thresholdApplied: 'escalateMax: 90',
      sourceScoreRefs: ['score-002-service'],
      evaluatedAt: timestamp,
      properties: {},
    },
    {
      evaluationId: 'eval-002-actor',
      identityId: 'vehicle-002',
      sourceEntityRef: 'actor-concentration-score',
      evaluationType: ACTOR_CONCENTRATION_EVALUATION,
      acceptanceStatus: 'WATCH',
      confidence: 0.68,
      evaluationBasis: 'Single repair provider concentration - diversify if possible',
      thresholdApplied: 'watchMax: 65',
      sourceScoreRefs: ['score-002-actor'],
      evaluatedAt: timestamp,
      properties: {},
    },
  ];

  return {
    identityId: 'vehicle-002',
    sourceEntityRef: 'priority-candidate-002',
    acceptanceEvaluations,
    timelineGeneratedAt: timestamp,
  };
}

/**
 * SCENARIO 3: High-Severity ESCALATE and REJECTED
 *
 * Vehicle shows concerning patterns requiring urgent action and critical review.
 * Result: Urgent and critical entries with immediate/short windows
 */
export function exampleScenario3_SevereEscalateRejected(): DataEngineTimelineCandidate {
  const timestamp = new Date().toISOString();

  const acceptanceEvaluations: DataEngineAcceptanceEvaluation[] = [
    {
      evaluationId: 'eval-003-composite',
      identityId: 'vehicle-003',
      sourceEntityRef: 'composite-risk-score',
      evaluationType: COMPOSITE_RISK_EVALUATION,
      acceptanceStatus: 'REJECTED',
      confidence: 0.94,
      evaluationBasis: 'Multi-domain risk convergence - component + service + temporal signals all concerning',
      thresholdApplied: 'escalateMax: 90',
      sourceScoreRefs: ['score-003-composite'],
      evaluatedAt: timestamp,
      properties: {},
    },
    {
      evaluationId: 'eval-003-temporal',
      identityId: 'vehicle-003',
      sourceEntityRef: 'usage-intensity-score',
      evaluationType: USAGE_INTENSITY_EVALUATION,
      acceptanceStatus: 'ESCALATE',
      confidence: 0.87,
      evaluationBasis: 'High usage intensity detected - accelerated wear patterns',
      thresholdApplied: 'escalateMax: 85',
      sourceScoreRefs: ['score-003-temporal'],
      evaluatedAt: timestamp,
      properties: {},
    },
    {
      evaluationId: 'eval-003-component',
      identityId: 'vehicle-003',
      sourceEntityRef: 'component-health-score',
      evaluationType: COMPONENT_HEALTH_EVALUATION,
      acceptanceStatus: 'REJECTED',
      confidence: 0.91,
      evaluationBasis: 'Critical component showing rapid degradation - immediate attention required',
      thresholdApplied: 'escalateMax: 90',
      sourceScoreRefs: ['score-003-component'],
      evaluatedAt: timestamp,
      properties: {},
    },
  ];

  return {
    identityId: 'vehicle-003',
    sourceEntityRef: 'priority-candidate-003',
    acceptanceEvaluations,
    timelineGeneratedAt: timestamp,
  };
}

/**
 * SCENARIO 4: Consensus REJECTED from Multiple Domains
 *
 * Vehicle shows critical alignment across multiple evaluation domains.
 * Result: Multiple critical entries with immediate attention required
 */
export function exampleScenario4_CriticalConsensus(): DataEngineTimelineCandidate {
  const timestamp = new Date().toISOString();

  const acceptanceEvaluations: DataEngineAcceptanceEvaluation[] = [
    {
      evaluationId: 'eval-004-component',
      identityId: 'vehicle-004',
      sourceEntityRef: 'component-health-score',
      evaluationType: COMPONENT_HEALTH_EVALUATION,
      acceptanceStatus: 'REJECTED',
      confidence: 0.96,
      evaluationBasis: 'Multiple critical component failures detected',
      thresholdApplied: 'escalateMax: 90',
      sourceScoreRefs: ['score-004-component'],
      evaluatedAt: timestamp,
      properties: {},
    },
    {
      evaluationId: 'eval-004-service',
      identityId: 'vehicle-004',
      sourceEntityRef: 'service-dependency-score',
      evaluationType: SERVICE_DEPENDENCY_EVALUATION,
      acceptanceStatus: 'REJECTED',
      confidence: 0.93,
      evaluationBasis: 'Unresolved service dependencies creating cascading risk',
      thresholdApplied: 'escalateMax: 90',
      sourceScoreRefs: ['score-004-service'],
      evaluatedAt: timestamp,
      properties: {},
    },
    {
      evaluationId: 'eval-004-temporal',
      identityId: 'vehicle-004',
      sourceEntityRef: 'usage-intensity-score',
      evaluationType: USAGE_INTENSITY_EVALUATION,
      acceptanceStatus: 'REJECTED',
      confidence: 0.89,
      evaluationBasis: 'Extreme usage intensity with critical wear acceleration',
      thresholdApplied: 'escalateMax: 85',
      sourceScoreRefs: ['score-004-temporal'],
      evaluatedAt: timestamp,
      properties: {},
    },
    {
      evaluationId: 'eval-004-composite',
      identityId: 'vehicle-004',
      sourceEntityRef: 'composite-risk-score',
      evaluationType: COMPOSITE_RISK_EVALUATION,
      acceptanceStatus: 'REJECTED',
      confidence: 0.97,
      evaluationBasis: 'Perfect storm convergence - all domains critical and aligned',
      thresholdApplied: 'escalateMax: 90',
      sourceScoreRefs: ['score-004-composite'],
      evaluatedAt: timestamp,
      properties: {},
    },
  ];

  return {
    identityId: 'vehicle-004',
    sourceEntityRef: 'priority-candidate-004',
    acceptanceEvaluations,
    timelineGeneratedAt: timestamp,
  };
}

/**
 * Helper function to print timeline results
 */
export function printTimelineResult(title: string, candidate: DataEngineTimelineCandidate): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(60)}`);

  const result = buildOperationalTimeline(candidate);

  console.log(`\nTimeline Generated: ${result.timelineGeneratedAt}`);
  console.log(`Total Entries: ${result.summary.totalEntries}`);
  console.log(`Highest Priority: ${result.summary.highestPriority || 'N/A'}`);
  console.log(`Earliest Window: ${result.summary.earliestWindow || 'N/A'}`);

  console.log(`\nPriority Distribution:`, result.summary.priorityDistribution);
  console.log(`Type Distribution:`, result.summary.timelineTypeDistribution);

  if (result.timelineEntries.length > 0) {
    console.log(`\nTimeline Entries:`);
    for (const entry of result.timelineEntries) {
      console.log(`  - ${entry.timelineType} (${entry.priority})`);
      console.log(`    Window: ${entry.scheduledWindow}`);
      console.log(`    Rationale: ${entry.rationale}`);
    }
  }
}

/**
 * Run all example scenarios
 */
export function runExamples(): void {
  console.log('\n\nPhase 13: Timeline/Workflow Engine Examples\n');

  const scenario1 = exampleScenario1_AllAccepted();
  printTimelineResult('SCENARIO 1: All Evaluations ACCEPTED', scenario1);

  const scenario2 = exampleScenario2_MixedWatchEscalate();
  printTimelineResult('SCENARIO 2: Mixed WATCH and ESCALATE', scenario2);

  const scenario3 = exampleScenario3_SevereEscalateRejected();
  printTimelineResult('SCENARIO 3: High-Severity ESCALATE and REJECTED', scenario3);

  const scenario4 = exampleScenario4_CriticalConsensus();
  printTimelineResult('SCENARIO 4: Critical Consensus REJECTED from All Domains', scenario4);
}
