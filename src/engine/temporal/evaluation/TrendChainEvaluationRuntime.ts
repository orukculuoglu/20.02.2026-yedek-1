/**
 * Trend Chain Evaluation Runtime
 * Deterministic orchestration of trend chain evaluation.
 * Analyzes chain structure, detects markers, and assembles evaluation surface.
 * All computation synchronous and deterministic from explicit caller-provided inputs only.
 * No ID generation, no business logic, no interpretation.
 */

import {
  TrendChainEvaluationContext,
  TrendChainEvaluationContextValidator,
  TrendChainEvaluationMarker,
} from "./TrendChainEvaluationContext.ts";
import { TrendChainEvaluationSurface, TrendChainEvaluationResult, TrendChainEvaluationResultBuilder } from "./TrendChainEvaluationResult.ts";
import type { TrendChainResult } from "../analytics/TrendChainResult.ts";

/**
 * TrendChainEvaluationRuntime
 * Deterministic evaluation of trend chains into evaluation surfaces with structural markers.
 * Synchronous, no async operations, no random, no Date.now().
 */
export class TrendChainEvaluationRuntime {
  /**
   * Map marker type to fixed label
   * Ensures consistency between markerType and markerLabel.
   */
  private static readonly MARKER_LABELS: Record<
    TrendChainEvaluationMarker["markerType"],
    TrendChainEvaluationMarker["markerLabel"]
  > = {
    single_member_chain: "Single Member Chain",
    uniform_direction: "Uniform Direction",
    mixed_direction: "Mixed Direction",
    uniform_strength: "Uniform Strength",
    mixed_strength: "Mixed Strength",
    sequential_precedes_links: "Sequential Precedes Links",
    non_sequential_links_present: "Non-Sequential Links Present",
    broken_first_last_alignment: "Broken First/Last Alignment",
    invalid_links_present: "Invalid Links Present",
    undefined_chain_state: "Undefined Chain State",
  };

  /**
   * detectMarkers
   * Analyze trend chain result and detect all applicable structural markers.
   * Returns array of marker types that apply (unassigned IDs).
   * Does not generate IDs; caller must provide markerIds.
   *
   * @param chainResult - Trend chain result to analyze
   * @returns Array of applicable marker types in deterministic order
   */
  static detectMarkers(
    chainResult: TrendChainResult
  ): Array<{
    markerType: TrendChainEvaluationMarker["markerType"];
    sourceMemberIds: string[];
  }> {
    const detectedMarkers: Array<{
      markerType: TrendChainEvaluationMarker["markerType"];
      sourceMemberIds: string[];
    }> = [];

    const surface = chainResult.trendChainSurface;
    const members = surface.members;
    const links = surface.validatedLinks;
    const readinessErrors = chainResult.readinessErrors;
    const isReady = chainResult.isReady;

    // Rule 1: single_member_chain
    if (members.length === 1) {
      detectedMarkers.push({
        markerType: "single_member_chain",
        sourceMemberIds: [members[0].chainMemberId],
      });
    }

    // Rule 2 & 3: Check direction uniformity
    if (members.length > 1) {
      const directions = new Set(members.map((m) => m.direction));
      if (directions.size === 1) {
        detectedMarkers.push({
          markerType: "uniform_direction",
          sourceMemberIds: members.map((m) => m.chainMemberId),
        });
      } else {
        detectedMarkers.push({
          markerType: "mixed_direction",
          sourceMemberIds: members.map((m) => m.chainMemberId),
        });
      }
    }

    // Rule 4 & 5: Check strength uniformity
    if (members.length > 1) {
      const strengths = new Set(members.map((m) => m.strength));
      if (strengths.size === 1) {
        detectedMarkers.push({
          markerType: "uniform_strength",
          sourceMemberIds: members.map((m) => m.chainMemberId),
        });
      } else {
        detectedMarkers.push({
          markerType: "mixed_strength",
          sourceMemberIds: members.map((m) => m.chainMemberId),
        });
      }
    }

    // Rule 6 & 7: Check link types
    if (links.length > 0) {
      const precedesLinks = links.filter((l) => l.linkType === "precedes");
      if (precedesLinks.length === links.length) {
        detectedMarkers.push({
          markerType: "sequential_precedes_links",
          sourceMemberIds: links.flatMap((l) => [l.sourceMemberId, l.targetMemberId]),
        });
      } else {
        detectedMarkers.push({
          markerType: "non_sequential_links_present",
          sourceMemberIds: links.flatMap((l) => [l.sourceMemberId, l.targetMemberId]),
        });
      }
    }

    // Rule 8: broken_first_last_alignment
    const hasFirstLastError = readinessErrors.some((e) => e.includes("firstTrendId") || e.includes("lastTrendId"));
    if (hasFirstLastError) {
      detectedMarkers.push({
        markerType: "broken_first_last_alignment",
        sourceMemberIds: members.map((m) => m.chainMemberId),
      });
    }

    // Rule 9: invalid_links_present
    const hasLinkError = readinessErrors.some((e) => e.includes("links["));
    if (hasLinkError) {
      detectedMarkers.push({
        markerType: "invalid_links_present",
        sourceMemberIds: links.flatMap((l) => [l.sourceMemberId, l.targetMemberId]),
      });
    }

    // Rule 10: undefined_chain_state
    // Produce if memberCount === 0 OR (!isReady && no other marker detected)
    if (members.length === 0 || (!isReady && detectedMarkers.length === 0)) {
      detectedMarkers.push({
        markerType: "undefined_chain_state",
        sourceMemberIds: members.map((m) => m.chainMemberId),
      });
    }

    return detectedMarkers;
  }

