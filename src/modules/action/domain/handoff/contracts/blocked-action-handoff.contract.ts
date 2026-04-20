import type { HandoffRationale } from "./handoff-rationale.contract.js";

/**
 * BlockedActionHandoff - Structural definition of an action blocked from execution boundary
 * Pure structural definition of an action that is blocked from crossing the execution boundary.
 * Contains reference to action and optional boundary/constraint linkage and rationale.
 * No enforcement logic or block/unblock state machine.
 */
export interface BlockedActionHandoff {
  /**
   * Unique identifier for this blocked-action handoff result
   */
  readonly handoffId: string;

  /**
   * Reference identifier to the action that is blocked
   */
  readonly selectedActionId: string;

  /**
   * Optional reference identifier to the blocking constraint or boundary
   */
  readonly blockingConstraintId?: string;

  /**
   * Optional rationale references explaining why this action is blocked
   * May be empty if blocking rationale is implicit
   */
  readonly handoffRationales: ReadonlyArray<HandoffRationale>;
}
