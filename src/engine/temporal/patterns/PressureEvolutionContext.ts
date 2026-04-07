/**
 * Pressure Evolution Context
 * Explicit input specification for deterministic pressure evolution evaluation.
 * All inputs caller-provided. No inference, no defaults, no generated values.
 * 
 * Requirements:
 * - Explicit pressure evolution IDs (all caller-provided, not generated)
 * - Explicit pressure evolution input surface derived from trend runtime outputs
 * - Optional previous pressure evolution surface for transition detection
 * - Explicit runtime timestamps (caller-provided, never auto-generated)
 * - Strict validation contract
 */

import type { PressureEvolutionSurface } from "./PressureEvolutionResult.ts";

/**
 * PressureEvolutionInputSurface
 * Structural input surface derived from explicit trend runtime outputs.
 * Contains explicit direction, strength, and delta values from runtime.
 * No hidden sourcing, no inferred values beyond what runtime explicitly computed.
 */
export interface PressureEvolutionInputSurface {
  /** Source trend identifier (caller-provided) */
  sourceTrendId: string;

  /** Source runtime identifier (caller-provided) */
  sourceRuntimeId: string;

  /** Source delta computation result identifier (caller-provided) */
  sourceDeltaId: string;

  /** Source direction derivation result identifier (caller-provided) */
  sourceDirectionResultId: string;

  /** Source strength derivation result identifier (caller-provided) */
  sourceStrengthResultId: string;

  /** Explicit direction from runtime output (reuses TrendDirection) */
  direction: "increasing" | "decreasing" | "flat" | "mixed" | "undefined";

  /** Explicit strength from runtime output (reuses TrendStrength) */
  strength: "weak" | "moderate" | "strong" | "extreme" | "undefined";

  /** Explicit absolute delta from runtime output */
  absoluteDelta: number;

  /** Optional relative delta from runtime output */
  relativeDelta?: number;

  /** Optional percentage delta from runtime output */
  percentageDelta?: number;

  /** Timestamp when pressure evolution input was evaluated (caller-provided, Unix milliseconds) */
  evaluatedAt: number;

  /** Optional metadata for input context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * PressureEvolutionContext
 * Complete explicit input specification for deterministic pressure evolution evaluation.
 * All fields must be explicitly provided by caller.
 * No inference, no hidden metadata generation, no synthesized defaults.
 * ALL IDS CALLER-PROVIDED. NO GENERATED IDS.
 */
export interface PressureEvolutionContext {
  /** Unique identifier for this evolution runtime execution (caller-provided) */
  evolutionRuntimeId: string;

  /** Associated evolution session identifier (caller-provided) */
  evolutionSessionId: string;

  /** Timestamp when evolution runtime started (caller-provided, Unix milliseconds) */
  evolutionStartedAt: number;

  /** Timestamp when evolution runtime completed (caller-provided, Unix milliseconds) */
  evolutionCompletedAt: number;

  /** Explicit pressure evolution input surface with direction and strength */
  inputSurface: PressureEvolutionInputSurface;

  /** Explicit pressure evolution identifier for current stage (caller-provided) */
  pressureEvolutionId: string;

  /** Explicit current stage identifier (caller-provided) */
  currentStageId: string;

  /** Optional explicit previous stage identifier for transition detection (caller-provided if transition expected) */
  previousStageId?: string;

  /** Optional explicit transition identifier (caller-provided if stage changed from previous) */
  transitionId?: string;

  /** Optional previous pressure evolution surface for transition comparison (caller-provided) */
  previousPressureEvolutionSurface?: PressureEvolutionSurface;

  /** Position index for current stage within evolution sequence (caller-provided, 0-based) */
  currentStagePosition: number;

  /** Optional metadata for current stage context (caller-provided) */
  stageMetadata?: Record<string, unknown>;

  /** Optional metadata for pressure evolution surface context (caller-provided) */
  surfaceMetadata?: Record<string, unknown>;

  /** Optional metadata for pressure evolution result context (caller-provided) */
  resultMetadata?: Record<string, unknown>;

