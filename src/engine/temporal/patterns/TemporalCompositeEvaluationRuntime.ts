/**
 * Temporal Composite Evaluation Runtime
 * Deterministic orchestration of temporal composite evaluation.
 * Analyzes composite structure, detects markers, and assembles evaluation surface.
 * All computation synchronous and deterministic from explicit caller-provided inputs only.
 * No ID generation, no business logic, no interpretation.
 */

import {
  TemporalCompositeEvaluationContext,
  TemporalCompositeEvaluationContextValidator,
  TemporalCompositeEvaluationMarker,
} from "./TemporalCompositeEvaluationContext.ts";
import { TemporalCompositeEvaluationSurface, TemporalCompositeEvaluationResult, TemporalCompositeEvaluationResultBuilder } from "./TemporalCompositeEvaluationResult.ts";
import type { TemporalCompositeResult } from "../execution/TemporalCompositeResult.ts";

/**
 * TemporalCompositeEvaluationRuntime
 * Deterministic evaluation of temporal composites into evaluation surfaces with structural markers.
 * Synchronous, no async operations, no random, no Date.now().
 */
export class TemporalCompositeEvaluationRuntime {
  /**
   * Map marker type to fixed label
   * Ensures consistency between markerType and markerLabel.
   */
  private static readonly MARKER_LABELS: Record<
    TemporalCompositeEvaluationMarker["markerType"],
    TemporalCompositeEvaluationMarker["markerLabel"]
  > = {
    empty_composite: "Empty Composite",
    single_layer_composite: "Single Layer Composite",
    multi_layer_composite: "Multi Layer Composite",
    runtime_present: "Runtime Present",
    patterns_present: "Patterns Present",
    analytics_present: "Analytics Present",
    evaluation_present: "Evaluation Present",
    full_layer_span: "Full Layer Span",
    partial_layer_span: "Partial Layer Span",
    undefined_composite_state: "Undefined Composite State",
  };

  /**
   * detectMarkers
   * Analyze temporal composite result and detect all applicable structural markers.
   * Returns array of marker types that apply (unassigned IDs).
   * Does not generate IDs; caller must provide markerIds.
   *
   * @param compositeResult - Temporal composite result to analyze
   * @returns Array of applicable marker types in deterministic order with source member IDs
   */
  static detectMarkers(
    compositeResult: TemporalCompositeResult
  ): Array<{
    markerType: TemporalCompositeEvaluationMarker["markerType"];
    sourceCompositeMemberIds: string[];
  }> {
    const detectedMarkers: Array<{
      markerType: TemporalCompositeEvaluationMarker["markerType"];
      sourceCompositeMemberIds: string[];
    }> = [];

    const surface = compositeResult.temporalCompositeSurface;
    const members = surface.members;
    const includedLayers = surface.includedLayers;
    const isReady = compositeResult.isReady;
    const memberCount = surface.memberCount;

    // Extract all member IDs for markers that include all members
    const allMemberIds = members.map((m) => m.compositeMemberId);

    // Rule 1: empty_composite
    if (memberCount === 0) {
      detectedMarkers.push({
        markerType: "empty_composite",
        sourceCompositeMemberIds: [],
      });
    }

    // Rule 2: single_layer_composite
    if (includedLayers.length === 1) {
      detectedMarkers.push({
        markerType: "single_layer_composite",
        sourceCompositeMemberIds: allMemberIds,
      });
    }

    // Rule 3: multi_layer_composite
    if (includedLayers.length > 1) {
      detectedMarkers.push({
        markerType: "multi_layer_composite",
        sourceCompositeMemberIds: allMemberIds,
      });
    }

    // Rule 4: runtime_present
    if (includedLayers.includes("runtime")) {
      const runtimeMemberIds = members
        .filter((m) => m.sourceLayer === "runtime")
        .map((m) => m.compositeMemberId);
      detectedMarkers.push({
        markerType: "runtime_present",
        sourceCompositeMemberIds: runtimeMemberIds,
      });
    }

    // Rule 5: patterns_present
    if (includedLayers.includes("patterns")) {
      const patternsMemberIds = members
        .filter((m) => m.sourceLayer === "patterns")
        .map((m) => m.compositeMemberId);
      detectedMarkers.push({
        markerType: "patterns_present",
        sourceCompositeMemberIds: patternsMemberIds,
      });
    }

    // Rule 6: analytics_present
    if (includedLayers.includes("analytics")) {
      const analyticsMemberIds = members
        .filter((m) => m.sourceLayer === "analytics")
        .map((m) => m.compositeMemberId);
      detectedMarkers.push({
        markerType: "analytics_present",
        sourceCompositeMemberIds: analyticsMemberIds,
      });
    }

    // Rule 7: evaluation_present
    if (includedLayers.includes("evaluation")) {
      const evaluationMemberIds = members
        .filter((m) => m.sourceLayer === "evaluation")
        .map((m) => m.compositeMemberId);
      detectedMarkers.push({
        markerType: "evaluation_present",
        sourceCompositeMemberIds: evaluationMemberIds,
      });
    }

    // Rule 8: full_layer_span
    const allLayersPresent =
      includedLayers.includes("runtime") &&
      includedLayers.includes("patterns") &&
      includedLayers.includes("analytics") &&
      includedLayers.includes("evaluation");
    if (allLayersPresent) {
      detectedMarkers.push({
        markerType: "full_layer_span",
        sourceCompositeMemberIds: allMemberIds,
      });
    }

    // Rule 9: partial_layer_span
    if (memberCount > 0 && includedLayers.length >= 1 && includedLayers.length <= 3) {
      detectedMarkers.push({
        markerType: "partial_layer_span",
        sourceCompositeMemberIds: allMemberIds,
      });
    }

    // Rule 10: undefined_composite_state
    // Produce if source not ready and no other marker was emitted
    if (!isReady && detectedMarkers.length === 0) {
      detectedMarkers.push({
        markerType: "undefined_composite_state",
        sourceCompositeMemberIds: allMemberIds,
      });
    }

    return detectedMarkers;
  }

