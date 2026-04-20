/**
 * FinalActionSelectionSummary - Structural summary of final action selection distribution
 * Pure structural summary reporting the distribution of selection outcomes.
 * No computed scoring logic, runtime metrics, or derived calculations.
 * Declarative only: reports what was structurally selected/rejected/suppressed/deferred.
 */
export interface FinalActionSelectionSummary {
  /**
   * Total number of candidate actions evaluated for selection
   */
  readonly totalCandidatesEvaluated: number;

  /**
   * Number of candidate actions selected as final output
   */
  readonly selectedActionsCount: number;

  /**
   * Number of candidate actions rejected from selection
   */
  readonly rejectedActionsCount: number;

  /**
   * Number of candidate actions suppressed from selection
   */
  readonly suppressedActionsCount: number;

  /**
   * Number of candidate actions deferred from selection
   */
  readonly deferredActionsCount: number;
}
