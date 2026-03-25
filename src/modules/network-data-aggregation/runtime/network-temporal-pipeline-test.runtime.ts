/**
 * MOTOR 3 — PHASE 52: V2 TEMPORAL DETERMINISM RUNTIME
 * Deterministic Verification of Temporal Intelligence Pipeline
 *
 * Scope:
 * - Runtime logic allowed
 * - Deterministic only
 * - No external calls
 * - No randomness
 * - No async
 * - No validation library
 * - No logging side effects
 *
 * Purpose:
 * Create a deterministic runtime that executes the temporal intelligence pipeline
 * twice for the same window input and verifies deterministic output.
 * Ensures that the same input always produces identical IDs across multiple executions.
 */

import type { NetworkWindowAggregationInput } from '../types/network-temporal-window.types';
import { runTemporalNetworkIntelligencePipeline } from './network-temporal-intelligence.pipeline';

// ============================================================================
// TEMPORAL PIPELINE DETERMINISM CHECK
// ============================================================================

/**
 * Run temporal network intelligence pipeline twice and verify determinism.
 * Executes the pipeline with identical input and compares critical IDs
 * for strict equality to ensure deterministic behavior.
 *
 * Processing:
 * - Execute pipeline first time with input
 * - Execute pipeline second time with identical input
 * - Extract windowId, temporalPressureId, bridgeId from first execution
 * - Extract windowId, temporalPressureId, bridgeId from second execution
 * - Compare all IDs for strict equality
 * - Return results with determinism verification
 *
 * Deterministic: No randomness, no mutation, no external calls, pure computation.
 *
 * @param input NetworkWindowAggregationInput with events and window parameters
 * @returns Object containing first execution IDs, second execution IDs, and determinism flag
 */
export function runTemporalDeterminismCheck(
  input: NetworkWindowAggregationInput
): {
  first: {
    windowId: string;
    temporalPressureId: string;
    bridgeId: string;
  };
  second: {
    windowId: string;
    temporalPressureId: string;
    bridgeId: string;
  };
  isDeterministic: boolean;
} {
  // Execute pipeline first time
  const firstExecution = runTemporalNetworkIntelligencePipeline(input);

  // Execute pipeline second time with identical input
  const secondExecution = runTemporalNetworkIntelligencePipeline(input);

  // Extract IDs from first execution
  const firstWindowId = firstExecution.window.window.windowId;
  const firstTemporalPressureId = firstExecution.temporalPressure.pressure.temporalPressureId;
  const firstBridgeId = firstExecution.bridge.bridge.bridgeId;

  // Extract IDs from second execution
  const secondWindowId = secondExecution.window.window.windowId;
  const secondTemporalPressureId = secondExecution.temporalPressure.pressure.temporalPressureId;
  const secondBridgeId = secondExecution.bridge.bridge.bridgeId;

  // Determine if outputs are deterministic by strict equality of all IDs
  const isDeterministic =
    firstWindowId === secondWindowId &&
    firstTemporalPressureId === secondTemporalPressureId &&
    firstBridgeId === secondBridgeId;

  // Return results with determinism verification
  return {
    first: {
      windowId: firstWindowId,
      temporalPressureId: firstTemporalPressureId,
      bridgeId: firstBridgeId,
    },
    second: {
      windowId: secondWindowId,
      temporalPressureId: secondTemporalPressureId,
      bridgeId: secondBridgeId,
    },
    isDeterministic,
  };
}
