import { Workflow, WorkOrder } from '../domain';
import { WorkflowType, WorkOrderType, WorkflowPriority } from '../domain';
import { WorkflowRefs } from '../domain';
import { WorkflowEngineInput } from '../engine/workflow-engine.types';
import { WorkOrderEngineInput } from '../work-order-engine/work-order-engine.types';

/**
 * Input contract for the Workflow Runtime orchestration service.
 * Combines workflow and work order creation into a single deterministic operation.
 *
 * The runtime pipeline:
 * 1. Create workflow from workflowInput
 * 2. Create work order, inheriting workflowId, vehicleId, priority, refs from workflow result
 * 3. Generate runtime snapshot
 * 4. Return complete result
 */
export interface WorkflowRuntimeInput {
  workflowInput: WorkflowEngineInput;
  workOrderInput: Omit<WorkOrderEngineInput, 'workflowId' | 'vehicleId' | 'priority' | 'refs'>;
  recommendationIds: string[];
  runtimeTimestamp: number;
}

/**
 * Output contract for the Workflow Runtime orchestration service.
 * Contains both created entities and a deterministic runtime snapshot.
 */
export interface WorkflowRuntimeResult {
  workflow: Workflow;
  workOrder: WorkOrder;
  recommendationIds: string[];
  snapshot: WorkflowRuntimeSnapshot;
}

/**
 * Deterministic snapshot of a workflow runtime execution.
 * Captures the essential state of workflow and work order creation at runtime.
 *
 * Used for:
 * - Runtime state capture
 * - Audit trails
 * - Future queue/event publishing (in later phases)
 *
 * All fields are derived from actual runtime result data.
 * No hidden defaults or internal timestamps.
 */
export interface WorkflowRuntimeSnapshot {
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
