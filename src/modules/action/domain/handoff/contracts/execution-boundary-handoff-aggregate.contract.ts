import type { NonEmptyReadonlyArray } from "../../../../policy/domain/thresholds/contracts/non-empty-readonly-array.type.js";
import type { ExecutionHandoff } from "./execution-handoff.contract.js";
import type { ApprovalPendingHandoff } from "./approval-pending-handoff.contract.js";
import type { BlockedActionHandoff } from "./blocked-action-handoff.contract.js";
import type { DeferredActionHandoff } from "./deferred-action-handoff.contract.js";

/**
 * ExecutionBoundaryHandoffBase - Shared base structure for all execution boundary handoff outcomes
 * Base structure containing handoff result identity.
 */
interface ExecutionBoundaryHandoffBase {
  /**
   * Unique identifier for this handoff boundary crossing result
   */
  readonly handoffBatchId: string;

  /**
   * Optional collection of actions ready for execution handoff
   */
  readonly executableHandoffs?: ReadonlyArray<ExecutionHandoff>;

  /**
   * Optional collection of actions pending approval before execution
   */
  readonly approvalPendingHandoffs?: ReadonlyArray<ApprovalPendingHandoff>;

  /**
   * Optional collection of actions blocked from execution boundary
   */
  readonly blockedHandoffs?: ReadonlyArray<BlockedActionHandoff>;

  /**
   * Optional collection of actions deferred from execution boundary
   */
  readonly deferredHandoffs?: ReadonlyArray<DeferredActionHandoff>;
}

/**
 * ExecutionBoundaryHandoff - Structural aggregation of execution boundary handoff outcomes
 * Pure structural aggregation of executable, approval-pending, blocked, and deferred handoff actions.
 * Outcome-complete: at least one handoff outcome collection must be present and non-empty.
 * Union-based: ensures type-level guarantee that at least one handoff outcome type exists.
 * No execution, dispatch, or delivery semantics.
 */
export type ExecutionBoundaryHandoff = 
  | (ExecutionBoundaryHandoffBase & { readonly executableHandoffs: NonEmptyReadonlyArray<ExecutionHandoff> })
  | (ExecutionBoundaryHandoffBase & { readonly approvalPendingHandoffs: NonEmptyReadonlyArray<ApprovalPendingHandoff> })
  | (ExecutionBoundaryHandoffBase & { readonly blockedHandoffs: NonEmptyReadonlyArray<BlockedActionHandoff> })
  | (ExecutionBoundaryHandoffBase & { readonly deferredHandoffs: NonEmptyReadonlyArray<DeferredActionHandoff> });
