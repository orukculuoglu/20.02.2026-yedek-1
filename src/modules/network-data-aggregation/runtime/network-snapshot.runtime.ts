/**
 * MOTOR 3 — PHASE 18: SNAPSHOT RUNTIME
 * Deterministic Conversion from Complete Pipeline to NetworkSnapshot
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
 * into a NetworkSnapshot with full traceability chain.
 * Uses deterministic snapshot creation with no external dependencies.
 */

import type { NetworkEvent } from '../types/network-event.types';
import type { NetworkPressure } from '../types/network-pressure.types';
import type { NetworkLiquidity } from '../types/network-liquidity.types';
import type { NetworkDecision } from '../types/network-decision.types';
import type { NetworkSnapshot } from '../types/network-snapshot.types';
import {
  NetworkTraceRefEntity,
  NetworkSnapshotEntity,
} from '../entities/network-snapshot.entity';

// ============================================================================
// SNAPSHOT CREATION RUNTIME
// ============================================================================

/**
 * Convert complete network intelligence pipeline into a NetworkSnapshot.
 * Creates snapshot with full traceability chain through all pipeline stages.
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

  // Create snapshot entity with trace and domain context
  const entity = new NetworkSnapshotEntity({
    snapshotId: `snapshot_${decision.decisionId}`,
    domain: decision.domain,
    traceRef,
    createdAt: decision.createdAt,
    metadata: {
      sourceEventType: event.eventType,
      sourcePressureType: pressure.pressureType,
      sourceLiquidityType: liquidity.liquidityType,
      sourceDecisionType: decision.decisionType,
    },
  });

  // Return plain contract object, not entity instance
  return {
    snapshotId: entity.snapshotId,
    domain: entity.domain,
    traceRef: {
      sourceEventId: entity.traceRef.sourceEventId,
      pressureId: entity.traceRef.pressureId,
      liquidityId: entity.traceRef.liquidityId,
      decisionId: entity.traceRef.decisionId,
    },
    createdAt: entity.createdAt,
    metadata: entity.metadata,
  };
}
