/**
 * BlockedApprovalBoundary - Blocked approval boundary definition
 * Pure structural definition with no blocked/unblocked runtime state or enforcement logic.
 * Structural declaration that progression is blocked under this approval boundary.
 * Type presence itself indicates blocking applies; no redundant flags.
 */
export interface BlockedApprovalBoundary {
  /**
   * Unique identifier for this approval boundary
   */
  readonly approvalBoundaryId: string;
}
