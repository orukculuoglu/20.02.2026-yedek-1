/**
 * Example Work Order Preparation Cases
 *
 * Four realistic scenarios demonstrating work order candidate preparation
 * from different execution candidate patterns.
 */

import type { DataEngineWorkOrderCandidateInput } from '../models/DataEngineWorkOrderCandidateInput';
import { createWorkOrderCandidates } from '../engine/prepareWorkOrderCandidates';

/**
 * Helper to create example execution result from Phase 14
 * This simulates the output of Phase 14 that Phase 15 receives as input
 */
function createExampleExecutionResult(
  identityId: string,
  sourceEntityRef: string,
  executionCandidates: any[]
): DataEngineWorkOrderCandidateInput {
  return {
    identityId,
    sourceEntityRef,
    executionCandidates,
    summary: {
      totalCandidates: executionCandidates.length,
      taskTypeDistribution: {},
      priorityDistribution: {},
      highestPriority: 'CRITICAL',
      immediateCandidateCount: 0,
      criticalCandidateCount: 0,
    },
    preparedAt: new Date().toISOString(),
  };
}

/**
 * SCENARIO 1: Single Monitoring Task
 *
 * Phase 14 produces 1 monitoring execution candidate.
 * Phase 15 converts to 1 monitoring work order candidate.
 */
export function exampleScenario1_MonitoringOnly(): DataEngineWorkOrderCandidateInput {
  const timestamp = new Date().toISOString();

  const executionCandidates = [
    {
      executionCandidateId: 'exec-001-monitor',
      executionTaskType: 'MONITORING_TASK',
      priority: 'LOW',
      identityId: 'vehicle-001',
      sourceEntityRef: 'priority-candidate-001',
      sourceTimelineRefs: ['timeline-001-monitor'],
      suggestedWindow: 'NEXT_90_DAYS',
      rationale: 'Monitor entry from WATCH timeline → monitoring task',
      preparedAt: timestamp,
      properties: {},
    },
  ];

  return createExampleExecutionResult('vehicle-001', 'priority-candidate-001', executionCandidates);
}

/**
 * SCENARIO 2: Mixed Execution Tasks
 *
 * Phase 14 produces monitoring, inspection, and maintenance tasks.
 * Phase 15 converts to mixed work order candidates.
 */
export function exampleScenario2_MixedExecutionTasks(): DataEngineWorkOrderCandidateInput {
  const timestamp = new Date().toISOString();

  const executionCandidates = [
    {
      executionCandidateId: 'exec-002-monitor',
      executionTaskType: 'MONITORING_TASK',
      priority: 'MEDIUM',
      identityId: 'vehicle-002',
      sourceEntityRef: 'priority-candidate-002',
      sourceTimelineRefs: ['timeline-002-monitor'],
      suggestedWindow: 'NEXT_30_DAYS',
      rationale: 'Monitor entry from WATCH timeline (MEDIUM priority)',
      preparedAt: timestamp,
      properties: {},
    },
    {
      executionCandidateId: 'exec-002-inspection',
      executionTaskType: 'INSPECTION_TASK',
      priority: 'HIGH',
      identityId: 'vehicle-002',
      sourceEntityRef: 'priority-candidate-002',
      sourceTimelineRefs: ['timeline-002-inspection'],
      suggestedWindow: 'NEXT_SERVICE_WINDOW',
      rationale: 'Service inspection task from ESCALATE timeline (HIGH priority)',
      preparedAt: timestamp,
      properties: {},
    },
    {
      executionCandidateId: 'exec-002-maintenance',
      executionTaskType: 'MAINTENANCE_PLANNING_TASK',
      priority: 'MEDIUM',
      identityId: 'vehicle-002',
      sourceEntityRef: 'priority-candidate-002',
      sourceTimelineRefs: ['timeline-002-maintenance'],
      suggestedWindow: 'NEXT_30_DAYS',
      rationale: 'Maintenance planning task from ESCALATE timeline (MEDIUM priority)',
      preparedAt: timestamp,
      properties: {},
    },
  ];

  return createExampleExecutionResult('vehicle-002', 'priority-candidate-002', executionCandidates);
}

/**
 * SCENARIO 3: High-Severity Execution Tasks
 *
 * Phase 14 produces diagnostic review and critical intervention tasks.
 * Phase 15 converts to high-priority work order candidates.
 */
