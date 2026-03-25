/**
 * MOTOR 3 — PHASE 36: DETERMINISM RUNTIME
 * Deterministic Verification of Full Network Intelligence Pipeline
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
 * Execute the full Network Intelligence pipeline twice for the same event
 * and verify that outputs are deterministic.
 * Captures execution records and determinism verification results.
 */

import type { NetworkEvent } from '../types/network-event.types';
import type {
  NetworkPipelineExecutionRecord,
  NetworkPipelineExecutionResult,
  NetworkPipelineDeterminismCheck,
} from '../types/network-pipeline-test.types';
import { runNetworkIntelligencePipeline } from './network-intelligence.pipeline';

// ============================================================================
// DETERMINISM VERIFICATION RUNTIME
// ============================================================================

/**
 * Run full Network Intelligence pipeline twice for the same event
 * and verify deterministic output.
 *
 * Executes pipeline twice in sequence and compares snapshot IDs
 * to verify that the deterministic chain produces identical results.
 *
 * Returns:
 * - execution: NetworkPipelineExecutionResult with record and first snapshot
 * - determinism: NetworkPipelineDeterminismCheck comparing both executions
 *
 * @param event NetworkEvent to process through the pipeline
 * @returns Object containing execution result and determinism verification
 */
export function runDeterminismCheck(
  event: NetworkEvent
): {
  execution: NetworkPipelineExecutionResult;
  determinism: NetworkPipelineDeterminismCheck;
} {
  // Run pipeline first time
  const firstSnapshot = runNetworkIntelligencePipeline(event);

  // Run pipeline second time with same event
  const secondSnapshot = runNetworkIntelligencePipeline(event);

  // Create execution record from first pipeline execution
  const executionRecord: NetworkPipelineExecutionRecord = {
    eventId: event.networkEventId,
    pressureId: firstSnapshot.traceRef.pressureId,
    liquidityId: firstSnapshot.traceRef.liquidityId,
    decisionId: firstSnapshot.traceRef.decisionId,
    snapshotId: firstSnapshot.snapshotId,
  };

  // Create execution result with record and snapshot
  const executionResult: NetworkPipelineExecutionResult = {
    record: executionRecord,
    snapshot: firstSnapshot,
  };

  // Create determinism check comparing both executions
  const determinismCheck: NetworkPipelineDeterminismCheck = {
    firstSnapshotId: firstSnapshot.snapshotId,
    secondSnapshotId: secondSnapshot.snapshotId,
    isDeterministic: firstSnapshot.snapshotId === secondSnapshot.snapshotId,
  };

  // Return both execution result and determinism verification
  return {
    execution: executionResult,
    determinism: determinismCheck,
  };
}
