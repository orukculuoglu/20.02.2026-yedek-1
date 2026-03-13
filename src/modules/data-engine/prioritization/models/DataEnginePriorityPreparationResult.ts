/**
 * DataEnginePriorityPreparationResult — Phase 10 Output Contract
 *
 * Output structure returned by preparePriorityCandidates() engine function.
 *
 * Contains:
 * - Extracted priority candidates (priority-ready patterns)
 * - Summary statistics
 * - Preparation metadata
 *
 * Example:
 *
 * {
 *   preparedPriorityCandidates: [
 *     {
 *       priorityCandidateId: "...",
 *       priorityCandidateType: "COMPONENT_PRIORITY_CANDIDATE",
 *       ...
 *     }
 *   ],
 *   summary: {
 *     totalCandidates: 5,
 *     candidateDistribution: {...},
 *     compositeCandidateCount: 1
 *   },
 *   preparedAt: "2024-02-01T16:00:00Z"
 * }
 */

import type { DataEnginePriorityCandidate } from './DataEnginePriorityCandidate';

export interface DataEnginePriorityPreparationResult {
  /**
   * Array of extracted priority candidates.
   *
   * Each represents a pattern-ready structure derived from profile domains.
   *
   * Types:
   * - COMPONENT_PRIORITY_CANDIDATE
   * - SERVICE_PRIORITY_CANDIDATE
   * - ACTOR_PRIORITY_CANDIDATE
   * - TEMPORAL_PRIORITY_CANDIDATE
   * - COMPOSITE_PRIORITY_CANDIDATE
   *
   * All candidates are deterministic, traceable, and vehicle-anchored.
   */
  preparedPriorityCandidates: DataEnginePriorityCandidate[];

  /**
   * Summary statistics for priority preparation batch.
   *
   * Provides insights into candidate composition without introducing score logic.
   */
  summary: {
    /**
     * Total count of priority candidates prepared.
     *
     * Across all 5 candidate types.
     */
    totalCandidates: number;

    /**
     * Distribution of candidates by type.
     *
     * Example:
     * {
     *   "COMPONENT_PRIORITY_CANDIDATE": 2,
     *   "SERVICE_PRIORITY_CANDIDATE": 1,
     *   "ACTOR_PRIORITY_CANDIDATE": 1,
     *   "TEMPORAL_PRIORITY_CANDIDATE": 1,
     *   "COMPOSITE_PRIORITY_CANDIDATE": 1
     * }
     *
     * Helps understand pattern distribution across domains.
     */
    candidateDistribution: Record<string, number>;

    /**
     * Count of composite candidates (multi-domain convergence).
     *
     * Indicates how many patterns span multiple profile domains.
     *
     * Higher composite count suggests systemic pattern interactions.
     */
    compositeCandidateCount: number;
  };

  /**
   * ISO timestamp when priority candidates were prepared.
   *
   * For audit and temporal ordering of preparation batches.
   */
  preparedAt: string;
}
