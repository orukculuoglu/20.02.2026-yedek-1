/**
 * Dispatch Delivery Binding
 *
 * Represents a structural contract linking a dispatch intent, target actor, and delivery channel.
 * This binding determines HOW a dispatch will be delivered to a specific actor.
 *
 * NOTE: This is a structural contract only, NOT a runtime dispatch execution.
 * It captures the decision to use a specific channel for delivery, but does not execute the delivery.
 */
export interface DispatchDeliveryBinding {
  /**
   * Unique identifier for this binding relationship
   */
  bindingId: string;

  /**
   * The dispatch intent being delivered
   */
  dispatchId: string;

  /**
   * The target actor receiving the dispatch
   */
  actorId: string;

  /**
   * The delivery channel to be used
   */
  channelId: string;

  /**
   * Structured reason documenting why this channel was selected for this dispatch
   * (e.g., 'CHANNEL_CAPABILITY', 'ACTOR_PREFERENCE', 'SYSTEM_RULE', 'MANUAL_ASSIGNMENT')
   */
  bindingReason: string;

  /**
   * Timestamp when the binding was created (milliseconds since epoch)
   */
  createdAt: number;

  /**
   * Timestamp when the binding was last modified (milliseconds since epoch)
   */
  updatedAt: number;
}
