/**
 * Deterministic Optimization Selection Strategy
 * Protocol-clean runtime implementation of real selection transformation.
 * Performs deterministic selection over feasible actions pool based on limit and tieBreak.
 * Deterministic: same input always produces same output.
 * No class, no factory, no generated IDs, no mutation.
 * No hidden fallback behavior - only supports strategies explicitly in contract.
 * 
 * DETERMINISM & FORBIDDEN ZONE CLOSURE (Phase 5):
 * - Strategy is fully deterministic: identical feasible pool + limit + tieBreak produce identical results
 * - All selection paths are structural: no ML inference, no adaptive scoring, no hidden heuristics
 * - All tieBreak evaluation is explicit: only explicit_order and fifo strategies supported
 * - No unsupported tie-break: capacity_*, cost_*, time_*, availability_* strategies rejected
 * - No ID generation: selectedActionId = sourceFeasibleActionId (reused, not generated)
 * - No randomness: no probabilistic tie-breaking or randomized selection
 * - No time-based behavior: no temporal tie-breaking
 * - EXPLICITLY FORBIDDEN:
 *   - Math.random(): breaks determinism
 *   - Date.now(): breaks reproducibility
 *   - ID generation: all IDs reused from sources
 *   - Unsupported tie-break strategies: only explicit_order, fifo allowed
 *   - ML-based selection: no learned scoring models
 *   - Hidden weights: no implicit scoring of equivalent feasible actions
 *   - Probabilistic selection: no randomized tie-breaking
 *   - Adaptive selection: no feedback loops, no priority learning
 *   - Cost-based tie-breaking: cost_* strategies require execution context (deferred)
 *   - Time-based tie-breaking: time_* strategies require execution context (deferred)
 *   - Capacity-based tie-breaking: capacity_* strategies require execution context (deferred)
 *   - Availability-based tie-breaking: availability_* strategies require execution context (deferred)
 *   - Auto-execution of selected: no application of results
 *   - Mutation of feasible pool: no modification of input
 * - Result is honest: only explicit_order and fifo tie-breaking applied
 */


import type {
  SelectionInput,
  SelectionResult,
  OptimizationSelectionStrategy,
  RuntimePhase2TieBreak,
} from "../contracts/optimization-selection-strategy.contract";
import type { SelectedAction } from "../contracts/selected-action.contract";
import type { FeasibleAction } from "../contracts/feasible-action.contract";
import type { ExplicitOrderTieBreak } from "../contracts/optimization-tie-break.contract";

/**
 * Type guard: check if tieBreak is explicit_order strategy.
 * Safely narrows RuntimePhase2TieBreak union for explicit ordering logic.
 */
const isExplicitOrderTieBreak = (
  tieBreak: RuntimePhase2TieBreak,
): tieBreak is ExplicitOrderTieBreak => {
  return tieBreak.strategy === "explicit_order";
};

/**
 * Apply explicit_order tieBreak to sort feasible actions.
 * Matches feasible actions to order array by sourceCandidateActionId.
 * Actions in order array come first, unmentioned actions come last (stable order).
 * @param feasible - Feasible actions to sort
 * @param order - Order array (IDs defining precedence)
 * @returns Sorted array of feasible actions
 */
const applyExplicitOrderTieBreak = (
  feasible: readonly FeasibleAction[],
  order: readonly string[],
): readonly FeasibleAction[] => {
  // Create a map of ID -> index in order array for O(1) lookup
  const orderIndexMap = new Map<string, number>();
  for (let i = 0; i < order.length; i++) {
    orderIndexMap.set(order[i], i);
  }

  // Sort: actions in order array first (by order index), then others (stable)
  const sorted = [...feasible].sort((a, b) => {
    const aIndex = orderIndexMap.get(a.sourceCandidateActionId) ?? Infinity;
    const bIndex = orderIndexMap.get(b.sourceCandidateActionId) ?? Infinity;
    // If both have index, compare indices
    if (aIndex !== Infinity && bIndex !== Infinity) {
      return aIndex - bIndex;
    }
    // If only a has index, a comes first
    if (aIndex !== Infinity) {
      return -1;
    }
    // If only b has index, b comes first
    if (bIndex !== Infinity) {
      return 1;
    }
    // Both not in order array, maintain relative order (stable)
    return 0;
  });

  return sorted;
};

/**
 * Deterministic optimization selection strategy.
 * Minimal constant satisfying OptimizationSelectionStrategy interface.
 * No class, no factory, no generated IDs, no mutation.
 * Performs real selection from feasible pool based on limit and tieBreak.
 * Only supports RuntimePhase2TieBreak strategies: explicit_order and fifo.
 */
export const deterministicOptimizationSelectionStrategy: OptimizationSelectionStrategy =
  {
    select: (input: SelectionInput): SelectionResult => {
      const feasible = input.feasibleActions;
      const selectionLimit = input.selectionLimit;
      const tieBreak = input.tieBreak;

      // Apply supported tieBreak strategy to order feasible actions
      // Only explicit_order and fifo are supported in Phase 2
      let orderedFeasible: readonly FeasibleAction[];
      if (isExplicitOrderTieBreak(tieBreak)) {
        orderedFeasible = applyExplicitOrderTieBreak(feasible, tieBreak.order);
      } else {
        // tieBreak.strategy must be "fifo" (only other option in RuntimePhase2TieBreak)
        // Preserve input order
        orderedFeasible = feasible;
      }

      // Select first N actions up to selectionLimit
      const selectedCount = Math.min(selectionLimit, orderedFeasible.length);
      const selectedFeasible = orderedFeasible.slice(0, selectedCount);
      const nonSelectedFeasible =
        selectedCount < orderedFeasible.length
          ? orderedFeasible.slice(selectedCount)
          : undefined;

      // Transform selected feasible actions into selected actions
      // Reuse sourceFeasibleActionId as selectedActionId (no generation)
      const selectedActions: SelectedAction[] = [];
      for (const feasibleAction of selectedFeasible) {
        const selectedAction: SelectedAction = {
          selectedActionId: feasibleAction.feasibleActionId,
          sourceFeasibleActionId: feasibleAction.feasibleActionId,
          sourceCandidateActionId: feasibleAction.sourceCandidateActionId,
          category: feasibleAction.category,
        };
        selectedActions.push(selectedAction);
      }

      // Explicit result with selected and non-selected feasible actions
      const result: SelectionResult = {
        selectedActions: Object.freeze(selectedActions),
        nonSelectedFeasibleActions: nonSelectedFeasible
          ? Object.freeze(nonSelectedFeasible)
          : undefined,
      };

      return result;
    },
  };

