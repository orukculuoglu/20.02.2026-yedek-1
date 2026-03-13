/**
 * Data Engine Execution Candidate Input
 *
 * Input to the execution candidate preparation engine.
 * Contains timeline entries to be converted to execution candidates.
 *
 * Flows from: Phase 13 (Timeline Engine)
 * Flows to: prepareExecutionCandidates()
 */

import type { DataEngineTimelineEntry } from '../../timeline/models/DataEngineTimelineEntry';

/**
 * Input model for execution candidate preparation
 *
 * Wraps timeline entries from Phase 13 with execution context.
 */
export interface DataEngineExecutionCandidateInput {
  /**
   * Vehicle identity
   */
  identityId: string;

  /**
   * Source entity reference for traceability
   */
  sourceEntityRef: string;

  /**
   * Timeline entries from Phase 13
   * These are converted to execution candidates
   */
  timelineEntries: DataEngineTimelineEntry[];

  /**
   * Timestamp when execution candidates are prepared
   */
  preparedAt: string;
}

/**
 * Helper to get timeline entries by type
 */
export function getTimelineEntriesByType(
  input: DataEngineExecutionCandidateInput,
  timelineType: string
): DataEngineTimelineEntry[] {
  return input.timelineEntries.filter((e) => e.timelineType === timelineType);
}

/**
 * Helper to count timeline entries by type
 */
export function countTimelineEntriesByType(
  input: DataEngineExecutionCandidateInput,
  timelineType: string
): number {
  return getTimelineEntriesByType(input, timelineType).length;
}
