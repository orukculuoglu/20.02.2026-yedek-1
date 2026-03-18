/**
 * Network Event Entity Construction
 *
 * Motor 3: Market / Network Intelligence Engine
 * Layer 1: Network Data Aggregation
 * Phase 1: Network Event Entity
 *
 * Purpose:
 * Provides immutable entity construction boundary for NetworkEvent
 * based on established type contracts.
 *
 * Scope:
 * - Entity construction only
 * - No normalization logic
 * - No aggregation logic
 * - No orchestration
 * - No runtime-generated values
 * - No service layer
 *
 * Design Principles:
 * - All values explicitly provided
 * - No ID generation
 * - No timestamp generation
 * - No hidden defaults
 * - Immutability enforced via Object.freeze
 * - Deterministic construction only
 * - Pure factory pattern
 *
 * Constraints:
 * - No Date.now()
 * - No randomness
 * - No side effects
 * - No transformation logic
 * - No normalization logic
 * - No aggregation logic
 * - Strict typing only
 */

import {
  NetworkEvent,
  NetworkDomain,
  NetworkEventType,
  NetworkSourceRef,
  NetworkRelatedRefs,
  NetworkRawContext,
} from '../types/network-event.types';

/**
 * Input contract for creating a NetworkEvent entity
 *
 * All parameters must be explicitly provided from intake layer.
 *
 * Constraints:
 * - No mutation of input
 * - No calculation of values
 * - No generation of IDs or timestamps
 * - All timestamps explicitly provided
 */
export interface CreateNetworkEventInput {
  /**
   * Unique identifier for this network event
   * Explicitly provided, not generated
   */
  networkEventId: string;

  /**
   * Semantic event type
   * What category of event occurred
   */
  eventType: NetworkEventType;

  /**
   * Operational domain of this event
   * What network domain the event applies to
   */
  networkDomain: NetworkDomain;

  /**
   * Source reference
   * Which system and entity produced this event
   */
  sourceRef: NetworkSourceRef;

  /**
   * Related entity references
   * Services, parts, fleets, regions involved in this event
   */
  relatedRefs: NetworkRelatedRefs;

  /**
   * Event timestamp (milliseconds since epoch)
   * When the event occurred in source system
   * Explicitly provided
   */
  eventTimestamp: number;

  /**
   * Raw, unprocessed context
   * Transport-only data from originating system
   */
  rawContext: NetworkRawContext;

  /**
   * Intake timestamp (milliseconds since epoch)
   * When event was received by Motor 3
   * Explicitly provided
   */
  intakeTimestamp: number;
}

/**
 * Type alias for NetworkEvent entity
 *
 * Ensures all NetworkEvent objects go through
 * immutable construction via createNetworkEvent factory.
 *
 * Immutable:
 * Network event entities are frozen and immutable.
 */
export type NetworkEventEntity = NetworkEvent;

/**
 * Factory function to create a NetworkEvent entity
 *
 * Produces a deterministic, immutable network event entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - No value transformation
 * - Immutability enforced via Object.freeze
 * - Pure deterministic object creation only
 *
 * @param input - CreateNetworkEventInput
 * @returns NetworkEventEntity - Immutable network event entity
 */
export function createNetworkEvent(
  input: CreateNetworkEventInput
): NetworkEventEntity {
  return Object.freeze({
    networkEventId: input.networkEventId,
    eventType: input.eventType,
    networkDomain: input.networkDomain,
    sourceRef: input.sourceRef,
    relatedRefs: input.relatedRefs,
    eventTimestamp: input.eventTimestamp,
    rawContext: input.rawContext,
    intakeTimestamp: input.intakeTimestamp,
  });
}
