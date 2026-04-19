/**
 * Execution Binding Contract
 *
 * Minimal definition of what execution/workflow layer produces as operational binding.
 * This is the handoff boundary: execution produces binding, dispatch/workflow layers receive it.
 * Includes explicit source references for end-to-end trace continuity.
 *
 * TRACE CONTINUITY:
 * - ApprovedActionBinding.sourceSelectedActionId: trace to SelectedAction in optimization result
 * - ApprovedActionBinding.sourceApprovedDecisionId: trace to ApprovedDecision in decision outcome
 * - ExecutionBinding.sourceDecisionOutcomeId: trace to DecisionOutcome
 * - Full chain: ExecutionBinding → DecisionOutcome → DecisionInput → OptimizationResult
 *
 * RESPONSIBILITY:
 * - Execution/workflow: receives approved decisions, produces binding surfaces
 * - Dispatch/workflow: receives binding surfaces and applies operational logic
 * - ExecutionBinding contains only approved-decision-derived bindings
 * - All trace references are immutable and caller-provided
 *
 * KEY CHARACTERISTICS:
 * - ExecutionBinding is immutable structural output from execution/workflow layer
 * - Contains operational binding surfaces ready for dispatch consideration
 * - All action/decision IDs are caller-provided (from decisioning layer)
 * - Traceability to decision outcome via sourceDecisionOutcomeId
 * - Each binding includes trace back to source approved decision
 * - No runtime mutation, no state machine, no execution logic
 * - No retry/failure handling in this foundation
 * - Deferred and confirmed rejections NOT represented in binding
 */

/**
 * ApprovedActionBinding: Approved action ready for dispatch
 *
 * Approved action (from decisionOutcome.approvedDecisions) prepared for
 * operational binding and dispatch consideration.
 * Execution/workflow layer transforms approved decision into binding.
 *
 * TRACE CONTINUITY:
 * - sourceSelectedActionId: trace to SelectedAction in optimization result
 * - sourceApprovedDecisionId: trace to ApprovedDecision in decision outcome
 * - Parent ExecutionBinding.sourceDecisionOutcomeId traces to DecisionOutcome
 * - Full trace: binding → approved decision → selected action → optimization result
 *
 * RESPONSIBILITY:
 * - This is output of execution binding for approved actions
 * - Means: action is prepared and bound for dispatch/workflow processing
 * - Dispatch/workflow layers will receive binding and apply operational logic
 * - Execution layer does NOT execute; only prepares binding
 * - All references are immutable and deterministic
 */
export interface ApprovedActionBinding {
  /**
   * Source reference: which SelectedAction from optimization this binding covers.
   * Immutable trace reference to optimization.selectedActions[].selectedActionId.
   * Provides traceability: binding → selected action.
   */
  readonly sourceSelectedActionId: string;

  /**
   * Unique identifier for this binding outcome.
   * Caller-provided: identifies this single binding.
   */
  readonly bindingId: string;

  /**
   * Source trace: which ApprovedDecision from decisioning produced this binding.
   * Immutable reference to decisionOutcome.approvedDecisions[].decisionId.
   * Provides traceability: binding → approved decision → decision outcome.
   */
  readonly sourceApprovedDecisionId: string;
}

/**
 * ExecutionBinding: Complete operational binding surface
 *
 * Minimal binding structure from execution/workflow processing.
 * Contains only approved-action-derived bindings.
 * Includes explicit source references for end-to-end audit trail.
 *
 * TRACE CONTINUITY:
 * - executionBindingId: unique binding identifier
 * - sourceDecisionOutcomeId: trace to DecisionOutcome in decisioning layer
 * - Each approvedActionBinding includes sourceSelectedActionId and sourceApprovedDecisionId
 * - Full trace: ExecutionBinding → DecisionOutcome → DecisionInput → OptimizationResult
 *
 * COMPOSITION:
 * - Approved action bindings: approved actions prepared for dispatch
 * - All bindings are structural-only (no execution state machine)
 * - All trace references preserved for full audit trail
 *
 * RESPONSIBILITY:
 * - ExecutionBinding is immutable: produced by execution, consumed by dispatch
 * - Only approved action bindings are included
 * - All bindings are structural-only (no execution state machine)
 * - Dispatch/workflow layers make no modifications; consume as-is
 * - Deferred decisions and confirmed rejections NOT represented
 * - All references are immutable and deterministic
 */
export interface ExecutionBinding {
  /**
   * Unique identifier for this complete execution binding.
   * Caller-provided: identifies this binding outcome.
   */
  readonly executionBindingId: string;

  /**
   * Approved actions prepared for dispatch/workflow processing.
   * Each includes source references for complete trace continuity:
   * - sourceSelectedActionId: to optimization selected action
   * - sourceApprovedDecisionId: to decision outcome approved decision
   * These are outcomes that dispatch/workflow layers will receive.
   * Dispatch does NOT modify; consumes as-is for operational application.
   */
  readonly approvedActionBindings: ReadonlyArray<ApprovedActionBinding>;

  /**
   * Source trace: decision outcome underlying this binding.
   * Immutable: reference to DecisionOutcome.decisionOutcomeId for complete traceability.
   * Provides trace: binding → decision outcome → decision input → optimization result.
   */
  readonly sourceDecisionOutcomeId: string;
}
