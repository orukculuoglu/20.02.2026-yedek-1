import { WorkflowStatus, WorkflowPriority, WorkflowType } from './workflow.enums';
import { WorkflowRefs } from './workflow-refs.types';

/**
 * Workflow entity representing an operational process.
 * Triggered by vehicle intelligence signals and converted into actionable work orders.
 *
 * A workflow is the bridge between intelligence (Signal Engine) and operations
 * (Work Order Engine).
 */
export interface Workflow {
  workflowId: string;
  vehicleId: string;
  workflowType: WorkflowType;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  title: string;
  summary: string;
  createdAt: number;
  updatedAt: number;
  refs: WorkflowRefs;
}
