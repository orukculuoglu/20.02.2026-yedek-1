/**
 * Data Engine Timeline Entry
 *
 * Represents a single operational timeline entry.
 *
 * Timeline entries are structured workflow directives derived from
 * acceptance evaluations. They are NOT executed orders, but rather
 * structured information that downstream systems use for scheduling/planning.
 */

import type { DataEngineTimelineEntryType } from '../types/DataEngineTimelineEntryType';
import type { DataEngineTimelinePriority } from '../types/DataEngineTimelinePriority';
import type { DataEngineTimelineWindow } from '../types/DataEngineTimelineSchedulingWindow';

/**
 * Single timeline entry
 *
 * Represents one operational action/responsibility on the timeline.
 */
export interface DataEngineTimelineEntry {
  /**
   * Deterministic timeline entry ID
   * Generated as SHA-256(identityId + timelineType + sourceEntityRef + priority)
   */
  timelineEntryId: string;

  /**
   * Type of timeline entry (monitoring, inspection, review, urgent, critical)
   */
  timelineType: DataEngineTimelineEntryType;

  /**
   * Priority of the entry (LOW, MEDIUM, HIGH, CRITICAL)
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
   * Acceptance evaluation IDs this entry is based on
   * Ensures full traceability back to Phase 12
   */
  sourceEvaluationRefs: string[];

  /**
   * Deterministic scheduling window
   * When this entry should be actioned
   */
  scheduledWindow: DataEngineTimelineWindow;

  /**
   * Textual rationale for timeline entry
   *
   * Examples:
   * - "WATCH status on component health → monitor monthly"
   * - "ESCALATE status on service dependency → schedule inspection"
   * - "REJECTED status on composite → urgent multi-domain review"
   */
  rationale: string;

  /**
   * ISO 8601 timestamp of timeline entry creation
   */
  createdAt: string;

  /**
   * Extension properties for domain-specific metadata
   */
  properties: Record<string, unknown>;
}

/**
 * Factory function for creating timeline entries
 */
export function createTimelineEntry(
  timelineEntryId: string,
  timelineType: DataEngineTimelineEntryType,
  priority: DataEngineTimelinePriority,
  identityId: string,
  sourceEntityRef: string,
  sourceEvaluationRefs: string[],
  scheduledWindow: DataEngineTimelineWindow,
  rationale: string,
  properties: Record<string, unknown> = {}
): DataEngineTimelineEntry {
  return {
    timelineEntryId,
    timelineType,
    priority,
    identityId,
    sourceEntityRef,
    sourceEvaluationRefs,
    scheduledWindow,
    rationale,
    createdAt: new Date().toISOString(),
    properties,
  };
}
