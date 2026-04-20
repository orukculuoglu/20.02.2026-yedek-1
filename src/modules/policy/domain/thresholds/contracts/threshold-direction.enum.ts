/**
 * ThresholdDirection - Domain vocabulary for threshold comparison direction
 * Pure vocabulary term indicating breach direction or boundary comparison semantics.
 * No breach detection or evaluation behavior included.
 */
export enum ThresholdDirection {
  ABOVE = "above",
  BELOW = "below",
  AT_OR_ABOVE = "at_or_above",
  AT_OR_BELOW = "at_or_below",
  INSIDE_RANGE = "inside_range",
  OUTSIDE_RANGE = "outside_range",
}

/**
 * Type-safe threshold direction value type
 */
export type ThresholdDirectionValue = `${ThresholdDirection}`;

/**
 * Bounded set of all valid threshold directions
 */
export const THRESHOLD_DIRECTIONS_ALL: ReadonlyArray<ThresholdDirection> = Object.values(
  ThresholdDirection
);
