/**
 * Optimization Audit Contract
 * Structural language for capturing optimization execution audit data.
 * Composes OptimizationSnapshot with explicit selected/rejected action traces.
 * No persistence, no analytics, no recommendations - audit-only structural surface.
 * All identifiers caller-provided only.
 */

import type { OptimizationSnapshot } from "./optimization-snapshot.contract";

/**
 * SelectedActionAuditTrace
 * Audit-readable trace for a selected action in the optimization result.
 * Links selected action to its selection decision through caller-provided trace identifiers.
 * Remains structural: no scoring, confidence, or decision logic in audit.
 * 
 * TRACEABILITY (Phase 6 - Deepening):
 * - selectedActionId: explicit reference to SelectedAction in result
 * - sourceCandidateId: optional explicit reference to source candidate (caller-provided for trace depth)
 * - sourceFeasibleId: optional explicit reference to feasible action stage (caller-provided for trace depth)
 * - selectionTraceId: optional trace reference to selection decision
 * - Complete trace chain: candidate → feasible → selected via IDs
 * - Allows audit to verify full selection path without ambiguity
 */
export interface SelectedActionAuditTrace {
  /** Reference to the selected action ID from the optimization result */
  readonly selectedActionId: string;

  /** Optional reference to source candidate ID (caller-provided for explicit traceability) */
  readonly sourceCandidateId?: string;

  /** Optional reference to source feasible action ID (caller-provided for explicit traceability) */
  readonly sourceFeasibleId?: string;

  /** Optional trace reference to selection decision (caller-provided) */
  readonly selectionTraceId?: string;
}

/**
 * RejectedCandidateAuditTrace
 * Audit-readable trace for a rejected action in the optimization result.
 * Links rejected action to its feasibility evaluation through caller-provided trace identifiers.
 * Remains structural: no severity scoring, policy override, or policy outcome in audit.
 * 
 * TRACEABILITY (Phase 6 - Deepening):
 * - rejectedActionId: explicit reference to RejectedCandidateAction in result
 * - sourceCandidateId: explicit reference to source candidate ID (from source candidateActions)
 * - rejectionKind: explicit reason for rejection (from result, e.g., feasibility_violated)
 * - feasibilityEvaluationTraceId: optional trace reference to feasibility evaluation
 * - Complete trace chain: candidate → feasibility evaluation → rejection
 * - Allows audit to verify rejection rationale without ambiguity
 * - Distinguishes rejected (failed feasibility) from non-selected-feasible (passed but not chosen)
 */
export interface RejectedCandidateAuditTrace {
  /** Reference to the rejected action ID from the optimization result */
  readonly rejectedActionId: string;

  /** Explicit reference to source candidate ID (from input.candidateActions) */
  readonly sourceCandidateId: string;

  /** Explicit rejection reason (from result RejectedCandidateAction.rejectionKind) */
  readonly rejectionKind: "feasibility_violated";

  /** Optional trace reference to feasibility evaluation (caller-provided) */
  readonly feasibilityEvaluationTraceId?: string;
}

/**
 * OptimizationAudit
 * Complete structural audit trace of an optimization execution.
 * Captures selected and rejected action traces for outcome transparency.
 * Composes with OptimizationSnapshot to provide full execution visibility.
 * Remains structural: no persistence, no analytics, no recommendations.
 * All trace identifiers are caller-provided for maximum portability.
 */
export interface OptimizationAudit {
  /** Unique audit identifier (caller-provided, not generated) */
  readonly auditId: string;

  /** Reference to the snapshot this audit traces (caller-provided snapshot ID) */
  readonly snapshotId: string;

  /** Selected action audit traces with caller-provided trace references */
  readonly selectedActionTraces: readonly SelectedActionAuditTrace[];

  /** Rejected action audit traces with caller-provided trace references */
  readonly rejectedCandidateTraces: readonly RejectedCandidateAuditTrace[];

  /** Optional orchestration trace reference (caller-provided) */
  readonly orchestrationTraceId?: string;
}

/**
 * OptimizationExecutionOutcome
 * Complete execution outcome: optimization snapshot + audit traces.
 * Composes snapshot and audit for full transparency of optimization result and its evaluation.
 * Caller-readable and transportable without persistence bindings or analytics overlays.
 * Remains structural-only: snapshot carries what was requested and produced,
 * audit carries selected/rejected action traceability without adding business semantics.
 */
export interface OptimizationExecutionOutcome {
  /** The optimization snapshot (optimization input → result transformation) */
  readonly snapshot: OptimizationSnapshot;

  /** The optimization audit traces (selected/rejected action transparency) */
  readonly audit: OptimizationAudit;
}

/**
 * Optimization audit behavior:
 * - Audit is purely structural: carries auditId, snapshotId, and action traces only
 * - Audit remains portable: no persistence, no storage bindings, no reporting engines
 * - Audit preserves traceability: selected/rejected action chain is explicit and complete
 * - Audit is caller-readable: all trace identifiers are caller-provided, not generated
 * - Audit is analysis-neutral: carries no scoring, confidence, severity, or policy evaluation
 * - Audit is deterministic: same runtime output always produces same audit structure
 * - Audit is immutable: all fields are readonly
 * - Phase 2 scope: structural audit surface only, no execution history, no analytics
 * - Rejected action IDs align with result contract naming for unambiguous traceability
 * - Execution outcome bridges snapshot and audit: caller receives complete picture
 * 
 * TRACEABILITY DEEPENING (Phase 6):
 * - Audit structure now carries explicit source references for deeper traceability
 * - SelectedActionAuditTrace carries sourceCandidateId + sourceFeasibleId (caller-provided)
 * - RejectedCandidateAuditTrace carries sourceCandidateId + rejectionKind (explicit)
 * - Complete audit-level traceability: candidate → feasible/rejected → selected chain
 * - Snapshot + Audit combination enables full reconstruction of optimization path
 * - Audit does NOT add analytics: no scoring, metrics, or recommendation fields
 * - Audit does NOT add policy semantics: rejectionKind is feasibility-only (not policy override)
 * - Audit is immutable: all trace fields are readonly, caller-provided only
 */
