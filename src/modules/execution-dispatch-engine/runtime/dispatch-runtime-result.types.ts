import { DispatchRuntimeStatus, DispatchRuntimeResultType } from './dispatch-runtime.enums';

/**
 * Dispatch Runtime Result Type
 *
 * Represents the execution result artifact produced by a dispatch runtime execution.
 *
 * This captures:
 * - Unique identifiers for all participating entities (runtime, dispatch, package)
 * - Current runtime status in the execution lifecycle
 * - Classification of the execution outcome
 * - Summary information about the execution
 * - Creation and update timestamps for full lifecycle tracking
 *
 * The result is created during runtime execution and forms part of the
 * DispatchRuntimeAggregate that will be persisted and tracked.
 */
export interface DispatchRuntimeResult {
  /**
   * Unique identifier for this runtime result
   * Explicitly provided from runtime boundaries
   */
  runtimeResultId: string;

  /**
   * The dispatch intent ID being executed
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * The dispatch package ID being delivered
   * Reused from package layer
   */
  packageId: string;

  /**
   * Current runtime status in the execution lifecycle
   * Must be one of the DispatchRuntimeStatus enum values
   */
  runtimeStatus: DispatchRuntimeStatus;

  /**
   * Classification of the execution outcome
   * Must be one of the DispatchRuntimeResultType enum values
   */
  resultType: DispatchRuntimeResultType;

  /**
   * Human-readable summary of the runtime execution result
   * Provides context for the status and result type
   */
  summary: string;

  /**
   * Timestamp when this runtime result was created (milliseconds since epoch)
   * Explicitly provided from runtime boundaries, no Date.now() calls
   */
  createdAt: number;

  /**
   * Timestamp when this runtime result was last updated (milliseconds since epoch)
   * Explicitly provided from runtime boundaries, no Date.now() calls
   */
  updatedAt: number;
}
