/**
 * Temporal Analytics Binding Layer Entry Point
 * Exports all analytics binding orchestration components.
 */

// Context definitions
export type { TemporalAnalyticsBindingContext, AnalyticsBindingIntent } from "./TemporalAnalyticsBindingContext.ts";
export { TemporalAnalyticsBindingContextValidator } from "./TemporalAnalyticsBindingContext.ts";

// Analytics input definitions
export type {
  ComparisonAnalyticsPayload,
  StageAnalyticsPayload,
  RouteAnalyticsPayload,
  AnalyticsReadyInput,
} from "./TemporalAnalyticsInput.ts";

// Binding result definitions
export type { TemporalAnalyticsBindingResult } from "./TemporalAnalyticsBindingResult.ts";
export { TemporalAnalyticsBindingResultBuilder } from "./TemporalAnalyticsBindingResult.ts";

// Binding runtime orchestration
export { TemporalAnalyticsBindingRuntime } from "./TemporalAnalyticsBindingRuntime.ts";

// Trend chain context types
export type { TrendChainMember, TrendChainLink, TrendChainInputContext } from "./TrendChainContext.ts";
export { TrendChainContextValidator } from "./TrendChainContext.ts";

// Trend chain result types
export type { TrendChainSurface, TrendChainResult } from "./TrendChainResult.ts";
export { TrendChainResultBuilder } from "./TrendChainResult.ts";

// Trend chain runtime
export { TrendChainRuntime } from "./TrendChainRuntime.ts";
