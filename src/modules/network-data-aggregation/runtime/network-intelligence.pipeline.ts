/**
 * MOTOR 3 — PHASE 34: SNAPSHOT INTEGRATION PIPELINE
 * Deterministic Orchestration of Complete Network Intelligence Chain
 *
 * Scope:
 * - Runtime orchestration allowed
 * - Deterministic only
 * - No external calls
 * - No validation
 * - No randomness
 * - No async
 *
 * Purpose:
 * Orchestrate the complete Network Intelligence pipeline from NetworkEvent to NetworkSnapshot.
 * Runs the deterministic chain: event → pressure → liquidity → decision → snapshot.
 * Returns enriched snapshot with full traceability and aggregated metrics.
 */

import type { NetworkEvent } from '../types/network-event.types';
import type { NetworkSnapshot } from '../types/network-snapshot.types';
import { createNetworkPressure } from './network-pressure.runtime';
import { createNetworkLiquidity } from './network-liquidity.runtime';
import { createNetworkDecision } from './network-decision.runtime';
import { createNetworkSnapshot } from './network-snapshot.runtime';

// ============================================================================
// NETWORK INTELLIGENCE PIPELINE ORCHESTRATION
// ============================================================================

/**
 * Run complete Network Intelligence pipeline from event to enriched snapshot.
 * Orchestrates deterministic chain: event → pressure → liquidity → decision → snapshot.
 *
 * Pipeline stages:
 * 1. Detect pressure from event
 * 2. Assess liquidity from pressure
 * 3. Derive decision from liquidity and pressure
 * 4. Create enriched snapshot with traceability, temporal context, and metrics
 *
 * @param event NetworkEvent originating the pipeline
 * @returns NetworkSnapshot enriched with trace, temporal context, and aggregated metrics
 */
export function runNetworkIntelligencePipeline(event: NetworkEvent): NetworkSnapshot {
  const pressure = createNetworkPressure(event);
  const liquidity = createNetworkLiquidity(pressure);
  const decision = createNetworkDecision(liquidity, pressure);
  const snapshot = createNetworkSnapshot(event, pressure, liquidity, decision);
  return snapshot;
}
