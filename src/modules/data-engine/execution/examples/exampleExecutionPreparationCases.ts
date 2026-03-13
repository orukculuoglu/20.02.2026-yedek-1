/**
 * Example Execution Preparation Cases
 *
 * Four realistic scenarios demonstrating execution candidate preparation
 * from different timeline entry patterns.
 */

import type { DataEngineExecutionCandidateInput } from '../models/DataEngineExecutionCandidateInput';
import type { DataEngineTimelineEntry } from '../../timeline/models/DataEngineTimelineEntry';
import {
  MONITORING_ENTRY,
  SERVICE_INSPECTION_ENTRY,
  MAINTENANCE_REVIEW_ENTRY,
  URGENT_REVIEW_ENTRY,
  CRITICAL_ATTENTION_ENTRY,
} from '../../timeline/types/DataEngineTimelineEntryType';
import { LOW, MEDIUM, HIGH, CRITICAL } from '../../timeline/types/DataEngineTimelinePriority';
import { NEXT_90_DAYS, NEXT_30_DAYS, NEXT_SERVICE_WINDOW, IMMEDIATE } from '../../timeline/types/DataEngineTimelineSchedulingWindow';
import { prepareExecutionCandidates } from '../engine/prepareExecutionCandidates';

/**
 * SCENARIO 1: Minimal Timeline Entries
 *
 * Timeline produces only monitoring entries.
 * Execution preparation creates monitoring task candidates.
 */
export function exampleScenario1_MinimalMonitoring(): DataEngineExecutionCandidateInput {
  const timestamp = new Date().toISOString();

  const timelineEntries: DataEngineTimelineEntry[] = [
    {
      timelineEntryId: 'timeline-001-monitor',
      timelineType: MONITORING_ENTRY,
      priority: LOW,
      identityId: 'vehicle-001',
      sourceEntityRef: 'priority-candidate-001',
      sourceEvaluationRefs: ['eval-001-composite'],
      scheduledWindow: NEXT_90_DAYS,
      rationale: 'Monitor entry from WATCH timeline → monitoring task',
      createdAt: timestamp,
      properties: {},
    },
  ];

  return {
    identityId: 'vehicle-001',
    sourceEntityRef: 'priority-candidate-001',
    timelineEntries,
    preparedAt: timestamp,
  };
}

/**
 * SCENARIO 2: Mixed Timeline Entries
 *
 * Timeline produces monitoring, inspection, and maintenance entries.
 * Execution preparation creates mixed task candidates.
 */
export function exampleScenario2_MixedTimelines(): DataEngineExecutionCandidateInput {
  const timestamp = new Date().toISOString();

  const timelineEntries: DataEngineTimelineEntry[] = [
    {
      timelineEntryId: 'timeline-002-monitor',
      timelineType: MONITORING_ENTRY,
      priority: MEDIUM,
      identityId: 'vehicle-002',
      sourceEntityRef: 'priority-candidate-002',
      sourceEvaluationRefs: ['eval-002-component'],
      scheduledWindow: NEXT_30_DAYS,
      rationale: 'Monitor entry from WATCH timeline (MEDIUM priority)',
      createdAt: timestamp,
      properties: {},
    },
    {
      timelineEntryId: 'timeline-002-inspection',
      timelineType: SERVICE_INSPECTION_ENTRY,
      priority: HIGH,
      identityId: 'vehicle-002',
      sourceEntityRef: 'priority-candidate-002',
      sourceEvaluationRefs: ['eval-002-service'],
      scheduledWindow: NEXT_SERVICE_WINDOW,
      rationale: 'Service inspection entry from ESCALATE timeline (HIGH priority)',
      createdAt: timestamp,
      properties: {},
    },
    {
      timelineEntryId: 'timeline-002-maintenance',
      timelineType: MAINTENANCE_REVIEW_ENTRY,
      priority: MEDIUM,
      identityId: 'vehicle-002',
      sourceEntityRef: 'priority-candidate-002',
      sourceEvaluationRefs: ['eval-002-actor'],
      scheduledWindow: NEXT_30_DAYS,
      rationale: 'Maintenance review entry from ESCALATE timeline (MEDIUM priority)',
      createdAt: timestamp,
      properties: {},
    },
  ];

  return {
    identityId: 'vehicle-002',
    sourceEntityRef: 'priority-candidate-002',
    timelineEntries,
    preparedAt: timestamp,
  };
}

/**
 * SCENARIO 3: High-Severity Timeline Entries
 *
 * Timeline produces urgent and critical entries.
 * Execution preparation creates high-priority review and intervention task candidates.
 */
