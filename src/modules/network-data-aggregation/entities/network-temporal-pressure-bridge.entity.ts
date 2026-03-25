/**
 * MOTOR 3 — PHASE 48: TEMPORAL PRESSURE BRIDGE ENTITY
 * Immutable entity structures for temporal pressure bridge contracts
 *
 * Scope:
 * - Entity layer only
 * - No bridge logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Define immutable entity structures that wrap temporal pressure bridge
 * contracts with readonly enforcement.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type { NetworkPressureType } from '../types/network-pressure.types';
import type {
  NetworkTemporalPressure,
  NetworkTemporalPressureLevel,
} from '../types/network-temporal-pressure.types';
import type {
  NetworkTemporalPressureBridge,
  NetworkTemporalPressureBridgeInput,
  NetworkTemporalPressureBridgeResult,
} from '../types/network-temporal-pressure-bridge.types';

// ============================================================================
// INPUT CONTRACTS
// ============================================================================

/**
 * Input contract for NetworkTemporalPressureBridgeEntity construction.
 * Provides all required fields for bridge entity instantiation.
 */
export interface CreateNetworkTemporalPressureBridgeInput {
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
 * Input contract for NetworkTemporalPressureBridgeInputEntity construction.
 * Provides temporal pressure signal for bridge input entity.
 */
export interface CreateNetworkTemporalPressureBridgeInputEntityInput {
  readonly temporalPressure: NetworkTemporalPressure;
}

/**
 * Input contract for NetworkTemporalPressureBridgeResultEntity construction.
 * Provides bridge entity for result wrapping.
 */
export interface CreateNetworkTemporalPressureBridgeResultInput {
  readonly bridge: NetworkTemporalPressureBridgeEntity;
}

// ============================================================================
// ENTITY CLASSES
// ============================================================================

/**
 * Immutable entity implementing NetworkTemporalPressureBridge.
 * Wraps bridge contract with readonly enforcement.
 *
 * Properties:
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
export class NetworkTemporalPressureBridgeEntity
  implements NetworkTemporalPressureBridge
{
  readonly bridgeId: string;
  readonly temporalPressureId: string;
  readonly targetPressureId: string;
  readonly domain: NetworkDomain;
  readonly temporalPressureLevel: NetworkTemporalPressureLevel;
  readonly mappedPressureType: NetworkPressureType;
  readonly mappedMagnitude: number;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(input: CreateNetworkTemporalPressureBridgeInput) {
    this.bridgeId = input.bridgeId;
    this.temporalPressureId = input.temporalPressureId;
    this.targetPressureId = input.targetPressureId;
    this.domain = input.domain;
    this.temporalPressureLevel = input.temporalPressureLevel;
    this.mappedPressureType = input.mappedPressureType;
    this.mappedMagnitude = input.mappedMagnitude;
    this.createdAt = input.createdAt;
    this.metadata = input.metadata;
  }
}

/**
 * Immutable entity implementing NetworkTemporalPressureBridgeInput.
 * Wraps bridge input contract with readonly enforcement.
 *
 * Properties:
 * - temporalPressure: Source temporal pressure signal to bridge
 */
export class NetworkTemporalPressureBridgeInputEntity
  implements NetworkTemporalPressureBridgeInput
{
  readonly temporalPressure: NetworkTemporalPressure;

  constructor(input: CreateNetworkTemporalPressureBridgeInputEntityInput) {
    this.temporalPressure = input.temporalPressure;
  }
}

/**
 * Immutable entity implementing NetworkTemporalPressureBridgeResult.
 * Wraps bridge result contract with readonly enforcement.
 * Stores NetworkTemporalPressureBridgeEntity internally.
 *
 * Properties:
 * - bridge: Derived temporal pressure bridge mapping
 */
export class NetworkTemporalPressureBridgeResultEntity
  implements NetworkTemporalPressureBridgeResult
{
  readonly bridge: NetworkTemporalPressureBridgeEntity;

  constructor(input: CreateNetworkTemporalPressureBridgeResultInput) {
    this.bridge = input.bridge;
  }
}
