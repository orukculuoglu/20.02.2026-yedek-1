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
