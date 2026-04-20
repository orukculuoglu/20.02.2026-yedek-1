import type { ActionKind } from "./action-kind.enum.js";
import type { ActionSeverity } from "./action-severity.enum.js";
import type { ActionTargetReference } from "./action-target-reference.contract.js";

/**
 * ActionMetadata - Minimal action classification and reference metadata
 * Pure structural definition of action identity and basic classification.
 * Contains action vocabulary classification only; no execution state, results, or history.
 */
export interface ActionMetadata {
  /**
   * Unique identifier for this action
   */
  readonly actionId: string;

  /**
   * Classification of the action kind or type
   */
  readonly kind: ActionKind;

  /**
   * Severity level of this action
   */
  readonly severity: ActionSeverity;

  /**
   * Optional reference to the target this action affects
   * Present only if the action is target-specific
   */
  readonly targetReference?: ActionTargetReference;
}
