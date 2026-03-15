import { WorkflowRuntimeResult } from '../runtime/workflow-runtime.types';
import { WorkflowLogEventType, WorkflowLogResult } from './workflow-log.types';
import { buildWorkflowLogSnapshot } from './workflow-log.snapshot';
import { buildWorkflowLogEntry } from './workflow-log.entry';

/**
 * Service for building deterministic workflow log entries.
 *
 * Responsibilities:
 * - Accept runtime results with explicit log parameters
 * - Build snapshots from runtime data
 * - Build log entries with event metadata
 * - Return comprehensive, typed results
 *
 * Does NOT persist logs.
 * Does NOT send logs externally.
 * Does NOT mutate runtime results.
 *
 * All operations are deterministic and pure.
 */
export class WorkflowLogService {
  /**
   * Create a log entry for runtime completion event.
   *
   * Captures the state when workflow runtime execution completes successfully.
   * Uses RUNTIME_COMPLETED event type.
   *
   * @param runtimeResult - Workflow runtime execution result
   * @param logId - Unique log entry identifier
   * @param timestamp - Log entry timestamp
   * @param message - Event description
   * @param metadata - Optional additional context
   * @returns WorkflowLogResult with snapshot and log entry
   */
  static createRuntimeCompletedLog(
    runtimeResult: WorkflowRuntimeResult,
    logId: string,
    timestamp: number,
    message: string,
    metadata?: Record<string, unknown>,
  ): WorkflowLogResult {
    const snapshot = buildWorkflowLogSnapshot(runtimeResult);
    const logEntry = buildWorkflowLogEntry(
      logId,
      timestamp,
      WorkflowLogEventType.RUNTIME_COMPLETED,
      snapshot,
      message,
      metadata,
    );

    return { snapshot, logEntry };
  }

  /**
   * Create a log entry for snapshot generated event.
   *
   * Captures the state when a runtime snapshot is generated.
   * Uses SNAPSHOT_GENERATED event type.
   *
   * @param runtimeResult - Workflow runtime execution result
   * @param logId - Unique log entry identifier
   * @param timestamp - Log entry timestamp
   * @param message - Event description
   * @param metadata - Optional additional context
   * @returns WorkflowLogResult with snapshot and log entry
   */
  static createSnapshotGeneratedLog(
    runtimeResult: WorkflowRuntimeResult,
    logId: string,
    timestamp: number,
    message: string,
    metadata?: Record<string, unknown>,
  ): WorkflowLogResult {
    const snapshot = buildWorkflowLogSnapshot(runtimeResult);
    const logEntry = buildWorkflowLogEntry(
      logId,
      timestamp,
      WorkflowLogEventType.SNAPSHOT_GENERATED,
      snapshot,
      message,
      metadata,
    );

    return { snapshot, logEntry };
  }

  /**
   * Create a log entry for workflow created event.
   *
   * Captures the state when a workflow entity is created.
   * Uses WORKFLOW_CREATED event type.
   *
   * @param runtimeResult - Workflow runtime execution result
   * @param logId - Unique log entry identifier
   * @param timestamp - Log entry timestamp
   * @param message - Event description
   * @param metadata - Optional additional context
   * @returns WorkflowLogResult with snapshot and log entry
   */
  static createWorkflowCreatedLog(
    runtimeResult: WorkflowRuntimeResult,
    logId: string,
    timestamp: number,
    message: string,
    metadata?: Record<string, unknown>,
  ): WorkflowLogResult {
    const snapshot = buildWorkflowLogSnapshot(runtimeResult);
    const logEntry = buildWorkflowLogEntry(
      logId,
      timestamp,
      WorkflowLogEventType.WORKFLOW_CREATED,
      snapshot,
      message,
      metadata,
    );

    return { snapshot, logEntry };
  }

  /**
   * Create a log entry for work order created event.
   *
   * Captures the state when a work order entity is created.
   * Uses WORK_ORDER_CREATED event type.
   *
   * @param runtimeResult - Workflow runtime execution result
   * @param logId - Unique log entry identifier
   * @param timestamp - Log entry timestamp
   * @param message - Event description
   * @param metadata - Optional additional context
   * @returns WorkflowLogResult with snapshot and log entry
   */
  static createWorkOrderCreatedLog(
    runtimeResult: WorkflowRuntimeResult,
    logId: string,
    timestamp: number,
    message: string,
    metadata?: Record<string, unknown>,
  ): WorkflowLogResult {
    const snapshot = buildWorkflowLogSnapshot(runtimeResult);
    const logEntry = buildWorkflowLogEntry(
      logId,
      timestamp,
      WorkflowLogEventType.WORK_ORDER_CREATED,
      snapshot,
      message,
      metadata,
    );

    return { snapshot, logEntry };
  }

  /**
   * Create a log entry for integration prepared event.
   *
   * Captures the state when signal-to-workflow integration is prepared.
   * Uses INTEGRATION_PREPARED event type.
   *
   * @param runtimeResult - Workflow runtime execution result
   * @param logId - Unique log entry identifier
   * @param timestamp - Log entry timestamp
   * @param message - Event description
   * @param metadata - Optional additional context
   * @returns WorkflowLogResult with snapshot and log entry
   */
  static createIntegrationPreparedLog(
    runtimeResult: WorkflowRuntimeResult,
    logId: string,
    timestamp: number,
    message: string,
    metadata?: Record<string, unknown>,
  ): WorkflowLogResult {
    const snapshot = buildWorkflowLogSnapshot(runtimeResult);
    const logEntry = buildWorkflowLogEntry(
      logId,
      timestamp,
      WorkflowLogEventType.INTEGRATION_PREPARED,
      snapshot,
      message,
      metadata,
    );

    return { snapshot, logEntry };
  }
}
