/**
 * DeferredApprovalBoundary - Deferred approval boundary definition
 * Pure structural definition with no deferred execution scheduling or queueing behavior.
 * Structural declaration that progression is deferred under this approval boundary.
 * Type presence itself indicates deferral applies; no redundant flags.
 */
export interface DeferredApprovalBoundary {
  /**
   * Unique identifier for this approval boundary
   */
  readonly approvalBoundaryId: string;
}
