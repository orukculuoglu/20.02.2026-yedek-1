/**
 * HandoffRationaleCode - Bounded vocabulary for execution boundary handoff outcome reasons
 * Identifies why an action is in its particular handoff state at the execution boundary.
 * Captures only handoff-surface decisions, not execution, dispatch, or workflow semantics.
 * Pure vocabulary; no execution engine or dispatch logic.
 */
export enum HandoffRationaleCode {
  /**
   * Action ready for downstream execution handoff
   */
  READY_FOR_EXECUTION = "ready_for_execution",

  /**
   * Action pending approval before execution handoff
   */
  PENDING_APPROVAL = "pending_approval",

  /**
   * Action blocked from execution handoff at boundary
   */
  BLOCKED_AT_BOUNDARY = "blocked_at_boundary",

  /**
   * Action deferred from execution handoff
   */
  DEFERRED_FROM_EXECUTION = "deferred_from_execution",
}

/**
 * HandoffRationaleCode value type for serialized handoff rationale code strings
 */
export type HandoffRationaleCodeValue = `${HandoffRationaleCode}`;

/**
 * All values in HandoffRationaleCode for bounded collection usage
 */
export const HANDOFF_RATIONALE_CODES_ALL = Object.freeze([
  HandoffRationaleCode.READY_FOR_EXECUTION,
  HandoffRationaleCode.PENDING_APPROVAL,
  HandoffRationaleCode.BLOCKED_AT_BOUNDARY,
  HandoffRationaleCode.DEFERRED_FROM_EXECUTION,
] as const);
