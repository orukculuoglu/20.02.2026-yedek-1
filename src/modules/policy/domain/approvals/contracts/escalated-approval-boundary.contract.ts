/**
 * EscalatedApprovalBoundary - Escalated approval boundary definition
 * Pure structural definition with no escalation routing or assignment behavior.
 * Structural declaration that escalation is required under this approval boundary.
 * Type presence itself indicates escalation is required; no redundant flags.
 */
export interface EscalatedApprovalBoundary {
  /**
   * Unique identifier for this approval boundary
   */
  readonly approvalBoundaryId: string;
}
