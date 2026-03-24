/**
 * MOTOR 3 — PHASE 29: DECISION CALCULATION RUNTIME
 * Deterministic Conversion from NetworkLiquidity + NetworkPressure to Decision Signals
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
 * Convert NetworkLiquidity and NetworkPressure into decision signal computation results.
 * Uses deterministic signal mapping based on liquidity type and status combinations.
 */

import type { NetworkLiquidity } from '../types/network-liquidity.types';
import type { NetworkPressure } from '../types/network-pressure.types';
import type {
  NetworkDecisionComputationResult,
} from '../types/network-decision-calculation.types';
import { NetworkLiquidityType, NetworkLiquidityStatus } from '../types/network-liquidity.types';
import {
  NetworkDecisionSignalEntity,
  NetworkDecisionComputationResultEntity,
} from '../entities/network-decision-calculation.entity';

// ============================================================================
// EXHAUSTIVENESS GUARD
// ============================================================================

/**
 * Guard function to ensure exhaustive switch statements.
 * Throws if a case reaches this function, indicating unmapped type combination.
 *
 * @param value should be `never` in exhaustive switch
 * @throws Error with unmapped type combination
 */
function assertUnreachable(value: never): never {
  throw new Error(`Unmapped liquidity type or status: ${value}`);
}

// ============================================================================
// DECISION ACTION LEVELS MAPPING
// ============================================================================

/**
 * Deterministic mapping structure for decision action levels.
 *
 * Maps combination of NetworkLiquidityType and NetworkLiquidityStatus
 * to corresponding decision signal action levels.
 *
 * @param liquidityType from NetworkLiquidity
 * @param status from NetworkLiquidity
 * @returns object with redirect, increaseStock, rebalance, hold levels
 */
function mapLiquidityStateToActionLevels(
  liquidityType: NetworkLiquidityType,
  status: NetworkLiquidityStatus
): {
  redirectServiceLevel: number;
  increaseStockLevel: number;
  rebalanceRegionLevel: number;
  holdPositionLevel: number;
} {
  switch (liquidityType) {
    case NetworkLiquidityType.PART_FLOW:
      switch (status) {
        case NetworkLiquidityStatus.BLOCKED:
          return {
            redirectServiceLevel: 20,
            increaseStockLevel: 90,
            rebalanceRegionLevel: 30,
            holdPositionLevel: 10,
          };
        case NetworkLiquidityStatus.CONSTRAINED:
          return {
            redirectServiceLevel: 20,
            increaseStockLevel: 70,
            rebalanceRegionLevel: 40,
            holdPositionLevel: 30,
          };
        case NetworkLiquidityStatus.OPEN:
          return {
            redirectServiceLevel: 10,
            increaseStockLevel: 20,
            rebalanceRegionLevel: 20,
            holdPositionLevel: 80,
          };
        default:
          return assertUnreachable(status);
      }
    case NetworkLiquidityType.SERVICE_CAPACITY_FLOW:
      switch (status) {
        case NetworkLiquidityStatus.BLOCKED:
          return {
            redirectServiceLevel: 90,
            increaseStockLevel: 10,
            rebalanceRegionLevel: 40,
            holdPositionLevel: 10,
          };
        case NetworkLiquidityStatus.CONSTRAINED:
          return {
            redirectServiceLevel: 70,
            increaseStockLevel: 10,
            rebalanceRegionLevel: 40,
            holdPositionLevel: 30,
          };
        case NetworkLiquidityStatus.OPEN:
          return {
            redirectServiceLevel: 20,
            increaseStockLevel: 10,
            rebalanceRegionLevel: 20,
            holdPositionLevel: 80,
          };
        default:
          return assertUnreachable(status);
      }
    case NetworkLiquidityType.REGION_BALANCING_FLOW:
      switch (status) {
        case NetworkLiquidityStatus.BLOCKED:
          return {
            redirectServiceLevel: 30,
            increaseStockLevel: 20,
            rebalanceRegionLevel: 90,
            holdPositionLevel: 10,
          };
        case NetworkLiquidityStatus.CONSTRAINED:
          return {
            redirectServiceLevel: 30,
            increaseStockLevel: 20,
            rebalanceRegionLevel: 70,
            holdPositionLevel: 30,
          };
        case NetworkLiquidityStatus.OPEN:
          return {
            redirectServiceLevel: 10,
            increaseStockLevel: 10,
            rebalanceRegionLevel: 20,
            holdPositionLevel: 80,
          };
        default:
          return assertUnreachable(status);
      }
    default:
      return assertUnreachable(liquidityType);
  }
}

