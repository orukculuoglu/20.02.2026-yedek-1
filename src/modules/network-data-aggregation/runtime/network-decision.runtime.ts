/**
 * MOTOR 3 — PHASE 15: DECISION RUNTIME (REFACTORED)
 * Deterministic Conversion from NetworkLiquidity + NetworkPressure to NetworkDecision
 * Using computed NetworkDecisionSignal
 *
 * Scope:
 * - Runtime logic allowed
 * - Deterministic only
 * - No ML, prediction, external calls
 * - No validation
 * - No randomness
 * - No async
 *
 * Purpose:
 * Convert NetworkLiquidity and NetworkPressure into a NetworkDecision.
 * Derives decision type from computed decision signal levels.
 * Uses deterministic mapping rules with no external dependencies.
 */

import type { NetworkPressure } from '../types/network-pressure.types';
import type { NetworkLiquidity, NetworkLiquidityType, NetworkLiquidityStatus } from '../types/network-liquidity.types';
import type { NetworkDecision } from '../types/network-decision.types';
import { NetworkDecisionType, NetworkDecisionPriority } from '../types/network-decision.types';
import { NetworkLiquidityType as LiquidityTypeEnum, NetworkLiquidityStatus as StatusEnum } from '../types/network-liquidity.types';
import { NetworkDecisionEntity } from '../entities/network-decision.entity';
import { computeNetworkDecisionSignal } from './network-decision-calculation.runtime';

// ============================================================================
// EXHAUSTIVENESS GUARD
// ============================================================================

/**
 * Guard function to ensure exhaustive switch statements.
 * Throws if a case reaches this function, indicating unmapped status or type.
 *
 * @param value should be `never` in exhaustive switch
 * @throws Error with unmapped value
 */
function assertUnreachable(value: never): never {
  throw new Error(`Unmapped value: ${value}`);
}

// ============================================================================
// DECISION TYPE DERIVATION FROM SIGNAL
// ============================================================================

/**
 * Derive NetworkDecisionType from decision signal levels.
 * Selects the action with highest level, with deterministic tie-breaking.
 *
 * Tie-break priority:
 * 1. REDIRECT_SERVICE
 * 2. INCREASE_STOCK
 * 3. REBALANCE_REGION
 * 4. HOLD_POSITION
 *
 * @param redirectServiceLevel from signal
 * @param increaseStockLevel from signal
 * @param rebalanceRegionLevel from signal
 * @param holdPositionLevel from signal
 * @returns corresponding NetworkDecisionType
 */
function deriveDecisionTypeFromSignal(
  redirectServiceLevel: number,
  increaseStockLevel: number,
  rebalanceRegionLevel: number,
  holdPositionLevel: number
): NetworkDecisionType {
  // Find maximum level value
  const maxLevel = Math.max(
    redirectServiceLevel,
    increaseStockLevel,
    rebalanceRegionLevel,
    holdPositionLevel
  );

  // Apply tie-break priority: REDIRECT_SERVICE first
  if (redirectServiceLevel === maxLevel) {
    return NetworkDecisionType.REDIRECT_SERVICE;
  }

  // INCREASE_STOCK second
  if (increaseStockLevel === maxLevel) {
    return NetworkDecisionType.INCREASE_STOCK;
  }

  // REBALANCE_REGION third
  if (rebalanceRegionLevel === maxLevel) {
    return NetworkDecisionType.REBALANCE_REGION;
  }

  // HOLD_POSITION last
  return NetworkDecisionType.HOLD_POSITION;
}

// ============================================================================
// DECISION PRIORITY DERIVATION
// ============================================================================

/**
 * Derive NetworkDecisionPriority from liquidity status.
 * Deterministically maps status to decision urgency.
 *
 * Priority mapping:
 * - BLOCKED → CRITICAL
 * - CONSTRAINED → HIGH
 * - OPEN → LOW
 *
 * @param status from NetworkLiquidity
 * @returns corresponding NetworkDecisionPriority
 */
