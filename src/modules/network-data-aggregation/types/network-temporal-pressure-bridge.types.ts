/**
 * MOTOR 3 — PHASE 47: TEMPORAL PRESSURE BRIDGE CONTRACT
 * Type definitions for NetworkTemporalPressure to NetworkPressure mapping
 *
 * Scope:
 * - Type definitions only
 * - No runtime behavior
 * - No bridge logic
 * - No validation
 * - No guards
 * - No factories
 *
 * Purpose:
 * Define deterministic contracts for bridging NetworkTemporalPressure into
 * core NetworkPressure-compatible mapping structures.
 */

import type { NetworkDomain } from './network-foundation.types';
import type { NetworkPressureType } from './network-pressure.types';
import type {
  NetworkTemporalPressure,
  NetworkTemporalPressureLevel,
} from './network-temporal-pressure.types';

/**
 * Bridge contract mapping NetworkTemporalPressure to NetworkPressure-compatible structure.
 * Represents deterministic mapping of temporal pressure signals into core pressure types.
 *
 * Fields:
 * - bridgeId: Unique identifier for this bridge mapping
 * - temporalPressureId: Reference to source temporal pressure signal
 * - targetPressureId: Generated target pressure identifier for core system
 * - domain: Network domain classification
 * - temporalPressureLevel: Original temporal pressure level classification
 * - mappedPressureType: Target pressure type from core system
 * - mappedMagnitude: 0 to 100 deterministic mapped value (normalized intensity)
 * - createdAt: ISO 8601 timestamp of bridge creation
 * - metadata: Additional contextual information
 */
export interface NetworkTemporalPressureBridge {
  readonly bridgeId: string;
  readonly temporalPressureId: string;
  readonly targetPressureId: string;
  readonly domain: NetworkDomain;
  readonly temporalPressureLevel: NetworkTemporalPressureLevel;
  readonly mappedPressureType: NetworkPressureType;
  readonly mappedMagnitude: number;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Input contract for temporal pressure bridge derivation.
 * Provides NetworkTemporalPressure signal for mapping into core pressure structure.
 *
 * Fields:
 * - temporalPressure: Source temporal pressure signal to bridge
 */
export interface NetworkTemporalPressureBridgeInput {
  readonly temporalPressure: NetworkTemporalPressure;
}

/**
 * Result contract for temporal pressure bridge derivation.
 * Provides mapped bridge structure compatible with core pressure types.
 *
 * Fields:
 * - bridge: Derived temporal pressure bridge mapping
 */
export interface NetworkTemporalPressureBridgeResult {
  readonly bridge: NetworkTemporalPressureBridge;
}
