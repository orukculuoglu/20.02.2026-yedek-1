import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";
import type { SelectedAction } from "./selected-action.contract.js";
import type { RejectedAction } from "./rejected-action.contract.js";
import type { SuppressedAction } from "./suppressed-action.contract.js";
import type { DeferredAction } from "./deferred-action.contract.js";
import type { FinalActionSelectionSummary } from "./final-action-selection-summary.contract.js";

/**
 * FinalActionSelectionBase - Shared base structure for all final action selection outcomes
 * Base structure containing selection result identity and summary.
 */
interface FinalActionSelectionBase {
  /**
   * Unique identifier for this selection result
   */
  readonly selectionId: string;

  /**
   * Optional collection of actions that were selected
   */
  readonly selectedActions?: ReadonlyArray<SelectedAction>;

  /**
   * Optional collection of actions that were rejected
   */
  readonly rejectedActions?: ReadonlyArray<RejectedAction>;

  /**
   * Optional collection of actions that were suppressed
   */
  readonly suppressedActions?: ReadonlyArray<SuppressedAction>;

  /**
   * Optional collection of actions that were deferred
   */
  readonly deferredActions?: ReadonlyArray<DeferredAction>;

  /**
   * Structural summary of selection outcome distribution
   */
  readonly selectionSummary: FinalActionSelectionSummary;
}

/**
 * FinalActionSelection - Structural aggregation of final action selection outcomes
 * Pure structural aggregation of selected, rejected, suppressed, and deferred actions.
 * Outcome-complete: at least one outcome collection must be present and non-empty.
 * Union-based: ensures type-level guarantee that at least one outcome type exists.
 * No ranking, execution, or dispatch semantics.
 */
export type FinalActionSelection = 
  | (FinalActionSelectionBase & { readonly selectedActions: NonEmptyReadonlyArray<SelectedAction> })
  | (FinalActionSelectionBase & { readonly rejectedActions: NonEmptyReadonlyArray<RejectedAction> })
  | (FinalActionSelectionBase & { readonly suppressedActions: NonEmptyReadonlyArray<SuppressedAction> })
  | (FinalActionSelectionBase & { readonly deferredActions: NonEmptyReadonlyArray<DeferredAction> });
