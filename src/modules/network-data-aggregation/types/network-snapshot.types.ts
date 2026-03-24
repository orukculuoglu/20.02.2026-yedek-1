/**
 * MOTOR 3 — PHASE 16: SNAPSHOT / TRACE CONTRACT
 * Type Definitions for Snapshot and Trace Modeling
 *
 * Scope:
 * - Type definitions only
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No guards
 * - No factories
 *
 * Purpose:
 * Define snapshot and trace contracts for network intelligence auditing.
 * Snapshot captures complete traceability chain through event → pressure → liquidity → decision pipeline.
 */

import type { NetworkDomain } from './network-foundation.types';

// ============================================================================
// NETWORK TRACE REFERENCE
// ============================================================================

/**
 * Trace reference for complete network intelligence chain.
 *
 * Maintains traceability from initial event through all derived insights
 * to final decision. Each reference is required, ensuring complete audit trail.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkTraceRef {
  /**
   * Source event identifier.
   * Root of the network intelligence chain.
   */
  readonly sourceEventId: string;

  /**
   * Derived pressure identifier.
   * Pressure detected from the source event.
   */
  readonly pressureId: string;

  /**
   * Derived liquidity identifier.
   * Liquidity condition derived from the pressure.
   */
  readonly liquidityId: string;

  /**
   * Final decision identifier.
   * Decision derived from the liquidity condition.
   */
  readonly decisionId: string;
}

// ============================================================================
// NETWORK SNAPSHOT
// ============================================================================

/**
 * Represents a snapshot of network intelligence state.
 *
 * Snapshot captures the complete network intelligence pipeline output,
 * including full traceability chain and domain context.
 * Provides point-in-time immutable view of network conditions and recommendations.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkSnapshot {
  /**
   * Unique identifier for this snapshot.
   * Globally unique within the system.
   */
  readonly snapshotId: string;

  /**
   * Domain classification for this snapshot.
   * Indicates which business domain the snapshot applies to.
   */
  readonly domain: NetworkDomain;

  /**
   * Trace reference for complete audit trail.
   * Maintains full traceability through event → pressure → liquidity → decision pipeline.
   */
  readonly traceRef: NetworkTraceRef;

  /**
   * Timestamp when snapshot was created.
   * As ISO 8601 string representing snapshot time.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly createdAt: string;

  /**
   * Immutable metadata associated with this snapshot.
   * Contains additional context-specific information.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}
