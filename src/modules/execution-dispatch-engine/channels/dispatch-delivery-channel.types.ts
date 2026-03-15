import { DispatchActorType } from '../domain';
import { DispatchDeliveryChannelStatus, DispatchDeliveryChannelType, DispatchDeliveryProtocol } from './dispatch-delivery-channel.enums';
import { DispatchDeliveryEndpoint } from './dispatch-delivery-endpoint.types';

/**
 * Dispatch Delivery Channel Entity
 *
 * Represents a channel through which dispatch intents can be delivered to target actors.
 * A delivery channel defines the medium, protocol, and endpoints for dispatch transmission.
 *
 * Example: An ERP_PUSH channel delivers dispatch intents to ERP systems via HTTPS API calls
 */
export interface DispatchDeliveryChannel {
  /**
   * Unique identifier for this delivery channel
   */
  channelId: string;

  /**
   * Type of channel (ERP_PUSH, API, WEBHOOK, INTERNAL_QUEUE, MANUAL_REVIEW)
   */
  channelType: DispatchDeliveryChannelType;

  /**
   * Current operational status of this channel
   */
  channelStatus: DispatchDeliveryChannelStatus;

  /**
   * Protocol used by this channel for delivery
   */
  protocol: DispatchDeliveryProtocol;

  /**
   * Human-readable name of the channel
   */
  displayName: string;

  /**
   * Detailed description of the channel's purpose and capabilities
   */
  description: string;

  /**
   * List of actor types that can receive dispatches through this channel
   * Reuses strict enum from dispatch domain layer
   */
  supportedActorTypes: DispatchActorType[];

  /**
   * Delivery endpoints associated with this channel
   */
  endpoints: DispatchDeliveryEndpoint[];

  /**
   * Timestamp when the channel was created (milliseconds since epoch)
   */
  createdAt: number;

  /**
   * Timestamp when the channel was last modified (milliseconds since epoch)
   */
  updatedAt: number;
}
