/**
 * MOTOR 3 — PHASE 42: TEMPORAL WINDOW ENTITY
 * Immutable Entity Wrappers for Event Window and Aggregation Contracts
 *
 * Scope:
 * - Entity layer only
 * - No aggregation logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Encapsulate NetworkEventWindow, NetworkWindowAggregationInput,
 * and NetworkWindowAggregationResult contracts in immutable entity classes.
 * Mirror contract structures with strict readonly enforcement.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type { NetworkEvent } from '../types/network-event.types';
import type { NetworkTemporalWindowType, NetworkTrendDirection } from '../types/network-snapshot.types';
import type {
  NetworkEventWindow,
  NetworkWindowAggregationInput,
  NetworkWindowAggregationResult,
} from '../types/network-temporal-window.types';

// ============================================================================
// CREATE NETWORK EVENT WINDOW INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkEventWindowEntity.
 * Contains all required fields for event window entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkEventWindowInput {
  /**
   * Unique identifier for this event window.
   */
  readonly windowId: string;

  /**
   * Domain classification for this event window.
   */
  readonly domain: NetworkDomain;

  /**
   * Classification of temporal window type.
   */
  readonly windowType: NetworkTemporalWindowType;

  /**
   * Immutable array of events within this temporal window.
   */
  readonly events: ReadonlyArray<NetworkEvent>;

  /**
   * Deterministic count of events in this window.
   */
  readonly eventCount: number;

  /**
   * Timestamp when window observation began.
   * As ISO 8601 string.
   */
  readonly windowStartedAt: string;

  /**
   * Timestamp when window observation ended.
   * As ISO 8601 string.
   */
  readonly windowEndedAt: string;

  /**
   * Directional trend of signal metrics within this window.
   */
  readonly trendDirection: NetworkTrendDirection;

  /**
   * Immutable metadata associated with this window.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// NETWORK EVENT WINDOW ENTITY
// ============================================================================

/**
 * Immutable entity representation of an event window.
 * Wraps NetworkEventWindow contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkEventWindowEntity implements NetworkEventWindow {
  readonly windowId: string;
  readonly domain: NetworkDomain;
  readonly windowType: NetworkTemporalWindowType;
  readonly events: ReadonlyArray<NetworkEvent>;
  readonly eventCount: number;
  readonly windowStartedAt: string;
  readonly windowEndedAt: string;
  readonly trendDirection: NetworkTrendDirection;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(input: CreateNetworkEventWindowInput) {
    this.windowId = input.windowId;
    this.domain = input.domain;
    this.windowType = input.windowType;
    this.events = input.events;
    this.eventCount = input.eventCount;
    this.windowStartedAt = input.windowStartedAt;
    this.windowEndedAt = input.windowEndedAt;
    this.trendDirection = input.trendDirection;
    this.metadata = input.metadata;
  }
}

// ============================================================================
// CREATE NETWORK WINDOW AGGREGATION INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkWindowAggregationInputEntity.
 * Contains all required fields for aggregation input entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkWindowAggregationInput {
  /**
   * Events to aggregate into a temporal window.
   */
  readonly events: ReadonlyArray<NetworkEvent>;

  /**
   * Domain classification for the aggregation window.
   */
  readonly domain: NetworkDomain;

  /**
   * Type of temporal window for event aggregation.
   */
  readonly windowType: NetworkTemporalWindowType;

  /**
   * Timestamp when window observation begins.
   * As ISO 8601 string.
   */
  readonly windowStartedAt: string;

  /**
   * Timestamp when window observation ends.
   * As ISO 8601 string.
   */
  readonly windowEndedAt: string;
}

// ============================================================================
// NETWORK WINDOW AGGREGATION INPUT ENTITY
// ============================================================================

/**
 * Immutable entity representation of a window aggregation input.
 * Wraps NetworkWindowAggregationInput contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkWindowAggregationInputEntity implements NetworkWindowAggregationInput {
  readonly events: ReadonlyArray<NetworkEvent>;
  readonly domain: NetworkDomain;
  readonly windowType: NetworkTemporalWindowType;
  readonly windowStartedAt: string;
  readonly windowEndedAt: string;

  constructor(input: CreateNetworkWindowAggregationInput) {
    this.events = input.events;
    this.domain = input.domain;
    this.windowType = input.windowType;
    this.windowStartedAt = input.windowStartedAt;
    this.windowEndedAt = input.windowEndedAt;
  }
}

// ============================================================================
// CREATE NETWORK WINDOW AGGREGATION RESULT INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkWindowAggregationResultEntity.
 * Contains all required fields for aggregation result entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkWindowAggregationResultInput {
  /**
   * Aggregated event window from the operation.
   */
  readonly window: NetworkEventWindowEntity;
}

// ============================================================================
// NETWORK WINDOW AGGREGATION RESULT ENTITY
// ============================================================================

/**
 * Immutable entity representation of a window aggregation result.
 * Wraps NetworkWindowAggregationResult contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 * Stores NetworkEventWindowEntity internally for entity-to-entity consistency.
 */
export class NetworkWindowAggregationResultEntity implements NetworkWindowAggregationResult {
  readonly window: NetworkEventWindowEntity;

  constructor(input: CreateNetworkWindowAggregationResultInput) {
    this.window = input.window;
  }
}
