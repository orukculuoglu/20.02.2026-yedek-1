/**
 * MOTOR 3 — PHASE 40: SNAPSHOT STORAGE INTEGRATION PIPELINE
 * Deterministic Orchestration of Complete Network Intelligence with Storage
 *
 * Scope:
 * - Runtime orchestration allowed
 * - Deterministic only
 * - No external calls
 * - No database
 * - No async
 * - No randomness
 * - No validation
 * - No logging
 *
 * Purpose:
 * Orchestrate the complete Network Intelligence pipeline from NetworkEvent
 * to enriched NetworkSnapshot, verify determinism, store the snapshot,
 * and build an audit result. Returns complete execution and persistence records.
 */

import type { NetworkEvent } from '../types/network-event.types';
import type {
  NetworkPipelineExecutionResult,
  NetworkPipelineDeterminismCheck,
} from '../types/network-pipeline-test.types';
import type {
  NetworkSnapshotStoreWriteResult,
  NetworkSnapshotAuditResult,
} from '../types/network-snapshot-store.types';
import { runDeterminismCheck } from './network-pipeline-test.runtime';
import { storeNetworkSnapshot, buildNetworkSnapshotAuditResult } from './network-snapshot-store.runtime';

// ============================================================================
// STORED NETWORK INTELLIGENCE PIPELINE ORCHESTRATION
// ============================================================================

/**
 * Run complete Network Intelligence pipeline with determinism verification,
 * snapshot storage, and audit result construction.
 *
 * Orchestrates the full chain:
 * 1. Execute pipeline twice and verify deterministic output
 * 2. Store the enriched snapshot
 * 3. Build audit result from stored record
 *
 * Pipeline stages:
 * 1. Detect pressure from event
 * 2. Assess liquidity from pressure
 * 3. Derive decision from liquidity and pressure
 * 4. Create enriched snapshot with traceability and metrics
 * 5. Verify deterministic behavior with second execution
 * 6. Persist snapshot with record metadata
 * 7. Build audit result for query capability
 *
 * @param event NetworkEvent originating the pipeline
 * @returns Object containing execution record, determinism check, stored record, and audit result
 */
export function runStoredNetworkIntelligencePipeline(
  event: NetworkEvent
): {
  execution: NetworkPipelineExecutionResult;
  determinism: NetworkPipelineDeterminismCheck;
  stored: NetworkSnapshotStoreWriteResult;
  audit: NetworkSnapshotAuditResult;
} {
  // Run full pipeline twice and verify deterministic output
  const result = runDeterminismCheck(event);

  // Store the enriched snapshot from first execution
  const stored = storeNetworkSnapshot({ snapshot: result.execution.snapshot });

  // Build audit result from stored record
  const audit = buildNetworkSnapshotAuditResult(stored.record);

  // Return complete execution, determinism verification, storage result, and audit result
  return {
    execution: result.execution,
    determinism: result.determinism,
    stored,
    audit,
  };
}
