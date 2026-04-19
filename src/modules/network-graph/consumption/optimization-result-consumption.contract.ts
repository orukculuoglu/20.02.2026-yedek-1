/**
 * Optimization Result Consumption Surface
 *
 * Minimal bounded exposure of internal OptimizationResult.
 * Direct structural projection - no enrichment, no reinterpretation.
 */

/**
 * Selected action exposure (direct from internal SelectedAction)
 */
export interface SelectedActionConsumption {
  readonly selectedActionId: string;
  readonly sourceCandidateActionId: string;
  readonly category: string;
}

/**
 * Rejected action exposure (direct from internal RejectedCandidateAction)
 */
export interface RejectedCandidateActionConsumption {
  readonly rejectedActionId: string;
  readonly sourceCandidateActionId: string;
  readonly category: string;
  readonly rejectionKind: string;
}

/**
 * OptimizationResultConsumption: Direct bounded exposure of OptimizationResult
 *
 * This is a read-only projection of the internal OptimizationResult.
 * No fields are invented, derived, or semantically reinterpreted.
 * All fields exist directly in the internal contract.
 */
export interface OptimizationResultConsumption {
  readonly resultId: string;
  readonly selectedActions: ReadonlyArray<SelectedActionConsumption>;
  readonly rejectedCandidates: ReadonlyArray<RejectedCandidateActionConsumption>;
}

// Direct minimal projection of internal OptimizationResult - no invented fields