export function exampleScenario3_SevereTimelines(): DataEngineExecutionCandidateInput {
  const timestamp = new Date().toISOString();

  const timelineEntries: DataEngineTimelineEntry[] = [
    {
      timelineEntryId: 'timeline-003-inspection',
      timelineType: SERVICE_INSPECTION_ENTRY,
      priority: HIGH,
      identityId: 'vehicle-003',
      sourceEntityRef: 'priority-candidate-003',
      sourceEvaluationRefs: ['eval-003-temporal'],
      scheduledWindow: NEXT_SERVICE_WINDOW,
      rationale: 'Service inspection from ESCALATE timeline (HIGH priority)',
      createdAt: timestamp,
      properties: {},
    },
    {
      timelineEntryId: 'timeline-003-urgent',
      timelineType: URGENT_REVIEW_ENTRY,
      priority: HIGH,
      identityId: 'vehicle-003',
      sourceEntityRef: 'priority-candidate-003',
      sourceEvaluationRefs: ['eval-003-composite'],
      scheduledWindow: NEXT_SERVICE_WINDOW,
      rationale: 'Urgent review from REJECTED timeline (HIGH priority)',
      createdAt: timestamp,
      properties: {},
    },
  ];

  return {
    identityId: 'vehicle-003',
    sourceEntityRef: 'priority-candidate-003',
    timelineEntries,
    preparedAt: timestamp,
  };
}

/**
 * SCENARIO 4: Critical Timeline Entries
 *
 * Timeline produces critical attention entries.
 * Execution preparation creates critical intervention task candidates.
 */
export function exampleScenario4_CriticalTimelines(): DataEngineExecutionCandidateInput {
  const timestamp = new Date().toISOString();

  const timelineEntries: DataEngineTimelineEntry[] = [
    {
      timelineEntryId: 'timeline-004-critical-1',
      timelineType: CRITICAL_ATTENTION_ENTRY,
      priority: CRITICAL,
      identityId: 'vehicle-004',
      sourceEntityRef: 'priority-candidate-004',
      sourceEvaluationRefs: ['eval-004-component'],
      scheduledWindow: IMMEDIATE,
      rationale: 'Critical attention from component convergence (CRITICAL priority)',
      createdAt: timestamp,
      properties: {},
    },
    {
      timelineEntryId: 'timeline-004-critical-2',
      timelineType: CRITICAL_ATTENTION_ENTRY,
      priority: CRITICAL,
      identityId: 'vehicle-004',
      sourceEntityRef: 'priority-candidate-004',
      sourceEvaluationRefs: ['eval-004-composite'],
      scheduledWindow: IMMEDIATE,
      rationale: 'Critical attention from multi-domain convergence (CRITICAL priority)',
      createdAt: timestamp,
      properties: {},
    },
  ];

  return {
    identityId: 'vehicle-004',
    sourceEntityRef: 'priority-candidate-004',
    timelineEntries,
    preparedAt: timestamp,
  };
}

/**
 * Helper function to print execution preparation results
 */
export function printExecutionPreparationResult(
  title: string,
  input: DataEngineExecutionCandidateInput
): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(60)}`);

  const result = prepareExecutionCandidates(input);

  console.log(`\nExecution Candidates Prepared: ${result.preparedAt}`);
  console.log(`Total Candidates: ${result.summary.totalCandidates}`);
  console.log(`Highest Priority: ${result.summary.highestPriority || 'N/A'}`);
  console.log(`Immediate Candidates: ${result.summary.immediateCandidateCount}`);

  console.log(`\nTask Type Distribution:`, result.summary.taskTypeDistribution);
  console.log(`Priority Distribution:`, result.summary.priorityDistribution);

  if (result.executionCandidates.length > 0) {
    console.log(`\nExecution Candidates:`);
    for (const candidate of result.executionCandidates) {
      console.log(`  - ${candidate.executionTaskType} (${candidate.priority})`);
      console.log(`    Window: ${candidate.suggestedWindow}`);
      console.log(`    Rationale: ${candidate.rationale}`);
    }
  }
}

/**
 * Run all example scenarios
 */
export function runExamples(): void {
  console.log('\n\nPhase 14: Execution Preparation Examples\n');

  const scenario1 = exampleScenario1_MinimalMonitoring();
  printExecutionPreparationResult('SCENARIO 1: Minimal Timeline (Monitoring Only)', scenario1);

  const scenario2 = exampleScenario2_MixedTimelines();
  printExecutionPreparationResult('SCENARIO 2: Mixed Timeline Entries', scenario2);

  const scenario3 = exampleScenario3_SevereTimelines();
  printExecutionPreparationResult('SCENARIO 3: Severe Timeline Entries', scenario3);

  const scenario4 = exampleScenario4_CriticalTimelines();
  printExecutionPreparationResult('SCENARIO 4: Critical Timeline Entries', scenario4);
}
