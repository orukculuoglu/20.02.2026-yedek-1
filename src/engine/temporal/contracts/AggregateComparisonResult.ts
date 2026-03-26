/**
 * AggregateComparisonResult.ts
 * Top-level comparison result container.
 * Aggregates pair results and group results into unified output.
 */

import type { ComparisonDirectionContract } from "./ComparisonDirection";
import type { VolatilityInstabilityContract } from "./VolatilityInstability";
import type { ThresholdBreach } from "./ThresholdBreach";
import type { ComparisonExplanationReferences } from "./ComparisonTrace";
import type { PairComparisonResult } from "./PairComparisonResult";
import type { GroupComparisonResult } from "./GroupComparisonResult";

export enum ComparisonFailureReason {
  INSUFFICIENT_DATA = "insufficient_data",
  INVALID_WINDOW_STATE = "invalid_window_state",
  INCOMPATIBLE_WINDOWS = "incompatible_windows",
  THRESHOLD_CONFIGURATION_ERROR = "threshold_configuration_error",
  INTERNAL_ERROR = "internal_error",
}

export interface AggregateComparisonResult {
  resultId: string;
  multiWindowSetId: string;
  pairResults: PairComparisonResult[];
  groupResults: GroupComparisonResult[];
  overallDirection?: ComparisonDirectionContract;
  overallVolatility?: VolatilityInstabilityContract;
  allThresholdBreaches: ThresholdBreach[];
  traces: ComparisonExplanationReferences;
  executedAt: number;
  completionStatus: "success" | "partial" | "failed";
  failureReason?: ComparisonFailureReason;
  version: string;
}
