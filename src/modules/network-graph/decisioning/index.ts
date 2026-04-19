/**
 * Decisioning Layer - Minimal Foundation
 *
 * SCOPE: Decisioning Foundation
 * Establishes the decisioning layer that:
 * - Receives optimization results from optimization layer
 * - Evaluates and produces bounded decision outcomes
 * - Remains separate from optimization and execution/workflow layers
 *
 * ARCHITECTURE POSITION:
 * Motor 3 Flow: Optimization → Decisioning → Execution/Workflow → Dispatch
 * - Optimization: produces result (selected actions + rejected candidates)
 * - Decisioning: receives result, evaluates, produces outcomes (THIS LAYER)
 * - Execution: receives approved decisions, produces bindings (NOT SCOPE)
 * - Dispatch: applies bindings with operational logic (NOT SCOPE)
 *
 * END-TO-END TRACE CONTINUITY:
 * Complete trace chain from optimization to execution:
 *
 * 1. Optimization Layer Output:
 *    - OptimizationResult.resultId (unique result identifier)
 *    - OptimizationResult.selectedActions[] (SelectedAction items)
 *    - OptimizationResult.rejectedCandidates[] (RejectedCandidateAction items)
 *
 * 2. Decisioning Input Boundary:
 *    - DecisionInput.decisionInputId (unique decision input)
 *    - DecisionInput.optimizationResult (FULL RESULT, immutable)
 *    - Links optimization to decisioning via optimizationResult reference
 *
 * 3. Decisioning Processing & Output:
 *    - DecisionOutcome.sourceDecisionInputId (TRACE BACK to DecisionInput)
 *    - ApprovedDecision.sourceSelectedActionId (TRACE to SelectedAction)
 *    - DeferredDecision.sourceSelectedActionId (TRACE to SelectedAction)
 *    - ConfirmedRejection.sourceRejectedCandidateActionId (TRACE to RejectedCandidateAction)
 *
 * 4. Execution Layer Continuation:
 *    - ExecutionInput.decisionOutcome (complete outcome)
 *    - ExecutionBinding.sourceDecisionOutcomeId (TRACE to DecisionOutcome)
 *    - ApprovedActionBinding.sourceApprovedDecisionId (TRACE to ApprovedDecision)
 *    - ApprovedActionBinding.sourceSelectedActionId (TRACE to SelectedAction)
 *
 * TRACE EXAMPLE (End-to-End):
 * ApprovedActionBinding (in ExecutionBinding)
 *   → via sourceSelectedActionId to SelectedAction (in OptimizationResult)
 *   → via sourceApprovedDecisionId to ApprovedDecision (in DecisionOutcome)
 *   → via sourceDecisionOutcomeId to DecisionOutcome
 *   → via sourceDecisionInputId to DecisionInput
 *   → via optimizationResult to OptimizationResult
 *
 * DECISION INPUT BOUNDARY:
 * What decisioning receives:
 * - OptimizationResult: complete result from optimization (immutable)
 * - DecisionInput ID: caller-provided for traceability
 * - ALL COMPONENTS IMMUTABLE: decisioning reads, evaluates, produces outcome
 * - NO caller-provided decision context in this foundation
 *
 * OUTCOME BUCKET PROCESSING:
 * What decisioning produces:
 * 1. Approved decisions: selected actions ready for execution
 *    - Each references source SelectedAction via sourceSelectedActionId
 *    - Only approvedDecisions are processed by execution layer
 * 2. Deferred decisions: selected actions not ready to proceed
 *    - Each references source SelectedAction via sourceSelectedActionId
 *    - Remain in decisioning domain, not passed to execution
 * 3. Confirmed rejections: rejected candidates decisioning confirms
 *    - Each references source RejectedCandidateAction via sourceRejectedCandidateActionId
 *    - Available for logging and audit only
 *
 * SEPARATION DOCTRINE:
 * 1. Optimization ≠ Decisioning
 *    - Optimization produces result (what's best technically)
 *    - Decisioning evaluates outcome (what's approved/ready)
 *    - Optimization: no decision logic
 *    - Decisioning: no optimization logic
 *
 * 2. Decisioning ≠ Execution
 *    - Decisioning produces outcomes (approved/deferred/rejected states)
 *    - Execution extracts approved and produces bindings
 *    - Decisioning: no binding logic, no execution
 *    - Execution: no decision logic
 *
 * 3. One-way flow: Optimization → Decisioning → Execution → Dispatch
 *    - No feedback from execution to decisioning
 *    - No feedback from decisioning to optimization
 *    - Each layer consumes previous layer output only
 *    - Deferred/rejected EXPLICITLY excluded from execution processing
 *
 * AUDIT DISCIPLINE:
 * - All trace references are structural-only (not analytics)
 * - No summary statistics, no metrics, no reporting fields
 * - No timestamps, no execution history, no state machine
 * - Trace continuity preserved through explicit source references
 * - Audit trail is deterministic: same input always same output
 * - No real data integration, no persistence, no cross-motor trace
 *
 * HARD CONSTRAINTS:
 * - Strict TypeScript: no any, no ts-ignore, no suppressions
 * - All IDs caller-provided: no generation, no inference
 * - Deterministic: same input always same output
 * - No decision logic: no policy, no risk, no approval (foundation only)
 * - No execution logic: no state mutation, no workflow
 * - No cross-motor integration: Motor 3-specific contracts only
 * - No platform standardization: Motor 3 boundary only
 *
 * EXPORT ORGANIZATION:
 * - DecisionInput: what decisioning receives from optimization
 * - ApprovedDecision, DeferredDecision, ConfirmedRejection: outcome types with source traces
 * - DecisionOutcome: complete outcome with source decision input reference
 * - All source trace references explicit and immutable
 * - All from ./contracts/ module
 *
 * FOUNDATIONAL CLOSURE:
 * This topic closes the decisioning foundation with:
 * - Explicit input contract from optimization layer (complete result)
 * - Explicit output contract for execution layer (bounded outcome states with traces)
 * - Explicit trace continuity through all source references
 * - One-way flow (no feedback loops)
 * - Minimal scope (no framework expansion)
 * - End-to-end audit trail (optimization → decisioning → execution → dispatch)
 */

export type {
  DecisionInput,
  ApprovedDecision,
  DeferredDecision,
  ConfirmedRejection,
  DecisionOutcome,
} from "./contracts/index";
