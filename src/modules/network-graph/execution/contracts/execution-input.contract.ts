/**
 * Execution Input Contract
 *
 * Minimal definition of what execution/workflow layer receives from decisioning layer.
 * This is the handoff boundary: decisioning produces outcome, execution receives it.
 *
 * RESPONSIBILITY:
 * - Decisioning: produces DecisionOutcome with approved + deferred + confirmed rejections
 * - Execution: receives decision outcome, extracts approved decisions for binding
 * - Only approved decisions are relevant to execution layer
 *
 * EXCLUSION BOUNDARIES:
 * - Deferred decisions: NOT passed to execution (remain in decisioning domain)
 * - Confirmed rejections: NOT passed to execution (remain in decisioning domain)
 * - Only ApprovedDecision items are extraction targets
 *
 * KEY CHARACTERISTICS:
 * - ExecutionInput is immutable structural input to execution/workflow layer
 * - Contains complete DecisionOutcome for traceability
 * - Only approved decisions are execution-relevant
 * - All IDs are caller-provided (from decisioning layer)
 * - Execution reads input, produces ExecutionBinding
 */

import type { DecisionOutcome } from "../../decisioning/contracts/index";

/**
 * ExecutionInput: What execution/workflow layer receives from decisioning
 *
 * Immutable input from decisioning layer to execution/workflow layer.
 * Complete decision outcome ready for execution binding.
 *
 * COMPOSITION:
 * - executionInputId: caller-provided identifier for this execution input
 * - decisionOutcome: complete outcome from decisioning layer (immutable)
 *   - Contains: approvedDecisions (execution-relevant)
 *   - Contains: deferredDecisions (NOT for execution)
 *   - Contains: confirmedRejections (NOT for execution)
 *
 * RESPONSIBILITY:
 * - Execution/workflow receives this input
 * - Extracts only: approvedDecisions
 * - For each approved decision: produces ExecutionBinding
 * - Ignores: deferredDecisions and confirmedRejections (not execution scope)
 * - Produces ExecutionOutcome with binding surfaces
 */
export interface ExecutionInput {
  /**
   * Unique identifier for this execution input.
   * Caller-provided: identifies which execution flow produced this input.
   */
  readonly executionInputId: string;

  /**
   * Decision outcome to process for execution binding.
   * Immutable: complete outcome from decisioning layer.
   * Execution extracts only approvedDecisions for binding.
   * deferredDecisions and confirmedRejections are ignored by execution.
   */
  readonly decisionOutcome: DecisionOutcome;
}
