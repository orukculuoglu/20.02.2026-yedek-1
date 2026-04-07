/**
 * Trend Runtime Result
 * Explicit output contracts for deterministic trend runtime evaluation.
 * All results represent computed outputs from explicit caller-provided inputs only.
 * No business logic, no interpretation, no scoring.
 */

import type { TrendDirection, TrendStrength } from "../contracts/TrendModelContract.ts";

/**
 * DeltaComputationResult
 * Explicit computation result of delta between previous and current values.
 * Contains absolute delta and optional relative/percentage deltas.
 * Deltas computed only from explicit caller-provided values.
 * No inference, no hidden numerics, no synthesized results when base values are missing.
 */
export interface DeltaComputationResult {
  /** Unique identifier for this delta computation (caller-provided) */
  deltaId: string;

  /** Window identifier for previous measurement point */
  previousWindowId: string;

  /** Window identifier for current measurement point */
  currentWindowId: string;

  /** Absolute delta: numeric difference (currentValue - previousValue) */
  absoluteDelta: number;

  /** Optional relative delta: computed only if previousValue is explicitly non-zero */
  relativeDelta?: number;

  /** Optional percentage delta: computed only if previousValue is explicitly non-zero */
  percentageDelta?: number;

  /** Timestamp when delta was computed (caller-provided, Unix milliseconds) */
  deltaComputedAt: number;

  /** Optional metadata for delta computation context */
  metadata?: Record<string, unknown>;
}

/**
 * DirectionDerivationResult
 * Explicit derivation result of trend direction from delta comparison.
 * Direction derived only from explicit numeric comparison.
 * Reuses TrendDirection type: "increasing" | "decreasing" | "flat" | "mixed" | "undefined"
 * No inference of direction when data insufficient.
 */
export interface DirectionDerivationResult {
  /** Unique identifier for this direction derivation (caller-provided) */
  directionResultId: string;

  /** Associated trend identifier */
  trendId: string;

  /** Derived direction classification (reuses TrendDirection) */
  derivedDirection: TrendDirection;

  /** Source delta computation identifier for traceability */
  sourceDeltaId: string;

  /** Timestamp when direction was derived (caller-provided, Unix milliseconds) */
  directionDerivedAt: number;

  /** Optional metadata for direction derivation context */
  metadata?: Record<string, unknown>;
}

/**
 * StrengthDerivationResult
 * Explicit derivation result of trend strength from magnitude classification.
 * Strength derived only from explicit absolute delta magnitude against caller-provided thresholds.
 * Reuses TrendStrength type: "weak" | "moderate" | "strong" | "extreme" | "undefined"
 * Classification rules:
 * - absoluteDelta < weakThreshold => "weak"
 * - absoluteDelta >= weakThreshold AND < moderateThreshold => "moderate"
 * - absoluteDelta >= moderateThreshold AND < strongThreshold => "strong"
 * - absoluteDelta >= strongThreshold => "extreme"
 * If delta cannot be computed, do not fabricate strength.
 */
export interface StrengthDerivationResult {
  /** Unique identifier for this strength derivation (caller-provided) */
  strengthResultId: string;

  /** Associated trend identifier */
  trendId: string;

  /** Derived strength classification (reuses TrendStrength) */
  derivedStrength: TrendStrength;

  /** Source delta computation identifier for traceability */
  sourceDeltaId: string;

  /** Optional magnitude value used for threshold classification */
  magnitudeValue?: number;

  /** Timestamp when strength was derived (caller-provided, Unix milliseconds) */
  strengthDerivedAt: number;

  /** Optional metadata for strength derivation context */
  metadata?: Record<string, unknown>;
}

/**
 * RelatedTrendRuntimeResult
 * Optional extension for related trend results in multi-window evaluation.
 * Supports evaluation of related trends within same runtime batch.
 * May contain optional result subsets if related evaluation is partial.
 */
export interface RelatedTrendRuntimeResult {
  /** Associated trend identifier */
  trendId: string;

  /** Optional delta computation result for this related trend */
  deltaResult?: DeltaComputationResult;

  /** Optional direction derivation result for this related trend */
  directionResult?: DirectionDerivationResult;

  /** Optional strength derivation result for this related trend */
  strengthResult?: StrengthDerivationResult;

  /** Optional metadata for related result context */
  metadata?: Record<string, unknown>;
}

/**
 * TrendRuntimeResult
 * Complete explicit output of deterministic trend runtime evaluation.
 * Contains computed deltas, derived directions, and derived strengths.
 * All results strictly derived from explicit caller-provided inputs and thresholds.
 * No business logic, no interpretation, no scoring.
 */
export interface TrendRuntimeResult {
  /** Unique identifier for this runtime execution (from context) */
  runtimeId: string;

  /** Associated runtime session identifier (from context) */
  runtimeSessionId: string;

  /** Timestamp when runtime started (from context) */
  runtimeStartedAt: number;

  /** Timestamp when runtime completed (caller-provided, from context) */
  runtimeCompletedAt: number;

  /** Source trend identifier being evaluated */
  sourceTrendId: string;

  /** Computed delta result from previous and current values */
  deltaResult: DeltaComputationResult;

  /** Derived direction result from delta comparison */
  directionResult: DirectionDerivationResult;

  /** Derived strength result from magnitude classification */
  strengthResult: StrengthDerivationResult;

  /** Optional array of related trend results for multi-window extension */
  relatedResults?: RelatedTrendRuntimeResult[];

