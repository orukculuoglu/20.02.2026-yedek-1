/**
 * ThresholdUnit - Domain vocabulary for threshold measurement unit classification
 * Pure vocabulary term with no conversion, normalization, or calculation behavior.
 * Bounded set of measurement units for policy threshold values.
 */
export enum ThresholdUnit {
  PERCENT = "percent",
  SECONDS = "seconds",
  MILLISECONDS = "milliseconds",
  COUNT = "count",
  SCORE = "score",
  RATIO = "ratio",
  LEVEL = "level",
  UNITLESS = "unitless",
}

/**
 * Type-safe threshold unit value type
 */
export type ThresholdUnitValue = `${ThresholdUnit}`;

/**
 * Bounded set of all valid threshold units
 */
export const THRESHOLD_UNITS_ALL: ReadonlyArray<ThresholdUnit> = Object.values(
  ThresholdUnit
);
