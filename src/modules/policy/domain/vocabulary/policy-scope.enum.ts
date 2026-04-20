/**
 * PolicyScope - Domain vocabulary for policy applicability boundary type
 * Pure vocabulary term with no runtime behavior.
 */
export enum PolicyScope {
  GLOBAL = "global",
  BY_REGION = "by_region",
  BY_RESOURCE = "by_resource",
  BY_ACTION = "by_action",
  BY_CONTEXT = "by_context",
  BY_ROLE = "by_role",
}

/**
 * Type-safe policy scope value type
 */
export type PolicyScopeValue = `${PolicyScope}`;

/**
 * Bounded set of all valid policy scopes
 */
export const POLICY_SCOPES_ALL: ReadonlyArray<PolicyScope> =
  Object.values(PolicyScope);
