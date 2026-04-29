import type { OutcomeRationale } from "./outcome-rationale.contract.js";

/**
 * OutcomeLinkage - Structural linkage connecting outcome to prior runtime structures
 * Pure reference structure with no loading, resolution, or execution tracing behavior.
 * Links outcome back to the action flow through selected action and handoff references.
 */
export interface OutcomeLinkage {
  /**
   * Reference identifier to the selected action that produced this outcome
   */
  readonly selectedActionId: string;

  /**
   * Optional reference identifier to the handoff that was attempted
   */
  readonly handoffId?: string;

  /**
   * Optional reference identifier to the downstream execution target
   */
  readonly downstreamTargetReference?: string;
}
