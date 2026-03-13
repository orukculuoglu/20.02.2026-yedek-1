/**
 * Data Engine Work Orders Module Index
 *
 * Exports all work order types, models, and functions.
 */

// Type exports
export {
  VEHICLE_MONITORING_ORDER,
  DIAGNOSTIC_INSPECTION_ORDER,
  MAINTENANCE_PLANNING_ORDER,
  EXPERT_DIAGNOSTIC_REVIEW_ORDER,
  CRITICAL_SERVICE_INTERVENTION_ORDER,
  ALL_WORK_ORDER_TYPES,
  WORK_ORDER_TYPE_DESCRIPTIONS,
  type DataEngineWorkOrderType,
} from './types/DataEngineWorkOrderType';

// Model exports
export {
  createWorkOrderCandidate,
  type DataEngineWorkOrderCandidate,
} from './models/DataEngineWorkOrderCandidate';

export type { DataEngineWorkOrderCandidateInput } from './models/DataEngineWorkOrderCandidateInput';

export {
  calculateWorkOrderSummary,
  createWorkOrderResult,
  type DataEngineWorkOrderCandidateResult,
  type WorkOrderSummary,
  type WorkOrderPriorityDistribution,
  type WorkOrderTypeDistribution,
} from './models/DataEngineWorkOrderCandidateResult';

// Engine exports
export { createWorkOrderCandidates } from './engine/prepareWorkOrderCandidates';

// Example exports
export {
  exampleScenario1_MonitoringOnly,
  exampleScenario2_MixedExecutionTasks,
  exampleScenario3_SevereExecutionTasks,
  exampleScenario4_CriticalExecutionTasks,
  printWorkOrderPreparationResult,
  runExamples,
} from './examples/exampleWorkOrderPreparationCases';