function derivePriority(status: NetworkLiquidityStatus): NetworkDecisionPriority {
  switch (status) {
    case StatusEnum.BLOCKED:
      return NetworkDecisionPriority.CRITICAL;
    case StatusEnum.CONSTRAINED:
      return NetworkDecisionPriority.HIGH;
    case StatusEnum.OPEN:
      return NetworkDecisionPriority.LOW;
    default:
      return assertUnreachable(status);
  }
}

// ============================================================================
// DECISION RATIONALE DERIVATION
// ============================================================================

/**
 * Generate rationale narrative for the decision.
 * Deterministically maps decision type to explanation.
 *
 * @param decisionType from derived decision
 * @returns narrative rationale string
 */
function deriveRationale(decisionType: NetworkDecisionType): string {
  switch (decisionType) {
    case NetworkDecisionType.INCREASE_STOCK:
      return 'Liquidity blocked on part flow; stock increase recommended.';
    case NetworkDecisionType.REDIRECT_SERVICE:
      return 'Liquidity blocked on service capacity flow; service redirection recommended.';
    case NetworkDecisionType.REBALANCE_REGION:
      return 'Regional balancing flow constrained; rebalancing recommended.';
    case NetworkDecisionType.HOLD_POSITION:
      return 'Liquidity status acceptable; hold position.';
    default:
      return assertUnreachable(decisionType);
  }
}

// ============================================================================
// DECISION CREATION RUNTIME
// ============================================================================

/**
 * Convert NetworkLiquidity and NetworkPressure into a NetworkDecision.
 * First computes decision signal, then derives decision type from signal levels.
 *
 * Decision logic:
 * - Type: derived from highest signal level (with tie-breaking)
 * - Priority: derived from liquidity status
 * - Rationale: derived from decision type
 * - Metadata: includes source context and signal levels
 *
 * @param liquidity NetworkLiquidity to convert
 * @param pressure NetworkPressure providing context
 * @returns NetworkDecision contract object
 */
export function createNetworkDecision(
  liquidity: NetworkLiquidity,
  pressure: NetworkPressure
): NetworkDecision {
  // Compute decision signal first
  const computation = computeNetworkDecisionSignal(liquidity, pressure);
  const signal = computation.signal;

  // Derive decision type from signal levels with tie-breaking
  const decisionType = deriveDecisionTypeFromSignal(
    signal.redirectServiceLevel,
    signal.increaseStockLevel,
    signal.rebalanceRegionLevel,
    signal.holdPositionLevel
  );

  // Derive priority from liquidity status
  const priority = derivePriority(liquidity.status);

  // Generate rationale narrative
  const rationale = deriveRationale(decisionType);

  // Construct entity from deterministic values
  const entity = new NetworkDecisionEntity({
    decisionId: `decision_${liquidity.liquidityId}`,
    sourceLiquidityId: liquidity.liquidityId,
    sourcePressureId: pressure.pressureId,
    domain: liquidity.domain,
    decisionType,
    priority,
    createdAt: signal.calculatedAt,
    rationale,
    metadata: {
      sourceLiquidityType: liquidity.liquidityType,
      sourceLiquidityStatus: liquidity.status,
      sourcePressureType: pressure.pressureType,
      sourceDecisionSignalLevels: {
        redirectServiceLevel: signal.redirectServiceLevel,
        increaseStockLevel: signal.increaseStockLevel,
        rebalanceRegionLevel: signal.rebalanceRegionLevel,
        holdPositionLevel: signal.holdPositionLevel,
      },
    },
  });

  // Return plain contract object, not entity instance
  return {
    decisionId: entity.decisionId,
    sourceLiquidityId: entity.sourceLiquidityId,
    sourcePressureId: entity.sourcePressureId,
    domain: entity.domain,
    decisionType: entity.decisionType,
    priority: entity.priority,
    createdAt: entity.createdAt,
    rationale: entity.rationale,
    metadata: entity.metadata,
  };
}
