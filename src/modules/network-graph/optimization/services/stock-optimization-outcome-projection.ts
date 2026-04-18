/**
 * Stock Optimization Outcome Projection Service
 * Deterministic projection of OptimizationExecutionOutcome for stock context.
 * Extracts stock-specific selected/rejected actions and audit from outcome.
 * No analytics, no mutations - pure structural projection.
 */

import type { OptimizationExecutionOutcome } from "../contracts/optimization-audit.contract";
import type { StockOptimizationOutcomeProjection } from "../contracts/stock-optimization-outcome-projection.contract";

/**
 * stockOptimizationOutcomeProjection
 * Deterministic service that projects OptimizationExecutionOutcome into stock domain.
 * Extracts and exposes stock-bounded selected actions, rejected candidates, and audit.
 * 
 * Behavior:
 * - Deterministic: same outcome always produces same projection
 * - Immutable: input outcome is never mutated
 * - Structural: extracts key parts without transformation or analytics
 * - Minimal: exposes only essential fields, no business logic
 */
export function stockOptimizationOutcomeProjection(outcome: OptimizationExecutionOutcome): StockOptimizationOutcomeProjection {
  return {
    selectedStockActions: outcome.snapshot.result.selectedActions,
    rejectedStockCandidates: outcome.snapshot.result.rejectedCandidates,
    stockAudit: outcome.audit,
  };
}
