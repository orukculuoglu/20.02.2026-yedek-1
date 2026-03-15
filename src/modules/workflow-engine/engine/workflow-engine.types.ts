import { Workflow } from '../domain';
import { WorkflowType, WorkflowPriority } from '../domain';
import { WorkflowRefs } from '../domain';

/**
 * Input contract for the Workflow Engine service.
 * Represents the operational intent to create a workflow.
 */
export interface WorkflowEngineInput {
  workflowId: string;
  vehicleId: string;
  workflowType: WorkflowType;
  title: string;
  summary: string;
  createdAt: number;
  updatedAt: number;
  refs: WorkflowRefs;
  recommendationIds: string[];
  requestedPriority?: WorkflowPriority;
}

/**
 * Output contract for the Workflow Engine service.
 * Represents the result of workflow creation with resolved priority and linked recommendations.
 */
export interface WorkflowEngineResult {
  workflow: Workflow;
  recommendationIds: string[];
  resolvedPriority: WorkflowPriority;
}
