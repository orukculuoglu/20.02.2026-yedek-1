/**
 * Trend Chain Evaluation Result
 * Explicit output contracts for deterministic trend chain evaluation.
 * All results represent computed outputs from explicit caller-provided inputs only.
 * No business logic, no interpretation, no policy.
 */

import type { TrendChainEvaluationMarker } from "./TrendChainEvaluationContext.ts";

/**
 * TrendChainEvaluationSurface
 * Complete structural representation of trend chain evaluation state.
 * Binds markers, chain metadata, and evaluation summary together.
 * No business interpretation, purely structural observation.
 */
export interface TrendChainEvaluationSurface {
  /** Unique identifier for this evaluation surface (caller-provided) */
  evaluationSurfaceId: string;

  /** Source trend chain identifier being evaluated (caller-provided) */
  sourceTrendChainId: string;

  /** Source chain runtime identifier (from trend chain result) */
  sourceRuntimeId: string;

  /** Chain type classification (from trend chain result) */
  chainType: "linear" | "branchless_sequence" | "rolling_trend_set" | "explicit_group" | "undefined";

  /** Total member count in evaluated chain */
  memberCount: number;

  /** Total validated link count in evaluated chain */
  validatedLinkCount: number;

  /** Structural markers detected during evaluation */
  markers: TrendChainEvaluationMarker[];

  /** Timestamp when evaluation surface was created (caller-provided, Unix milliseconds) */
  evaluatedAt: number;

  /** Optional metadata for surface context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendChainEvaluationResult
 * Complete explicit output of deterministic trend chain evaluation.
 * Contains evaluation surface and readiness status.
 * All results strictly derived from explicit caller-provided inputs.
 * No business logic, no interpretation, no policy.
 */
export interface TrendChainEvaluationResult {
  /** Unique identifier for this evaluation runtime execution */
  evaluationRuntimeId: string;

  /** Associated evaluation session identifier */
  evaluationSessionId: string;

  /** Timestamp when evaluation runtime started */
  evaluationStartedAt: number;

  /** Timestamp when evaluation runtime completed */
  evaluationCompletedAt: number;

  /** Trend chain evaluation surface with markers and metadata */
  evaluationSurface: TrendChainEvaluationSurface;

  /** Overall readiness indicator: true if evaluation meets all structural requirements */
  isReady: boolean;

  /** Array of readiness errors if isReady is false (absent if isReady is true) */
  readinessErrors: string[];

  /** Optional metadata for result context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendChainEvaluationResultBuilder
 * Deterministic construction of trend chain evaluation results.
 * Assembles explicit computation outputs without interpretation.
 */
export class TrendChainEvaluationResultBuilder {
  /**
   * build
   * Construct a complete trend chain evaluation result from explicit components.
   * Accepts runtime-collected readiness errors to preserve structural violations.
   *
   * @param evaluationRuntimeId - Unique evaluation runtime execution identifier
   * @param evaluationSessionId - Associated evaluation session identifier
   * @param evaluationStartedAt - Timestamp when evaluation runtime started
   * @param evaluationCompletedAt - Timestamp when evaluation runtime completed
   * @param evaluationSurface - Computed evaluation surface
   * @param runtimeReadinessErrors - Errors collected during evaluation (preserved, not recomputed)
   * @param metadata - Optional context metadata
   * @returns Complete trend chain evaluation result
   */
  static build(
    evaluationRuntimeId: string,
    evaluationSessionId: string,
    evaluationStartedAt: number,
    evaluationCompletedAt: number,
    evaluationSurface: TrendChainEvaluationSurface,
    runtimeReadinessErrors: string[],
    metadata?: Record<string, unknown>
  ): TrendChainEvaluationResult {
    // Validate required fields
    if (!evaluationRuntimeId || typeof evaluationRuntimeId !== "string") {
      throw new Error("TrendChainEvaluationResultBuilder.build: evaluationRuntimeId must be a non-empty string");
    }
    if (!evaluationSessionId || typeof evaluationSessionId !== "string") {
      throw new Error("TrendChainEvaluationResultBuilder.build: evaluationSessionId must be a non-empty string");
    }
    if (typeof evaluationStartedAt !== "number" || evaluationStartedAt < 0) {
      throw new Error("TrendChainEvaluationResultBuilder.build: evaluationStartedAt must be a non-negative number");
    }
    if (typeof evaluationCompletedAt !== "number" || evaluationCompletedAt < 0) {
      throw new Error(
        "TrendChainEvaluationResultBuilder.build: evaluationCompletedAt must be a non-negative number"
      );
    }
    if (!evaluationSurface || typeof evaluationSurface !== "object") {
      throw new Error("TrendChainEvaluationResultBuilder.build: evaluationSurface must be an object");
    }
    if (!Array.isArray(runtimeReadinessErrors)) {
      throw new Error("TrendChainEvaluationResultBuilder.build: runtimeReadinessErrors must be an array");
    }

    // Preserve all runtime-collected readiness errors without recomputation
    // Runtime errors take precedence and are never overwritten
    const readinessErrors = [...runtimeReadinessErrors];

    // isReady becomes false if ANY errors were collected during evaluation
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
