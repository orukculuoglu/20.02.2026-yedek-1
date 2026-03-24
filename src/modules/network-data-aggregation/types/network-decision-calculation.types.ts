/**
 * MOTOR 3 — PHASE 27: DECISION CALCULATION CONTRACT
 * Pure Type Definitions for Decision Signal Computation
 *
 * Scope:
 * - Type definitions only
 * - No runtime behavior
 * - No calculation logic
 * - No validation
 * - No guards
 * - No factories
 *
 * Purpose:
 * Define immutable contracts for decision signal computation.
 * Decision signals are derived from liquidity and pressure conditions.
 */

import type { NetworkDomain } from './network-foundation.types';
import type { NetworkLiquidity } from './network-liquidity.types';
import type { NetworkPressure } from './network-pressure.types';

// ============================================================================
// DECISION SIGNAL CONTRACT
// ============================================================================

/**
 * NetworkDecisionSignal represents a computed decision state.
 * Derived from NetworkLiquidity and NetworkPressure conditions.
 *
 * Fields:
 * - sourceLiquidityId: identifier of source liquidity
 * - sourcePressureId: identifier of source pressure
 * - domain: network domain context
 * - redirectServiceLevel: service redirection action level (Range: 0 to 100)
 * - increaseStockLevel: stock increase action level (Range: 0 to 100)
 * - rebalanceRegionLevel: region rebalancing action level (Range: 0 to 100)
 * - holdPositionLevel: hold position action level (Range: 0 to 100)
 * - calculatedAt: ISO 8601 timestamp of calculation
 * - metadata: arbitrary immutable metadata
 */
export interface NetworkDecisionSignal {
  readonly sourceLiquidityId: string;
  readonly sourcePressureId: string;
  readonly domain: NetworkDomain;
  readonly redirectServiceLevel: number;
  readonly increaseStockLevel: number;
  readonly rebalanceRegionLevel: number;
  readonly holdPositionLevel: number;
  readonly calculatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// DECISION COMPUTATION INPUT CONTRACT
// ============================================================================

/**
 * NetworkDecisionComputationInput wraps liquidity and pressure for signal computation.
 *
 * Fields:
 * - liquidity: source NetworkLiquidity for decision derivation
 * - pressure: source NetworkPressure for decision derivation
 */
export interface NetworkDecisionComputationInput {
  readonly liquidity: NetworkLiquidity;
  readonly pressure: NetworkPressure;
}

// ============================================================================
// DECISION COMPUTATION RESULT CONTRACT
// ============================================================================

/**
 * NetworkDecisionComputationResult contains the computed decision signal.
 *
 * Fields:
 * - signal: computed NetworkDecisionSignal
 */
export interface NetworkDecisionComputationResult {
  readonly signal: NetworkDecisionSignal;
}
