/**
 * Decisioning Layer Contracts - Minimal Foundation
 *
 * SCOPE: Decisioning Foundation - Explicit boundary between optimization and execution
 *
 * Defines structural contracts for decisioning layer:
 * - What decisioning receives from optimization: DecisionInput (optimization result only)
 * - What decisioning produces: DecisionOutcome (bounded decision states only)
 * - How decisioning separates from optimization and execution
 *
 * ARCHITECTURE:
 * Optimization → Decisioning → Execution (one-way flow)
 * - Optimization: produces OptimizationResult (selectedActions + rejectedCandidates)
 * - Decisioning: receives result, produces decision outcomes for each item
 * - Execution: receives approved outcomes and applies to state
 *
 * DECISION INPUT STRUCTURE:
 * - Receives OptimizationResult (immutable)
 * - Contains only optimization result + input ID
 * - No caller-provided decision context in this foundation
 * - Decisioning evaluates this input and produces DecisionOutcome
 *
 * DECISION OUTCOME STRUCTURE:
 * - Approved outcomes: selected actions ready for next step
 * - Deferred outcomes: selected actions not ready to proceed
 * - Confirmed rejections: optimization rejections that decisioning confirms
 * - Bounded decision state outcomes only
 * - Only approved outcomes go to execution layer
 *
 * HARD CONSTRAINTS:
 * - Strict TypeScript (no any, no ts-ignore, no suppressions)
 * - No generated IDs, no generated timestamps
 * - Deterministic: same input always same output
 * - No execution logic, no policy engine, no context expansion
 * - No workflow logic, no real data integration
 */

export type { DecisionInput } from "./decision-input.contract";

export type {
  ApprovedDecision,
  DeferredDecision,
  ConfirmedRejection,
  DecisionOutcome,
} from "./decision-outcome.contract";
