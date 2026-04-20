/**
 * PolicyStatus - Domain vocabulary for policy administrative state
 * Pure vocabulary term with no runtime behavior.
 */
export enum PolicyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ARCHIVED = "archived",
  DRAFT = "draft",
  SUSPENDED = "suspended",
}

/**
 * Type-safe policy status value type
 */
export type PolicyStatusValue = `${PolicyStatus}`;

/**
 * Bounded set of all valid policy statuses
 */
export const POLICY_STATUSES_ALL: ReadonlyArray<PolicyStatus> =
  Object.values(PolicyStatus);
