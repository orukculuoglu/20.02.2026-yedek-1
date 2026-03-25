/**
 * MOTOR 3 — PHASE 45: TEMPORAL PRESSURE ENTITY
 * Immutable Entity Wrappers for Temporal Pressure and Derivation Contracts
 *
 * Scope:
 * - Entity layer only
 * - No aggregation logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Encapsulate NetworkTemporalPressure, NetworkTemporalPressureInput,
 * and NetworkTemporalPressureResult contracts in immutable entity classes.
 * Mirror contract structures with strict readonly enforcement.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type { NetworkTrendDirection } from '../types/network-snapshot.types';
import type {
  NetworkTemporalPressureLevel,
  NetworkTemporalPressure,
  NetworkTemporalPressureInput,
  NetworkTemporalPressureResult,
} from '../types/network-temporal-pressure.types';

// ============================================================================
// CREATE NETWORK TEMPORAL PRESSURE INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkTemporalPressureEntity.
 * Contains all required fields for temporal pressure entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkTemporalPressureInput {
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
   */
  readonly pressureLevel: NetworkTemporalPressureLevel;

  /**
   * Timestamp when temporal pressure was created.
   */
  readonly createdAt: string;
}

// ============================================================================
// NETWORK TEMPORAL PRESSURE ENTITY
// ============================================================================

/**
 * Immutable entity representation of a temporal pressure.
 * Wraps NetworkTemporalPressure contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkTemporalPressureEntity implements NetworkTemporalPressure {
  readonly temporalPressureId: string;
  readonly windowId: string;
  readonly domain: NetworkDomain;
  readonly eventCount: number;
  readonly trendDirection: NetworkTrendDirection;
  readonly pressureLevel: NetworkTemporalPressureLevel;
  readonly createdAt: string;

  constructor(input: CreateNetworkTemporalPressureInput) {
    this.temporalPressureId = input.temporalPressureId;
    this.windowId = input.windowId;
    this.domain = input.domain;
    this.eventCount = input.eventCount;
    this.trendDirection = input.trendDirection;
    this.pressureLevel = input.pressureLevel;
    this.createdAt = input.createdAt;
  }
}

// ============================================================================
// CREATE NETWORK TEMPORAL PRESSURE INPUT ENTITY INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkTemporalPressureInputEntity.
 * Contains all required fields for pressure input entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkTemporalPressureInputEntityInput {
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
   * Timestamp for pressure creation.
   */
  readonly createdAt: string;
}

// ============================================================================
// NETWORK TEMPORAL PRESSURE INPUT ENTITY
// ============================================================================

/**
 * Immutable entity representation of a temporal pressure input.
 * Wraps NetworkTemporalPressureInput contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkTemporalPressureInputEntity implements NetworkTemporalPressureInput {
  readonly windowId: string;
  readonly domain: NetworkDomain;
  readonly eventCount: number;
  readonly trendDirection: NetworkTrendDirection;
  readonly createdAt: string;

  constructor(input: CreateNetworkTemporalPressureInputEntityInput) {
    this.windowId = input.windowId;
    this.domain = input.domain;
    this.eventCount = input.eventCount;
    this.trendDirection = input.trendDirection;
    this.createdAt = input.createdAt;
  }
}

// ============================================================================
// CREATE NETWORK TEMPORAL PRESSURE RESULT INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkTemporalPressureResultEntity.
 * Contains all required fields for pressure result entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkTemporalPressureResultInput {
  /**
   * Derived temporal pressure signal.
   */
  readonly pressure: NetworkTemporalPressureEntity;
}

// ============================================================================
// NETWORK TEMPORAL PRESSURE RESULT ENTITY
// ============================================================================

/**
 * Immutable entity representation of a temporal pressure result.
 * Wraps NetworkTemporalPressureResult contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 * Stores NetworkTemporalPressureEntity internally for entity-to-entity consistency.
 */
export class NetworkTemporalPressureResultEntity implements NetworkTemporalPressureResult {
  readonly pressure: NetworkTemporalPressureEntity;

  constructor(input: CreateNetworkTemporalPressureResultInput) {
    this.pressure = input.pressure;
  }
}
