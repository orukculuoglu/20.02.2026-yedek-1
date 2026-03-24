/**
 * MOTOR 3 — PHASE 12: LIQUIDITY RUNTIME
 * Deterministic Conversion from NetworkPressure to NetworkLiquidity
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
 * Uses deterministic mapping rules with no external dependencies.
 */

import type { NetworkPressure } from '../types/network-pressure.types';
import type { NetworkLiquidity } from '../types/network-liquidity.types';
import { NetworkLiquidityType, NetworkLiquidityStatus } from '../types/network-liquidity.types';
import { NetworkPressureType } from '../types/network-pressure.types';
import { NetworkLiquidityEntity } from '../entities/network-liquidity.entity';

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
// LIQUIDITY STATUS MAPPING
// ============================================================================

/**
 * Derive NetworkLiquidityStatus from pressure magnitude.
 * Deterministically maps magnitude ranges to flow availability status.
 *
 * Status mapping:
 * - magnitude < 30 → OPEN
 * - magnitude >= 30 and <= 70 → CONSTRAINED
 * - magnitude > 70 → BLOCKED
 *
 * @param magnitude from NetworkPressure
 * @returns corresponding NetworkLiquidityStatus
 */
function mapMagnitudeToStatus(magnitude: number): NetworkLiquidityStatus {
  if (magnitude < 30) {
    return NetworkLiquidityStatus.OPEN;
  } else if (magnitude >= 30 && magnitude <= 70) {
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
 * Uses deterministic mapping rules without external dependencies.
 *
 * Mapping rules:
 * - DEMAND_PRESSURE → PART_FLOW
 * - SUPPLY_PRESSURE → PART_FLOW
 * - CAPACITY_PRESSURE → SERVICE_CAPACITY_FLOW
 * - PRICE_PRESSURE → REGION_BALANCING_FLOW
 *
 * Status mapping from magnitude:
 * - < 30 → OPEN
 * - >= 30 and <= 70 → CONSTRAINED
 * - > 70 → BLOCKED
 *
 * Flow score is derived as inverse of magnitude: 100 - magnitude
 *
 * @param pressure NetworkPressure to convert
 * @returns NetworkLiquidity contract object
 */
export function createNetworkLiquidity(pressure: NetworkPressure): NetworkLiquidity {
  // Map pressure type to liquidity type
  const liquidityType = mapPressureTypeToLiquidityType(pressure.pressureType);

  // Derive status from magnitude
  const status = mapMagnitudeToStatus(pressure.magnitude);

  // Calculate flow score as inverse of magnitude
  const flowScore = 100 - pressure.magnitude;

  // Construct entity from deterministic values
  const entity = new NetworkLiquidityEntity({
    liquidityId: `liquidity_${pressure.pressureId}`,
    sourcePressureId: pressure.pressureId,
    domain: pressure.domain,
    liquidityType,
    status,
    flowScore,
    evaluatedAt: pressure.detectedAt,
    metadata: { sourcePressureType: pressure.pressureType },
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
