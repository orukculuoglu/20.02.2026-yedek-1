/**
 * Signal → Workflow integration module
 * Bridges Signal Engine outputs to Workflow Runtime pipeline
 */

export { SignalWorkflowIntegrationService } from './signal-workflow-integration.service';
export { mapSignalToWorkflowRuntime } from './signal-workflow-mapper';
export type {
  SignalWorkflowIntegrationInput,
  SignalWorkflowIntegrationResult,
} from './signal-workflow-integration.types';
