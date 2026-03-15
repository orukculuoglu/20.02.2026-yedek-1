import { Workflow } from './workflow.types';
import { WorkflowStatus, WorkflowPriority, WorkflowType } from './workflow.enums';
import { WorkflowRefs } from './workflow-refs.types';

/**
 * Input contract for creating a Workflow entity.
 * All timestamps must be explicitly provided for deterministic creation.
 */
export interface CreateWorkflowInput {
  workflowId: string;
  vehicleId: string;
  workflowType: WorkflowType;
  priority: WorkflowPriority;
  title: string;
  summary: string;
  createdAt: number;
  updatedAt: number;
  refs: WorkflowRefs;
}

/**
 * Input contract for updating a Workflow status.
 * The new timestamp must be explicitly provided for deterministic updates.
 */
export interface UpdateWorkflowStatusInput {
  workflow: Workflow;
  newStatus: WorkflowStatus;
  updatedAt: number;
}

/**
 * Factory for deterministic Workflow entity construction.
 * Ensures workflows are created with consistent, valid state.
 * All timestamps and values are deterministic from input.
 */
export class WorkflowEntity {
  /**
   * Create a new Workflow entity.
   *
   * @param input - Workflow creation input with explicit timestamps
   * @returns New Workflow entity with CREATED status
   */
  static createWorkflow(input: CreateWorkflowInput): Workflow {
    return {
      workflowId: input.workflowId,
      vehicleId: input.vehicleId,
      workflowType: input.workflowType,
      status: WorkflowStatus.CREATED,
      priority: input.priority,
      title: input.title,
      summary: input.summary,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      refs: input.refs,
    };
  }

  /**
   * Update a Workflow's status.
   *
   * @param input - Status update input with explicit timestamp
   * @returns Updated Workflow entity
   */
  static updateWorkflowStatus(input: UpdateWorkflowStatusInput): Workflow {
    return {
      ...input.workflow,
      status: input.newStatus,
      updatedAt: input.updatedAt,
    };
  }
}
