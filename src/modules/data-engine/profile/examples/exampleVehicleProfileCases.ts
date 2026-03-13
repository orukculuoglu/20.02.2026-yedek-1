/**
 * Example Vehicle Profile Cases — Phase 9
 *
 * Realistic demonstrations of Phase 9 vehicle intelligence profile construction.
 * Shows how Phase 8 interpreted signals transform to comprehensive profiles.
 *
 * These examples demonstrate:
 * 1. Sparse profile (few signal types)
 * 2. Balanced profile (all domains populated)
 * 3. Component-focused profile (heavy component patterns)
 * 4. Complex multi-domain profile
 */

import type { DataEngineVehicleProfileCandidate } from '../models/DataEngineVehicleProfileCandidate';
import { buildVehicleProfile } from '../engine/buildVehicleProfile';
import { DataEngineInterpretedSignalType } from '../../interpretation/types/DataEngineInterpretedSignalType';

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: Sparse Profile — Limited Signal Coverage
// ─────────────────────────────────────────────────────────────────────────────

export const exampleSparseVehicleProfile: DataEngineVehicleProfileCandidate = {
  identityId: 'VEH-2024-001',
  sourceEntityRef: 'ENTITY-SPARSE-001',
  profileGeneratedAt: '2024-02-01T16:00:00Z',
  interpretedSignals: [
    {
      interpretedSignalId: 'SIG-INTERP-001',
      interpretedSignalType: DataEngineInterpretedSignalType.COMPONENT_DEGRADATION_PATTERN,
      identityId: 'VEH-2024-001',
      sourceEntityRef: 'ENTITY-SPARSE-001',
      sourceSignalRefs: ['SIG-PHASE7-001'],
      patternKey: 'brake_pad',
      patternValue: 'high_recurrence',
      supportingSignalCount: 2,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: {
        involvementCount: 5,
      },
    },
  ],
};

