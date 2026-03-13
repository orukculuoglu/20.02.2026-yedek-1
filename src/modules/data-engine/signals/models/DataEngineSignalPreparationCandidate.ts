/**
 * Data Engine Signal Preparation Candidate
 *
 * Represents Phase 6 output entering Phase 7.
 * Input structure for signal preparation engine.
 *
 * NOT a persistence object.
 * Simply the contract for what Phase 6 provides to Phase 7.
 */

import type { DataEngineIndexRecord } from '../../indexing/models/DataEngineIndexRecord';

export interface DataEngineSignalPreparationCandidate {
  /**
   * Vehicle identity reference.
   * Anchors all signals back to the vehicle.
   */
  identityId: string;

  /**
   * Prepared index records from Phase 6.
   * Contains all 4 index families:
   * - VEHICLE_TIMELINE
   * - VEHICLE_COMPONENT
   * - VEHICLE_ACTOR
   * - VEHICLE_EVENT_TYPE
   */
  preparedRecords: DataEngineIndexRecord[];

  /**
   * Original entity reference.
   * Source of the index records.
   */
  sourceEntityRef: string;

  /**
   * Timestamp when indexes were prepared.
   * Used as reference for signal preparation timestamps if needed.
   */
  preparedAt: string;
}
