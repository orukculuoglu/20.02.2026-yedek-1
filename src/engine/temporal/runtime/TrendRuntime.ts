/**
 * Trend Runtime
 * Deterministic structural orchestration of trend evaluation.
 * Computes delta, derives direction, derives strength from explicit inputs only.
 * 
 * Responsibility:
 * - Accept explicit runtime context with all caller-provided inputs
 * - Validate context strictness
 * - Compute absolute delta from previousValue and currentValue
 * - Compute relativeDelta only if previousValue is non-zero
 * - Compute percentageDelta only if previousValue is non-zero
 * - Derive direction only from explicit numeric comparison
 * - Derive strength only from explicit magnitude classification
 * - Return deterministic results
 * 
 * NOT RESPONSIBLE FOR:
 * - Business logic, interpretation, semantic meaning
 * - Pressure evolution, operational semantics
 * - Storage, persistence, audit logging
 * - Action determination, policy application
 * - Optimization, performance heuristics
 * - Hidden defaults, synthesized values
 */

import type {
  TrendRuntimeContext,
  DeltaValueSurface,
  RelatedTrendRuntimeInput,
} from "./TrendRuntimeContext.ts";
import { TrendRuntimeContextValidator } from "./TrendRuntimeContext.ts";
import type {
  DeltaComputationResult,
  DirectionDerivationResult,
  StrengthDerivationResult,
  TrendRuntimeResult,
  RelatedTrendRuntimeResult,
} from "./TrendRuntimeResult.ts";
import { TrendRuntimeResultBuilder } from "./TrendRuntimeResult.ts";
import type { TrendDirection, TrendStrength } from "../contracts/TrendModelContract.ts";

/**
 * TrendRuntime
 * Deterministic evaluation of trends from delta, direction, and strength perspectives.
 * All methods synchronous, all outputs deterministic, no inference or defaults.
 */
export class TrendRuntime {
  /**
   * evaluate
   * Main entry point: orchestrate complete deterministic trend evaluation.
   *
   * @param context - Explicit runtime context with all caller-provided inputs
   * @returns Complete runtime result with computed and derived values
   * @throws Error if context validation fails or required inputs missing
   */
  static evaluate(context: TrendRuntimeContext): TrendRuntimeResult {
    // Validate context structure strictly
    TrendRuntimeContextValidator.validateStrict(context);

    // Compute delta from explicit values
    const deltaResult = this.computeDelta(
      context.deltaValueSurface,
      context.deltaId,
      context.runtimeStartedAt
    );

    // Derive direction from delta
    const directionResult = this.deriveDirection(
      deltaResult,
      context.trendStructure.trendId,
      context.directionResultId,
      context.runtimeCompletedAt
    );

    // Derive strength from absolute delta magnitude using explicit thresholds
    const strengthResult = this.deriveStrength(
      deltaResult,
      context.trendStructure.trendId,
      context.strengthResultId,
      context.weakThreshold,
      context.moderateThreshold,
      context.strongThreshold,
      context.runtimeCompletedAt
    );

    // Optional: Process related trends if provided
    let relatedResults: RelatedTrendRuntimeResult[] | undefined;
    if (
      context.relatedTrendRuntimeInputs &&
      context.relatedTrendRuntimeInputs.length > 0
    ) {
      relatedResults = this.evaluateRelatedTrends(
        context.relatedTrendRuntimeInputs,
        context.weakThreshold,
        context.moderateThreshold,
        context.strongThreshold,
        context.runtimeStartedAt,
        context.runtimeCompletedAt
      );
    }

    // Build final result
    const result = TrendRuntimeResultBuilder.build(
      context.runtimeId,
      context.runtimeSessionId,
      context.runtimeStartedAt,
      context.runtimeCompletedAt,
      context.trendStructure.trendId,
      deltaResult,
      directionResult,
      strengthResult,
      relatedResults,
      context.metadata
    );

    return result;
  }

