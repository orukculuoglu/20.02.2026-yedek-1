/**
 * ApprovalBoundaryReference - Minimal reference contract for approval boundaries
 * Pure reference structure with no boundary loading or resolution behavior.
 */
export interface ApprovalBoundaryReference {
  /**
   * Unique identifier for the referenced approval boundary
   * No boundary loading or boundary structure resolution included
   */
  readonly approvalBoundaryId: string;
}
