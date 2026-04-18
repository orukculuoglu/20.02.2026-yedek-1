/**
 * Deterministic Optimization Snapshot Builder
 * Concrete implementation of OptimizationSnapshotBuilder.
 * Composes OptimizationSnapshot and OptimizationAudit into OptimizationExecutionOutcome.
 * No ID generation, no mutation, no analytics - pure structural composition.
 */

import type { OptimizationSnapshotBuilder, OptimizationSnapshotBuilderInput } from "../contracts/optimization-snapshot-builder.contract";
import type { OptimizationExecutionOutcome } from "../contracts/optimization-audit.contract";

/**
 * deterministicOptimizationSnapshotBuilder
 * Deterministic constant service that builds OptimizationExecutionOutcome.
 * Composes pre-built OptimizationSnapshot and OptimizationAudit into final outcome.
 * 
 * Behavior:
 * - Deterministic: same input always produces same output
 * - Immutable: input snapshot and audit are never mutated
 * - Structural: no ID generation, no analytics, no derived fields
 * - Pure: no side effects, no state mutation
 */
export const deterministicOptimizationSnapshotBuilder: OptimizationSnapshotBuilder = {
  build(input: OptimizationSnapshotBuilderInput): OptimizationExecutionOutcome {
    return {
      snapshot: input.snapshot,
      audit: input.audit,
    };
  },
};
