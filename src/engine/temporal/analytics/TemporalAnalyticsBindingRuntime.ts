/**
 * Temporal Analytics Binding Runtime
 * Orchestrates execution plan conversion to analytics-ready inputs.
 * No business logic, no implicit branching.
 * All IDs and timestamps caller-provided or inherited.
 */

import type { TemporalAnalyticsBindingContext } from "./TemporalAnalyticsBindingContext.ts";
import { TemporalAnalyticsBindingContextValidator } from "./TemporalAnalyticsBindingContext.ts";
import type {
  ComparisonAnalyticsPayload,
  StageAnalyticsPayload,
  RouteAnalyticsPayload,
  AnalyticsReadyInput,
} from "./TemporalAnalyticsInput.ts";
import type { TemporalAnalyticsBindingResult } from "./TemporalAnalyticsBindingResult.ts";
import { TemporalAnalyticsBindingResultBuilder } from "./TemporalAnalyticsBindingResult.ts";
import type { ExecutionPlan } from "../execution/index.ts";
import type { ExecutionStage } from "../execution/index.ts";

/**
 * TemporalAnalyticsBindingRuntime
 * Orchestrates analytics binding of temporal execution outputs.
 * Pure structural binding, no business semantics.
 * All inputs explicit, all IDs/timestamps caller-provided or inherited.
 */
export class TemporalAnalyticsBindingRuntime {
  /**
   * bind
   * Main entry point: convert execution plan into analytics-ready input.
   *
   * @param context - Explicit analytics binding context with all inputs
   * @returns Analytics binding result with analytics-ready inputs
   */
  static bind(context: TemporalAnalyticsBindingContext): TemporalAnalyticsBindingResult {
    // Validate context structure
    const contextValidation = TemporalAnalyticsBindingContextValidator.validate(context);
    if (!contextValidation.isValid) {
      throw new Error(
        `TemporalAnalyticsBindingRuntime.bind: Invalid context\n${contextValidation.errors.join(
          "\n"
        )}`
      );
    }

    const plan = context.executionPlan;
    const intent = context.bindingIntent;

    // Build comparison payloads from execution plan
    const comparisons = this.buildComparisonPayloads(plan, intent.targetComparisonIds);

    // Build stage payloads from execution plan
    const stages = this.buildStagePayloads(plan, intent.targetStageIds, comparisons);

    // Build route payload from execution plan
    const route = this.buildRoutePayload(plan, intent.metadata);

    // Count totals
    const comparisonCount = comparisons.length;
    const stageCount = stages.length;
    const stepCount = stages.reduce((total, stage) => total + stage.stepCount, 0);

    // Build analytics-ready input
    const analyticsReadyInput: AnalyticsReadyInput = {
      analyticsInputId: intent.bindingId,
      analyticsSessionId: context.bindingSessionId,
      createdAt: context.bindingStartedAt,
      executionPlanId: plan.executionId,
      executionPlanSessionId: plan.executionSessionId,
      comparisons,
      stages,
      route,
      comparisonCount,
      stageCount,
      stepCount,
      metadata: context.metadata,
    };

    // Build final result with traceability
    const result = TemporalAnalyticsBindingResultBuilder.build(
      context.bindingId,
      context.bindingSessionId,
      context.bindingStartedAt,
      context.bindingStartedAt, // Completed at same time as started (synchronous)
      plan,
      analyticsReadyInput,
      context.metadata
    );

    return result;
  }

