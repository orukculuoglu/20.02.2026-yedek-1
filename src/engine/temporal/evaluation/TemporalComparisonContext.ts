/**
 * Temporal Comparison Context
 * Explicit input specification for comparison/evaluation stage.
 * Accepts analytics-ready temporal inputs and evaluation options.
 * All identifiers, thresholds, and options caller-provided.
 * No defaults, no inference, no fabrication.
 */

import type { AnalyticsReadyInput } from "../analytics/index.ts";

/**
 * ComparisonEvaluationOptions
 * Explicit evaluation configuration for comparison operations.
 * Caller defines thresholds and evaluation behavior.
 * No defaults - all values explicitly provided.
 */
export interface ComparisonEvaluationOptions {
  // Threshold for marking significant delta (must be >= 0)
  // If delta magnitude exceeds this value, mark as significant
  significantDeltaThreshold: number;

  // Threshold for marking volatility (must be >= 0)
  // If volatility measure exceeds this value, mark as volatile
  volatilityThreshold: number;

  // Whether to evaluate window overlap significance
  // If true, generate overlap markers when overlap exists
  evalOverlapSignificance: boolean;
}

/**
 * TemporalComparisonContext
 * Complete input specification for comparison/evaluation stage.
 * All fields explicitly provided by caller.
 * No inference, no hidden generation.
 */
export interface TemporalComparisonContext {
  // Explicit evaluation identifiers (caller-provided)
  evaluationId: string;
  evaluationSessionId: string;

  // When evaluation was initiated (caller-provided, Unix milliseconds)
  evaluationStartedAt: number;

  // The analytics-ready input that will be evaluated
  // This is what the comparison/evaluation stage will process
  analyticsReadyInput: AnalyticsReadyInput;

  // Explicit evaluation options from caller
  // Defines what comparisons and interpretations to create
  evaluationOptions: ComparisonEvaluationOptions;

  // Optional metadata (caller-provided context only)
  // No fallback empty objects
  metadata?: Record<string, unknown>;
}

/**
 * TemporalComparisonContextValidator
 * Structural validation of comparison context.
 * Validates only declared structure, not domain semantics.
 * All validation messages are explicit.
 */
export class TemporalComparisonContextValidator {
  /**
   * validate
   * Check structural completeness and type correctness of context.
   * Does NOT validate business logic or domain semantics.
   *
   * @param context - Context to validate
   * @returns Object with isValid flag and error messages
   */
  static validate(context: TemporalComparisonContext): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate evaluation identifiers
    if (!context.evaluationId || typeof context.evaluationId !== "string") {
      errors.push("evaluationId: required string");
    }
    if (!context.evaluationSessionId || typeof context.evaluationSessionId !== "string") {
      errors.push("evaluationSessionId: required string");
    }
    if (typeof context.evaluationStartedAt !== "number" || context.evaluationStartedAt < 0) {
      errors.push("evaluationStartedAt: required non-negative number (Unix milliseconds)");
    }

    // Validate analytics input exists
    if (!context.analyticsReadyInput) {
      errors.push("analyticsReadyInput: required AnalyticsReadyInput");
    } else {
      if (!context.analyticsReadyInput.analyticsInputId) {
        errors.push("analyticsReadyInput.analyticsInputId: required");
      }
      if (!Array.isArray(context.analyticsReadyInput.comparisons)) {
        errors.push("analyticsReadyInput.comparisons: required array");
      }
      if (!Array.isArray(context.analyticsReadyInput.stages)) {
        errors.push("analyticsReadyInput.stages: required array");
      }
    }

    // Validate evaluation options
    if (!context.evaluationOptions) {
      errors.push("evaluationOptions: required ComparisonEvaluationOptions");
    } else {
      const opts = context.evaluationOptions;

      if (typeof opts.significantDeltaThreshold !== "number" || opts.significantDeltaThreshold < 0) {
        errors.push("evaluationOptions.significantDeltaThreshold: required non-negative number");
      }
      if (typeof opts.volatilityThreshold !== "number" || opts.volatilityThreshold < 0) {
        errors.push("evaluationOptions.volatilityThreshold: required non-negative number");
      }
      if (typeof opts.evalOverlapSignificance !== "boolean") {
        errors.push("evaluationOptions.evalOverlapSignificance: required boolean");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
