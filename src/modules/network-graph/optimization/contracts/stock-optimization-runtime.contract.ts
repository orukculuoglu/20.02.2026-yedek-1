/**
 * Stock Optimization Runtime Contract
 * Domain-specialized optimization runtime for stock-only actions.
 * Adapts the shared orchestration boundary to stock domain.
 * No scoring, no ranking, no recommendation - structural optimization only.
 * All identifiers caller-provided only.
 */

import type { OptimizationObjective } from "./optimization-objective.contract";
import type { OptimizationConstraintSet } from "./optimization-constraint.contract";
import type { RuntimePhase2TieBreak } from "./optimization-selection-strategy.contract";
import type { StockCandidateAction } from "./stock-candidate-action.contract";
import type { SelectedAction } from "./selected-action.contract";
import type { RejectedCandidateAction } from "./rejected-candidate-action.contract";

/**
 * StockSelectedAction
 * Domain-specific selected action for stock optimization.
 * Wraps SelectedAction with explicit stock domain context.
 */
export type StockSelectedAction = SelectedAction;

/**
 * StockRejectedCandidate
 * Domain-specific rejected candidate for stock optimization.
 * Wraps RejectedCandidateAction with explicit stock domain context.
 */
export type StockRejectedCandidate = RejectedCandidateAction;

/**
 * StockOptimizationRuntimeInput
 * Domain-specialized input for stock optimization.
 * Contains only stock candidates and Phase 2 runtime-supported tie-break strategies.
 * All inputs caller-provided; no defaults, no inference, no generation.
 */
export interface StockOptimizationRuntimeInput {
  /** Optimization objective - what to optimize towards */
  readonly objective: OptimizationObjective;

  /** Feasibility boundaries - constraints to respect */
  readonly constraints: OptimizationConstraintSet;

  /** Deterministic tie-break rules for equivalent solutions (Phase 2 runtime-supported strategies only) */
  readonly tieBreak: RuntimePhase2TieBreak;

  /** Stock candidate actions proposed for evaluation (stock domain only) */
  readonly stockCandidates: readonly StockCandidateAction[];

  /** Selection limit - maximum number of actions to select from feasible pool */
  readonly selectionLimit: number;

  /** Unique result identifier (caller-provided) */
  readonly resultId: string;
}

/**
 * StockOptimizationResult
 * Domain-specialized result for stock optimization.
 * Contains only stock-domain actions with explicit type marking.
 * No execution, no recommendation, no decision flags.
 */
export interface StockOptimizationResult {
  /** Unique result identifier (reused from input) */
  readonly resultId: string;

  /** Selected stock actions from optimization (stock domain only, explicitly typed) */
  readonly selectedStockActions: readonly StockSelectedAction[];

  /** Rejected stock candidates from optimization (stock domain only, explicitly typed) */
  readonly rejectedStockCandidates: readonly StockRejectedCandidate[];
}

/**
 * StockOptimizationRuntime
 * Domain-specialized optimization boundary for stock actions.
 * Adapts shared orchestration to stock domain.
 * Same input always produces same output (deterministic).
 */
export interface StockOptimizationRuntime {
  /**
   * Deterministic stock optimization function.
   * Transforms StockOptimizationRuntimeInput into StockOptimizationResult.
   * @param input - Stock domain input with stock candidates only
   * @returns Stock domain result with stock actions only
   */
  readonly optimize: (input: StockOptimizationRuntimeInput) => StockOptimizationResult;
}

/**
 * Stock optimization runtime behavior:
 * - Domain-specialized boundary: stock candidates only
 * - Adapts shared orchestration to stock domain
 * - Same input always produces same output (deterministic)
 * - No scoring, ranking, recommendation, or decision logic
 * - No mutation of input state
 * - Traceability maintained through transformation chain
 * - All identifiers traced to caller-provided sources
 */
