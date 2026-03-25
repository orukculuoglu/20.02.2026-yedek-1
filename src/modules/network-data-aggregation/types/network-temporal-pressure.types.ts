/**
 * MOTOR 3 — PHASE 44: TEMPORAL PRESSURE CONTRACT
 * Type Definitions for Window-Based Pressure Derivation
 *
 * Scope:
 * - Type definitions only
 * - No runtime behavior
 * - No pressure calculation logic
 * - No validation
 * - No guards
 * - No factories
 *
 * Purpose:
 * Define contracts for deriving pressure signals from aggregated temporal windows.
 * Represents the transition from single-event pressure to multi-event intensity-based pressure.
 * Provides immutable structures for window-derived pressure signals.
 */

import type { NetworkDomain } from './network-foundation.types';
import type { NetworkTrendDirection } from './network-snapshot.types';

// ============================================================================
// NETWORK TEMPORAL PRESSURE
// ============================================================================

/**
 * Represents pressure derived from a temporal event window.
 * Encapsulates intensity and directional signals computed from aggregated events.
 *
 * Fields:
 * - temporalPressureId: Unique identifier for this temporal pressure
 * - windowId: Reference to source NetworkEventWindow
 * - domain: Domain classification
 * - eventCount: Number of events in the window
 * - trendDirection: Direction of signal change within the window
 * - pressureLevel: Derived pressure classification
 * - createdAt: Timestamp when temporal pressure was derived
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkTemporalPressure {
  /**
   * Unique identifier for this temporal pressure.
   */
  readonly temporalPressureId: string;

  /**
   * Reference to source event window.
   */
  readonly windowId: string;

  /**
   * Domain classification.
   */
  readonly domain: NetworkDomain;

  /**
   * Number of events in the source window.
   */
  readonly eventCount: number;

  /**
   * Direction of signal change.
   */
  readonly trendDirection: NetworkTrendDirection;

  /**
   * Derived pressure level classification.
   * Represents intensity of network conditions.
   */
  readonly pressureLevel: NetworkTemporalPressureLevel;

  /**
   * Timestamp when temporal pressure was created.
   * ISO 8601 format.
   */
  readonly createdAt: string;
}

// ============================================================================
// NETWORK TEMPORAL PRESSURE LEVEL ENUM
// ============================================================================

/**
 * Classification of pressure intensity derived from temporal window.
 *
 * Levels:
 * - LOW: Minimal activity
 * - MEDIUM: Moderate activity
 * - HIGH: Significant activity
 * - CRITICAL: Extreme activity
 */
export enum NetworkTemporalPressureLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// ============================================================================
// NETWORK TEMPORAL PRESSURE INPUT
// ============================================================================

/**
 * Input contract for deriving temporal pressure.
 * Specifies required window-based signals.
 *
 * Fields:
 * - windowId: Source window identifier
 * - domain: Domain classification
 * - eventCount: Number of events in window
 * - trendDirection: Direction of change
 * - createdAt: Timestamp for pressure creation
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkTemporalPressureInput {
  readonly windowId: string;
  readonly domain: NetworkDomain;
  readonly eventCount: number;
  readonly trendDirection: NetworkTrendDirection;
  readonly createdAt: string;
}

// ============================================================================
// NETWORK TEMPORAL PRESSURE RESULT
// ============================================================================

/**
 * Result of temporal pressure derivation.
 * Contains derived temporal pressure signal.
 *
 * Fields:
 * - pressure: NetworkTemporalPressure
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkTemporalPressureResult {
  readonly pressure: NetworkTemporalPressure;
}