  /**
   * assignMarkerIds
   * Assign caller-provided marker IDs to detected markers in order.
   * Validates that markerIds count matches detected marker count.
   * Constructs TrendChainEvaluationMarker objects.
   *
   * @param detectedMarkers - Detected marker types with source members
   * @param markerIds - Caller-provided marker IDs (must match count)
   * @param sourceTrendChainId - Source trend chain identifier
   * @param evaluatedAt - Evaluation timestamp
   * @param readinessErrors - Errors array to collect validation errors
   * @returns Assigned markers with IDs
   */
  static assignMarkerIds(
    detectedMarkers: Array<{
      markerType: TrendChainEvaluationMarker["markerType"];
      sourceMemberIds: string[];
    }>,
    markerIds: string[],
    sourceTrendChainId: string,
    evaluatedAt: number,
    readinessErrors: string[]
  ): TrendChainEvaluationMarker[] {
    // Validate markerIds count matches detected markers
    if (markerIds.length !== detectedMarkers.length) {
      readinessErrors.push(
        `markerIds count (${markerIds.length}) does not match detected markers count (${detectedMarkers.length})`
      );
      // Return empty array to allow evaluation to continue with error
      return [];
    }

    // Construct markers by assigning IDs in order
    const markers: TrendChainEvaluationMarker[] = [];
    for (let i = 0; i < detectedMarkers.length; i++) {
      const detected = detectedMarkers[i];
      const markerId = markerIds[i];
      const markerType = detected.markerType;
      const markerLabel = this.MARKER_LABELS[markerType];

      markers.push({
        markerId,
        sourceTrendChainId,
        markerType,
        markerLabel,
        sourceMemberIds: detected.sourceMemberIds,
        detectedAt: evaluatedAt,
      });
    }

    return markers;
  }

  /**
   * evaluate
   * Complete deterministic trend chain evaluation.
   * Detects markers, assigns IDs, assembles evaluation surface.
   *
   * @param context - Explicit evaluation context with caller-provided inputs
   * @returns Complete trend chain evaluation result
   */
  static evaluate(context: TrendChainEvaluationContext): TrendChainEvaluationResult {
    // Validate context using strict validator
    TrendChainEvaluationContextValidator.validateStrict(context);

    const chainResult = context.sourceTrendChainResult;

    // Preserve all source trend chain readiness errors
    // Then append evaluation-local errors (such as marker ID count mismatch)
    const readinessErrors = [...chainResult.readinessErrors];

    // Step 1: Detect applicable markers
    const detectedMarkers = this.detectMarkers(chainResult);

    // Step 2: Assign caller-provided marker IDs
    const markers = this.assignMarkerIds(
      detectedMarkers,
      context.markerIds,
      chainResult.trendChainSurface.trendChainId,
      context.evaluationCompletedAt,
      readinessErrors
    );

    // Step 3: Assemble evaluation surface
    const evaluationSurface: TrendChainEvaluationSurface = {
      evaluationSurfaceId: context.evaluationSurfaceId,
      sourceTrendChainId: chainResult.trendChainSurface.trendChainId,
      sourceRuntimeId: chainResult.chainRuntimeId,
      chainType: chainResult.trendChainSurface.chainType,
      memberCount: chainResult.trendChainSurface.members.length,
      validatedLinkCount: chainResult.trendChainSurface.validatedLinks.length,
      markers,
      evaluatedAt: context.evaluationCompletedAt,
      metadata: context.metadata,
    };

    // Step 4: Build and return result with preserved runtime-collected errors
    return TrendChainEvaluationResultBuilder.build(
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
