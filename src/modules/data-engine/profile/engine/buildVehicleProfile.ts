/**
 * buildVehicleProfile — Phase 9 Core Engine
 *
 * Transform interpreted signals (Phase 8) into a unified vehicle intelligence profile (Phase 9).
 *
 * Interpreted signals → Vehicle Intelligence Profile
 *
 * Aggregations:
 * TEMPORAL_ANOMALY → USAGE_INTENSITY_PROFILE
 * COMPONENT_DEGRADATION → COMPONENT_HEALTH_PROFILE
 * ACTOR_DEPENDENCY → SERVICE_DEPENDENCY_PROFILE
 * SERVICE_CLUSTER → MAINTENANCE_BEHAVIOR_PROFILE
 * ALL SIGNALS → VEHICLE_BEHAVIOR_PROFILE (synthesized overview)
 *
 * This phase:
 * ✓ Aggregates signals into profile domains
 * ✓ Generates deterministic profile ID
 * ✓ Preserves full traceability via sourcePatternRefs
 * ✓ Produces deterministic results
 * ✓ Captures behavioral patterns across 5 domains
 *
 * This phase does NOT:
 * ✗ Assign risk scores
 * ✗ Generate recommendations
 * ✗ Make business decisions
 * ✗ Trigger workflows
 * ✗ Persist data
 */

import { generateDeterministicId } from '../../utils/deterministicIdGenerator';
import type { DataEngineVehicleProfileCandidate } from '../models/DataEngineVehicleProfileCandidate';
import type { DataEngineVehicleProfileResult } from '../models/DataEngineVehicleProfileResult';
import type { DataEngineVehicleProfile } from '../models/DataEngineVehicleProfile';
import { DataEngineInterpretedSignalType } from '../../interpretation/types/DataEngineInterpretedSignalType';

/**
 * Build a vehicle intelligence profile from Phase 8 interpreted signals.
 *
 * Algorithm:
 *
 * 1. Group interpreted signals by interpretedSignalType
 * 2. For each signal type:
 *    a. Map to corresponding profile domain
 *    b. Collect signals into domain structure
 *    c. Extract relevant properties
 * 3. Build synthesized VEHICLE_BEHAVIOR_PROFILE (overview)
 * 4. Generate deterministic profileId
 * 5. Construct full vehicle profile
 * 6. Generate summary statistics
 * 7. Return result
 *
 * @param candidate Phase 8 interpreted signal profile candidate
 * @returns Phase 9 profile result
 */
