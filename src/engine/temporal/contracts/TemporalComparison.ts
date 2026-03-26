/**
 * Temporal Comparison Definitions
 * Defines how windows are compared and structured temporally.
 * Pure contracts for deterministic window comparison.
 */

/**
 * ComparisonType enum
 * Defines the mathematical basis for window comparison.
 * - ABSOLUTE: Direct value comparison (W1 vs W2)
 * - RELATIVE: Proportional change (W2/W1)
 * - DELTA: Absolute difference (W2 - W1)
 * - RATIO: Normalized ratio (W2:W1)
 * - INDEX: Based on indexed values (baseline = 100)
 */
export enum ComparisonType {
  ABSOLUTE = "ABSOLUTE",
  RELATIVE = "RELATIVE",
  DELTA = "DELTA",
  RATIO = "RATIO",
  INDEX = "INDEX",
}

/**
 * AlignmentType enum
 * Defines how windows are temporally aligned.
 * - ALIGNED: Both windows span exact same time period
 * - ANCHORED_START: Windows aligned at start point, may differ in length
 * - ANCHORED_END: Windows aligned at end point, may differ in length
 * - SLIDING: Windows of same length, sliding across timeline
 * - OFFSET: Windows explicitly offset by a fixed duration
 * - CONCURRENT: Windows overlap but don't necessarily align
 */
export enum AlignmentType {
  ALIGNED = "ALIGNED",
  ANCHORED_START = "ANCHORED_START",
  ANCHORED_END = "ANCHORED_END",
  SLIDING = "SLIDING",
  OFFSET = "OFFSET",
  CONCURRENT = "CONCURRENT",
}

/**
 * TemporalGrain enum
 * Defines the atomic time unit for a window.
 * Ordered from finest to coarsest granularity.
 */
export enum TemporalGrain {
  MILLISECOND = "MILLISECOND",
  SECOND = "SECOND",
  MINUTE = "MINUTE",
  HOUR = "HOUR",
  DAY = "DAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
  QUARTER = "QUARTER",
  YEAR = "YEAR",
}

/**
 * TemporalComparisonContract
 * Explicit contract for how windows are compared.
 * No defaults. All comparison parameters must be declared.
 */
export interface TemporalComparisonContract {
  comparisonType: ComparisonType;
  alignmentType: AlignmentType;
  grain: TemporalGrain;
}
