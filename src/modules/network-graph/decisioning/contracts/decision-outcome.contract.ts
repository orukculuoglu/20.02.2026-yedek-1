/**
 * Decision Outcome Contract
 *
 * Minimal definition of what decisioning layer produces after evaluating decision input.
 * This is the handoff boundary: decisioning produces outcome, execution receives it.
 * Includes explicit trace continuity back to decisioning input for end-to-end audit.
 *
 * RESPONSIBILITY:
 * - Decisioning: evaluates optimization result, produces bounded outcomes
 * - Execution: receives approved decisions and applies to runtime state
 * - DecisionOutcome contains three distinct decision state buckets
 *
 * TRACE CONTINUITY:
 * - DecisionOutcome references source DecisionInput (sourceDecisionInputId)
 * - DecisionInput references source OptimizationResult (optimizationResult)
 * - Individual outcomes reference source optimization items (via sourceSelectedActionId, sourceRejectedCandidateActionId)
 * - Full trace chain: DecisionOutcome → DecisionInput → OptimizationResult → SelectedActions/RejectedCandidates
 *
 * KEY CHARACTERISTICS:
 * - DecisionOutcome is immutable structural output from decisioning
 * - Contains approved, deferred, and confirmed rejection outcomes
 * - All action/candidate IDs are caller-provided (from optimization result)
 * - Includes explicit source references for trace continuity
 * - No summary statistics or reporting fields
 * - No execution logic
 * - Only approved decisions go to execution layer
 */

/**
 * ApprovedDecision: Selected action ready for execution
 *
 * Selected action (from optimization.selectedActions) that decisioning
 * has determined is ready for execution consideration.
 * NOT approval/policy decision; just bounded outcome state.
 *
 * TRACE CONTINUITY:
 * - sourceSelectedActionId: trace back to SelectedAction in optimization result
 * - decisionId: local outcome identifier
 * - Parent DecisionOutcome.sourceDecisionInputId traces to decisioning input
 *
 * RESPONSIBILITY:
 * - This is output of decisioning evaluation for selected actions
 * - Means: decisioning processed this selected action and is ready for next step
 * - Execution layer will receive approved decisions
 * - Execution layer applies; does NOT modify outcome
 */
export interface ApprovedDecision {
  /**
   * Source reference: which SelectedAction from optimization this decision covers.
   * Immutable trace reference to optimization.selectedActions[].selectedActionId.
   * Provides traceability: ApprovedDecision → SelectedAction in OptimizationResult.
   */
  readonly sourceSelectedActionId: string;

  /**
   * Unique identifier for this decision outcome.
   * Caller-provided: identifies this single decision.
   */
  readonly decisionId: string;
}

/**
 * DeferredDecision: Selected action not ready for next step
 *
 * Selected action (from optimization.selectedActions) that decisioning
 * has determined is not ready to proceed at this time.
 * Remains within decisioning domain; not passed to execution.
 *
 * TRACE CONTINUITY:
 * - sourceSelectedActionId: trace back to SelectedAction in optimization result
 * - decisionId: local outcome identifier
 * - Parent DecisionOutcome.sourceDecisionInputId traces to decisioning input
 *
 * RESPONSIBILITY:
 * - This is output of decisioning evaluation for selected actions
 * - Means: decisioning has evaluated but action is not ready to proceed
 * - Execution layer does NOT receive deferred decisions
 * - Decisioning may re-evaluate deferred decisions later
 */
export interface DeferredDecision {
  /**
   * Source reference: which SelectedAction from optimization this decision covers.
   * Immutable trace reference to optimization.selectedActions[].selectedActionId.
   * Provides traceability: DeferredDecision → SelectedAction in OptimizationResult.
   */
  readonly sourceSelectedActionId: string;

  /**
   * Unique identifier for this decision outcome.
   * Caller-provided: identifies this single decision.
   */
  readonly decisionId: string;
}

