/**
 * Data Engine Execution Module Index
 *
 * Exports all execution types, models, and functions.
 */

// Type exports
export {
  MONITORING_TASK,
  INSPECTION_TASK,
  MAINTENANCE_PLANNING_TASK,
  DIAGNOSTIC_REVIEW_TASK,
  CRITICAL_INTERVENTION_TASK,
  ALL_EXECUTION_TASK_TYPES,
  EXECUTION_TASK_TYPE_DESCRIPTIONS,
  type DataEngineExecutionTaskType,
} from './types/DataEngineExecutionTaskType';

// Model exports
export {
  createExecutionCandidate,
  type DataEngineExecutionCandidate,
} from './models/DataEngineExecutionCandidate';

export {
  getTimelineEntriesByType,
  countTimelineEntriesByType,
  type DataEngineExecutionCandidateInput,
} from './models/DataEngineExecutionCandidateInput';

export {
  calculateExecutionSummary,
  createExecutionResult,
  type DataEngineExecutionCandidateResult,
  type ExecutionSummary,
  type ExecutionPriorityDistribution,
  type ExecutionTypeDistribution,
} from './models/DataEngineExecutionCandidateResult';

// Engine exports
export { prepareExecutionCandidates } from './engine/prepareExecutionCandidates';

// Example exports
export {
  exampleScenario1_MinimalMonitoring,
  exampleScenario2_MixedTimelines,
  exampleScenario3_SevereTimelines,
  exampleScenario4_CriticalTimelines,
  printExecutionPreparationResult,
  runExamples,
} from './examples/exampleExecutionPreparationCases';
