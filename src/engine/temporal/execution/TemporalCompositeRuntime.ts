/**
 * Temporal Composite Runtime
 * Deterministic orchestration of temporal composite surface binding.
 * Binds multiple temporal result references into single composite surface.
 * All computation synchronous and deterministic from explicit caller-provided inputs only.
 * No ID generation, no business logic, no interpretation.
 */

import {
  TemporalCompositeContext,
  TemporalCompositeContextValidator,
  TemporalCompositeMemberRef,
  TrendRuntimeResultRef,
  PressureEvolutionResultRef,
  TrendChainResultRef,
  TrendChainEvaluationResultRef,
} from "./TemporalCompositeContext.ts";
import { TemporalCompositeSurface, TemporalCompositeResult, TemporalCompositeResultBuilder } from "./TemporalCompositeResult.ts";

/**
 * TemporalCompositeRuntime
 * Deterministic binding of multiple temporal surfaces into composite.
 * Synchronous, no async operations, no random, no Date.now().
 */
export class TemporalCompositeRuntime {
  /**
   * MemberType ↔ SourceLayer mapping validation
   */
  private static readonly VALID_LAYER_FOR_TYPE: Record<
    TemporalCompositeMemberRef["memberType"],
    TemporalCompositeMemberRef["sourceLayer"]
  > = {
    trend_runtime: "runtime",
    pressure_evolution: "patterns",
    trend_chain: "analytics",
    trend_chain_evaluation: "evaluation",
  };

  /**
   * validateResultRefs
   * Validate that all provided result references have correct structure.
   * Collects validation errors without throwing.
   *
   * @param context - Composite context with optional result refs
   * @param readinessErrors - Errors array to collect validation errors
   * @returns Array of included refs in fixed order: trend_runtime, pressure_evolution, trend_chain, trend_chain_evaluation
   */
  static validateResultRefs(
    context: TemporalCompositeContext,
    readinessErrors: string[]
  ): Array<{
    ref: TrendRuntimeResultRef | PressureEvolutionResultRef | TrendChainResultRef | TrendChainEvaluationResultRef;
    memberType: TemporalCompositeMemberRef["memberType"];
  }> {
    const includedRefs: Array<{
      ref: TrendRuntimeResultRef | PressureEvolutionResultRef | TrendChainResultRef | TrendChainEvaluationResultRef;
      memberType: TemporalCompositeMemberRef["memberType"];
    }> = [];

    // Fixed inclusion order: trend_runtime → pressure_evolution → trend_chain → trend_chain_evaluation

    // Check trend_runtime ref
    if (context.trendRuntimeResultRef) {
      const ref = context.trendRuntimeResultRef;
      if (!ref.sourceId || !ref.sourceRuntimeId || !ref.trendId) {
        readinessErrors.push("trendRuntimeResultRef: missing required fields (sourceId, sourceRuntimeId, trendId)");
      } else if (ref.sourceLayer !== "runtime") {
        readinessErrors.push(`trendRuntimeResultRef: sourceLayer must be "runtime", got "${ref.sourceLayer}"`);
      } else {
        includedRefs.push({ ref, memberType: "trend_runtime" });
      }
    }

    // Check pressure_evolution ref
    if (context.pressureEvolutionResultRef) {
      const ref = context.pressureEvolutionResultRef;
      if (!ref.sourceId || !ref.sourceRuntimeId || !ref.sourceTrendId) {
        readinessErrors.push(
          "pressureEvolutionResultRef: missing required fields (sourceId, sourceRuntimeId, sourceTrendId)"
        );
      } else if (ref.sourceLayer !== "patterns") {
        readinessErrors.push(`pressureEvolutionResultRef: sourceLayer must be "patterns", got "${ref.sourceLayer}"`);
      } else {
        includedRefs.push({ ref, memberType: "pressure_evolution" });
      }
    }

    // Check trend_chain ref
    if (context.trendChainResultRef) {
      const ref = context.trendChainResultRef;
      if (!ref.sourceId || !ref.sourceRuntimeId || !ref.trendChainId) {
        readinessErrors.push("trendChainResultRef: missing required fields (sourceId, sourceRuntimeId, trendChainId)");
      } else if (ref.sourceLayer !== "analytics") {
        readinessErrors.push(`trendChainResultRef: sourceLayer must be "analytics", got "${ref.sourceLayer}"`);
      } else {
        includedRefs.push({ ref, memberType: "trend_chain" });
      }
    }

    // Check trend_chain_evaluation ref
    if (context.trendChainEvaluationResultRef) {
      const ref = context.trendChainEvaluationResultRef;
      if (!ref.sourceId || !ref.sourceRuntimeId || !ref.evaluationSurfaceId) {
        readinessErrors.push(
          "trendChainEvaluationResultRef: missing required fields (sourceId, sourceRuntimeId, evaluationSurfaceId)"
        );
      } else if (ref.sourceLayer !== "evaluation") {
        readinessErrors.push(
          `trendChainEvaluationResultRef: sourceLayer must be "evaluation", got "${ref.sourceLayer}"`
        );
      } else {
        includedRefs.push({ ref, memberType: "trend_chain_evaluation" });
      }
    }

    return includedRefs;
  }

