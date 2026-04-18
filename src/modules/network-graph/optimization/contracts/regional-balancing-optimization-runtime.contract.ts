/**
 * Regional Balancing Optimization Runtime Contract
 * Domain-specialized optimization runtime for regional balancing moves.
 * Adapts the shared orchestration boundary to regional balancing domain.
 * No scoring, no ranking, no recommendation - structural optimization only.
 * All identifiers caller-provided only.
 */

import type { OptimizationObjective } from "./optimization-objective.contract";
import type { OptimizationConstraintSet } from "./optimization-constraint.contract";
import type { RuntimePhase2TieBreak } from "./optimization-selection-strategy.contract";
import type { RegionalBalancingCandidateAction } from "./regional-balancing-candidate-action.contract";
import type { SelectedAction } from "./selected-action.contract";
import type { RejectedCandidateAction } from "./rejected-candidate-action.contract";

/**
 * RegionalBalancingSelectedAction
 * Domain-specific selected action for regional balancing optimization.
 * Wraps SelectedAction with explicit regional balancing domain context.
 */
export type RegionalBalancingSelectedAction = SelectedAction;

/**
 * RegionalBalancingRejectedCandidate
 * Domain-specific rejected candidate for regional balancing optimization.
 * Wraps RejectedCandidateAction with explicit regional balancing domain context.
 */
export type RegionalBalancingRejectedCandidate = RejectedCandidateAction;

/**
 * RegionalBalancingOptimizationRuntimeInput
 * Domain-specialized input for regional balancing optimization.
 * Contains only regional balancing candidates and Phase 2 runtime-supported tie-break strategies.
 * All inputs caller-provided; no defaults, no inference, no generation.
 */
export interface RegionalBalancingOptimizationRuntimeInput {
  /** Optimization objective - what to optimize towards */
  readonly objective: OptimizationObjective;

  /** Feasibility boundaries - constraints to respect */
  readonly constraints: OptimizationConstraintSet;

  /** Deterministic tie-break rules for equivalent solutions (Phase 2 runtime-supported strategies only) */
  readonly tieBreak: RuntimePhase2TieBreak;

  /** Regional balancing candidate actions proposed for evaluation (regional balancing domain only) */
  readonly regionalBalancingCandidates: readonly RegionalBalancingCandidateAction[];

  /** Selection limit - maximum number of actions to select from feasible pool */
  readonly selectionLimit: number;

  /** Unique result identifier (caller-provided) */
  readonly resultId: string;
}

/**
 * RegionalBalancingOptimizationResult
 * Domain-specialized result for regional balancing optimization.
 * Contains only regional balancing domain actions with explicit type marking.
 * No execution, no recommendation, no decision flags.
 */
export interface RegionalBalancingOptimizationResult {
  /** Unique result identifier (reused from input) */
  readonly resultId: string;

  /** Selected regional balancing actions from optimization (regional balancing domain only, explicitly typed) */
  readonly selectedRegionalBalancingActions: readonly RegionalBalancingSelectedAction[];

  /** Rejected regional balancing candidates from optimization (regional balancing domain only, explicitly typed) */
  readonly rejectedRegionalBalancingCandidates: readonly RegionalBalancingRejectedCandidate[];
}

/**
 * RegionalBalancingOptimizationRuntime
 * Domain-specialized optimization boundary for regional balancing moves.
 * Adapts shared orchestration to regional balancing domain.
 * Same input always produces same output (deterministic).
 */
export interface RegionalBalancingOptimizationRuntime {
  /**
   * Deterministic regional balancing optimization function.
   * Transforms RegionalBalancingOptimizationRuntimeInput into RegionalBalancingOptimizationResult.
   * @param input - Regional balancing domain input with regional balancing candidates only
   * @returns Regional balancing domain result with regional balancing actions only
   */
  readonly optimize: (input: RegionalBalancingOptimizationRuntimeInput) => RegionalBalancingOptimizationResult;
}

/**
 * Regional balancing optimization runtime behavior:
 * - Domain-specialized boundary: regional balancing candidates only
 * - Adapts shared orchestration to regional balancing domain
 * - Same input always produces same output (deterministic)
 * - No scoring, ranking, recommendation, or decision logic
 * - No mutation of input state
 * - Traceability maintained through transformation chain
 * - All identifiers traced to caller-provided sources
 */
