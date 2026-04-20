import type { PolicyCondition } from "./policy-condition.contract.js";
import type { PolicyConditionGroup } from "./policy-condition-group.contract.js";

/**
 * PolicyRule - Rule definition structure for policy evaluation contracts
 * Pure structural definition with no execution output, approval state, or runtime behavior.
 * Brings together policy identity and the complete rule condition structure.
 */
export interface PolicyRule {
  /**
   * Unique identifier for this rule within the policy domain
   */
  readonly ruleId: string;

  /**
   * Reference to the policy this rule belongs to
   * Caller-provided policy identifier, no policy loading or metadata resolution included
   */
  readonly policyId: string;

  /**
   * Root condition or condition group that defines this rule's evaluation surface
   * Can be a single atomic condition or a hierarchical group with nested conditions
   */
  readonly rootCondition: PolicyCondition | PolicyConditionGroup;
}
