/**
 * Dispatch Delivery Channel Status Enum
 *
 * Defines the operational status of a delivery channel.
 */
export enum DispatchDeliveryChannelStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Dispatch Delivery Channel Type Enum
 *
 * Defines the category/method of delivery channel available for dispatch routing.
 */
export enum DispatchDeliveryChannelType {
  ERP_PUSH = 'ERP_PUSH',
  API = 'API',
  WEBHOOK = 'WEBHOOK',
  INTERNAL_QUEUE = 'INTERNAL_QUEUE',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

/**
 * Dispatch Delivery Protocol Enum
 *
 * Defines the underlying communication protocol used by a delivery channel.
 */
export enum DispatchDeliveryProtocol {
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  QUEUE = 'QUEUE',
  INTERNAL = 'INTERNAL',
  MANUAL = 'MANUAL',
}
