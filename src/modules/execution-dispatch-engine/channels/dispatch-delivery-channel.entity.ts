import { DispatchActorType } from '../domain';
import { DispatchDeliveryChannelStatus, DispatchDeliveryChannelType, DispatchDeliveryProtocol } from './dispatch-delivery-channel.enums';
import { DispatchDeliveryAuthType } from './dispatch-delivery-auth.enums';
import { DispatchDeliveryChannel } from './dispatch-delivery-channel.types';
import { DispatchDeliveryEndpoint } from './dispatch-delivery-endpoint.types';
import { DispatchDeliveryBinding } from './dispatch-delivery-binding.types';

/**
 * Input contract for creating a new DispatchDeliveryChannel
 *
 * All timestamps and IDs must be explicitly provided from upstream/runtime boundaries.
 * No temporal calculations or clock access is performed.
 */
export interface CreateDispatchDeliveryChannelInput {
  /**
   * Channel ID (explicitly provided, not generated)
   */
  channelId: string;

  /**
   * Type of delivery channel
   */
  channelType: DispatchDeliveryChannelType;

  /**
   * Protocol used by this channel
   */
  protocol: DispatchDeliveryProtocol;

  /**
   * Display name for the channel
   */
  displayName: string;

  /**
   * Description of the channel's purpose
   */
  description: string;

  /**
   * Actor types supported by this channel
   */
  supportedActorTypes: DispatchActorType[];

  /**
   * Endpoints for this channel
   */
  endpoints: DispatchDeliveryEndpoint[];

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
 * Input contract for updating a DispatchDeliveryChannel's status
 */
export interface UpdateDispatchDeliveryChannelStatusInput {
  /**
   * The channel to update
   */
  channel: DispatchDeliveryChannel;

  /**
   * New status for the channel
   */
  newStatus: DispatchDeliveryChannelStatus;

  /**
   * Timestamp of the update (explicitly provided from runtime)
   */
  updatedAt: number;
}

/**
 * Input contract for creating a new DispatchDeliveryEndpoint
 *
 * All timestamps and IDs must be explicitly provided.
 */
export interface CreateDispatchDeliveryEndpointInput {
  /**
   * Endpoint ID (explicitly provided, not generated)
   */
  endpointId: string;

  /**
   * Channel type this endpoint belongs to
   */
  channelType: DispatchDeliveryChannelType;

  /**
   * Protocol for this endpoint
   */
  protocol: DispatchDeliveryProtocol;

  /**
   * Address of the endpoint
   */
  endpointAddress: string;

  /**
   * Authentication type required
   */
  authType: DispatchDeliveryAuthType;

  /**
   * Authentication configuration
   */
  authConfig: Record<string, unknown>;

  /**
   * Timestamp of creation (explicitly provided from runtime)
   */
  createdAt: number;

  /**
   * Timestamp of last modification (explicitly provided from runtime)
   */
  updatedAt: number;
}

/**
 * Input contract for creating a new DispatchDeliveryBinding
 *
 * All timestamps and IDs must be explicitly provided.
 */
export interface CreateDispatchDeliveryBindingInput {
  /**
   * Binding ID (explicitly provided, not generated)
   */
  bindingId: string;

  /**
   * The dispatch intent being bound
   */
  dispatchId: string;

  /**
   * The target actor for this binding
   */
  actorId: string;

  /**
   * The delivery channel for this binding
   */
  channelId: string;

  /**
   * Reason for this binding decision
   */
  bindingReason: string;

  /**
   * Timestamp of binding creation (explicitly provided from runtime)
   */
  createdAt: number;

