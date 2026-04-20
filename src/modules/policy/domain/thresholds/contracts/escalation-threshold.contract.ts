import type { ThresholdDirection } from "./threshold-direction.enum.js";
import type { ThresholdValue } from "./threshold-value.contract.js";

/**
 * EscalationThreshold - Escalation threshold definition for policy escalation points
 * Pure structural definition with no escalation execution or escalation workflow state.
 * Structural declaration of thresholds that define when a policy condition should escalate.
 */
export interface EscalationThreshold {
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
