/**
 * Optimization Snapshot Builder Contract
 * Deterministic boundary that composes OptimizationSnapshot and OptimizationAudit
 * into a single OptimizationExecutionOutcome for portability and caller consumption.
 * No persistence, no analytics, no recommendations - structural composition only.
 * All identifiers caller-provided only.
 */

import type { OptimizationSnapshot } from "./optimization-snapshot.contract";
import type { OptimizationAudit, OptimizationExecutionOutcome } from "./optimization-audit.contract";

/**
 * OptimizationSnapshotBuilderInput
 * Explicit input to the snapshot builder.
 * Carries pre-built snapshot and audit for composition into execution outcome.
 * Both snapshot and audit must be caller-provided and complete.
 */
export interface OptimizationSnapshotBuilderInput {
  /** Complete optimization snapshot (optimization input → result transformation) */
  readonly snapshot: OptimizationSnapshot;

  /** Complete optimization audit (selected/rejected action traces) */
  readonly audit: OptimizationAudit;
}

/**
 * OptimizationSnapshotBuilder
 * Deterministic builder boundary that composes snapshot and audit.
 * Takes OptimizationSnapshotBuilderInput and produces OptimizationExecutionOutcome.
 * Remains structural: no ID generation, no mutation, no analytics.
 */
export interface OptimizationSnapshotBuilder {
  /**
   * Build an OptimizationExecutionOutcome from snapshot and audit.
   * @param input OptimizationSnapshotBuilderInput with snapshot and audit
   * @returns OptimizationExecutionOutcome composed from snapshot + audit
   * 
   * Deterministic guarantee: Same input always produces same output.
   * Immutability guarantee: Input objects are not mutated.
   * Structural guarantee: No derived analytics or summaries are added.
   */
  build(input: OptimizationSnapshotBuilderInput): OptimizationExecutionOutcome;
}

/**
 * Optimization snapshot builder behavior:
 * - Builder is purely structural: composes snapshot and audit only
 * - Builder remains deterministic: same input always produces same output
 * - Builder preserves immutability: input snapshot and audit are never mutated
 * - Builder produces OptimizationExecutionOutcome: explicit outcome surface
 * - Builder carries no analytics: no scoring, confidence, or derived metrics
 * - Builder carries no persistence: no storage bindings or reporting engines
 * - Builder carries no recommendations: no decision flags or policy evaluation
 * - Builder is immutable: interface defines a pure transformation
 * - Phase 3 scope: deterministic composition boundary only
 */
