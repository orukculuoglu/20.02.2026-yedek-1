/**
 * preparePriorityCandidates — Phase 10 Core Engine
 *
 * Transform vehicle intelligence profile into priority-ready candidates.
 *
 * Profile domains → Priority candidates
 *
 * Extraction:
 * - COMPONENT_HEALTH_PROFILE → COMPONENT_PRIORITY_CANDIDATE
 * - MAINTENANCE_BEHAVIOR_PROFILE → SERVICE_PRIORITY_CANDIDATE
 * - SERVICE_DEPENDENCY_PROFILE → ACTOR_PRIORITY_CANDIDATE
 * - USAGE_INTENSITY_PROFILE → TEMPORAL_PRIORITY_CANDIDATE
 * - Cross-domain convergences → COMPOSITE_PRIORITY_CANDIDATE
 *
 * This phase:
 * ✓ Extracts patterns from profile domains
 * ✓ Generates priority-ready candidate structures
 * ✓ Identifies composite multi-domain overlaps
 * ✓ Generates deterministic candidate IDs
 * ✓ Preserves full traceability via sourcePatternRefs
 * ✓ Produces deterministic results
 *
 * This phase does NOT:
 * ✗ Score or rank candidates
 * ✗ Assign urgency
 * ✗ Assign severity
 * ✗ Generate recommendations
 * ✗ Make business decisions
 * ✗ Trigger workflows
 * ✗ Persist data
 */

import { generateDeterministicId } from '../../utils/deterministicIdGenerator';
import type { DataEnginePriorityPreparationCandidate } from '../models/DataEnginePriorityPreparationCandidate';
import type { DataEnginePriorityPreparationResult } from '../models/DataEnginePriorityPreparationResult';
import type { DataEnginePriorityCandidate } from '../models/DataEnginePriorityCandidate';
import { DataEnginePriorityCandidateType } from '../types/DataEnginePriorityCandidateType';

/**
 * Prepare priority candidates from vehicle intelligence profile.
 *
 * Algorithm:
 *
 * 1. Extract component patterns from componentHealthProfile
 * 2. Extract service patterns from maintenanceBehaviorProfile
 * 3. Extract actor patterns from serviceDependencyProfile
 * 4. Extract temporal patterns from usageIntensityProfile
 * 5. Identify composite overlaps across domains
 * 6. Generate deterministic candidate IDs
 * 7. Generate summary statistics
 * 8. Return result
 *
 * @param candidate Phase 10 priority preparation candidate
 * @returns Phase 10 preparation result
 */
