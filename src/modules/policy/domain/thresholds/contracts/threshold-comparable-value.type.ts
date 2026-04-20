/**
 * ThresholdComparableValue - Bounded comparable value type for threshold definitions
 * Pure structural type with no parsing, coercion, or normalization behavior.
 * Defines what types of values can be used in threshold boundary comparisons.
 */
export type ThresholdComparableValue =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<string | number | boolean | null>;
