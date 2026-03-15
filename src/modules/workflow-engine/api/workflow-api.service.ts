import {
  CreateWorkflowFromRuntimeInput,
  CreateWorkflowFromRuntimeResult,
  PrepareSignalWorkflowInput,
  PrepareSignalWorkflowResult,
  CreateWorkflowLogInput,
  CreateWorkflowLogResult,
} from './workflow-api.types';
import { SignalWorkflowIntegrationService } from '../integration/signal-workflow-integration.service';
import { WorkflowRuntimeService } from '../runtime/workflow-runtime.service';
import { WorkflowLogService } from '../logging/workflow-log.service';
import { WorkflowLogEventType } from '../logging/workflow-log.types';

/**
 * Public API facade for the Workflow Engine module.
 *
 * Provides clean, deterministic access to core workflow operations:
 * - Signal-to-workflow integration preparation
 * - Workflow runtime execution
 * - Workflow event logging
 *
 * This is a thin facade service that orchestrates underlying engines.
 * No business logic duplication.
 * All operations are deterministic and produce the same output for the same input.
 *
 * Does NOT persist, queue, or execute external operations.
 */
export class WorkflowApiService {
  /**
   * Prepare a signal for workflow execution.
   *
   * Maps Signal Engine output to Workflow Runtime input contract.
   * No runtime execution performed here.
   *
   * @param input - API input wrapping signal integration input
   * @returns API result wrapping integration result
   */
  static prepareSignalWorkflow(input: PrepareSignalWorkflowInput): PrepareSignalWorkflowResult {
    const integrationResult = SignalWorkflowIntegrationService.prepareSignalForRuntime(
      input.integrationInput,
    );

    return {
      integrationResult,
    };
  }

  /**
   * Create a workflow from prepared runtime input.
   *
   * Executes the complete workflow runtime pipeline:
   * 1. Create workflow via Workflow Engine service
   * 2. Create work order via Work Order Engine service
   * 3. Generate runtime snapshot
   * 4. Return complete result
   *
   * @param input - API input wrapping workflow runtime input
   * @returns API result wrapping workflow runtime result
   */
  static createWorkflowFromRuntime(input: CreateWorkflowFromRuntimeInput): CreateWorkflowFromRuntimeResult {
    const runtimeResult = WorkflowRuntimeService.executeRuntime(input.runtimeInput);

    return {
      runtimeResult,
    };
  }

  /**
   * Create a workflow event log entry.
   *
   * Builds snapshots and log entries for workflow execution events.
   * Routes to appropriate WorkflowLogService method based on eventType.
   *
   * Supported event types:
   * - WORKFLOW_CREATED: When workflow entity is created
   * - WORK_ORDER_CREATED: When work order entity is created
   * - RUNTIME_COMPLETED: When runtime execution completes
   * - INTEGRATION_PREPARED: When signal integration is prepared
   * - SNAPSHOT_GENERATED: When runtime snapshot is generated
   *
   * @param input - API input with runtime result and log metadata
   * @returns API result wrapping log creation result
   */
  static createWorkflowLog(input: CreateWorkflowLogInput): CreateWorkflowLogResult {
    let logResult;

    switch (input.eventType) {
      case WorkflowLogEventType.WORKFLOW_CREATED:
        logResult = WorkflowLogService.createWorkflowCreatedLog(
          input.runtimeResult,
          input.logId,
          input.timestamp,
          input.message,
          input.metadata,
        );
        break;

      case WorkflowLogEventType.WORK_ORDER_CREATED:
        logResult = WorkflowLogService.createWorkOrderCreatedLog(
          input.runtimeResult,
          input.logId,
          input.timestamp,
          input.message,
          input.metadata,
        );
        break;

      case WorkflowLogEventType.RUNTIME_COMPLETED:
        logResult = WorkflowLogService.createRuntimeCompletedLog(
          input.runtimeResult,
          input.logId,
          input.timestamp,
          input.message,
          input.metadata,
        );
        break;

      case WorkflowLogEventType.INTEGRATION_PREPARED:
        logResult = WorkflowLogService.createIntegrationPreparedLog(
          input.runtimeResult,
          input.logId,
          input.timestamp,
          input.message,
          input.metadata,
        );
        break;

      case WorkflowLogEventType.SNAPSHOT_GENERATED:
        logResult = WorkflowLogService.createSnapshotGeneratedLog(
          input.runtimeResult,
          input.logId,
          input.timestamp,
          input.message,
          input.metadata,
        );
        break;

      default:
        throw new Error(`Unsupported workflow log event type: ${input.eventType}`);
    }

    return {
      logResult,
    };
  }
}
