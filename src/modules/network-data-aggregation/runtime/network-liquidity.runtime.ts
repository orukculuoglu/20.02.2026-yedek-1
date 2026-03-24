/**
 * MOTOR 3 — PHASE 12: LIQUIDITY RUNTIME (REFACTORED)
 * Deterministic Conversion from NetworkPressure to NetworkLiquidity
 * Using computed NetworkLiquiditySignal
 *
 * Scope:
 * - Runtime logic allowed
 * - Deterministic only
 * - No ML, prediction, external calls
 * - No validation
 * - No randomness
 * - No timestamp generation
 * - No async
 *
 * Purpose:
 * Convert a detected NetworkPressure into a NetworkLiquidity condition.
 * Derives flow metrics from computed liquidity signal levels.
 * Uses deterministic mapping rules with no external dependencies.
 */

import type { NetworkPressure } from '../types/network-pressure.types';
import type { NetworkLiquidity } from '../types/network-liquidity.types';
import { NetworkLiquidityType, NetworkLiquidityStatus } from '../types/network-liquidity.types';
import { NetworkPressureType } from '../types/network-pressure.types';
import { NetworkLiquidityEntity } from '../entities/network-liquidity.entity';
import { computeNetworkLiquiditySignal } from './network-liquidity-calculation.runtime';

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
// LIQUIDITY TYPE MAPPING
// ============================================================================

/**
 * Map NetworkPressureType to NetworkLiquidityType.
 * Deterministically derives liquidity type from pressure type.
 *
 * @param pressureType from NetworkPressure
 * @returns corresponding NetworkLiquidityType
 */
function mapPressureTypeToLiquidityType(pressureType: NetworkPressureType): NetworkLiquidityType {
  switch (pressureType) {
    case NetworkPressureType.DEMAND_PRESSURE:
      return NetworkLiquidityType.PART_FLOW;
    case NetworkPressureType.SUPPLY_PRESSURE:
      return NetworkLiquidityType.PART_FLOW;
    case NetworkPressureType.CAPACITY_PRESSURE:
      return NetworkLiquidityType.SERVICE_CAPACITY_FLOW;
    case NetworkPressureType.PRICE_PRESSURE:
      return NetworkLiquidityType.REGION_BALANCING_FLOW;
    default:
      return assertUnreachable(pressureType);
  }
}

// ============================================================================
// FLOW SCORE DERIVATION FROM SIGNAL
// ============================================================================

/**
 * Derive flow score from signal levels based on liquidity type.
 * Maps liquidity type to corresponding signal level dimension.
 *
 * @param liquidityType from mapped pressure type
 * @param partFlowLevel from computed signal
 * @param serviceCapacityFlowLevel from computed signal
 * @param regionBalancingFlowLevel from computed signal
 * @returns flow score (0-100)
 */
function deriveFlowScoreFromSignal(
  liquidityType: NetworkLiquidityType,
  partFlowLevel: number,
  serviceCapacityFlowLevel: number,
  regionBalancingFlowLevel: number
): number {
  switch (liquidityType) {
    case NetworkLiquidityType.PART_FLOW:
      return partFlowLevel;
    case NetworkLiquidityType.SERVICE_CAPACITY_FLOW:
      return serviceCapacityFlowLevel;
    case NetworkLiquidityType.REGION_BALANCING_FLOW:
      return regionBalancingFlowLevel;
    default:
      return assertUnreachable(liquidityType);
  }
}

// ============================================================================
// LIQUIDITY STATUS MAPPING
// ============================================================================

/**
 * Derive NetworkLiquidityStatus from flow score.
 * Deterministically maps flow score ranges to availability status.
 *
 * Status mapping:
 * - flowScore > 70 → OPEN
 * - flowScore >= 30 and <= 70 → CONSTRAINED
 * - flowScore < 30 → BLOCKED
 *
 * @param flowScore derived from signal levels
 * @returns corresponding NetworkLiquidityStatus
 */
function mapFlowScoreToStatus(flowScore: number): NetworkLiquidityStatus {
  if (flowScore > 70) {
    return NetworkLiquidityStatus.OPEN;
  } else if (flowScore >= 30 && flowScore <= 70) {
    return NetworkLiquidityStatus.CONSTRAINED;
  } else {
    return NetworkLiquidityStatus.BLOCKED;
  }
}

// ============================================================================
// LIQUIDITY CREATION RUNTIME
// ============================================================================

/**
 * Convert a NetworkPressure into a NetworkLiquidity.
 * First computes liquidity signal, then derives flow metrics from signal levels.
 *
 * Mapping rules:
 * - DEMAND_PRESSURE → PART_FLOW (flowScore from signal.partFlowLevel)
 * - SUPPLY_PRESSURE → PART_FLOW (flowScore from signal.partFlowLevel)
 * - CAPACITY_PRESSURE → SERVICE_CAPACITY_FLOW (flowScore from signal.serviceCapacityFlowLevel)
 * - PRICE_PRESSURE → REGION_BALANCING_FLOW (flowScore from signal.regionBalancingFlowLevel)
 *
 * Status mapping from flowScore:
 * - > 70 → OPEN
 * - >= 30 and <= 70 → CONSTRAINED
 * - < 30 → BLOCKED
 *
 * @param pressure NetworkPressure to convert
 * @returns NetworkLiquidity contract object
 */
export function createNetworkLiquidity(pressure: NetworkPressure): NetworkLiquidity {
  // Compute liquidity signal first
  const computation = computeNetworkLiquiditySignal(pressure);
  const signal = computation.signal;

  // Map pressure type to liquidity type
  const liquidityType = mapPressureTypeToLiquidityType(pressure.pressureType);

  // Derive flow score from signal levels based on liquidity type
  const flowScore = deriveFlowScoreFromSignal(
    liquidityType,
    signal.partFlowLevel,
    signal.serviceCapacityFlowLevel,
    signal.regionBalancingFlowLevel
  );

  // Derive status from flow score
  const status = mapFlowScoreToStatus(flowScore);

  // Construct entity from deterministic values
  const entity = new NetworkLiquidityEntity({
    liquidityId: `liquidity_${pressure.pressureId}`,
    sourcePressureId: pressure.pressureId,
    domain: pressure.domain,
    liquidityType,
    status,
    flowScore,
    evaluatedAt: signal.calculatedAt,
    metadata: {
      sourcePressureType: pressure.pressureType,
      sourceFlowLevels: {
        partFlowLevel: signal.partFlowLevel,
        serviceCapacityFlowLevel: signal.serviceCapacityFlowLevel,
        regionBalancingFlowLevel: signal.regionBalancingFlowLevel,
      },
    },
  });

  // Return plain contract object, not entity instance
  return {
    liquidityId: entity.liquidityId,
    sourcePressureId: entity.sourcePressureId,
    domain: entity.domain,
    liquidityType: entity.liquidityType,
    status: entity.status,
    flowScore: entity.flowScore,
    evaluatedAt: entity.evaluatedAt,
    metadata: entity.metadata,
  };
}
