/**
 * Final Action Selection Surface - Pure declarative final action selection definition layer
 * Defines how final action selection outcomes are structurally represented at compile time.
 * Contains no selection logic, scoring, ranking, or execution semantics.
 */

// Selection rationale vocabulary
export {
  SelectionRationaleCode,
  SELECTION_RATIONALE_CODES_ALL,
} from "./selection-rationale-code.enum.js";
export type { SelectionRationaleCodeValue } from "./selection-rationale-code.enum.js";

// Selection rationale reference structure
export type { SelectionRationale } from "./selection-rationale.contract.js";

// Final action outcome contracts
export type { SelectedAction } from "./selected-action.contract.js";
export type { RejectedAction } from "./rejected-action.contract.js";
export type { SuppressedAction } from "./suppressed-action.contract.js";
export type { DeferredAction } from "./deferred-action.contract.js";

// Selection summary and aggregate
export type { FinalActionSelectionSummary } from "./final-action-selection-summary.contract.js";
export type { FinalActionSelection } from "./final-action-selection.contract.js";
