/**
 * DataEngineVehicleProfileResult — Phase 9 Output Contract
 *
 * Output structure returned by buildVehicleProfile() engine function.
 *
 * Contains:
 * - Constructed vehicle intelligence profile
 * - Summary statistics
 * - Profile metadata
 *
 * Example:
 *
 * {
 *   vehicleProfile: {
 *     profileId: "PROFILE-SHA256-...",
 *     identityId: "VEH-2024-001",
 *     sourceEntityRef: "ENTITY-001",
 *     profileDomains: {...},
 *     sourcePatternRefs: [...],
 *     profileTimestamp: "2024-02-01T16:00:00Z",
 *     properties: {...}
 *   },
 *   summary: {
 *     totalInterpretedSignals: 4,
 *     domainsConstructed: 5,
 *     patternFamiliesIncluded: 4,
 *     profileCompleteness: 1.0
 *   },
 *   profileGeneratedAt: "2024-02-01T16:00:00Z"
 * }
 */

import type { DataEngineVehicleProfile } from './DataEngineVehicleProfile';

export interface DataEngineVehicleProfileResult {
  /**
   * The constructed vehicle intelligence profile.
   *
   * Represents the structural behavioral state of the vehicle.
   * Aggregates all Phase 8 interpreted signals into 5 domains.
   *
   * All fields are deterministic, traceable, and vehicle-anchored.
   */
  vehicleProfile: DataEngineVehicleProfile;

  /**
   * Summary statistics for profile construction.
   *
   * Provides insights into profile composition without exposing decision logic.
   */
  summary: {
    /**
     * Count of Phase 8 interpreted signals that contributed to this profile.
     */
    totalInterpretedSignals: number;

    /**
     * Count of profile domains that were constructed.
     *
     * Typically 5 (VEHICLE_BEHAVIOR, MAINTENANCE_BEHAVIOR, COMPONENT_HEALTH,
     * SERVICE_DEPENDENCY, USAGE_INTENSITY).
     *
     * May be less if some domains have no contributing signals.
     */
    domainsConstructed: number;

    /**
     * Count of unique interpreted signal types included in profile.
     *
     * Range: 0-4 (TEMPORAL_ANOMALY, COMPONENT_DEGRADATION, ACTOR_DEPENDENCY, SERVICE_CLUSTER)
     *
     * Indicates breadth of behavioral patterns captured.
     */
    patternFamiliesIncluded: number;

    /**
     * Measure of profile completeness.
     *
     * Range: 0.0 - 1.0
     *
     * 1.0 = all 5 domains constructed with signals
     * 0.8 = 4 domains constructed
     * Lower = sparse signal coverage
     *
     * No business implications. Pure structural metric.
     */
    profileCompleteness: number;
  };

  /**
   * ISO timestamp when profile was built.
   *
   * For audit and temporal ordering of profile construction batches.
   */
  profileGeneratedAt: string;
}
