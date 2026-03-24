/**
 * MOTOR 3 — PHASE 10: NETWORK LIQUIDITY CONTRACT
 * Type Definitions for Liquidity Modeling
 *
 * Scope:
 * - Type definitions only
 * - No runtime behavior
 * - No liquidity calculation logic
 * - No transfer logic
 * - No orchestration
 * - No factories
 * - No validation
 * - No guards
 *
 * Purpose:
 * Define deterministic liquidity modeling contracts derived from NetworkPressure.
 * Liquidity represents network flow capacity and availability constraints.
 */

import type { NetworkDomain } from './network-foundation.types';

// ============================================================================
// LIQUIDITY TYPE ENUMERATION
// ============================================================================

/**
 * Classifications of liquidity types in the network.
 * Represents different dimensions of flow availability.
 */
export enum NetworkLiquidityType {
  PART_FLOW = 'PART_FLOW',
  SERVICE_CAPACITY_FLOW = 'SERVICE_CAPACITY_FLOW',
  REGION_BALANCING_FLOW = 'REGION_BALANCING_FLOW',
}

// ============================================================================
// LIQUIDITY STATUS ENUMERATION
// ============================================================================

/**
 * Status of liquidity availability in the network.
 * Indicates whether flow is open, constrained, or blocked.
 */
export enum NetworkLiquidityStatus {
  OPEN = 'OPEN',
  CONSTRAINED = 'CONSTRAINED',
  BLOCKED = 'BLOCKED',
}

// ============================================================================
// NETWORK LIQUIDITY CONTRACT
// ============================================================================

/**
 * Represents a detected liquidity condition in the network.
 *
 * Liquidity is a manifestation of flow availability and capacity derived from pressure,
 * representing constraints, opportunities, or bottlenecks that affect
 * network optimization decisions.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkLiquidity {
  /**
   * Unique identifier for this liquidity.
   * Globally unique within the system.
   */
  readonly liquidityId: string;

  /**
   * Source pressure identifier that generated this liquidity.
   * Maintains traceability to originating pressure.
   */
  readonly sourcePressureId: string;

  /**
   * Domain classification for this liquidity.
   * Indicates which business domain the liquidity affects.
   */
  readonly domain: NetworkDomain;

  /**
   * Type of liquidity detected.
   * Classifies the dimension of liquidity flow.
   */
  readonly liquidityType: NetworkLiquidityType;

  /**
   * Status of liquidity availability.
   * Indicates whether flow is open, constrained, or blocked.
   */
  readonly status: NetworkLiquidityStatus;

  /**
   * Flow score of the liquidity.
   * Quantitative measure of flow availability.
   * Range: 0 to 100
   */
  readonly flowScore: number;

  /**
   * Timestamp when liquidity was evaluated.
   * As ISO 8601 string representing evaluation time.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly evaluatedAt: string;

  /**
   * Immutable metadata associated with this liquidity.
   * Contains additional context-specific information.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}