// ============================================================================
// DECISION COMPUTATION RUNTIME
// ============================================================================

/**
 * Compute decision signal from NetworkLiquidity and NetworkPressure.
 * Uses deterministic signal mapping without external dependencies.
 *
 * Signal mapping based on liquidity type and status:
 * - PART_FLOW + BLOCKED → redirect:20, stock:90, rebalance:30, hold:10
 * - PART_FLOW + CONSTRAINED → redirect:20, stock:70, rebalance:40, hold:30
 * - PART_FLOW + OPEN → redirect:10, stock:20, rebalance:20, hold:80
 * - SERVICE_CAPACITY_FLOW + BLOCKED → redirect:90, stock:10, rebalance:40, hold:10
 * - SERVICE_CAPACITY_FLOW + CONSTRAINED → redirect:70, stock:10, rebalance:40, hold:30
 * - SERVICE_CAPACITY_FLOW + OPEN → redirect:20, stock:10, rebalance:20, hold:80
 * - REGION_BALANCING_FLOW + BLOCKED → redirect:30, stock:20, rebalance:90, hold:10
 * - REGION_BALANCING_FLOW + CONSTRAINED → redirect:30, stock:20, rebalance:70, hold:30
 * - REGION_BALANCING_FLOW + OPEN → redirect:10, stock:10, rebalance:20, hold:80
 *
 * Calculation timestamp from liquidity evaluation.
 *
 * @param liquidity NetworkLiquidity to compute from
 * @param pressure NetworkPressure to compute from
 * @returns NetworkDecisionComputationResult contract object
 */
export function computeNetworkDecisionSignal(
  liquidity: NetworkLiquidity,
  pressure: NetworkPressure
): NetworkDecisionComputationResult {
  // Get deterministic action levels for liquidity state
  const levels = mapLiquidityStateToActionLevels(liquidity.liquidityType, liquidity.status);

  // Create signal entity from deterministic values
  const signalEntity = new NetworkDecisionSignalEntity({
    sourceLiquidityId: liquidity.liquidityId,
    sourcePressureId: pressure.pressureId,
    domain: liquidity.domain,
    redirectServiceLevel: levels.redirectServiceLevel,
    increaseStockLevel: levels.increaseStockLevel,
    rebalanceRegionLevel: levels.rebalanceRegionLevel,
    holdPositionLevel: levels.holdPositionLevel,
    calculatedAt: liquidity.evaluatedAt,
    metadata: {
      sourceLiquidityType: liquidity.liquidityType,
      sourceLiquidityStatus: liquidity.status,
      sourcePressureType: pressure.pressureType,
    },
  });

  // Create computation result entity with signal
  const resultEntity = new NetworkDecisionComputationResultEntity({
    signal: signalEntity,
  });

  // Return plain contract object, not entity instance
  return {
    signal: {
      sourceLiquidityId: resultEntity.signal.sourceLiquidityId,
      sourcePressureId: resultEntity.signal.sourcePressureId,
      domain: resultEntity.signal.domain,
      redirectServiceLevel: resultEntity.signal.redirectServiceLevel,
      increaseStockLevel: resultEntity.signal.increaseStockLevel,
      rebalanceRegionLevel: resultEntity.signal.rebalanceRegionLevel,
      holdPositionLevel: resultEntity.signal.holdPositionLevel,
      calculatedAt: resultEntity.signal.calculatedAt,
      metadata: resultEntity.signal.metadata,
    },
  };
}
