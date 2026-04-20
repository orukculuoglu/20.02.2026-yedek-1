import type { HandoffRationale } from "./handoff-rationale.contract.js";

/**
 * DeferredActionHandoff - Structural definition of an action deferred from execution boundary
 * Pure structural definition of an action that is deferred from crossing the execution boundary.
 * Contains reference to action and optional rationale references.
 * No queue semantics, retry logic, or scheduling semantics.
 */
export interface DeferredActionHandoff {
  /**
   * Unique identifier for this deferred-action handoff result
   */
  readonly handoffId: string;

  /**
   * Reference identifier to the action that is deferred
   */
  readonly selectedActionId: string;

  /**
   * Optional rationale references explaining why this action is deferred
   * May be empty if deferral rationale is implicit
   */
  readonly handoffRationales: ReadonlyArray<HandoffRationale>;
}
