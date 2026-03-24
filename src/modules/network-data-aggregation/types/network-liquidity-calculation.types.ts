/**
 * MOTOR 3 — PHASE 23: LIQUIDITY CALCULATION CONTRACT
 * Pure Type Definitions for Liquidity Signal Computation
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
 * Define immutable contracts for liquidity signal computation.
 * Liquidity signals are derived from pressure conditions.
 */

import type { NetworkDomain } from './network-foundation.types';
import type { NetworkPressureType, NetworkPressure } from './network-pressure.types';

// ============================================================================
// LIQUIDITY SIGNAL CONTRACT
// ============================================================================

/**
 * NetworkLiquiditySignal represents a computed liquidity state.
 * Derived from a NetworkPressure condition.
 *
 * Fields:
 * - sourcePressureId: identifier of source pressure
 * - domain: network domain context
 * - pressureType: type of pressure that generated this signal
 * - partFlowLevel: part flow capacity (Range: 0 to 100)
 * - serviceCapacityFlowLevel: service flow capacity (Range: 0 to 100)
 * - regionBalancingFlowLevel: region balance flow level (Range: 0 to 100)
 * - calculatedAt: ISO 8601 timestamp of calculation
 * - metadata: arbitrary immutable metadata
 */
export interface NetworkLiquiditySignal {
  readonly sourcePressureId: string;
  readonly domain: NetworkDomain;
  readonly pressureType: NetworkPressureType;
  readonly partFlowLevel: number;
  readonly serviceCapacityFlowLevel: number;
  readonly regionBalancingFlowLevel: number;
  readonly calculatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// LIQUIDITY COMPUTATION INPUT CONTRACT
// ============================================================================

/**
 * NetworkLiquidityComputationInput wraps a pressure for signal computation.
 *
 * Fields:
 * - pressure: source NetworkPressure for liquidity derivation
 */
export interface NetworkLiquidityComputationInput {
  readonly pressure: NetworkPressure;
}

// ============================================================================
// LIQUIDITY COMPUTATION RESULT CONTRACT
// ============================================================================

/**
 * NetworkLiquidityComputationResult contains the computed liquidity signal.
 *
 * Fields:
 * - signal: computed NetworkLiquiditySignal
 */
export interface NetworkLiquidityComputationResult {
  readonly signal: NetworkLiquiditySignal;
}
