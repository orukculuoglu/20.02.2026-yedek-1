/**
 * MOTOR 3 — PHASE 25: LIQUIDITY CALCULATION RUNTIME
 * Deterministic Conversion from NetworkPressure to Liquidity Signals
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
 * Convert NetworkPressure into liquidity signal computation results.
 * Uses deterministic signal mapping with no external dependencies.
 */

import type { NetworkPressure } from '../types/network-pressure.types';
import type {
  NetworkLiquidityComputationResult,
} from '../types/network-liquidity-calculation.types';
import { NetworkPressureType } from '../types/network-pressure.types';
import {
  NetworkLiquiditySignalEntity,
  NetworkLiquidityComputationResultEntity,
} from '../entities/network-liquidity-calculation.entity';

// ============================================================================
// EXHAUSTIVENESS GUARD
// ============================================================================

/**
 * Guard function to ensure exhaustive switch statements.
 * Throws if a case reaches this function, indicating unmapped pressure type.
 *
 * @param value should be `never` in exhaustive switch
 * @throws Error with unmapped pressure type
 */
function assertUnreachable(value: never): never {
  throw new Error(`Unmapped pressure type: ${value}`);
}

// ============================================================================
// LIQUIDITY FLOW MAPPING
// ============================================================================

/**
 * Deterministic mapping structure for liquidity flow levels.
 *
 * Maps NetworkPressureType to corresponding liquidity signal flow levels.
 * Each pressure type produces specific part/service/region flow levels.
 *
 * @param pressureType from NetworkPressure
 * @returns object with part, service, region flow levels
 */
function mapPressureTypeToFlowLevels(pressureType: NetworkPressureType): {
  partFlow: number;
  serviceFlow: number;
  regionFlow: number;
} {
  switch (pressureType) {
    case NetworkPressureType.DEMAND_PRESSURE:
      return {
        partFlow: 30,
        serviceFlow: 40,
        regionFlow: 50,
      };
    case NetworkPressureType.SUPPLY_PRESSURE:
      return {
        partFlow: 80,
        serviceFlow: 40,
        regionFlow: 50,
      };
    case NetworkPressureType.CAPACITY_PRESSURE:
      return {
        partFlow: 30,
        serviceFlow: 80,
        regionFlow: 40,
      };
    case NetworkPressureType.PRICE_PRESSURE:
      return {
        partFlow: 40,
        serviceFlow: 30,
        regionFlow: 80,
      };
    default:
      return assertUnreachable(pressureType);
  }
}

// ============================================================================
// LIQUIDITY COMPUTATION RUNTIME
// ============================================================================

/**
 * Compute liquidity signal from a NetworkPressure.
 * Uses deterministic signal mapping without external dependencies.
 *
 * Signal mapping rules:
 * - DEMAND_PRESSURE → partFlow:30, serviceFlow:40, regionFlow:50
 * - SUPPLY_PRESSURE → partFlow:80, serviceFlow:40, regionFlow:50
 * - CAPACITY_PRESSURE → partFlow:30, serviceFlow:80, regionFlow:40
 * - PRICE_PRESSURE → partFlow:40, serviceFlow:30, regionFlow:80
 *
 * Calculation timestamp and metadata sourced from pressure.
 *
 * @param pressure NetworkPressure to compute from
 * @returns NetworkLiquidityComputationResult contract object
 */
export function computeNetworkLiquiditySignal(
  pressure: NetworkPressure
): NetworkLiquidityComputationResult {
  // Get deterministic flow levels for pressure type
  const flows = mapPressureTypeToFlowLevels(pressure.pressureType);

  // Create signal entity from deterministic values
  const signalEntity = new NetworkLiquiditySignalEntity({
    sourcePressureId: pressure.pressureId,
    domain: pressure.domain,
    pressureType: pressure.pressureType,
    partFlowLevel: flows.partFlow,
    serviceCapacityFlowLevel: flows.serviceFlow,
    regionBalancingFlowLevel: flows.regionFlow,
    calculatedAt: pressure.detectedAt,
    metadata: {
      sourcePressureType: pressure.pressureType,
    },
  });

  // Create computation result entity with signal
  const resultEntity = new NetworkLiquidityComputationResultEntity({
    signal: signalEntity,
  });

  // Return plain contract object, not entity instance
  return {
    signal: {
      sourcePressureId: resultEntity.signal.sourcePressureId,
      domain: resultEntity.signal.domain,
      pressureType: resultEntity.signal.pressureType,
      partFlowLevel: resultEntity.signal.partFlowLevel,
      serviceCapacityFlowLevel: resultEntity.signal.serviceCapacityFlowLevel,
      regionBalancingFlowLevel: resultEntity.signal.regionBalancingFlowLevel,
      calculatedAt: resultEntity.signal.calculatedAt,
      metadata: resultEntity.signal.metadata,
    },
  };
}
