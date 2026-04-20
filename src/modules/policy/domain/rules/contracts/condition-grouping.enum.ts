/**
 * ConditionGrouping - Domain vocabulary for policy condition grouping modes
 * Pure vocabulary term with no traversal logic or evaluation behavior.
 */
export enum ConditionGrouping {
  ALL = "all",
  ANY = "any",
  NONE = "none",
}

/**
 * Type-safe condition grouping value type
 */
export type ConditionGroupingValue = `${ConditionGrouping}`;

/**
 * Bounded set of all valid condition grouping modes
 */
export const CONDITION_GROUPINGS_ALL: ReadonlyArray<ConditionGrouping> = Object.values(
  ConditionGrouping
);