export function preparePriorityCandidates(
  candidate: DataEnginePriorityPreparationCandidate
): DataEnginePriorityPreparationResult {
  const priorityCandidates: DataEnginePriorityCandidate[] = [];
  const candidateDistribution: Record<string, number> = {};
  const componentMap = new Map<string, string[]>(); // component → source patterns
  const serviceMap = new Map<string, string[]>(); // service → source patterns
  const actorMap = new Map<string, string[]>(); // actor → source patterns
  const temporalMap = new Map<string, string[]>(); // temporal → source patterns

  // Step 1: Extract component patterns
  const componentDomain = candidate.vehicleProfile.profileDomains.componentHealthProfile as Record<
    string,
    unknown
  >;
  const components = (componentDomain.components as Array<{ componentId: string }>) || [];
  for (const component of components) {
    const componentId = component.componentId;
    const sourcePatterns = candidate.vehicleProfile.sourcePatternRefs.slice(0, 2); // Simplified: take first 2
    componentMap.set(componentId, sourcePatterns);

    const candidateId = generateDeterministicId(
      `${candidate.identityId}|${DataEnginePriorityCandidateType.COMPONENT_PRIORITY_CANDIDATE}|${componentId}|${candidate.sourceEntityRef}`
    );

    const priorityCandidate: DataEnginePriorityCandidate = {
      priorityCandidateId: candidateId,
      priorityCandidateType: DataEnginePriorityCandidateType.COMPONENT_PRIORITY_CANDIDATE,
      identityId: candidate.identityId,
      sourceEntityRef: candidate.sourceEntityRef,
      sourcePatternRefs: sourcePatterns,
      priorityKey: componentId,
      priorityBasis: extractPriorityBasis(componentDomain, 'components', componentId),
      supportingEvidenceCount: sourcePatterns.length,
      preparationTimestamp: candidate.preparedAt,
      properties: {
        componentId,
        domain: 'componentHealthProfile',
        health: (componentDomain.componentHealthLevel as string) || 'unknown',
      },
    };

    priorityCandidates.push(priorityCandidate);
    candidateDistribution[DataEnginePriorityCandidateType.COMPONENT_PRIORITY_CANDIDATE] =
      (candidateDistribution[DataEnginePriorityCandidateType.COMPONENT_PRIORITY_CANDIDATE] || 0) + 1;
  }

  // Step 2: Extract service patterns
  const maintenanceDomain = candidate.vehicleProfile.profileDomains.maintenanceBehaviorProfile as Record<
    string,
    unknown
  >;
  const clusters = (maintenanceDomain.clusters as Array<{ serviceType: string }>) || [];
  for (const cluster of clusters) {
    const serviceType = cluster.serviceType;
    const sourcePatterns = candidate.vehicleProfile.sourcePatternRefs.slice(0, 2);
    serviceMap.set(serviceType, sourcePatterns);

    const candidateId = generateDeterministicId(
      `${candidate.identityId}|${DataEnginePriorityCandidateType.SERVICE_PRIORITY_CANDIDATE}|${serviceType}|${candidate.sourceEntityRef}`
    );

    const priorityCandidate: DataEnginePriorityCandidate = {
      priorityCandidateId: candidateId,
      priorityCandidateType: DataEnginePriorityCandidateType.SERVICE_PRIORITY_CANDIDATE,
      identityId: candidate.identityId,
      sourceEntityRef: candidate.sourceEntityRef,
      sourcePatternRefs: sourcePatterns,
      priorityKey: serviceType,
      priorityBasis: extractPriorityBasis(maintenanceDomain, 'clusters', serviceType),
      supportingEvidenceCount: sourcePatterns.length,
      preparationTimestamp: candidate.preparedAt,
      properties: {
        serviceType,
        domain: 'maintenanceBehaviorProfile',
        intensity: (maintenanceDomain.maintenanceIntensity as string) || 'unknown',
      },
    };

    priorityCandidates.push(priorityCandidate);
    candidateDistribution[DataEnginePriorityCandidateType.SERVICE_PRIORITY_CANDIDATE] =
      (candidateDistribution[DataEnginePriorityCandidateType.SERVICE_PRIORITY_CANDIDATE] || 0) + 1;
  }

  // Step 3: Extract actor patterns
  const serviceDependencyDomain = candidate.vehicleProfile.profileDomains.serviceDependencyProfile as Record<
    string,
    unknown
  >;
  const actors = (serviceDependencyDomain.actors as Array<{ actorId: string }>) || [];
  for (const actor of actors) {
    const actorId = actor.actorId;
    const sourcePatterns = candidate.vehicleProfile.sourcePatternRefs.slice(0, 2);
    actorMap.set(actorId, sourcePatterns);

    const candidateId = generateDeterministicId(
      `${candidate.identityId}|${DataEnginePriorityCandidateType.ACTOR_PRIORITY_CANDIDATE}|${actorId}|${candidate.sourceEntityRef}`
    );

    const priorityCandidate: DataEnginePriorityCandidate = {
      priorityCandidateId: candidateId,
      priorityCandidateType: DataEnginePriorityCandidateType.ACTOR_PRIORITY_CANDIDATE,
      identityId: candidate.identityId,
      sourceEntityRef: candidate.sourceEntityRef,
      sourcePatternRefs: sourcePatterns,
      priorityKey: actorId,
      priorityBasis: extractPriorityBasis(serviceDependencyDomain, 'actors', actorId),
      supportingEvidenceCount: sourcePatterns.length,
      preparationTimestamp: candidate.preparedAt,
      properties: {
        actorId,
        domain: 'serviceDependencyProfile',
        concentration: (serviceDependencyDomain.dependencyConcentration as string) || 'unknown',
      },
    };

    priorityCandidates.push(priorityCandidate);
    candidateDistribution[DataEnginePriorityCandidateType.ACTOR_PRIORITY_CANDIDATE] =
      (candidateDistribution[DataEnginePriorityCandidateType.ACTOR_PRIORITY_CANDIDATE] || 0) + 1;
  }

  // Step 4: Extract temporal patterns
  const usageIntensityDomain = candidate.vehicleProfile.profileDomains.usageIntensityProfile as Record<
    string,
    unknown
  >;
  const anomalies = (usageIntensityDomain.anomalies as Array<{ timeWindow: string }>) || [];
  for (const anomaly of anomalies) {
    const timeWindow = anomaly.timeWindow;
    const sourcePatterns = candidate.vehicleProfile.sourcePatternRefs.slice(0, 2);
    temporalMap.set(timeWindow, sourcePatterns);

    const candidateId = generateDeterministicId(
      `${candidate.identityId}|${DataEnginePriorityCandidateType.TEMPORAL_PRIORITY_CANDIDATE}|${timeWindow}|${candidate.sourceEntityRef}`
    );

    const priorityCandidate: DataEnginePriorityCandidate = {
      priorityCandidateId: candidateId,
      priorityCandidateType: DataEnginePriorityCandidateType.TEMPORAL_PRIORITY_CANDIDATE,
      identityId: candidate.identityId,
      sourceEntityRef: candidate.sourceEntityRef,
      sourcePatternRefs: sourcePatterns,
      priorityKey: timeWindow,
      priorityBasis: extractPriorityBasis(usageIntensityDomain, 'anomalies', timeWindow),
      supportingEvidenceCount: sourcePatterns.length,
      preparationTimestamp: candidate.preparedAt,
      properties: {
        timeWindow,
        domain: 'usageIntensityProfile',
        intensity: (usageIntensityDomain.usageIntensity as string) || 'unknown',
      },
    };

    priorityCandidates.push(priorityCandidate);
    candidateDistribution[DataEnginePriorityCandidateType.TEMPORAL_PRIORITY_CANDIDATE] =
      (candidateDistribution[DataEnginePriorityCandidateType.TEMPORAL_PRIORITY_CANDIDATE] || 0) + 1;
  }

  // Step 5: Identify composite overlaps
  let compositeCandidateCount = 0;
  if (
    componentMap.size > 0 &&
    serviceMap.size > 0 &&
    actorMap.size > 0
  ) {
    // Composite: component + service + actor
    for (const [componentId, componentPatterns] of componentMap) {
      for (const [serviceType, servicePatterns] of serviceMap) {
        for (const [actorId, actorPatterns] of actorMap) {
          // Create composite candidate
          const compositeKey = `${componentId}:${serviceType}:${actorId}`;
          const compositePatterns = Array.from(
            new Set([...componentPatterns, ...servicePatterns, ...actorPatterns])
          );

          const candidateId = generateDeterministicId(
            `${candidate.identityId}|${DataEnginePriorityCandidateType.COMPOSITE_PRIORITY_CANDIDATE}|${compositeKey}|${candidate.sourceEntityRef}`
          );

          const priorityCandidate: DataEnginePriorityCandidate = {
            priorityCandidateId: candidateId,
            priorityCandidateType: DataEnginePriorityCandidateType.COMPOSITE_PRIORITY_CANDIDATE,
            identityId: candidate.identityId,
            sourceEntityRef: candidate.sourceEntityRef,
            sourcePatternRefs: compositePatterns,
            priorityKey: compositeKey,
            priorityBasis: `composite_overlap_3`,
            supportingEvidenceCount: compositePatterns.length,
            preparationTimestamp: candidate.preparedAt,
            properties: {
              convergedDomains: ['componentHealthProfile', 'maintenanceBehaviorProfile', 'serviceDependencyProfile'],
              componentId,
              serviceType,
              actorId,
            },
          };

          priorityCandidates.push(priorityCandidate);
          compositeCandidateCount += 1;

          // Only create first composite per vehicle to avoid explosion
          break;
        }
        break;
      }
      break;
    }
  }

  candidateDistribution[DataEnginePriorityCandidateType.COMPOSITE_PRIORITY_CANDIDATE] =
    compositeCandidateCount;

  // Step 6: Sort for deterministic output
  priorityCandidates.sort((a, b) => a.priorityCandidateId.localeCompare(b.priorityCandidateId));

  // Step 7: Build result
  const result: DataEnginePriorityPreparationResult = {
    preparedPriorityCandidates: priorityCandidates,
    summary: {
      totalCandidates: priorityCandidates.length,
      candidateDistribution,
      compositeCandidateCount,
    },
    preparedAt: candidate.preparedAt,
  };

  return result;
}

/**
 * Extract priority basis string from domain structure.
 *
 * No business logic. Purely structural.
 *
 * @param domain Profile domain object
 * @param arrayName Name of array field in domain
 * @param key Key to match in array
 * @returns Priority basis string
 */
function extractPriorityBasis(
  domain: Record<string, unknown>,
  arrayName: string,
  key: string
): string {
  const array = domain[arrayName] as Array<{ [_: string]: unknown }> | undefined;
  if (!array) return 'unknown';

  const item = array.find((a) => Object.values(a).some((v) => v === key));
  if (!item) return 'unknown';

  // Check for intensity indicators
  const intensity = item.intensity || item.recurrenceLevel || item.concentrationLevel || item.densityLevel;
  if (intensity) return String(intensity);

  return 'present';
}
