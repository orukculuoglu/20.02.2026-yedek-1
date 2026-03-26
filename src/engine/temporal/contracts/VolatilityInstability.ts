/**
 * VolatilityInstability.ts
 * Structural flags for volatility and instability.
 * Flags are markers only; no business interpretation or risk scoring.
 */

/**
 * VolatilityFlag: Structural marker for volatility.
 * Presence/absence and variance basis are explicit, not inferred.
 */
export interface VolatilityFlag {
  isVolatile: boolean;
  /// True if volatility detected; false otherwise
  volatilityBasis?: VolatilityBasisType;
  /// How volatility was determined (if flagged volatile)
  volatilityMeasure?: number;
  /// Numeric measure (variance, range, etc.) if applicable
}

/**
 * VolatilityBasisType: Explicit enumeration of volatility determination methods.
 */
export enum VolatilityBasisType {
  /// Based on statistical variance
  VARIANCE = "variance",
  /// Based on range (max - min)
  RANGE = "range",
  /// Based on standard deviation
  DEVIATION = "deviation",
  /// Based on coefficient of variation
  COEFFICIENT_OF_VARIATION = "coefficient_of_variation",
  /// Explicitly marked (not computed)
  EXPLICIT_MARKING = "explicit_marking",
}

/**
 * InstabilityFlag: Structural marker for instability.
 * Distinct from volatility; indicates oscillation or discontinuity.
 */
export interface InstabilityFlag {
  isUnstable: boolean;
  /// True if instability detected; false otherwise
  instabilityBasis?: InstabilityBasisType;
  /// How instability was determined (if flagged unstable)
  instabilityMeasure?: number;
  /// Numeric measure if applicable
}

/**
 * InstabilityBasisType: Explicit enumeration of instability determination methods.
 */
export enum InstabilityBasisType {
  /// Based on oscillation patterns (direction reversals)
  OSCILLATION = "oscillation",
  /// Based on discontinuities or jumps
  DISCONTINUITY = "discontinuity",
  /// Based on rapid state changes
  RAPID_CHANGE = "rapid_change",
  /// Explicitly marked (not computed)
  EXPLICIT_MARKING = "explicit_marking",
}

/**
 * VolatilityInstabilityContract: Combined structural flags for volatility and instability.
 * Purely descriptive; no business interpretation or risk semantics.
 */
export interface VolatilityInstabilityContract {
  volatility: VolatilityFlag;
  /// Volatility marker
  instability: InstabilityFlag;
  /// Instability marker
  measuredDuringMs?: number;
  /// Optional: duration over which these flags were measured
}
