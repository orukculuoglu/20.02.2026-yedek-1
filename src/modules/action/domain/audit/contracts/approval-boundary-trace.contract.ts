/**
 * ApprovalBoundaryTrace - Links audit trace to approval boundary structures
 */
export interface ApprovalBoundaryTrace {
  readonly traceId: string;
  readonly policyId: string;
  readonly approvalBoundaryId: string;
  readonly approvalBoundarySetReference?: string;
}
