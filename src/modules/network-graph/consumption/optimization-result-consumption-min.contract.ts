/**
 * Optimization Result Consumption Surface
 * Direct minimal projection of internal OptimizationResult
 */

export interface SelectedActionConsumption {
  readonly selectedActionId: string;
  readonly sourceCandidateActionId: string;
  readonly category: string;
}

export interface RejectedCandidateActionConsumption {
  readonly rejectedActionId: string;
  readonly sourceCandidateActionId: string;
  readonly category: string;
  readonly rejectionKind: string;
}

export interface OptimizationResultConsumption {
  readonly resultId: string;
  readonly selectedActions: ReadonlyArray<SelectedActionConsumption>;
  readonly rejectedCandidates: ReadonlyArray<RejectedCandidateActionConsumption>;
}
