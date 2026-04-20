/**
 * PolicyOperator - Domain vocabulary for policy condition comparison operators
 * Pure vocabulary term with no evaluation behavior or result semantics.
 */
export enum PolicyOperator {
  EQ = "eq",
  NEQ = "neq",
  GT = "gt",
  GTE = "gte",
  LT = "lt",
  LTE = "lte",
  IN = "in",
  NOT_IN = "not_in",
  EXISTS = "exists",
  NOT_EXISTS = "not_exists",
}

/**
 * Type-safe policy operator value type
 */
export type PolicyOperatorValue = `${PolicyOperator}`;

/**
 * Bounded set of all valid policy operators
 */
export const POLICY_OPERATORS_ALL: ReadonlyArray<PolicyOperator> = Object.values(
  PolicyOperator
);
