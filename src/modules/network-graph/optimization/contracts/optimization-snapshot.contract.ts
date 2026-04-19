/**
 * Optimization Snapshot Contract
 * Structural language for capturing completed optimization runtime output.
 * Composes optimization input and result as a single portable, audit-readable snapshot.
 * No persistence, no analytics, no recommendations - structural composition only.
 * All identifiers caller-provided only.
 */

import type { OptimizationInput } from "./optimization-input.contract";
import type { OptimizationResult } from "./optimization-result.contract";

/**
 * OptimizationSnapshot
 * Core snapshot of an optimization execution.
 * Captures input → result transformation for portability and auditability.
 * Remains structural: no persistence, no analytics, no recommendation logic.
 * Preserves full traceability to optimization foundation and runtime surfaces.
 * Phase 1 minimal design: identity + input + result only.
 */
export interface OptimizationSnapshot {
  /** Unique snapshot identifier (caller-provided, not generated) */
  readonly snapshotId: string;

  /** The optimization input that was provided to the runtime */
  readonly input: OptimizationInput;

  /** The optimization result produced by the runtime */
  readonly result: OptimizationResult;
}

/**
 * Optimization snapshot behavior:
 * - Snapshot is purely structural: carries snapshotId, input, and result only
 * - Snapshot remains portable: no persistence, no storage bindings
 * - Snapshot preserves traceability: input→result chain is explicit and complete
 * - Snapshot is audit-readable: all data is caller-provided and structurally explicit
 * - Snapshot is analysis-neutral: carries no analytics, scoring, or recommendations
 * - Snapshot is deterministic: same runtime input always produces same snapshot
 * - Snapshot is immutable: all fields are readonly
 * - Phase 1 scope: core carrier only, no audit layering, no metadata overflow
 * 
 * TRACEABILITY (Phase 6 - Deepening):
 * - Snapshot carries complete input for objective/constraint/candidate source traceability
 * - Snapshot input enables trace back from result to original problem definition
 * - Result selectedActions and rejectedCandidates can be traced to source candidates via input
 * - Snapshot-level traceability: input.candidateActions → result.selectedActions/rejectedCandidates
 * - Objective traceability: input.objective defines what was optimized for (single-objective bound)
 * - Constraint traceability: input.constraints defines feasibility rules evaluated against
 * - Candidate traceability: input.candidateActions are the source for all result actions
 * - This enables complete audit reconstruction: what was requested, what was evaluated, what was selected
 */
