/**
 * Decision Outcome Consumption Surface
 *
 * Minimal bounded exposure of internal DecisionOutcome.
 * Direct structural projection - no enrichment, no reinterpretation.
 */

/**
 * Approved decision exposure (direct from internal ApprovedDecision)
 */
export interface ApprovedDecisionConsumption {
  readonly sourceSelectedActionId: string;
  readonly decisionId: string;
}

/**
 * Deferred decision exposure (direct from internal DeferredDecision)
 */
export interface DeferredDecisionConsumption {
  readonly sourceSelectedActionId: string;
  readonly decisionId: string;
}

/**
 * Confirmed rejection exposure (direct from internal ConfirmedRejection)
 */
export interface ConfirmedRejectionConsumption {
  readonly sourceRejectedCandidateActionId: string;
  readonly decisionId: string;
}

/**
 * DecisionOutcomeConsumption: Direct bounded exposure of DecisionOutcome
 *
 * This is a read-only projection of the internal DecisionOutcome.
 * No fields are invented, derived, or semantically reinterpreted.
 * All fields exist directly in the internal contract.
 */
export interface DecisionOutcomeConsumption {
  readonly decisionOutcomeId: string;
  readonly sourceDecisionInputId: string;
  readonly approvedDecisions: ReadonlyArray<ApprovedDecisionConsumption>;
  readonly deferredDecisions: ReadonlyArray<DeferredDecisionConsumption>;
  readonly confirmedRejections: ReadonlyArray<ConfirmedRejectionConsumption>;
}

// Direct minimal projection of internal DecisionOutcome - no invented fields
