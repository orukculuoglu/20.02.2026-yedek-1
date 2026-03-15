import { DispatchDeliveryChannelType, DispatchDeliveryProtocol } from './dispatch-delivery-channel.enums';
import { DispatchDeliveryAuthType } from './dispatch-delivery-auth.enums';

/**
 * Dispatch Delivery Endpoint Type
 *
 * Represents a specific delivery target endpoint associated with a delivery channel.
 * An endpoint is the concrete address/configuration where a dispatch is delivered.
 *
 * Example: An ERP_PUSH channel might have multiple endpoints pointing to different
 * ERP system instances (production, staging, etc.)
 */
export interface DispatchDeliveryEndpoint {
  /**
   * Unique identifier for this endpoint
   */
  endpointId: string;

  /**
   * Type of channel this endpoint belongs to
   */
  channelType: DispatchDeliveryChannelType;

  /**
   * Protocol used to communicate with this endpoint
   */
  protocol: DispatchDeliveryProtocol;

  /**
   * Address of the endpoint (URL, queue name, internal reference, etc.)
   */
  endpointAddress: string;

  /**
   * Type of authentication required (NONE, BASIC, BEARER, API_KEY, OAUTH, INTERNAL)
   */
  authType: DispatchDeliveryAuthType;

  /**
   * Configuration object for authentication (credentials, tokens, keys, etc.)
   * Structure varies by authType
   */
  authConfig: Record<string, unknown>;

  /**
   * Timestamp when the endpoint was created (milliseconds since epoch)
   */
  createdAt: number;

  /**
   * Timestamp when the endpoint was last modified (milliseconds since epoch)
   */
  updatedAt: number;
}
