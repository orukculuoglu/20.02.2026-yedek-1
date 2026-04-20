import type { ActionMetadata } from "../../foundation/contracts/action-metadata.contract.js";
import type { SelectionRationale } from "./selection-rationale.contract.js";

/**
 * SelectedAction - Structural definition of a final selected action
 * Pure structural definition of an action that was selected as final output from selection surface.
 * Contains reference to candidate, action metadata, and optional selection rationale.
 * No execution state, dispatch state, or outcome tracking.
 */
export interface SelectedAction {
  /**
   * Unique identifier for this selected action result
   */
  readonly selectedActionId: string;

  /**
   * Reference identifier to the candidate action this was selected from
   */
  readonly candidateActionId: string;

  /**
   * Classification and metadata of the selected action
   */
  readonly actionMetadata: ActionMetadata;

  /**
   * Optional rationale references explaining why this action was selected
   * May be empty if selection rationale is implicit
   */
  readonly selectionRationales: ReadonlyArray<SelectionRationale>;
}
