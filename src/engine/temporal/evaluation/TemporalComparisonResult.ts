/**
 * Temporal Comparison Result
 * Explicit comparison outputs and evaluation results.
 * Only includes fields when source data exists to compute them.
 * No fabricated defaults, no zero-filling, no undefined-as-string values.
 */

/**
 * ComparisonDelta
 * Explicit change/delta metrics between comparison pairs.
 * Only if source numerical data exists in analytics input.
 */
export interface ComparisonDelta {
  // Which comparison this delta is for
  comparisonId: string;

  // Absolute change (rightValue - leftValue) if computable
  // Optional: only if both values present and numeric
  absoluteDelta?: number;

  // Percentage change if computable
  // Optional: only if both values present, non-zero, and numeric
  percentChange?: number;

  // Volatility measure if computable
  // Optional: only if source data provided volatility metric
  volatility?: number;

  // Optional metadata for this delta
  metadata?: Record<string, unknown>;
}

/**
 * ThresholdMarker
 * Markers for threshold breaches during evaluation.
 * All values must be explicitly computable from context.
 */
export interface ThresholdMarker {
  // Which comparison triggered this marker
  comparisonId: string;

  // Type of threshold that was evaluated
  thresholdType: "delta" | "volatility" | "overlap";

  // Was the threshold breached? Only set if evaluated.
  breached: boolean;

  // The threshold value used (from caller's evaluationOptions)
  thresholdValue: number;

  // The measured value that was compared
  // Only present if source data existed to measure
  measuredValue?: number;

  // Optional metadata for this marker
  metadata?: Record<string, unknown>;
}

/**
 * StageComparisonResult
 * Comparison results for a single execution stage.
 * Aggregates comparisons evaluated in that stage.
 */
export interface StageComparisonResult {
  // Which stage these results are for
  stageId: string;

  // Comparison deltas evaluated in this stage
  deltas: ComparisonDelta[];

  // Threshold markers triggered in this stage
  thresholdMarkers: ThresholdMarker[];

  // Count of comparisons evaluated
  comparisonCount: number;

  // Count of thresholds breached (if any were evaluated)
  breachCount: number;

  // Optional metadata for this stage result
  metadata?: Record<string, unknown>;
}

/**
 * ComparisonResult
 * Complete raw comparison output.
 * All deltas and markers that could be computed from explicit source data.
 * No interpretation, no fabrication.
 */
export interface ComparisonResult {
  // Evaluation context
  evaluationId: string;
  evaluationSessionId: string;
  evaluationStartedAt: number;

  // Reference to source analytics input
  analyticsInputId: string;
  executionPlanId: string;

  // All comparison deltas computed
  deltas: ComparisonDelta[];

  // All threshold markers evaluated
  thresholdMarkers: ThresholdMarker[];

  // Results per stage
  stageResults: StageComparisonResult[];

  // Total counts
  totalComparisons: number;
  totalDeltas: number;
  totalBreaches: number;

  // Optional metadata for result
  metadata?: Record<string, unknown>;
}