  /**
   * Timestamp of last modification (explicitly provided from runtime)
   */
  updatedAt: number;
}

/**
 * Dispatch Delivery Channel Entity Factory
 *
 * Provides deterministic factory methods for creating and updating DispatchDeliveryChannel instances.
 * All operations are purely functional with immutable returns and zero input mutations.
 */
export class DispatchDeliveryChannelEntity {
  /**
   * Create a new DispatchDeliveryChannel
   *
   * The channel is created with status ACTIVE as default.
   * Channel status can be updated through updateDispatchDeliveryChannelStatus().
   *
   * @param input Creation input contract with explicit timestamps and IDs
   * @returns Fresh DispatchDeliveryChannel instance
   */
  static createDispatchDeliveryChannel(
    input: CreateDispatchDeliveryChannelInput,
  ): DispatchDeliveryChannel {
    return {
      channelId: input.channelId,
      channelType: input.channelType,
      channelStatus: DispatchDeliveryChannelStatus.ACTIVE, // Always determined, never from input
      protocol: input.protocol,
      displayName: input.displayName,
      description: input.description,
      supportedActorTypes: input.supportedActorTypes,
      endpoints: input.endpoints,
      createdAt: input.createdAt, // Explicit, never Date.now()
      updatedAt: input.updatedAt, // Explicit, never Date.now()
    };
  }

  /**
   * Update a channel's status with deterministic immutability
   *
   * @param input Update input with new status and explicit timestamp
   * @returns Fresh DispatchDeliveryChannel with updated status and timestamp
   */
  static updateDispatchDeliveryChannelStatus(
    input: UpdateDispatchDeliveryChannelStatusInput,
  ): DispatchDeliveryChannel {
    return {
      ...input.channel, // Preserve all existing fields
      channelStatus: input.newStatus, // Update only status
      updatedAt: input.updatedAt, // Update only timestamp (explicit, never Date.now())
    };
  }
}

/**
 * Dispatch Delivery Endpoint Entity Factory
 *
 * Provides deterministic factory methods for creating DispatchDeliveryEndpoint instances.
 * All operations are purely functional with immutable returns and zero input mutations.
 */
export class DispatchDeliveryEndpointEntity {
  /**
   * Create a new DispatchDeliveryEndpoint
   *
   * An endpoint represents a specific delivery address within a channel configuration.
   * All timestamps and IDs are explicitly provided from runtime boundaries.
   *
   * @param input Creation input contract with explicit timestamps and IDs
   * @returns Fresh DispatchDeliveryEndpoint instance
   */
  static createDispatchDeliveryEndpoint(
    input: CreateDispatchDeliveryEndpointInput,
  ): DispatchDeliveryEndpoint {
    return {
      endpointId: input.endpointId,
      channelType: input.channelType,
      protocol: input.protocol,
      endpointAddress: input.endpointAddress,
      authType: input.authType,
      authConfig: input.authConfig,
      createdAt: input.createdAt, // Explicit, never Date.now()
      updatedAt: input.updatedAt, // Explicit, never Date.now()
    };
  }
}

/**
 * Dispatch Delivery Binding Entity Factory
 *
 * Provides deterministic factory methods for creating DispatchDeliveryBinding instances.
 * All operations are purely functional with immutable returns and zero input mutations.
 */
export class DispatchDeliveryBindingEntity {
  /**
   * Create a new DispatchDeliveryBinding
   *
   * A binding represents a structural connection between a dispatch intent, target actor, and delivery channel.
   * All timestamps and IDs are explicitly provided from runtime boundaries.
   *
   * @param input Creation input contract with explicit timestamps and IDs
   * @returns Fresh DispatchDeliveryBinding instance
   */
  static createDispatchDeliveryBinding(
    input: CreateDispatchDeliveryBindingInput,
  ): DispatchDeliveryBinding {
    return {
      bindingId: input.bindingId,
      dispatchId: input.dispatchId,
      actorId: input.actorId,
      channelId: input.channelId,
      bindingReason: input.bindingReason,
      createdAt: input.createdAt, // Explicit, never Date.now()
      updatedAt: input.updatedAt, // Explicit, never Date.now()
    };
  }
}
