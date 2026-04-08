/**
 * Temporal Composite Evaluation Context
 * Explicit input specification for deterministic temporal composite evaluation.
 * Binds temporal composite result into structural evaluation surface with markers.
 * All inputs caller-provided. No inference, no defaults, no generated values.
 *
 * Requirements:
 * - Explicit composite evaluation IDs (all caller-provided, not generated)
 * - Explicit evaluation markers via caller-provided markerIds
 * - Explicit temporal composite result to evaluate
 * - Strict validation contract
 */

import type { TemporalCompositeResult } from "../execution/TemporalCompositeResult.ts";

/**
 * TemporalCompositeEvaluationMarker
 * Explicit structural marker found during temporal composite evaluation.
 * Represents observable pattern or condition in the composite.
 */
export interface TemporalCompositeEvaluationMarker {
  /** Unique identifier for this marker (caller-provided) */
  markerId: string;

  /** Source temporal composite identifier that produced this marker (caller-provided) */
  sourceTemporalCompositeId: string;

  /** Type of structural marker detected (explicit enumeration) */
  markerType:
    | "empty_composite"
    | "single_layer_composite"
    | "multi_layer_composite"
    | "runtime_present"
    | "patterns_present"
    | "analytics_present"
    | "evaluation_present"
    | "full_layer_span"
    | "partial_layer_span"
    | "undefined_composite_state";

  /** Human-readable label for marker (fixed values only, no generation) */
  markerLabel:
    | "Empty Composite"
    | "Single Layer Composite"
    | "Multi Layer Composite"
    | "Runtime Present"
    | "Patterns Present"
    | "Analytics Present"
    | "Evaluation Present"
    | "Full Layer Span"
    | "Partial Layer Span"
    | "Undefined Composite State";

  /** Member IDs that contributed to this marker (caller-provided/derived array) */
  sourceCompositeMemberIds: string[];

  /** Timestamp when marker was detected (caller-provided, Unix milliseconds) */
  detectedAt: number;

  /** Optional metadata for marker context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TemporalCompositeEvaluationContext
 * Complete explicit input specification for deterministic temporal composite evaluation.
 * All fields must be explicitly provided by caller.
 * No inference, no hidden metadata generation, no synthesized defaults.
 * ALL IDS CALLER-PROVIDED. NO GENERATED IDS.
 */
export interface TemporalCompositeEvaluationContext {
  /** Unique identifier for this evaluation runtime execution (caller-provided) */
  evaluationRuntimeId: string;

  /** Associated evaluation session identifier (caller-provided) */
  evaluationSessionId: string;

  /** Timestamp when evaluation runtime started (caller-provided, Unix milliseconds) */
  evaluationStartedAt: number;

  /** Timestamp when evaluation runtime completed (caller-provided, Unix milliseconds) */
  evaluationCompletedAt: number;

  /** Temporal composite result to evaluate (explicit result from execution layer) */
  sourceTemporalCompositeResult: TemporalCompositeResult;

  /** Explicit evaluation surface identifier (caller-provided) */
  evaluationSurfaceId: string;

  /** Marker identifiers for evaluation surface (caller-provided array, must match marker count) */
  markerIds: string[];

  /** Optional metadata for evaluation context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TemporalCompositeEvaluationContextValidator
 * Strict validation of composite evaluation context structure and mandatory fields.
 * Throws on any validation failure.
 * Does not infer missing fields, does not synthesize defaults.
 */
export class TemporalCompositeEvaluationContextValidator {
  /**
   * validate
   * Validate explicit composite evaluation context structure.
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

    // Validate sourceTemporalCompositeResult exists and has required structure
    if (!ctx.sourceTemporalCompositeResult || typeof ctx.sourceTemporalCompositeResult !== "object") {
      errors.push("sourceTemporalCompositeResult must be an object (temporal composite result from execution layer)");
    } else {
      const result = ctx.sourceTemporalCompositeResult as Record<string, unknown>;
      if (!result.compositeRuntimeId) {
        errors.push("sourceTemporalCompositeResult.compositeRuntimeId is missing");
      }
      if (!result.temporalCompositeSurface) {
        errors.push("sourceTemporalCompositeResult.temporalCompositeSurface is missing");
      }
      if (typeof result.isReady !== "boolean") {
        errors.push("sourceTemporalCompositeResult.isReady must be a boolean");
      }
      if (!Array.isArray(result.readinessErrors)) {
        errors.push("sourceTemporalCompositeResult.readinessErrors must be an array");
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
      throw new Error(`TemporalCompositeEvaluationContextValidator: ${result.errors.join("; ")}`);
    }
  }
}
