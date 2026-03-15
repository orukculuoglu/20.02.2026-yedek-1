/**
 * Dispatch Target Actor Status Enum
 *
 * Defines the lifecycle state of a target actor within the dispatch system.
 * These states represent the availability and operational status of an actor
 * that can receive and process dispatch intents.
 */
export enum DispatchTargetActorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Dispatch Target Resolution Mode Enum
 *
 * Defines how a target actor can be selected/resolved for dispatch routing.
 * - DIRECT: Actor can receive direct dispatch assignments
 * - ROUTABLE: Actor can receive dispatch through routing rules
 * - MANUAL_ONLY: Actor requires manual dispatch assignment
 * - SYSTEM_ONLY: Actor receives dispatch only through system automation
 */
export enum DispatchTargetResolutionMode {
  DIRECT = 'DIRECT',
  ROUTABLE = 'ROUTABLE',
  MANUAL_ONLY = 'MANUAL_ONLY',
  SYSTEM_ONLY = 'SYSTEM_ONLY',
}
