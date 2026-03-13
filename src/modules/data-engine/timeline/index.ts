/**
 * Data Engine Timeline Module Index
 *
 * Exports all timeline types, models, and functions.
 */

// Type exports
export {
  MONITORING_ENTRY,
  MAINTENANCE_REVIEW_ENTRY,
  SERVICE_INSPECTION_ENTRY,
  URGENT_REVIEW_ENTRY,
  CRITICAL_ATTENTION_ENTRY,
  ALL_TIMELINE_ENTRY_TYPES,
  TIMELINE_ENTRY_TYPE_DESCRIPTIONS,
  type DataEngineTimelineEntryType,
} from './types/DataEngineTimelineEntryType';

export {
  LOW,
  MEDIUM,
  HIGH,
  CRITICAL,
  ALL_TIMELINE_PRIORITIES,
  PRIORITY_SEVERITY,
  getHighestPriority,
  type DataEngineTimelinePriority,
} from './types/DataEngineTimelinePriority';

export {
  IMMEDIATE,
  NEXT_SERVICE_WINDOW,
  NEXT_30_DAYS,
  NEXT_90_DAYS,
  ALL_TIMELINE_WINDOWS,
  WINDOW_URGENCY,
  type DataEngineTimelineWindow,
} from './types/DataEngineTimelineSchedulingWindow';

// Model exports
export {
  createTimelineEntry,
  type DataEngineTimelineEntry,
} from './models/DataEngineTimelineEntry';

export {
  getEvaluationsByStatus,
  countEvaluationsByStatus,
  type DataEngineTimelineCandidate,
} from './models/DataEngineTimelineCandidate';

export {
  calculateTimelineSummary,
  createTimelineResult,
  type DataEngineTimelineResult,
  type TimelineSummary,
  type TimelinePriorityDistribution,
  type TimelineTypeDistribution,
} from './models/DataEngineTimelineResult';

// Engine exports
export { buildOperationalTimeline } from './engine/buildOperationalTimeline';

// Example exports
export {
  exampleScenario1_AllAccepted,
  exampleScenario2_MixedWatchEscalate,
  exampleScenario3_SevereEscalateRejected,
  exampleScenario4_CriticalConsensus,
  printTimelineResult,
  runExamples,
} from './examples/exampleTimelineCases';
