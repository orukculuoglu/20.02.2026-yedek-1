/**
 * ConfirmationRequiredBoundary - Confirmation requirement definition
 * Pure structural definition with no confirmation state or workflow orchestration.
 * Structural declaration that a policy path requires confirmation but not necessarily full approval.
 * Type presence itself indicates confirmation is required; no redundant flags.
 */
export interface ConfirmationRequiredBoundary {
  /**
   * Unique identifier for this approval boundary
   */
  readonly approvalBoundaryId: string;
}
