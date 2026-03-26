/**
 * ComparisonDirection.ts
 * Explicit structural representation of comparison direction.
 * Includes basis for direction determination, preventing implicit inference.
 */

/**
 * ComparisonDirectionType: Explicit enumeration of all possible directions.
 * Includes INDETERMINATE as a first-class value, not an implicit default.
 */
export enum ComparisonDirectionType {
  /// Current > Previous (or target > source)
  INCREASE = "increase",
  /// Current < Previous (or target < source)
  DECREASE = "decrease",
  /// Current == Previous (within tolerance if applicable)
  UNCHANGED = "unchanged",
  /// Direction cannot be determined (insufficient data, conflicting signals)
  INDETERMINATE = "indeterminate",
}

/**
 * DirectionBasis: Explicit reason why direction was determined.
 * Prevents consumers from inferring the determination method.
 */
export enum DirectionBasis {
  /// Direction determined from sign of delta (positive/negative)
  DELTA_SIGN = "delta_sign",
  /// Direction determined from sequence position comparison
  SEQUENCE_POSITION = "sequence_position",
  /// Direction explicitly marked (not inferred)
  EXPLICIT_MARKING = "explicit_marking",
  /// Insufficient data to determine direction
  INSUFFICIENT_DATA = "insufficient_data",
}

/**
 * ComparisonDirectionContract: Direction of change with structural transparency.
 * Always includes basis for determination, not implicit.
 */
export interface ComparisonDirectionContract {
  direction: ComparisonDirectionType;
  /// The determined direction
  basis: DirectionBasis;
  /// Why this direction was determined
  confidence?: number;
  /// Optional confidence [0-1] if quantifiable
}
