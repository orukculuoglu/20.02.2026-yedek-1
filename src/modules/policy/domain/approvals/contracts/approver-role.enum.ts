/**
 * ApproverRole - Domain vocabulary for approval-side actor or approver roles
 * Pure vocabulary term with no identity lookup, access control, or permission checks.
 */
export enum ApproverRole {
  SYSTEM = "system",
  OPERATOR = "operator",
  SUPERVISOR = "supervisor",
  MANAGER = "manager",
  ADMIN = "admin",
}

/**
 * Type-safe approver role value type
 */
export type ApproverRoleValue = `${ApproverRole}`;

/**
 * Bounded set of all valid approver roles
 */
export const APPROVER_ROLES_ALL: ReadonlyArray<ApproverRole> = Object.values(
  ApproverRole
);
