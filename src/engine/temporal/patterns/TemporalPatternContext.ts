/**
 * Temporal Pattern Context
 * Explicit input specification for pattern/pressure reading stage.
 * Accepts evaluation outputs and pattern-reading options.
 * All identifiers, thresholds, and options caller-provided.
 * No defaults, no inference, no fabrication.
 */

import type { TemporalEvaluationOutput } from "../evaluation/index.ts";

/**
 * PressureReadingOptions
 * Configuration for pressure-surface reading.
 * Defines what constitutes repeated breaches, stage density, accumulation patterns.
 * Caller controls all thresholds.
 */
export interface PressureReadingOptions {
  // Minimum number of breaches in a comparison to mark as "repeated"
  // If a comparison has >= this many breaches, flag as repeated pressure
  repeatedBreachThreshold: number;

  // Minimum number of breaches in a stage to mark as "dense"
  // If a stage has >= this many breaches, mark as dense
  stageDensityThreshold: number;

  // Whether to track route accumulation (progression pattern across stages)
  // If true, analyze how pressure accumulates across stage sequence
  trackRouteAccumulation: boolean;

  // Whether to measure overlap concentration
  // If true, measure how concentrated overlaps are in comparisons
  measureOverlapConcentration: boolean;

  // How many top stages (by breach count) to include in concentration areas (caller-provided)
  // If not provided, no concentration areas are created
  concentrationAreaTopStageCount?: number;

  // How many top comparisons (by overlap count) to include in overlap concentration analysis (caller-provided)
  // If not provided, uses all comparisons with overlaps
  concentrationIndexTopComparisonCount?: number;
}

/**
 * PatternReadingOptions
 * Configuration for pattern-surface reading.
 * Defines what constitutes drift, clusters, concentration areas.
 * Caller controls all grouping/correlation rules.
 */
export interface PatternReadingOptions {
  // Minimum difference in breach counts between stages to mark as "drift"
  // If stage breach count differs by >= this amount, record as drift
  driftDeltaThreshold: number;

  // Whether to cluster comparisons by breach pattern similarity
  // If true, group comparisons with similar breach patterns
  clusterByPattern: boolean;

  // Minimum cluster size (for pattern clustering)
  // Only create clusters if they contain >= this many comparisons
  minClusterSize: number;
}

/**
 * TemporalPatternContext
 * Complete input specification for pattern/pressure reading stage.
 * All fields explicitly provided by caller.
 * No inference, no hidden generation.
 */
export interface TemporalPatternContext {
  // Explicit reading identifiers (caller-provided)
  readingId: string;
  readingSessionId: string;

  // When pattern reading was initiated (caller-provided, Unix milliseconds)
  readingStartedAt: number;

  // The evaluation output that will be analyzed
  // This is what the pattern/pressure reading stage will process
  sourceEvaluationOutput: TemporalEvaluationOutput;

  // Explicit pressure-reading options from caller
  // Defines what pressure surfaces to derive
  pressureReadingOptions: PressureReadingOptions;

  // Explicit pattern-reading options from caller
  // Defines what pattern surfaces to derive
  patternReadingOptions: PatternReadingOptions;

  // Optional metadata (caller-provided context only)
  // No fallback empty objects
  metadata?: Record<string, unknown>;
}

/**
 * TemporalPatternContextValidator
 * Structural validation of pattern context.
 * Validates only declared structure, not domain semantics.
 * All validation messages are explicit.
 */
export class TemporalPatternContextValidator {
  /**
   * validate
   * Check structural completeness and type correctness of context.
   * Does NOT validate business logic or domain semantics.
   *
   * @param context - Context to validate
   * @returns Object with isValid flag and error messages
   */
  static validate(context: TemporalPatternContext): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate reading identifiers
    if (!context.readingId || typeof context.readingId !== "string") {
      errors.push("readingId: required string");
    }
    if (!context.readingSessionId || typeof context.readingSessionId !== "string") {
      errors.push("readingSessionId: required string");
    }
    if (typeof context.readingStartedAt !== "number" || context.readingStartedAt < 0) {
      errors.push("readingStartedAt: required non-negative number (Unix milliseconds)");
    }

    // Validate evaluation output exists
    if (!context.sourceEvaluationOutput) {
      errors.push("sourceEvaluationOutput: required TemporalEvaluationOutput");
    } else {
      if (!context.sourceEvaluationOutput.evaluationId) {
        errors.push("sourceEvaluationOutput.evaluationId: required");
      }
      if (!context.sourceEvaluationOutput.sourceComparisonResult) {
        errors.push("sourceEvaluationOutput.sourceComparisonResult: required");
      }
      if (!Array.isArray(context.sourceEvaluationOutput.comparisons)) {
        errors.push("sourceEvaluationOutput.comparisons: required array");
      }
    }

    // Validate pressure reading options
    if (!context.pressureReadingOptions) {
      errors.push("pressureReadingOptions: required PressureReadingOptions");
    } else {
      const opts = context.pressureReadingOptions;

      if (typeof opts.repeatedBreachThreshold !== "number" || opts.repeatedBreachThreshold < 0) {
        errors.push("pressureReadingOptions.repeatedBreachThreshold: required non-negative number");
      }
      if (typeof opts.stageDensityThreshold !== "number" || opts.stageDensityThreshold < 0) {
        errors.push("pressureReadingOptions.stageDensityThreshold: required non-negative number");
      }
      if (typeof opts.trackRouteAccumulation !== "boolean") {
        errors.push("pressureReadingOptions.trackRouteAccumulation: required boolean");
      }
      if (typeof opts.measureOverlapConcentration !== "boolean") {
        errors.push("pressureReadingOptions.measureOverlapConcentration: required boolean");
      }
    }

    // Validate pattern reading options
    if (!context.patternReadingOptions) {
      errors.push("patternReadingOptions: required PatternReadingOptions");
    } else {
      const opts = context.patternReadingOptions;

      if (typeof opts.driftDeltaThreshold !== "number" || opts.driftDeltaThreshold < 0) {
        errors.push("patternReadingOptions.driftDeltaThreshold: required non-negative number");
      }
      if (typeof opts.clusterByPattern !== "boolean") {
        errors.push("patternReadingOptions.clusterByPattern: required boolean");
      }
      if (typeof opts.minClusterSize !== "number" || opts.minClusterSize < 1) {
        errors.push("patternReadingOptions.minClusterSize: required positive number");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