export function buildVehicleProfile(
  candidate: DataEngineVehicleProfileCandidate
): DataEngineVehicleProfileResult {
  // Initialize domain containers
  const domainSignals = {
    temporal: [] as typeof candidate.interpretedSignals,
    component: [] as typeof candidate.interpretedSignals,
    actor: [] as typeof candidate.interpretedSignals,
    service: [] as typeof candidate.interpretedSignals,
  };

  // Step 1: Group signals by type
  for (const signal of candidate.interpretedSignals) {
    switch (signal.interpretedSignalType) {
      case DataEngineInterpretedSignalType.TEMPORAL_ANOMALY_PATTERN:
        domainSignals.temporal.push(signal);
        break;
      case DataEngineInterpretedSignalType.COMPONENT_DEGRADATION_PATTERN:
        domainSignals.component.push(signal);
        break;
      case DataEngineInterpretedSignalType.ACTOR_DEPENDENCY_PATTERN:
        domainSignals.actor.push(signal);
        break;
      case DataEngineInterpretedSignalType.SERVICE_CLUSTER_PATTERN:
        domainSignals.service.push(signal);
        break;
    }
  }

  // Step 2: Build profile domains from grouped signals
  const vehicleBehaviorProfile = buildVehicleBehaviorDomain(candidate.interpretedSignals);
  const maintenanceBehaviorProfile = buildMaintenanceBehaviorDomain(domainSignals.service);
  const componentHealthProfile = buildComponentHealthDomain(domainSignals.component);
  const serviceDependencyProfile = buildServiceDependencyDomain(domainSignals.actor);
  const usageIntensityProfile = buildUsageIntensityDomain(domainSignals.temporal);

  // Step 3: Generate deterministic profile ID
  const profileId = generateDeterministicId(
    `${candidate.identityId}|PROFILE|${candidate.sourceEntityRef}`
  );

  // Step 4: Collect all interpreted signal references
  const sourcePatternRefs = candidate.interpretedSignals.map((s) => s.interpretedSignalId);

  // Step 5: Build profile domains object
  const profileDomains = {
    vehicleBehaviorProfile,
    maintenanceBehaviorProfile,
    componentHealthProfile,
    serviceDependencyProfile,
    usageIntensityProfile,
  };

  // Step 6: Build properties object
  const properties = buildProfileProperties(candidate, domainSignals);

  // Step 7: Construct vehicle profile
  const vehicleProfile: DataEngineVehicleProfile = {
    profileId,
    identityId: candidate.identityId,
    sourceEntityRef: candidate.sourceEntityRef,
    profileDomains,
    sourcePatternRefs,
    profileTimestamp: candidate.profileGeneratedAt,
    properties,
  };

  // Step 8: Calculate summary statistics
  const patternFamiliesSet = new Set(candidate.interpretedSignals.map((s) => s.interpretedSignalType));
  const domainsConstructed =
    (domainSignals.temporal.length > 0 ? 1 : 0) +
    (domainSignals.component.length > 0 ? 1 : 0) +
    (domainSignals.actor.length > 0 ? 1 : 0) +
    (domainSignals.service.length > 0 ? 1 : 0) +
    1; // +1 for synthesized vehicle behavior

  const profileCompleteness = domainsConstructed / 5; // 5 total domains

  // Step 9: Build result
  const result: DataEngineVehicleProfileResult = {
    vehicleProfile,
    summary: {
      totalInterpretedSignals: candidate.interpretedSignals.length,
      domainsConstructed,
      patternFamiliesIncluded: patternFamiliesSet.size,
      profileCompleteness,
    },
    profileGeneratedAt: candidate.profileGeneratedAt,
  };

  return result;
}

/**
 * Build the synthesized VEHICLE_BEHAVIOR_PROFILE domain.
 *
 * Provides overall behavioral overview across all signal types.
 *
 * @param allSignals All interpreted signals
 * @returns Vehicle behavior profile domain
 */
function buildVehicleBehaviorDomain(allSignals: Array<{ interpretedSignalType: string }>): Record<string, unknown> {
  const signalTypeMap = new Map<string, number>();

  for (const signal of allSignals) {
    const count = signalTypeMap.get(signal.interpretedSignalType) || 0;
    signalTypeMap.set(signal.interpretedSignalType, count + 1);
  }

  return {
    totalPatterns: allSignals.length,
    patternDensity: allSignals.length > 0 ? allSignals.length / Math.max(1, allSignals.length) : 0,
    signalFamiliesRepresented: Array.from(signalTypeMap.keys()),
    distributionByFamily: Object.fromEntries(signalTypeMap),
    behaviorConsistency:
      allSignals.length > 0
        ? signalTypeMap.size === 4
          ? 'comprehensive'
          : signalTypeMap.size >= 2
            ? 'partial'
            : 'focused'
        : 'minimal',
  };
}

/**
 * Build the MAINTENANCE_BEHAVIOR_PROFILE domain.
 *
 * Aggregates SERVICE_CLUSTER_PATTERN signals.
 *
 * @param serviceSignals Service cluster pattern signals
 * @returns Maintenance behavior profile domain
 */
