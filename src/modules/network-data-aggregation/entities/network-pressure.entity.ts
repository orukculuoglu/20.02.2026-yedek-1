/**
 * MOTOR 3 — PHASE 8: NETWORK PRESSURE ENTITY
 * Immutable Entity Wrapper for Pressure Modeling
 *
 * Scope:
 * - Entity layer only
 * - No pressure calculation logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Encapsulate NetworkPressure contract in an immutable entity class.
 * Mirror contract structure with strict readonly enforcement.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type {
  NetworkPressure,
  NetworkPressureType,
  NetworkPressureDirection,
} from '../types/network-pressure.types';

// ============================================================================
// CREATE NETWORK PRESSURE INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkPressureEntity.
 * Contains all required fields for pressure entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkPressureInput {
  /**
   * Unique identifier for this pressure.
   */
  readonly pressureId: string;

  /**
   * Source event identifier that generated this pressure.
   */
  readonly sourceEventId: string;

  /**
   * Domain classification for this pressure.
   */
  readonly domain: NetworkDomain;

  /**
   * Type of pressure detected.
   */
  readonly pressureType: NetworkPressureType;

  /**
   * Direction of pressure movement.
   */
  readonly direction: NetworkPressureDirection;

  /**
   * Magnitude of the pressure.
   * Range: 0 to 100
   */
  readonly magnitude: number;

  /**
   * Timestamp when pressure was detected.
   * As ISO 8601 string.
   */
  readonly detectedAt: string;

  /**
   * Metadata associated with this pressure.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// NETWORK PRESSURE ENTITY
// ============================================================================

/**
 * Immutable entity representation of a detected pressure condition.
 * Wraps NetworkPressure contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkPressureEntity implements NetworkPressure {
  readonly pressureId: string;
  readonly sourceEventId: string;
  readonly domain: NetworkDomain;
  readonly pressureType: NetworkPressureType;
  readonly direction: NetworkPressureDirection;
  readonly magnitude: number;
  readonly detectedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(input: CreateNetworkPressureInput) {
    this.pressureId = input.pressureId;
    this.sourceEventId = input.sourceEventId;
    this.domain = input.domain;
    this.pressureType = input.pressureType;
    this.direction = input.direction;
    this.magnitude = input.magnitude;
    this.detectedAt = input.detectedAt;
    this.metadata = input.metadata;
  }
}
