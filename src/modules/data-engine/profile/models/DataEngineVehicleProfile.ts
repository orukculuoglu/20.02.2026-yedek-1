/**
 * DataEngineVehicleProfile — Phase 9 Output
 *
 * Represents a unified vehicle intelligence profile aggregated from Phase 8 interpreted signals.
 *
 * This profile is NOT a decision output.
 * It is a structural representation of the vehicle's behavioral state derived from signals.
 *
 * Example structure:
 *
 * {
 *   profileId: "PROFILE-SHA256-...",
 *   identityId: "VEH-2024-001",
 *   sourceEntityRef: "ENTITY-001",
 *   profileDomains: {
 *     vehicleBehaviorProfile: {
 *       totalInterpretedSignals: 4,
 *       patternDensity: 0.75,
 *       signalFamiliePresent: ["TEMPORAL_ANOMALY_PATTERN", "COMPONENT_DEGRADATION_PATTERN", ...]
 *     },
 *     maintenanceBehaviorProfile: {
 *       serviceClusterPatterns: [...]
 *     },
 *     componentHealthProfile: {
 *       degradationPatterns: [...]
 *     },
 *     serviceDependencyProfile: {
 *       actorDependencies: [...]
 *     },
 *     usageIntensityProfile: {
 *       temporalAnomalies: [...]
 *     }
 *   },
 *   sourcePatternRefs: ["SIG-INTERP-001", "SIG-INTERP-002", ...],
 *   profileTimestamp: "2024-02-01T16:00:00Z",
 *   properties: {...}
 * }
 */

import { DataEngineVehicleProfileDomain } from '../types/DataEngineVehicleProfileType';

export interface DataEngineVehicleProfile {
  /**
   * Deterministic profile ID.
   *
   * Generated from:
   * - identityId
   * - sourceEntityRef
   *
   * Using: SHA-256 hash
   *
   * Ensures reproducibility: same vehicle + source → same profile ID
   */
  profileId: string;

  /**
   * Vehicle identity anchoring.
   *
   * Unchanged from upstream phases.
   * All profile data traces to this specific vehicle.
   */
  identityId: string;

  /**
   * Source entity reference.
   *
   * Unchanged from upstream phases.
   * Maintains context of original processing entity.
   */
  sourceEntityRef: string;

  /**
   * Profile domains — the 5 behavioral intelligence views.
   *
   * Each domain aggregates related interpreted signals.
   *
   * Structure:
   * {
   *   vehicleBehaviorProfile: {...},       // Synthesized overview
   *   maintenanceBehaviorProfile: {...},   // Service patterns
   *   componentHealthProfile: {...},       // Component patterns
   *   serviceDependencyProfile: {...},     // Actor patterns
   *   usageIntensityProfile: {...}         // Temporal patterns
   * }
   *
   * Contents vary by domain type. All are derived from Phase 8 signals.
   */
  profileDomains: {
    vehicleBehaviorProfile: Record<string, unknown>;
    maintenanceBehaviorProfile: Record<string, unknown>;
    componentHealthProfile: Record<string, unknown>;
    serviceDependencyProfile: Record<string, unknown>;
    usageIntensityProfile: Record<string, unknown>;
  };

  /**
   * References to Phase 8 interpreted signals that contributed to this profile.
   *
   * Enables full traceability:
   * Vehicle Profile ← Phase 8 Signals ← Phase 7 Signals ← Phase 6 Indexes ← Phase 5 Graph ← ...
   *
   * Array of Phase 8 interpreted signal IDs.
   */
  sourcePatternRefs: string[];

  /**
   * ISO timestamp when profile was constructed.
   *
   * For audit and temporal ordering of profile construction.
   */
  profileTimestamp: string;

  /**
   * Additional properties for profile context.
   *
   * Example structure:
   * {
   *   totalPatternsProcessed?: number,
   *   domainCompleteness?: Record<string, boolean>,
   *   signalFamiliesRepresented?: string[],
   *   profileDescription?: string,
   *   lastUpdated?: string
   * }
   *
   * Metadata used for explanation and downstream processing.
   */
  properties: Record<string, unknown>;
}
