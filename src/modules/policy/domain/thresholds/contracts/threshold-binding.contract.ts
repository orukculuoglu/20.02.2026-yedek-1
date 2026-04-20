import type { ThresholdBindingDimension } from "./threshold-binding-dimension.enum.js";

/**
 * ThresholdBinding - Pure dimension-to-threshold reference binding
 * Pure structural reference binding with no live value resolution or dynamic dimension selection.
 * Connects a policy-side metric/dimension to a threshold by ID only.
 * Threshold role is implicit in the referenced threshold definition (not duplicated here).
 */
export interface ThresholdBinding {
  /**
   * The policy-side measurable dimension this threshold binds to
   * Examples: confidence, severity, pressure, score, load, utilization
   */
  readonly dimension: ThresholdBindingDimension;

  /**
   * Identifier of the threshold being bound
   * Reference only; no threshold loading or structure resolution included
   * The threshold definition (and its role: trigger, block, or escalation) is found in PolicyThresholdSet
   */
  readonly thresholdId: string;
}
