/**
 * Temporal Evaluation Runtime
 * Orchestrates comparison and interpretation of analytics-ready temporal inputs.
 * Pure structural evaluation only, no business logic, no hidden defaults.
 * All inputs explicit from caller, all computations only with source data.
 */

import type { TemporalComparisonContext, ComparisonEvaluationOptions } from "./TemporalComparisonContext.ts";
import { TemporalComparisonContextValidator } from "./TemporalComparisonContext.ts";
import type {
  ComparisonDelta,
  ThresholdMarker,
  StageComparisonResult,
  ComparisonResult,
} from "./TemporalComparisonResult.ts";
import type {
  InterpretationMarker,
  ComparisonInterpretation,
  TemporalEvaluationOutput,
} from "./TemporalInterpretationResult.ts";
import type {
  ComparisonAnalyticsPayload,
  StageAnalyticsPayload,
  AnalyticsReadyInput,
} from "../analytics/index.ts";

/**
 * TemporalEvaluationRuntime
 * Evaluates analytics-ready temporal inputs into comparison and interpretation results.
 * Pure structural evaluation, no business semantics.
 * Only creates fields for which source data explicitly exists.
 */
export class TemporalEvaluationRuntime {
  /**
   * evaluate
   * Main entry point: convert analytics-ready input into evaluation output.
   *
   * @param context - Explicit comparison context with all inputs
   * @returns Evaluation output with comparison and interpretation results
   */
  static evaluate(context: TemporalComparisonContext): TemporalEvaluationOutput {
    // Validate context structure
    const contextValidation = TemporalComparisonContextValidator.validate(context);
    if (!contextValidation.isValid) {
      throw new Error(
        `TemporalEvaluationRuntime.evaluate: Invalid context\n${contextValidation.errors.join(
          "\n"
        )}`
      );
    }

    const analytics = context.analyticsReadyInput;
    const options = context.evaluationOptions;

    // Build comparison result from analytics input
    const comparisonResult = this.buildComparisonResult(context, analytics, options);

    // Build interpretations from comparison result
    const comparisons = this.interpretComparisons(comparisonResult);
    const stageInterpretations = this.interpretStages(comparisonResult);

    // Calculate summary statistics
    const evaluationSummary = {
      totalComparisonsEvaluated: comparisonResult.totalComparisons,
      totalMarkersGenerated: comparisonResult.thresholdMarkers.length,
      totalBreaches: comparisonResult.totalBreaches,
      normalCount: comparisons.filter(c => c.status === "normal").length,
      markedCount: comparisons.filter(c => c.status === "marked").length,
      multiBreachCount: comparisons.filter(c => c.status === "multi_breach").length,
    };

    const evaluationOutput: TemporalEvaluationOutput = {
      evaluationId: context.evaluationId,
      evaluationSessionId: context.evaluationSessionId,
      evaluationStartedAt: context.evaluationStartedAt,
      evaluationCompletedAt: context.evaluationStartedAt, // Synchronous completion
      sourceComparisonResult: comparisonResult,
      comparisons,
      stageInterpretations,
      evaluationSummary,
      isReady: true,
      readinessErrors: [],
      metadata: context.metadata,
    };

    return evaluationOutput;
  }

  /**
   * buildComparisonResult
   * Create comparison result from analytics input.
   * Only evaluates where explicit source data exists.
   *
   * @param context - Full evaluation context
   * @param analytics - Analytics-ready input
   * @param options - Evaluation options
   * @returns Complete comparison result
   */
  private static buildComparisonResult(
    context: TemporalComparisonContext,
    analytics: AnalyticsReadyInput,
    options: ComparisonEvaluationOptions
  ): ComparisonResult {
    const comparisons = analytics.comparisons;
    const deltas: ComparisonDelta[] = [];
    const thresholdMarkers: ThresholdMarker[] = [];
    const stageResults: StageComparisonResult[] = [];

    // Process each comparison - only create structures when source data exists
    for (const comp of comparisons) {
      // Create delta ONLY if we have explicit comparison intent or window data
      if (comp.comparisonIntent || comp.leftWindowId || comp.rightWindowId) {
        const delta: ComparisonDelta = {
          comparisonId: comp.comparisonId,
          // Do NOT populate fields without source data
          // direction, absoluteDelta, percentChange, volatility only if calculable
        };
        deltas.push(delta);
      }

      // Create threshold marker ONLY if overlap is explicitly known and evalOverlapSignificance is true
      if (options.evalOverlapSignificance && comp.overlapDays !== null && comp.overlapDays !== undefined) {
        const thresholdMarker: ThresholdMarker = {
          comparisonId: comp.comparisonId,
          thresholdType: "overlap",
          // breached only set if there was an actual comparison to measure against
          breached: comp.overlapDays > 0,
          thresholdValue: options.significantDeltaThreshold,
          measuredValue: comp.overlapDays,
        };
        thresholdMarkers.push(thresholdMarker);
      }
    }

    // Aggregate results per stage
    const stages = analytics.stages;
    for (const stage of stages) {
      const stageCompDeltas = deltas.filter(d =>
        stage.comparisonIdsInScope?.includes(d.comparisonId)
      );
      const stageMarkers = thresholdMarkers.filter(m =>
        stage.comparisonIdsInScope?.includes(m.comparisonId)
      );

      const stageResult: StageComparisonResult = {
        stageId: stage.stageId,
        deltas: stageCompDeltas,
        thresholdMarkers: stageMarkers,
        comparisonCount: stageCompDeltas.length,
        breachCount: stageMarkers.filter(m => m.breached).length,
        metadata: stage.metadata,
      };

      stageResults.push(stageResult);
    }

    const result: ComparisonResult = {
      evaluationId: context.evaluationId,
      evaluationSessionId: context.evaluationSessionId,
      evaluationStartedAt: context.evaluationStartedAt,
      analyticsInputId: analytics.analyticsInputId,
      executionPlanId: analytics.executionPlanId,
      deltas,
      thresholdMarkers,
      stageResults,
      totalComparisons: comparisons.length,
      totalDeltas: deltas.length,
      totalBreaches: thresholdMarkers.filter(m => m.breached).length,
      metadata: context.metadata,
    };

    return result;
  }

