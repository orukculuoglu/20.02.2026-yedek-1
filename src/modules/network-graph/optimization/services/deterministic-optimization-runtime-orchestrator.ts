/**
 * Deterministic Optimization Runtime Orchestrator
 * Protocol-clean runtime implementation of optimization orchestration.
 * Composes Phase 1 (feasibility evaluation) and Phase 2 (deterministic selection) into single runtime.
 * Deterministic: same input always produces same output.
 * No class, no factory, no ID generation (all IDs caller-provided and reused from sources).
 * No mutation of input state.
 * 
 * DETERMINISM & FORBIDDEN ZONE CLOSURE (Phase 5):
 * - Orchestrator is fully deterministic: identical input produces identical output always
 * - All composition paths are deterministic: Phase 1 → Phase 2 is fully specified
 * - All ID reuse is deterministic: feasibleActionId = selectedActionId = sourceCandidateActionId (explicit)
 * - All traceability paths are deterministic: every ID is traceable to caller-provided source
 * - No hidden phase interaction: Phase 1 and Phase 2 results are independent
 * - No randomness: no probabilistic composition, no randomized phase selection
 * - No time-based behavior: no temporal phase selection
 * - EXPLICITLY FORBIDDEN:
 *   - Math.random(): breaks determinism
 *   - Date.now(): breaks reproducibility
 *   - ID generation: all IDs reused from caller-provided sources
 *   - Generated timestamps: structural only
 *   - Unsupported tie-break strategies: error thrown for non-explicit_order/fifo
 *   - ML-based orchestration: no learned phase weighting, no adaptive composition
 *   - Hidden weights: no implicit phase prioritization
 *   - Conditional phase skipping: both phases always executed if input valid
 *   - Feedback between phases: no phase results modify phase inputs
 *   - Probabilistic composition: no randomized phase interaction
 *   - Adaptive orchestration: no learning loops, no dynamic phase adjustment
 *   - Auto-execution: no automatic action application
 *   - Mutation of input state: no modification of OptimizationRuntimeOrchestrationInput
 *   - Side effects: no implicit callbacks, no lazy evaluation surprises
 *   - Analytics: no telemetry during orchestration
 *   - Persistence: no storage binding during orchestration
 * - Determinism doctrine: identical orchestration input produces identical result always
 * - Composition doctrine: Phase 1 and Phase 2 execution order is fixed and deterministic
 * - Traceability doctrine: every ID in result is traceable to caller-provided source
 */


import type { OptimizationRuntimeOrchestrationInput, OptimizationRuntimeOrchestrator } from "../contracts/optimization-runtime-orchestrator.contract";
import type { OptimizationResult } from "../contracts/optimization-result.contract";
import type { FeasibleAction } from "../contracts/feasible-action.contract";
import type { RejectedCandidateAction } from "../contracts/rejected-candidate-action.contract";
import type { SelectedAction } from "../contracts/selected-action.contract";
import type { RuntimePhase2TieBreak } from "../contracts/optimization-selection-strategy.contract";
import type { OptimizationTieBreak } from "../contracts/optimization-tie-break.contract";
import { deterministicOptimizationFeasibilityEvaluator } from "./deterministic-optimization-feasibility-evaluator";
import { deterministicOptimizationSelectionStrategy } from "./deterministic-optimization-selection-strategy";

/**
 * Type guard: check if tieBreak is supported by Phase 2 selection runtime.
 * Only explicit_order and fifo strategies are supported in Phase 2.
 * Other strategies require additional execution/selection context (deferred to future phases).
 * @param tieBreak - Tie-break strategy to validate
 * @returns true if tieBreak is a RuntimePhase2TieBreak (supported), false otherwise
 */
const isRuntimePhase2TieBreak = (tieBreak: OptimizationTieBreak): tieBreak is RuntimePhase2TieBreak => {
  // Explicit order is always supported
  if (tieBreak.strategy === "explicit_order") {
    return true;
  }
  // FIFO (via StandardTieBreak with fifo strategy) is supported
  if (tieBreak.strategy === "fifo") {
    return true;
  }
  // All other strategies require execution context (capacity, cost metrics, time, availability)
  // These are deferred to later phases
  return false;
};

