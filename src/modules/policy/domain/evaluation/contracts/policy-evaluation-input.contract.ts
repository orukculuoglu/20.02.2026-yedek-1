import type { RuleSelection } from "./rule-selection.contract.js";

/**
 * PolicyEvaluationInput - Structural contract for single-policy evaluation input
 * Pure structural definition of what enters policy evaluation for a single policy.
 * Reference-only contract; no data loading, resolution, or interpretation.
 * No hidden semantics: all structural choices are explicit.
 */
export interface PolicyEvaluationInput {
  /**
   * Unique identifier for this evaluation instance
   */
  readonly evaluationId: string;

  /**
   * Identifier of the single policy being evaluated
   */
  readonly policyId: string;

  /**
   * Explicit rule selection for which rules in the policy will be evaluated
   * Choices are explicit via discriminated union: ALL or SPECIFIC rule IDs
   * No hidden semantics; empty collections do not imply execution meaning
   */
  readonly ruleSelection: RuleSelection;

  /**
   * Reference identifier to the threshold definitions applicable to this evaluation
   * Optional; present only if threshold conditions are part of the policy evaluation
   */
  readonly thresholdSetReference?: string;

  /**
   * Reference identifier to the approval boundary definitions applicable to this evaluation
   * Optional; present only if approval conditions are part of the policy evaluation
   */
  readonly approvalBoundarySetReference?: string;

  /**
   * Reference identifiers to evidence inputs available for evaluation
   * May be empty if no evidence is required
   */
  readonly evidenceReferences: ReadonlyArray<string>;

  /**
   * Reference identifier to the evaluation context/subject being evaluated
   * Optional; may reference a system component, resource, action, or other evaluation subject
   * No context loading or interpretation included
   */
  readonly evaluationContextReference?: string;
}
