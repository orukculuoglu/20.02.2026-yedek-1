/**
 * MOTOR 3 — PHASE 1: NETWORK EVENT CONTRACT
 * Canonical Network Event Structure
 *
 * Scope:
 * - Definitions only
 * - No factories
 * - No runtime logic
 * - No normalization logic
 * - No aggregation logic
 *
 * Purpose:
 * Define the canonical contract for network events
 * that flow through the Network Intelligence Engine.
 */

import type {
  NetworkDomain,
  NetworkEventType,
  NetworkSourceRef,
  NetworkServiceRef,
  NetworkPartRef,
  NetworkFleetRef,
  NetworkRegionRef,
} from './network-foundation.types';

// ============================================================================
// RELATED ENTITIES REFERENCE STRUCTURE
// ============================================================================

/**
 * Container for entity references related to a network event.
 * These references are optional because not every event touches every entity.
 *
 * Optional fields indicate weak coupling:
 * - A LOAD_REPORTED event may not involve a PART
 * - A STOCK_UPDATED event may not involve a FLEET
 * - etc.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkRelatedRefs {
  readonly serviceRef?: NetworkServiceRef;
  readonly partRef?: NetworkPartRef;
  readonly fleetRef?: NetworkFleetRef;
  readonly regionRef?: NetworkRegionRef;
}

// ============================================================================
// NETWORK EVENT CONTRACT
// ============================================================================

/**
 * Canonical contract for a network event.
 *
 * A NetworkEvent represents an observable state change
 * in the logistics network, with full traceability chain:
 * - event identity (networkEventId)
 * - domain classification (domain)
 * - event type (eventType)
 * - source origin (sourceRef)
 * - affected entities (relatedRefs)
 * - temporal context (eventTimestamp)
 * - raw event data (rawContext)
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkEvent {
  /**
   * Unique identifier for this network event.
   * Must be globally unique within the system.
   */
  readonly networkEventId: string;

  /**
   * Domain classification from NetworkDomain.
   * Indicates the business domain this event belongs to.
   */
  readonly domain: NetworkDomain;

  /**
   * Event type classification from NetworkEventType.
   * Indicates what kind of state change occurred.
   */
  readonly eventType: NetworkEventType;

  /**
   * Source origin reference.
   * Maintains complete traceability of event source.
   */
  readonly sourceRef: NetworkSourceRef;

  /**
   * References to entities affected by this event.
   * Optional fields reflect weak coupling to entity types.
   */
  readonly relatedRefs: NetworkRelatedRefs;

  /**
   * Event timestamp as ISO 8601 string.
   * Represents the moment the event occurred.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly eventTimestamp: string;

  /**
   * Immutable raw context data from the event source.
   * Maintains original event payload without transformation.
   * Type is deliberately Record<string, unknown> to accept
   * any event structure without runtime validation.
   */
  readonly rawContext: Readonly<Record<string, unknown>>;
}