  /**
   * assignMarkerIds
   * Assign caller-provided marker IDs to detected markers in order.
   * Validates that markerIds count matches detected marker count.
   * Constructs TemporalCompositeEvaluationMarker objects.
   *
   * @param detectedMarkers - Detected marker types with source members
   * @param markerIds - Caller-provided marker IDs (must match count)
   * @param sourceTemporalCompositeId - Source temporal composite identifier
   * @param evaluatedAt - Evaluation timestamp
   * @param readinessErrors - Errors array to collect validation errors
   * @returns Assigned markers with IDs
   */
  static assignMarkerIds(
    detectedMarkers: Array<{
      markerType: TemporalCompositeEvaluationMarker["markerType"];
      sourceCompositeMemberIds: string[];
    }>,
    markerIds: string[],
    sourceTemporalCompositeId: string,
    evaluatedAt: number,
    readinessErrors: string[]
  ): TemporalCompositeEvaluationMarker[] {
    // Validate markerIds count matches detected markers
    if (markerIds.length !== detectedMarkers.length) {
      readinessErrors.push(
        `markerIds count (${markerIds.length}) does not match detected markers count (${detectedMarkers.length})`
      );
      // Return empty array to allow evaluation to continue with error
      return [];
    }

    // Construct markers by assigning IDs in order
    const markers: TemporalCompositeEvaluationMarker[] = [];
    for (let i = 0; i < detectedMarkers.length; i++) {
      const detected = detectedMarkers[i];
      const markerId = markerIds[i];
      const markerType = detected.markerType;
      const markerLabel = this.MARKER_LABELS[markerType];

      markers.push({
        markerId,
        sourceTemporalCompositeId,
        markerType,
        markerLabel,
        sourceCompositeMemberIds: detected.sourceCompositeMemberIds,
        detectedAt: evaluatedAt,
      });
    }

    return markers;
  }

  /**
   * evaluate
   * Complete deterministic temporal composite evaluation.
   * Detects markers, assigns IDs, assembles evaluation surface.
   *
   * @param context - Explicit evaluation context with caller-provided inputs
   * @returns Complete temporal composite evaluation result
   */
  static evaluate(context: TemporalCompositeEvaluationContext): TemporalCompositeEvaluationResult {
    // Validate context using strict validator
    TemporalCompositeEvaluationContextValidator.validateStrict(context);

    const compositeResult = context.sourceTemporalCompositeResult;

    // Preserve all source composite readiness errors
    // Then append evaluation-local errors (such as marker ID count mismatch)
    const readinessErrors = [...compositeResult.readinessErrors];

    // Step 1: Detect applicable markers
    const detectedMarkers = this.detectMarkers(compositeResult);

    // Step 2: Assign caller-provided marker IDs
    const markers = this.assignMarkerIds(
      detectedMarkers,
      context.markerIds,
      compositeResult.temporalCompositeSurface.temporalCompositeId,
      context.evaluationCompletedAt,
      readinessErrors
    );

    // Step 3: Assemble evaluation surface
    const evaluationSurface: TemporalCompositeEvaluationSurface = {
      evaluationSurfaceId: context.evaluationSurfaceId,
      sourceTemporalCompositeId: compositeResult.temporalCompositeSurface.temporalCompositeId,
      sourceRuntimeId: compositeResult.compositeRuntimeId,
      compositeType: compositeResult.temporalCompositeSurface.compositeType,
      memberCount: compositeResult.temporalCompositeSurface.memberCount,
      includedLayers: compositeResult.temporalCompositeSurface.includedLayers,
      markers,
      evaluatedAt: context.evaluationCompletedAt,
      metadata: context.metadata,
    };

    // Step 4: Build and return result with preserved runtime-collected errors
    return TemporalCompositeEvaluationResultBuilder.build(
      context.evaluationRuntimeId,
      context.evaluationSessionId,
      context.evaluationStartedAt,
      context.evaluationCompletedAt,
      evaluationSurface,
      readinessErrors,
      context.metadata
    );
  }
}
