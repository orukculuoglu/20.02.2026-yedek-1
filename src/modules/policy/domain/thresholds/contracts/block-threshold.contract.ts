import type { ThresholdDirection } from "./threshold-direction.enum.js";
import type { ThresholdValue } from "./threshold-value.contract.js";

/**
 * BlockThreshold - Block threshold definition for policy progression control
 * Pure structural definition with no blocked/unblocked runtime state or blocking logic.
 * Structural declaration of thresholds that define when policy progression or downstream action becomes blocked.
 */
export interface BlockThreshold {
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