  /**
   * interpretComparisons
   * Create interpretation summaries for each comparison.
   * Based purely on what was actually computed.
   *
   * @param comparisonResult - Comparison result
   * @returns Array of comparison interpretations
   */
  private static interpretComparisons(
    comparisonResult: ComparisonResult
  ): ComparisonInterpretation[] {
    const interpretations: ComparisonInterpretation[] = [];

    // Create interpretation for each comparison
    const comparisonIds = new Set(comparisonResult.deltas.map(d => d.comparisonId));

    for (const compId of comparisonIds) {
      const relatedMarkers = comparisonResult.thresholdMarkers.filter(m => m.comparisonId === compId);
      const breachCount = relatedMarkers.filter(m => m.breached).length;

      // Determine status based on actual marker count
      let status: "normal" | "marked" | "multi_breach" = "normal";
      if (relatedMarkers.length > 0 && breachCount === 0) {
        status = "marked";
      } else if (breachCount > 1) {
        status = "multi_breach";
      } else if (breachCount === 1) {
        status = "marked";
      }

      // Create interpretation markers from actual markers
      const interpretationMarkers: InterpretationMarker[] = relatedMarkers.map(m => ({
        markerId: `${m.comparisonId}_${m.thresholdType}`,
        markerType: m.breached ? ("threshold_breach" as const) : ("overlap_found" as const),
        comparisonId: m.comparisonId,
        message: `${m.thresholdType} evaluation: measured ${m.measuredValue ?? "N/A"} vs threshold ${m.thresholdValue}`,
        severity: m.breached ? "important" : "informational",
        supportingData: m.measuredValue !== undefined ? { threshold: m.thresholdValue, measured: m.measuredValue } : undefined,
        metadata: m.metadata,
      }));

      const interpretation: ComparisonInterpretation = {
        comparisonId: compId,
        status,
        markers: interpretationMarkers,
        summary: `Comparison ${compId}: ${status}`,
        markerCount: interpretationMarkers.length,
      };

      interpretations.push(interpretation);
    }

    return interpretations;
  }

  /**
   * interpretStages
   * Create interpretation summaries for each stage.
   * Aggregate stage-level markers from actual evaluations.
   *
   * @param comparisonResult - Comparison result
   * @returns Array of stage interpretations
   */
  private static interpretStages(
    comparisonResult: ComparisonResult
  ): Array<{
    stageId: string;
    stageMarkerCount: number;
    breachCount: number;
    markers: InterpretationMarker[];
  }> {
    return comparisonResult.stageResults.map(stage => ({
      stageId: stage.stageId,
      stageMarkerCount: stage.thresholdMarkers.length,
      breachCount: stage.breachCount,
      markers: stage.thresholdMarkers.map(m => ({
        markerId: `${stage.stageId}_${m.comparisonId}`,
        markerType: m.breached ? ("threshold_breach" as const) : ("overlap_found" as const),
        comparisonId: m.comparisonId,
        message: `Stage ${stage.stageId}: ${m.thresholdType} evaluation`,
        severity: m.breached ? "important" : "informational",
        supportingData: m.measuredValue !== undefined ? { stageId: stage.stageId, measured: m.measuredValue } : undefined,
        metadata: m.metadata,
      })),
    }));
  }
}
