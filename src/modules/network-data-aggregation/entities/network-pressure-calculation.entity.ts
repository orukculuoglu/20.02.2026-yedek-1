/**
 * MOTOR 3 — PHASE 20: PRESSURE CALCULATION ENTITY
 * Immutable Entity Wrappers for Pressure Signal Computation
 *
 * Scope:
 * - Entity layer only
 * - No calculation logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Encapsulate pressure signal computation contracts in immutable entity classes.
 * Mirror contract structures with strict readonly enforcement.
 */

import type { NetworkDomain, NetworkEventType } from '../types/network-foundation.types';
import type { NetworkEvent } from '../types/network-event.types';
import type {
  NetworkPressureSignal,
  NetworkPressureComputationInput,
  NetworkPressureComputationResult,
} from '../types/network-pressure-calculation.types';

// ============================================================================
// CREATE NETWORK PRESSURE SIGNAL INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkPressureSignalEntity.
 * Contains all required fields for pressure signal entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkPressureSignalInput {
  /**
   * Source event identifier.
   */
  readonly sourceEventId: string;

  /**
   * Domain classification for this signal.
   */
  readonly domain: NetworkDomain;

  /**
   * Event type that generated this signal.
   */
  readonly eventType: NetworkEventType;

  /**
   * Demand level signal value.
   */
  readonly demandLevel: number;

  /**
   * Supply level signal value.
   */
  readonly supplyLevel: number;

  /**
   * Capacity level signal value.
   */
  readonly capacityLevel: number;

  /**
   * Price level signal value.
   */
  readonly priceLevel: number;

  /**
   * Timestamp when signal was calculated.
   * As ISO 8601 string.
   */
  readonly calculatedAt: string;

  /**
   * Metadata associated with this signal.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// NETWORK PRESSURE SIGNAL ENTITY
// ============================================================================

/**
 * Immutable entity representation of pressure signal.
 * Wraps NetworkPressureSignal contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkPressureSignalEntity implements NetworkPressureSignal {
  readonly sourceEventId: string;
  readonly domain: NetworkDomain;
  readonly eventType: NetworkEventType;
  readonly demandLevel: number;
  readonly supplyLevel: number;
  readonly capacityLevel: number;
  readonly priceLevel: number;
  readonly calculatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(input: CreateNetworkPressureSignalInput) {
    this.sourceEventId = input.sourceEventId;
    this.domain = input.domain;
    this.eventType = input.eventType;
    this.demandLevel = input.demandLevel;
    this.supplyLevel = input.supplyLevel;
    this.capacityLevel = input.capacityLevel;
    this.priceLevel = input.priceLevel;
    this.calculatedAt = input.calculatedAt;
    this.metadata = input.metadata;
  }
}

// ============================================================================
// CREATE NETWORK PRESSURE COMPUTATION INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkPressureComputationInputEntity.
 * Contains all required fields for computation input entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkPressureComputationInput {
  /**
   * Source network event.
   */
  readonly event: NetworkEvent;
}

// ============================================================================
// NETWORK PRESSURE COMPUTATION INPUT ENTITY
// ============================================================================

/**
 * Immutable entity representation of pressure computation input.
 * Wraps NetworkPressureComputationInput contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkPressureComputationInputEntity implements NetworkPressureComputationInput {
  readonly event: NetworkEvent;

  constructor(input: CreateNetworkPressureComputationInput) {
    this.event = input.event;
  }
}

// ============================================================================
// CREATE NETWORK PRESSURE COMPUTATION RESULT INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkPressureComputationResultEntity.
 * Contains all required fields for computation result entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkPressureComputationResultInput {
  /**
   * Computed pressure signal.
   */
  readonly signal: NetworkPressureSignalEntity;
}

// ============================================================================
// NETWORK PRESSURE COMPUTATION RESULT ENTITY
// ============================================================================

/**
 * Immutable entity representation of pressure computation result.
 * Wraps NetworkPressureComputationResult contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkPressureComputationResultEntity implements NetworkPressureComputationResult {
  readonly signal: NetworkPressureSignalEntity;

  constructor(input: CreateNetworkPressureComputationResultInput) {
    this.signal = input.signal;
  }
}
