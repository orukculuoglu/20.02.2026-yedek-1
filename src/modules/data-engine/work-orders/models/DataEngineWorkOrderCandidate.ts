/**
 * Data Engine Work Order Candidate
 *
 * Represents a single prepared work order candidate.
 *
 * Work order candidates are structured task directives derived from
 * execution candidates. They prepare potential work orders but
 * do NOT create real work orders or call ERP systems.
 */

import type { DataEngineWorkOrderType } from '../types/DataEngineWorkOrderType';
import type { DataEngineTimelinePriority } from '../../timeline/types/DataEngineTimelinePriority';
import type { DataEngineTimelineWindow } from '../../timeline/types/DataEngineTimelineSchedulingWindow';

/**
 * Single work order candidate
 *
 * Represents one prepared work order.
 */
export interface DataEngineWorkOrderCandidate {
  /**
   * Deterministic work order candidate ID
   * Generated as SHA-256(identityId + workOrderType + sourceEntityRef + priority)
   */
  workOrderCandidateId: string;

  /**
   * Type of work order (monitoring, inspection, planning, review, intervention)
   */
  workOrderType: DataEngineWorkOrderType;

  /**
   * Priority of the work order
   * Inherited from source execution candidate priority
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
   * Execution candidate IDs this work order is based on
   * Ensures full traceability back to Phase 14
   */
  sourceExecutionCandidateRefs: string[];

  /**
   * Suggested operational window for work order execution
   * Inherited from source execution candidate
   */
  suggestedWindow: DataEngineTimelineWindow;

  /**
   * Textual rationale for work order candidate
   *
   * Examples:
   * - "Monitoring task → vehicle monitoring work order"
   * - "Inspection task (HIGH priority) → diagnostic inspection work order"
   * - "Critical intervention → critical service intervention work order"
   */
  rationale: string;

  /**
   * Recommended actions for this work order
   * Structured list of action items
   */
  recommendedActions: string[];

  /**
   * ISO 8601 timestamp of work order candidate preparation
   */
  preparedAt: string;

  /**
   * Extension properties for domain-specific metadata
   */
  properties: Record<string, unknown>;
}

/**
 * Factory function for creating work order candidates
 */
export function createWorkOrderCandidate(
  workOrderCandidateId: string,
  workOrderType: DataEngineWorkOrderType,
  priority: DataEngineTimelinePriority,
  identityId: string,
  sourceEntityRef: string,
  sourceExecutionCandidateRefs: string[],
  suggestedWindow: DataEngineTimelineWindow,
  rationale: string,
  recommendedActions: string[],
  properties: Record<string, unknown> = {}
): DataEngineWorkOrderCandidate {
  return {
    workOrderCandidateId,
    workOrderType,
    priority,
    identityId,
    sourceEntityRef,
    sourceExecutionCandidateRefs,
    suggestedWindow,
    rationale,
    recommendedActions,
    preparedAt: new Date().toISOString(),
    properties,
  };
}
