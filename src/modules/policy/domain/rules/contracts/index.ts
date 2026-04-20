/**
 * Policy Rule Contracts - Phase 2 Export Surface
 * Compile-time rule definition layer for Motor 3 Policy Foundation
 * Strict, declarative, contract-first - zero execution semantics
 */

// Policy operator vocabulary
export {
  PolicyOperator,
  type PolicyOperatorValue,
  POLICY_OPERATORS_ALL,
} from "./policy-operator.enum.js";

// Condition grouping vocabulary
export {
  ConditionGrouping,
  type ConditionGroupingValue,
  CONDITION_GROUPINGS_ALL,
} from "./condition-grouping.enum.js";

// Evidence binding reference
export type { EvidenceBinding } from "./evidence-binding.contract.js";

// Policy condition definition
export type { PolicyCondition } from "./policy-condition.contract.js";

// Policy condition group definition
export type { PolicyConditionGroup } from "./policy-condition-group.contract.js";

// Policy rule definition
export type { PolicyRule } from "./policy-rule.contract.js";

// Policy rule reference
export type { PolicyRuleReference } from "./policy-rule-reference.contract.js";
