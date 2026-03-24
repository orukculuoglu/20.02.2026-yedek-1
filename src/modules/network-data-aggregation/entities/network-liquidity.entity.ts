/**
 * MOTOR 3 — PHASE 11: NETWORK LIQUIDITY ENTITY
 * Immutable Entity Wrapper for Liquidity Modeling
 *
 * Scope:
 * - Entity layer only
 * - No liquidity calculation logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Encapsulate NetworkLiquidity contract in an immutable entity class.
 * Mirror contract structure with strict readonly enforcement.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type {
  NetworkLiquidity,
  NetworkLiquidityType,
  NetworkLiquidityStatus,
} from '../types/network-liquidity.types';

// ============================================================================
// CREATE NETWORK LIQUIDITY INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkLiquidityEntity.
 * Contains all required fields for liquidity entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkLiquidityInput {
  /**
   * Unique identifier for this liquidity.
   */
  readonly liquidityId: string;

  /**
   * Source pressure identifier that generated this liquidity.
   */
  readonly sourcePressureId: string;

  /**
   * Domain classification for this liquidity.
   */
  readonly domain: NetworkDomain;

  /**
   * Type of liquidity detected.
   */
  readonly liquidityType: NetworkLiquidityType;

  /**
   * Status of liquidity availability.
   */
  readonly status: NetworkLiquidityStatus;

  /**
   * Flow score of the liquidity.
   * Range: 0 to 100
   */
  readonly flowScore: number;

  /**
   * Timestamp when liquidity was evaluated.
   * As ISO 8601 string.
   */
  readonly evaluatedAt: string;

  /**
   * Metadata associated with this liquidity.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// NETWORK LIQUIDITY ENTITY
// ============================================================================

/**
 * Immutable entity representation of a detected liquidity condition.
 * Wraps NetworkLiquidity contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkLiquidityEntity implements NetworkLiquidity {
  readonly liquidityId: string;
  readonly sourcePressureId: string;
  readonly domain: NetworkDomain;
  readonly liquidityType: NetworkLiquidityType;
  readonly status: NetworkLiquidityStatus;
  readonly flowScore: number;
  readonly evaluatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(input: CreateNetworkLiquidityInput) {
    this.liquidityId = input.liquidityId;
    this.sourcePressureId = input.sourcePressureId;
    this.domain = input.domain;
    this.liquidityType = input.liquidityType;
    this.status = input.status;
    this.flowScore = input.flowScore;
    this.evaluatedAt = input.evaluatedAt;
    this.metadata = input.metadata;
  }
}