  /** Overall readiness indicator: true if all required results computed successfully */
  isReady: boolean;

  /** Array of readiness errors if isReady is false (absent if isReady is true) */
  readinessErrors: string[];

  /** Optional metadata for result context */
  metadata?: Record<string, unknown>;
}

/**
 * TrendRuntimeResultBuilder
 * Deterministic construction of runtime results.
 * Assembles explicit computation outputs without interpretation.
 */
export class TrendRuntimeResultBuilder {
  /**
   * build
   * Construct a complete runtime result from explicit computational components.
   *
   * @param runtimeId - Unique runtime execution identifier
   * @param runtimeSessionId - Associated runtime session identifier
   * @param runtimeStartedAt - Timestamp when runtime started
   * @param runtimeCompletedAt - Timestamp when runtime completed
   * @param sourceTrendId - Trend identifier being evaluated
   * @param deltaResult - Computed delta result
   * @param directionResult - Derived direction result
   * @param strengthResult - Derived strength result
   * @param relatedResults - Optional related trend results
   * @param metadata - Optional context metadata
   * @returns Complete runtime result
   */
  static build(
    runtimeId: string,
    runtimeSessionId: string,
    runtimeStartedAt: number,
    runtimeCompletedAt: number,
    sourceTrendId: string,
    deltaResult: DeltaComputationResult,
    directionResult: DirectionDerivationResult,
    strengthResult: StrengthDerivationResult,
    relatedResults?: RelatedTrendRuntimeResult[],
    metadata?: Record<string, unknown>
  ): TrendRuntimeResult {
    // Validate required fields
    if (!runtimeId || typeof runtimeId !== "string") {
      throw new Error("TrendRuntimeResultBuilder.build: runtimeId must be a non-empty string");
    }
    if (!runtimeSessionId || typeof runtimeSessionId !== "string") {
      throw new Error("TrendRuntimeResultBuilder.build: runtimeSessionId must be a non-empty string");
    }
    if (typeof runtimeStartedAt !== "number" || runtimeStartedAt < 0) {
      throw new Error("TrendRuntimeResultBuilder.build: runtimeStartedAt must be a non-negative number");
    }
    if (typeof runtimeCompletedAt !== "number" || runtimeCompletedAt < 0) {
      throw new Error("TrendRuntimeResultBuilder.build: runtimeCompletedAt must be a non-negative number");
    }
    if (!sourceTrendId || typeof sourceTrendId !== "string") {
      throw new Error("TrendRuntimeResultBuilder.build: sourceTrendId must be a non-empty string");
    }
    if (!deltaResult || typeof deltaResult !== "object") {
      throw new Error("TrendRuntimeResultBuilder.build: deltaResult must be an object");
    }
    if (!directionResult || typeof directionResult !== "object") {
      throw new Error("TrendRuntimeResultBuilder.build: directionResult must be an object");
    }
    if (!strengthResult || typeof strengthResult !== "object") {
      throw new Error("TrendRuntimeResultBuilder.build: strengthResult must be an object");
    }

    // Validate result objects
    const readinessErrors: string[] = [];

    // Validate deltaResult
    if (!deltaResult.deltaId) {
      readinessErrors.push("deltaResult.deltaId is missing");
    }
    if (!deltaResult.previousWindowId) {
      readinessErrors.push("deltaResult.previousWindowId is missing");
    }
    if (!deltaResult.currentWindowId) {
      readinessErrors.push("deltaResult.currentWindowId is missing");
    }
    if (typeof deltaResult.absoluteDelta !== "number") {
      readinessErrors.push("deltaResult.absoluteDelta must be a number");
    }
    if (typeof deltaResult.deltaComputedAt !== "number") {
      readinessErrors.push("deltaResult.deltaComputedAt must be a number");
    }

    // Validate directionResult
    if (!directionResult.directionResultId) {
      readinessErrors.push("directionResult.directionResultId is missing");
    }
    if (!directionResult.trendId) {
      readinessErrors.push("directionResult.trendId is missing");
    }
    if (!directionResult.derivedDirection) {
      readinessErrors.push("directionResult.derivedDirection is missing");
    }
    if (!directionResult.sourceDeltaId) {
      readinessErrors.push("directionResult.sourceDeltaId is missing");
    }

    // Validate strengthResult
    if (!strengthResult.strengthResultId) {
      readinessErrors.push("strengthResult.strengthResultId is missing");
    }
    if (!strengthResult.trendId) {
      readinessErrors.push("strengthResult.trendId is missing");
    }
    if (!strengthResult.derivedStrength) {
      readinessErrors.push("strengthResult.derivedStrength is missing");
    }
    if (!strengthResult.sourceDeltaId) {
      readinessErrors.push("strengthResult.sourceDeltaId is missing");
    }

    // Validate relatedResults if present
    if (relatedResults) {
      if (!Array.isArray(relatedResults)) {
        readinessErrors.push("relatedResults must be an array if present");
      }
    }

    const isReady = readinessErrors.length === 0;

    return {
      runtimeId,
      runtimeSessionId,
      runtimeStartedAt,
      runtimeCompletedAt,
      sourceTrendId,
      deltaResult,
      directionResult,
      strengthResult,
      relatedResults: relatedResults && relatedResults.length > 0 ? relatedResults : undefined,
      isReady,
      readinessErrors,
      metadata: metadata ? { ...metadata } : undefined,
    };
  }
}
