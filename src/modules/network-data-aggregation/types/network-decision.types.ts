/**
 * MOTOR 3 — PHASE 13: NETWORK DECISION CONTRACT
 * Type Definitions for Decision Modeling
 *
 * Scope:
 * - Type definitions only
 * - No runtime behavior
 * - No recommendation logic
 * - No orchestration
 * - No factories
 * - No validation
 * - No guards
 *
 * Purpose:
 * Define deterministic decision modeling contracts derived from NetworkLiquidity.
 * Decision represents actionable recommendations that optimize network conditions.
 */

import type { NetworkDomain } from './network-foundation.types';

// ============================================================================
// DECISION TYPE ENUMERATION
// ============================================================================

/**
 * Classifications of decision types in the network.
 * Represents different dimensions of actionable optimization.
 */
export enum NetworkDecisionType {
  REDIRECT_SERVICE = 'REDIRECT_SERVICE',
  INCREASE_STOCK = 'INCREASE_STOCK',
  REBALANCE_REGION = 'REBALANCE_REGION',
  HOLD_POSITION = 'HOLD_POSITION',
}

// ============================================================================
// DECISION PRIORITY ENUMERATION
// ============================================================================

/**
 * Priority levels for decision execution in the network.
 * Indicates the urgency and importance of decision implementation.
 */
export enum NetworkDecisionPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// ============================================================================
// NETWORK DECISION CONTRACT
// ============================================================================

/**
 * Represents a detected decision opportunity in the network.
 *
 * Decision is a manifestation of optimization opportunity derived from liquidity,
 * representing actionable recommendations that improve network conditions
 * and support strategic optimization.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkDecision {
  /**
   * Unique identifier for this decision.
   * Globally unique within the system.
   */
  readonly decisionId: string;

  /**
   * Source liquidity identifier that generated this decision.
   * Maintains traceability to originating liquidity.
   */
  readonly sourceLiquidityId: string;

  /**
   * Source pressure identifier for this decision.
   * Maintains traceability through the network intelligence chain.
   */
  readonly sourcePressureId: string;

  /**
   * Domain classification for this decision.
   * Indicates which business domain the decision affects.
   */
  readonly domain: NetworkDomain;

  /**
   * Type of decision action.
   * Classifies the dimension of optimization.
   */
  readonly decisionType: NetworkDecisionType;

  /**
   * Priority level of decision execution.
   * Indicates urgency and importance of implementation.
   */
  readonly priority: NetworkDecisionPriority;

  /**
   * Timestamp when decision was created.
   * As ISO 8601 string representing creation time.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly createdAt: string;

  /**
   * Rationale for this decision.
   * Narrative explanation of the optimization opportunity.
   */
  readonly rationale: string;

  /**
   * Immutable metadata associated with this decision.
   * Contains additional context-specific information.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}