/**
 * ConfirmedRejection: Rejected candidate remains rejected
 *
 * Rejected candidate (from optimization.rejectedCandidates) that decisioning
 * confirms remains rejected. Optimization already rejected this candidate;
 * decisioning confirms the rejection.
 * Used for audit trail; not passed to execution.
 *
 * TRACE CONTINUITY:
 * - sourceRejectedCandidateActionId: trace back to RejectedCandidateAction in optimization result
 * - decisionId: local outcome identifier
 * - Parent DecisionOutcome.sourceDecisionInputId traces to decisioning input
 *
 * RESPONSIBILITY:
 * - This is output of decisioning evaluation for rejected candidates
 * - Means: decisioning agrees with optimizer's rejection decision
 * - Execution layer does NOT receive confirmed rejections
 * - Not acted upon; available for logging/audit only
 */
export interface ConfirmedRejection {
  /**
   * Source reference: which RejectedCandidateAction from optimization this rejection covers.
   * Immutable trace reference to optimization.rejectedCandidates[].rejectedActionId.
   * Provides traceability: ConfirmedRejection → RejectedCandidateAction in OptimizationResult.
   */
  readonly sourceRejectedCandidateActionId: string;

  /**
   * Unique identifier for this decision outcome.
   * Caller-provided: identifies this single decision.
   */
  readonly decisionId: string;
}

/**
 * DecisionOutcome: Complete output from decisioning layer
 *
 * Minimal outcome structure from decisioning processing.
 * Contains bounded decision state results only.
 * Includes explicit source reference for trace continuity to decisioning input.
 *
 * TRACE CONTINUITY:
 * - decisionOutcomeId: unique outcome identifier
 * - sourceDecisionInputId: trace back to DecisionInput that produced this outcome
 * - Individual decisions include sourceSelectedActionId or sourceRejectedCandidateActionId
 * - Full trace: DecisionOutcome → DecisionInput → OptimizationResult
 *
 * COMPOSITION:
 * 1. Approved decisions: selected actions ready for next step (trace to SelectedAction)
 * 2. Deferred decisions: selected actions not ready to proceed (trace to SelectedAction)
 * 3. Confirmed rejections: rejected candidates decisioning agrees with (trace to RejectedCandidateAction)
 *
 * RESPONSIBILITY:
 * - DecisionOutcome is immutable: produced by decisioning, consumed by execution
 * - Only approved decisions go to execution layer
 * - Deferred and confirmed rejections stay within decisioning domain
 * - All components are structural-only (no execution logic)
 * - Execution layer makes no modifications; consumes as-is
 * - Full audit trail preserved through source references
 */
export interface DecisionOutcome {
  /**
   * Unique identifier for this complete decision outcome.
   * Caller-provided: identifies this outcome.
   */
  readonly decisionOutcomeId: string;

  /**
   * Source trace: which DecisionInput produced this outcome.
   * Immutable reference to DecisionInput.decisionInputId.
   * Provides traceability: DecisionOutcome → DecisionInput → OptimizationResult.
   */
  readonly sourceDecisionInputId: string;

  /**
   * Selected actions approved for next step.
   * These are outcomes that execution layer will receive.
   * Each references source SelectedAction via sourceSelectedActionId.
   * Execution does NOT modify; consumes as-is.
   */
  readonly approvedDecisions: ReadonlyArray<ApprovedDecision>;

  /**
   * Selected actions deferred (not ready to proceed).
   * These remain in decisioning domain, not passed to execution.
   * Each references source SelectedAction via sourceSelectedActionId.
   * May be re-evaluated later with different evaluation context.
   */
  readonly deferredDecisions: ReadonlyArray<DeferredDecision>;

  /**
   * Rejected candidates confirmed as remaining rejected.
   * These are optimization rejections that decisioning confirms.
   * Each references source RejectedCandidateAction via sourceRejectedCandidateActionId.
   * Not passed to execution; available for logging and audit only.
   */
  readonly confirmedRejections: ReadonlyArray<ConfirmedRejection>;

  /**
   * Source trace: optimization result underlying this outcome.
   * Immutable: reference to optimization source for complete traceability.
   */
  readonly sourceOptimizationResultId: string;
}
