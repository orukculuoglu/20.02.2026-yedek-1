/**
 * Policy Threshold Contracts - Phase 3 Export Surface
 * Compile-time threshold definition layer for Motor 3 Policy Foundation
 * Strict, declarative, contract-first - zero evaluation semantics
 */

// Non-empty readonly array type (structural utility)
export type { NonEmptyReadonlyArray } from "./non-empty-readonly-array.type.js";

// Threshold kind vocabulary
export {
  ThresholdKind,
  type ThresholdKindValue,
  THRESHOLD_KINDS_ALL,
} from "./threshold-kind.enum.js";

// Threshold direction vocabulary
export {
  ThresholdDirection,
  type ThresholdDirectionValue,
  THRESHOLD_DIRECTIONS_ALL,
} from "./threshold-direction.enum.js";

// Threshold unit vocabulary
export {
  ThresholdUnit,
  type ThresholdUnitValue,
  THRESHOLD_UNITS_ALL,
} from "./threshold-unit.enum.js";

// Threshold binding dimension vocabulary
export {
  ThresholdBindingDimension,
  type ThresholdBindingDimensionValue,
  THRESHOLD_BINDING_DIMENSIONS_ALL,
} from "./threshold-binding-dimension.enum.js";

// Threshold comparable value type
export type { ThresholdComparableValue } from "./threshold-comparable-value.type.js";

// Threshold reference
export type { ThresholdReference } from "./threshold-reference.contract.js";

// Threshold value definition (scalar and range support with bounded values)
export type {
  ThresholdBoundary,
  ThresholdValue,
} from "./threshold-value.contract.js";

// Trigger threshold definition
export type { TriggerThreshold } from "./trigger-threshold.contract.js";

// Block threshold definition
export type { BlockThreshold } from "./block-threshold.contract.js";

// Escalation threshold definition
export type { EscalationThreshold } from "./escalation-threshold.contract.js";

// Threshold binding structure
export type { ThresholdBinding } from "./threshold-binding.contract.js";

// Policy-level threshold aggregation (with structural enforcement)
export type { PolicyThresholdSet } from "./policy-threshold-set.contract.js";