/**
 * Deterministic optimization runtime orchestrator.
 * Minimal constant satisfying OptimizationRuntimeOrchestrator interface.
 * No class, no factory, no ID generation (all IDs reused from caller-provided sources).
 * Composes completed Phase 1 and Phase 2 services into complete optimization runtime.
 */
export const deterministicOptimizationRuntimeOrchestrator: OptimizationRuntimeOrchestrator =
  {
    orchestrate: (
      input: OptimizationRuntimeOrchestrationInput,
    ): OptimizationResult => {
      const { optimization, selectionLimit, resultId } = input;

      // Validate that tieBreak is supported by Phase 2
      // Only explicit_order and fifo strategies are supported in Phase 2
      if (!isRuntimePhase2TieBreak(optimization.tieBreak)) {
        throw new Error(
          `Unsupported tie-break strategy in Phase 2: "${optimization.tieBreak.strategy}". ` +
          `Only "explicit_order" and "fifo" are supported. Other strategies (cost_*, time_*, capacity_*, availability_*) ` +
          `require additional execution context and are deferred to future phases.`
        );
      }

      // Phase 1: Deterministic feasibility evaluation
      // Transform OptimizationInput into FeasibilityEvaluationResult
      const feasibilityResult = deterministicOptimizationFeasibilityEvaluator.evaluate(
        optimization,
      );

      // Build FeasibleAction objects from feasible references using reused source IDs
      // feasibleActionId is reused from sourceCandidateActionId (no generation)
      const feasibleActions: FeasibleAction[] = [];
      for (const ref of feasibilityResult.feasibleCandidates) {
        const feasibleAction: FeasibleAction = {
          feasibleActionId: ref.sourceCandidateActionId,
          sourceCandidateActionId: ref.sourceCandidateActionId,
          category: ref.category,
        };
        feasibleActions.push(feasibleAction);
      }

      // Phase 2: Deterministic selection strategy
      // Transform feasible pool into selected subset using caller-provided controls
      // tieBreak is narrowed to RuntimePhase2TieBreak by validation above
      const selectionResult = deterministicOptimizationSelectionStrategy.select({
        feasibleActions,
        selectionLimit,
        tieBreak: optimization.tieBreak,
      });

      // Build SelectedAction objects from selected feasible actions using reused source IDs
      // selectedActionId is reused from sourceFeasibleActionId (no generation)
      const selectedActionsWithTraceability: SelectedAction[] = [];
      for (const selectedFeasible of selectionResult.selectedActions) {
        const selectedAction: SelectedAction = {
          selectedActionId: selectedFeasible.sourceFeasibleActionId,
          sourceFeasibleActionId: selectedFeasible.sourceFeasibleActionId,
          sourceCandidateActionId: selectedFeasible.sourceCandidateActionId,
          category: selectedFeasible.category,
        };
        selectedActionsWithTraceability.push(selectedAction);
      }

      // Build RejectedCandidateAction objects from rejected references using reused source IDs
      // rejectedActionId is reused from sourceCandidateActionId (no generation)
      const rejectedCandidates: RejectedCandidateAction[] = [];
      for (const ref of feasibilityResult.rejectedCandidates) {
        const rejectedAction: RejectedCandidateAction = {
          rejectedActionId: ref.sourceCandidateActionId,
          sourceCandidateActionId: ref.sourceCandidateActionId,
          category: ref.category,
          rejectionKind: ref.rejectionKind,
        };
        rejectedCandidates.push(rejectedAction);
      }

      // Compose explicit OptimizationResult from phase outputs using caller-provided resultId
      const result: OptimizationResult = {
        resultId: resultId,
        selectedActions: Object.freeze(selectedActionsWithTraceability),
        rejectedCandidates: Object.freeze(rejectedCandidates),
      };

      return result;
    },
  };
