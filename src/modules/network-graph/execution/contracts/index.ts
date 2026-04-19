/**
 * Execution Layer Contracts - Minimal Foundation
 *
 * SCOPE: Execution/Workflow Binding Foundation - Explicit boundary between decisioning and dispatch
 *
 * Defines structural contracts for execution/workflow binding layer:
 * - What execution receives from decisioning: ExecutionInput (approved decisions only)
 * - What execution produces: ExecutionBinding (operational binding surfaces)
 * - How execution separates from decisioning and dispatch
 *
 * ARCHITECTURE:
 * Decisioning → Execution/Workflow → Dispatch (one-way flow)
 * - Decisioning: produces DecisionOutcome (approved + deferred + confirmed)
 * - Execution: receives outcome, extracts approved, produces bindings
 * - Dispatch: receives bindings and applies operational logic
 *
 * EXECUTION INPUT STRUCTURE:
 * - Receives DecisionOutcome (immutable, complete)
 * - Extracts only: approvedDecisions (for binding production)
 * - Ignores: deferredDecisions (remain in decisioning domain)
 * - Ignores: confirmedRejections (remain in decisioning domain)
 * - All IDs caller-provided
 *
 * EXECUTION OUTPUT STRUCTURE:
 * - Approved action bindings: approved actions prepared for dispatch
 * - Operational binding surfaces: ready for workflow processing
 * - Structural-only, no runtime mutation, no state machine
 * - Only approved-decision-derived bindings included
 *
 * HARD CONSTRAINTS:
 * - Strict TypeScript (no any, no ts-ignore, no suppressions)
 * - No generated IDs, no generated timestamps
 * - Deterministic: same input always same output
 * - No execution logic, no state mutation, no retry handling
 * - No dispatch/workflow logic expansion
 * - No real data integration
 */

export type { ExecutionInput } from "./execution-input.contract";

export type {
  ApprovedActionBinding,
  ExecutionBinding,
} from "./execution-binding.contract";
