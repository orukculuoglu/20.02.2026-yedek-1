/**
 * DataEngineSignalInterpretationResult — Phase 8 Output Contract
 *
 * Output structure returned by interpretSignals() engine function.
 *
 * Contains:
 * - Interpreted signals (high-level semantic patterns)
 * - Summary statistics
 * - Interpretation metadata
 *
 * Example:
 *
 * {
 *   interpretedSignals: [
 *     {
 *       interpretedSignalId: "SIG-INTERP-...",
 *       interpretedSignalType: "COMPONENT_DEGRADATION_PATTERN",
 *       ...
 *     }
 *   ],
 *   summary: {
 *     totalSignalsInterpreted: 3,
 *     uniquePatterns: 2,
 *     patternDistribution: {
 *       "COMPONENT_DEGRADATION_PATTERN": 1,
 *       "TEMPORAL_ANOMALY_PATTERN": 1
 *     }
 *   },
 *   interpretedAt: "2024-01-15T09:30:00Z"
 * }
 */

import type { DataEngineInterpretedSignal } from './DataEngineInterpretedSignal';

export interface DataEngineSignalInterpretationResult {
  /**
   * Array of interpreted signals.
   *
   * Each represents a high-level semantic pattern derived from Phase 7 signals.
   *
   * Types:
   * - TEMPORAL_ANOMALY_PATTERN
   * - COMPONENT_DEGRADATION_PATTERN
   * - ACTOR_DEPENDENCY_PATTERN
   * - SERVICE_CLUSTER_PATTERN
   *
   * All signals are deterministic, traceable, and vehicle-anchored.
   */
  interpretedSignals: DataEngineInterpretedSignal[];

  /**
   * Summary statistics for interpretation batch.
   *
   * Provides insights into pattern distribution without exposing decision logic.
   */
  summary: {
    /**
     * Count of Phase 7 signals that contributed to interpretation.
     */
    totalSignalsInterpreted: number;

    /**
     * Count of unique interpreted patterns created.
     *
     * Each unique pattern = one interpreted signal.
     */
    uniquePatterns: number;

    /**
     * Distribution of interpreted signals by type.
     *
     * Example:
     * {
     *   "COMPONENT_DEGRADATION_PATTERN": 2,
     *   "TEMPORAL_ANOMALY_PATTERN": 1,
     *   "SERVICE_CLUSTER_PATTERN": 1
     * }
     *
     * Helps understand signal grouping outcomes.
     */
    patternDistribution: Record<string, number>;
  };

  /**
   * ISO timestamp when interpretation completed.
   *
   * For audit and temporal ordering of interpretation batches.
   */
  interpretedAt: string;
}
