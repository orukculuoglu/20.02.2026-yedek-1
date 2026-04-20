import type { PolicyOperator } from "./policy-operator.enum.js";
import type { EvidenceBinding } from "./evidence-binding.contract.js";

/**
 * PolicyCondition - Strict condition definition for policy rule evaluation
 * Pure structural definition with no evaluation state, result, or runtime behavior.
 * Single atomic condition comparing a subject against an expected value.
 */
export interface PolicyCondition {
  /**
   * Unique identifier for this condition within its containing rule
   */
  readonly conditionId: string;

  /**
   * Subject of the comparison - field/property/operand being evaluated
   * Examples: "capacity.available", "inventory.onhand", "response_time"
   * No field resolution or value fetching included
   */
  readonly subject: string;

  /**
   * Comparison operator to apply between subject and expected value
   */
  readonly operator: PolicyOperator;

  /**
   * Expected/comparison target value
   * Type depends on subject and operator (number, string, boolean, etc.)
   * Caller-provided, no type inference or conversion
   */
  readonly expectedValue: unknown;

  /**
   * Optional evidence binding references
   * Links this condition to supporting evidence/data sources
   * Reference only - no evidence loading or resolution included
   */
  readonly evidenceBindings?: ReadonlyArray<EvidenceBinding>;
}
