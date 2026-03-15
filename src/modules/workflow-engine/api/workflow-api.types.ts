import { WorkflowRuntimeInput, WorkflowRuntimeResult } from '../runtime/workflow-runtime.types';
import { SignalWorkflowIntegrationInput, SignalWorkflowIntegrationResult } from '../integration/signal-workflow-integration.types';
import { WorkflowLogEventType, WorkflowLogResult } from '../logging/workflow-log.types';

/**
 * Public API input for creating workflow from runtime.
 * Wraps WorkflowRuntimeInput for module API boundary.
 */
export interface CreateWorkflowFromRuntimeInput {
  runtimeInput: WorkflowRuntimeInput;
}

/**
 * Public API result for creating workflow from runtime.
 * Wraps WorkflowRuntimeResult for module API boundary.
 */
export interface CreateWorkflowFromRuntimeResult {
  runtimeResult: WorkflowRuntimeResult;
}

/**
 * Public API input for preparing signal workflow.
 * Wraps SignalWorkflowIntegrationInput for module API boundary.
 */
export interface PrepareSignalWorkflowInput {
  integrationInput: SignalWorkflowIntegrationInput;
}

/**
 * Public API result for preparing signal workflow.
 * Wraps SignalWorkflowIntegrationResult for module API boundary.
 */
export interface PrepareSignalWorkflowResult {
  integrationResult: SignalWorkflowIntegrationResult;
}

/**
 * Public API input for creating workflow log.
 * Collects runtime result and log metadata for unified log creation.
 */
export interface CreateWorkflowLogInput {
  runtimeResult: WorkflowRuntimeResult;
  logId: string;
  timestamp: number;
  eventType: WorkflowLogEventType;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Public API result for creating workflow log.
 * Wraps WorkflowLogResult for module API boundary.
 */
export interface CreateWorkflowLogResult {
  logResult: WorkflowLogResult;
}
