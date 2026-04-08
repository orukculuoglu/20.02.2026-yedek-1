/**
 * Temporal Composite Evaluation Result
 * Explicit output contracts for deterministic temporal composite evaluation.
 * All results represent computed outputs from explicit caller-provided inputs only.
 * No business logic, no interpretation, no policy.
 */

import type { TemporalCompositeEvaluationMarker } from "./TemporalCompositeEvaluationContext.ts";

/**
 * TemporalCompositeEvaluationSurface
 * Complete structural representation of temporal composite evaluation state.
 * Binds markers and composite metadata together.
 * No business interpretation, purely structural observation.
 */
export interface TemporalCompositeEvaluationSurface {
  /** Unique identifier for this composite evaluation surface (caller-provided) */
  evaluationSurfaceId: string;

  /** Source temporal composite identifier being evaluated (caller-provided) */
  sourceTemporalCompositeId: string;

  /** Source composite runtime identifier (from composite result) */
  sourceRuntimeId: string;

  /** Composite type classification (from composite result) */
  compositeType:
    | "runtime_patterns_bridge"
    | "runtime_chain_bridge"
    | "full_temporal_surface"
    | "explicit_temporal_group"
    | "undefined";

  /** Total member count in evaluated composite */
  memberCount: number;

  /** Source layers included in evaluated composite */
  includedLayers: Array<"runtime" | "patterns" | "analytics" | "evaluation">;

  /** Structural markers detected during evaluation */
  markers: TemporalCompositeEvaluationMarker[];

  /** Timestamp when composite evaluation surface was created (caller-provided, Unix milliseconds) */
  evaluatedAt: number;

  /** Optional metadata for surface context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TemporalCompositeEvaluationResult
 * Complete explicit output of deterministic temporal composite evaluation.
 * Contains evaluation surface and readiness status.
 * All results strictly derived from explicit caller-provided inputs.
 * No business logic, no interpretation, no policy.
 */
export interface TemporalCompositeEvaluationResult {
  /** Unique identifier for this composite evaluation runtime execution */
  evaluationRuntimeId: string;

  /** Associated evaluation session identifier */
  evaluationSessionId: string;

  /** Timestamp when composite evaluation runtime started */
  evaluationStartedAt: number;

  /** Timestamp when composite evaluation runtime completed */
  evaluationCompletedAt: number;

  /** Temporal composite evaluation surface with markers and metadata */
  evaluationSurface: TemporalCompositeEvaluationSurface;

  /** Overall readiness indicator: true if evaluation meets all structural requirements */
  isReady: boolean;

  /** Array of readiness errors if isReady is false (absent if isReady is true) */
  readinessErrors: string[];

  /** Optional metadata for result context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TemporalCompositeEvaluationResultBuilder
 * Deterministic construction of temporal composite evaluation results.
 * Assembles explicit computation outputs without interpretation.
 */
export class TemporalCompositeEvaluationResultBuilder {
  /**
   * build
   * Construct a complete temporal composite evaluation result from explicit components.
   * Accepts runtime-collected readiness errors to preserve structural violations.
   *
   * @param evaluationRuntimeId - Unique evaluation runtime execution identifier
   * @param evaluationSessionId - Associated evaluation session identifier
   * @param evaluationStartedAt - Timestamp when evaluation runtime started
   * @param evaluationCompletedAt - Timestamp when evaluation runtime completed
   * @param evaluationSurface - Computed evaluation surface
   * @param runtimeReadinessErrors - Errors collected during evaluation (preserved, not recomputed)
   * @param metadata - Optional context metadata
   * @returns Complete temporal composite evaluation result
   */
  static build(
    evaluationRuntimeId: string,
    evaluationSessionId: string,
    evaluationStartedAt: number,
    evaluationCompletedAt: number,
    evaluationSurface: TemporalCompositeEvaluationSurface,
    runtimeReadinessErrors: string[],
    metadata?: Record<string, unknown>
  ): TemporalCompositeEvaluationResult {
    // Validate required fields
    if (!evaluationRuntimeId || typeof evaluationRuntimeId !== "string") {
      throw new Error(
        "TemporalCompositeEvaluationResultBuilder.build: evaluationRuntimeId must be a non-empty string"
      );
    }
    if (!evaluationSessionId || typeof evaluationSessionId !== "string") {
      throw new Error(
        "TemporalCompositeEvaluationResultBuilder.build: evaluationSessionId must be a non-empty string"
      );
    }
    if (typeof evaluationStartedAt !== "number" || evaluationStartedAt < 0) {
      throw new Error(
        "TemporalCompositeEvaluationResultBuilder.build: evaluationStartedAt must be a non-negative number"
      );
    }
    if (typeof evaluationCompletedAt !== "number" || evaluationCompletedAt < 0) {
      throw new Error(
        "TemporalCompositeEvaluationResultBuilder.build: evaluationCompletedAt must be a non-negative number"
      );
    }
    if (!evaluationSurface || typeof evaluationSurface !== "object") {
      throw new Error("TemporalCompositeEvaluationResultBuilder.build: evaluationSurface must be an object");
    }
    if (!Array.isArray(runtimeReadinessErrors)) {
      throw new Error("TemporalCompositeEvaluationResultBuilder.build: runtimeReadinessErrors must be an array");
    }

    // Preserve all runtime-collected readiness errors without recomputation
    // Runtime errors take precedence and are never overwritten
    const readinessErrors = [...runtimeReadinessErrors];

    // isReady becomes false if ANY errors were collected during composite evaluation
    const isReady = readinessErrors.length === 0;

    return {
      evaluationRuntimeId,
      evaluationSessionId,
      evaluationStartedAt,
      evaluationCompletedAt,
      evaluationSurface,
      isReady,
      readinessErrors,
      metadata: metadata ? { ...metadata } : undefined,
    };
  }
}
