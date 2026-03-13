/**
 * Data Engine Execution Task Type
 *
 * Defines the taxonomy of operational execution task types.
 *
 * Each type represents a specific operational task that may be prepared
 * and potentially executed based on timeline entries.
 */

/**
 * MONITORING_TASK
 *
 * Represents ongoing monitoring and signal collection.
 * Triggered by MONITORING_ENTRY from Phase 13.
 *
 * Example: "Monitor hydraulic system health signals"
 * Execution: Data collection only, no intervention
 */
export const MONITORING_TASK = 'MONITORING_TASK' as const;

/**
 * INSPECTION_TASK
 *
 * Represents vehicle service inspection or component diagnostic.
 * Triggered by SERVICE_INSPECTION_ENTRY from Phase 13.
 *
 * Example: "Schedule component health inspection"
 * Execution: Diagnostic assessment, no repairs
 */
export const INSPECTION_TASK = 'INSPECTION_TASK' as const;

/**
 * MAINTENANCE_PLANNING_TASK
 *
 * Represents maintenance review and planning activity.
 * Triggered by MAINTENANCE_REVIEW_ENTRY from Phase 13.
 *
 * Example: "Plan preventive maintenance requirements"
 * Execution: Planning and recommendation, no immediate action
 */
export const MAINTENANCE_PLANNING_TASK = 'MAINTENANCE_PLANNING_TASK' as const;

/**
 * DIAGNOSTIC_REVIEW_TASK
 *
 * Represents urgent diagnostic review and decision-making.
 * Triggered by URGENT_REVIEW_ENTRY from Phase 13.
 *
 * Example: "Urgent diagnostic review of alignment signals"
 * Execution: Expert review, may lead to intervention
 */
export const DIAGNOSTIC_REVIEW_TASK = 'DIAGNOSTIC_REVIEW_TASK' as const;

/**
 * CRITICAL_INTERVENTION_TASK
 *
 * Represents critical operational intervention required.
 * Triggered by CRITICAL_ATTENTION_ENTRY from Phase 13.
 *
 * Example: "Critical multi-domain intervention required"
 * Execution: Immediate intervention planning required
 */
export const CRITICAL_INTERVENTION_TASK = 'CRITICAL_INTERVENTION_TASK' as const;

/**
 * Union type of all execution task types
 */
export type DataEngineExecutionTaskType =
  | typeof MONITORING_TASK
  | typeof INSPECTION_TASK
  | typeof MAINTENANCE_PLANNING_TASK
  | typeof DIAGNOSTIC_REVIEW_TASK
  | typeof CRITICAL_INTERVENTION_TASK;

/**
 * Array of all execution task types for iteration
 */
export const ALL_EXECUTION_TASK_TYPES: DataEngineExecutionTaskType[] = [
  MONITORING_TASK,
  INSPECTION_TASK,
  MAINTENANCE_PLANNING_TASK,
  DIAGNOSTIC_REVIEW_TASK,
  CRITICAL_INTERVENTION_TASK,
];

/**
 * Execution task type descriptions
 */
export const EXECUTION_TASK_TYPE_DESCRIPTIONS: Record<DataEngineExecutionTaskType, string> = {
  MONITORING_TASK: 'Ongoing monitoring and signal collection',
  INSPECTION_TASK: 'Vehicle service inspection or diagnostic',
  MAINTENANCE_PLANNING_TASK: 'Maintenance review and planning',
  DIAGNOSTIC_REVIEW_TASK: 'Urgent diagnostic review and decision-making',
  CRITICAL_INTERVENTION_TASK: 'Critical operational intervention',
};
