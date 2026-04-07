/**
 * Trend Runtime Context
 * Explicit input specification for deterministic trend runtime evaluation.
 * All inputs caller-provided. No inference, no defaults, no generated values.
 * 
 * Requirements:
 * - Explicit threshold inputs (weak, moderate, strong)
 * - Explicit delta value surface with caller-provided numeric values
 * - Explicit runtime timestamps (caller-provided, never auto-generated)
 * - Support for optional related trends/deltas for multi-window extension
 * - Strict validation contract
 */

import type { TrendStructure, TrendDirection, TrendStrength } from "../contracts/TrendModelContract.ts";

/**
 * DeltaValueSurface
 * Structural delta surface between previous and current values.
 * Contains explicit numeric values provided by caller only.
 * Runtime may compute delta outputs from these explicit values only.
 * No hidden sourcing, no inferred values.
 */
export interface DeltaValueSurface {
  /** Window identifier for previous measurement point (required) */
  previousWindowId: string;

  /** Window identifier for current measurement point (required) */
  currentWindowId: string;

  /** Window identifier for baseline measurement point (optional) */
  baselineWindowId?: string;

  /** Comparison structure identifier for structural analysis (optional) */
  comparisonStructureId?: string;

  /** Comparison set identifier for set-based analysis (optional) */
  comparisonSetId?: string;

  /** Lineage chain identifier for chain-based analysis (optional) */
  lineageChainId?: string;

  /** Explicit numeric value at previous measurement point (caller-provided) */
  previousValue: number;

  /** Explicit numeric value at current measurement point (caller-provided) */
  currentValue: number;

  /** Optional explicit numeric value at baseline measurement point (caller-provided) */
  baselineValue?: number;

  /** Timestamp when delta surface was established (caller-provided, Unix milliseconds) */
  deltaEvaluatedAt: number;

  /** Optional metadata for delta surface context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * RelatedTrendRuntimeInput
 * Explicit input specification for evaluating a related trend in same runtime batch.
 * All IDs caller-provided. No generation.
 */
export interface RelatedTrendRuntimeInput {
  /** Associated trend identifier */
  trendId: string;

  /** Explicit delta value surface for this related trend (caller-provided) */
  deltaValueSurface: DeltaValueSurface;

  /** Explicit delta result identifier for this related trend (caller-provided) */
  deltaId: string;

  /** Explicit direction result identifier for this related trend (caller-provided) */
  directionResultId: string;

  /** Explicit strength result identifier for this related trend (caller-provided) */
  strengthResultId: string;

  /** Optional metadata for related input (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendRuntimeContext
 * Complete explicit input specification for deterministic trend runtime evaluation.
 * All fields must be explicitly provided by caller.
 * No inference, no hidden metadata generation, no synthesized defaults.
 * ALL IDS CALLER-PROVIDED. NO GENERATED IDS.
 */
export interface TrendRuntimeContext {
  /** Unique identifier for this runtime execution (caller-provided) */
  runtimeId: string;

  /** Associated runtime session identifier (caller-provided) */
  runtimeSessionId: string;

  /** Timestamp when runtime started (caller-provided, Unix milliseconds) */
  runtimeStartedAt: number;

  /** Timestamp when runtime completed (caller-provided, Unix milliseconds) */
  runtimeCompletedAt: number;

  /** The trend structure being evaluated (already-established structurally) */
  trendStructure: TrendStructure;

  /** Explicit delta value surface with numeric measurement points */
  deltaValueSurface: DeltaValueSurface;

  /** Explicit delta result identifier (caller-provided, not generated) */
  deltaId: string;

  /** Explicit direction result identifier (caller-provided, not generated) */
  directionResultId: string;

  /** Explicit strength result identifier (caller-provided, not generated) */
  strengthResultId: string;

  /** Optional array of related trend runtime inputs for multi-window extension */
  relatedTrendRuntimeInputs?: RelatedTrendRuntimeInput[];

  /** Explicit threshold for weak strength classification (caller-provided) */
  weakThreshold: number;

  /** Explicit threshold for moderate strength classification (caller-provided) */
  moderateThreshold: number;

  /** Explicit threshold for strong strength classification (caller-provided) */
  strongThreshold: number;

