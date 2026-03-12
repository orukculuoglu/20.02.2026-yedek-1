/**
 * DataEngineSignalInterpretationCandidate — Phase 8 Input Contract
 *
 * Input structure passed to interpretSignals() engine function.
 *
 * Contains:
 * - Vehicle identity context
 * - Phase 7 prepared signals (ready for interpretation)
 * - Interpretation metadata
 *
 * Example:
 *
 * {
 *   identityId: "VEH-2024-001",
 *   sourceEntityRef: "ENTITY-001",
 *   interpretedAt: "2024-01-15T09:30:00Z",
 *   preparedSignals: [
 *     { signalId: "...", signalType: "COMPONENT_RECURRENCE", ... },
 *     { signalId: "...", signalType: "TIMELINE_DENSITY", ... }
 *   ]
 * }
 */

import type { DataEngineSignalCandidate } from '../../signals/models/DataEngineSignalCandidate';

export interface DataEngineSignalInterpretationCandidate {
  /**
   * Vehicle identity anchoring.
   *
   * Passed through from Phase 7 signals.
   * All interpretation results trace to this vehicle.
   */
  identityId: string;

  /**
   * Source entity reference.
   *
   * Passed through from Phase 7 signals.
   * Maintains context of original processing entity.
   */
  sourceEntityRef: string;

  /**
   * ISO timestamp for interpretation batch.
   *
   * Marks when this interpretation candidate was created.
   * Used for temporal ordering and audit.
   */
  interpretedAt: string;

  /**
   * Phase 7 prepared signals ready for interpretation.
   *
   * Array of signal candidates from Phase 7 output.
   * These signals will be grouped into interpreted patterns.
   *
   * Signal types present:
   * - TIMELINE_DENSITY (→ TEMPORAL_ANOMALY_PATTERN)
   * - COMPONENT_RECURRENCE (→ COMPONENT_DEGRADATION_PATTERN)
   * - ACTOR_CONCENTRATION (→ ACTOR_DEPENDENCY_PATTERN)
   * - EVENT_TYPE_FREQUENCY (→ SERVICE_CLUSTER_PATTERN)
   */
  preparedSignals: DataEngineSignalCandidate[];
}
