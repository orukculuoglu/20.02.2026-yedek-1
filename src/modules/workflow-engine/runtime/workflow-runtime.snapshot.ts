import { Workflow, WorkOrder } from '../domain';
import { WorkflowRuntimeSnapshot } from './workflow-runtime.types';

/**
 * Build a deterministic runtime snapshot from workflow and work order results.
 *
 * @param workflow - Created workflow entity
 * @param workOrder - Created work order entity
 * @param recommendationIds - Normalized recommendation IDs
 * @returns WorkflowRuntimeSnapshot with all required fields
 *
 * The snapshot is deterministic:
 * - All fields derived directly from input parameters
 * - No hidden computations or side effects
 * - No internal timestamps
 * - Stable and reproducible with same inputs
 */
export function buildWorkflowRuntimeSnapshot(
  workflow: Workflow,
  workOrder: WorkOrder,
  recommendationIds: string[],
): WorkflowRuntimeSnapshot {
  return {
    workflowId: workflow.workflowId,
    workOrderId: workOrder.workOrderId,
    vehicleId: workflow.vehicleId,
    workflowType: workflow.workflowType,
    orderType: workOrder.orderType,
    priority: workflow.priority,
    recommendationIds,
    createdAt: workflow.createdAt,
    refs: workflow.refs,
  };
}
