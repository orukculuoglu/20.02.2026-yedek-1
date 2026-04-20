import type { ActionMetadata } from "../../foundation/contracts/action-metadata.contract.js";
import type { DownstreamExecutionTarget } from "./downstream-execution-target.contract.js";
import type { HandoffRationale } from "./handoff-rationale.contract.js";

/**
 * ExecutionHandoff - Structural definition of an action ready for execution boundary crossing
 * Pure structural definition of an action that is ready to hand off to downstream execution.
 * Contains reference to selected action, metadata, execution target, and optional rationale.
 * No execution result, dispatch state, or delivery status.
 */
export interface ExecutionHandoff {
  /**
   * Unique identifier for this execution handoff result
   */
  readonly handoffId: string;

  /**
   * Reference identifier to the selected action being handed off
   */
  readonly selectedActionId: string;

  /**
   * Classification and metadata of the action
   */
  readonly actionMetadata: ActionMetadata;

  /**
   * Downstream execution target reference
   */
  readonly executionTarget: DownstreamExecutionTarget;

  /**
   * Optional rationale references explaining this handoff
   * May be empty if handoff rationale is implicit
   */
  readonly handoffRationales: ReadonlyArray<HandoffRationale>;
}
