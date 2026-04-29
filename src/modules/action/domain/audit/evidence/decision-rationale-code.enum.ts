/**
 * Decision rationale code classification vocabulary
 * Focuses on decision-audit surface representation, not runtime logic
 */
export enum DecisionRationaleCode {
  ACTION_SELECTED_RATIONALE = "action_selected_rationale",
  ACTION_REJECTED_RATIONALE = "action_rejected_rationale",
  ACTION_SUPPRESSED_RATIONALE = "action_suppressed_rationale",
  ACTION_DEFERRED_RATIONALE = "action_deferred_rationale",
  HANDOFF_PERMITTED_RATIONALE = "handoff_permitted_rationale",
  HANDOFF_BLOCKED_RATIONALE = "handoff_blocked_rationale",
  OUTCOME_RECORDED_RATIONALE = "outcome_recorded_rationale",
}

export const DECISION_RATIONALE_CODES_ALL: ReadonlyArray<DecisionRationaleCode> = [
  DecisionRationaleCode.ACTION_SELECTED_RATIONALE,
  DecisionRationaleCode.ACTION_REJECTED_RATIONALE,
  DecisionRationaleCode.ACTION_SUPPRESSED_RATIONALE,
  DecisionRationaleCode.ACTION_DEFERRED_RATIONALE,
  DecisionRationaleCode.HANDOFF_PERMITTED_RATIONALE,
  DecisionRationaleCode.HANDOFF_BLOCKED_RATIONALE,
  DecisionRationaleCode.OUTCOME_RECORDED_RATIONALE,
];

export type DecisionRationaleCodeValue = `${DecisionRationaleCode}`;
