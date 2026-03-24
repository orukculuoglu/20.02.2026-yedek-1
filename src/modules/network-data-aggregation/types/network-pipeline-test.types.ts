/**
 * MOTOR 3 — PHASE 35: END-TO-END DETERMINISTIC TEST CONTRACT
 * Type Definitions for Pipeline Execution Records and Test Contracts
 *
 * Scope:
 * - Type definitions only
 * - No runtime behavior
 * - No test execution logic
 * - No validation
 * - No guards
 * - No factories
 *
 * Purpose:
 * Define contracts for tracking pipeline execution records, execution results,
 * and determinism verification across the full Network Intelligence pipeline.
 * Provides immutable structures for test assertions and closure validation.
 */

import type { NetworkSnapshot } from './network-snapshot.types';

// ============================================================================
// NETWORK PIPELINE EXECUTION RECORD
// ============================================================================

/**
 * Record of identifiers from a single pipeline execution.
 * Captures the complete chain of IDs through all pipeline stages.
 *
 * Fields:
 * - eventId: Identifier from source NetworkEvent
 * - pressureId: Identifier from derived NetworkPressure
 * - liquidityId: Identifier from derived NetworkLiquidity
 * - decisionId: Identifier from derived NetworkDecision
 * - snapshotId: Identifier from generated NetworkSnapshot
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkPipelineExecutionRecord {
  /**
   * Source event identifier.
   * Root of the pipeline chain.
   */
  readonly eventId: string;

  /**
   * Pressure identifier from event detection.
   * First derived identifier in the chain.
   */
  readonly pressureId: string;

  /**
   * Liquidity identifier from pressure assessment.
   * Second derived identifier in the chain.
   */
  readonly liquidityId: string;

  /**
   * Decision identifier from liquidity evaluation.
   * Third derived identifier in the chain.
   */
  readonly decisionId: string;

  /**
   * Snapshot identifier from complete pipeline.
   * Final closure identifier containing full trace.
   */
  readonly snapshotId: string;
}

// ============================================================================
// NETWORK PIPELINE EXECUTION RESULT
// ============================================================================

/**
 * Complete result of a single pipeline execution.
 * Captures both the execution record and the enriched snapshot output.
 *
 * Fields:
 * - record: Execution record with all chain identifiers
 * - snapshot: Enriched NetworkSnapshot with traceability and metrics
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkPipelineExecutionResult {
  /**
   * Execution record containing all identifiers from the pipeline run.
   * Provides quick access to the chain of IDs without traversing snapshot.
   */
  readonly record: NetworkPipelineExecutionRecord;

  /**
   * Enriched network snapshot from the pipeline.
   * Contains full traceability, temporal context, and aggregated metrics.
   */
  readonly snapshot: NetworkSnapshot;
}

// ============================================================================
// NETWORK PIPELINE DETERMINISM CHECK
// ============================================================================

/**
 * Result of determinism verification for identical pipeline executions.
 * Compares two separate executions of the same event to verify deterministic behavior.
 *
 * Fields:
 * - firstSnapshotId: Snapshot ID from first execution
 * - secondSnapshotId: Snapshot ID from second execution
 * - isDeterministic: Boolean flag indicating if both executions produced same results
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkPipelineDeterminismCheck {
  /**
   * Snapshot identifier from first execution.
   * Serves as baseline for determinism comparison.
   */
  readonly firstSnapshotId: string;

  /**
   * Snapshot identifier from second execution.
   * Compared against first execution for deterministic equivalence.
   */
  readonly secondSnapshotId: string;

  /**
   * Determinism verification result.
   * True if both executions produced identical snapshot IDs and structure.
   * False if any deviation detected in deterministic chain.
   */
  readonly isDeterministic: boolean;
}
