/**
 * Example Signal Preparation Cases — Phase 7
 *
 * Realistic demonstrations of Phase 7 signal preparation.
 * Shows how Phase 6 index records transform to Phase 7 signals.
 *
 * These examples demonstrate:
 * 1. Timeline density signal construction
 * 2. Component recurrence signal
 * 3. Actor concentration signal
 * 4. Event type frequency signal
 */

import type { DataEngineSignalPreparationCandidate } from '../models/DataEngineSignalPreparationCandidate';
import { prepareSignals } from '../engine/prepareSignals';
import { DataEngineIndexRecordType } from '../../indexing/types/DataEngineIndexRecordType';

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: Single Component Recurrence Scenario
// ─────────────────────────────────────────────────────────────────────────────

export const exampleSingleComponentRecurrenceSignalPreparation: DataEngineSignalPreparationCandidate = {
  identityId: 'VEH-2024-001',
  sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
  preparedAt: '2024-01-15T09:30:00Z',
  preparedRecords: [
    {
      recordId: 'record-timeline-1',
      recordType: DataEngineIndexRecordType.VEHICLE_TIMELINE,
      identityId: 'VEH-2024-001',
      sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
      indexKey: 'timestamp',
      indexValue: '2024-01-15T09:00:00Z',
      sortableTimestamp: '2024-01-15T09:00:00Z',
      properties: {
        nodeId: 'EVENT:1',
        nodeType: 'EVENT',
        semanticClass: 'MAINTENANCE_RECORD',
        sequencePosition: 0,
      },
      preparedAt: '2024-01-15T09:30:00Z',
    },
    {
      recordId: 'record-component-1',
      recordType: DataEngineIndexRecordType.VEHICLE_COMPONENT,
      identityId: 'VEH-2024-001',
      sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
      indexKey: 'oil_system',
      indexValue: 'oil_system',
      properties: {
        canonicalComponent: 'oil_system',
        involvementCount: 3,
        involvedInEventTypes: ['MAINTENANCE_RECORD'],
      },
      preparedAt: '2024-01-15T09:30:00Z',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: Multi-Day Timeline with Density Clustering
// ─────────────────────────────────────────────────────────────────────────────

export const exampleMultiDayTimelineDensitySignalPreparation: DataEngineSignalPreparationCandidate = {
  identityId: 'VEH-2024-002',
  sourceEntityRef: 'ENTITY-MULTI-DAY-001',
  preparedAt: '2024-02-01T16:00:00Z',
  preparedRecords: [
    // Day 1 - Single event
    {
      recordId: 'record-timeline-1',
      recordType: DataEngineIndexRecordType.VEHICLE_TIMELINE,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-MULTI-DAY-001',
      indexKey: 'timestamp',
      indexValue: '2024-01-10T08:00:00Z',
      sortableTimestamp: '2024-01-10T08:00:00Z',
      properties: { nodeId: 'EVENT:1', semanticClass: 'MAINTENANCE_RECORD', sequencePosition: 0 },
      preparedAt: '2024-02-01T16:00:00Z',
    },
    // Day 2 - Multiple events (density trigger)
    {
      recordId: 'record-timeline-2',
      recordType: DataEngineIndexRecordType.VEHICLE_TIMELINE,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-MULTI-DAY-001',
      indexKey: 'timestamp',
      indexValue: '2024-01-25T10:30:00Z',
      sortableTimestamp: '2024-01-25T10:30:00Z',
      properties: { nodeId: 'EVENT:2', semanticClass: 'DIAGNOSTIC_INSPECTION', sequencePosition: 1 },
      preparedAt: '2024-02-01T16:00:00Z',
    },
    {
      recordId: 'record-timeline-3',
      recordType: DataEngineIndexRecordType.VEHICLE_TIMELINE,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-MULTI-DAY-001',
      indexKey: 'timestamp',
      indexValue: '2024-01-25T14:00:00Z',
      sortableTimestamp: '2024-01-25T14:00:00Z',
      properties: { nodeId: 'EVENT:3', semanticClass: 'REPAIR_REQUEST', sequencePosition: 2 },
      preparedAt: '2024-02-01T16:00:00Z',
    },
    // Actor concentration
    {
      recordId: 'record-actor-1',
      recordType: DataEngineIndexRecordType.VEHICLE_ACTOR,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-MULTI-DAY-001',
      indexKey: 'WORKSHOP_A:MECHANIC',
      indexValue: 'MECHANIC',
      properties: {
        sourceId: 'WORKSHOP_A',
        role: 'MECHANIC',
        involvementCount: 3,
      },
      preparedAt: '2024-02-01T16:00:00Z',
    },
    // Event type frequency
    {
      recordId: 'record-eventtype-1',
      recordType: DataEngineIndexRecordType.VEHICLE_EVENT_TYPE,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-MULTI-DAY-001',
      indexKey: 'MAINTENANCE_RECORD',
      indexValue: '2',
      sortableTimestamp: '2024-01-25T14:00:00Z',
      properties: {
        family: 'MAINTENANCE_RECORD',
        count: 2,
        latestTimestamp: '2024-01-25T14:00:00Z',
      },
      preparedAt: '2024-02-01T16:00:00Z',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: High Component Recurrence with Actor Concentration
// ─────────────────────────────────────────────────────────────────────────────

export const exampleHighComponentRecurrenceSignalPreparation: DataEngineSignalPreparationCandidate = {
  identityId: 'VEH-2024-003',
  sourceEntityRef: 'ENTITY-BRAKE-ISSUES-001',
  preparedAt: '2024-02-15T10:00:00Z',
  preparedRecords: [
    // Multiple timeline events
    {
      recordId: 'record-timeline-1',
      recordType: DataEngineIndexRecordType.VEHICLE_TIMELINE,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-BRAKE-ISSUES-001',
      indexKey: 'timestamp',
      indexValue: '2024-01-05T09:00:00Z',
      sortableTimestamp: '2024-01-05T09:00:00Z',
      properties: { nodeId: 'EVENT:1', semanticClass: 'DIAGNOSTIC_INSPECTION', sequencePosition: 0 },
      preparedAt: '2024-02-15T10:00:00Z',
    },
    {
      recordId: 'record-timeline-2',
      recordType: DataEngineIndexRecordType.VEHICLE_TIMELINE,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-BRAKE-ISSUES-001',
      indexKey: 'timestamp',
      indexValue: '2024-01-15T11:00:00Z',
      sortableTimestamp: '2024-01-15T11:00:00Z',
      properties: { nodeId: 'EVENT:2', semanticClass: 'REPAIR_REQUEST', sequencePosition: 1 },
      preparedAt: '2024-02-15T10:00:00Z',
    },
    {
      recordId: 'record-timeline-3',
      recordType: DataEngineIndexRecordType.VEHICLE_TIMELINE,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-BRAKE-ISSUES-001',
      indexKey: 'timestamp',
      indexValue: '2024-02-05T10:30:00Z',
      sortableTimestamp: '2024-02-05T10:30:00Z',
      properties: { nodeId: 'EVENT:3', semanticClass: 'DIAGNOSTIC_INSPECTION', sequencePosition: 2 },
      preparedAt: '2024-02-15T10:00:00Z',
    },
    // High recurrence component
    {
      recordId: 'record-component-1',
      recordType: DataEngineIndexRecordType.VEHICLE_COMPONENT,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-BRAKE-ISSUES-001',
      indexKey: 'brake_pad',
      indexValue: 'brake_pad',
      properties: {
        canonicalComponent: 'brake_pad',
        involvementCount: 5,
        involvedInEventTypes: ['DIAGNOSTIC_INSPECTION', 'REPAIR_REQUEST'],
      },
      preparedAt: '2024-02-15T10:00:00Z',
    },
    // Concentrated actor
    {
      recordId: 'record-actor-1',
      recordType: DataEngineIndexRecordType.VEHICLE_ACTOR,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-BRAKE-ISSUES-001',
      indexKey: 'DIAGNOSTIC_CENTER:INSPECTOR',
      indexValue: 'INSPECTOR',
      properties: {
        sourceId: 'DIAGNOSTIC_CENTER',
        role: 'INSPECTOR',
        involvementCount: 3,
      },
      preparedAt: '2024-02-15T10:00:00Z',
    },
    // Event type frequency
    {
      recordId: 'record-eventtype-1',
      recordType: DataEngineIndexRecordType.VEHICLE_EVENT_TYPE,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-BRAKE-ISSUES-001',
      indexKey: 'DIAGNOSTIC_INSPECTION',
      indexValue: '2',
      sortableTimestamp: '2024-02-05T10:30:00Z',
      properties: {
        family: 'DIAGNOSTIC_INSPECTION',
        count: 2,
        latestTimestamp: '2024-02-05T10:30:00Z',
      },
      preparedAt: '2024-02-15T10:00:00Z',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE EXECUTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Demonstrate Phase 7 in action: transform Phase 6 index records to phase 7 signal candidates.
 */
export function demonstratePhase7SignalPreparation() {
  console.log('='.repeat(80));
  console.log('PHASE 7 SIGNAL PREPARATION EXAMPLES');
  console.log('='.repeat(80));

  // Example 1
  console.log('\n[Example 1] Single Component Recurrence\n');
  const result1 = prepareSignals(exampleSingleComponentRecurrenceSignalPreparation);
  console.log(`✓ Prepared ${result1.summary.totalSignalsPrepared} signals`);
  console.log(`  - Timeline Density: ${result1.summary.signalsByType['TIMELINE_DENSITY'] || 0}`);
  console.log(`  - Component Recurrence: ${result1.summary.signalsByType['COMPONENT_RECURRENCE'] || 0}`);
  console.log(`  - Actor Concentration: ${result1.summary.signalsByType['ACTOR_CONCENTRATION'] || 0}`);
  console.log(`  - Event Type Frequency: ${result1.summary.signalsByType['EVENT_TYPE_FREQUENCY'] || 0}`);

  // Example 2
  console.log('\n[Example 2] Multi-Day Timeline with Density Clustering\n');
  const result2 = prepareSignals(exampleMultiDayTimelineDensitySignalPreparation);
  console.log(`✓ Prepared ${result2.summary.totalSignalsPrepared} signals`);
  console.log(`  - Timeline Density: ${result2.summary.signalsByType['TIMELINE_DENSITY'] || 0}`);
  console.log(`  - Component Recurrence: ${result2.summary.signalsByType['COMPONENT_RECURRENCE'] || 0}`);
  console.log(`  - Actor Concentration: ${result2.summary.signalsByType['ACTOR_CONCENTRATION'] || 0}`);
  console.log(`  - Event Type Frequency: ${result2.summary.signalsByType['EVENT_TYPE_FREQUENCY'] || 0}`);

  // Example 3
  console.log('\n[Example 3] High Component Recurrence with Actor Concentration\n');
  const result3 = prepareSignals(exampleHighComponentRecurrenceSignalPreparation);
  console.log(`✓ Prepared ${result3.summary.totalSignalsPrepared} signals`);
  console.log(`  - Timeline Density: ${result3.summary.signalsByType['TIMELINE_DENSITY'] || 0}`);
  console.log(`  - Component Recurrence: ${result3.summary.signalsByType['COMPONENT_RECURRENCE'] || 0}`);
  console.log(`  - Actor Concentration: ${result3.summary.signalsByType['ACTOR_CONCENTRATION'] || 0}`);
  console.log(`  - Event Type Frequency: ${result3.summary.signalsByType['EVENT_TYPE_FREQUENCY'] || 0}`);

  console.log('\n' + '='.repeat(80));
  console.log('Phase 7 remains a preparation layer—not a decision or risk engine.');
  console.log('='.repeat(80));
}
