/**
 * GroupComparisonResult.ts
 * Group-level comparison result structure.
 * Aggregates pair results and produces group-level statistics.
 */

import type { ComparisonDirectionContract } from "./ComparisonDirection.ts";
import type { VolatilityInstabilityContract } from "./VolatilityInstability.ts";
import type { ThresholdBreach } from "./ThresholdBreach.ts";
import type { ComparisonExplanationReferences } from "./ComparisonTrace.ts";
import type { PairComparisonResult } from "./PairComparisonResult.ts";

export interface GroupComparisonResult {
  resultId: string;
  groupId: string;
  pairResults: PairComparisonResult[];
  aggregateDirection: ComparisonDirectionContract;
  aggregateVolatility?: VolatilityInstabilityContract;
  aggregateThresholdBreaches: ThresholdBreach[];
  traces: ComparisonExplanationReferences;
  generatedAt: number;
  version: string;
}
