/**
 * DataEngineVehicleProfileCandidate — Phase 9 Input Contract
 *
 * Input structure passed to buildVehicleProfile() engine function.
 *
 * Contains:
 * - Vehicle identity context
 * - Phase 8 interpreted signals (ready for profile construction)
 * - Profile generation metadata
 *
 * Example:
 *
 * {
 *   identityId: "VEH-2024-001",
 *   sourceEntityRef: "ENTITY-001",
 *   profileGeneratedAt: "2024-02-01T16:00:00Z",
 *   interpretedSignals: [
 *     { interpretedSignalId: "...", interpretedSignalType: "COMPONENT_DEGRADATION_PATTERN", ... },
 *     { interpretedSignalId: "...", interpretedSignalType: "TEMPORAL_ANOMALY_PATTERN", ... }
 *   ]
 * }
 */

import type { DataEngineInterpretedSignal } from '../../interpretation/models/DataEngineInterpretedSignal';

export interface DataEngineVehicleProfileCandidate {
  /**
   * Vehicle identity anchoring.
   *
   * Passed through from Phase 8 interpreted signals.
   * All profile data aggregates to this vehicle.
   */
  identityId: string;

  /**
   * Source entity reference.
   *
   * Passed through from Phase 8 interpreted signals.
   * Maintains context of original processing entity.
   */
  sourceEntityRef: string;

  /**
   * ISO timestamp for profile generation batch.
   *
   * Marks when this profile candidate was created.
   * Used for temporal ordering and audit.
   */
  profileGeneratedAt: string;

  /**
   * Phase 8 interpreted signals ready for profile aggregation.
   *
   * Array of interpreted signal candidates from Phase 8 output.
   * These signals will be grouped into profile domains.
   *
   * Signal types present:
   * - TEMPORAL_ANOMALY_PATTERN (→ USAGE_INTENSITY_PROFILE)
   * - COMPONENT_DEGRADATION_PATTERN (→ COMPONENT_HEALTH_PROFILE)
   * - ACTOR_DEPENDENCY_PATTERN (→ SERVICE_DEPENDENCY_PROFILE)
   * - SERVICE_CLUSTER_PATTERN (→ MAINTENANCE_BEHAVIOR_PROFILE)
   */
  interpretedSignals: DataEngineInterpretedSignal[];
}
