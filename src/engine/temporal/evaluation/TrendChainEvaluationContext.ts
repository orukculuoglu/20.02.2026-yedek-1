/**
 * Trend Chain Evaluation Context
 * Explicit input specification for deterministic trend chain evaluation.
 * Binds trend chain result into structural evaluation surface with markers.
 * All inputs caller-provided. No inference, no defaults, no generated values.
 *
 * Requirements:
 * - Explicit trend chain evaluation IDs (all caller-provided, not generated)
 * - Explicit evaluation markers via caller-provided markerIds
 * - Explicit trend chain result to evaluate
 * - Strict validation contract
 */

import type { TrendChainResult } from "../analytics/TrendChainResult.ts";

/**
 * TrendChainEvaluationMarker
 * Explicit structural marker found during trend chain evaluation.
 * Represents observable pattern or condition in the chain.
 */
export interface TrendChainEvaluationMarker {
  /** Unique identifier for this marker (caller-provided) */
  markerId: string;

  /** Source trend chain identifier that produced this marker (caller-provided) */
  sourceTrendChainId: string;

  /** Type of structural marker detected (explicit enumeration) */
  markerType:
    | "single_member_chain"
    | "uniform_direction"
    | "mixed_direction"
    | "uniform_strength"
    | "mixed_strength"
    | "sequential_precedes_links"
    | "non_sequential_links_present"
    | "broken_first_last_alignment"
    | "invalid_links_present"
    | "undefined_chain_state";

  /** Human-readable label for marker (fixed values only, no generation) */
  markerLabel:
    | "Single Member Chain"
    | "Uniform Direction"
    | "Mixed Direction"
    | "Uniform Strength"
    | "Mixed Strength"
    | "Sequential Precedes Links"
    | "Non-Sequential Links Present"
    | "Broken First/Last Alignment"
    | "Invalid Links Present"
    | "Undefined Chain State";

  /** Member IDs that contributed to this marker (caller-provided array) */
  sourceMemberIds: string[];

  /** Timestamp when marker was detected (caller-provided, Unix milliseconds) */
  detectedAt: number;

  /** Optional metadata for marker context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendChainEvaluationContext
 * Complete explicit input specification for deterministic trend chain evaluation.
 * All fields must be explicitly provided by caller.
 * No inference, no hidden metadata generation, no synthesized defaults.
 * ALL IDS CALLER-PROVIDED. NO GENERATED IDS.
 */
export interface TrendChainEvaluationContext {
  /** Unique identifier for this evaluation runtime execution (caller-provided) */
  evaluationRuntimeId: string;

  /** Associated evaluation session identifier (caller-provided) */
  evaluationSessionId: string;

  /** Timestamp when evaluation runtime started (caller-provided, Unix milliseconds) */
  evaluationStartedAt: number;

  /** Timestamp when evaluation runtime completed (caller-provided, Unix milliseconds) */
  evaluationCompletedAt: number;

  /** Trend chain result to evaluate (explicit result from analytics layer) */
  sourceTrendChainResult: TrendChainResult;

  /** Explicit evaluation surface identifier (caller-provided) */
  evaluationSurfaceId: string;

  /** Marker identifiers for evaluation surface (caller-provided array, must match marker count) */
  markerIds: string[];

  /** Optional metadata for evaluation context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendChainEvaluationContextValidator
 * Strict validation of evaluation context structure and mandatory fields.
 * Throws on any validation failure.
 * Does not infer missing fields, does not synthesize defaults.
 */
export class TrendChainEvaluationContextValidator {
  /**
   * validate
   * Validate explicit evaluation context structure.
   *
   * @param context - Evaluation context to validate
   * @returns Validation result with boolean and error messages
   */
  static validate(context: unknown): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Type guard: context must be object
    if (!context || typeof context !== "object") {
      errors.push("Context must be an object");
      return { isValid: false, errors };
    }

    const ctx = context as Record<string, unknown>;

    // Validate evaluationRuntimeId
    if (typeof ctx.evaluationRuntimeId !== "string" || ctx.evaluationRuntimeId.length === 0) {
      errors.push("evaluationRuntimeId must be a non-empty string (caller-provided)");
    }

    // Validate evaluationSessionId
    if (typeof ctx.evaluationSessionId !== "string" || ctx.evaluationSessionId.length === 0) {
      errors.push("evaluationSessionId must be a non-empty string (caller-provided)");
    }

    // Validate evaluationStartedAt
    if (typeof ctx.evaluationStartedAt !== "number" || ctx.evaluationStartedAt < 0) {
      errors.push("evaluationStartedAt must be a non-negative number (caller-provided Unix milliseconds)");
    }

    // Validate evaluationCompletedAt
    if (typeof ctx.evaluationCompletedAt !== "number" || ctx.evaluationCompletedAt < 0) {
      errors.push("evaluationCompletedAt must be a non-negative number (caller-provided Unix milliseconds)");
    }

    // Validate sourceTrendChainResult exists and has required structure
    if (!ctx.sourceTrendChainResult || typeof ctx.sourceTrendChainResult !== "object") {
      errors.push("sourceTrendChainResult must be an object (trend chain result from analytics layer)");
    } else {
      const result = ctx.sourceTrendChainResult as Record<string, unknown>;
      if (!result.chainRuntimeId) {
        errors.push("sourceTrendChainResult.chainRuntimeId is missing");
      }
      if (!result.trendChainSurface) {
        errors.push("sourceTrendChainResult.trendChainSurface is missing");
      }
      if (typeof result.isReady !== "boolean") {
        errors.push("sourceTrendChainResult.isReady must be a boolean");
      }
      if (!Array.isArray(result.readinessErrors)) {
        errors.push("sourceTrendChainResult.readinessErrors must be an array");
      }
    }

    // Validate evaluationSurfaceId
    if (typeof ctx.evaluationSurfaceId !== "string" || ctx.evaluationSurfaceId.length === 0) {
      errors.push("evaluationSurfaceId must be a non-empty string (caller-provided)");
    }

    // Validate markerIds array
    if (!Array.isArray(ctx.markerIds)) {
      errors.push("markerIds must be an array");
    } else {
      for (let i = 0; i < ctx.markerIds.length; i++) {
        const id = ctx.markerIds[i];
        if (typeof id !== "string" || id.length === 0) {
          errors.push(`markerIds[${i}] must be a non-empty string (caller-provided)`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * validateStrict
   * Strict validation that throws on any error.
   *
   * @param context - Evaluation context to validate
   * @throws Error if validation fails
   */
  static validateStrict(context: unknown): void {
    const result = this.validate(context);
    if (!result.isValid) {
      throw new Error(`TrendChainEvaluationContextValidator: ${result.errors.join("; ")}`);
    }
  }
}
