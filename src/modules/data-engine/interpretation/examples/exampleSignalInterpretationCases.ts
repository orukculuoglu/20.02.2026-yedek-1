/**
 * Example Signal Interpretation Cases — Phase 8
 *
 * Realistic demonstrations of Phase 8 signal interpretation.
 * Shows how Phase 7 signals transform to Phase 8 interpreted patterns.
 *
 * These examples demonstrate:
 * 1. Temporal anomaly pattern (from timeline density)
 * 2. Component degradation pattern (from component recurrence)
 * 3. Actor dependency pattern (from actor concentration)
 * 4. Service cluster pattern (from event type frequency)
 */

import type { DataEngineSignalInterpretationCandidate } from '../models/DataEngineSignalInterpretationCandidate';
import { interpretSignals } from '../engine/interpretSignals';
import { DataEngineSignalType } from '../../signals/types/DataEngineSignalType';

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: Temporal Anomaly — Dense Event Clustering
// ─────────────────────────────────────────────────────────────────────────────

export const exampleTemporalAnomalyInterpretation: DataEngineSignalInterpretationCandidate = {
  identityId: 'VEH-2024-001',
  sourceEntityRef: 'ENTITY-TEMPORAL-001',
  interpretedAt: '2024-02-01T16:00:00Z',
  preparedSignals: [
    {
      signalId: 'SIGNAL-PHASE7-001',
      signalType: DataEngineSignalType.TIMELINE_DENSITY,
      identityId: 'VEH-2024-001',
      sourceEntityRef: 'ENTITY-TEMPORAL-001',
      sourceRecordRefs: ['REC-IDX-001', 'REC-IDX-002', 'REC-IDX-003'],
      signalKey: '2024-01-25',
      signalValue: 3,
      supportingEvidenceCount: 3,
      signalTimestamp: '2024-01-25T14:00:00Z',
      properties: {
        timeWindow: '2024-01-25 (single day)',
        eventCount: 3,
        semanticClasses: ['DIAGNOSTIC_INSPECTION', 'REPAIR_REQUEST', 'MAINTENANCE_RECORD'],
      },
      preparedAt: '2024-02-01T16:00:00Z',
    },
  ],
};

