/**
 * MOTOR 3 — PHASE 32: SNAPSHOT ENTITY ENRICHMENT
 * Immutable Entity Wrappers for Enriched Snapshot, Trace, Temporal, and Signal Metrics
 *
 * Scope:
 * - Entity layer only
 * - No snapshot generation logic
 * - No runtime behavior
 * - No orchestration
 * - No validation
 * - No helper factories
 * - No ID generation
 * - No timestamp generation
 *
 * Purpose:
 * Encapsulate NetworkTraceRef, NetworkTemporalContext, NetworkAggregatedSignalMetrics,
 * and NetworkSnapshot contracts in immutable entity classes.
 * Mirror contract structures with strict readonly enforcement and entity-to-entity consistency.
 */

import type { NetworkDomain } from '../types/network-foundation.types';
import type {
  NetworkTraceRef,
  NetworkSnapshot,
  NetworkTemporalContext,
  NetworkAggregatedSignalMetrics,
  NetworkTemporalWindowType,
  NetworkTrendDirection,
} from '../types/network-snapshot.types';

// ============================================================================
// CREATE NETWORK TRACE REF INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkTraceRefEntity.
 * Contains all required fields for trace ref entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkTraceRefInput {
  /**
   * Source event identifier.
   */
  readonly sourceEventId: string;

  /**
   * Derived pressure identifier.
   */
  readonly pressureId: string;

  /**
   * Derived liquidity identifier.
   */
  readonly liquidityId: string;

  /**
   * Final decision identifier.
   */
  readonly decisionId: string;
}

// ============================================================================
// NETWORK TRACE REF ENTITY
// ============================================================================

/**
 * Immutable entity representation of trace reference.
 * Wraps NetworkTraceRef contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkTraceRefEntity implements NetworkTraceRef {
  readonly sourceEventId: string;
  readonly pressureId: string;
  readonly liquidityId: string;
  readonly decisionId: string;

  constructor(input: CreateNetworkTraceRefInput) {
    this.sourceEventId = input.sourceEventId;
    this.pressureId = input.pressureId;
    this.liquidityId = input.liquidityId;
    this.decisionId = input.decisionId;
  }
}

// ============================================================================
// CREATE NETWORK TEMPORAL CONTEXT INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkTemporalContextEntity.
 * Contains all required fields for temporal context entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkTemporalContextInput {
  /**
   * Type of temporal window for this snapshot.
   */
  readonly windowType: NetworkTemporalWindowType;

  /**
   * Count of network events aggregated in this snapshot.
   */
  readonly eventCountInWindow: number;

  /**
   * Directional trend of signal metrics over the observation window.
   */
  readonly signalTrend: NetworkTrendDirection;
}

// ============================================================================
// NETWORK TEMPORAL CONTEXT ENTITY
// ============================================================================

/**
 * Immutable entity representation of temporal context.
 * Wraps NetworkTemporalContext contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkTemporalContextEntity implements NetworkTemporalContext {
  readonly windowType: NetworkTemporalWindowType;
  readonly eventCountInWindow: number;
  readonly signalTrend: NetworkTrendDirection;

  constructor(input: CreateNetworkTemporalContextInput) {
    this.windowType = input.windowType;
    this.eventCountInWindow = input.eventCountInWindow;
    this.signalTrend = input.signalTrend;
  }
}

// ============================================================================
// CREATE NETWORK AGGREGATED SIGNAL METRICS INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkAggregatedSignalMetricsEntity.
 * Contains all required fields for aggregated signal metrics entity construction.
 * All fields are immutable in entity representation.
 */
export interface CreateNetworkAggregatedSignalMetricsInput {
  /**
   * Average demand pressure across observation window.
   */
  readonly demandPressureAvg: number;

  /**
   * Average supply pressure across observation window.
   */
  readonly supplyPressureAvg: number;

  /**
   * Average capacity pressure across observation window.
   */
  readonly capacityPressureAvg: number;

  /**
   * Average price pressure across observation window.
   */
  readonly pricePressureAvg: number;

  /**
   * Maximum demand pressure across observation window.
   */
  readonly demandPressureMax: number;

  /**
   * Maximum supply pressure across observation window.
   */
  readonly supplyPressureMax: number;

  /**
   * Maximum capacity pressure across observation window.
   */
  readonly capacityPressureMax: number;

  /**
   * Maximum price pressure across observation window.
   */
  readonly pricePressureMax: number;

