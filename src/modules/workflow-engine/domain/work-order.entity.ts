import { WorkOrder } from './work-order.types';
import { WorkOrderStatus, WorkflowPriority, WorkOrderType } from './workflow.enums';
import { WorkflowRefs } from './workflow-refs.types';

/**
 * Input contract for creating a WorkOrder entity.
 * All timestamps must be explicitly provided for deterministic creation.
 */
export interface CreateWorkOrderInput {
  workOrderId: string;
  workflowId: string;
  vehicleId: string;
  orderType: WorkOrderType;
  priority: WorkflowPriority;
  title: string;
  summary: string;
  reason: string;
  createdAt: number;
  updatedAt: number;
  recommendedActions?: string[];
  refs: WorkflowRefs;
}

/**
 * Input contract for updating a WorkOrder status.
 * The new timestamp must be explicitly provided for deterministic updates.
 */
export interface UpdateWorkOrderStatusInput {
  workOrder: WorkOrder;
  newStatus: WorkOrderStatus;
  updatedAt: number;
}

/**
 * Factory for deterministic WorkOrder entity construction.
 * Ensures work orders are created with consistent, valid state.
 * All timestamps and values are deterministic from input.
 */
export class WorkOrderEntity {
  /**
   * Create a new WorkOrder entity.
   *
   * @param input - Work order creation input with explicit timestamps
   * @returns New WorkOrder entity with OPEN status
   */
  static createWorkOrder(input: CreateWorkOrderInput): WorkOrder {
    return {
      workOrderId: input.workOrderId,
      workflowId: input.workflowId,
      vehicleId: input.vehicleId,
      orderType: input.orderType,
      status: WorkOrderStatus.OPEN,
      priority: input.priority,
      title: input.title,
      summary: input.summary,
      reason: input.reason,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      ...(input.recommendedActions && {
        recommendedActions: input.recommendedActions,
      }),
      refs: input.refs,
    };
  }

  /**
   * Update a WorkOrder's status.
   *
   * @param input - Status update input with explicit timestamp
   * @returns Updated WorkOrder entity
   */
  static updateWorkOrderStatus(
    input: UpdateWorkOrderStatusInput,
  ): WorkOrder {
    return {
      ...input.workOrder,
      status: input.newStatus,
      updatedAt: input.updatedAt,
    };
  }
}
