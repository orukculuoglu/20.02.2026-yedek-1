/**
 * DataEnginePriorityPreparationCandidate — Phase 10 Input Contract
 *
 * Input structure passed to preparePriorityCandidates() engine function.
 *
 * Contains:
 * - Vehicle identity context
 * - Phase 9 vehicle intelligence profile (ready for extraction)
 * - Preparation metadata
 *
 * Example:
 *
 * {
 *   identityId: "VEH-2024-001",
 *   sourceEntityRef: "ENTITY-001",
 *   preparedAt: "2024-02-01T16:00:00Z",
 *   vehicleProfile: {
 *     profileId: "...",
 *     profileDomains: {...},
 *     ...
 *   }
 * }
 */

import type { DataEngineVehicleProfile } from '../../profile/models/DataEngineVehicleProfile';

export interface DataEnginePriorityPreparationCandidate {
  /**
   * Vehicle identity anchoring.
   *
   * Passed through from vehicle profile.
   * All priority candidates aggregate to this vehicle.
   */
  identityId: string;

  /**
   * Source entity reference.
   *
   * Passed through from vehicle profile.
   * Maintains context of original processing entity.
   */
  sourceEntityRef: string;

  /**
   * ISO timestamp for priority preparation batch.
   *
   * Marks when this priority preparation candidate was created.
   * Used for temporal ordering and audit.
   */
  preparedAt: string;

  /**
   * Phase 9 vehicle intelligence profile ready for pattern extraction.
   *
   * The consolidated profile containing 5 behavioral domains:
   * - vehicleBehaviorProfile (overview)
   * - maintenanceBehaviorProfile (service patterns)
   * - componentHealthProfile (component patterns)
   * - serviceDependencyProfile (actor patterns)
   * - usageIntensityProfile (temporal patterns)
   *
   * Patterns from these domains will be extracted into priority candidates.
   */
  vehicleProfile: DataEngineVehicleProfile;
}
