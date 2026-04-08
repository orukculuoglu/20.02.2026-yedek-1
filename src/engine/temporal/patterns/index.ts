/**
 * Temporal Pattern Layer
 * Export surface for temporal pattern/pressure reading functionality.
 */

// Core pattern runtime
export { TemporalPatternRuntime } from "./TemporalPatternRuntime.ts";

// Pattern context
export type { TemporalPatternContext } from "./TemporalPatternContext.ts";
export { TemporalPatternContextValidator } from "./TemporalPatternContext.ts";
export type {
  PressureReadingOptions,
  PatternReadingOptions,
} from "./TemporalPatternContext.ts";

// Pressure result types
export type {
  RepeatedBreachSurface,
  StageDensitySurface,
  RouteAccumulationSurface,
  OverlapConcentrationSurface,
  PressureSurfaces,
} from "./TemporalPressureResult.ts";

// Pattern result types
export type {
  DriftSurface,
  RepetitionCluster,
  ConcentrationArea,
  PatternMarker,
  PatternSurfaces,
} from "./TemporalPatternResult.ts";

// Pressure evolution context types
export type { PressureEvolutionInputSurface, PressureEvolutionContext } from "./PressureEvolutionContext.ts";
export { PressureEvolutionContextValidator } from "./PressureEvolutionContext.ts";

// Pressure evolution result types
export type {
  PressureEvolutionStage,
  PressureEvolutionTransition,
  PressureEvolutionSurface,
  PressureEvolutionResult,
} from "./PressureEvolutionResult.ts";
export { PressureEvolutionResultBuilder } from "./PressureEvolutionResult.ts";

// Pressure evolution runtime
export { PressureEvolutionRuntime } from "./PressureEvolutionRuntime.ts";

// Temporal composite evaluation context types
export type { TemporalCompositeEvaluationMarker, TemporalCompositeEvaluationContext } from "./TemporalCompositeEvaluationContext.ts";
export { TemporalCompositeEvaluationContextValidator } from "./TemporalCompositeEvaluationContext.ts";

// Temporal composite evaluation result types
export type { TemporalCompositeEvaluationSurface, TemporalCompositeEvaluationResult } from "./TemporalCompositeEvaluationResult.ts";
export { TemporalCompositeEvaluationResultBuilder } from "./TemporalCompositeEvaluationResult.ts";

// Temporal composite evaluation runtime
export { TemporalCompositeEvaluationRuntime } from "./TemporalCompositeEvaluationRuntime.ts";

