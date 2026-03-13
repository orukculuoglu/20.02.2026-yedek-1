/**
 * Example Priority Preparation Cases — Phase 10
 *
 * Realistic demonstrations of Phase 10 priority candidate preparation.
 * Shows how Phase 9 vehicle intelligence profiles transform to priority candidates.
 *
 * These examples demonstrate:
 * 1. Component-focused candidate preparation
 * 2. Multi-domain preparation with composites
 * 3. Service-focused preparation
 * 4. Complex convergent preparation (many composites)
 */

import type { DataEnginePriorityPreparationCandidate } from '../models/DataEnginePriorityPreparationCandidate';
import { preparePriorityCandidates } from '../engine/preparePriorityCandidates';

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: Component-Focused Preparation
// ─────────────────────────────────────────────────────────────────────────────

export const exampleComponentFocusedPriorityPreparation: DataEnginePriorityPreparationCandidate = {
  identityId: 'VEH-2024-001',
  sourceEntityRef: 'ENTITY-COMPONENT-FOCUS-001',
  preparedAt: '2024-02-01T16:00:00Z',
  vehicleProfile: {
    profileId: 'PROFILE-001',
    identityId: 'VEH-2024-001',
    sourceEntityRef: 'ENTITY-COMPONENT-FOCUS-001',
    profileDomains: {
      vehicleBehaviorProfile: {
        totalPatterns: 1,
        behaviorConsistency: 'focused',
      },
      maintenanceBehaviorProfile: {
        serviceClusterCount: 0,
        clusters: [],
        serviceTypes: [],
      },
      componentHealthProfile: {
        degradationPatternCount: 2,
        components: [
          {
            componentId: 'brake_pad',
            recurrenceLevel: 'high_recurrence',
            evidenceCount: 3,
          },
          {
            componentId: 'suspension_arm',
            recurrenceLevel: 'medium_recurrence',
            evidenceCount: 2,
          },
        ],
        affectedComponents: ['brake_pad', 'suspension_arm'],
        componentHealthLevel: 'degrading',
      },
      serviceDependencyProfile: {
        actorDependencyCount: 0,
        actors: [],
        primaryActors: [],
      },
      usageIntensityProfile: {
        temporalAnomalyCount: 0,
        anomalies: [],
        timeWindows: [],
      },
    },
    sourcePatternRefs: ['SIG-INTERP-001', 'SIG-INTERP-002'],
    profileTimestamp: '2024-02-01T16:00:00Z',
    properties: {},
  },
};