export function exampleScenario3_SevereExecutionTasks(): DataEngineWorkOrderCandidateInput {
  const timestamp = new Date().toISOString();

  const executionCandidates = [
    {
      executionCandidateId: 'exec-003-diagnostic',
      executionTaskType: 'DIAGNOSTIC_REVIEW_TASK',
      priority: 'HIGH',
      identityId: 'vehicle-003',
      sourceEntityRef: 'priority-candidate-003',
      sourceTimelineRefs: ['timeline-003-urgent'],
      suggestedWindow: 'NEXT_SERVICE_WINDOW',
      rationale: 'Diagnostic review task from REJECTED timeline (HIGH priority)',
      preparedAt: timestamp,
      properties: {},
    },
    {
      executionCandidateId: 'exec-003-inspection',
      executionTaskType: 'INSPECTION_TASK',
      priority: 'HIGH',
      identityId: 'vehicle-003',
      sourceEntityRef: 'priority-candidate-003',
      sourceTimelineRefs: ['timeline-003-inspection'],
      suggestedWindow: 'NEXT_SERVICE_WINDOW',
      rationale: 'Inspection task from REJECTED timeline (HIGH priority)',
      preparedAt: timestamp,
      properties: {},
    },
  ];

  return createExampleExecutionResult('vehicle-003', 'priority-candidate-003', executionCandidates);
}

/**
 * SCENARIO 4: Critical Execution Tasks
 *
 * Phase 14 produces critical intervention tasks.
 * Phase 15 converts to critical-priority work order candidates.
 */
export function exampleScenario4_CriticalExecutionTasks(): DataEngineWorkOrderCandidateInput {
  const timestamp = new Date().toISOString();

  const executionCandidates = [
    {
      executionCandidateId: 'exec-004-critical-1',
      executionTaskType: 'CRITICAL_INTERVENTION_TASK',
      priority: 'CRITICAL',
      identityId: 'vehicle-004',
      sourceEntityRef: 'priority-candidate-004',
      sourceTimelineRefs: ['timeline-004-critical-1'],
      suggestedWindow: 'IMMEDIATE',
      rationale: 'Critical intervention task from converged signals (CRITICAL priority)',
      preparedAt: timestamp,
      properties: {},
    },
    {
      executionCandidateId: 'exec-004-critical-2',
      executionTaskType: 'CRITICAL_INTERVENTION_TASK',
      priority: 'CRITICAL',
      identityId: 'vehicle-004',
      sourceEntityRef: 'priority-candidate-004',
      sourceTimelineRefs: ['timeline-004-critical-2'],
      suggestedWindow: 'IMMEDIATE',
      rationale: 'Critical intervention task from multi-domain alignment (CRITICAL priority)',
      preparedAt: timestamp,
      properties: {},
    },
  ];

  return createExampleExecutionResult('vehicle-004', 'priority-candidate-004', executionCandidates);
}

/**
 * Helper function to print work order preparation results
 */
export function printWorkOrderPreparationResult(title: string, input: DataEngineWorkOrderCandidateInput): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(60)}`);

  const result = createWorkOrderCandidates(input);

  console.log(`\nWork Order Candidates Prepared: ${result.preparedAt}`);
  console.log(`Total Work Orders: ${result.summary.totalWorkOrderCandidates}`);
  console.log(`Highest Priority: ${result.summary.highestPriority || 'N/A'}`);
  console.log(`Immediate Work Orders: ${result.summary.immediateCandidateCount}`);

  console.log(`\nWork Order Type Distribution:`, result.summary.workOrderTypeDistribution);
  console.log(`Priority Distribution:`, result.summary.priorityDistribution);

  if (result.workOrderCandidates.length > 0) {
    console.log(`\nWork Order Candidates:`);
    for (const candidate of result.workOrderCandidates) {
      console.log(`  - ${candidate.workOrderType} (${candidate.priority})`);
      console.log(`    Window: ${candidate.suggestedWindow}`);
      console.log(`    Rationale: ${candidate.rationale}`);
      console.log(`    Actions: ${candidate.recommendedActions.join(', ')}`);
    }
  }
}

/**
 * Run all example scenarios
 */
export function runExamples(): void {
  console.log('\n\nPhase 15: Work Order Orchestration Examples\n');

  const scenario1 = exampleScenario1_MonitoringOnly();
  printWorkOrderPreparationResult('SCENARIO 1: Single Monitoring Task', scenario1);

  const scenario2 = exampleScenario2_MixedExecutionTasks();
  printWorkOrderPreparationResult('SCENARIO 2: Mixed Execution Tasks', scenario2);

  const scenario3 = exampleScenario3_SevereExecutionTasks();
  printWorkOrderPreparationResult('SCENARIO 3: Severe Execution Tasks', scenario3);

  const scenario4 = exampleScenario4_CriticalExecutionTasks();
  printWorkOrderPreparationResult('SCENARIO 4: Critical Execution Tasks', scenario4);
}
