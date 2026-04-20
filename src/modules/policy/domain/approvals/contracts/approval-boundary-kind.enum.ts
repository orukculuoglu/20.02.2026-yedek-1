/**
 * ApprovalBoundaryKind - Domain vocabulary for approval boundary role classification
 * Pure vocabulary term with no workflow execution or decision semantics.
 */
export enum ApprovalBoundaryKind {
  AUTO_APPROVAL = "auto_approval",
  MANUAL_APPROVAL = "manual_approval",
  CONFIRMATION = "confirmation",
  BLOCKED = "blocked",
  DEFERRED = "deferred",
  ESCALATED = "escalated",
}

/**
 * Type-safe approval boundary kind value type
 */
export type ApprovalBoundaryKindValue = `${ApprovalBoundaryKind}`;

/**
 * Bounded set of all valid approval boundary kinds
 */
export const APPROVAL_BOUNDARY_KINDS_ALL: ReadonlyArray<ApprovalBoundaryKind> = Object.values(
  ApprovalBoundaryKind
);
