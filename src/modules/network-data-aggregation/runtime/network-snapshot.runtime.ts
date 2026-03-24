/**
 * MOTOR 3 — PHASE 33: SNAPSHOT RUNTIME ENRICHMENT
 * Deterministic Conversion from Complete Pipeline to Enriched NetworkSnapshot
 *
 * Scope:
 * - Runtime logic allowed
 * - Deterministic only
 * - No external calls
 * - No validation
 * - No randomness
 * - No async
 * - No timestamp generation outside provided inputs
 *
 * Purpose:
 * Convert complete network intelligence pipeline (event → pressure → liquidity → decision)
 * into an enriched NetworkSnapshot with full traceability chain, temporal context,
 * and aggregated signal metrics.
 * Uses deterministic snapshot creation with no external dependencies.
 */

import type { NetworkEvent } from '../types/network-event.types';
import type { NetworkPressure } from '../types/network-pressure.types';
import type { NetworkLiquidity } from '../types/network-liquidity.types';
import type { NetworkDecision } from '../types/network-decision.types';
import type { NetworkSnapshot } from '../types/network-snapshot.types';
import { NetworkTemporalWindowType as WindowTypeEnum, NetworkTrendDirection as TrendEnum } from '../types/network-snapshot.types';
import {
  NetworkTraceRefEntity,
  NetworkTemporalContextEntity,
  NetworkAggregatedSignalMetricsEntity,
  NetworkSnapshotEntity,
} from '../entities/network-snapshot.entity';
import { NetworkPressureType } from '../types/network-pressure.types';

// ============================================================================
// SNAPSHOT CREATION RUNTIME
// ============================================================================

/**
 * Convert complete network intelligence pipeline into an enriched NetworkSnapshot.
 * Creates snapshot with full traceability chain, temporal context, and aggregated metrics.
 * Includes deterministic pressure metric aggregation based on pressure type.
 *
 * Pipeline input:
 * - NetworkEvent: originating event
 * - NetworkPressure: detected pressure condition
 * - NetworkLiquidity: derived liquidity status
 * - NetworkDecision: final optimization decision
 *
 * Snapshot captures:
 * - Complete trace reference chain (event → pressure → liquidity → decision)
 * - Domain from decision
 * - Temporal context (single event observation)
 * - Aggregated signal metrics (deterministic from pressure type and magnitude)
 * - Metadata with source types from all pipeline stages
 *
 * @param event NetworkEvent originating the pipeline
 * @param pressure NetworkPressure detected from event
 * @param liquidity NetworkLiquidity derived from pressure
 * @param decision NetworkDecision derived from liquidity
 * @returns NetworkSnapshot contract object
 */
export function createNetworkSnapshot(
  event: NetworkEvent,
  pressure: NetworkPressure,
  liquidity: NetworkLiquidity,
  decision: NetworkDecision
): NetworkSnapshot {
  // Create trace reference entity with complete audit chain
  const traceRef = new NetworkTraceRefEntity({
    sourceEventId: event.networkEventId,
    pressureId: pressure.pressureId,
    liquidityId: liquidity.liquidityId,
    decisionId: decision.decisionId,
  });

  // Create temporal context entity for single-event snapshot observation
  const temporalContext = new NetworkTemporalContextEntity({
    windowType: WindowTypeEnum.SINGLE_EVENT,
    eventCountInWindow: 1,
    signalTrend: TrendEnum.STABLE,
  });

  // Create aggregated signal metrics entity with deterministic pressure-based assignment
  // For single event snapshot: avg = max = min, with values assigned based on pressure type
  const aggregatedSignalMetrics = new NetworkAggregatedSignalMetricsEntity({
    demandPressureAvg: pressure.pressureType === NetworkPressureType.DEMAND_PRESSURE ? pressure.magnitude : 0,
    supplyPressureAvg: pressure.pressureType === NetworkPressureType.SUPPLY_PRESSURE ? pressure.magnitude : 0,
    capacityPressureAvg: pressure.pressureType === NetworkPressureType.CAPACITY_PRESSURE ? pressure.magnitude : 0,
    pricePressureAvg: pressure.pressureType === NetworkPressureType.PRICE_PRESSURE ? pressure.magnitude : 0,
    demandPressureMax: pressure.pressureType === NetworkPressureType.DEMAND_PRESSURE ? pressure.magnitude : 0,
    supplyPressureMax: pressure.pressureType === NetworkPressureType.SUPPLY_PRESSURE ? pressure.magnitude : 0,
    capacityPressureMax: pressure.pressureType === NetworkPressureType.CAPACITY_PRESSURE ? pressure.magnitude : 0,
    pricePressureMax: pressure.pressureType === NetworkPressureType.PRICE_PRESSURE ? pressure.magnitude : 0,
    demandPressureMin: pressure.pressureType === NetworkPressureType.DEMAND_PRESSURE ? pressure.magnitude : 0,
    supplyPressureMin: pressure.pressureType === NetworkPressureType.SUPPLY_PRESSURE ? pressure.magnitude : 0,
    capacityPressureMin: pressure.pressureType === NetworkPressureType.CAPACITY_PRESSURE ? pressure.magnitude : 0,
    pricePressureMin: pressure.pressureType === NetworkPressureType.PRICE_PRESSURE ? pressure.magnitude : 0,
  });

  // Create snapshot entity with all components
  const entity = new NetworkSnapshotEntity({
    snapshotId: `snapshot_${decision.decisionId}`,
    domain: decision.domain,
    traceRef,
    temporalContext,
    aggregatedSignalMetrics,
    createdAt: decision.createdAt,
    metadata: {
      sourceEventType: event.eventType,
      sourcePressureType: pressure.pressureType,
      sourceLiquidityType: liquidity.liquidityType,
      sourceDecisionType: decision.decisionType,
    },
  });

  // Return plain contract object (not entity instance) with all fields
  return {
    snapshotId: entity.snapshotId,
    domain: entity.domain,
    traceRef: {
      sourceEventId: entity.traceRef.sourceEventId,
      pressureId: entity.traceRef.pressureId,
      liquidityId: entity.traceRef.liquidityId,
      decisionId: entity.traceRef.decisionId,
    },
    temporalContext: {
      windowType: entity.temporalContext.windowType,
      eventCountInWindow: entity.temporalContext.eventCountInWindow,
      signalTrend: entity.temporalContext.signalTrend,
    },
    aggregatedSignalMetrics: {
      demandPressureAvg: entity.aggregatedSignalMetrics.demandPressureAvg,
      supplyPressureAvg: entity.aggregatedSignalMetrics.supplyPressureAvg,
      capacityPressureAvg: entity.aggregatedSignalMetrics.capacityPressureAvg,
      pricePressureAvg: entity.aggregatedSignalMetrics.pricePressureAvg,
      demandPressureMax: entity.aggregatedSignalMetrics.demandPressureMax,
      supplyPressureMax: entity.aggregatedSignalMetrics.supplyPressureMax,
      capacityPressureMax: entity.aggregatedSignalMetrics.capacityPressureMax,
      pricePressureMax: entity.aggregatedSignalMetrics.pricePressureMax,
      demandPressureMin: entity.aggregatedSignalMetrics.demandPressureMin,
      supplyPressureMin: entity.aggregatedSignalMetrics.supplyPressureMin,
      capacityPressureMin: entity.aggregatedSignalMetrics.capacityPressureMin,
      pricePressureMin: entity.aggregatedSignalMetrics.pricePressureMin,
    },
    createdAt: entity.createdAt,
    metadata: entity.metadata,
  };
}
