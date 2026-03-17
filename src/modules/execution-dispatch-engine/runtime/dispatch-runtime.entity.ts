import {
  DispatchRuntimeStatus,
  DispatchRuntimeResultType,
} from './dispatch-runtime.enums';
import { DispatchRuntimeContext } from './dispatch-runtime-context.types';
import { DispatchRuntimeResult } from './dispatch-runtime-result.types';
import { DispatchRuntimeAggregate } from './dispatch-runtime.types';

/**
 * Input contract for creating a new DispatchRuntimeResult
 *
 * All timestamps and IDs must be explicitly provided from upstream/runtime boundaries.
 * Status and result type are determined by the factory, not from input.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - No Math.random() calls
 * - All IDs explicitly provided
 * - All timestamps explicitly provided
 */
export interface CreateDispatchRuntimeResultInput {
  /**
   * Runtime result ID (explicitly provided, not generated)
   */
  runtimeResultId: string;

  /**
   * The dispatch intent ID
   */
  dispatchId: string;

  /**
   * The dispatch package ID
   */
  packageId: string;

  /**
   * Summary of the runtime execution
   */
  summary: string;

  /**
   * Timestamp of creation (explicitly provided from runtime)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided from runtime)
   */
  updatedAt: number;
}

/**
 * Input contract for creating a new DispatchRuntimeAggregate
 *
 * All timestamps and IDs must be explicitly provided from upstream/runtime boundaries.
 * The runtime aggregate is derived deterministically from a DispatchEngineAggregate.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - No Math.random() calls
 * - All IDs explicitly provided
 * - All timestamps explicitly provided
 */
export interface CreateDispatchRuntimeAggregateInput {
  /**
   * Runtime aggregate ID (explicitly provided, not generated)
   */
  runtimeAggregateId: string;

  /**
   * The dispatch runtime context containing all execution prerequisites
   */
  context: DispatchRuntimeContext;

  /**
   * The dispatch runtime result from execution
   */
  result: DispatchRuntimeResult;

  /**
   * Timestamp of creation (explicitly provided from runtime)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided from runtime)
   */
  updatedAt: number;
}

/**
 * Factory function to create a DispatchRuntimeResult
 *
 * Produces a deterministic runtime result entity with:
 * - runtimeStatus set to CREATED
 * - resultType set to PENDING
 * - All IDs and timestamps explicit from input
 * - No input mutation
 * - No side effects
 * - Pure deterministic object creation only
 *
 * @param input - CreateDispatchRuntimeResultInput
 * @returns DispatchRuntimeResult - Immutable runtime result object
 */
export function createDispatchRuntimeResult(
  input: CreateDispatchRuntimeResultInput
): DispatchRuntimeResult {
  return Object.freeze({
    runtimeResultId: input.runtimeResultId,
    dispatchId: input.dispatchId,
    packageId: input.packageId,
    runtimeStatus: DispatchRuntimeStatus.CREATED,
    resultType: DispatchRuntimeResultType.PENDING,
    summary: input.summary,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create a DispatchRuntimeAggregate
 *
 * Produces a deterministic runtime aggregate entity that combines context and result.
 *
 * Constraints:
 * - No Date.now() - timestamps explicitly provided
 * - No Math.random() - no randomness
 * - No input mutation - creates new object
 * - All IDs explicit
 * - All timestamps explicit
 * - Pure deterministic assembly only
 *
 * @param input - CreateDispatchRuntimeAggregateInput
 * @returns DispatchRuntimeAggregate - Immutable runtime aggregate object
 */
export function createDispatchRuntimeAggregate(
  input: CreateDispatchRuntimeAggregateInput
): DispatchRuntimeAggregate {
  return Object.freeze({
    runtimeAggregateId: input.runtimeAggregateId,
    context: input.context,
    result: input.result,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}
