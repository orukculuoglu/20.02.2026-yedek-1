/**
 * MOTOR 3 — PHASE 7: NETWORK PRESSURE CONTRACT
 * Type Definitions for Pressure Modeling
 *
 * Scope:
 * - Type definitions only
 * - No pressure calculation logic
 * - No runtime behavior
 * - No factories
 * - No validation
 * - No orchestration
 *
 * Purpose:
 * Define deterministic pressure modeling contracts derived from NetworkEvent.
 * Pressure represents network conditions that affect optimization decisions.
 */

import type { NetworkDomain } from './network-foundation.types';

// ============================================================================
// PRESSURE TYPE ENUMERATION
// ============================================================================

/**
 * Classifications of pressure types in the network.
 * Represents different dimensions of pressure that affect operations.
 */
export enum NetworkPressureType {
  DEMAND_PRESSURE = 'DEMAND_PRESSURE',
  SUPPLY_PRESSURE = 'SUPPLY_PRESSURE',
  CAPACITY_PRESSURE = 'CAPACITY_PRESSURE',
  PRICE_PRESSURE = 'PRICE_PRESSURE',
}

// ============================================================================
// PRESSURE DIRECTION ENUMERATION
// ============================================================================

/**
 * Direction of pressure movement in the network.
 * Indicates whether pressure is increasing, decreasing, or stable.
 */
export enum NetworkPressureDirection {
  INCREASING = 'INCREASING',
  DECREASING = 'DECREASING',
  STABLE = 'STABLE',
}

// ============================================================================
// NETWORK PRESSURE CONTRACT
// ============================================================================

/**
 * Represents a detected pressure condition in the network.
 *
 * Pressure is a manifestation of network conditions derived from events,
 * representing constraints, demands, or opportunities that affect
 * network optimization decisions.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkPressure {
  /**
   * Unique identifier for this pressure.
   * Globally unique within the system.
   */
  readonly pressureId: string;

  /**
   * Source event identifier that generated this pressure.
   * Maintains traceability to originating event.
   */
  readonly sourceEventId: string;

  /**
   * Domain classification for this pressure.
   * Indicates which business domain the pressure affects.
   */
  readonly domain: NetworkDomain;

  /**
   * Type of pressure detected.
   * Classifies the dimension of pressure.
   */
  readonly pressureType: NetworkPressureType;

  /**
   * Direction of pressure movement.
   * Indicates whether pressure is increasing, decreasing, or stable.
   */
  readonly direction: NetworkPressureDirection;

  /**
   * Magnitude of the pressure.
   * Quantitative measure of pressure strength.
   * Range: 0 to 100
   */
  readonly magnitude: number;

  /**
   * Timestamp when pressure was detected.
   * As ISO 8601 string representing detection time.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly detectedAt: string;

  /**
   * Immutable metadata associated with this pressure.
   * Contains additional context-specific information.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}
