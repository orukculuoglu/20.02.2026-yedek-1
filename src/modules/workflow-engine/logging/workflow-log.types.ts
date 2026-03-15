import { WorkflowType, WorkOrderType, WorkflowPriority } from '../domain';
import { WorkflowRefs } from '../domain';

/**
 * Enum for workflow log event types.
 * Captures distinct lifecycle events in workflow execution.
 */
export enum WorkflowLogEventType {
  WORKFLOW_CREATED = 'WORKFLOW_CREATED',
  WORK_ORDER_CREATED = 'WORK_ORDER_CREATED',
  RUNTIME_COMPLETED = 'RUNTIME_COMPLETED',
  INTEGRATION_PREPARED = 'INTEGRATION_PREPARED',
  SNAPSHOT_GENERATED = 'SNAPSHOT_GENERATED',
}

/**
 * Log snapshot capturing essential workflow state.
 * Mirrors WorkflowRuntimeSnapshot for consistent audit trail.
 *
 * Fields:
 * - workflowId, workOrderId: Entity identifiers
 * - vehicleId: Vehicle context
 * - workflowType, orderType: Operation types
 * - priority: Resolved priority level
 * - recommendationIds: Linked recommendations (stable order)
 * - createdAt: Timestamp of runtime execution
 * - refs: Upstream references for traceability
 *
 * No hidden fields or optional ambiguity on audit data.
 */
export interface WorkflowLogSnapshot {
  workflowId: string;
  workOrderId: string;
  vehicleId: string;
  workflowType: WorkflowType;
  orderType: WorkOrderType;
  priority: WorkflowPriority;
  recommendationIds: string[];
  createdAt: number;
  refs: WorkflowRefs;
}

/**
 * Log entry capturing a workflow execution event.
 *
 * Fields:
 * - logId: Unique log identifier
 * - timestamp: When the log entry was created
 * - eventType: Type of event (enum value)
 * - snapshot: Runtime state capture
 * - message: Human-readable event description
 * - metadata: Optional additional context (untyped for flexibility)
 *
 * No Date.now() or random ID generation.
 * All values are explicit inputs.
 */
export interface WorkflowLogEntry {
  logId: string;
  timestamp: number;
  eventType: WorkflowLogEventType;
  snapshot: WorkflowLogSnapshot;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Result of workflow log creation.
 * Provides both snapshot and log entry for comprehensive audit trail.
 */
export interface WorkflowLogResult {
  snapshot: WorkflowLogSnapshot;
  logEntry: WorkflowLogEntry;
}
