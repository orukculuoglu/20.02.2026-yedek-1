import type { ActionOrigin } from "./action-origin.enum.js";
import type { PolicyActionReference } from "./policy-action-reference.contract.js";
import type { EvaluationActionReference } from "./evaluation-action-reference.contract.js";
import type { ActionMetadata } from "../../foundation/contracts/action-metadata.contract.js";
import type { ActionCandidateRationale } from "./action-candidate-rationale.contract.js";
import type { ActionCandidateExplanation } from "./action-candidate-explanation.contract.js";

/**
 * ActionCandidate - Structural definition of an action candidate at compile time
 * Pure structural definition of a candidate action before selection or execution.
 * Contains candidate identity, origin, policy/evaluation linkage, and explanation.
 * No selected/rejected state, execution result, or dispatch state.
 */
export interface ActionCandidate {
  /**
   * Unique identifier for this action candidate
   */
  readonly candidateActionId: string;

  /**
   * Classification and metadata of the action
   */
  readonly actionMetadata: ActionMetadata;

  /**
   * How this candidate was derived: direct from policy or derived from policy + evaluation
   */
  readonly origin: ActionOrigin;

  /**
   * Reference to the policy that is the source of this candidate
   */
  readonly policyReference: PolicyActionReference;

  /**
   * Optional reference to the policy evaluation that contributed to this candidate
   * Present only for DERIVED origin candidates
   */
  readonly evaluationReference?: EvaluationActionReference;

  /**
   * Rationale references explaining why this candidate action exists
   * Optional collection; may be empty if rationale is implicit in policy/evaluation
   */
  readonly rationales: ReadonlyArray<ActionCandidateRationale>;

  /**
   * Explanation reference for this candidate action
   */
  readonly explanation: ActionCandidateExplanation;
}