  /** Optional metadata for runtime context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendRuntimeContextValidator
 * Strict validation of runtime context structure and mandatory fields.
 * Throws on any validation failure.
 * Does not infer missing fields, does not synthesize defaults.
 */
export class TrendRuntimeContextValidator {
  /**
   * validate
   * Validate explicit runtime context structure.
   *
   * @param context - Runtime context to validate
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

    // Validate runtimeId
    if (typeof ctx.runtimeId !== "string" || ctx.runtimeId.length === 0) {
      errors.push("runtimeId must be a non-empty string (caller-provided)");
    }

    // Validate runtimeSessionId
    if (typeof ctx.runtimeSessionId !== "string" || ctx.runtimeSessionId.length === 0) {
      errors.push("runtimeSessionId must be a non-empty string (caller-provided)");
    }

    // Validate runtimeStartedAt
    if (typeof ctx.runtimeStartedAt !== "number" || ctx.runtimeStartedAt < 0) {
      errors.push("runtimeStartedAt must be a non-negative number (caller-provided Unix milliseconds)");
    }

    // Validate runtimeCompletedAt
    if (typeof ctx.runtimeCompletedAt !== "number" || ctx.runtimeCompletedAt < 0) {
      errors.push("runtimeCompletedAt must be a non-negative number (caller-provided Unix milliseconds)");
    }

    // Validate trendStructure
    if (!ctx.trendStructure || typeof ctx.trendStructure !== "object") {
      errors.push("trendStructure must be an object");
    } else {
      const ts = ctx.trendStructure as Record<string, unknown>;
      if (typeof ts.trendId !== "string" || ts.trendId.length === 0) {
        errors.push("trendStructure.trendId must be a non-empty string");
      }
      if (!ts.inputSurface) {
        errors.push("trendStructure.inputSurface must be present");
      }
    }

    // Validate deltaValueSurface
    if (!ctx.deltaValueSurface || typeof ctx.deltaValueSurface !== "object") {
      errors.push("deltaValueSurface must be an object");
    } else {
      const dvs = ctx.deltaValueSurface as Record<string, unknown>;
      if (typeof dvs.previousWindowId !== "string" || dvs.previousWindowId.length === 0) {
        errors.push("deltaValueSurface.previousWindowId must be a non-empty string");
      }
      if (typeof dvs.currentWindowId !== "string" || dvs.currentWindowId.length === 0) {
        errors.push("deltaValueSurface.currentWindowId must be a non-empty string");
      }
      if (typeof dvs.previousValue !== "number") {
        errors.push("deltaValueSurface.previousValue must be a number (caller-provided)");
      }
      if (typeof dvs.currentValue !== "number") {
        errors.push("deltaValueSurface.currentValue must be a number (caller-provided)");
      }
      if (typeof dvs.deltaEvaluatedAt !== "number" || dvs.deltaEvaluatedAt < 0) {
        errors.push("deltaValueSurface.deltaEvaluatedAt must be a non-negative number (caller-provided Unix milliseconds)");
      }
    }

    // Validate deltaId
    if (typeof ctx.deltaId !== "string" || ctx.deltaId.length === 0) {
      errors.push("deltaId must be a non-empty string (caller-provided)");
    }

    // Validate directionResultId
    if (typeof ctx.directionResultId !== "string" || ctx.directionResultId.length === 0) {
      errors.push("directionResultId must be a non-empty string (caller-provided)");
    }

    // Validate strengthResultId
    if (typeof ctx.strengthResultId !== "string" || ctx.strengthResultId.length === 0) {
      errors.push("strengthResultId must be a non-empty string (caller-provided)");
    }

    // Validate optional relatedTrendRuntimeInputs if present
    if (ctx.relatedTrendRuntimeInputs !== undefined) {
      if (!Array.isArray(ctx.relatedTrendRuntimeInputs)) {
        errors.push("relatedTrendRuntimeInputs must be an array if present");
      } else {
        for (let i = 0; i < ctx.relatedTrendRuntimeInputs.length; i++) {
          const input = ctx.relatedTrendRuntimeInputs[i];
          if (!input || typeof input !== "object") {
            errors.push(`relatedTrendRuntimeInputs[${i}] must be an object`);
            continue;
          }
          const relInput = input as Record<string, unknown>;
          if (typeof relInput.trendId !== "string" || relInput.trendId.length === 0) {
            errors.push(`relatedTrendRuntimeInputs[${i}].trendId must be a non-empty string`);
          }
          if (typeof relInput.deltaId !== "string" || relInput.deltaId.length === 0) {
            errors.push(`relatedTrendRuntimeInputs[${i}].deltaId must be a non-empty string (caller-provided)`);
          }
          if (typeof relInput.directionResultId !== "string" || relInput.directionResultId.length === 0) {
            errors.push(`relatedTrendRuntimeInputs[${i}].directionResultId must be a non-empty string (caller-provided)`);
          }
          if (typeof relInput.strengthResultId !== "string" || relInput.strengthResultId.length === 0) {
            errors.push(`relatedTrendRuntimeInputs[${i}].strengthResultId must be a non-empty string (caller-provided)`);
          }
        }
      }
    }

    // Validate weak threshold
    if (typeof ctx.weakThreshold !== "number") {
      errors.push("weakThreshold must be a number (caller-provided)");
    }

    // Validate moderate threshold
    if (typeof ctx.moderateThreshold !== "number") {
      errors.push("moderateThreshold must be a number (caller-provided)");
    }

    // Validate strong threshold
    if (typeof ctx.strongThreshold !== "number") {
      errors.push("strongThreshold must be a number (caller-provided)");
    }

    // Validate optional relatedTrendStructures if present
    if (ctx.relatedTrendStructures !== undefined) {
      if (!Array.isArray(ctx.relatedTrendStructures)) {
        errors.push("relatedTrendStructures must be an array if present");
      }
    }

    // Validate optional relatedDeltaSurfaces if present
    if (ctx.relatedDeltaSurfaces !== undefined) {
      if (!Array.isArray(ctx.relatedDeltaSurfaces)) {
        errors.push("relatedDeltaSurfaces must be an array if present");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * validateStrict
   * Validate context and throw if any validation errors found.
   *
   * @param context - Runtime context to validate
   * @throws Error if validation fails
   */
  static validateStrict(context: unknown): asserts context is TrendRuntimeContext {
    const validation = this.validate(context);
    if (!validation.isValid) {
      throw new Error(
        `TrendRuntimeContextValidator.validateStrict: Invalid context\n${validation.errors.join("\n")}`
      );
    }
  }
}