  /**
   * assignMemberIds
   * Assign caller-provided member IDs to included refs in order.
   * Validates that memberIds count matches included refs count.
   * Constructs TemporalCompositeMemberRef objects.
   *
   * @param includedRefs - Included result references in fixed order
   * @param memberIds - Caller-provided member IDs (must match count)
   * @param evaluatedAt - Composite evaluation timestamp
   * @param readinessErrors - Errors array to collect validation errors
   * @returns Assigned members with IDs
   */
  static assignMemberIds(
    includedRefs: Array<{
      ref: TrendRuntimeResultRef | PressureEvolutionResultRef | TrendChainResultRef | TrendChainEvaluationResultRef;
      memberType: TemporalCompositeMemberRef["memberType"];
    }>,
    memberIds: string[],
    evaluatedAt: number,
    readinessErrors: string[]
  ): TemporalCompositeMemberRef[] {
    // Validate memberIds count matches included refs
    if (memberIds.length !== includedRefs.length) {
      readinessErrors.push(
        `memberIds count (${memberIds.length}) does not match included refs count (${includedRefs.length})`
      );
      // Return empty array to allow binding to continue with error
      return [];
    }

    // Construct members by assigning IDs in order
    const members: TemporalCompositeMemberRef[] = [];
    for (let i = 0; i < includedRefs.length; i++) {
      const included = includedRefs[i];
      const ref = included.ref;
      const memberId = memberIds[i];
      const memberType = included.memberType;

      members.push({
        compositeMemberId: memberId,
        memberType,
        sourceId: ref.sourceId,
        sourceRuntimeId: ref.sourceRuntimeId,
        sourceLayer: ref.sourceLayer,
        boundAt: evaluatedAt,
      });
    }

    return members;
  }

  /**
   * deriveIncludedLayers
   * Derive the list of included layers from members.
   * Returns unique layers in deterministic order.
   *
   * @param members - Composite members
   * @returns Ordered list of included layers
   */
  static deriveIncludedLayers(
    members: TemporalCompositeMemberRef[]
  ): Array<"runtime" | "patterns" | "analytics" | "evaluation"> {
    const layerOrder: Array<"runtime" | "patterns" | "analytics" | "evaluation"> = [
      "runtime",
      "patterns",
      "analytics",
      "evaluation",
    ];

    const includedSet = new Set(members.map((m) => m.sourceLayer));
    return layerOrder.filter((layer) => includedSet.has(layer));
  }

  /**
   * evaluate
   * Complete deterministic temporal composite surface binding.
   * Validates refs, assigns IDs, assembles composite surface.
   *
   * @param context - Explicit composite context with caller-provided inputs
   * @returns Complete temporal composite result
   */
  static evaluate(context: TemporalCompositeContext): TemporalCompositeResult {
    // Validate context using strict validator
    TemporalCompositeContextValidator.validateStrict(context);

    const readinessErrors: string[] = [];

    // Step 1: Validate and collect included result refs
    const includedRefs = this.validateResultRefs(context, readinessErrors);

    // Check if any refs were provided
    if (includedRefs.length === 0) {
      readinessErrors.push("No temporal result references provided");
    }

    // Step 2: Assign caller-provided member IDs
    const members = this.assignMemberIds(
      includedRefs,
      context.memberIds,
      context.compositeCompletedAt,
      readinessErrors
    );

    // Step 3: Derive included layers from members
    const includedLayers = this.deriveIncludedLayers(members);

    // Step 4: Assemble composite surface
    const temporalCompositeSurface: TemporalCompositeSurface = {
      temporalCompositeId: context.temporalCompositeId,
      compositeType: context.compositeType,
      members,
      memberCount: members.length,
      includedLayers,
      evaluatedAt: context.compositeCompletedAt,
      metadata: context.metadata,
    };

    // Step 5: Build and return result with preserved runtime-collected errors
    return TemporalCompositeResultBuilder.build(
      context.compositeRuntimeId,
      context.compositeSessionId,
      context.compositeStartedAt,
      context.compositeCompletedAt,
      temporalCompositeSurface,
      readinessErrors,
      context.metadata
    );
  }
}
