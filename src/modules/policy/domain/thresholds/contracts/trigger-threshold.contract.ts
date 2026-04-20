import type { ThresholdDirection } from "./threshold-direction.enum.js";
import type { ThresholdValue } from "./threshold-value.contract.js";

/**
 * TriggerThreshold - Trigger threshold definition for policy rule activation
 * Pure structural definition with no fired/not-fired state or trigger execution semantics.
 * Structural declaration of thresholds that define when a rule/policy becomes trigger-relevant.
 */
export interface TriggerThreshold {
  /**
   * Unique identifier for this threshold
   */
  readonly thresholdId: string;

  /**
   * Direction indicating breach or boundary comparison semantics
   * Determines how to interpret threshold crossing (ABOVE, BELOW, INSIDE_RANGE, etc.)
   */
  readonly direction: ThresholdDirection;

  /**
   * Measurement boundary definition (scalar or range)
   */
  readonly value: ThresholdValue;
}
