import { WorkOrder } from '../domain';
import { WorkOrderType, WorkflowPriority } from '../domain';
import { WorkflowRefs } from '../domain';

/**
 * Input contract for the Work Order Engine service.
 * Represents the operational intent to create a work order from a workflow.
 */
export interface WorkOrderEngineInput {
  workOrderId: string;
  workflowId: string;
  vehicleId: string;
  orderType: WorkOrderType;
  title?: string;
  summary: string;
  reason: string;
  priority: WorkflowPriority;
  createdAt: number;
  updatedAt: number;
  refs: WorkflowRefs;
  recommendationIds: string[];
}

/**
 * Output contract for the Work Order Engine service.
 * Represents the result of work order creation with normalized recommendations.
 */
export interface WorkOrderEngineResult {
  workOrder: WorkOrder;
  recommendationIds: string[];
}
