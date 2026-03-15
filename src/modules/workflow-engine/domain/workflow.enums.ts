/**
 * Workflow lifecycle statuses.
 * Represents the progression of a workflow through its operational lifetime.
 */
export enum WorkflowStatus {
  CREATED = 'CREATED',
  READY = 'READY',
  RUNNING = 'RUNNING',
  WAITING = 'WAITING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Work order lifecycle statuses.
 * Represents the progression of a work order through completion.
 */
export enum WorkOrderStatus {
  OPEN = 'OPEN',
  QUEUED = 'QUEUED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

/**
 * Priority levels for workflows and work orders.
 * Used to determine execution order and resource allocation.
 */
export enum WorkflowPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Taxonomy of workflow types.
 * Represents different operational process categories.
 */
export enum WorkflowType {
  MONITORING = 'MONITORING',
  DIAGNOSTIC_INSPECTION = 'DIAGNOSTIC_INSPECTION',
  MAINTENANCE_PLANNING = 'MAINTENANCE_PLANNING',
  EXPERT_REVIEW = 'EXPERT_REVIEW',
  CRITICAL_INTERVENTION = 'CRITICAL_INTERVENTION',
}

/**
 * Work order types.
 * Represents different operational task categories.
 */
export enum WorkOrderType {
  INSPECTION = 'INSPECTION',
  REPAIR = 'REPAIR',
  MAINTENANCE = 'MAINTENANCE',
  REPLACEMENT = 'REPLACEMENT',
  CONSULTATION = 'CONSULTATION',
  ESCALATION = 'ESCALATION',
}
