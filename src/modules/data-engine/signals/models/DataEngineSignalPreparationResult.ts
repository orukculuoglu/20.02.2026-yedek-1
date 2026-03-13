/**
 * Data Engine Signal Preparation Result
 *
 * Represents Phase 7 output.
 * Contains prepared signal candidates ready for consumption by Phase 8+.
 */

import type { DataEngineSignalCandidate } from './DataEngineSignalCandidate';

export interface DataEngineSignalPreparationResult {
  /**
   * Preparation success status.
   */
  success: boolean;

  /**
   * All prepared signal candidates.
   * Deterministically generated, traceable, evidence-based.
   */
  preparedSignals: DataEngineSignalCandidate[];

  /**
   * Reference to the input candidate.
   * Traceability back to Phase 6.
   */
  candidateRef: {
    identityId: string;
    sourceEntityRef: string;
    preparedAt: string;
  };

  /**
   * Phase 7 preparation timestamp.
   * When this batch of signals was prepared.
   */
  preparedAt: string;

  /**
   * Summary statistics.
   * Counts and high-level metrics.
   */
  summary: {
    totalSignalsPrepared: number;
    signalsByType: Record<string, number>;
    uniqueVehicles: number;
    uniqueComponents: number;
    uniqueActors: number;
    uniqueEventTypes: number;
    averageSupportingEvidencePerSignal: number;
  };

  /**
   * Optional issues or warnings during preparation.
   * Non-blocking—preparation succeeds even with warnings.
   */
  warnings?: string[];
}
