/**
 * Execution Boundary / Handoff Surface - Pure declarative execution boundary handoff definition layer
 * Defines how execution boundary handoff outcomes are structurally represented at compile time.
 * Contains no execution logic, dispatch behavior, delivery semantics, or approval workflow execution.
 */

// Handoff rationale vocabulary
export {
  HandoffRationaleCode,
  HANDOFF_RATIONALE_CODES_ALL,
} from "./handoff-rationale-code.enum.js";
export type { HandoffRationaleCodeValue } from "./handoff-rationale-code.enum.js";

// Handoff rationale reference structure
export type { HandoffRationale } from "./handoff-rationale.contract.js";

// Downstream execution target reference
export type { DownstreamExecutionTarget } from "./downstream-execution-target.contract.js";

// Execution boundary handoff outcome contracts
export type { ExecutionHandoff } from "./execution-handoff.contract.js";
export type { ApprovalPendingHandoff } from "./approval-pending-handoff.contract.js";
export type { BlockedActionHandoff } from "./blocked-action-handoff.contract.js";
export type { DeferredActionHandoff } from "./deferred-action-handoff.contract.js";

// Handoff aggregate
export type { ExecutionBoundaryHandoff } from "./execution-boundary-handoff-aggregate.contract.js";
