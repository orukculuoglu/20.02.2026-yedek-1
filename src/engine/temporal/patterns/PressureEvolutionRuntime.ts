/**
 * Pressure Evolution Runtime
 * Deterministic orchestration of pressure evolution evaluation.
 * Derives stage type from direction+strength, evaluates transitions, derives labels.
 * All computation synchronous and deterministic from explicit caller-provided inputs only.
 * No ID generation, no business logic, no interpretation.
 */

import { PressureEvolutionContext, PressureEvolutionContextValidator } from "./PressureEvolutionContext.ts";
import {
  PressureEvolutionStage,
  PressureEvolutionTransition,
  PressureEvolutionSurface,
  PressureEvolutionResult,
  PressureEvolutionResultBuilder,
} from "./PressureEvolutionResult.ts";
import type { TrendDirection, TrendStrength } from "../contracts/TrendModelContract.ts";

/**
 * PressureEvolutionRuntime
 * Deterministic evaluation of pressure evolution from explicit runtime context.
 * Synchronous, no async operations, no random, no Date.now().
 */
export class PressureEvolutionRuntime {
  /**
   * deriveStageType
   * Deterministic derivation of pressure evolution stage type from direction + strength combination.
   * Uses explicit mapping rules only.
   *
   * Stage type mapping (explicit rules):
   * - direction=increasing, strength=weak|moderate => emergence
   * - direction=increasing, strength=strong|extreme => acceleration
   * - direction=flat => stabilization
   * - direction=decreasing, strength=weak|moderate => deceleration
   * - direction=decreasing, strength=strong|extreme => reversal
   * - direction=mixed => continuation
   * - direction|strength=undefined => undefined
   *
   * @param direction - Trend direction from runtime output
   * @param strength - Trend strength from runtime output
   * @returns Stage type classification
   */
  static deriveStageType(
    direction: TrendDirection | undefined,
    strength: TrendStrength | undefined
  ): PressureEvolutionStage["stageType"] {
    // Handle undefined cases
    if (direction === undefined || strength === undefined) {
      return "undefined";
    }

    // Increasing direction
    if (direction === "increasing") {
      if (strength === "weak" || strength === "moderate") {
        return "emergence";
      }
      if (strength === "strong" || strength === "extreme") {
        return "acceleration";
      }
    }

    // Flat direction
    if (direction === "flat") {
      return "stabilization";
    }

    // Decreasing direction
    if (direction === "decreasing") {
      if (strength === "weak" || strength === "moderate") {
        return "deceleration";
      }
      if (strength === "strong" || strength === "extreme") {
        return "reversal";
      }
    }

    // Mixed direction
    if (direction === "mixed") {
      return "continuation";
    }

    // Fallback to undefined for unexpected combinations
    return "undefined";
  }

  /**
   * deriveEvolutionLabel
   * Deterministic derivation of evolution label from stage type.
   * Uses explicit mapping rules only.
   *
   * Label mapping (explicit rules):
   * - emergence => emerging_pressure
   * - acceleration => accelerating_pressure
   * - stabilization => stable_pressure
   * - deceleration => decelerating_pressure
   * - reversal => reversing_pressure
   * - continuation => continuing_pressure
   * - undefined => undefined_pressure
   *
   * @param stageType - Stage type classification
   * @returns Evolution label
   */
  static deriveEvolutionLabel(
    stageType: PressureEvolutionStage["stageType"]
  ): PressureEvolutionSurface["evolutionLabel"] {
    switch (stageType) {
      case "emergence":
        return "emerging_pressure";
      case "acceleration":
        return "accelerating_pressure";
      case "stabilization":
        return "stable_pressure";
      case "deceleration":
        return "decelerating_pressure";
      case "reversal":
        return "reversing_pressure";
      case "continuation":
        return "continuing_pressure";
      case "undefined":
        return "undefined_pressure";
      default:
        // Unreachable with proper type narrowing, but included for completeness
        return "undefined_pressure";
    }
  }

