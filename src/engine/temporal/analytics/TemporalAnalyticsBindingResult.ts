/**
 * Temporal Analytics Binding Result
 * Explicit output contract of analytics binding stage.
 * Contains analytics-ready inputs and complete traceability.
 * No business logic, no interpretation.
 */

import type { AnalyticsReadyInput } from "./TemporalAnalyticsInput.ts";
import type { ExecutionPlan } from "../execution/index.ts";

/**
 * TemporalAnalyticsBindingResult
 * Complete output of analytics binding stage.
 * Contains all analytics-ready structures with full traceability.
 */
export interface TemporalAnalyticsBindingResult {
  // Binding operation context
  bindingId: string;
  bindingSessionId: string;
  bindingStartedAt: number;
  bindingCompletedAt: number;

  // Source execution plan (for traceability)
  sourceExecutionPlan: ExecutionPlan;

  // Analytics-ready input derived from execution plan
  analyticsReadyInput: AnalyticsReadyInput;

  // Validation results from binding
  isReady: boolean;
  readinessErrors: string[];

  // Metadata for binding result
  metadata: Record<string, unknown>;
}

/**
 * TemporalAnalyticsBindingResultBuilder
 * Deterministic construction of binding results.
 * Assembles analytics inputs with validation.
 */
export class TemporalAnalyticsBindingResultBuilder {
  /**
   * build
   * Construct an analytics binding result from context and analytics input.
   *
   * @param bindingId - Unique binding identifier
   * @param bindingSessionId - Binding session context identifier
   * @param bindingStartedAt - When binding was initiated (caller-provided)
   * @param bindingCompletedAt - When binding completed (caller-provided)
   * @param sourceExecutionPlan - The execution plan being analyzed
   * @param analyticsReadyInput - The analytics-ready input derived from plan
   * @param metadata - Caller-provided context
   * @returns Complete analytics binding result
   */
  static build(
    bindingId: string,
    bindingSessionId: string,
    bindingStartedAt: number,
    bindingCompletedAt: number,
    sourceExecutionPlan: ExecutionPlan,
    analyticsReadyInput: AnalyticsReadyInput,
    metadata: Record<string, unknown>
  ): TemporalAnalyticsBindingResult {
    // Validate required fields
    if (!bindingId || typeof bindingId !== "string") {
      throw new Error("TemporalAnalyticsBindingResultBuilder.build: bindingId must be a non-empty string");
    }
    if (!bindingSessionId || typeof bindingSessionId !== "string") {
      throw new Error("TemporalAnalyticsBindingResultBuilder.build: bindingSessionId must be a non-empty string");
    }
    if (typeof bindingStartedAt !== "number" || bindingStartedAt < 0) {
      throw new Error("TemporalAnalyticsBindingResultBuilder.build: bindingStartedAt must be a non-negative number");
    }
    if (typeof bindingCompletedAt !== "number" || bindingCompletedAt < 0) {
      throw new Error("TemporalAnalyticsBindingResultBuilder.build: bindingCompletedAt must be a non-negative number");
    }
    if (bindingCompletedAt < bindingStartedAt) {
      throw new Error("TemporalAnalyticsBindingResultBuilder.build: bindingCompletedAt must be >= bindingStartedAt");
    }

    // Validate source execution plan
    if (!sourceExecutionPlan) {
      throw new Error("TemporalAnalyticsBindingResultBuilder.build: sourceExecutionPlan is required");
    }
    if (!sourceExecutionPlan.executionId || typeof sourceExecutionPlan.executionId !== "string") {
      throw new Error("TemporalAnalyticsBindingResultBuilder.build: sourceExecutionPlan.executionId must be a non-empty string");
    }

    // Validate analytics input
    if (!analyticsReadyInput) {
      throw new Error("TemporalAnalyticsBindingResultBuilder.build: analyticsReadyInput is required");
    }
    if (!analyticsReadyInput.analyticsInputId || typeof analyticsReadyInput.analyticsInputId !== "string") {
      throw new Error("TemporalAnalyticsBindingResultBuilder.build: analyticsReadyInput.analyticsInputId must be a non-empty string");
    }

    // Validate consistency
    const readinessErrors: string[] = [];

    // Check that analytics input references the correct execution plan
    if (analyticsReadyInput.executionPlanId !== sourceExecutionPlan.executionId) {
      readinessErrors.push(
        `Analytics input execution plan ID "${analyticsReadyInput.executionPlanId}" does not match source execution plan ID "${sourceExecutionPlan.executionId}"`
      );
    }

    // Check that comparison count matches execution plan expectations
    if (analyticsReadyInput.stageCount !== sourceExecutionPlan.stages.length) {
      readinessErrors.push(
        `Analytics input stage count (${analyticsReadyInput.stageCount}) does not match execution plan stage count (${sourceExecutionPlan.stages.length})`
      );
    }

    // Check that route length matches stage count
    if (analyticsReadyInput.route.executionRoute.length !== analyticsReadyInput.stageCount) {
      readinessErrors.push(
        `Analytics input route length (${analyticsReadyInput.route.executionRoute.length}) does not match stage count (${analyticsReadyInput.stageCount})`
      );
    }

    // Validate that all stages in analytics input are from execution plan
    const executionPlanStageIds = new Set(sourceExecutionPlan.stages.map(s => s.stageId));
    for (const stage of analyticsReadyInput.stages) {
      if (!executionPlanStageIds.has(stage.stageId)) {
        readinessErrors.push(
          `Analytics input stage "${stage.stageId}" is not in execution plan`
        );
      }
    }

    const isReady = readinessErrors.length === 0;

    return {
      bindingId,
      bindingSessionId,
      bindingStartedAt,
      bindingCompletedAt,
      sourceExecutionPlan,
      analyticsReadyInput,
      isReady,
      readinessErrors,
      metadata,
    };
  }
}
