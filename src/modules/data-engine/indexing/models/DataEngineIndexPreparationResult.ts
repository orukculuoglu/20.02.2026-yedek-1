/**
 * Data Engine Index Preparation Result
 *
 * Represents Phase 6 output.
 * Contains prepared index records ready for consumption by Phase 7+.
 */

import type { DataEngineIndexRecord } from './DataEngineIndexRecord';

export interface DataEngineIndexPreparationResult {
  /**
   * Preparation success status.
   */
  success: boolean;

  /**
   * All prepared index records.
   * Deterministically generated, traceable, query-ready.
   */
  preparedRecords: DataEngineIndexRecord[];

  /**
   * Reference to the input candidate.
   * Traceability back to Phase 5.
   */
  candidateRef: {
    identityId: string;
    sourceEntityRef: string;
    attachedAt: string;
  };

  /**
   * Phase 6 preparation timestamp.
   * When this batch of indexes was prepared.
   */
  preparedAt: string;

  /**
   * Summary statistics.
   * Counts and high-level metrics.
   */
  summary: {
    totalRecordsPrepared: number;
    recordsByType: Record<string, number>;
    uniqueVehicles: number;
    uniqueComponents: number;
    uniqueActors: number;
    uniqueEventTypes: number;
  };

  /**
   * Optional issues or warnings during preparation.
   * Non-blocking—preparation succeeds even with warnings.
   */
  warnings?: string[];
}
