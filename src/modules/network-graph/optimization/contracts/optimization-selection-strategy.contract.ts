/**
 * Optimization Selection Strategy Contract
 * Defines the deterministic selection transformation boundary.
 * Transforms feasible actions into selected actions based on deterministic strategy.
 * No scoring, no ranking, no recommendation - structural transformation only.
 */

import type { FeasibleAction } from "./feasible-action.contract";
import type { SelectedAction } from "./selected-action.contract";
import type { OptimizationTieBreak, ExplicitOrderTieBreak } from "./optimization-tie-break.contract";

/**
 * RuntimePhase2FifoTieBreak
 * FIFO (first in, first out) ordering strategy.
 * Preserves input order of feasible actions for selection.
 * Supported by Phase 2 runtime (no metric data required).
 */
export interface RuntimePhase2FifoTieBreak {
  readonly strategy: "fifo";
}

/**
 * RuntimePhase2TieBreak
 * Bounded tie-break strategies actually supported by selection runtime Phase 2.
 * Only includes strategies that are structurally evaluable from FeasibleAction alone.
 * All other strategies are deferred to future phases.
 */
export type RuntimePhase2TieBreak = ExplicitOrderTieBreak | RuntimePhase2FifoTieBreak;

/**
 * SelectionInput
 * Explicit structural input for selection transformation.
 * Contains feasible actions pool, selection limit, and deterministic controls.
 * Runtime performs real selection from the feasible pool based on limit and tieBreak.
 * Caller does not pre-decide which feasible actions to select.
 * TieBreak must be one of the strategies actually supported by Phase 2 runtime.
 */
export interface SelectionInput {
  /** Feasible actions available for selection (caller-provided, ordered pool) */
  readonly feasibleActions: readonly FeasibleAction[];

  /** How many actions to select from the feasible pool (caller-provided, deterministic control) */
  readonly selectionLimit: number;

  /** Deterministic ordering rules to apply when selecting from feasible pool (caller-provided) */
  /** Only RuntimePhase2TieBreak strategies are supported: explicit_order or fifo */
  readonly tieBreak: RuntimePhase2TieBreak;
}

/**
 * SelectionResult
 * Explicit structural output of selection transformation.
 * Carries selected actions and explicit non-selected feasible actions for clarity.
 * Distinction between selected and non-selected remains clear.
 * Does not perform execution or recommendation - purely structural.
 */
export interface SelectionResult {
  /** Actions selected from feasible set based on limit and tieBreak ordering (deterministically ordered) */
  readonly selectedActions: readonly SelectedAction[];

  /** Feasible actions not selected due to selectionLimit constraint (optional, explicit non-selection) */
  readonly nonSelectedFeasibleActions?: readonly FeasibleAction[];
}

/**
 * OptimizationSelectionStrategy
 * Defines the deterministic selection strategy boundary.
 * Performs real selection over feasible actions deterministically.
 * Applies tieBreak to order feasible actions, then selects based on limit.
 * Same input always produces same output (deterministic).
 * No ID generation - all identifiers caller-provided or reused.
 */
export interface OptimizationSelectionStrategy {
  /**
   * Deterministic selection function.
   * Transforms SelectionInput into SelectionResult.
   * Performs real selection from feasible pool based on limit and tieBreak ordering.
   * Runtime owns the selection decision (not projection).
   * @param input - Explicit selection input with feasible actions, limit, and tieBreak
   * @returns Selection result with selected actions and non-selected feasible (explicit)
   */
  readonly select: (input: SelectionInput) => SelectionResult;
}

/**
 * Optimization selection strategy behavior:
 * - Deterministic boundary: same input always produces same output
 * - Real selection: transforms feasible pool into selected subset (not 1:1 projection)
 * - TieBreak applied meaningfully: orders feasible actions before selection
 *   - explicit_order: uses caller-provided explicit ordering of candidate IDs
 *   - fifo: preserves input order of feasible actions
 *   - Other strategies not supported in Phase 2 (deferred to later phases)
 * - Selection owned by runtime: service decides which to select up to limit
 * - Explicit non-selection: unselected feasible actions included in output if selectionLimit < feasibleActions.length
 * - No scoring, ranking, or recommendation logic
 * - No mutation of input state
 * - IDs: reused from sourceFeasibleActionId (not generated)
 * - Selection limit bounded by caller (caller determines how many to select)
 * - Selection is deterministic transformation, not execution or decision-making
 */

