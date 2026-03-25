/**
 * MOTOR 3 — PHASE 41: TEMPORAL WINDOW CONTRACT
 * Type Definitions for Event Window Aggregation and Temporal Analysis
 *
 * Scope:
 * - Type definitions only
 * - No runtime behavior
 * - No aggregation logic
 * - No validation
 * - No guards
 * - No factories
 *
 * Purpose:
 * Define contracts for temporal event windows used in Motor 3 V2 for
 * aggregating multiple events over a specified time window.
 * Provides immutable structures for multi-event analysis and trend detection.
 */

import type { NetworkDomain } from './network-foundation.types';
import type { NetworkEvent } from './network-event.types';
import type { NetworkTemporalWindowType, NetworkTrendDirection } from './network-snapshot.types';

// ============================================================================
// NETWORK EVENT WINDOW
// ============================================================================

/**
 * Represents a temporal window containing aggregated events.
 * Captures multiple events within a defined time window with trend information.
 *
 * Fields:
 * - windowId: Unique identifier for this event window
 * - domain: Domain classification for the window
 * - windowType: Classification of the temporal window (SINGLE_EVENT, RECENT_WINDOW)
 * - events: Immutable array of events within the window
 * - eventCount: Deterministic count of events in the window
 * - windowStartedAt: Timestamp when window observation began
 * - windowEndedAt: Timestamp when window observation ended
 * - trendDirection: Directional trend of signal metrics in this window
 * - metadata: Additional context-specific information
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkEventWindow {
  /**
   * Unique identifier for this event window.
   * Globally unique within the system.
   */
  readonly windowId: string;

  /**
   * Domain classification for this event window.
   * Indicates which business domain the window applies to.
   */
  readonly domain: NetworkDomain;

  /**
   * Classification of temporal window type.
   * Indicates scope of event aggregation (single or recent window).
   */
  readonly windowType: NetworkTemporalWindowType;

  /**
   * Immutable array of events within this temporal window.
   * Contains all events aggregated for this window observation.
   */
  readonly events: ReadonlyArray<NetworkEvent>;

  /**
   * Deterministic count of events in this window.
   * Equals the length of the events array.
   */
  readonly eventCount: number;

  /**
   * Timestamp when window observation began.
   * As ISO 8601 string representing window start time.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly windowStartedAt: string;

  /**
   * Timestamp when window observation ended.
   * As ISO 8601 string representing window end time.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly windowEndedAt: string;

  /**
   * Directional trend of signal metrics within this window.
   * Indicates general movement of conditions (increasing, decreasing, stable).
   */
  readonly trendDirection: NetworkTrendDirection;

  /**
   * Immutable metadata associated with this window.
   * Contains additional context-specific information.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// NETWORK WINDOW AGGREGATION INPUT
// ============================================================================

/**
 * Input contract for window aggregation operations.
 * Specifies the events and time window for aggregation.
 *
 * Fields:
 * - events: Array of events to aggregate
 * - domain: Domain classification for the window
 * - windowType: Type of temporal window (SINGLE_EVENT, RECENT_WINDOW)
 * - windowStartedAt: Window observation start timestamp
 * - windowEndedAt: Window observation end timestamp
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkWindowAggregationInput {
  /**
   * Events to aggregate into a temporal window.
   * Immutable array of NetworkEvent objects.
   */
  readonly events: ReadonlyArray<NetworkEvent>;

  /**
   * Domain classification for the aggregation window.
   * Indicates business domain of aggregated events.
   */
  readonly domain: NetworkDomain;

  /**
   * Type of temporal window for event aggregation.
   * Determines window classification framework.
   */
  readonly windowType: NetworkTemporalWindowType;

  /**
   * Timestamp when window observation begins.
   * As ISO 8601 string.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly windowStartedAt: string;

  /**
   * Timestamp when window observation ends.
   * As ISO 8601 string.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly windowEndedAt: string;
}

// ============================================================================
// NETWORK WINDOW AGGREGATION RESULT
// ============================================================================

/**
 * Result of a window aggregation operation.
 * Captures the aggregated event window.
 *
 * Fields:
 * - window: NetworkEventWindow containing aggregated events and metadata
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkWindowAggregationResult {
  /**
   * Aggregated event window from the operation.
   * Contains all events, trend information, and window metadata.
   */
  readonly window: NetworkEventWindow;
}