/**
 * Expected Interpretation Result:
 *
 * {
 *   interpretedSignals: [
 *     {
 *       interpretedSignalId: "SIG-INTERP-SHA256-...",
 *       interpretedSignalType: "TEMPORAL_ANOMALY_PATTERN",
 *       identityId: "VEH-2024-001",
 *       sourceEntityRef: "ENTITY-TEMPORAL-001",
 *       sourceSignalRefs: ["SIGNAL-PHASE7-001"],
 *       patternKey: "2024-01-25",
 *       patternValue: "high_density",
 *       supportingSignalCount: 1,
 *       interpretationTimestamp: "2024-02-01T16:00:00Z",
 *       properties: {
 *         signalFamily: "TEMPORAL_ANOMALY_PATTERN",
 *         sourceSignalCount: 1,
 *         timeWindow: "2024-01-25 (single day)",
 *         peakEventCount: 3
 *       }
 *     }
 *   ],
 *   summary: {
 *     totalSignalsInterpreted: 1,
 *     uniquePatterns: 1,
 *     patternDistribution: { "TEMPORAL_ANOMALY_PATTERN": 1 }
 *   },
 *   interpretedAt: "2024-02-01T16:00:00Z"
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: Component Degradation — High Recurrence
// ─────────────────────────────────────────────────────────────────────────────

export const exampleComponentDegradationInterpretation: DataEngineSignalInterpretationCandidate = {
  identityId: 'VEH-2024-002',
  sourceEntityRef: 'ENTITY-COMPONENT-001',
  interpretedAt: '2024-02-01T16:00:00Z',
  preparedSignals: [
    {
      signalId: 'SIGNAL-PHASE7-002',
      signalType: DataEngineSignalType.COMPONENT_RECURRENCE,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-COMPONENT-001',
      sourceRecordRefs: ['REC-IDX-004', 'REC-IDX-005'],
      signalKey: 'brake_pad',
      signalValue: 5,
      supportingEvidenceCount: 2,
      signalTimestamp: '2024-02-05T10:30:00Z',
      properties: {
        componentId: 'brake_pad',
        canonicalComponent: 'brake_pad',
        involvementCount: 5,
        involvedInEventTypes: ['DIAGNOSTIC_INSPECTION', 'REPAIR_REQUEST'],
      },
      preparedAt: '2024-02-01T16:00:00Z',
    },
  ],
};

/**
 * Expected Interpretation Result:
 *
 * {
 *   interpretedSignals: [
 *     {
 *       interpretedSignalId: "SIG-INTERP-SHA256-...",
 *       interpretedSignalType: "COMPONENT_DEGRADATION_PATTERN",
 *       identityId: "VEH-2024-002",
 *       sourceEntityRef: "ENTITY-COMPONENT-001",
 *       sourceSignalRefs: ["SIGNAL-PHASE7-002"],
 *       patternKey: "brake_pad",
 *       patternValue: "high_recurrence",
 *       supportingSignalCount: 1,
 *       interpretationTimestamp: "2024-02-01T16:00:00Z",
 *       properties: {
 *         signalFamily: "COMPONENT_DEGRADATION_PATTERN",
 *         sourceSignalCount: 1,
 *         involvedEventTypes: ["DIAGNOSTIC_INSPECTION", "REPAIR_REQUEST"],
 *         peakInvolvement: 5
 *       }
 *     }
 *   ],
 *   summary: {
 *     totalSignalsInterpreted: 1,
 *     uniquePatterns: 1,
 *     patternDistribution: { "COMPONENT_DEGRADATION_PATTERN": 1 }
 *   },
 *   interpretedAt: "2024-02-01T16:00:00Z"
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: Actor Dependency — High Concentration
// ─────────────────────────────────────────────────────────────────────────────

export const exampleActorDependencyInterpretation: DataEngineSignalInterpretationCandidate = {
  identityId: 'VEH-2024-003',
  sourceEntityRef: 'ENTITY-ACTOR-001',
  interpretedAt: '2024-02-01T16:00:00Z',
  preparedSignals: [
    {
      signalId: 'SIGNAL-PHASE7-003',
      signalType: DataEngineSignalType.ACTOR_CONCENTRATION,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-ACTOR-001',
      sourceRecordRefs: ['REC-IDX-006', 'REC-IDX-007'],
      signalKey: 'DIAGNOSTIC_CENTER:INSPECTOR',
      signalValue: 4,
      supportingEvidenceCount: 2,
      signalTimestamp: '2024-02-05T10:30:00Z',
      properties: {
        actorId: 'DIAGNOSTIC_CENTER:INSPECTOR',
        sourceId: 'DIAGNOSTIC_CENTER',
        role: 'INSPECTOR',
        involvementCount: 4,
      },
      preparedAt: '2024-02-01T16:00:00Z',
    },
  ],
};

/**
 * Expected Interpretation Result:
 *
 * {
 *   interpretedSignals: [
 *     {
 *       interpretedSignalId: "SIG-INTERP-SHA256-...",
 *       interpretedSignalType: "ACTOR_DEPENDENCY_PATTERN",
 *       identityId: "VEH-2024-003",
 *       sourceEntityRef: "ENTITY-ACTOR-001",
 *       sourceSignalRefs: ["SIGNAL-PHASE7-003"],
 *       patternKey: "DIAGNOSTIC_CENTER:INSPECTOR",
 *       patternValue: "high_concentration",
 *       supportingSignalCount: 1,
 *       interpretationTimestamp: "2024-02-01T16:00:00Z",
 *       properties: {
 *         signalFamily: "ACTOR_DEPENDENCY_PATTERN",
 *         sourceSignalCount: 1,
 *         role: "INSPECTOR",
 *         sourceId: "DIAGNOSTIC_CENTER",
 *         peakInvolvement: 4
 *       }
 *     }
 *   ],
 *   summary: {
 *     totalSignalsInterpreted: 1,
 *     uniquePatterns: 1,
 *     patternDistribution: { "ACTOR_DEPENDENCY_PATTERN": 1 }
 *   },
 *   interpretedAt: "2024-02-01T16:00:00Z"
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 4: Service Cluster — High Frequency
// ─────────────────────────────────────────────────────────────────────────────

export const exampleServiceClusterInterpretation: DataEngineSignalInterpretationCandidate = {
  identityId: 'VEH-2024-004',
  sourceEntityRef: 'ENTITY-SERVICE-001',
  interpretedAt: '2024-02-01T16:00:00Z',
  preparedSignals: [
    {
      signalId: 'SIGNAL-PHASE7-004',
      signalType: DataEngineSignalType.EVENT_TYPE_FREQUENCY,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-SERVICE-001',
      sourceRecordRefs: ['REC-IDX-008', 'REC-IDX-009'],
      signalKey: 'MAINTENANCE_RECORD',
      signalValue: 4,
      supportingEvidenceCount: 2,
      signalTimestamp: '2024-02-05T14:00:00Z',
      properties: {
        family: 'MAINTENANCE_RECORD',
        eventTypeFamily: 'MAINTENANCE_RECORD',
        count: 4,
        latestTimestamp: '2024-02-05T14:00:00Z',
      },
      preparedAt: '2024-02-01T16:00:00Z',
    },
  ],
};

/**
 * Expected Interpretation Result:
 *
 * {
 *   interpretedSignals: [
 *     {
 *       interpretedSignalId: "SIG-INTERP-SHA256-...",
 *       interpretedSignalType: "SERVICE_CLUSTER_PATTERN",
 *       identityId: "VEH-2024-004",
 *       sourceEntityRef: "ENTITY-SERVICE-001",
 *       sourceSignalRefs: ["SIGNAL-PHASE7-004"],
 *       patternKey: "MAINTENANCE_RECORD",
 *       patternValue: "dense_cluster",
 *       supportingSignalCount: 1,
 *       interpretationTimestamp: "2024-02-01T16:00:00Z",
 *       properties: {
 *         signalFamily: "SERVICE_CLUSTER_PATTERN",
 *         sourceSignalCount: 1,
 *         eventTypeFamily: "MAINTENANCE_RECORD",
 *         peakFrequency: 4
 *       }
 *     }
 *   ],
 *   summary: {
 *     totalSignalsInterpreted: 1,
 *     uniquePatterns: 1,
 *     patternDistribution: { "SERVICE_CLUSTER_PATTERN": 1 }
 *   },
 *   interpretedAt: "2024-02-01T16:00:00Z"
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED EXAMPLE: Multiple Patterns per Vehicle
// ─────────────────────────────────────────────────────────────────────────────

export const exampleCombinedMultiPatternInterpretation: DataEngineSignalInterpretationCandidate = {
  identityId: 'VEH-2024-005',
  sourceEntityRef: 'ENTITY-MULTI-PATTERN-001',
  interpretedAt: '2024-02-01T16:00:00Z',
  preparedSignals: [
    // Temporal anomaly signal
    {
      signalId: 'SIGNAL-PHASE7-005',
      signalType: DataEngineSignalType.TIMELINE_DENSITY,
      identityId: 'VEH-2024-005',
      sourceEntityRef: 'ENTITY-MULTI-PATTERN-001',
      sourceRecordRefs: ['REC-IDX-010', 'REC-IDX-011'],
      signalKey: '2024-01-20',
      signalValue: 2,
      supportingEvidenceCount: 2,
      signalTimestamp: '2024-01-20T12:00:00Z',
      properties: {
        timeWindow: '2024-01-20 (single day)',
        eventCount: 2,
        semanticClasses: ['DIAGNOSTIC_INSPECTION', 'MAINTENANCE_RECORD'],
      },
      preparedAt: '2024-02-01T16:00:00Z',
    },

    // Component recurrence signal
    {
      signalId: 'SIGNAL-PHASE7-006',
      signalType: DataEngineSignalType.COMPONENT_RECURRENCE,
      identityId: 'VEH-2024-005',
      sourceEntityRef: 'ENTITY-MULTI-PATTERN-001',
      sourceRecordRefs: ['REC-IDX-012'],
      signalKey: 'oil_system',
      signalValue: 3,
      supportingEvidenceCount: 1,
      signalTimestamp: '2024-02-05T09:00:00Z',
      properties: {
        componentId: 'oil_system',
        canonicalComponent: 'oil_system',
        involvementCount: 3,
        involvedInEventTypes: ['MAINTENANCE_RECORD'],
      },
      preparedAt: '2024-02-01T16:00:00Z',
    },

    // Service cluster signal
    {
      signalId: 'SIGNAL-PHASE7-007',
      signalType: DataEngineSignalType.EVENT_TYPE_FREQUENCY,
      identityId: 'VEH-2024-005',
      sourceEntityRef: 'ENTITY-MULTI-PATTERN-001',
      sourceRecordRefs: ['REC-IDX-013'],
      signalKey: 'DIAGNOSTIC_INSPECTION',
      signalValue: 2,
      supportingEvidenceCount: 1,
      signalTimestamp: '2024-02-05T10:00:00Z',
      properties: {
        family: 'DIAGNOSTIC_INSPECTION',
        eventTypeFamily: 'DIAGNOSTIC_INSPECTION',
        count: 2,
        latestTimestamp: '2024-02-05T10:00:00Z',
      },
      preparedAt: '2024-02-01T16:00:00Z',
    },
  ],
};

/**
 * Expected Interpretation Result (combined):
 *
 * {
 *   interpretedSignals: [
 *     { TEMPORAL_ANOMALY_PATTERN for 2024-01-20 },
 *     { COMPONENT_DEGRADATION_PATTERN for oil_system },
 *     { SERVICE_CLUSTER_PATTERN for DIAGNOSTIC_INSPECTION }
 *   ],
 *   summary: {
 *     totalSignalsInterpreted: 3,
 *     uniquePatterns: 3,
 *     patternDistribution: {
 *       "TEMPORAL_ANOMALY_PATTERN": 1,
 *       "COMPONENT_DEGRADATION_PATTERN": 1,
 *       "SERVICE_CLUSTER_PATTERN": 1
 *     }
 *   },
 *   interpretedAt: "2024-02-01T16:00:00Z"
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// Test/Demonstration Function
// ─────────────────────────────────────────────────────────────────────────────

export function demonstratePhase8Interpretation(): void {
  console.log('=== Phase 8 Signal Interpretation Examples ===\n');

  // Example 1
  console.log('Example 1: Temporal Anomaly Interpretation');
  const result1 = interpretSignals(exampleTemporalAnomalyInterpretation);
  console.log(`  Interpreted Patterns: ${result1.interpretedSignals.length}`);
  console.log(`  Pattern Types: ${Object.keys(result1.summary.patternDistribution).join(', ')}`);
  console.log();

  // Example 2
  console.log('Example 2: Component Degradation Interpretation');
  const result2 = interpretSignals(exampleComponentDegradationInterpretation);
  console.log(`  Interpreted Patterns: ${result2.interpretedSignals.length}`);
  console.log(`  Pattern Types: ${Object.keys(result2.summary.patternDistribution).join(', ')}`);
  console.log();

  // Example 3
  console.log('Example 3: Actor Dependency Interpretation');
  const result3 = interpretSignals(exampleActorDependencyInterpretation);
  console.log(`  Interpreted Patterns: ${result3.interpretedSignals.length}`);
  console.log(`  Pattern Types: ${Object.keys(result3.summary.patternDistribution).join(', ')}`);
  console.log();

  // Example 4
  console.log('Example 4: Service Cluster Interpretation');
  const result4 = interpretSignals(exampleServiceClusterInterpretation);
  console.log(`  Interpreted Patterns: ${result4.interpretedSignals.length}`);
  console.log(`  Pattern Types: ${Object.keys(result4.summary.patternDistribution).join(', ')}`);
  console.log();

  // Combined
  console.log('Example 5: Combined Multi-Pattern Interpretation');
  const result5 = interpretSignals(exampleCombinedMultiPatternInterpretation);
  console.log(`  Total Signals: ${result5.summary.totalSignalsInterpreted}`);
  console.log(`  Interpreted Patterns: ${result5.interpretedSignals.length}`);
  console.log(`  Pattern Distribution:`, result5.summary.patternDistribution);
}
