/**
 * MOTOR 3 — PHASE 2: NETWORK EVENT ENTITY
 * Immutable Entity Structure for Network Events
 *
 * Scope:
 * - Entity layer only
 * - No normalization
 * - No aggregation
 * - No orchestration
 * - No ID/timestamp generation
 * - No validation logic
 *
 * Purpose:
 * Provide immutable entity representation of canonical network events.
 * Bridge between type contracts and domain layers.
 */

import type {
  NetworkDomain,
  NetworkEventType,
  NetworkSourceRef,
} from '../types/network-foundation.types';
import type { NetworkRelatedRefs } from '../types/network-event.types';

/**
 * Constructor input contract for NetworkEventEntity.
 * Represents the minimal data required to construct an event entity.
 * All fields required (no optional ambiguity).
 */
export interface CreateNetworkEventInput {
  readonly networkEventId: string;
  readonly domain: NetworkDomain;
  readonly eventType: NetworkEventType;
  readonly sourceRef: NetworkSourceRef;
  readonly relatedRefs: NetworkRelatedRefs;
  readonly eventTimestamp: string;
  readonly rawContext: Readonly<Record<string, unknown>>;
}

/**
 * Immutable entity representation of a network event.
 *
 * NetworkEventEntity provides the structural entity layer
 * for network events without introducing any runtime generation,
 * normalization, aggregation, or validation logic.
 *
 * Immutability Contract:
 * - All properties are readonly
 * - Constructor assignment only
 * - No mutation methods
 * - No computed properties
 * - Pure data structure
 */
export class NetworkEventEntity {
  /**
   * Unique identifier for this network event.
   * Immutable once constructed.
   */
  readonly networkEventId: string;

  /**
   * Domain classification.
   * Indicates the business domain this event belongs to.
   * Immutable once constructed.
   */
  readonly domain: NetworkDomain;

  /**
   * Event type classification.
   * Indicates what kind of state change occurred.
   * Immutable once constructed.
   */
  readonly eventType: NetworkEventType;

  /**
   * Source origin reference.
   * Maintains complete traceability of event source.
   * Immutable once constructed.
   */
  readonly sourceRef: NetworkSourceRef;

  /**
   * References to entities affected by this event.
   * Optional fields reflect weak coupling to entity types.
   * Immutable once constructed.
   */
  readonly relatedRefs: NetworkRelatedRefs;

  /**
   * Event timestamp as ISO 8601 string.
   * Represents the moment the event occurred.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   * Immutable once constructed.
   */
  readonly eventTimestamp: string;

  /**
   * Immutable raw context data from the event source.
   * Maintains original event payload without transformation.
   * Type is deliberately Record<string, unknown> to accept
   * any event structure without runtime validation.
   * Immutable once constructed.
   */
  readonly rawContext: Readonly<Record<string, unknown>>;

  /**
   * Construct a NetworkEventEntity from explicit input.
   *
   * Requirements:
   * - All fields must be provided (no optional ambiguity)
   * - No field generation or derivation
   * - No validation (structural only)
   * - No normalization
   *
   * @param input - Fully specified event data
   */
  constructor(input: CreateNetworkEventInput) {
    this.networkEventId = input.networkEventId;
    this.domain = input.domain;
    this.eventType = input.eventType;
    this.sourceRef = input.sourceRef;
    this.relatedRefs = input.relatedRefs;
    this.eventTimestamp = input.eventTimestamp;
    this.rawContext = input.rawContext;
  }
}
