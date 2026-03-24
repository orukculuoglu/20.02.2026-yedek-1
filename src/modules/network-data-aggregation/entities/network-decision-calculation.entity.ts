/**
 * MOTOR 3 — PHASE 28: DECISION CALCULATION ENTITY
 * Immutable Entity Structures for Decision Signal Computation
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
 * Provide immutable entity wrappers for decision signal computation contracts.
 * All properties are readonly and assigned only through constructor.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type { NetworkLiquidity } from '../types/network-liquidity.types';
import type { NetworkPressure } from '../types/network-pressure.types';
import type {
  NetworkDecisionSignal,
  NetworkDecisionComputationInput,
  NetworkDecisionComputationResult,
} from '../types/network-decision-calculation.types';

// ============================================================================
// DECISION SIGNAL INPUT CONTRACT
// ============================================================================

/**
 * CreateNetworkDecisionSignalInput defines the structure for creating a decision signal entity.
 * Contains all required fields for NetworkDecisionSignal.
 */
export interface CreateNetworkDecisionSignalInput {
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
// DECISION SIGNAL ENTITY
// ============================================================================

/**
 * NetworkDecisionSignalEntity is an immutable wrapper for decision signal state.
 * Implements NetworkDecisionSignal with readonly properties.
 * Properties assigned only through constructor.
 */
export class NetworkDecisionSignalEntity implements NetworkDecisionSignal {
  readonly sourceLiquidityId: string;
  readonly sourcePressureId: string;
  readonly domain: NetworkDomain;
  readonly redirectServiceLevel: number;
  readonly increaseStockLevel: number;
  readonly rebalanceRegionLevel: number;
  readonly holdPositionLevel: number;
  readonly calculatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(input: CreateNetworkDecisionSignalInput) {
    this.sourceLiquidityId = input.sourceLiquidityId;
    this.sourcePressureId = input.sourcePressureId;
    this.domain = input.domain;
    this.redirectServiceLevel = input.redirectServiceLevel;
    this.increaseStockLevel = input.increaseStockLevel;
    this.rebalanceRegionLevel = input.rebalanceRegionLevel;
    this.holdPositionLevel = input.holdPositionLevel;
    this.calculatedAt = input.calculatedAt;
    this.metadata = input.metadata;
  }
}

// ============================================================================
// DECISION COMPUTATION INPUT CONTRACT
// ============================================================================

/**
 * CreateNetworkDecisionComputationInput defines the structure for creating a computation input entity.
 * Contains source liquidity and pressure for decision derivation.
 */
export interface CreateNetworkDecisionComputationInput {
  readonly liquidity: NetworkLiquidity;
  readonly pressure: NetworkPressure;
}

// ============================================================================
// DECISION COMPUTATION INPUT ENTITY
// ============================================================================

/**
 * NetworkDecisionComputationInputEntity is an immutable wrapper for computation inputs.
 * Implements NetworkDecisionComputationInput with readonly properties.
 * Properties assigned only through constructor.
 */
export class NetworkDecisionComputationInputEntity
  implements NetworkDecisionComputationInput
{
  readonly liquidity: NetworkLiquidity;
  readonly pressure: NetworkPressure;

  constructor(input: CreateNetworkDecisionComputationInput) {
    this.liquidity = input.liquidity;
    this.pressure = input.pressure;
  }
}

// ============================================================================
// DECISION COMPUTATION RESULT INPUT CONTRACT
// ============================================================================

/**
 * CreateNetworkDecisionComputationResultInput defines the structure for creating a computation result entity.
 * Uses NetworkDecisionSignalEntity (entity type) for entity-to-entity consistency.
 */
export interface CreateNetworkDecisionComputationResultInput {
  readonly signal: NetworkDecisionSignalEntity;
}

// ============================================================================
// DECISION COMPUTATION RESULT ENTITY
// ============================================================================

/**
 * NetworkDecisionComputationResultEntity is an immutable wrapper for computation results.
 * Implements NetworkDecisionComputationResult with readonly properties.
 * Internally references NetworkDecisionSignalEntity for entity consistency.
 * Properties assigned only through constructor.
 */
export class NetworkDecisionComputationResultEntity
  implements NetworkDecisionComputationResult
{
  readonly signal: NetworkDecisionSignalEntity;

  constructor(input: CreateNetworkDecisionComputationResultInput) {
    this.signal = input.signal;
  }
}
