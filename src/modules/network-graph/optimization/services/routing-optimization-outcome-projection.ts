/**
 * Routing Optimization Outcome Projection Service
 * Deterministic projection of OptimizationExecutionOutcome for routing context.
 * Extracts routing-specific selected/rejected actions and audit from outcome.
 * No analytics, no mutations - pure structural projection.
 */

import type { OptimizationExecutionOutcome } from "../contracts/optimization-audit.contract";
import type { RoutingOptimizationOutcomeProjection } from "../contracts/routing-optimization-outcome-projection.contract";

/**
 * routingOptimizationOutcomeProjection
 * Deterministic service that projects OptimizationExecutionOutcome into routing domain.
 * Extracts and exposes routing-bounded selected actions, rejected candidates, and audit.
 * 
 * Behavior:
 * - Deterministic: same outcome always produces same projection
 * - Immutable: input outcome is never mutated
 * - Structural: extracts key parts without transformation or analytics
 * - Minimal: exposes only essential fields, no business logic
 */
export function routingOptimizationOutcomeProjection(outcome: OptimizationExecutionOutcome): RoutingOptimizationOutcomeProjection {
  return {
    selectedRoutingActions: outcome.snapshot.result.selectedActions,
    rejectedRoutingCandidates: outcome.snapshot.result.rejectedCandidates,
    routingAudit: outcome.audit,
  };
}
