/**
 * Execution Binding Consumption Surface
 *
 * Minimal bounded exposure of internal ExecutionBinding.
 * Direct structural projection - no enrichment, no reinterpretation.
 */

/**
 * Approved action binding exposure (direct from internal ApprovedActionBinding)
 */
export interface ApprovedActionBindingConsumption {
  readonly sourceSelectedActionId: string;
  readonly bindingId: string;
  readonly sourceApprovedDecisionId: string;
}

/**
 * ExecutionBindingConsumption: Direct bounded exposure of ExecutionBinding
 *
 * This is a read-only projection of the internal ExecutionBinding.
 * No fields are invented, derived, or semantically reinterpreted.
 * All fields exist directly in the internal contract.
 */
export interface ExecutionBindingConsumption {
  readonly executionBindingId: string;
  readonly approvedActionBindings: ReadonlyArray<ApprovedActionBindingConsumption>;
  readonly sourceDecisionOutcomeId: string;
}

// Direct minimal projection of internal ExecutionBinding - no invented fields
