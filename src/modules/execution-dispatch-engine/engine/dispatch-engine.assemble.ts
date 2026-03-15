import { DispatchEngineContext } from './dispatch-engine-context.types';
import { DispatchEngineAggregate } from './dispatch-engine.types';
import { DispatchEngineResultEntity, DispatchEngineAggregateEntity } from './dispatch-engine.entity';

/**
 * Input contract for the assembly function
 *
 * Provides all necessary information to deterministically assemble a dispatch engine aggregate.
 */
export interface AssembleDispatchEngineAggregateInput {
  /**
   * Aggregate ID (explicitly provided, not generated)
   */
  aggregateId: string;

  /**
   * Engine result ID (explicitly provided, not generated)
   */
  engineResultId: string;

  /**
   * The complete orchestration context
   */
  context: DispatchEngineContext;

  /**
   * Summary of the assembly
   */
  summary: string;

  /**
   * Timestamp of assembly (explicitly provided from runtime)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided from runtime)
   */
  updatedAt: number;
}

/**
 * Assemble a dispatch engine aggregate from component parts
 *
 * Deterministically combines the orchestration context (dispatch intent + actor + channel + package)
 * into a complete engine aggregate ready for runtime execution.
 *
 * This function derives the dispatch, actor, channel, and package IDs from the context
 * and produces a fresh aggregate with all relationships preserved.
 *
 * @param input Assembly input with all explicit IDs and timestamps
 * @returns Fresh DispatchEngineAggregate instance with deterministic result
 */
export function assembleDispatchEngineAggregate(
  input: AssembleDispatchEngineAggregateInput,
): DispatchEngineAggregate {
  // Derive IDs from context components (no hidden logic, explicit extraction)
  const dispatchId = input.context.dispatchIntent.dispatchId;
  const actorId = input.context.targetActor.actorId;
  const channelId = input.context.deliveryChannel.channelId;
  const packageId = input.context.dispatchPackage.packageId;

  // Create the engine result with deterministic status (ASSEMBLED)
  const engineResult = DispatchEngineResultEntity.createDispatchEngineResult({
    engineResultId: input.engineResultId,
    dispatchId,
    actorId,
    channelId,
    packageId,
    summary: input.summary,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });

  // Create the complete aggregate combining context and result
  const aggregate = DispatchEngineAggregateEntity.createDispatchEngineAggregate({
    aggregateId: input.aggregateId,
    context: input.context,
    result: engineResult,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });

  return aggregate;
}
