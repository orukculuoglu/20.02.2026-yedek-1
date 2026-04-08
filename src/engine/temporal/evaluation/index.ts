/**
 * Temporal Evaluation Layer
 * Export surface for temporal evaluation functionality.
 */

// Core evaluation runtime
export { TemporalEvaluationRuntime } from "./TemporalEvaluationRuntime.ts";

// Comparison context
export type { TemporalComparisonContext } from "./TemporalComparisonContext.ts";
export { TemporalComparisonContextValidator } from "./TemporalComparisonContext.ts";
export type { ComparisonEvaluationOptions } from "./TemporalComparisonContext.ts";

// Result types
export type {
  ComparisonDelta,
  ThresholdMarker,
  StageComparisonResult,
  ComparisonResult,
} from "./TemporalComparisonResult.ts";

export type {
  TemporalEvaluationOutput,
  ComparisonInterpretation,
  InterpretationMarker,
} from "./TemporalInterpretationResult.ts";

// Trend chain evaluation
export type { TrendChainEvaluationMarker } from "./TrendChainEvaluationContext.ts";
export type { TrendChainEvaluationContext } from "./TrendChainEvaluationContext.ts";
export { TrendChainEvaluationContextValidator } from "./TrendChainEvaluationContext.ts";

export type { TrendChainEvaluationSurface } from "./TrendChainEvaluationResult.ts";
export type { TrendChainEvaluationResult } from "./TrendChainEvaluationResult.ts";
export { TrendChainEvaluationResultBuilder } from "./TrendChainEvaluationResult.ts";

export { TrendChainEvaluationRuntime } from "./TrendChainEvaluationRuntime.ts";
