/**
 * Data Engine Timeline Result
 *
 * Output from the timeline building engine.
 * Contains all generated timeline entries and summary statistics.
 *
 * Flows from: buildOperationalTimeline()
 * Flows to: Downstream workflow/scheduling systems
 */

import type { DataEngineTimelineEntry } from './DataEngineTimelineEntry';
import type { DataEngineTimelineEntryType } from '../types/DataEngineTimelineEntryType';
import type { DataEngineTimelinePriority } from '../types/DataEngineTimelinePriority';
import type { DataEngineTimelineWindow } from '../types/DataEngineTimelineSchedulingWindow';

/**
 * Priority distribution statistics
 */
export interface TimelinePriorityDistribution {
  [priority: string]: number;
}

/**
 * Timeline entry type distribution statistics
 */
export interface TimelineTypeDistribution {
  [entryType: string]: number;
}

/**
 * Summary statistics for timeline generation
 */
export interface TimelineSummary {
  /**
   * Total number of timeline entries generated
   */
  totalEntries: number;

  /**
   * Distribution of entries by priority
   */
  priorityDistribution: TimelinePriorityDistribution;

  /**
   * Distribution of entries by timeline type
   */
  timelineTypeDistribution: TimelineTypeDistribution;

  /**
   * Highest priority entry priority
   */
  highestPriority: DataEngineTimelinePriority | null;

  /**
   * Earliest/most urgent scheduling window
   */
  earliestWindow: DataEngineTimelineWindow | null;

  /**
   * Count of IMMEDIATE entries
   */
  immediateCount: number;

  /**
   * Count of CRITICAL priority entries
   */
  criticalCount: number;
}

/**
 * Result of timeline generation
 *
 * Contains all timeline entries with comprehensive summary
 */
export interface DataEngineTimelineResult {
  /**
   * All generated timeline entries
   */
  timelineEntries: DataEngineTimelineEntry[];

  /**
   * Summary statistics
   */
  summary: TimelineSummary;

  /**
   * Timestamp of timeline generation
   */
  timelineGeneratedAt: string;
}

/**
 * Helper to calculate summary from timeline entries
 */
export function calculateTimelineSummary(
  entries: DataEngineTimelineEntry[]
): TimelineSummary {
  const priorityDistribution: TimelinePriorityDistribution = {};
  const typeDistribution: TimelineTypeDistribution = {};
  let highestPriority: DataEngineTimelinePriority | null = null;
  let earliestWindow: DataEngineTimelineWindow | null = null;
  let immediateCount = 0;
  let criticalCount = 0;

  const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  const windowOrder = { IMMEDIATE: 3, NEXT_SERVICE_WINDOW: 2, NEXT_30_DAYS: 1, NEXT_90_DAYS: 0 };

  for (const entry of entries) {
    // Track priority distribution
    priorityDistribution[entry.priority] = (priorityDistribution[entry.priority] || 0) + 1;

    // Track type distribution
    typeDistribution[entry.timelineType] = (typeDistribution[entry.timelineType] || 0) + 1;

    // Track highest priority
    if (!highestPriority || priorityOrder[entry.priority] > priorityOrder[highestPriority]) {
      highestPriority = entry.priority;
    }

    // Track earliest window
    if (!earliestWindow || windowOrder[entry.scheduledWindow] > windowOrder[earliestWindow]) {
      earliestWindow = entry.scheduledWindow;
    }

    // Count immediate and critical
    if (entry.scheduledWindow === 'IMMEDIATE') {
      immediateCount++;
    }
    if (entry.priority === 'CRITICAL') {
      criticalCount++;
    }
  }

  return {
    totalEntries: entries.length,
    priorityDistribution,
    timelineTypeDistribution: typeDistribution,
    highestPriority,
    earliestWindow,
    immediateCount,
    criticalCount,
  };
}

/**
 * Helper to create result
 */
export function createTimelineResult(
  timelineEntries: DataEngineTimelineEntry[],
  timelineGeneratedAt: string
): DataEngineTimelineResult {
  return {
    timelineEntries,
    summary: calculateTimelineSummary(timelineEntries),
    timelineGeneratedAt,
  };
}
