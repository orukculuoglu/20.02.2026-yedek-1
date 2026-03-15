import { DispatchEngineResultStatus, DispatchEngineResult } from './dispatch-engine-result.types';
import { DispatchEngineContext } from './dispatch-engine-context.types';
import { DispatchEngineAggregate } from './dispatch-engine.types';

/**
 * Input contract for creating a new DispatchEngineResult
 *
 * All timestamps and IDs must be explicitly provided from upstream/runtime boundaries.
 * Status is determined by the factory, not from input.
 */
export interface CreateDispatchEngineResultInput {
  /**
   * Result ID (explicitly provided, not generated)
   */
  engineResultId: string;

  /**
   * The dispatch intent ID
   */
  dispatchId: string;

  /**
   * The target actor ID
   */
  actorId: string;

  /**
   * The delivery channel ID
   */
  channelId: string;

  /**
   * The dispatch package ID
   */
  packageId: string;

  /**
   * Summary of the assembly
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
 * Input contract for creating a new DispatchEngineAggregate
 */
export interface CreateDispatchEngineAggregateInput {
  /**
   * Aggregate ID (explicitly provided, not generated)
   */
  aggregateId: string;

  /**
   * The orchestration context
   */
  context: DispatchEngineContext;

  /**
   * The orchestration result
   */
  result: DispatchEngineResult;

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
 * Dispatch Engine Result Entity Factory
 *
 * Provides deterministic factory methods for creating DispatchEngineResult instances.
 * All operations are purely functional with immutable returns and zero input mutations.
 */
export class DispatchEngineResultEntity {
  /**
   * Create a new DispatchEngineResult
   *
   * The result is created with deterministic status ASSEMBLED.
   * Status can be modified if rejection scenarios are modeled in later phases.
   *
   * @param input Creation input contract with explicit timestamps and IDs
   * @returns Fresh DispatchEngineResult instance
   */
  static createDispatchEngineResult(
    input: CreateDispatchEngineResultInput,
  ): DispatchEngineResult {
    return {
      engineResultId: input.engineResultId,
      dispatchId: input.dispatchId,
      actorId: input.actorId,
      channelId: input.channelId,
      packageId: input.packageId,
      status: DispatchEngineResultStatus.ASSEMBLED, // Always determined, never from input
      summary: input.summary,
      createdAt: input.createdAt, // Explicit, never Date.now()
      updatedAt: input.updatedAt, // Explicit, never Date.now()
    };
  }
}

/**
 * Dispatch Engine Aggregate Entity Factory
 *
 * Provides deterministic factory methods for creating DispatchEngineAggregate instances.
 * All operations are purely functional with immutable returns and zero input mutations.
 */
export class DispatchEngineAggregateEntity {
  /**
   * Create a new DispatchEngineAggregate
   *
   * An aggregate combines context and result into a transactional orchestration unit.
   * All timestamps and IDs are explicitly provided from runtime boundaries.
   *
   * @param input Creation input contract with explicit timestamps and IDs
   * @returns Fresh DispatchEngineAggregate instance
   */
  static createDispatchEngineAggregate(
    input: CreateDispatchEngineAggregateInput,
  ): DispatchEngineAggregate {
    return {
      aggregateId: input.aggregateId,
      context: input.context,
      result: input.result,
      createdAt: input.createdAt, // Explicit, never Date.now()
      updatedAt: input.updatedAt, // Explicit, never Date.now()
    };
  }
}
