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
