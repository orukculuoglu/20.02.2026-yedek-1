import { DispatchEngineAggregate } from '../engine';
import { DispatchRuntimeContext } from './dispatch-runtime-context.types';
import { DispatchRuntimeResult } from './dispatch-runtime-result.types';
import { DispatchRuntimeAggregate } from './dispatch-runtime.types';
import {
  createDispatchRuntimeResult,
  createDispatchRuntimeAggregate,
} from './dispatch-runtime.entity';

/**
 * Input contract for executeDispatchRuntime
 *
 * Provides all explicit inputs required to execute a dispatch runtime transformation.
 * No hidden calculations, no side effects, no hidden temporal access.
 */
export interface ExecuteDispatchRuntimeInput {
  /**
   * Unique identifier for the runtime aggregate being created
   * Explicitly provided from dispatch orchestration layer
   */
  runtimeAggregateId: string;

  /**
   * Unique identifier for the runtime result being created
   * Explicitly provided from dispatch orchestration layer
   */
  runtimeResultId: string;

  /**
   * The dispatch engine aggregate containing all orchestration context
   * Provides source for dispatchIntent, targetActor, deliveryChannel, dispatchPackage
   */
  engineAggregate: DispatchEngineAggregate;

  /**
   * Summary information about the runtime execution
   */
  summary: string;

  /**
   * Timestamp of creation (explicitly provided from runtime boundaries)
   * Must be milliseconds since epoch, no Date.now() calls
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided from runtime boundaries)
   * Must be milliseconds since epoch, no hidden calculations
   */
  updatedAt: number;
}

/**
 * Execute dispatch runtime transformation
 *
 * Takes a DispatchEngineAggregate and produces an execution-ready DispatchRuntimeAggregate.
 *
 * Process:
 * 1. Derive dispatchIntent from engineAggregate.context.dispatchIntent
 * 2. Derive targetActor from engineAggregate.context.targetActor
 * 3. Derive deliveryChannel from engineAggregate.context.deliveryChannel
 * 4. Derive dispatchPackage from engineAggregate.context.dispatchPackage
 * 5. Build DispatchRuntimeContext combining all derived elements
 * 6. Build DispatchRuntimeResult with deterministic initial status
 * 7. Build DispatchRuntimeAggregate combining context and result
 * 8. Return fresh immutable aggregate
 *
 * Constraints:
 * - No Date.now() - all timestamps explicit from input
 * - No Math.random() - no randomness
 * - No hidden calculations - all derivations visible
 * - No input mutation - creates new objects only
 * - No side effects - pure function
 * - No adapter calls - runtime assembly only
 * - No persistence - in-memory assembly
 * - Deterministic only - same input always produces same output
 *
 * @param input - ExecuteDispatchRuntimeInput
 * @returns DispatchRuntimeAggregate - Immutable execution-ready artifact
 */
export function executeDispatchRuntime(
  input: ExecuteDispatchRuntimeInput
): DispatchRuntimeAggregate {
  // Derive components from engine aggregate context
  const dispatchIntent = input.engineAggregate.context.dispatchIntent;
  const targetActor = input.engineAggregate.context.targetActor;
  const deliveryChannel = input.engineAggregate.context.deliveryChannel;
  const dispatchPackage = input.engineAggregate.context.dispatchPackage;

  // Build runtime context with all derived elements
  const runtimeContext: DispatchRuntimeContext = Object.freeze({
    engineAggregate: input.engineAggregate,
    dispatchIntent,
    targetActor,
    deliveryChannel,
    dispatchPackage,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });

  // Create runtime result with deterministic initial state
  const runtimeResult: DispatchRuntimeResult = createDispatchRuntimeResult({
    runtimeResultId: input.runtimeResultId,
    dispatchId: dispatchPackage.dispatchId,
    packageId: dispatchPackage.packageId,
    summary: input.summary,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });

  // Create runtime aggregate combining context and result
  const runtimeAggregate: DispatchRuntimeAggregate = createDispatchRuntimeAggregate(
    {
      runtimeAggregateId: input.runtimeAggregateId,
      context: runtimeContext,
      result: runtimeResult,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    }
  );

  return runtimeAggregate;
}
