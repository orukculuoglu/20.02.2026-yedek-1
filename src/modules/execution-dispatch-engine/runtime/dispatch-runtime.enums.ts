/**
 * Dispatch Runtime Status Enum
 *
 * Defines the lifecycle status of a dispatch runtime execution artifact.
 *
 * Status progression:
 * - CREATED: Initial state when runtime aggregate is created
 * - READY: Runtime aggregate has passed validation and is ready for execution
 * - EXECUTING: Runtime execution is currently in progress
 * - SENT: Dispatch has been successfully sent via delivery channel
 * - FAILED: Runtime execution encountered a failure
 * - CANCELLED: Runtime execution was cancelled before completion
 */
export enum DispatchRuntimeStatus {
  CREATED = 'CREATED',
  READY = 'READY',
  EXECUTING = 'EXECUTING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Dispatch Runtime Result Type Enum
 *
 * Defines the outcome classification of a dispatch runtime execution.
 *
 * Outcome types:
 * - SUCCESS: Execution completed successfully
 * - FAILURE: Execution failed and will not be retried
 * - RETRYABLE_FAILURE: Execution failed but may be retried according to strategy
 * - PENDING: Execution is pending and has not yet completed
 */
export enum DispatchRuntimeResultType {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  RETRYABLE_FAILURE = 'RETRYABLE_FAILURE',
  PENDING = 'PENDING',
}
