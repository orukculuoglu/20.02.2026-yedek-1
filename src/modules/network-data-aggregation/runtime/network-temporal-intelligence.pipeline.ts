/**
 * MOTOR 3 — PHASE 50: WINDOW-BASED INTELLIGENCE PIPELINE
 * Deterministic Orchestration Pipeline for Temporal Intelligence Chain
 *
 * Scope:
 * - Runtime/orchestration allowed
 * - Deterministic only
 * - No external calls
 * - No database
 * - No async
 * - No randomness
 * - No validation
 * - No logging
 *
 * Purpose:
 * Create a deterministic orchestration pipeline for Motor 3 V2 that runs the
 * temporal intelligence chain from multiple events to temporal pressure bridge output.
 */

import type {
  NetworkWindowAggregationInput,
  NetworkWindowAggregationResult,
} from '../types/network-temporal-window.types';
import type { NetworkTemporalPressureResult } from '../types/network-temporal-pressure.types';
import type { NetworkTemporalPressureBridgeResult } from '../types/network-temporal-pressure-bridge.types';
import { aggregateNetworkEventWindow } from './network-temporal-window.runtime';
import { deriveTemporalPressure } from './network-temporal-pressure.runtime';
import { mapTemporalPressureToBridge } from './network-temporal-pressure-bridge.runtime';

// ============================================================================
// TEMPORAL INTELLIGENCE PIPELINE ORCHESTRATION
// ============================================================================

/**
 * Run deterministic temporal network intelligence pipeline.
 * Orchestrates the complete Motor 3 V2 chain from event window aggregation
 * through temporal pressure derivation to pressure bridge mapping.
 *
 * Pipeline Steps:
 * 1. Aggregate multiple events into temporal window
 * 2. Derive temporal pressure from window
 * 3. Map temporal pressure to core pressure bridge
 *
 * Processing:
 * - Input: NetworkWindowAggregationInput (events, domain, window params)
 * - Step 1: aggregateNetworkEventWindow(input) → window
 * - Step 2: deriveTemporalPressure(window.window) → temporalPressure
 * - Step 3: mapTemporalPressureToBridge(temporalPressure.pressure) → bridge
 * - Return: {window, temporalPressure, bridge}
 *
 * Deterministic: No branching, no retries, no mutation, no external calls.
 *
 * @param input NetworkWindowAggregationInput with events and window parameters
 * @returns Object containing aggregated window, derived temporal pressure, and bridge mapping
 */
export function runTemporalNetworkIntelligencePipeline(
  input: NetworkWindowAggregationInput
): {
  window: NetworkWindowAggregationResult;
  temporalPressure: NetworkTemporalPressureResult;
  bridge: NetworkTemporalPressureBridgeResult;
} {
  const window = aggregateNetworkEventWindow(input);
  const temporalPressure = deriveTemporalPressure(window.window);
  const bridge = mapTemporalPressureToBridge(temporalPressure.pressure);

  return {
    window,
    temporalPressure,
    bridge,
  };
}
