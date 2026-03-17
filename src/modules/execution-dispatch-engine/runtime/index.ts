/**
 * Dispatch Runtime Module
 *
 * Layer 8: Runtime Core - Deterministic Execution Layer
 *
 * This module provides the runtime core foundation for the Execution/Dispatch Engine.
 * It transforms DispatchEngineAggregates into execution-ready DispatchRuntimeAggregates.
 *
 * Exports:
 * - Deterministic runtime status and result type enums
 * - Runtime context contract (combining all orchestration prerequisites)
 * - Runtime result contract (execution outcome artifacts)
 * - Runtime aggregate contract (complete execution artifact)
 * - Factory functions for creating runtime results and aggregates
 * - Runtime execution function (deterministic transformation)
 *
 * Constraints:
 * - No Date.now() - all timestamps explicit from runtime boundaries
 * - No Math.random() - fully deterministic
 * - No hidden temporal access - explicit time parameters only
 * - No input mutation - immutable object construction
 * - All IDs explicit - no generation
 * - Pure deterministic assembly - no side effects
 *
 * Lifecycle:
 * This phase establishes the runtime core foundation only.
 * It does NOT implement:
 * - Advanced retry strategy
 * - Full acknowledgement orchestration
 * - Snapshot/log finalization
 * - Public API handlers
 * - Persistence
 * - Mock infrastructure
 *
 * Next phases will build on this foundation to add adapter execution,
 * acknowledgement tracking, audit logging, and advanced delivery orchestration.
 */

export {
  DispatchRuntimeStatus,
  DispatchRuntimeResultType,
} from './dispatch-runtime.enums';

export type { DispatchRuntimeContext } from './dispatch-runtime-context.types';

export type { DispatchRuntimeResult } from './dispatch-runtime-result.types';

export type { DispatchRuntimeAggregate } from './dispatch-runtime.types';

export {
  createDispatchRuntimeResult,
  createDispatchRuntimeAggregate,
  type CreateDispatchRuntimeResultInput,
  type CreateDispatchRuntimeAggregateInput,
} from './dispatch-runtime.entity';

export {
  executeDispatchRuntime,
  type ExecuteDispatchRuntimeInput,
} from './dispatch-runtime.execute';