/**
 * Expected Profile Result:
 *
 * vehicleProfile: {
 *   profileId: "PROFILE-SHA256-...",
 *   identityId: "VEH-2024-001",
 *   profileDomains: {
 *     vehicleBehaviorProfile: {
 *       totalPatterns: 1,
 *       patternDensity: 1.0,
 *       signalFamiliesRepresented: ["COMPONENT_DEGRADATION_PATTERN"],
 *       behaviorConsistency: "focused"
 *     },
 *     maintenanceBehaviorProfile: { serviceClusterCount: 0, clusters: [] },
 *     componentHealthProfile: {
 *       degradationPatternCount: 1,
 *       components: [...],
 *       mostActiveComponent: "brake_pad",
 *       componentHealthLevel: "degrading"
 *     },
 *     serviceDependencyProfile: { actorDependencyCount: 0, actors: [] },
 *     usageIntensityProfile: { temporalAnomalyCount: 0, anomalies: [] }
 *   }
 * },
 * summary: {
 *   totalInterpretedSignals: 1,
 *   domainsConstructed: 2,
 *   patternFamiliesIncluded: 1,
 *   profileCompleteness: 0.4
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: Balanced Profile — Multiple Domains
// ─────────────────────────────────────────────────────────────────────────────

export const exampleBalancedVehicleProfile: DataEngineVehicleProfileCandidate = {
  identityId: 'VEH-2024-002',
  sourceEntityRef: 'ENTITY-BALANCED-001',
  profileGeneratedAt: '2024-02-01T16:00:00Z',
  interpretedSignals: [
    // Temporal signal
    {
      interpretedSignalId: 'SIG-INTERP-002',
      interpretedSignalType: DataEngineInterpretedSignalType.TEMPORAL_ANOMALY_PATTERN,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-BALANCED-001',
      sourceSignalRefs: ['SIG-PHASE7-002'],
      patternKey: '2024-01-25',
      patternValue: 'high_density',
      supportingSignalCount: 3,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { eventCount: 3 },
    },

    // Component signal
    {
      interpretedSignalId: 'SIG-INTERP-003',
      interpretedSignalType: DataEngineInterpretedSignalType.COMPONENT_DEGRADATION_PATTERN,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-BALANCED-001',
      sourceSignalRefs: ['SIG-PHASE7-003'],
      patternKey: 'oil_system',
      patternValue: 'medium_recurrence',
      supportingSignalCount: 2,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { involvementCount: 3 },
    },

    // Service signal
    {
      interpretedSignalId: 'SIG-INTERP-004',
      interpretedSignalType: DataEngineInterpretedSignalType.SERVICE_CLUSTER_PATTERN,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-BALANCED-001',
      sourceSignalRefs: ['SIG-PHASE7-004'],
      patternKey: 'MAINTENANCE_RECORD',
      patternValue: 'moderate_cluster',
      supportingSignalCount: 2,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { count: 2 },
    },

    // Actor signal
    {
      interpretedSignalId: 'SIG-INTERP-005',
      interpretedSignalType: DataEngineInterpretedSignalType.ACTOR_DEPENDENCY_PATTERN,
      identityId: 'VEH-2024-002',
      sourceEntityRef: 'ENTITY-BALANCED-001',
      sourceSignalRefs: ['SIG-PHASE7-005'],
      patternKey: 'WORKSHOP_A:MECHANIC',
      patternValue: 'medium_concentration',
      supportingSignalCount: 2,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { involvementCount: 3 },
    },
  ],
};

/**
 * Expected Profile Result:
 *
 * domainsConstructed: 5
 * patternFamiliesIncluded: 4
 * profileCompleteness: 1.0 (all domains populated)
 *
 * Profile covers: temporal, component, service, and actor dimensions
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: Component-Focused Profile — Deep Component Issues
// ─────────────────────────────────────────────────────────────────────────────

export const exampleComponentFocusedVehicleProfile: DataEngineVehicleProfileCandidate = {
  identityId: 'VEH-2024-003',
  sourceEntityRef: 'ENTITY-COMPONENT-FOCUS-001',
  profileGeneratedAt: '2024-02-01T16:00:00Z',
  interpretedSignals: [
    // Multiple component patterns
    {
      interpretedSignalId: 'SIG-INTERP-006',
      interpretedSignalType: DataEngineInterpretedSignalType.COMPONENT_DEGRADATION_PATTERN,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-COMPONENT-FOCUS-001',
      sourceSignalRefs: ['SIG-PHASE7-006'],
      patternKey: 'brake_pad',
      patternValue: 'high_recurrence',
      supportingSignalCount: 3,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { involvementCount: 5 },
    },
    {
      interpretedSignalId: 'SIG-INTERP-007',
      interpretedSignalType: DataEngineInterpretedSignalType.COMPONENT_DEGRADATION_PATTERN,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-COMPONENT-FOCUS-001',
      sourceSignalRefs: ['SIG-PHASE7-007'],
      patternKey: 'suspension_arm',
      patternValue: 'high_recurrence',
      supportingSignalCount: 2,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { involvementCount: 4 },
    },
    {
      interpretedSignalId: 'SIG-INTERP-008',
      interpretedSignalType: DataEngineInterpretedSignalType.COMPONENT_DEGRADATION_PATTERN,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-COMPONENT-FOCUS-001',
      sourceSignalRefs: ['SIG-PHASE7-008'],
      patternKey: 'transmission_fluid',
      patternValue: 'medium_recurrence',
      supportingSignalCount: 1,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { involvementCount: 2 },
    },

    // Supporting temporal pattern
    {
      interpretedSignalId: 'SIG-INTERP-009',
      interpretedSignalType: DataEngineInterpretedSignalType.TEMPORAL_ANOMALY_PATTERN,
      identityId: 'VEH-2024-003',
      sourceEntityRef: 'ENTITY-COMPONENT-FOCUS-001',
      sourceSignalRefs: ['SIG-PHASE7-009'],
      patternKey: '2024-02-01',
      patternValue: 'high_density',
      supportingSignalCount: 2,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { eventCount: 4 },
    },
  ],
};

/**
 * Expected Profile Result:
 *
 * componentHealthProfile: {
 *   degradationPatternCount: 3,
 *   components: [{brake_pad, high_recurrence}, {suspension_arm, high_recurrence}, ...],
 *   affectedComponents: ["brake_pad", "suspension_arm", "transmission_fluid"],
 *   componentHealthLevel: "degrading"
 * },
 * summary: {
 *   totalInterpretedSignals: 4,
 *   patternFamiliesIncluded: 2,
 *   profileCompleteness: 0.6
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 4: Complex Multi-Domain Profile
// ─────────────────────────────────────────────────────────────────────────────

export const exampleComplexVehicleProfile: DataEngineVehicleProfileCandidate = {
  identityId: 'VEH-2024-004',
  sourceEntityRef: 'ENTITY-COMPLEX-001',
  profileGeneratedAt: '2024-02-01T16:00:00Z',
  interpretedSignals: [
    // Multiple temporal patterns
    {
      interpretedSignalId: 'SIG-INTERP-010',
      interpretedSignalType: DataEngineInterpretedSignalType.TEMPORAL_ANOMALY_PATTERN,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-COMPLEX-001',
      sourceSignalRefs: ['SIG-PHASE7-010'],
      patternKey: '2024-01-15',
      patternValue: 'moderate_density',
      supportingSignalCount: 2,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { eventCount: 2 },
    },
    {
      interpretedSignalId: 'SIG-INTERP-011',
      interpretedSignalType: DataEngineInterpretedSignalType.TEMPORAL_ANOMALY_PATTERN,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-COMPLEX-001',
      sourceSignalRefs: ['SIG-PHASE7-011'],
      patternKey: '2024-01-20',
      patternValue: 'high_density',
      supportingSignalCount: 3,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { eventCount: 3 },
    },

    // Multiple component patterns
    {
      interpretedSignalId: 'SIG-INTERP-012',
      interpretedSignalType: DataEngineInterpretedSignalType.COMPONENT_DEGRADATION_PATTERN,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-COMPLEX-001',
      sourceSignalRefs: ['SIG-PHASE7-012'],
      patternKey: 'engine_oil_filter',
      patternValue: 'high_recurrence',
      supportingSignalCount: 2,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { involvementCount: 4 },
    },

    // Multiple service patterns
    {
      interpretedSignalId: 'SIG-INTERP-013',
      interpretedSignalType: DataEngineInterpretedSignalType.SERVICE_CLUSTER_PATTERN,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-COMPLEX-001',
      sourceSignalRefs: ['SIG-PHASE7-013'],
      patternKey: 'MAINTENANCE_RECORD',
      patternValue: 'dense_cluster',
      supportingSignalCount: 3,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { count: 3 },
    },
    {
      interpretedSignalId: 'SIG-INTERP-014',
      interpretedSignalType: DataEngineInterpretedSignalType.SERVICE_CLUSTER_PATTERN,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-COMPLEX-001',
      sourceSignalRefs: ['SIG-PHASE7-014'],
      patternKey: 'REPAIR_REQUEST',
      patternValue: 'moderate_cluster',
      supportingSignalCount: 2,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { count: 2 },
    },

    // Multiple actor patterns
    {
      interpretedSignalId: 'SIG-INTERP-015',
      interpretedSignalType: DataEngineInterpretedSignalType.ACTOR_DEPENDENCY_PATTERN,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-COMPLEX-001',
      sourceSignalRefs: ['SIG-PHASE7-015'],
      patternKey: 'WORKSHOP_A:MECHANIC',
      patternValue: 'high_concentration',
      supportingSignalCount: 3,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { involvementCount: 4 },
    },
    {
      interpretedSignalId: 'SIG-INTERP-016',
      interpretedSignalType: DataEngineInterpretedSignalType.ACTOR_DEPENDENCY_PATTERN,
      identityId: 'VEH-2024-004',
      sourceEntityRef: 'ENTITY-COMPLEX-001',
      sourceSignalRefs: ['SIG-PHASE7-016'],
      patternKey: 'DIAGNOSTIC_CENTER:INSPECTOR',
      patternValue: 'medium_concentration',
      supportingSignalCount: 2,
      interpretationTimestamp: '2024-02-01T16:00:00Z',
      properties: { involvementCount: 2 },
    },
  ],
};

/**
 * Expected Profile Result:
 *
 * totalInterpretedSignals: 7
 * domainsConstructed: 5
 * patternFamiliesIncluded: 4
 * profileCompleteness: 1.0 (comprehensive)
 *
 * All 4 signal types present across all 5 domains
 */

