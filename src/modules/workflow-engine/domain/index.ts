/**
 * Workflow Engine domain module
 * Foundational domain model for signal-to-workflow-to-work-order conversion
 */

export {
  WorkflowStatus,
  WorkOrderStatus,
  WorkflowPriority,
  WorkflowType,
  WorkOrderType,
} from './workflow.enums';
export type { Workflow } from './workflow.types';
export {
  WorkflowEntity,
  type CreateWorkflowInput,
  type UpdateWorkflowStatusInput,
} from './workflow.entity';
export type { WorkOrder } from './work-order.types';
export {
  WorkOrderEntity,
  type CreateWorkOrderInput,
  type UpdateWorkOrderStatusInput,
} from './work-order.entity';
export type { WorkflowRefs } from './workflow-refs.types';
export {
  ActionRecommendationType,
  ActionActorType,
  ActionExecutionMode,
  ActionRationaleType,
} from './action-recommendation.enums';
export type { ActionRecommendation, ActionRecommendationRefs } from './action-recommendation.types';
export {
  ActionRecommendationEntity,
  type CreateActionRecommendationInput,
  type UpdateActionRecommendationInput,
} from './action-recommendation.entity';
