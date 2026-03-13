/**
 * Data Engine Execution Candidate
 *
 * Represents a single prepared operational execution candidate.
 *
 * Execution candidates are structured task directives derived from
 * timeline entries. They prepare potential operational actions but
 * do NOT execute them or create real work orders.
 */

import type { DataEngineExecutionTaskType } from '../types/DataEngineExecutionTaskType';
import type { DataEngineTimelinePriority } from '../../timeline/types/DataEngineTimelinePriority';
import type { DataEngineTimelineWindow } from '../../timeline/types/DataEngineTimelineSchedulingWindow';

/**
 * Single execution candidate
 *
 * Represents one potential operational task prepared for execution.
 */
export interface DataEngineExecutionCandidate {
  /**
   * Deterministic execution candidate ID
   * Generated as SHA-256(identityId + executionTaskType + sourceEntityRef + priority)
   */
  executionCandidateId: string;

  /**
   * Type of execution task (monitoring, inspection, planning, review, intervention)
   */
  executionTaskType: DataEngineExecutionTaskType;

  /**
   * Priority of the execution candidate
   * Inherited from source timeline entry priority
   */
  priority: DataEngineTimelinePriority;

  /**
   * Vehicle identity reference
   */
  identityId: string;

  /**
   * Source entity reference for traceability
   */
  sourceEntityRef: string;

  /**
   * Timeline entry IDs this candidate is based on
   * Ensures full traceability back to Phase 13
   */
  sourceTimelineRefs: string[];

  /**
   * Suggested operational window for execution
   * Inherited from source timeline entry
   */
  suggestedWindow: DataEngineTimelineWindow;

  /**
   * Textual rationale for execution candidate
   *
   * Examples:
   * - "Monitor entry from WATCH timeline → monitoring task"
   * - "Inspection entry HIGH priority → inspection task"
   * - "CRITICAL attention entry → critical intervention task"
   */
  rationale: string;

  /**
   * ISO 8601 timestamp of execution candidate preparation
   */
  preparedAt: string;

  /**
   * Extension properties for domain-specific metadata
   */
  properties: Record<string, unknown>;
}

/**
 * Factory function for creating execution candidates
 */
export function createExecutionCandidate(
  executionCandidateId: string,
  executionTaskType: DataEngineExecutionTaskType,
  priority: DataEngineTimelinePriority,
  identityId: string,
  sourceEntityRef: string,
  sourceTimelineRefs: string[],
  suggestedWindow: DataEngineTimelineWindow,
  rationale: string,
  properties: Record<string, unknown> = {}
): DataEngineExecutionCandidate {
  return {
    executionCandidateId,
    executionTaskType,
    priority,
    identityId,
    sourceEntityRef,
    sourceTimelineRefs,
    suggestedWindow,
    rationale,
    preparedAt: new Date().toISOString(),
    properties,
  };
}
