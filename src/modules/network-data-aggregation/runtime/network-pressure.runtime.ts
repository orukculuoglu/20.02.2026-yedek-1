/**
 * MOTOR 3 — PHASE 9: PRESSURE ENGINE RUNTIME
 * Deterministic Conversion from NetworkEvent to NetworkPressure
 *
 * Scope:
 * - Runtime logic allowed
 * - Deterministic only
 * - No ML, prediction, external calls
 * - No validation
 * - No randomness
 * - No timestamp generation
 * - No helper factories outside this file
 *
 * Purpose:
 * Convert a detected NetworkEvent into a NetworkPressure condition.
 * Uses deterministic mapping rules with no external dependencies.
 */

import type { NetworkEvent } from '../types/network-event.types';
import type { NetworkPressure } from '../types/network-pressure.types';
import { NetworkPressureType, NetworkPressureDirection } from '../types/network-pressure.types';
import { NetworkPressureEntity } from '../entities/network-pressure.entity';
import { NetworkEventType } from '../types/network-foundation.types';

// ============================================================================
// EXHAUSTIVENESS GUARD
// ============================================================================

/**
 * Guard function to ensure exhaustive switch statements.
 * Throws if a case reaches this function, indicating unmapped event type.
 *
 * @param value should be `never` in exhaustive switch
 * @throws Error with unmapped event type
 */
function assertUnreachable(value: never): never {
  throw new Error(`Unmapped event type: ${value}`);
}

// ============================================================================
// PRESSURE TYPE MAPPING
// ============================================================================

/**
 * Map NetworkEventType to NetworkPressureType.
 * Exhaustively closed with guard function.
 *
 * @param eventType from NetworkEvent
 * @returns corresponding NetworkPressureType
 */
function mapEventTypeToPressureType(eventType: NetworkEventType): NetworkPressureType {
  switch (eventType) {
    case NetworkEventType.DEMAND_CREATED:
      return NetworkPressureType.DEMAND_PRESSURE;
    case NetworkEventType.STOCK_UPDATED:
      return NetworkPressureType.SUPPLY_PRESSURE;
    case NetworkEventType.CAPACITY_CHANGED:
      return NetworkPressureType.CAPACITY_PRESSURE;
    case NetworkEventType.PRICE_CHANGED:
      return NetworkPressureType.PRICE_PRESSURE;
    case NetworkEventType.LOAD_REPORTED:
      return NetworkPressureType.CAPACITY_PRESSURE;
    default:
      return assertUnreachable(eventType);
  }
}

// ============================================================================
// PRESSURE CREATION RUNTIME
// ============================================================================

/**
 * Convert a NetworkEvent into a NetworkPressure.
 * Uses deterministic mapping rules without external dependencies.
 *
 * Mapping rules:
 * - DEMAND_CREATED → DEMAND_PRESSURE
 * - STOCK_UPDATED → SUPPLY_PRESSURE
 * - CAPACITY_CHANGED → CAPACITY_PRESSURE
 * - PRICE_CHANGED → PRICE_PRESSURE
 * - LOAD_REPORTED → CAPACITY_PRESSURE
 *
 * All pressures:
 * - Direction: STABLE
 * - Magnitude: 50
 * - Detected time: from event timestamp
 *
 * @param event NetworkEvent to convert
 * @returns NetworkPressure contract object
 */
export function createNetworkPressure(event: NetworkEvent): NetworkPressure {
  // Map event type to pressure type using exhaustive helper
  const pressureType = mapEventTypeToPressureType(event.eventType);

  // Construct entity from deterministic values
  const entity = new NetworkPressureEntity({
    pressureId: `pressure_${event.networkEventId}`,
    sourceEventId: event.networkEventId,
    domain: event.domain,
    pressureType,
    direction: NetworkPressureDirection.STABLE,
    magnitude: 50,
    detectedAt: event.eventTimestamp,
    metadata: { sourceEventType: event.eventType },
  });

  // Return plain contract object, not entity instance
  return {
    pressureId: entity.pressureId,
    sourceEventId: entity.sourceEventId,
    domain: entity.domain,
    pressureType: entity.pressureType,
    direction: entity.direction,
    magnitude: entity.magnitude,
    detectedAt: entity.detectedAt,
    metadata: entity.metadata,
  };
}
