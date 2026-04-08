/**
 * Temporal Composite Context
 * Explicit input specification for deterministic temporal composite surface binding.
 * Binds multiple temporal result references into a single composite surface.
 * All inputs caller-provided. No inference, no defaults, no generated values.
 *
 * Requirements:
 * - Explicit temporal composite IDs (all caller-provided, not generated)
 * - Explicit result references (optional, only provided refs are included)
 * - Explicit member IDs matching included refs count
 * - Strict validation contract
 */

/**
 * TrendRuntimeResultRef
 * Reference to trend runtime result from runtime layer.
 */
export interface TrendRuntimeResultRef {
  /** Source result identifier (caller-provided) */
  sourceId: string;

  /** Source runtime identifier (caller-provided) */
  sourceRuntimeId: string;

  /** Source layer designation (must be "runtime") */
  sourceLayer: "runtime";

  /** Trend identifier from runtime result (caller-provided) */
  trendId: string;
}

/**
 * PressureEvolutionResultRef
 * Reference to pressure evolution result from patterns layer.
 */
export interface PressureEvolutionResultRef {
  /** Source result identifier (caller-provided) */
  sourceId: string;

  /** Source runtime identifier (caller-provided) */
  sourceRuntimeId: string;

  /** Source layer designation (must be "patterns") */
  sourceLayer: "patterns";

  /** Source trend identifier (caller-provided) */
  sourceTrendId: string;
}

/**
 * TrendChainResultRef
 * Reference to trend chain result from analytics layer.
 */
export interface TrendChainResultRef {
  /** Source result identifier (caller-provided) */
  sourceId: string;

  /** Source runtime identifier (caller-provided) */
  sourceRuntimeId: string;

  /** Source layer designation (must be "analytics") */
  sourceLayer: "analytics";

  /** Trend chain identifier from chain result (caller-provided) */
  trendChainId: string;
}

/**
 * TrendChainEvaluationResultRef
 * Reference to trend chain evaluation result from evaluation layer.
 */
export interface TrendChainEvaluationResultRef {
  /** Source result identifier (caller-provided) */
  sourceId: string;

  /** Source runtime identifier (caller-provided) */
  sourceRuntimeId: string;

  /** Source layer designation (must be "evaluation") */
  sourceLayer: "evaluation";

  /** Evaluation surface identifier from evaluation result (caller-provided) */
  evaluationSurfaceId: string;
}

/**
 * TemporalCompositeMemberRef
 * Explicit member reference in temporal composite surface.
 * Represents binding of a single temporal result into composite.
 */
export interface TemporalCompositeMemberRef {
  /** Unique identifier for this composite member (caller-provided) */
  compositeMemberId: string;

  /** Type of member indicates which layer it comes from */
  memberType: "trend_runtime" | "pressure_evolution" | "trend_chain" | "trend_chain_evaluation";

  /** Source identifier from original result */
  sourceId: string;

  /** Source runtime identifier */
  sourceRuntimeId: string;

  /** Source layer (runtime | patterns | analytics | evaluation) */
  sourceLayer: "runtime" | "patterns" | "analytics" | "evaluation";

  /** Timestamp when member was bound to composite (caller-provided, Unix milliseconds) */
  boundAt: number;

  /** Optional metadata for member context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TemporalCompositeContext
 * Complete explicit input specification for deterministic temporal composite surface binding.
 * All fields must be explicitly provided by caller.
 * No inference, no hidden metadata generation, no synthesized defaults.
 * ALL IDS CALLER-PROVIDED. NO GENERATED IDS.
 */
export interface TemporalCompositeContext {
  /** Unique identifier for this composite runtime execution (caller-provided) */
  compositeRuntimeId: string;

  /** Associated composite session identifier (caller-provided) */
  compositeSessionId: string;

  /** Timestamp when composite runtime started (caller-provided, Unix milliseconds) */
  compositeStartedAt: number;

  /** Timestamp when composite runtime completed (caller-provided, Unix milliseconds) */
  compositeCompletedAt: number;

  /** Explicit temporal composite identifier (caller-provided) */
  temporalCompositeId: string;

  /** Composite type classification (caller-provided) */
  compositeType:
    | "runtime_patterns_bridge"
    | "runtime_chain_bridge"
    | "full_temporal_surface"
    | "explicit_temporal_group"
    | "undefined";

  /** Optional trend runtime result reference (may be null) */
  trendRuntimeResultRef?: TrendRuntimeResultRef | null;

  /** Optional pressure evolution result reference (may be null) */
  pressureEvolutionResultRef?: PressureEvolutionResultRef | null;

  /** Optional trend chain result reference (may be null) */
  trendChainResultRef?: TrendChainResultRef | null;

  /** Optional trend chain evaluation result reference (may be null) */
  trendChainEvaluationResultRef?: TrendChainEvaluationResultRef | null;

  /** Member identifiers for composite surface (caller-provided array, must match included refs count) */
  memberIds: string[];

  /** Optional metadata for composite context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TemporalCompositeContextValidator
 * Strict validation of composite context structure and mandatory fields.
 * Throws on any validation failure.
 * Does not infer missing fields, does not synthesize defaults.
 */
export class TemporalCompositeContextValidator {
  /**
   * validate
   * Validate explicit composite context structure.
   *
   * @param context - Composite context to validate
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

    // Validate compositeRuntimeId
    if (typeof ctx.compositeRuntimeId !== "string" || ctx.compositeRuntimeId.length === 0) {
      errors.push("compositeRuntimeId must be a non-empty string (caller-provided)");
    }

    // Validate compositeSessionId
    if (typeof ctx.compositeSessionId !== "string" || ctx.compositeSessionId.length === 0) {
      errors.push("compositeSessionId must be a non-empty string (caller-provided)");
    }

    // Validate compositeStartedAt
    if (typeof ctx.compositeStartedAt !== "number" || ctx.compositeStartedAt < 0) {
      errors.push("compositeStartedAt must be a non-negative number (caller-provided Unix milliseconds)");
    }

    // Validate compositeCompletedAt
    if (typeof ctx.compositeCompletedAt !== "number" || ctx.compositeCompletedAt < 0) {
      errors.push("compositeCompletedAt must be a non-negative number (caller-provided Unix milliseconds)");
    }

    // Validate temporalCompositeId
    if (typeof ctx.temporalCompositeId !== "string" || ctx.temporalCompositeId.length === 0) {
      errors.push("temporalCompositeId must be a non-empty string (caller-provided)");
    }

    // Validate compositeType
    const validCompositeTypes = [
      "runtime_patterns_bridge",
      "runtime_chain_bridge",
      "full_temporal_surface",
      "explicit_temporal_group",
      "undefined",
    ];
    if (!validCompositeTypes.includes(ctx.compositeType as string)) {
      errors.push(`compositeType must be one of: ${validCompositeTypes.join(", ")}`);
    }

    // Validate memberIds array
    if (!Array.isArray(ctx.memberIds)) {
      errors.push("memberIds must be an array");
    } else {
      for (let i = 0; i < ctx.memberIds.length; i++) {
        const id = ctx.memberIds[i];
        if (typeof id !== "string" || id.length === 0) {
          errors.push(`memberIds[${i}] must be a non-empty string (caller-provided)`);
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
   * @param context - Composite context to validate
   * @throws Error if validation fails
   */
  static validateStrict(context: unknown): void {
    const result = this.validate(context);
    if (!result.isValid) {
      throw new Error(`TemporalCompositeContextValidator: ${result.errors.join("; ")}`);
    }
  }
}
