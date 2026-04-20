/**
 * ThresholdBindingDimension - Domain vocabulary for policy-side measurable dimensions
 * Pure vocabulary term indicating what policy-level metric/dimension a threshold binds to.
 * No live measurement, resolution, or dynamic dimension selection included.
 */
export enum ThresholdBindingDimension {
  CONFIDENCE = "confidence",
  SEVERITY = "severity",
  PRESSURE = "pressure",
  SCORE = "score",
  LOAD = "load",
  UTILIZATION = "utilization",
}

/**
 * Type-safe threshold binding dimension value type
 */
export type ThresholdBindingDimensionValue = `${ThresholdBindingDimension}`;

/**
 * Bounded set of all valid binding dimensions
 */
export const THRESHOLD_BINDING_DIMENSIONS_ALL: ReadonlyArray<ThresholdBindingDimension> = Object.values(
  ThresholdBindingDimension
);
