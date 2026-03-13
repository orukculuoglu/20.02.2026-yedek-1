/**
 * Data Engine Work Order Type
 *
 * Defines the taxonomy of work order types.
 *
 * Each type represents a specific operational work order
 * that may be created based on execution candidates.
 */

/**
 * VEHICLE_MONITORING_ORDER
 *
 * Represents ongoing vehicle monitoring work order.
 * Triggered by MONITORING_TASK from Phase 14.
 *
 * Work: Continuous signal monitoring and observation
 */
export const VEHICLE_MONITORING_ORDER = 'VEHICLE_MONITORING_ORDER' as const;

/**
 * DIAGNOSTIC_INSPECTION_ORDER
 *
 * Represents vehicle diagnostic inspection work order.
 * Triggered by INSPECTION_TASK from Phase 14.
 *
 * Work: Component diagnostics and health assessment
 */
export const DIAGNOSTIC_INSPECTION_ORDER = 'DIAGNOSTIC_INSPECTION_ORDER' as const;

/**
 * MAINTENANCE_PLANNING_ORDER
 *
 * Represents maintenance planning work order.
 * Triggered by MAINTENANCE_PLANNING_TASK from Phase 14.
 *
 * Work: Maintenance planning and scheduling
 */
export const MAINTENANCE_PLANNING_ORDER = 'MAINTENANCE_PLANNING_ORDER' as const;

/**
 * EXPERT_DIAGNOSTIC_REVIEW_ORDER
 *
 * Represents expert diagnostic review work order.
 * Triggered by DIAGNOSTIC_REVIEW_TASK from Phase 14.
 *
 * Work: Specialist review and assessment
 */
export const EXPERT_DIAGNOSTIC_REVIEW_ORDER = 'EXPERT_DIAGNOSTIC_REVIEW_ORDER' as const;

/**
 * CRITICAL_SERVICE_INTERVENTION_ORDER
 *
 * Represents critical service intervention work order.
 * Triggered by CRITICAL_INTERVENTION_TASK from Phase 14.
 *
 * Work: Critical operational intervention
 */
export const CRITICAL_SERVICE_INTERVENTION_ORDER = 'CRITICAL_SERVICE_INTERVENTION_ORDER' as const;

/**
 * Union type of all work order types
 */
export type DataEngineWorkOrderType =
  | typeof VEHICLE_MONITORING_ORDER
  | typeof DIAGNOSTIC_INSPECTION_ORDER
  | typeof MAINTENANCE_PLANNING_ORDER
  | typeof EXPERT_DIAGNOSTIC_REVIEW_ORDER
  | typeof CRITICAL_SERVICE_INTERVENTION_ORDER;

/**
 * Array of all work order types for iteration
 */
export const ALL_WORK_ORDER_TYPES: DataEngineWorkOrderType[] = [
  VEHICLE_MONITORING_ORDER,
  DIAGNOSTIC_INSPECTION_ORDER,
  MAINTENANCE_PLANNING_ORDER,
  EXPERT_DIAGNOSTIC_REVIEW_ORDER,
  CRITICAL_SERVICE_INTERVENTION_ORDER,
];

/**
 * Work order type descriptions
 */
export const WORK_ORDER_TYPE_DESCRIPTIONS: Record<DataEngineWorkOrderType, string> = {
  VEHICLE_MONITORING_ORDER: 'Vehicle monitoring work order',
  DIAGNOSTIC_INSPECTION_ORDER: 'Diagnostic inspection work order',
  MAINTENANCE_PLANNING_ORDER: 'Maintenance planning work order',
  EXPERT_DIAGNOSTIC_REVIEW_ORDER: 'Expert diagnostic review work order',
  CRITICAL_SERVICE_INTERVENTION_ORDER: 'Critical service intervention work order',
};
