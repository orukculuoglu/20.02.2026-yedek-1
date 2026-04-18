/**
 * Routing Optimization Runtime Contract
 * Domain-specialized optimization runtime for routing-only moves.
 * Adapts the shared orchestration boundary to routing domain.
 * No scoring, no ranking, no recommendation - structural optimization only.
 * All identifiers caller-provided only.
 */

import type { OptimizationObjective } from "./optimization-objective.contract";
import type { OptimizationConstraintSet } from "./optimization-constraint.contract";
import type { RuntimePhase2TieBreak } from "./optimization-selection-strategy.contract";
import type { RoutingCandidateAction } from "./routing-candidate-action.contract";
import type { SelectedAction } from "./selected-action.contract";
import type { RejectedCandidateAction } from "./rejected-candidate-action.contract";

/**
 * RoutingSelectedAction
 * Domain-specific selected action for routing optimization.
 * Wraps SelectedAction with explicit routing domain context.
 */
export type RoutingSelectedAction = SelectedAction;

/**
 * RoutingRejectedCandidate
 * Domain-specific rejected candidate for routing optimization.
 * Wraps RejectedCandidateAction with explicit routing domain context.
 */
export type RoutingRejectedCandidate = RejectedCandidateAction;

/**
 * RoutingOptimizationRuntimeInput
 * Domain-specialized input for routing optimization.
 * Contains only routing candidates and Phase 2 runtime-supported tie-break strategies.
 * All inputs caller-provided; no defaults, no inference, no generation.
 */
export interface RoutingOptimizationRuntimeInput {
  /** Optimization objective - what to optimize towards */
  readonly objective: OptimizationObjective;

  /** Feasibility boundaries - constraints to respect */
  readonly constraints: OptimizationConstraintSet;

  /** Deterministic tie-break rules for equivalent solutions (Phase 2 runtime-supported strategies only) */
  readonly tieBreak: RuntimePhase2TieBreak;

  /** Routing candidate actions proposed for evaluation (routing domain only) */
  readonly routingCandidates: readonly RoutingCandidateAction[];

  /** Selection limit - maximum number of actions to select from feasible pool */
  readonly selectionLimit: number;

  /** Unique result identifier (caller-provided) */
  readonly resultId: string;
}

/**
 * RoutingOptimizationResult
 * Domain-specialized result for routing optimization.
 * Contains only routing-domain actions with explicit type marking.
 * No execution, no recommendation, no decision flags.
 */
export interface RoutingOptimizationResult {
  /** Unique result identifier (reused from input) */
  readonly resultId: string;

  /** Selected routing actions from optimization (routing domain only, explicitly typed) */
  readonly selectedRoutingActions: readonly RoutingSelectedAction[];

  /** Rejected routing candidates from optimization (routing domain only, explicitly typed) */
  readonly rejectedRoutingCandidates: readonly RoutingRejectedCandidate[];
}

/**
 * RoutingOptimizationRuntime
 * Domain-specialized optimization boundary for routing moves.
 * Adapts shared orchestration to routing domain.
 * Same input always produces same output (deterministic).
 */
export interface RoutingOptimizationRuntime {
  /**
   * Deterministic routing optimization function.
   * Transforms RoutingOptimizationRuntimeInput into RoutingOptimizationResult.
   * @param input - Routing domain input with routing candidates only
   * @returns Routing domain result with routing actions only
   */
  readonly optimize: (input: RoutingOptimizationRuntimeInput) => RoutingOptimizationResult;
}

/**
 * Routing optimization runtime behavior:
 * - Domain-specialized boundary: routing candidates only
 * - Adapts shared orchestration to routing domain
 * - Same input always produces same output (deterministic)
 * - No scoring, ranking, recommendation, or decision logic
 * - No mutation of input state
 * - Traceability maintained through transformation chain
 * - All identifiers traced to caller-provided sources
 */