  /**
   * computeDelta
   * Compute absolute, relative, and percentage deltas from explicit values.
   * Relative and percentage deltas computed only if previousValue is non-zero.
   * No inference, no hidden computations.
   * ALL IDS CALLER-PROVIDED. NO GENERATED IDS.
   *
   * @param surface - Delta value surface with explicit numeric inputs
   * @param deltaId - Delta result identifier (caller-provided, not generated)
   * @param computedAt - Timestamp of computation
   * @returns Delta computation result
   * @throws Error if required surface fields missing
   */
  private static computeDelta(
    surface: DeltaValueSurface,
    deltaId: string,
    computedAt: number
  ): DeltaComputationResult {
    // Validate required surface fields
    if (!surface.previousWindowId) {
      throw new Error("DeltaValueSurface.previousWindowId is required");
    }
    if (!surface.currentWindowId) {
      throw new Error("DeltaValueSurface.currentWindowId is required");
    }
    if (typeof surface.previousValue !== "number") {
      throw new Error("DeltaValueSurface.previousValue must be a number");
    }
    if (typeof surface.currentValue !== "number") {
      throw new Error("DeltaValueSurface.currentValue must be a number");
    }

    // Always compute absolute delta
    const absoluteDelta = surface.currentValue - surface.previousValue;

    // Compute relative delta only if previousValue is non-zero
    let relativeDelta: number | undefined;
    let percentageDelta: number | undefined;

    if (surface.previousValue !== 0) {
      // Can safely compute: denominator is non-zero
      relativeDelta = absoluteDelta / surface.previousValue;
      percentageDelta = relativeDelta * 100;
    }
    // If previousValue is exactly zero, relative/percentage remain undefined

    // Use caller-provided deltaId - do not generate
    return {
      deltaId,
      previousWindowId: surface.previousWindowId,
      currentWindowId: surface.currentWindowId,
      absoluteDelta,
      relativeDelta,
      percentageDelta,
      deltaComputedAt: computedAt,
      metadata: surface.metadata ? { ...surface.metadata } : undefined,
    };
  }

  /**
   * deriveDirection
   * Derive trend direction from delta numeric comparison.
   * Direction rules (all explicit):
   * - absoluteDelta > 0 => "increasing"
   * - absoluteDelta < 0 => "decreasing"
   * - absoluteDelta === 0 => "flat"
   * No fabrication, no mixed inference for primary trend.
   * ALL IDS CALLER-PROVIDED. NO GENERATED IDS.
   *
   * @param deltaResult - Computed delta with abs/rel/percentage values
   * @param trendId - Associated trend identifier
   * @param directionResultId - Direction result identifier (caller-provided, not generated)
   * @param derivedAt - Timestamp of derivation
   * @returns Direction derivation result
   */
  private static deriveDirection(
    deltaResult: DeltaComputationResult,
    trendId: string,
    directionResultId: string,
    derivedAt: number
  ): DirectionDerivationResult {
    let derivedDirection: TrendDirection;

    // Explicit numeric comparison only
    if (deltaResult.absoluteDelta > 0) {
      derivedDirection = "increasing";
    } else if (deltaResult.absoluteDelta < 0) {
      derivedDirection = "decreasing";
    } else {
      // absoluteDelta === 0 exactly
      derivedDirection = "flat";
    }

    // Use caller-provided directionResultId - do not generate
    return {
      directionResultId,
      trendId,
      derivedDirection,
      sourceDeltaId: deltaResult.deltaId,
      directionDerivedAt: derivedAt,
      metadata: deltaResult.metadata ? { ...deltaResult.metadata } : undefined,
    };
  }