function buildMaintenanceBehaviorDomain(
  serviceSignals: Array<{
    patternKey: string;
    patternValue: string;
    supportingSignalCount: number;
    properties: Record<string, unknown>;
  }>
): Record<string, unknown> {
  if (serviceSignals.length === 0) {
    return {
      serviceClusterCount: 0,
      clusters: [],
      serviceTypes: [],
    };
  }

  const clusters = serviceSignals.map((signal) => ({
    serviceType: signal.patternKey,
    intensity: signal.patternValue,
    evidenceCount: signal.supportingSignalCount,
    properties: signal.properties,
  }));

  const serviceTypes = Array.from(new Set(serviceSignals.map((s) => s.patternKey)));

  return {
    serviceClusterCount: serviceSignals.length,
    clusters,
    serviceTypes,
    mostFrequentService:
      clusters.length > 0
        ? clusters.reduce((prev, current) => (prev.evidenceCount > current.evidenceCount ? prev : current))
            .serviceType
        : null,
    maintenanceIntensity: calculateIntensity(serviceSignals.map((s) => s.patternValue)),
  };
}

/**
 * Build the COMPONENT_HEALTH_PROFILE domain.
 *
 * Aggregates COMPONENT_DEGRADATION_PATTERN signals.
 *
 * @param componentSignals Component degradation pattern signals
 * @returns Component health profile domain
 */
function buildComponentHealthDomain(
  componentSignals: Array<{
    patternKey: string;
    patternValue: string;
    supportingSignalCount: number;
    properties: Record<string, unknown>;
  }>
): Record<string, unknown> {
  if (componentSignals.length === 0) {
    return {
      degradationPatternCount: 0,
      components: [],
      affectedComponents: [],
    };
  }

  const components = componentSignals.map((signal) => ({
    componentId: signal.patternKey,
    recurrenceLevel: signal.patternValue,
    evidenceCount: signal.supportingSignalCount,
    properties: signal.properties,
  }));

  const affectedComponents = Array.from(new Set(componentSignals.map((s) => s.patternKey)));

  return {
    degradationPatternCount: componentSignals.length,
    components,
    affectedComponents,
    mostActiveComponent:
      components.length > 0
        ? components.reduce((prev, current) => (prev.evidenceCount > current.evidenceCount ? prev : current))
            .componentId
        : null,
    componentHealthLevel: calculateHealthLevel(componentSignals.map((s) => s.patternValue)),
  };
}

/**
 * Build the SERVICE_DEPENDENCY_PROFILE domain.
 *
 * Aggregates ACTOR_DEPENDENCY_PATTERN signals.
 *
 * @param actorSignals Actor dependency pattern signals
 * @returns Service dependency profile domain
 */
function buildServiceDependencyDomain(
  actorSignals: Array<{
    patternKey: string;
    patternValue: string;
    supportingSignalCount: number;
    properties: Record<string, unknown>;
  }>
): Record<string, unknown> {
  if (actorSignals.length === 0) {
    return {
      actorDependencyCount: 0,
      actors: [],
      primaryActors: [],
    };
  }

  const actors = actorSignals.map((signal) => ({
    actorId: signal.patternKey,
    concentrationLevel: signal.patternValue,
    evidenceCount: signal.supportingSignalCount,
    properties: signal.properties,
  }));

  const primaryActors = actorSignals
    .sort((a, b) => b.supportingSignalCount - a.supportingSignalCount)
    .slice(0, 3)
    .map((s) => s.patternKey);

  return {
    actorDependencyCount: actorSignals.length,
    actors,
    primaryActors,
    dependencyConcentration: calculateConcentration(actorSignals.map((s) => s.supportingSignalCount)),
  };
}

/**
 * Build the USAGE_INTENSITY_PROFILE domain.
 *
 * Aggregates TEMPORAL_ANOMALY_PATTERN signals.
 *
 * @param temporalSignals Temporal anomaly pattern signals
 * @returns Usage intensity profile domain
 */
