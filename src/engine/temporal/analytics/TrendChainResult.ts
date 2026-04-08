/**
 * Trend Chain Result
 * Explicit output contracts for deterministic trend chain evaluation.
 * All results represent computed outputs from explicit caller-provided inputs only.
 * No business logic, no interpretation, no policy.
 */

import type { TrendChainMember, TrendChainLink } from "./TrendChainContext.ts";

/**
 * TrendChainSurface
 * Complete structural representation of trend chain state.
 * Binds members, links, and chain type together.
 * No business meaning assigned, purely structural.
 */
export interface TrendChainSurface {
  /** Unique identifier for this trend chain surface (caller-provided) */
  trendChainId: string;

  /** Chain type classification (caller-provided) */
  chainType: "linear" | "branchless_sequence" | "rolling_trend_set" | "explicit_group" | "undefined";

  /** Ordered members in chain sequence (sorted by chainPosition for deterministic output) */
  members: TrendChainMember[];

  /** Validated links between members */
  validatedLinks: TrendChainLink[];

  /** First trend identifier (caller-provided, validated against first ordered member) */
  firstTrendId: string;

  /** Last trend identifier (caller-provided, validated against last ordered member) */
  lastTrendId: string;

  /** Length of chain derived from members array length */
  chainLength: number;

  /** Timestamp when chain surface was evaluated (caller-provided, Unix milliseconds) */
  evaluatedAt: number;

  /** Optional metadata for surface context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendChainResult
 * Complete explicit output of deterministic trend chain evaluation.
 * Contains trend chain surface and readiness status.
 * All results strictly derived from explicit caller-provided inputs.
 * No business logic, no interpretation, no policy.
 */
export interface TrendChainResult {
  /** Unique identifier for this chain runtime execution */
  chainRuntimeId: string;

  /** Associated chain session identifier */
  chainSessionId: string;

  /** Timestamp when chain runtime started */
  chainStartedAt: number;

  /** Timestamp when chain runtime completed */
  chainCompletedAt: number;

  /** Trend chain surface with members, links, and metadata */
  trendChainSurface: TrendChainSurface;

  /** Validated links that passed structural validation */
  validatedLinks: TrendChainLink[];

  /** Overall readiness indicator: true if chain meets all structural requirements */
  isReady: boolean;

  /** Array of readiness errors if isReady is false (absent if isReady is true) */
  readinessErrors: string[];

  /** Optional metadata for result context (caller-provided) */
  metadata?: Record<string, unknown>;
}

/**
 * TrendChainResultBuilder
 * Deterministic construction of trend chain results.
 * Assembles explicit computation outputs without interpretation.
 */
export class TrendChainResultBuilder {
  /**
   * build
   * Construct a complete trend chain result from explicit components.
   * Accepts runtime-collected readiness errors to preserve structural violations.
   *
   * @param chainRuntimeId - Unique chain runtime execution identifier
   * @param chainSessionId - Associated chain session identifier
   * @param chainStartedAt - Timestamp when chain runtime started
   * @param chainCompletedAt - Timestamp when chain runtime completed
   * @param trendChainSurface - Computed trend chain surface
   * @param validatedLinks - Validated links
   * @param runtimeReadinessErrors - Errors collected during runtime evaluation (preserved, not recomputed)
   * @param metadata - Optional context metadata
   * @returns Complete trend chain result
   */
  static build(
    chainRuntimeId: string,
    chainSessionId: string,
    chainStartedAt: number,
    chainCompletedAt: number,
    trendChainSurface: TrendChainSurface,
    validatedLinks: TrendChainLink[],
    runtimeReadinessErrors: string[],
    metadata?: Record<string, unknown>
  ): TrendChainResult {
    // Validate required fields
    if (!chainRuntimeId || typeof chainRuntimeId !== "string") {
      throw new Error("TrendChainResultBuilder.build: chainRuntimeId must be a non-empty string");
    }
    if (!chainSessionId || typeof chainSessionId !== "string") {
      throw new Error("TrendChainResultBuilder.build: chainSessionId must be a non-empty string");
    }
    if (typeof chainStartedAt !== "number" || chainStartedAt < 0) {
      throw new Error("TrendChainResultBuilder.build: chainStartedAt must be a non-negative number");
    }
    if (typeof chainCompletedAt !== "number" || chainCompletedAt < 0) {
      throw new Error("TrendChainResultBuilder.build: chainCompletedAt must be a non-negative number");
    }
    if (!trendChainSurface || typeof trendChainSurface !== "object") {
      throw new Error("TrendChainResultBuilder.build: trendChainSurface must be an object");
    }
    if (!Array.isArray(validatedLinks)) {
      throw new Error("TrendChainResultBuilder.build: validatedLinks must be an array");
    }
    if (!Array.isArray(runtimeReadinessErrors)) {
      throw new Error("TrendChainResultBuilder.build: runtimeReadinessErrors must be an array");
    }

    // Preserve all runtime-collected readiness errors without recomputation
    // Runtime errors take precedence and are never overwritten
    const readinessErrors = [...runtimeReadinessErrors];

    // isReady becomes false if ANY errors were collected during runtime
    const isReady = readinessErrors.length === 0;

    return {
      chainRuntimeId,
      chainSessionId,
      chainStartedAt,
      chainCompletedAt,
      trendChainSurface,
      validatedLinks,
      isReady,
      readinessErrors,
      metadata: metadata ? { ...metadata } : undefined,
    };
  }
}
