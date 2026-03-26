/**
 * ThresholdBreach.ts
 * Explicit representation of threshold crossings.
 * Includes threshold reference identity and breach direction.
 * Does not evaluate business meaning of the breach.
 */

/**
 * BreachDirection: Explicit enumeration of threshold crossing direction.
 * No ambiguity about which side threshold was crossed from.
 */
export enum BreachDirection {
  /// Value crossed above the threshold
  CROSSED_ABOVE = "crossed_above",
  /// Value crossed below the threshold
  CROSSED_BELOW = "crossed_below",
  /// Value did not cross the threshold
  NOT_CROSSED = "not_crossed",
}

/**
 * ThresholdBreachReference: Structural reference to a threshold and violation facts.
 * Includes the threshold identity, not inlined definition.
 */
export interface ThresholdBreachReference {
  thresholdId: string;
  /// Reference to threshold definition (identity only)
  thresholdValue: number;
  /// The threshold value itself
  actualValue: number;
  /// Measured value at breach point
  breachDirection: BreachDirection;
  /// Direction threshold was crossed
  breachAmount: number;
  /// Magnitude of breach (|actualValue - thresholdValue|)
}

/**
 * ThresholdBreach: Complete structural record of threshold violation.
 * No business interpretation (severity, risk, etc.); facts only.
 */
export interface ThresholdBreach {
  breachId: string;
  /// Unique identifier for this breach instance
  threshold: ThresholdBreachReference;
  /// Threshold and breach facts
  windowIds: string[];
  /// Which windows this breach applies to
  triggeredAt?: number;
  /// Optional: timestamp when breach occurred (absolute, milliseconds)
}
