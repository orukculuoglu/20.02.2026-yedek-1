/**
 * MOTOR 3 — PHASE 31: SNAPSHOT ENRICHMENT CONTRACT
 * Type Definitions for Snapshot Enrichment, Temporal Context, and Aggregated Signal Metrics
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
 * Define enriched snapshot contracts for network intelligence auditing.
 * Snapshot captures full traceability chain together with temporal context
 * and aggregated signal metrics.
 */

import type { NetworkDomain } from './network-foundation.types';

// ============================================================================
// TEMPORAL CONTEXT ENUMERATION
// ============================================================================

/**
 * Classification of temporal window context for snapshot.
 * Indicates the scope of events aggregated in this snapshot.
 */
export enum NetworkTemporalWindowType {
  /**
   * Snapshot based on a single event observation.
   */
  SINGLE_EVENT = 'SINGLE_EVENT',

  /**
   * Snapshot based on aggregation of recent events within a time window.
   */
  RECENT_WINDOW = 'RECENT_WINDOW',
}

// ============================================================================
// TREND DIRECTION ENUMERATION
// ============================================================================

/**
 * Classification of signal trend direction.
 * Indicates the directional movement of aggregated metrics.
 */
export enum NetworkTrendDirection {
  /**
   * Metrics are increasing over the observation period.
   */
  INCREASING = 'INCREASING',

  /**
   * Metrics are decreasing over the observation period.
   */
  DECREASING = 'DECREASING',

  /**
   * Metrics are stable with minimal variation.
   */
  STABLE = 'STABLE',
}

// ============================================================================
// TEMPORAL CONTEXT
// ============================================================================

/**
 * Temporal context for snapshot observation.
 * Provides information about the time window and event aggregation scope.
 *
 * Fields:
 * - windowType: Classification of temporal observation window
 * - eventCountInWindow: Number of events aggregated in this snapshot
 * - signalTrend: Directional trend of aggregated signal metrics
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkTemporalContext {
  /**
   * Type of temporal window for this snapshot.
   * Indicates whether based on single event or aggregated window.
   */
  readonly windowType: NetworkTemporalWindowType;

  /**
   * Count of network events aggregated in this snapshot.
   * For SINGLE_EVENT: always 1.
   * For RECENT_WINDOW: count of events within aggregation window.
   */
  readonly eventCountInWindow: number;

  /**
   * Directional trend of signal metrics over the observation window.
   * Indicates general movement of pressure conditions.
   */
  readonly signalTrend: NetworkTrendDirection;
}

// ============================================================================
// AGGREGATED SIGNAL METRICS
// ============================================================================

/**
 * Aggregated pressure signal metrics across observation window.
 * Provides statistical summary of pressure conditions.
 *
 * All metric values are on 0 to 100 scale representing normalized pressure magnitudes.
 * Includes average, maximum, and minimum for each pressure type dimension.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkAggregatedSignalMetrics {
  /**
   * Average demand pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly demandPressureAvg: number;

  /**
   * Average supply pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly supplyPressureAvg: number;

  /**
   * Average capacity pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly capacityPressureAvg: number;

  /**
   * Average price pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly pricePressureAvg: number;

  /**
   * Maximum demand pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly demandPressureMax: number;

  /**
   * Maximum supply pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly supplyPressureMax: number;

  /**
   * Maximum capacity pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly capacityPressureMax: number;

  /**
   * Maximum price pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly pricePressureMax: number;

  /**
   * Minimum demand pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly demandPressureMin: number;

  /**
   * Minimum supply pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly supplyPressureMin: number;

  /**
   * Minimum capacity pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly capacityPressureMin: number;

  /**
   * Minimum price pressure across observation window.
   * Numeric value: 0 to 100, deterministic aggregate metric.
   */
  readonly pricePressureMin: number;
}

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
 * including full traceability chain, domain context, temporal context,
 * and aggregated signal metrics.
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
   * Temporal context for snapshot observation.
   * Provides information about time window and event aggregation scope.
   */
  readonly temporalContext: NetworkTemporalContext;

  /**
   * Aggregated signal metrics across observation window.
   * Provides statistical summary of pressure conditions.
   */
  readonly aggregatedSignalMetrics: NetworkAggregatedSignalMetrics;

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
