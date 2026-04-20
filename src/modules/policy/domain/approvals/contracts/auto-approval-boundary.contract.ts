/**
 * AutoApprovalBoundary - Auto-approval eligibility definition
 * Pure structural definition with no approved/not-approved runtime state or execution outcome.
 * Structural declaration that a policy path may proceed without external approval.
 * Type presence itself indicates auto-approval is permitted; no redundant flags.
 */
export interface AutoApprovalBoundary {
  /**
   * Unique identifier for this approval boundary
   */
  readonly approvalBoundaryId: string;
}
