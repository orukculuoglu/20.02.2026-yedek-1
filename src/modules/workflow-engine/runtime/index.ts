/**
 * Workflow Runtime module
 * Orchestration layer that connects workflow and work order creation
 */

export { WorkflowRuntimeService } from './workflow-runtime.service';
export { buildWorkflowRuntimeSnapshot } from './workflow-runtime.snapshot';
export type {
  WorkflowRuntimeInput,
  WorkflowRuntimeResult,
  WorkflowRuntimeSnapshot,
} from './workflow-runtime.types';
