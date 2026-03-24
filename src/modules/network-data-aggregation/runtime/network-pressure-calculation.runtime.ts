/**
 * MOTOR 3 — PHASE 21: PRESSURE CALCULATION RUNTIME
 * Deterministic Conversion from NetworkEvent to Pressure Signals
 *
 * Scope:
 * - Runtime logic allowed
 * - Deterministic only
 * - No ML, prediction, external calls
 * - No validation
 * - No randomness
 * - No async
 * - No timestamp generation outside provided inputs
 *
 * Purpose:
 * Convert NetworkEvent into pressure signal computation results.
 * Uses deterministic signal mapping with no external dependencies.
 */

import type { NetworkEvent } from '../types/network-event.types';
import type {
  NetworkPressureComputationResult,
} from '../types/network-pressure-calculation.types';
import { NetworkEventType } from '../types/network-foundation.types';
import {
  NetworkPressureSignalEntity,
  NetworkPressureComputationResultEntity,
} from '../entities/network-pressure-calculation.entity';

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
// PRESSURE SIGNAL MAPPING
// ============================================================================

/**
 * Deterministic mapping structure for pressure signals.
 *
 * Maps NetworkEventType to corresponding pressure signal levels.
 * Each event type produces specific demand/supply/capacity/price levels.
 *
 * @param eventType from NetworkEvent
 * @returns object with demand, supply, capacity, price levels
 */
function mapEventTypeToPressureLevels(eventType: NetworkEventType): {
  demand: number;
  supply: number;
  capacity: number;
  price: number;
} {
  switch (eventType) {
    case NetworkEventType.DEMAND_CREATED:
      return {
        demand: 80,
        supply: 20,
        capacity: 30,
        price: 40,
      };
    case NetworkEventType.STOCK_UPDATED:
      return {
        demand: 20,
        supply: 80,
        capacity: 20,
        price: 30,
      };
    case NetworkEventType.CAPACITY_CHANGED:
      return {
        demand: 30,
        supply: 20,
        capacity: 80,
        price: 20,
      };
    case NetworkEventType.PRICE_CHANGED:
      return {
        demand: 30,
        supply: 30,
        capacity: 20,
        price: 80,
      };
    case NetworkEventType.LOAD_REPORTED:
      return {
        demand: 40,
        supply: 20,
        capacity: 70,
        price: 30,
      };
    default:
      return assertUnreachable(eventType);
  }
}

// ============================================================================
// PRESSURE COMPUTATION RUNTIME
// ============================================================================

/**
 * Compute pressure signal from a NetworkEvent.
 * Uses deterministic signal mapping without external dependencies.
 *
 * Signal mapping rules:
 * - DEMAND_CREATED → demand:80, supply:20, capacity:30, price:40
 * - STOCK_UPDATED → demand:20, supply:80, capacity:20, price:30
 * - CAPACITY_CHANGED → demand:30, supply:20, capacity:80, price:20
 * - PRICE_CHANGED → demand:30, supply:30, capacity:20, price:80
 * - LOAD_REPORTED → demand:40, supply:20, capacity:70, price:30
 *
 * Calculation timestamp and metadata sourced from event.
 *
 * @param event NetworkEvent to compute from
 * @returns NetworkPressureComputationResult contract object
 */
export function computeNetworkPressureSignal(
  event: NetworkEvent
): NetworkPressureComputationResult {
  // Get deterministic pressure levels for event type
  const levels = mapEventTypeToPressureLevels(event.eventType);

  // Create signal entity from deterministic values
  const signalEntity = new NetworkPressureSignalEntity({
    sourceEventId: event.networkEventId,
    domain: event.domain,
    eventType: event.eventType,
    demandLevel: levels.demand,
    supplyLevel: levels.supply,
    capacityLevel: levels.capacity,
    priceLevel: levels.price,
    calculatedAt: event.eventTimestamp,
    metadata: {
      sourceEventType: event.eventType,
    },
  });

  // Create computation result entity with signal
  const resultEntity = new NetworkPressureComputationResultEntity({
    signal: signalEntity,
  });

  // Return plain contract object, not entity instance
  return {
    signal: {
      sourceEventId: resultEntity.signal.sourceEventId,
      domain: resultEntity.signal.domain,
      eventType: resultEntity.signal.eventType,
      demandLevel: resultEntity.signal.demandLevel,
      supplyLevel: resultEntity.signal.supplyLevel,
      capacityLevel: resultEntity.signal.capacityLevel,
      priceLevel: resultEntity.signal.priceLevel,
      calculatedAt: resultEntity.signal.calculatedAt,
      metadata: resultEntity.signal.metadata,
    },
  };
}
