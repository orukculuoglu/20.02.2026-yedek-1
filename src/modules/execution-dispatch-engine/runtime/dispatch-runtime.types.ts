import { DispatchRuntimeContext } from './dispatch-runtime-context.types';
import { DispatchRuntimeResult } from './dispatch-runtime-result.types';

/**
 * Dispatch Runtime Aggregate Type
 *
 * Represents the deterministic runtime execution artifact derived from a DispatchEngineAggregate.
 *
 * This aggregate encapsulates:
 * - A complete runtime context (engine aggregate + all domain components)
 * - A runtime result capturing the execution outcome
 * - Creation and update timestamps for complete lifecycle tracking
 *
 * Purpose:
 * The runtime aggregate is the output of the dispatch runtime layer and serves as the
 * primary input for subsequent execution phases (adapter execution, acknowledgement tracking,
 * audit logging, etc.). It represents an execution-ready artifact that contains all
 * deterministically-computed information required before advanced delivery lifecycle
 * handling is introduced.
 *
 * Lifecycle:
 * CREATED → (validation) → READY → (adapter execution) → SENT → (acknowledgement) → Final State
 *
 * This phase establishes foundation only. Advanced delivery orchestration happens
 * in subsequent phases.
 */
export interface DispatchRuntimeAggregate {
  /**
   * Unique identifier for this runtime aggregate
   * Explicitly provided from runtime boundaries
   */
  runtimeAggregateId: string;

  /**
   * The complete runtime context required for execution
   * Contains engine aggregate, dispatch intent, actor, channel, and package
   */
  context: DispatchRuntimeContext;

  /**
   * The runtime execution result
   * Contains status, outcome classification, and result summary
   */
  result: DispatchRuntimeResult;

  /**
   * Timestamp when this runtime aggregate was created (milliseconds since epoch)
   * Explicitly provided from runtime boundaries, no Date.now() calls
   */
  createdAt: number;

  /**
   * Timestamp when this runtime aggregate was last updated (milliseconds since epoch)
   * Explicitly provided from runtime boundaries, no Date.now() calls
   */
  updatedAt: number;
}