/**
 * Expected Preparation Result:
 *
 * preparedPriorityCandidates:
 * - COMPONENT_PRIORITY_CANDIDATE { brake_pad, high_recurrence }
 * - COMPONENT_PRIORITY_CANDIDATE { suspension_arm, medium_recurrence }
 *
 * summary: {
 *   totalCandidates: 2,
 *   candidateDistribution: {
 *     "COMPONENT_PRIORITY_CANDIDATE": 2
 *   },
 *   compositeCandidateCount: 0
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: Multi-Domain with Composites
// ─────────────────────────────────────────────────────────────────────────────

export const exampleMultiDomainPriorityPreparation: DataEnginePriorityPreparationCandidate = {
  identityId: 'VEH-2024-002',
  sourceEntityRef: 'ENTITY-MULTI-DOMAIN-001',
  preparedAt: '2024-02-01T16:00:00Z',
  vehicleProfile: {
    profileId: 'PROFILE-002',
    identityId: 'VEH-2024-002',
    sourceEntityRef: 'ENTITY-MULTI-DOMAIN-001',
    profileDomains: {
      vehicleBehaviorProfile: {
        totalPatterns: 4,
        behaviorConsistency: 'comprehensive',
      },
      maintenanceBehaviorProfile: {
        serviceClusterCount: 1,
        clusters: [
          {
            serviceType: 'MAINTENANCE_RECORD',
            intensity: 'dense_cluster',
            evidenceCount: 3,
          },
        ],
        serviceTypes: ['MAINTENANCE_RECORD'],
        maintenanceIntensity: 'high',
      },
      componentHealthProfile: {
        degradationPatternCount: 1,
        components: [
          {
            componentId: 'oil_system',
            recurrenceLevel: 'high_recurrence',
            evidenceCount: 2,
          },
        ],
        affectedComponents: ['oil_system'],
        componentHealthLevel: 'degrading',
      },
      serviceDependencyProfile: {
        actorDependencyCount: 1,
        actors: [
          {
            actorId: 'WORKSHOP_A:MECHANIC',
            concentrationLevel: 'high_concentration',
            evidenceCount: 3,
          },
        ],
        primaryActors: ['WORKSHOP_A:MECHANIC'],
        dependencyConcentration: 'high',
      },
      usageIntensityProfile: {
        temporalAnomalyCount: 1,
        anomalies: [
          {
            timeWindow: '2024-01-20',
            densityLevel: 'high_density',
            eventCount: 3,
          },
        ],
        timeWindows: ['2024-01-20'],
        usageIntensity: 'intense',
      },
    },
    sourcePatternRefs: ['SIG-INTERP-003', 'SIG-INTERP-004', 'SIG-INTERP-005', 'SIG-INTERP-006'],
    profileTimestamp: '2024-02-01T16:00:00Z',
    properties: {},
  },
};

/**
 * Expected Preparation Result:
 *
 * preparedPriorityCandidates:
 * - COMPONENT_PRIORITY_CANDIDATE { oil_system, high_recurrence }
 * - SERVICE_PRIORITY_CANDIDATE { MAINTENANCE_RECORD, dense_cluster }
 * - ACTOR_PRIORITY_CANDIDATE { WORKSHOP_A:MECHANIC, high_concentration }
 * - TEMPORAL_PRIORITY_CANDIDATE { 2024-01-20, high_density }
 * - COMPOSITE_PRIORITY_CANDIDATE { oil_system:MAINTENANCE_RECORD:WORKSHOP_A:MECHANIC }
 *
 * summary: {
 *   totalCandidates: 5,
 *   candidateDistribution: {
 *     "COMPONENT_PRIORITY_CANDIDATE": 1,
 *     "SERVICE_PRIORITY_CANDIDATE": 1,
 *     "ACTOR_PRIORITY_CANDIDATE": 1,
 *     "TEMPORAL_PRIORITY_CANDIDATE": 1,
 *     "COMPOSITE_PRIORITY_CANDIDATE": 1
 *   },
 *   compositeCandidateCount: 1
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: Service-Focused Preparation
// ─────────────────────────────────────────────────────────────────────────────

export const exampleServiceFocusedPriorityPreparation: DataEnginePriorityPreparationCandidate = {
  identityId: 'VEH-2024-003',
  sourceEntityRef: 'ENTITY-SERVICE-FOCUS-001',
  preparedAt: '2024-02-01T16:00:00Z',
  vehicleProfile: {
    profileId: 'PROFILE-003',
    identityId: 'VEH-2024-003',
    sourceEntityRef: 'ENTITY-SERVICE-FOCUS-001',
    profileDomains: {
      vehicleBehaviorProfile: {
        totalPatterns: 2,
        behaviorConsistency: 'partial',
      },
      maintenanceBehaviorProfile: {
        serviceClusterCount: 2,
        clusters: [
          {
            serviceType: 'MAINTENANCE_RECORD',
            intensity: 'dense_cluster',
            evidenceCount: 3,
          },
          {
            serviceType: 'DIAGNOSTIC_INSPECTION',
            intensity: 'moderate_cluster',
            evidenceCount: 2,
          },
        ],
        serviceTypes: ['MAINTENANCE_RECORD', 'DIAGNOSTIC_INSPECTION'],
        maintenanceIntensity: 'high',
      },
      componentHealthProfile: {
        degradationPatternCount: 0,
        components: [],
        affectedComponents: [],
      },
      serviceDependencyProfile: {
        actorDependencyCount: 0,
        actors: [],
        primaryActors: [],
      },
      usageIntensityProfile: {
        temporalAnomalyCount: 0,
        anomalies: [],
        timeWindows: [],
      },
    },
    sourcePatternRefs: ['SIG-INTERP-007', 'SIG-INTERP-008'],
    profileTimestamp: '2024-02-01T16:00:00Z',
    properties: {},
  },
};

/**
 * Expected Preparation Result:
 *
 * preparedPriorityCandidates:
 * - SERVICE_PRIORITY_CANDIDATE { MAINTENANCE_RECORD, dense_cluster }
 * - SERVICE_PRIORITY_CANDIDATE { DIAGNOSTIC_INSPECTION, moderate_cluster }
 *
 * summary: {
 *   totalCandidates: 2,
 *   candidateDistribution: {
 *     "SERVICE_PRIORITY_CANDIDATE": 2
 *   },
 *   compositeCandidateCount: 0
 * }
 */

// ─────────────────────────────────────────────────────────────────────────────
// Test/Demonstration Function
// ─────────────────────────────────────────────────────────────────────────────

export function demonstratePhase10PriorityPreparation(): void {
  console.log('=== Phase 10 Priority Candidate Preparation ===\n');

  // Example 1
  console.log('Example 1: Component-Focused Preparation');
  const result1 = preparePriorityCandidates(exampleComponentFocusedPriorityPreparation);
  console.log(`  Prepared Candidates: ${result1.summary.totalCandidates}`);
  console.log(`  Component Candidates: ${result1.summary.candidateDistribution['COMPONENT_PRIORITY_CANDIDATE'] || 0}`);
  console.log(`  Composite Candidates: ${result1.summary.compositeCandidateCount}`);
  console.log();

  // Example 2
  console.log('Example 2: Multi-Domain with Composites');
  const result2 = preparePriorityCandidates(exampleMultiDomainPriorityPreparation);
  console.log(`  Prepared Candidates: ${result2.summary.totalCandidates}`);
  console.log(`  Distribution:`, result2.summary.candidateDistribution);
  console.log(`  Composite Candidates: ${result2.summary.compositeCandidateCount}`);
  console.log();

  // Example 3
  console.log('Example 3: Service-Focused Preparation');
  const result3 = preparePriorityCandidates(exampleServiceFocusedPriorityPreparation);
  console.log(`  Prepared Candidates: ${result3.summary.totalCandidates}`);
  console.log(`  Service Candidates: ${result3.summary.candidateDistribution['SERVICE_PRIORITY_CANDIDATE'] || 0}`);
  console.log(`  Composite Candidates: ${result3.summary.compositeCandidateCount}`);
}
