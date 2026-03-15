/**
 * Dispatch Delivery Authentication Type Enum
 *
 * Defines the authentication methods available for delivery endpoints.
 * Strict typing prevents inconsistent authentication configuration across the dispatch system.
 */
export enum DispatchDeliveryAuthType {
  NONE = 'NONE',
  BASIC = 'BASIC',
  BEARER = 'BEARER',
  API_KEY = 'API_KEY',
  OAUTH = 'OAUTH',
  INTERNAL = 'INTERNAL',
}
