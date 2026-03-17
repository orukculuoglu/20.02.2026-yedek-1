import { DispatchIntent } from '../domain';
import { DispatchTargetActor } from '../actors';
import { DispatchDeliveryChannel } from '../channels';
import { DispatchPackage } from '../packages';

/**
 * Dispatch Runtime Context Type
 *
 * Represents the complete runtime context required for deterministic dispatch execution.
 * This context is derived from a DispatchEngineAggregate and contains all information
 * needed to prepare a dispatch for outbound delivery.
 *
 * All components are reused from their respective domain layers to ensure consistency
 * and traceability throughout the execution pipeline.
 */
export interface DispatchRuntimeContext {
  /**
   * The dispatch engine aggregate being executed
   * Provides the foundational orchestration context
   */
  engineAggregate: any; // Will be typed as DispatchEngineAggregate from engine layer

  /**
   * The dispatch intent being executed
   * Reused from dispatch domain layer
   */
  dispatchIntent: DispatchIntent;

  /**
   * The target actor receiving this dispatch
   * Reused from actors layer
   */
  targetActor: DispatchTargetActor;

  /**
   * The delivery channel for transmission
   * Reused from channels layer
   */
  deliveryChannel: DispatchDeliveryChannel;

  /**
   * The dispatch package prepared for delivery
   * Reused from packages layer
   */
  dispatchPackage: DispatchPackage;

  /**
   * Timestamp when the runtime context was created (milliseconds since epoch)
   * Explicitly provided from runtime boundaries
   */
  createdAt: number;

  /**
   * Timestamp when the runtime context was last updated (milliseconds since epoch)
   * Explicitly provided from runtime boundaries
   */
  updatedAt: number;
}