  /** Optional metadata for evolution context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * PressureEvolutionContextValidator
 * Strict validation of evolution context structure and mandatory fields.
 * Throws on any validation failure.
 * Does not infer missing fields, does not synthesize defaults.
 */
export class PressureEvolutionContextValidator {
  /**
   * validate
   * Validate explicit evolution context structure.
   *
   * @param context - Evolution context to validate
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

    // Validate evolutionRuntimeId
    if (typeof ctx.evolutionRuntimeId !== "string" || ctx.evolutionRuntimeId.length === 0) {
      errors.push("evolutionRuntimeId must be a non-empty string (caller-provided)");
    }

    // Validate evolutionSessionId
    if (typeof ctx.evolutionSessionId !== "string" || ctx.evolutionSessionId.length === 0) {
      errors.push("evolutionSessionId must be a non-empty string (caller-provided)");
    }

    // Validate evolutionStartedAt
    if (typeof ctx.evolutionStartedAt !== "number" || ctx.evolutionStartedAt < 0) {
      errors.push("evolutionStartedAt must be a non-negative number (caller-provided Unix milliseconds)");
    }

    // Validate evolutionCompletedAt
    if (typeof ctx.evolutionCompletedAt !== "number" || ctx.evolutionCompletedAt < 0) {
      errors.push("evolutionCompletedAt must be a non-negative number (caller-provided Unix milliseconds)");
    }

    // Validate inputSurface
    if (!ctx.inputSurface || typeof ctx.inputSurface !== "object") {
      errors.push("inputSurface must be an object");
    } else {
      const is = ctx.inputSurface as Record<string, unknown>;
      if (typeof is.sourceTrendId !== "string" || is.sourceTrendId.length === 0) {
        errors.push("inputSurface.sourceTrendId must be a non-empty string");
      }
      if (typeof is.sourceRuntimeId !== "string" || is.sourceRuntimeId.length === 0) {
        errors.push("inputSurface.sourceRuntimeId must be a non-empty string");
      }
      if (typeof is.sourceDeltaId !== "string" || is.sourceDeltaId.length === 0) {
        errors.push("inputSurface.sourceDeltaId must be a non-empty string");
      }
      if (typeof is.sourceDirectionResultId !== "string" || is.sourceDirectionResultId.length === 0) {
        errors.push("inputSurface.sourceDirectionResultId must be a non-empty string");
      }
      if (typeof is.sourceStrengthResultId !== "string" || is.sourceStrengthResultId.length === 0) {
        errors.push("inputSurface.sourceStrengthResultId must be a non-empty string");
      }
      const validDirections = ["increasing", "decreasing", "flat", "mixed", "undefined"];
      if (!validDirections.includes(is.direction as string)) {
        errors.push(`inputSurface.direction must be one of: ${validDirections.join(", ")}`);
      }
      const validStrengths = ["weak", "moderate", "strong", "extreme", "undefined"];
      if (!validStrengths.includes(is.strength as string)) {
        errors.push(`inputSurface.strength must be one of: ${validStrengths.join(", ")}`);
      }
      if (typeof is.absoluteDelta !== "number") {
        errors.push("inputSurface.absoluteDelta must be a number");
      }
      if (typeof is.evaluatedAt !== "number" || is.evaluatedAt < 0) {
        errors.push("inputSurface.evaluatedAt must be a non-negative number (caller-provided Unix milliseconds)");
      }
    }

    // Validate pressureEvolutionId
    if (typeof ctx.pressureEvolutionId !== "string" || ctx.pressureEvolutionId.length === 0) {
      errors.push("pressureEvolutionId must be a non-empty string (caller-provided)");
    }

    // Validate currentStageId
    if (typeof ctx.currentStageId !== "string" || ctx.currentStageId.length === 0) {
      errors.push("currentStageId must be a non-empty string (caller-provided)");
    }

    // Validate optional previousStageId if present
    if (ctx.previousStageId !== undefined) {
      if (typeof ctx.previousStageId !== "string" || ctx.previousStageId.length === 0) {
        errors.push("previousStageId must be a non-empty string if present (caller-provided)");
      }
    }

    // Validate optional transitionId if present
    if (ctx.transitionId !== undefined) {
      if (typeof ctx.transitionId !== "string" || ctx.transitionId.length === 0) {
        errors.push("transitionId must be a non-empty string if present (caller-provided)");
      }
    }

    // Validate currentStagePosition
    if (typeof ctx.currentStagePosition !== "number" || ctx.currentStagePosition < 0) {
      errors.push("currentStagePosition must be a non-negative number (caller-provided, 0-based)");
    }

    // Validate optional previousPressureEvolutionSurface if present
    if (ctx.previousPressureEvolutionSurface !== undefined) {
      if (typeof ctx.previousPressureEvolutionSurface !== "object") {
        errors.push("previousPressureEvolutionSurface must be an object if present");
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
   * @param context - Evolution context to validate
   * @throws Error if validation fails
   */
  static validateStrict(context: unknown): asserts context is PressureEvolutionContext {
    const validation = this.validate(context);
    if (!validation.isValid) {
      throw new Error(
        `PressureEvolutionContextValidator.validateStrict: Invalid context\n${validation.errors.join("\n")}`
      );
    }
  }
}
