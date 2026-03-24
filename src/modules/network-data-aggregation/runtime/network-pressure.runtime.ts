/**
 * MOTOR 3 — PHASE 9: PRESSURE ENGINE RUNTIME (REFACTORED)
 * Deterministic Conversion from NetworkEvent to NetworkPressure
 * Using computed NetworkPressureSignal
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
 * Derives magnitude from computed pressure signal levels.
 * Uses deterministic mapping rules with no external dependencies.
 */

import type { NetworkEvent } from '../types/network-event.types';
import type { NetworkPressure } from '../types/network-pressure.types';
import { NetworkPressureType, NetworkPressureDirection } from '../types/network-pressure.types';
import { NetworkPressureEntity } from '../entities/network-pressure.entity';
import { NetworkEventType } from '../types/network-foundation.types';
import { computeNetworkPressureSignal } from './network-pressure-calculation.runtime';

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
// MAGNITUDE DERIVATION FROM SIGNAL
// ============================================================================

/**
 * Derive pressure magnitude from signal levels based on pressure type.
 * Maps pressure type to corresponding signal level dimension.
 *
 * @param pressureType from mapped event type
 * @param demandLevel from computed signal
 * @param supplyLevel from computed signal
 * @param capacityLevel from computed signal
 * @param priceLevel from computed signal
 * @returns magnitude (0-100)
 */
function deriveMagnitudeFromSignal(
  pressureType: NetworkPressureType,
  demandLevel: number,
  supplyLevel: number,
  capacityLevel: number,
  priceLevel: number
): number {
  switch (pressureType) {
    case NetworkPressureType.DEMAND_PRESSURE:
      return demandLevel;
    case NetworkPressureType.SUPPLY_PRESSURE:
      return supplyLevel;
    case NetworkPressureType.CAPACITY_PRESSURE:
      return capacityLevel;
    case NetworkPressureType.PRICE_PRESSURE:
      return priceLevel;
    default:
      return assertUnreachable(pressureType);
  }
}

// ============================================================================
// PRESSURE CREATION RUNTIME
// ============================================================================

/**
 * Convert a NetworkEvent into a NetworkPressure.
 * First computes pressure signal, then derives magnitude from signal levels.
 *
 * Mapping rules:
 * - DEMAND_CREATED → DEMAND_PRESSURE (magnitude from demandLevel)
 * - STOCK_UPDATED → SUPPLY_PRESSURE (magnitude from supplyLevel)
 * - CAPACITY_CHANGED → CAPACITY_PRESSURE (magnitude from capacityLevel)
 * - PRICE_CHANGED → PRICE_PRESSURE (magnitude from priceLevel)
 * - LOAD_REPORTED → CAPACITY_PRESSURE (magnitude from capacityLevel)
 *
 * All pressures:
 * - Direction: STABLE
 * - Magnitude: derived from computed signal
 * - Detected time: from signal calculation timestamp
 *
 * @param event NetworkEvent to convert
 * @returns NetworkPressure contract object
 */
export function createNetworkPressure(event: NetworkEvent): NetworkPressure {
  // Compute pressure signal first
  const computation = computeNetworkPressureSignal(event);
  const signal = computation.signal;

  // Map event type to pressure type using exhaustive helper
  const pressureType = mapEventTypeToPressureType(event.eventType);

  // Derive magnitude from signal levels based on pressure type
  const magnitude = deriveMagnitudeFromSignal(
    pressureType,
    signal.demandLevel,
    signal.supplyLevel,
    signal.capacityLevel,
    signal.priceLevel
  );

  // Construct entity from deterministic values
  const entity = new NetworkPressureEntity({
    pressureId: `pressure_${event.networkEventId}`,
    sourceEventId: event.networkEventId,
    domain: event.domain,
    pressureType,
    direction: NetworkPressureDirection.STABLE,
    magnitude,
    detectedAt: signal.calculatedAt,
    metadata: {
      sourceEventType: event.eventType,
      sourceSignalLevels: {
        demandLevel: signal.demandLevel,
        supplyLevel: signal.supplyLevel,
        capacityLevel: signal.capacityLevel,
        priceLevel: signal.priceLevel,
      },
    },
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
