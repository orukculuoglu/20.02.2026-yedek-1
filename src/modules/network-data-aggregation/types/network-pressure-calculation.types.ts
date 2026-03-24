/**
 * MOTOR 3 — PHASE 19: PRESSURE CALCULATION CONTRACT
 * Type Definitions for Pressure Signal Computation
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
 * Define contracts for deterministic pressure signal computational pipeline.
 * Pressure signals represent numeric quantification of network conditions.
 */

import type { NetworkDomain, NetworkEventType } from './network-foundation.types';
import type { NetworkEvent } from './network-event.types';

// ============================================================================
// NETWORK PRESSURE SIGNAL
// ============================================================================

/**
 * Represents computed pressure signal values from a network event.
 *
 * Pressure signal quantifies network conditions across four dimensions:
 * demand, supply, capacity, and price. Each dimension ranges 0-100,
 * providing numeric input for downstream pressure detection and analysis.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkPressureSignal {
  /**
   * Source event identifier.
   * Maintains traceability to originating event.
   */
  readonly sourceEventId: string;

  /**
   * Domain classification for this signal.
   * Indicates which business domain the signal applies to.
   */
  readonly domain: NetworkDomain;

  /**
   * Event type that generated this signal.
   * Indicates the source event classification.
   */
  readonly eventType: NetworkEventType;

  /**
   * Demand level signal value.
   * Numeric quantification of demand pressure.
   * Range: 0 to 100
   */
  readonly demandLevel: number;

  /**
   * Supply level signal value.
   * Numeric quantification of supply pressure.
   * Range: 0 to 100
   */
  readonly supplyLevel: number;

  /**
   * Capacity level signal value.
   * Numeric quantification of capacity pressure.
   * Range: 0 to 100
   */
  readonly capacityLevel: number;

  /**
   * Price level signal value.
   * Numeric quantification of price pressure.
   * Range: 0 to 100
   */
  readonly priceLevel: number;

  /**
   * Timestamp when signal was calculated.
   * As ISO 8601 string representing calculation time.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly calculatedAt: string;

  /**
   * Immutable metadata associated with this signal.
   * Contains additional context-specific information.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// NETWORK PRESSURE COMPUTATION INPUT
// ============================================================================

/**
 * Input contract for pressure signal computation.
 *
 * Provides the source event data from which pressure signals are derived.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkPressureComputationInput {
  /**
   * Source network event.
   * Contains event data used for pressure signal calculation.
   */
  readonly event: NetworkEvent;
}

// ============================================================================
// NETWORK PRESSURE COMPUTATION RESULT
// ============================================================================

/**
 * Output contract for pressure signal computation.
 *
 * Contains the computed pressure signal with all numeric levels.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkPressureComputationResult {
  /**
   * Computed pressure signal.
   * Contains all pressure level values and source context.
   */
  readonly signal: NetworkPressureSignal;
}
