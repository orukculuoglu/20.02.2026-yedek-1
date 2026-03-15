import { DispatchIntent } from '../domain';
import { DispatchTargetActor } from '../actors';
import { DispatchDeliveryChannel } from '../channels';
import { DispatchPackage } from '../packages';

/**
 * Dispatch Engine Context
 *
 * Represents the complete context required by the dispatch engine for assembly.
 * Combines dispatch intent, target actor, delivery channel, and prepared package
 * into a single orchestration context.
 */
export interface DispatchEngineContext {
  /**
   * The dispatch intent being orchestrated
   */
  dispatchIntent: DispatchIntent;

  /**
   * The target actor that will receive the dispatch
   */
  targetActor: DispatchTargetActor;

  /**
   * The delivery channel that will be used
   */
  deliveryChannel: DispatchDeliveryChannel;

  /**
   * The dispatch package prepared for delivery
   */
  dispatchPackage: DispatchPackage;

  /**
   * Timestamp when context was created (milliseconds since epoch)
   */
  createdAt: number;

  /**
   * Timestamp when context was last modified (milliseconds since epoch)
   */
  updatedAt: number;
}
