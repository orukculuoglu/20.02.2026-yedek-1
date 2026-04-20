/**
 * ApprovalMode - Domain vocabulary for policy approval requirement
 * Pure vocabulary term with no runtime behavior.
 */
export enum ApprovalMode {
  AUTO = "auto",
  REQUIRES_APPROVAL = "requires_approval",
  REQUIRES_CONFIRMATION = "requires_confirmation",
  MANUAL = "manual",
}

/**
 * Type-safe approval mode value type
 */
export type ApprovalModeValue = `${ApprovalMode}`;

/**
 * Bounded set of all valid approval modes
 */
export const APPROVAL_MODES_ALL: ReadonlyArray<ApprovalMode> =
  Object.values(ApprovalMode);