// ─────────────────────────────────────────────────────────────────────────────
// Test/Demonstration Function
// ─────────────────────────────────────────────────────────────────────────────

export function demonstratePhase9ProfileConstruction(): void {
  console.log('=== Phase 9 Vehicle Intelligence Profile Construction ===\n');

  // Example 1
  console.log('Example 1: Sparse Profile');
  const result1 = buildVehicleProfile(exampleSparseVehicleProfile);
  console.log(`  Total Signals: ${result1.summary.totalInterpretedSignals}`);
  console.log(`  Domains: ${result1.summary.domainsConstructed}/5`);
  console.log(`  Completeness: ${(result1.summary.profileCompleteness * 100).toFixed(0)}%`);
  console.log(`  Pattern Families: ${result1.summary.patternFamiliesIncluded}`);
  console.log();

  // Example 2
  console.log('Example 2: Balanced Profile');
  const result2 = buildVehicleProfile(exampleBalancedVehicleProfile);
  console.log(`  Total Signals: ${result2.summary.totalInterpretedSignals}`);
  console.log(`  Domains: ${result2.summary.domainsConstructed}/5`);
  console.log(`  Completeness: ${(result2.summary.profileCompleteness * 100).toFixed(0)}%`);
  console.log(`  Pattern Families: ${result2.summary.patternFamiliesIncluded}`);
  console.log();

  // Example 3
  console.log('Example 3: Component-Focused Profile');
  const result3 = buildVehicleProfile(exampleComponentFocusedVehicleProfile);
  console.log(`  Total Signals: ${result3.summary.totalInterpretedSignals}`);
  console.log(`  Domains: ${result3.summary.domainsConstructed}/5`);
  console.log(`  Completeness: ${(result3.summary.profileCompleteness * 100).toFixed(0)}%`);
  console.log(`  Component Domain: ${(result3.vehicleProfile.profileDomains.componentHealthProfile as any).degradationPatternCount || 0} patterns`);
  console.log();

  // Example 4
  console.log('Example 4: Complex Multi-Domain Profile');
  const result4 = buildVehicleProfile(exampleComplexVehicleProfile);
  console.log(`  Total Signals: ${result4.summary.totalInterpretedSignals}`);
  console.log(`  Domains: ${result4.summary.domainsConstructed}/5`);
  console.log(`  Completeness: ${(result4.summary.profileCompleteness * 100).toFixed(0)}%`);
  console.log(`  Pattern Families: ${result4.summary.patternFamiliesIncluded}/4`);
}