  /**
   * Minimum demand pressure across observation window.
   */
  readonly demandPressureMin: number;

  /**
   * Minimum supply pressure across observation window.
   */
  readonly supplyPressureMin: number;

  /**
   * Minimum capacity pressure across observation window.
   */
  readonly capacityPressureMin: number;

  /**
   * Minimum price pressure across observation window.
   */
  readonly pricePressureMin: number;
}

// ============================================================================
// NETWORK AGGREGATED SIGNAL METRICS ENTITY
// ============================================================================

/**
 * Immutable entity representation of aggregated signal metrics.
 * Wraps NetworkAggregatedSignalMetrics contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 */
export class NetworkAggregatedSignalMetricsEntity implements NetworkAggregatedSignalMetrics {
  readonly demandPressureAvg: number;
  readonly supplyPressureAvg: number;
  readonly capacityPressureAvg: number;
  readonly pricePressureAvg: number;
  readonly demandPressureMax: number;
  readonly supplyPressureMax: number;
  readonly capacityPressureMax: number;
  readonly pricePressureMax: number;
  readonly demandPressureMin: number;
  readonly supplyPressureMin: number;
  readonly capacityPressureMin: number;
  readonly pricePressureMin: number;

  constructor(input: CreateNetworkAggregatedSignalMetricsInput) {
    this.demandPressureAvg = input.demandPressureAvg;
    this.supplyPressureAvg = input.supplyPressureAvg;
    this.capacityPressureAvg = input.capacityPressureAvg;
    this.pricePressureAvg = input.pricePressureAvg;
    this.demandPressureMax = input.demandPressureMax;
    this.supplyPressureMax = input.supplyPressureMax;
    this.capacityPressureMax = input.capacityPressureMax;
    this.pricePressureMax = input.pricePressureMax;
    this.demandPressureMin = input.demandPressureMin;
    this.supplyPressureMin = input.supplyPressureMin;
    this.capacityPressureMin = input.capacityPressureMin;
    this.pricePressureMin = input.pricePressureMin;
  }
}

// ============================================================================
// CREATE NETWORK SNAPSHOT INPUT CONTRACT
// ============================================================================

/**
 * Input contract for creating a NetworkSnapshotEntity.
 * Contains all required fields for snapshot entity construction.
 * All fields are immutable in entity representation.
 * Uses entity types for nested structures to maintain entity-to-entity consistency.
 */
export interface CreateNetworkSnapshotInput {
  /**
   * Unique identifier for this snapshot.
   */
  readonly snapshotId: string;

  /**
   * Domain classification for this snapshot.
   */
  readonly domain: NetworkDomain;

  /**
   * Trace reference for complete audit trail.
   */
  readonly traceRef: NetworkTraceRefEntity;

  /**
   * Temporal context for snapshot observation.
   */
  readonly temporalContext: NetworkTemporalContextEntity;

  /**
   * Aggregated signal metrics across observation window.
   */
  readonly aggregatedSignalMetrics: NetworkAggregatedSignalMetricsEntity;

  /**
   * Timestamp when snapshot was created.
   * As ISO 8601 string.
   */
  readonly createdAt: string;

  /**
   * Metadata associated with this snapshot.
   */
  readonly metadata: Readonly<Record<string, unknown>>;
}

// ============================================================================
// NETWORK SNAPSHOT ENTITY
// ============================================================================

/**
 * Immutable entity representation of a network intelligence snapshot.
 * Wraps NetworkSnapshot contract with strict readonly enforcement.
 * Constructor assignment only—no methods, no mutation, no derived fields.
 * Uses entity types internally to maintain entity-to-entity consistency.
 */
export class NetworkSnapshotEntity implements NetworkSnapshot {
  readonly snapshotId: string;
  readonly domain: NetworkDomain;
  readonly traceRef: NetworkTraceRefEntity;
  readonly temporalContext: NetworkTemporalContextEntity;
  readonly aggregatedSignalMetrics: NetworkAggregatedSignalMetricsEntity;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(input: CreateNetworkSnapshotInput) {
    this.snapshotId = input.snapshotId;
    this.domain = input.domain;
    this.traceRef = input.traceRef;
    this.temporalContext = input.temporalContext;
    this.aggregatedSignalMetrics = input.aggregatedSignalMetrics;
    this.createdAt = input.createdAt;
    this.metadata = input.metadata;
  }
}
