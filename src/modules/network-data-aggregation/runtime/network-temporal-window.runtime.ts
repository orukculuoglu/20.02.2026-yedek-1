/**
 * MOTOR 3 — PHASE 43: TEMPORAL WINDOW RUNTIME
 * Deterministic Aggregation of Multiple Events into Temporal Windows
 *
 * Scope:
 * - Runtime logic allowed
 * - Deterministic only
 * - No external calls
 * - No async
 * - No randomness
 * - No validation library
 * - No logging
 *
 * Purpose:
 * Aggregate multiple NetworkEvent items into a NetworkEventWindow
 * with deterministic trend direction and metadata tracking.
 */

import type { NetworkTrendDirection } from '../types/network-snapshot.types';
import type {
  NetworkWindowAggregationInput,
  NetworkWindowAggregationResult,
} from '../types/network-temporal-window.types';
import { NetworkTrendDirection as TrendEnum } from '../types/network-snapshot.types';
import {
  NetworkEventWindowEntity,
  NetworkWindowAggregationResultEntity,
} from '../entities/network-temporal-window.entity';

// ============================================================================
// TEMPORAL WINDOW AGGREGATION RUNTIME
// ============================================================================

/**
 * Aggregate multiple events into a temporal window.
 * Creates a window with deterministic ID, event count, and trend direction.
 *
 * Processing:
 * - Generate deterministic window ID from domain and timestamps
 * - Count aggregated events
 * - Determine trend direction from event count
 * - Collect source event IDs for metadata
 * - Create window entity
 * - Wrap in result entity
 * - Return plain contract object
 *
 * Trend Direction Rules:
 * - More than 1 event: INCREASING (intensity increase)
 * - Exactly 1 event: STABLE (single observation)
 * - No events: STABLE (no change)
 *
 * @param input NetworkWindowAggregationInput with events and window boundaries
 * @returns NetworkWindowAggregationResult containing aggregated window
 */
export function aggregateNetworkEventWindow(
  input: NetworkWindowAggregationInput
): NetworkWindowAggregationResult {
  // Deterministically calculate event count
  const eventCount = input.events.length;

  // Deterministically calculate trend direction based on event count
  let trendDirection: NetworkTrendDirection;
  if (eventCount > 1) {
    trendDirection = TrendEnum.INCREASING;
  } else {
    trendDirection = TrendEnum.STABLE;
  }

  // Build metadata with source event IDs
  const sourceEventIds = input.events.map(event => event.networkEventId);

  // Create event window entity
  const windowEntity = new NetworkEventWindowEntity({
    windowId: `window_${input.domain}_${input.windowStartedAt}_${input.windowEndedAt}`,
    domain: input.domain,
    windowType: input.windowType,
    events: input.events,
    eventCount,
    windowStartedAt: input.windowStartedAt,
    windowEndedAt: input.windowEndedAt,
    trendDirection,
    metadata: {
      sourceEventIds,
    },
  });

  // Create aggregation result entity
  const resultEntity = new NetworkWindowAggregationResultEntity({
    window: windowEntity,
  });

  // Return plain contract object (not entity instance)
  return {
    window: {
      windowId: resultEntity.window.windowId,
      domain: resultEntity.window.domain,
      windowType: resultEntity.window.windowType,
      events: resultEntity.window.events,
      eventCount: resultEntity.window.eventCount,
      windowStartedAt: resultEntity.window.windowStartedAt,
      windowEndedAt: resultEntity.window.windowEndedAt,
      trendDirection: resultEntity.window.trendDirection,
      metadata: resultEntity.window.metadata,
    },
  };
}
