/**
 * PairComparisonResult.ts
 * Pair-level comparison result structure.
 * Composes all comparison output types for a single pair of windows.
 */

import type { AbsoluteDelta, RelativeDelta } from "./DeltaContracts.ts";
import type { ComparisonDirectionContract } from "./ComparisonDirection.ts";
import type { RateOfChange } from "./RateOfChange.ts";
import type { AccelerationDeceleration } from "./AccelerationDeceleration.ts";
import type { VolatilityInstabilityContract } from "./VolatilityInstability.ts";
import type { ThresholdBreach } from "./ThresholdBreach.ts";
import type { ComparisonExplanationReferences } from "./ComparisonTrace.ts";

export interface PairComparisonResult {
  resultId: string;
  pairId: string;
  absoluteDelta: AbsoluteDelta;
  relativeDelta: RelativeDelta;
  direction: ComparisonDirectionContract;
  rateOfChange: RateOfChange;
  acceleration?: AccelerationDeceleration;
  volatility?: VolatilityInstabilityContract;
  thresholdBreaches: ThresholdBreach[];
  traces: ComparisonExplanationReferences;
  generatedAt: number;
  version: string;
}
