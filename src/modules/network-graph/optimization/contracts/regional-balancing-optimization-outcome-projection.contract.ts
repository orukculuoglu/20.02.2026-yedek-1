/**
 * Regional Balancing Optimization Outcome Projection Contract
 * Domain-specific projection of OptimizationExecutionOutcome for regional balancing context.
 * Exposes regional-balancing-specific selected/rejected action views with audit trace.
 * No analytics, no reporting, no persistence - structural projection only.
 */

import type { SelectedAction } from "./selected-action.contract";
import type { RejectedCandidateAction } from "./rejected-candidate-action.contract";
import type { OptimizationAudit } from "./optimization-audit.contract";

/**
 * RegionalBalancingOptimizationOutcomeProjection
 * Domain-specific projection of an optimization execution outcome in regional balancing context.
 * Exposes regional-balancing-bounded selected actions, rejected candidates, and audit trace.
 * Remains structural: no metrics, no analytics, no derived fields.
 */
export interface RegionalBalancingOptimizationOutcomeProjection {
  /** Selected regional balancing actions from the optimization result */
  readonly selectedRegionalBalancingActions: readonly SelectedAction[];

  /** Rejected regional balancing candidates from the optimization result */
  readonly rejectedRegionalBalancingCandidates: readonly RejectedCandidateAction[];

  /** Regional balancing optimization audit traces (selected/rejected action traceability) */
  readonly regionalBalancingAudit: OptimizationAudit;
}

/**
 * Regional balancing outcome projection behavior:
 * - Projection is purely structural: exposes bounded action/candidate views
 * - Projection remains domain-explicit: regional balancing boundary is clear
 * - Projection preserves traceability: audit chain remains intact
 * - Projection carries no analytics: no scoring, confidence, or metrics
 * - Projection carries no persistence: no storage bindings or reporting
 * - Projection carries no recommendations: no decision flags or policy evaluation
 * - Projection is deterministic: same outcome always produces same projection
 * - Projection is immutable: all fields are readonly
 * 
 * TRACEABILITY PRESERVATION (Phase 6 - Deepening):
 * - Projection carries shared OptimizationExecutionOutcome as foundation (implicit)
 * - Projection exposes regional-balancing-bounded view: selectedRegionalBalancingActions, rejectedRegionalBalancingCandidates
 * - Projection carries full regionalBalancingAudit: selected/rejected action traces with source references
 * - Audit traces carry sourceCandidateId + rejectionKind for explicit traceability
 * - Caller can reconstruct full trace chain from projection + underlying outcome
 * - No traceability loss in projection: audit maintains all caller-provided references
 * - Domain boundary remains clean: regional-balancing-specific view, shared outcome foundation
 */
