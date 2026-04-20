import type { ApproverRole } from "./approver-role.enum.js";

/**
 * ManualApprovalBoundary - Manual approval requirement definition
 * Pure structural definition with no approver decisions or workflow orchestration.
 * Structural declaration that a policy path requires explicit approval before progression.
 */
export interface ManualApprovalBoundary {
  /**
   * Unique identifier for this approval boundary
   */
  readonly approvalBoundaryId: string;

  /**
   * Required approver role for this boundary
   * Indicates which role classification is needed to approve progression
   * No permission checks or identity validation included
   */
  readonly requiredApproverRole: ApproverRole;
}