  /**
   * evaluateTransition
   * Deterministic evaluation of transition from previous stage to current stage.
   * Transition created only if stage type changed.
   *
   * @param transitionId - Caller-provided transition identifier
   * @param sourceTrendId - Source trend identifier
   * @param previousStageType - Previous stage type (if available)
   * @param currentStageType - Current stage type
   * @param transitionedAt - Timestamp when transition occurred (Unix milliseconds)
   * @returns Transition object or undefined if no stage change
   */
  static evaluateTransition(
    transitionId: string,
    sourceTrendId: string,
    previousStageType: PressureEvolutionStage["stageType"] | undefined,
    currentStageType: PressureEvolutionStage["stageType"],
    transitionedAt: number
  ): PressureEvolutionTransition | undefined {
    // Validate inputs
    if (!transitionId || typeof transitionId !== "string") {
      throw new Error("PressureEvolutionRuntime.evaluateTransition: transitionId must be a non-empty string");
    }
    if (!sourceTrendId || typeof sourceTrendId !== "string") {
      throw new Error("PressureEvolutionRuntime.evaluateTransition: sourceTrendId must be a non-empty string");
    }
    if (typeof transitionedAt !== "number" || transitionedAt < 0) {
      throw new Error("PressureEvolutionRuntime.evaluateTransition: transitionedAt must be a non-negative number");
    }

    // No previous stage - no transition
    if (previousStageType === undefined) {
      return undefined;
    }

    // Stage unchanged - no transition
    if (previousStageType === currentStageType) {
      return undefined;
    }

    // Stage changed - create transition
    return {
      transitionId,
      sourceTrendId,
      fromStageType: previousStageType,
      toStageType: currentStageType,
      transitionReason: "stage_changed",
      transitionedAt,
    };
  }

  /**
   * evaluate
   * Complete deterministic pressure evolution evaluation.
   * Derives stage type from direction+strength, evaluates transitions, derives labels.
   * Assembles complete pressure evolution surface from components.
   *
   * @param context - Explicit pressure evolution context with caller-provided inputs
   * @returns Complete pressure evolution result
   */
  static evaluate(context: PressureEvolutionContext): PressureEvolutionResult {
    // Validate context using strict validator
    PressureEvolutionContextValidator.validateStrict(context);

    const { inputSurface } = context;

    // Validate input surface
    if (!inputSurface.sourceTrendId || typeof inputSurface.sourceTrendId !== "string") {
      throw new Error("PressureEvolutionRuntime.evaluate: inputSurface.sourceTrendId must be a non-empty string");
    }
    if (!inputSurface.sourceRuntimeId || typeof inputSurface.sourceRuntimeId !== "string") {
      throw new Error("PressureEvolutionRuntime.evaluate: inputSurface.sourceRuntimeId must be a non-empty string");
    }
    if (typeof inputSurface.evaluatedAt !== "number" || inputSurface.evaluatedAt < 0) {
      throw new Error("PressureEvolutionRuntime.evaluate: inputSurface.evaluatedAt must be a non-negative number");
    }

    // Step 1: Derive stage type from direction + strength
    const stageType = this.deriveStageType(inputSurface.direction, inputSurface.strength);

    // Step 2: Create current stage
    const currentStage: PressureEvolutionStage = {
      stageId: context.currentStageId,
      sourceTrendId: inputSurface.sourceTrendId,
      stageType,
      stagePosition: context.currentStagePosition,
      activationConditionLabel: this.deriveEvolutionLabel(stageType),
      activatedAt: context.evolutionCompletedAt,
      metadata: context.stageMetadata,
    };

    // Step 3: Derive transition if previous stage exists
    let transition: PressureEvolutionTransition | undefined;
    if (context.previousPressureEvolutionSurface) {
      const previousStageType = context.previousPressureEvolutionSurface.currentStage.stageType;
      const stageChanged = previousStageType !== stageType;

      if (stageChanged) {
        // Stage type changed: transition is required
        if (!context.transitionId) {
          throw new Error(
            "PressureEvolutionRuntime.evaluate: previousPressureEvolutionSurface exists with stage type change, but transitionId is missing"
          );
        }
        transition = this.evaluateTransition(
          context.transitionId,
          inputSurface.sourceTrendId,
          previousStageType,
          stageType,
          context.evolutionCompletedAt
        );
      }
      // If stage unchanged, transition is omitted (no transition object)
    }

    // Step 4: Derive evolution label from stage type
    const evolutionLabel = this.deriveEvolutionLabel(stageType);

    // Step 5: Assemble pressure evolution surface
    const pressureEvolutionSurface: PressureEvolutionSurface = {
      pressureEvolutionId: context.pressureEvolutionId,
      sourceTrendId: inputSurface.sourceTrendId,
      sourceRuntimeId: inputSurface.sourceRuntimeId,
      currentStage,
      previousStage: context.previousPressureEvolutionSurface?.currentStage,
      transition,
      evolutionLabel,
      evaluatedAt: context.evolutionCompletedAt,
      metadata: context.surfaceMetadata,
    };

    // Step 6: Build and return result
    return PressureEvolutionResultBuilder.build(
      context.evolutionRuntimeId,
      context.evolutionSessionId,
      context.evolutionStartedAt,
      context.evolutionCompletedAt,
      pressureEvolutionSurface,
      context.resultMetadata
    );
  }
}
