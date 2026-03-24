/**
 * MOTOR 3 — PHASE 15: DECISION RUNTIME
 * Deterministic Conversion from NetworkLiquidity + NetworkPressure to NetworkDecision
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
 * Uses deterministic mapping rules with no external dependencies.
 */

import type { NetworkPressure } from '../types/network-pressure.types';
import type { NetworkLiquidity, NetworkLiquidityType, NetworkLiquidityStatus } from '../types/network-liquidity.types';
import type { NetworkDecision } from '../types/network-decision.types';
import { NetworkDecisionType, NetworkDecisionPriority } from '../types/network-decision.types';
import { NetworkLiquidityType as LiquidityTypeEnum, NetworkLiquidityStatus as StatusEnum } from '../types/network-liquidity.types';
import { NetworkDecisionEntity } from '../entities/network-decision.entity';

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
// DECISION TYPE DERIVATION
// ============================================================================

/**
 * Derive NetworkDecisionType from liquidity type and status.
 * Deterministically maps liquidity conditions to decision actions.
 *
 * Decision type mapping:
 * - PART_FLOW + BLOCKED → INCREASE_STOCK
 * - SERVICE_CAPACITY_FLOW + BLOCKED → REDIRECT_SERVICE
 * - REGION_BALANCING_FLOW + (CONSTRAINED or BLOCKED) → REBALANCE_REGION
 * - otherwise → HOLD_POSITION
 *
 * @param liquidityType from NetworkLiquidity
 * @param status from NetworkLiquidity
 * @returns corresponding NetworkDecisionType
 */
function deriveDecisionType(
  liquidityType: NetworkLiquidityType,
  status: NetworkLiquidityStatus
): NetworkDecisionType {
  if (liquidityType === LiquidityTypeEnum.PART_FLOW && status === StatusEnum.BLOCKED) {
    return NetworkDecisionType.INCREASE_STOCK;
  }

  if (liquidityType === LiquidityTypeEnum.SERVICE_CAPACITY_FLOW && status === StatusEnum.BLOCKED) {
    return NetworkDecisionType.REDIRECT_SERVICE;
  }

  if (
    liquidityType === LiquidityTypeEnum.REGION_BALANCING_FLOW &&
    (status === StatusEnum.CONSTRAINED || status === StatusEnum.BLOCKED)
  ) {
    return NetworkDecisionType.REBALANCE_REGION;
  }

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
 * Uses deterministic mapping rules without external dependencies.
 *
 * Decision logic:
 * - Type: derived from liquidity type + status
 * - Priority: derived from liquidity status
 * - Rationale: derived from decision type
 * - Metadata: includes source liquidity and pressure context
 *
 * @param liquidity NetworkLiquidity to convert
 * @param pressure NetworkPressure providing context
 * @returns NetworkDecision contract object
 */
export function createNetworkDecision(
  liquidity: NetworkLiquidity,
  pressure: NetworkPressure
): NetworkDecision {
  // Derive decision type from liquidity conditions
  const decisionType = deriveDecisionType(liquidity.liquidityType, liquidity.status);

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
    createdAt: liquidity.evaluatedAt,
    rationale,
    metadata: {
      sourceLiquidityType: liquidity.liquidityType,
      sourceLiquidityStatus: liquidity.status,
      sourcePressureId: pressure.pressureId,
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
