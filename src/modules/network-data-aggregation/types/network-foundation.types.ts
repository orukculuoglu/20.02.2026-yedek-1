/**
 * MOTOR 3 — PHASE 0: NETWORK FOUNDATION
 * Canonical Model & Structural Contracts
 *
 * Scope:
 * - No business logic
 * - No runtime behavior
 * - No transformation logic
 * - Only definitions
 *
 * Purpose:
 * Define the canonical vocabulary and structural contracts
 * for the Network Intelligence Engine.
 */

// ============================================================================
// NETWORK DOMAIN ENUMERATION
// ============================================================================

/**
 * Core business domains in the logistics network.
 * Represents the fundamental classification axes.
 */
export enum NetworkDomain {
  SERVICE = 'SERVICE',
  PART = 'PART',
  FLEET = 'FLEET',
  REGION = 'REGION',
  MARKET = 'MARKET',
}

// ============================================================================
// NETWORK EVENT TYPE ENUMERATION
// ============================================================================

/**
 * Observable events within the network that trigger state changes.
 * Each type represents a specific state transition.
 */
export enum NetworkEventType {
  LOAD_REPORTED = 'LOAD_REPORTED',
  STOCK_UPDATED = 'STOCK_UPDATED',
  DEMAND_CREATED = 'DEMAND_CREATED',
  PRICE_CHANGED = 'PRICE_CHANGED',
  CAPACITY_CHANGED = 'CAPACITY_CHANGED',
}

// ============================================================================
// NETWORK EVENT SOURCE KIND ENUMERATION
// ============================================================================

/**
 * Origin classification for network events.
 * Indicates the source category that generated the event.
 */
export enum NetworkEventSourceKind {
  DISPATCH = 'DISPATCH',
  BEHAVIOR = 'BEHAVIOR',
  WORK_ORDER = 'WORK_ORDER',
  EXTERNAL_FEED = 'EXTERNAL_FEED',
}

// ============================================================================
// NETWORK ENTITY TYPE ENUMERATION
// ============================================================================

/**
 * Entity types that participate in the network.
 * Used for type safety and domain routing.
 */
export enum NetworkEntityType {
  SERVICE = 'SERVICE',
  PART = 'PART',
  FLEET = 'FLEET',
  REGION = 'REGION',
}

// ============================================================================
// REFERENCE INTERFACES
// ============================================================================

/**
 * Canonical reference to a Service entity.
 * Immutable contract for service identity.
 */
export interface NetworkServiceRef {
  readonly serviceId: string;
  readonly serviceName: string;
  readonly regionId: string;
}

/**
 * Canonical reference to a Part entity.
 * Immutable contract for part identity.
 */
export interface NetworkPartRef {
  readonly partId: string;
  readonly partName: string;
}

/**
 * Canonical reference to a Fleet entity.
 * Immutable contract for fleet identity.
 */
export interface NetworkFleetRef {
  readonly fleetId: string;
  readonly fleetName: string;
}

/**
 * Canonical reference to a Region entity.
 * Immutable contract for region identity.
 */
export interface NetworkRegionRef {
  readonly regionId: string;
  readonly regionName: string;
}

/**
 * Canonical reference to an event source.
 * Immutable contract for source origin tracking.
 */
export interface NetworkSourceRef {
  readonly sourceKind: NetworkEventSourceKind;
  readonly sourceId: string;
  readonly originModule: string;
  readonly originEntityId: string;
}
