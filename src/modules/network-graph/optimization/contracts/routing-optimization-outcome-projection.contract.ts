/**
 * Routing Optimization Outcome Projection Contract
 * Domain-specific projection of OptimizationExecutionOutcome for routing context.
 * Exposes routing-specific selected/rejected action views with audit trace.
 * No analytics, no reporting, no persistence - structural projection only.
 */

import type { SelectedAction } from "./selected-action.contract";
import type { RejectedCandidateAction } from "./rejected-candidate-action.contract";
import type { OptimizationAudit } from "./optimization-audit.contract";

/**
 * RoutingOptimizationOutcomeProjection
 * Domain-specific projection of an optimization execution outcome in routing context.
 * Exposes routing-bounded selected actions, rejected candidates, and audit trace.
 * Remains structural: no metrics, no analytics, no derived fields.
 */
export interface RoutingOptimizationOutcomeProjection {
  /** Selected routing actions from the optimization result */
  readonly selectedRoutingActions: readonly SelectedAction[];

  /** Rejected routing candidates from the optimization result */
  readonly rejectedRoutingCandidates: readonly RejectedCandidateAction[];

  /** Routing optimization audit traces (selected/rejected action traceability) */
  readonly routingAudit: OptimizationAudit;
}

/**
 * Routing outcome projection behavior:
 * - Projection is purely structural: exposes bounded action/candidate views
 * - Projection remains domain-explicit: routing boundary is clear
 * - Projection preserves traceability: audit chain remains intact
 * - Projection carries no analytics: no scoring, confidence, or metrics
 * - Projection carries no persistence: no storage bindings or reporting
 * - Projection carries no recommendations: no decision flags or policy evaluation
 * - Projection is deterministic: same outcome always produces same projection
 * - Projection is immutable: all fields are readonly
 * 
 * TRACEABILITY PRESERVATION (Phase 6 - Deepening):
 * - Projection carries shared OptimizationExecutionOutcome as foundation (implicit)
 * - Projection exposes routing-bounded view: selectedRoutingActions, rejectedRoutingCandidates
 * - Projection carries full routingAudit: selected/rejected action traces with source references
 * - Audit traces carry sourceCandidateId + rejectionKind for explicit traceability
 * - Caller can reconstruct full trace chain from projection + underlying outcome
 * - No traceability loss in projection: audit maintains all caller-provided references
 * - Domain boundary remains clean: routing-specific view, shared outcome foundation
 */
