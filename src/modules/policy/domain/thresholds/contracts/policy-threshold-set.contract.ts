import type { TriggerThreshold } from "./trigger-threshold.contract.js";
import type { BlockThreshold } from "./block-threshold.contract.js";
import type { EscalationThreshold } from "./escalation-threshold.contract.js";
import type { ThresholdBinding } from "./threshold-binding.contract.js";
import type { NonEmptyReadonlyArray } from "./non-empty-readonly-array.type.js";

/**
 * PolicyThresholdSet - Complete aggregation container for policy-level threshold definitions
 * Pure structural aggregation with no threshold evaluation or dynamic threshold selection.
 * Structurally enforced: must contain at least one threshold collection (trigger, block, or escalation).
 * An empty threshold aggregate is impossible at the type level.
 *
 * Valid structures:
 * - Variant 1: triggerThresholds required, others optional
 * - Variant 2: blockThresholds required, others optional
 * - Variant 3: escalationThresholds required, others optional
 */
export type PolicyThresholdSet =
  | {
      /**
       * Identifier for the policy this threshold set belongs to
       * Reference only; no policy loading or metadata resolution included
       */
      readonly policyId: string;

      /**
       * Collection of trigger threshold definitions for this policy
       * Required in this variant; defines the aggregate as trigger-bearing
       * Must contain at least one trigger threshold (non-empty at compile time)
       * Structural definitions of thresholds that activate or trigger rules
       */
      readonly triggerThresholds: NonEmptyReadonlyArray<TriggerThreshold>;

      /**
       * Collection of block threshold definitions for this policy
       * Optional in this variant
       * Structural definitions of thresholds that prevent or block progression
       */
      readonly blockThresholds?: ReadonlyArray<BlockThreshold>;

      /**
       * Collection of escalation threshold definitions for this policy
       * Optional in this variant
       * Structural definitions of thresholds that trigger escalation conditions
       */
      readonly escalationThresholds?: ReadonlyArray<EscalationThreshold>;

      /**
       * Collection of threshold bindings for this policy
       * Each binding connects a policy-measurable dimension to a threshold by ID
       */
      readonly bindings: ReadonlyArray<ThresholdBinding>;
    }
  | {
      /**
       * Identifier for the policy this threshold set belongs to
       * Reference only; no policy loading or metadata resolution included
       */
      readonly policyId: string;

      /**
       * Collection of trigger threshold definitions for this policy
       * Optional in this variant
       */
      readonly triggerThresholds?: ReadonlyArray<TriggerThreshold>;

      /**
       * Collection of block threshold definitions for this policy
       * Required in this variant; defines the aggregate as block-bearing
       * Must contain at least one block threshold (non-empty at compile time)
       * Structural definitions of thresholds that prevent or block progression
       */
      readonly blockThresholds: NonEmptyReadonlyArray<BlockThreshold>;

      /**
       * Collection of escalation threshold definitions for this policy
       * Optional in this variant
       */
      readonly escalationThresholds?: ReadonlyArray<EscalationThreshold>;

      /**
       * Collection of threshold bindings for this policy
       * Each binding connects a policy-measurable dimension to a threshold by ID
       */
      readonly bindings: ReadonlyArray<ThresholdBinding>;
    }
  | {
      /**
       * Identifier for the policy this threshold set belongs to
       * Reference only; no policy loading or metadata resolution included
       */
      readonly policyId: string;

      /**
       * Collection of trigger threshold definitions for this policy
       * Optional in this variant
       */
      readonly triggerThresholds?: ReadonlyArray<TriggerThreshold>;

      /**
       * Collection of block threshold definitions for this policy
       * Optional in this variant
       */
      readonly blockThresholds?: ReadonlyArray<BlockThreshold>;

      /**
       * Collection of escalation threshold definitions for this policy
       * Required in this variant; defines the aggregate as escalation-bearing
       * Must contain at least one escalation threshold (non-empty at compile time)
       * Structural definitions of thresholds that trigger escalation conditions
       */
      readonly escalationThresholds: NonEmptyReadonlyArray<EscalationThreshold>;

      /**
       * Collection of threshold bindings for this policy
       * Each binding connects a policy-measurable dimension to a threshold by ID
       */
      readonly bindings: ReadonlyArray<ThresholdBinding>;
    };
