/**
 * MOTOR 3 — PHASE 46: TEMPORAL PRESSURE RUNTIME
 * Deterministic Derivation of Pressure from Temporal Event Windows
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
 * Derive NetworkTemporalPressure signals from NetworkEventWindow aggregations.
 * Computes deterministic pressure levels based on event count and trend direction.
 */

import type { NetworkEventWindow } from '../types/network-temporal-window.types';
import type { NetworkTemporalPressureResult } from '../types/network-temporal-pressure.types';
import { NetworkTemporalPressureLevel } from '../types/network-temporal-pressure.types';
import {
  NetworkTemporalPressureEntity,
  NetworkTemporalPressureResultEntity,
} from '../entities/network-temporal-pressure.entity';

// ============================================================================
// TEMPORAL PRESSURE DERIVATION RUNTIME
// ============================================================================

/**
 * Derive temporal pressure from an aggregated event window.
 * Computes deterministic pressure level based on event count.
 *
 * Processing:
 * - Extract window metadata (ID, domain, event count, trend)
 * - Deterministically calculate pressure level from event count
 * - Generate temporal pressure ID from window ID
 * - Create pressure entity
 * - Wrap in result entity
 * - Return plain contract object
 *
 * Pressure Level Rules:
 * - 0 events: LOW (no activity)
 * - 1-2 events: MEDIUM (minimal activity)
 * - 3-5 events: HIGH (significant activity)
 * - 6+ events: CRITICAL (extreme activity)
 *
 * @param window NetworkEventWindow to derive pressure from
 * @returns NetworkTemporalPressureResult with derived pressure signal
 */
export function deriveTemporalPressure(
  window: NetworkEventWindow
): NetworkTemporalPressureResult {
  // Extract window properties
  const eventCount = window.eventCount;
  const trendDirection = window.trendDirection;
  const domain = window.domain;
  const windowId = window.windowId;
  const createdAt = window.windowEndedAt;

  // Deterministically calculate pressure level from event count
  let pressureLevel: NetworkTemporalPressureLevel;
  if (eventCount === 0) {
    pressureLevel = NetworkTemporalPressureLevel.LOW;
  } else if (eventCount <= 2) {
    pressureLevel = NetworkTemporalPressureLevel.MEDIUM;
  } else if (eventCount <= 5) {
    pressureLevel = NetworkTemporalPressureLevel.HIGH;
  } else {
    pressureLevel = NetworkTemporalPressureLevel.CRITICAL;
  }

  // Generate deterministic temporal pressure ID from window ID
  const temporalPressureId = `temporal_pressure_${windowId}`;

  // Create temporal pressure entity
  const pressureEntity = new NetworkTemporalPressureEntity({
    temporalPressureId,
    windowId,
    domain,
    eventCount,
    trendDirection,
    pressureLevel,
    createdAt,
  });

  // Create result entity
  const resultEntity = new NetworkTemporalPressureResultEntity({
    pressure: pressureEntity,
  });

  // Return plain contract object (not entity instance)
  return {
    pressure: {
      temporalPressureId: resultEntity.pressure.temporalPressureId,
      windowId: resultEntity.pressure.windowId,
      domain: resultEntity.pressure.domain,
      eventCount: resultEntity.pressure.eventCount,
      trendDirection: resultEntity.pressure.trendDirection,
      pressureLevel: resultEntity.pressure.pressureLevel,
      createdAt: resultEntity.pressure.createdAt,
    },
  };
}