  /**
   * deriveStrength
   * Derive strength from absolute delta magnitude classification.
   * Uses explicit caller-provided thresholds:
   * - absoluteDelta < weakThreshold => "weak"
   * - absoluteDelta >= weakThreshold AND < moderateThreshold => "moderate"
   * - absoluteDelta >= moderateThreshold AND < strongThreshold => "strong"
   * - absoluteDelta >= strongThreshold => "extreme"
   * ALL IDS CALLER-PROVIDED. NO GENERATED IDS.
   *
   * @param deltaResult - Computed delta result
   * @param trendId - Associated trend identifier
   * @param strengthResultId - Strength result identifier (caller-provided, not generated)
   * @param weakThreshold - Explicit weak threshold
   * @param moderateThreshold - Explicit moderate threshold
   * @param strongThreshold - Explicit strong threshold
   * @param derivedAt - Timestamp of derivation
   * @returns Strength derivation result
   */
  private static deriveStrength(
    deltaResult: DeltaComputationResult,
    trendId: string,
    strengthResultId: string,
    weakThreshold: number,
    moderateThreshold: number,
    strongThreshold: number,
    derivedAt: number
  ): StrengthDerivationResult {
    // Use absolute magnitude only
    const magnitude = Math.abs(deltaResult.absoluteDelta);

    let derivedStrength: TrendStrength;

    // Explicit threshold classification using caller-provided thresholds
    if (magnitude < weakThreshold) {
      derivedStrength = "weak";
    } else if (magnitude < moderateThreshold) {
      derivedStrength = "moderate";
    } else if (magnitude < strongThreshold) {
      derivedStrength = "strong";
    } else {
      // magnitude >= strongThreshold
      derivedStrength = "extreme";
    }

    // Use caller-provided strengthResultId - do not generate
    return {
      strengthResultId,
      trendId,
      derivedStrength,
      sourceDeltaId: deltaResult.deltaId,
      magnitudeValue: magnitude,
      strengthDerivedAt: derivedAt,
      metadata: deltaResult.metadata ? { ...deltaResult.metadata } : undefined,
    };
  }

  /**
   * evaluateRelatedTrends
   * Optional evaluation of related trends within same runtime batch.
   * Extends multi-window evaluation without branching core logic.
   * ALL IDS CALLER-PROVIDED. NO GENERATED IDS.
   *
   * @param relatedInputs - Array of related trend runtime inputs with all caller-provided IDs
   * @param weakThreshold - Explicit weak threshold
   * @param moderateThreshold - Explicit moderate threshold
   * @param strongThreshold - Explicit strong threshold
   * @param runtimeStartedAt - Runtime start timestamp
   * @param runtimeCompletedAt - Runtime completion timestamp
   * @returns Array of related trend results
   */
  private static evaluateRelatedTrends(
    relatedInputs: RelatedTrendRuntimeInput[],
    weakThreshold: number,
    moderateThreshold: number,
    strongThreshold: number,
    runtimeStartedAt: number,
    runtimeCompletedAt: number
  ): RelatedTrendRuntimeResult[] {
    const results: RelatedTrendRuntimeResult[] = [];

    // Process each related runtime input
    for (let i = 0; i < relatedInputs.length; i++) {
      const relatedInput = relatedInputs[i];

      // Compute delta for this related trend
      const deltaResult = this.computeDelta(
        relatedInput.deltaValueSurface,
        relatedInput.deltaId,
        runtimeStartedAt
      );

      // Derive direction
      const directionResult = this.deriveDirection(
        deltaResult,
        relatedInput.trendId,
        relatedInput.directionResultId,
        runtimeCompletedAt
      );

      // Derive strength
      const strengthResult = this.deriveStrength(
        deltaResult,
        relatedInput.trendId,
        relatedInput.strengthResultId,
        weakThreshold,
        moderateThreshold,
        strongThreshold,
        runtimeCompletedAt
      );

      results.push({
        trendId: relatedInput.trendId,
        deltaResult,
        directionResult,
        strengthResult,
        metadata: relatedInput.metadata ? { ...relatedInput.metadata } : undefined,
      });
    }

    return results;
  }
}
