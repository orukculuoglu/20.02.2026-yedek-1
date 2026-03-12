/**
 * Example Index Preparation Cases — Phase 6
 *
 * Realistic demonstrations of Phase 6 index preparation.
 * Shows how Phase 5 graph output transforms to Phase 6 index records.
 *
 * These examples demonstrate:
 * 1. Vehicle timeline index construction
 * 2. Component/asset dimension
 * 3. Actor involvement tracking
 * 4. Event type semantic grouping
 */

import type { DataEngineIndexPreparationCandidate } from '../models/DataEngineIndexPreparationCandidate';
import { prepareGraphIndexes } from '../engine/prepareGraphIndexes';

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: Oil Change Maintenance Event
// ─────────────────────────────────────────────────────────────────────────────

export const exampleOilChangeIndexPreparation: DataEngineIndexPreparationCandidate = {
  identityId: 'VEH-2024-001',
  sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
  attachedAt: '2024-01-15T09:30:00Z',
  nodes: [
    {
      nodeId: 'VEHICLE:VEH-2024-001',
      nodeType: 'VEHICLE',
      attachedAt: '2024-01-15T09:30:00Z',
      label: 'Vehicle (VEH-2024-001)',
      sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
      semanticClass: 'VEHICLE_ANCHOR',
      properties: { identityId: 'VEH-2024-001', bindingStatus: 'ACTIVE' },
    },
    {
      nodeId: 'EVENT:ENTITY-OIL-CHANGE-001',
      nodeType: 'EVENT',
      attachedAt: '2024-01-15T09:30:00Z',
      label: 'EVENT (MAINTENANCE_RECORD)',
      sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
      semanticClass: 'MAINTENANCE_RECORD',
      properties: {
        entityType: 'MAINTENANCE_RECORD',
        sourceSystem: 'SAFECORE_SYSTEM',
        eventTimestamp: '2024-01-15T09:00:00Z',
        recordedTimestamp: '2024-01-15T09:30:00Z',
        completeness: 0.95,
        confidence: 0.92,
      },
    },
    {
      nodeId: 'ASSET:oil_system',
      nodeType: 'ASSET',
      attachedAt: '2024-01-15T09:30:00Z',
      label: 'Component: oil_system',
      sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
      semanticClass: 'oil_system',
      properties: { originalComponent: 'OIL_CHANGE', normalizedComponent: 'oil_system' },
    },
    {
      nodeId: 'ACTOR:SYSTEM:MAINTENANCE_SERVICE',
      nodeType: 'ACTOR',
      attachedAt: '2024-01-15T09:30:00Z',
      label: 'SYSTEM MAINTENANCE_SERVICE',
      sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
      semanticClass: 'ACTOR_MAINTENANCE_SERVICE',
      properties: { sourceId: 'SYSTEM', sourceType: 'AUTOMATED_LOG', role: 'MAINTENANCE_SERVICE' },
    },
  ],
  edges: [
    {
      edgeId: 'EDGE-VEH-HAS-EVENT',
      sourceNodeId: 'VEHICLE:VEH-2024-001',
      targetNodeId: 'EVENT:ENTITY-OIL-CHANGE-001',
      edgeType: 'HAS_EVENT',
      createdAt: '2024-01-15T09:30:00Z',
      sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
      properties: {},
    },
    {
      edgeId: 'EDGE-EVENT-INVOLVES-ASSET-OIL',
      sourceNodeId: 'EVENT:ENTITY-OIL-CHANGE-001',
      targetNodeId: 'ASSET:oil_system',
      edgeType: 'INVOLVES_ASSET',
      createdAt: '2024-01-15T09:30:00Z',
      sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
      properties: { component: 'oil_system' },
    },
    {
      edgeId: 'EDGE-EVENT-INVOLVES-ACTOR',
      sourceNodeId: 'EVENT:ENTITY-OIL-CHANGE-001',
      targetNodeId: 'ACTOR:SYSTEM:MAINTENANCE_SERVICE',
      edgeType: 'INVOLVES_ACTOR',
      createdAt: '2024-01-15T09:30:00Z',
      sourceEntityRef: 'ENTITY-OIL-CHANGE-001',
      properties: { role: 'MAINTENANCE_SERVICE' },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: Diagnostic Inspection with Multiple Components
// ─────────────────────────────────────────────────────────────────────────────

export const exampleDiagnosticInspectionIndexPreparation: DataEngineIndexPreparationCandidate = {
  identityId: 'VEH-2024-002',
  sourceEntityRef: 'ENTITY-DIAGNOSTIC-INS-001',
  attachedAt: '2024-01-20T14:45:00Z',
  nodes: [
    {
      nodeId: 'VEHICLE:VEH-2024-002',
      nodeType: 'VEHICLE',
      attachedAt: '2024-01-20T14:45:00Z',
      label: 'Vehicle (VEH-2024-002)',
      sourceEntityRef: 'ENTITY-DIAGNOSTIC-INS-001',
      semanticClass: 'VEHICLE_ANCHOR',
      properties: { identityId: 'VEH-2024-002', bindingStatus: 'ACTIVE' },
    },
    {
      nodeId: 'OBSERVATION:ENTITY-DIAGNOSTIC-INS-001',
      nodeType: 'OBSERVATION',
      attachedAt: '2024-01-20T14:45:00Z',
      label: 'OBSERVATION (DIAGNOSTIC_INSPECTION)',
      sourceEntityRef: 'ENTITY-DIAGNOSTIC-INS-001',
      semanticClass: 'DIAGNOSTIC_INSPECTION',
      properties: {
        entityType: 'DIAGNOSTIC_INSPECTION',
        sourceSystem: 'DIAGNOSTIC_SYSTEM',
        eventTimestamp: '2024-01-20T14:30:00Z',
        recordedTimestamp: '2024-01-20T14:45:00Z',
        completeness: 0.88,
        confidence: 0.95,
      },
    },
    {
      nodeId: 'ASSET:brake_pad',
      nodeType: 'ASSET',
      attachedAt: '2024-01-20T14:45:00Z',
      label: 'Component: brake_pad',
      sourceEntityRef: 'ENTITY-DIAGNOSTIC-INS-001',
      semanticClass: 'brake_pad',
      properties: { originalComponent: 'BRAKE_PAD_REPLACEMENT', normalizedComponent: 'brake_pad' },
    },
    {
      nodeId: 'ASSET:tire',
      nodeType: 'ASSET',
      attachedAt: '2024-01-20T14:45:00Z',
      label: 'Component: tire',
      sourceEntityRef: 'ENTITY-DIAGNOSTIC-INS-001',
      semanticClass: 'tire',
      properties: { originalComponent: 'TIRE_REPLACEMENT', normalizedComponent: 'tire' },
    },
    {
      nodeId: 'ACTOR:DIAGNOSTIC_CENTER:INSPECTOR',
      nodeType: 'ACTOR',
      attachedAt: '2024-01-20T14:45:00Z',
      label: 'DIAGNOSTIC_CENTER INSPECTOR',
      sourceEntityRef: 'ENTITY-DIAGNOSTIC-INS-001',
      semanticClass: 'ACTOR_INSPECTOR',
      properties: {
        sourceId: 'DIAGNOSTIC_CENTER',
        sourceType: 'SERVICE_PROVIDER',
        role: 'INSPECTOR',
      },
    },
  ],
  edges: [
    {
      edgeId: 'EDGE-VEH-HAS-OBS',
      sourceNodeId: 'VEHICLE:VEH-2024-002',
      targetNodeId: 'OBSERVATION:ENTITY-DIAGNOSTIC-INS-001',
      edgeType: 'HAS_OBSERVATION',
      createdAt: '2024-01-20T14:45:00Z',
      sourceEntityRef: 'ENTITY-DIAGNOSTIC-INS-001',
      properties: {},
    },
    {
      edgeId: 'EDGE-OBS-INVOLVES-BRAKE',
      sourceNodeId: 'OBSERVATION:ENTITY-DIAGNOSTIC-INS-001',
      targetNodeId: 'ASSET:brake_pad',
      edgeType: 'INVOLVES_ASSET',
      createdAt: '2024-01-20T14:45:00Z',
      sourceEntityRef: 'ENTITY-DIAGNOSTIC-INS-001',
      properties: { component: 'brake_pad' },
    },
    {
      edgeId: 'EDGE-OBS-INVOLVES-TIRE',
      sourceNodeId: 'OBSERVATION:ENTITY-DIAGNOSTIC-INS-001',
      targetNodeId: 'ASSET:tire',
      edgeType: 'INVOLVES_ASSET',
      createdAt: '2024-01-20T14:45:00Z',
      sourceEntityRef: 'ENTITY-DIAGNOSTIC-INS-001',
      properties: { component: 'tire' },
    },
    {
      edgeId: 'EDGE-OBS-INVOLVES-INSPECTOR',
      sourceNodeId: 'OBSERVATION:ENTITY-DIAGNOSTIC-INS-001',
      targetNodeId: 'ACTOR:DIAGNOSTIC_CENTER:INSPECTOR',
      edgeType: 'INVOLVES_ACTOR',
      createdAt: '2024-01-20T14:45:00Z',
      sourceEntityRef: 'ENTITY-DIAGNOSTIC-INS-001',
      properties: { role: 'INSPECTOR' },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: Multiple Events for Same Vehicle (Timeline Building)
// ─────────────────────────────────────────────────────────────────────────────

export const exampleMultipleEventsTimelineIndexPreparation: DataEngineIndexPreparationCandidate = {
  identityId: 'VEH-2024-003',
  sourceEntityRef: 'ENTITY-MULTI-EVENTS-001',
  attachedAt: '2024-02-01T16:00:00Z',
  nodes: [
    {
      nodeId: 'VEHICLE:VEH-2024-003',
      nodeType: 'VEHICLE',
      attachedAt: '2024-02-01T16:00:00Z',
      label: 'Vehicle (VEH-2024-003)',
      sourceEntityRef: 'ENTITY-MULTI-EVENTS-001',
      semanticClass: 'VEHICLE_ANCHOR',
      properties: { identityId: 'VEH-2024-003', bindingStatus: 'ACTIVE' },
    },
    {
      nodeId: 'EVENT:FIRST-MAINTENANCE',
      nodeType: 'EVENT',
      attachedAt: '2024-02-01T16:00:00Z',
      label: 'EVENT (MAINTENANCE_RECORD)',
      sourceEntityRef: 'ENTITY-MULTI-EVENTS-001',
      semanticClass: 'MAINTENANCE_RECORD',
      properties: {
        entityType: 'MAINTENANCE_RECORD',
        sourceSystem: 'WORKSHOP_A',
        eventTimestamp: '2024-01-10T08:00:00Z',
        recordedTimestamp: '2024-01-10T09:00:00Z',
        completeness: 0.9,
        confidence: 0.85,
      },
    },
    {
      nodeId: 'EVENT:SECOND-DIAGNOSTIC',
      nodeType: 'EVENT',
      attachedAt: '2024-02-01T16:00:00Z',
      label: 'EVENT (DIAGNOSTIC_INSPECTION)',
      sourceEntityRef: 'ENTITY-MULTI-EVENTS-001',
      semanticClass: 'DIAGNOSTIC_INSPECTION',
      properties: {
        entityType: 'DIAGNOSTIC_INSPECTION',
        sourceSystem: 'DIAGNOSTIC_LAB',
        eventTimestamp: '2024-01-25T10:30:00Z',
        recordedTimestamp: '2024-01-25T11:00:00Z',
        completeness: 0.95,
        confidence: 0.92,
      },
    },
    {
      nodeId: 'ASSET:oil_system',
      nodeType: 'ASSET',
      attachedAt: '2024-02-01T16:00:00Z',
      label: 'Component: oil_system',
      sourceEntityRef: 'ENTITY-MULTI-EVENTS-001',
      semanticClass: 'oil_system',
      properties: { originalComponent: 'OIL', normalizedComponent: 'oil_system' },
    },
    {
      nodeId: 'ACTOR:WORKSHOP_A:MECHANIC',
      nodeType: 'ACTOR',
      attachedAt: '2024-02-01T16:00:00Z',
      label: 'WORKSHOP_A MECHANIC',
      sourceEntityRef: 'ENTITY-MULTI-EVENTS-001',
      semanticClass: 'ACTOR_MECHANIC',
      properties: { sourceId: 'WORKSHOP_A', sourceType: 'SERVICE_CENTER', role: 'MECHANIC' },
    },
  ],
  edges: [
    {
      edgeId: 'EDGE-VEH-HAS-EVENT1',
      sourceNodeId: 'VEHICLE:VEH-2024-003',
      targetNodeId: 'EVENT:FIRST-MAINTENANCE',
      edgeType: 'HAS_EVENT',
      createdAt: '2024-02-01T16:00:00Z',
      sourceEntityRef: 'ENTITY-MULTI-EVENTS-001',
      properties: {},
    },
    {
      edgeId: 'EDGE-VEH-HAS-EVENT2',
      sourceNodeId: 'VEHICLE:VEH-2024-003',
      targetNodeId: 'EVENT:SECOND-DIAGNOSTIC',
      edgeType: 'HAS_EVENT',
      createdAt: '2024-02-01T16:00:00Z',
      sourceEntityRef: 'ENTITY-MULTI-EVENTS-001',
      properties: {},
    },
    {
      edgeId: 'EDGE-MAIN1-ASSET',
      sourceNodeId: 'EVENT:FIRST-MAINTENANCE',
      targetNodeId: 'ASSET:oil_system',
      edgeType: 'INVOLVES_ASSET',
      createdAt: '2024-02-01T16:00:00Z',
      sourceEntityRef: 'ENTITY-MULTI-EVENTS-001',
      properties: { component: 'oil_system' },
    },
    {
      edgeId: 'EDGE-MAIN1-ACTOR',
      sourceNodeId: 'EVENT:FIRST-MAINTENANCE',
      targetNodeId: 'ACTOR:WORKSHOP_A:MECHANIC',
      edgeType: 'INVOLVES_ACTOR',
      createdAt: '2024-02-01T16:00:00Z',
      sourceEntityRef: 'ENTITY-MULTI-EVENTS-001',
      properties: { role: 'MECHANIC' },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE EXECUTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Demonstrate Phase 6 in action: transform Phase 5 graph output to index records.
 */
export function demonstratePhase6IndexPreparation() {
  console.log('='.repeat(80));
  console.log('PHASE 6 INDEX PREPARATION EXAMPLES');
  console.log('='.repeat(80));

  // Example 1
  console.log('\n[Example 1] Oil Change Maintenance Event\n');
  const result1 = prepareGraphIndexes(exampleOilChangeIndexPreparation);
  console.log(`✓ Prepared ${result1.summary.totalRecordsPrepared} index records`);
  console.log(`  - Timeline: ${result1.summary.recordsByType['VEHICLE_TIMELINE'] || 0}`);
  console.log(`  - Components: ${result1.summary.recordsByType['VEHICLE_COMPONENT'] || 0}`);
  console.log(`  - Actors: ${result1.summary.recordsByType['VEHICLE_ACTOR'] || 0}`);
  console.log(`  - Event Types: ${result1.summary.recordsByType['VEHICLE_EVENT_TYPE'] || 0}`);

  // Example 2
  console.log('\n[Example 2] Diagnostic Inspection with Multiple Components\n');
  const result2 = prepareGraphIndexes(exampleDiagnosticInspectionIndexPreparation);
  console.log(`✓ Prepared ${result2.summary.totalRecordsPrepared} index records`);
  console.log(`  - Timeline: ${result2.summary.recordsByType['VEHICLE_TIMELINE'] || 0}`);
  console.log(`  - Components: ${result2.summary.recordsByType['VEHICLE_COMPONENT'] || 0}`);
  console.log(`  - Actors: ${result2.summary.recordsByType['VEHICLE_ACTOR'] || 0}`);
  console.log(`  - Event Types: ${result2.summary.recordsByType['VEHICLE_EVENT_TYPE'] || 0}`);

  // Example 3
  console.log('\n[Example 3] Multiple Events for Timeline Building\n');
  const result3 = prepareGraphIndexes(exampleMultipleEventsTimelineIndexPreparation);
  console.log(`✓ Prepared ${result3.summary.totalRecordsPrepared} index records`);
  console.log(`  - Timeline: ${result3.summary.recordsByType['VEHICLE_TIMELINE'] || 0}`);
  console.log(`  - Components: ${result3.summary.recordsByType['VEHICLE_COMPONENT'] || 0}`);
  console.log(`  - Actors: ${result3.summary.recordsByType['VEHICLE_ACTOR'] || 0}`);
  console.log(`  - Event Types: ${result3.summary.recordsByType['VEHICLE_EVENT_TYPE'] || 0}`);

  console.log('\n' + '='.repeat(80));
  console.log('Phase 6 remains a preparation layer—not a query or signal engine.');
  console.log('='.repeat(80));
}