  /**
   * buildComparisonPayloads
   * Derive analytics-ready comparison payloads from execution plan.
   * Only creates payloads with data explicitly available in execution plan.
   * No defaults, no fabricated fields.
   *
   * @param plan - ExecutionPlan containing comparison structures
   * @param targetComparisonIds - Comparisons to include (empty = no comparisons)
   * @returns Array of ComparisonAnalyticsPayload with only explicit data
   */
  private static buildComparisonPayloads(
    plan: ExecutionPlan,
    targetComparisonIds: string[]
  ): ComparisonAnalyticsPayload[] {
    // Empty array means no comparisons requested by caller
    // Return empty - no hidden defaults
    if (!Array.isArray(targetComparisonIds) || targetComparisonIds.length === 0) {
      return [];
    }

    const payloads: ComparisonAnalyticsPayload[] = [];

    for (const comparisonId of targetComparisonIds) {
      // Build payload with only data explicitly available in execution plan
      // Fields that don't have sources remain optional (undefined)
      // No defaults, no fabricated values

      const payload: ComparisonAnalyticsPayload = {
        comparisonId,
        // Window IDs, intent, overlap data only populated if available from metadata
        processingStageIds: [], // Will be populated by stage analysis
        // Note: metadata only added if explicit data exists
      };

      // Find which stages will process this comparison
      // by looking through stage metadata
      // Also extract any comparison-specific metadata from stages
      for (const stage of plan.stages) {
        // Check if stage metadata references this comparison
        if (
          stage &&
          typeof stage === "object" &&
          "metadata" in stage &&
          stage.metadata &&
          typeof stage.metadata === "object"
        ) {
          const stageMetadata = stage.metadata as Record<string, unknown>;
          
          // Check if this stage processes this comparison
          if (stageMetadata.comparisonIds && Array.isArray(stageMetadata.comparisonIds)) {
            const stageComparisons = stageMetadata.comparisonIds as string[];
            if (stageComparisons.includes(comparisonId)) {
              if (!payload.processingStageIds.includes(stage.stageId)) {
                payload.processingStageIds.push(stage.stageId);
              }
            }
          }
          
          // If this comparison payload metadata is empty,
          // it stays empty (no defaults)
        }
      }

      payloads.push(payload);
    }

    return payloads;
  }

  /**
   * buildStagePayloads
   * Derive analytics-ready stage payloads from execution plan.
   * Maps execution stages to analytics surfaces.
   *
   * @param plan - ExecutionPlan containing stages
   * @param targetStageIds - Stages to include (empty = all)
   * @param comparisons - Comparison payloads for correlation
   * @returns Array of StageAnalyticsPayload
   */
  private static buildStagePayloads(
    plan: ExecutionPlan,
    targetStageIds: string[],
    comparisons: ComparisonAnalyticsPayload[]
  ): StageAnalyticsPayload[] {
    // Determine which stages to include
    const stageIdsToInclude = targetStageIds && targetStageIds.length > 0 
      ? new Set(targetStageIds)
      : new Set(plan.stages.map(s => s.stageId));

    const payloads: StageAnalyticsPayload[] = [];

    // Build payload for each stage in execution route order
    for (let routePos = 0; routePos < plan.executionRoute.length; routePos++) {
      const stageId = plan.executionRoute[routePos];

      if (!stageIdsToInclude.has(stageId)) {
        continue; // Skip stages not in target list
      }

      // Find stage in execution plan
      const stage = plan.stages.find(s => s.stageId === stageId);
      if (!stage) {
        continue; // Skip if not found
      }

      // Find comparisons that will be processed in this stage
      const comparisonIdsInScope = comparisons
        .filter(comp => comp.processingStageIds.includes(stageId))
        .map(comp => comp.comparisonId);

      const payload: StageAnalyticsPayload = {
        stageId: stage.stageId,
        stageName: stage.stageName,
        routePosition: routePos,
        stepCount: stage.steps.length,
        stepIds: stage.steps.map(step => step.stepId),
        stageDependencies: stage.stageDependencies,
        comparisonIdsInScope,
        metadata: stage.metadata,
      };

      payloads.push(payload);
    }

    return payloads;
  }

  /**
   * buildRoutePayload
   * Derive analytics-ready route payload from execution plan.
   * Shows execution sequencing and dependency structure.
   *
   * @param plan - ExecutionPlan containing route and dependencies
   * @param metadata - Caller-provided metadata
   * @returns RouteAnalyticsPayload
   */
  private static buildRoutePayload(
    plan: ExecutionPlan,
    metadata: Record<string, unknown>
  ): RouteAnalyticsPayload {
    // Calculate total step count
    const totalStepCount = plan.stages.reduce((total, stage) => total + stage.steps.length, 0);

    // Build dependent stages map (reverse dependency graph)
    const dependentStages = new Map<string, Set<string>>();

    // Initialize all stage IDs in the map
    for (const stage of plan.stages) {
      dependentStages.set(stage.stageId, new Set());
    }

    // For each stage, add it to the dependent set of its dependencies
    for (const stage of plan.stages) {
      for (const depId of stage.stageDependencies) {
        const dependents = dependentStages.get(depId);
        if (dependents) {
          dependents.add(stage.stageId);
        }
      }
    }

    const payload: RouteAnalyticsPayload = {
      executionRoute: plan.executionRoute,
      stageCount: plan.stages.length,
      totalStepCount,
      dependentStages,
      metadata,
    };

    return payload;
  }
}
