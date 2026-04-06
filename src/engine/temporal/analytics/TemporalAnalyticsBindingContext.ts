/**
 * Temporal Analytics Binding Context
 * Explicit input specification for analytics binding stage.
 * Accepts execution plan and analytics configuration.
 * All identifiers and timestamps caller-provided or inherited.
 */

import type { ExecutionPlan } from "../execution/index.ts";

/**
 * AnalyticsBindingIntent
 * Explicit specification of what analytics should derive from execution.
 * Caller defines analytics surfaces and comparison coverage.
 * No defaults, no inference.
 */
export interface AnalyticsBindingIntent {
  // Unique analytics binding identifier (caller-provided)
  bindingId: string;

  // Which comparisons to include in analytics payload
  // Array of comparison structure IDs from execution plan
  // Empty array means no comparisons will be exposed in analytics input
  // Caller must be explicit; no automatic inclusion of all comparisons
  targetComparisonIds: string[];

  // Which stages to expose in analytics payload
  // Array of stage IDs from execution plan
  // Empty array means all stages will be exposed in analytics input
  // (all stages are included by default for full execution visibility)
  targetStageIds: string[];

  // Analytics-specific configuration (caller-provided context)
  analyticsConfiguration: Record<string, unknown>;

  // Metadata for binding context
  metadata: Record<string, unknown>;
}

/**
 * TemporalAnalyticsBindingContext
 * Complete input specification for analytics binding stage.
 * All fields explicitly provided by caller.
 * No inference, no hidden generation.
 */
export interface TemporalAnalyticsBindingContext {
  // Explicit binding identifiers (caller-provided)
  bindingId: string;
  bindingSessionId: string;

  // When binding was initiated (caller-provided)
  bindingStartedAt: number;

  // The execution plan that will be analyzed (explicit input)
  // This is what the analytics binding will process
  executionPlan: ExecutionPlan;

  // Explicit analytics binding intent from caller
  // Defines what analytics surface should be created
  bindingIntent: AnalyticsBindingIntent;

  // Explicit metadata (caller-provided context only)
  metadata: Record<string, unknown>;
}

/**
 * TemporalAnalyticsBindingContextValidator
 * Structural validation of analytics binding context.
 * Validates only declared structure, not domain semantics.
 */
export class TemporalAnalyticsBindingContextValidator {
  /**
   * validate
   * Check structural completeness and type correctness of context.
   * Does NOT validate business logic or domain semantics.
   *
   * @param context - Context to validate
   * @returns Object with isValid flag and error messages
   */
  static validate(context: TemporalAnalyticsBindingContext): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate binding identifiers
    if (!context.bindingId || typeof context.bindingId !== "string") {
      errors.push("context.bindingId must be a non-empty string");
    }
    if (!context.bindingSessionId || typeof context.bindingSessionId !== "string") {
      errors.push("context.bindingSessionId must be a non-empty string");
    }
    if (typeof context.bindingStartedAt !== "number" || context.bindingStartedAt < 0) {
      errors.push("context.bindingStartedAt must be a non-negative number (Unix milliseconds)");
    }

    // Validate execution plan exists
    if (!context.executionPlan) {
      errors.push("context.executionPlan is required");
    } else {
      if (!context.executionPlan.executionId) {
        errors.push("context.executionPlan.executionId is missing");
      }
      if (!Array.isArray(context.executionPlan.stages)) {
        errors.push("context.executionPlan.stages must be an array");
      }
      if (!Array.isArray(context.executionPlan.executionRoute)) {
        errors.push("context.executionPlan.executionRoute must be an array");
      }
    }

    // Validate binding intent
    if (!context.bindingIntent) {
      errors.push("context.bindingIntent is required");
    } else {
      const intent = context.bindingIntent;

      if (!intent.bindingId || typeof intent.bindingId !== "string") {
        errors.push("context.bindingIntent.bindingId must be a non-empty string");
      }
      if (!Array.isArray(intent.targetComparisonIds)) {
        errors.push("context.bindingIntent.targetComparisonIds must be an array");
      }
      if (!Array.isArray(intent.targetStageIds)) {
        errors.push("context.bindingIntent.targetStageIds must be an array");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
