/**
 * Regional Balancing Optimization Outcome Projection Service
 * Deterministic projection of OptimizationExecutionOutcome for regional balancing context.
 * Extracts regional-balancing-specific selected/rejected actions and audit from outcome.
 * No analytics, no mutations - pure structural projection.
 */

import type { OptimizationExecutionOutcome } from "../contracts/optimization-audit.contract";
import type { RegionalBalancingOptimizationOutcomeProjection } from "../contracts/regional-balancing-optimization-outcome-projection.contract";

/**
 * regionalBalancingOptimizationOutcomeProjection
 * Deterministic service that projects OptimizationExecutionOutcome into regional balancing domain.
 * Extracts and exposes regional-balancing-bounded selected actions, rejected candidates, and audit.
 * 
 * Behavior:
 * - Deterministic: same outcome always produces same projection
 * - Immutable: input outcome is never mutated
 * - Structural: extracts key parts without transformation or analytics
 * - Minimal: exposes only essential fields, no business logic
 */
export function regionalBalancingOptimizationOutcomeProjection(outcome: OptimizationExecutionOutcome): RegionalBalancingOptimizationOutcomeProjection {
  return {
    selectedRegionalBalancingActions: outcome.snapshot.result.selectedActions,
    rejectedRegionalBalancingCandidates: outcome.snapshot.result.rejectedCandidates,
    regionalBalancingAudit: outcome.audit,
  };
}
