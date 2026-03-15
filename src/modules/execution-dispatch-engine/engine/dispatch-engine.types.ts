import { DispatchEngineContext } from './dispatch-engine-context.types';
import { DispatchEngineResult } from './dispatch-engine-result.types';

/**
 * Dispatch Engine Aggregate
 *
 * Represents the deterministic orchestration aggregate produced by the dispatch engine.
 * This is the complete state machine before runtime dispatch execution begins.
 *
 * An aggregate combines the context (input) and result (outcome) of dispatch orchestration
 * into a single transactional unit.
 */
export interface DispatchEngineAggregate {
  /**
   * Unique identifier for this aggregate
   */
  aggregateId: string;

  /**
   * The orchestration context (dispatch intent + actor + channel + package)
   */
  context: DispatchEngineContext;

  /**
   * The orchestration result (IDs, status, summary)
   */
  result: DispatchEngineResult;

  /**
   * Timestamp when the aggregate was created (milliseconds since epoch)
   */
  createdAt: number;

  /**
   * Timestamp when the aggregate was last modified (milliseconds since epoch)
   */
  updatedAt: number;
}
