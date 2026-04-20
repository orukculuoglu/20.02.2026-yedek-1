import type { ThresholdComparableValue } from "./threshold-comparable-value.type.js";
import type { ThresholdUnit } from "./threshold-unit.enum.js";

/**
 * ThresholdBoundary - Union type for scalar or range-based threshold measurement boundaries
 * Pure structural definition with no computed values, live measurements, or normalized outputs.
 * Boundary values are strictly bounded to comparable types (string, number, boolean, null, or arrays thereof).
 */
export type ThresholdBoundary =
  | {
      /**
       * Scalar boundary - single value comparison point
       */
      readonly kind: "scalar";

      /**
       * The boundary measurement value
       * Bounded to comparable primitive types (string, number, boolean, null, or arrays)
       * Caller-provided, no type inference or conversion
       */
      readonly value: ThresholdComparableValue;
    }
  | {
      /**
       * Range boundary - values within or outside a bounded interval
       */
      readonly kind: "range";

      /**
       * Minimum boundary value (inclusive)
       * Bounded to comparable primitive types
       */
      readonly minValue: ThresholdComparableValue;

      /**
       * Maximum boundary value (inclusive)
       * Bounded to comparable primitive types
       */
      readonly maxValue: ThresholdComparableValue;
    };

/**
 * ThresholdValue - Measurement boundary with bounded unit classification
 * Pure structural definition with no measurement loading or live value resolution.
 */
export interface ThresholdValue {
  /**
   * Boundary surface - either scalar or range
   */
  readonly boundary: ThresholdBoundary;

  /**
   * Optional unit classification for the threshold value
   * Selected from bounded vocabulary (PERCENT, SECONDS, COUNT, SCORE, etc.)
   * Informational only; no conversion or normalization logic included
   */
  readonly unit?: ThresholdUnit;
}