function buildUsageIntensityDomain(
  temporalSignals: Array<{
    patternKey: string;
    patternValue: string;
    supportingSignalCount: number;
    properties: Record<string, unknown>;
  }>
): Record<string, unknown> {
  if (temporalSignals.length === 0) {
    return {
      temporalAnomalyCount: 0,
      anomalies: [],
      timeWindows: [],
    };
  }

  const anomalies = temporalSignals.map((signal) => ({
    timeWindow: signal.patternKey,
    densityLevel: signal.patternValue,
    eventCount: signal.supportingSignalCount,
    properties: signal.properties,
  }));

  const timeWindows = Array.from(new Set(temporalSignals.map((s) => s.patternKey)));

  return {
    temporalAnomalyCount: temporalSignals.length,
    anomalies,
    timeWindows,
    mostActiveWindow:
      anomalies.length > 0
        ? anomalies.reduce((prev, current) => (prev.eventCount > current.eventCount ? prev : current))
            .timeWindow
        : null,
    usageIntensity: calculateUsageIntensity(temporalSignals.map((s) => s.patternValue)),
  };
}

/**
 * Build additional properties for the vehicle profile.
 *
 * Captures metadata without introducing business logic.
 *
 * @param candidate Profile candidate
 * @param domainSignals Grouped signals by domain
 * @returns Properties object
 */
function buildProfileProperties(
  candidate: DataEngineVehicleProfileCandidate,
  domainSignals: Record<string, Array<{ supportingSignalCount?: number }>>
): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    totalSignalsProcessed: candidate.interpretedSignals.length,
    domainCoverage: {
      maintenance: domainSignals.service.length > 0,
      components: domainSignals.component.length > 0,
      actors: domainSignals.actor.length > 0,
      temporal: domainSignals.temporal.length > 0,
    },
    signalFamiliesPresent: Array.from(
      new Set(candidate.interpretedSignals.map((s) => s.interpretedSignalType))
    ).sort(),
  };

  return properties;
}

/**
 * Calculate intensity level from pattern values.
 *
 * No business logic. Purely structural.
 *
 * @param values Array of intensity value strings
 * @returns Aggregate intensity level
 */
function calculateIntensity(values: string[]): string {
  if (values.length === 0) return 'unknown';

  const highCount = values.filter((v) => v.includes('high') || v.includes('dense')).length;
  const total = values.length;

  if (highCount / total > 0.5) return 'high';
  if (highCount / total > 0.25) return 'moderate';
  return 'low';
}

/**
 * Calculate health level from component value strings.
 *
 * No business logic. Purely structural.
 *
 * @param values Array of component value strings
 * @returns Health level indication
 */
function calculateHealthLevel(values: string[]): string {
  if (values.length === 0) return 'unknown';

  const degradedCount = values.filter((v) => v.includes('high')).length;

  if (degradedCount / values.length > 0.5) return 'degrading';
  if (degradedCount / values.length > 0.25) return 'stressed';
  return 'stable';
}

/**
 * Calculate concentration level from involvement counts.
 *
 * No business logic. Purely structural.
 *
 * @param counts Array of involvement counts
 * @returns Concentration level
 */
function calculateConcentration(counts: number[]): string {
  if (counts.length === 0) return 'minimal';

  const maxCount = Math.max(...counts);
  const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;

  const concentration = maxCount / avgCount;

  if (concentration > 2) return 'high';
  if (concentration > 1.5) return 'moderate';
  return 'distributed';
}

/**
 * Calculate usage intensity from temporal pattern values.
 *
 * No business logic. Purely structural.
 *
 * @param values Array of temporal pattern values
 * @returns Usage intensity level
 */
function calculateUsageIntensity(values: string[]): string {
  if (values.length === 0) return 'minimal';

  const highCount = values.filter((v) => v.includes('high')).length;

  if (highCount / values.length > 0.5) return 'intense';
  if (highCount / values.length > 0.25) return 'moderate';
  if (values.length > 2) return 'active';
  return 'sparse';
}
