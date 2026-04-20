/**
 * ApprovalRequirementBinding - Pure reference binding between policy requirements and boundaries
 * Pure structural reference binding with no runtime decision logic or state tracking.
 * Boundary role is implicit in the referenced boundary definition type (not duplicated here).
 */
export interface ApprovalRequirementBinding {
  /**
   * Identifier of the approval boundary being referenced
   * Reference only; no boundary loading or structure resolution included
   * The boundary definition (and its role/kind) is found in PolicyApprovalBoundarySet
   */
  readonly approvalBoundaryId: string;
}
