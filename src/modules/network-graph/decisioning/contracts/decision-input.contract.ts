/**
 * Decision Input Contract
 *
 * Minimal definition of what decisioning layer receives from optimization layer.
 * This is the handoff boundary: optimization produces result, decisioning receives it.
 *
 * RESPONSIBILITY:
 * - Optimization: selects feasible actions from candidates (complete result)
 * - Decisioning: receives optimization result, produces bounded decision outcomes
 *
 * KEY CHARACTERISTICS:
 * - DecisionInput is immutable structural input to decisioning layer
 * - Contains only: optimization result + input ID
 * - No caller-provided decision context in this foundation
 * - Decisioning reads input, produces DecisionOutcome
 * - All IDs are caller-provided (not generated)
 */

import type { OptimizationResult } from "../../optimization/contracts/optimization-result.contract";

/**
 * DecisionInput: What decisioning layer receives from optimization
 *
 * Immutable input from optimization layer to decisioning layer.
 * Complete optimization result ready for decision evaluation.
 *
 * COMPOSITION:
 * - decisionInputId: caller-provided identifier for this decision input
 * - optimizationResult: complete result from optimization layer (immutable)
 *   - Contains: selectedActions + rejectedCandidates
 *   - All candidate IDs are caller-provided from upstream
 *   - All action references are to caller-provided candidates
 *
 * RESPONSIBILITY:
 * - Decisioning receives this input
 * - For each selected action: produces ApprovedDecision or DeferredDecision
 * - For each rejected candidate: produces ConfirmedRejection
 * - Produces DecisionOutcome with bounded decision states
 */
export interface DecisionInput {
  /**
   * Unique identifier for this decision input.
   * Caller-provided: identifies which decision flow produced this input.
   */
  readonly decisionInputId: string;

  /**
   * Optimization result to process.
   * Immutable: complete result from optimization layer.
   * Contains: selectedActions (candidates optimizer selected) + rejectedCandidates.
   */
  readonly optimizationResult: OptimizationResult;
}
