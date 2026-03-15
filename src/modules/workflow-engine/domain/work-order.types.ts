import { WorkOrderStatus, WorkflowPriority, WorkOrderType } from './workflow.enums';
import { WorkflowRefs } from './workflow-refs.types';

/**
 * Work Order entity representing an operational task.
 * Created from Workflow entities to drive concrete operational actions.
 *
 * A work order specifies:
 * - What needs to be done (orderType, title, reason)
 * - When it should be done (priority)
 * - By whom (assignment, recommended actions)
 * - Why it's needed (refs to upstream intelligence)
 */
export interface WorkOrder {
  workOrderId: string;
  workflowId: string;
  vehicleId: string;
  orderType: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkflowPriority;
  title: string;
  summary: string;
  reason: string;
  createdAt: number;
  updatedAt: number;
  recommendedActions?: string[];
  refs: WorkflowRefs;
}
