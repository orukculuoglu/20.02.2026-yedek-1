/**
 * Workflow Engine service layer
 * Deterministic workflow creation with priority resolution
 */

export { WorkflowEngineService } from './workflow-engine.service';
export { resolveWorkflowPriority } from './workflow-priority-resolver';
export { linkRecommendations } from './workflow-recommendation-linker';
export type {
  WorkflowEngineInput,
  WorkflowEngineResult,
} from './workflow-engine.types';
