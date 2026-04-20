/**
 * SelectionRationaleCode - Bounded vocabulary for final action selection outcome reasons
 * Identifies why a candidate action was selected, rejected, suppressed, or deferred at selection time.
 * Captures only selection-surface decisions, not workflow, approval, or execution semantics.
 * Pure vocabulary; no selection algorithm or decision logic.
 */
export enum SelectionRationaleCode {
  /**
   * Action selected: originates directly from policy
   */
  SELECTED_DIRECT_CANDIDATE = "selected_direct_candidate",

  /**
   * Action selected: originates from policy + evaluation combination
   */
  SELECTED_DERIVED_CANDIDATE = "selected_derived_candidate",

  /**
   * Action not selected: violates policy constraint
   */
  REJECTED_POLICY_CONSTRAINT = "rejected_policy_constraint",

  /**
   * Action not selected: failed to pass selection structural boundary
   */
  REJECTED_SELECTION_BOUNDARY = "rejected_selection_boundary",

  /**
   * Action valid but suppressed: overlaps with selected action
   */
  SUPPRESSED_DUPLICATE = "suppressed_duplicate",

  /**
   * Action not selected: precondition unresolved at selection time
   */
  DEFERRED_CONDITION_UNRESOLVED = "deferred_condition_unresolved",
}

/**
 * SelectionRationaleCode value type for serialized rationale code strings
 */
export type SelectionRationaleCodeValue = `${SelectionRationaleCode}`;

/**
 * All values in SelectionRationaleCode for bounded collection usage
 */
export const SELECTION_RATIONALE_CODES_ALL = Object.freeze([
  SelectionRationaleCode.SELECTED_DIRECT_CANDIDATE,
  SelectionRationaleCode.SELECTED_DERIVED_CANDIDATE,
  SelectionRationaleCode.REJECTED_POLICY_CONSTRAINT,
  SelectionRationaleCode.REJECTED_SELECTION_BOUNDARY,
  SelectionRationaleCode.SUPPRESSED_DUPLICATE,
  SelectionRationaleCode.DEFERRED_CONDITION_UNRESOLVED,
] as const);
