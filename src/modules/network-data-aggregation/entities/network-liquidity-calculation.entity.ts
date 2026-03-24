/**
 * MOTOR 3 — PHASE 24: LIQUIDITY CALCULATION ENTITY
 * Immutable Entity Structures for Liquidity Signal Computation
 *
 * Scope:
 * - Entity layer only
 * - No calculation logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Provide immutable entity wrappers for liquidity signal computation contracts.
 * All properties are readonly and assigned only through constructor.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type { NetworkPressureType, NetworkPressure } from '../types/network-pressure.types';
import type {
  NetworkLiquiditySignal,
  NetworkLiquidityComputationInput,
  NetworkLiquidityComputationResult,
} from '../types/network-liquidity-calculation.types';

// ============================================================================
// LIQUIDITY SIGNAL INPUT CONTRACT
// ============================================================================

/**
 * CreateNetworkLiquiditySignalInput defines the structure for creating a liquidity signal entity.
 * Contains all required fields for NetworkLiquiditySignal.
 */
export interface CreateNetworkLiquiditySignalInput {
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
// LIQUIDITY SIGNAL ENTITY
// ============================================================================

/**
 * NetworkLiquiditySignalEntity is an immutable wrapper for liquidity signal state.
 * Implements NetworkLiquiditySignal with readonly properties.
 * Properties assigned only through constructor.
 */
export class NetworkLiquiditySignalEntity implements NetworkLiquiditySignal {
  readonly sourcePressureId: string;
  readonly domain: NetworkDomain;
  readonly pressureType: NetworkPressureType;
  readonly partFlowLevel: number;
  readonly serviceCapacityFlowLevel: number;
  readonly regionBalancingFlowLevel: number;
  readonly calculatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(input: CreateNetworkLiquiditySignalInput) {
    this.sourcePressureId = input.sourcePressureId;
    this.domain = input.domain;
    this.pressureType = input.pressureType;
    this.partFlowLevel = input.partFlowLevel;
    this.serviceCapacityFlowLevel = input.serviceCapacityFlowLevel;
    this.regionBalancingFlowLevel = input.regionBalancingFlowLevel;
    this.calculatedAt = input.calculatedAt;
    this.metadata = input.metadata;
  }
}

// ============================================================================
// LIQUIDITY COMPUTATION INPUT CONTRACT
// ============================================================================

/**
 * CreateNetworkLiquidityComputationInput defines the structure for creating a computation input entity.
 * Contains source pressure for liquidity derivation.
 */
export interface CreateNetworkLiquidityComputationInput {
  readonly pressure: NetworkPressure;
}

// ============================================================================
// LIQUIDITY COMPUTATION INPUT ENTITY
// ============================================================================

/**
 * NetworkLiquidityComputationInputEntity is an immutable wrapper for computation inputs.
 * Implements NetworkLiquidityComputationInput with readonly properties.
 * Properties assigned only through constructor.
 */
export class NetworkLiquidityComputationInputEntity
  implements NetworkLiquidityComputationInput
{
  readonly pressure: NetworkPressure;

  constructor(input: CreateNetworkLiquidityComputationInput) {
    this.pressure = input.pressure;
  }
}

// ============================================================================
// LIQUIDITY COMPUTATION RESULT INPUT CONTRACT
// ============================================================================

/**
 * CreateNetworkLiquidityComputationResultInput defines the structure for creating a computation result entity.
 * Uses NetworkLiquiditySignalEntity (entity type) for entity-to-entity consistency.
 */
export interface CreateNetworkLiquidityComputationResultInput {
  readonly signal: NetworkLiquiditySignalEntity;
}

// ============================================================================
// LIQUIDITY COMPUTATION RESULT ENTITY
// ============================================================================

/**
 * NetworkLiquidityComputationResultEntity is an immutable wrapper for computation results.
 * Implements NetworkLiquidityComputationResult with readonly properties.
 * Internally references NetworkLiquiditySignalEntity for entity consistency.
 * Properties assigned only through constructor.
 */
export class NetworkLiquidityComputationResultEntity
  implements NetworkLiquidityComputationResult
{
  readonly signal: NetworkLiquiditySignalEntity;

  constructor(input: CreateNetworkLiquidityComputationResultInput) {
    this.signal = input.signal;
  }
}
