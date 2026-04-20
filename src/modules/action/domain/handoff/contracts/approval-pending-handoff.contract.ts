import type { HandoffRationale } from "./handoff-rationale.contract.js";

/**
 * ApprovalPendingHandoff - Structural definition of an action pending approval
 * Pure structural definition of an action that cannot cross the execution boundary pending approval.
 * Contains reference to selected action and optional approval/handoff rationale.
 * No approval workflow state machine or approver decision tracking.
 */
export interface ApprovalPendingHandoff {
  /**
   * Unique identifier for this approval-pending handoff result
   */
  readonly handoffId: string;

  /**
   * Reference identifier to the selected action awaiting approval
   */
  readonly selectedActionId: string;

  /**
   * Optional reference identifier to the approval boundary requiring approval
   */
  readonly approvalBoundaryId?: string;

  /**
   * Optional rationale references explaining why approval is pending
   * May be empty if approval-pending rationale is implicit
   */
  readonly handoffRationales: ReadonlyArray<HandoffRationale>;
}
