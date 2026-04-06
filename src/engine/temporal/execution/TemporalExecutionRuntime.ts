/**
 * Temporal Execution Runtime
 * Orchestrates preparation results into execution plans.
 * No business logic, no implicit branching.
 * All IDs and timestamps caller-provided.
 */

import type { TemporalExecutionContext, ExecutionStageIntent } from "./TemporalExecutionContext.ts";
import { TemporalExecutionContextValidator } from "./TemporalExecutionContext.ts";
import type { ExecutionStep, ExecutionStage } from "./TemporalExecutionStage.ts";
import { ExecutionStageValidator } from "./TemporalExecutionStage.ts";
import type { ExecutionPlan } from "./TemporalExecutionPlan.ts";
import { ExecutionPlanBuilder } from "./TemporalExecutionPlan.ts";
import type { TemporalPreparationResult } from "../runtime/index.ts";

/**
 * TemporalExecutionRuntime
 * Orchestrates execution of temporal preparation results.
 * Pure structural orchestration, no business semantics.
 * All inputs explicit, all IDs/timestamps caller-provided.
 */
export class TemporalExecutionRuntime {
  /**
   * orchestrate
   * Main entry point: convert execution context into execution plan.
   *
   * @param context - Explicit execution context with all inputs
   * @returns Execution plan ready for execution
   */
  static orchestrate(context: TemporalExecutionContext): ExecutionPlan {
    // Validate context structure
    const contextValidation = TemporalExecutionContextValidator.validate(context);
    if (!contextValidation.isValid) {
      throw new Error(
        `TemporalExecutionRuntime.orchestrate: Invalid context\n${contextValidation.errors.join(
          "\n"
        )}`
      );
    }

    // Build execution stages from intents
    const stages = this.buildStagesFromIntents(
      context.stageIntents,
      context.preparationResult
    );

    // Build execution route from stage dependencies
    const executionRoute = this.buildExecutionRoute(stages);

    // Build final execution plan
    const plan = ExecutionPlanBuilder.build(
      context.executionId,
      context.executionSessionId,
      context.executionStartedAt,
      stages,
      executionRoute,
      context.executionStartedAt,  // Use same timestamp as execution started
      context.metadata
    );

    return plan;
  }

  /**
   * buildStagesFromIntents
   * Convert execution stage intents into structured ExecutionStage objects.
   * Steps MUST be explicitly provided by caller in stageConfiguration.steps.
   * No defaults, no inference, all structural assembly only.
   *
   * @param intents - Caller-provided stage intents
   * @param preparationResult - The preparation result being executed
   * @returns Array of ExecutionStage objects
   */
  private static buildStagesFromIntents(
    intents: ExecutionStageIntent[],
    preparationResult: TemporalPreparationResult
  ): ExecutionStage[] {
    const stages: ExecutionStage[] = [];

    for (let position = 0; position < intents.length; position++) {
      const intent = intents[position];

      // Extract steps from stageConfiguration
      // Caller MUST provide steps explicitly; no default step generation
      let steps: ExecutionStep[] = [];

      if (
        intent.stageConfiguration &&
        typeof intent.stageConfiguration === "object" &&
        "steps" in intent.stageConfiguration &&
        Array.isArray(intent.stageConfiguration.steps)
      ) {
        // Caller provided explicit steps
        const configSteps = intent.stageConfiguration.steps;

        for (let i = 0; i < configSteps.length; i++) {
          const configStep = configSteps[i];

          // Validate step has all required explicit fields from caller
          if (
            !configStep ||
            typeof configStep !== "object"
          ) {
            throw new Error(
              `TemporalExecutionRuntime.buildStagesFromIntents: stage "${intent.stageId}" step[${i}] is not an object`
            );
          }

          const typedStep = configStep as Record<string, unknown>;

          if (typeof typedStep.stepId !== "string" || !typedStep.stepId) {
            throw new Error(
              `TemporalExecutionRuntime.buildStagesFromIntents: stage "${intent.stageId}" step[${i}] must have explicit stepId as non-empty string`
            );
          }

          if (typeof typedStep.stepName !== "string" || !typedStep.stepName) {
            throw new Error(
              `TemporalExecutionRuntime.buildStagesFromIntents: stage "${intent.stageId}" step[${i}] must have explicit stepName as non-empty string`
            );
          }

          if (typeof typedStep.stepPosition !== "number" || typedStep.stepPosition < 0) {
            throw new Error(
              `TemporalExecutionRuntime.buildStagesFromIntents: stage "${intent.stageId}" step[${i}] must have explicit stepPosition as non-negative number`
            );
          }

          if (typeof typedStep.stepType !== "string" || !typedStep.stepType) {
            throw new Error(
              `TemporalExecutionRuntime.buildStagesFromIntents: stage "${intent.stageId}" step[${i}] must have explicit stepType as non-empty string`
            );
          }

          if (typeof typedStep.createdAt !== "number" || typedStep.createdAt < 0) {
            throw new Error(
              `TemporalExecutionRuntime.buildStagesFromIntents: stage "${intent.stageId}" step[${i}] must have explicit createdAt as non-negative number`
            );
          }

          if (!Array.isArray(typedStep.stepDependencies)) {
            throw new Error(
              `TemporalExecutionRuntime.buildStagesFromIntents: stage "${intent.stageId}" step[${i}] must have explicit stepDependencies as array`
            );
          }

          if (!typedStep.metadata || typeof typedStep.metadata !== "object") {
            throw new Error(
              `TemporalExecutionRuntime.buildStagesFromIntents: stage "${intent.stageId}" step[${i}] must have explicit metadata as object`
            );
          }

          // Build ExecutionStep with only caller-provided values
          // No defaults, no fallbacks - all fields explicit from caller
          const step: ExecutionStep = {
            stepId: typedStep.stepId as string,
            stepName: typedStep.stepName as string,
            stepPosition: typedStep.stepPosition as number,
            stepType: typedStep.stepType as string,
            stepDependencies: typedStep.stepDependencies as string[],
            createdAt: typedStep.createdAt as number,
            metadata: typedStep.metadata as Record<string, unknown>,
          };

          steps.push(step);
        }
      }

      // If caller did not provide steps, throw error
      // Steps are required; no default step generation allowed
      if (steps.length === 0) {
        throw new Error(
          `TemporalExecutionRuntime.buildStagesFromIntents: stage "${intent.stageId}" must have explicit steps provided in stageConfiguration.steps array`
        );
      }

      // Create ExecutionStage from intent with explicit caller-provided steps
      const stage: ExecutionStage = {
        stageId: intent.stageId,
        stageName: intent.stageName,
        stagePosition: position,
        steps,
        stageDependencies: intent.stageDependencies,
        createdAt: intent.stagePreparedAt,
        metadata: intent.metadata,
      };

      // Validate stage structure
      const validation = ExecutionStageValidator.validateStage(stage);
      if (!validation.isValid) {
        throw new Error(
          `TemporalExecutionRuntime.buildStagesFromIntents: Invalid stage\n${validation.errors.join(
            "\n"
          )}`
        );
      }

      stages.push(stage);
    }

    return stages;
  }

  /**
   * buildExecutionRoute
   * Determine execution route based on stage dependencies.
   * Performs topological sort to respect dependencies.
   * No semantic interpretation, purely structural.
   *
   * @param stages - ExecutionStage objects with dependencies
   * @returns Ordered list of stage IDs for execution
   */
  private static buildExecutionRoute(stages: ExecutionStage[]): string[] {
    // Build dependency map
    const dependencyMap = new Map<string, Set<string>>();
    const inDegreeMap = new Map<string, number>();

    for (const stage of stages) {
      dependencyMap.set(stage.stageId, new Set(stage.stageDependencies));
      inDegreeMap.set(stage.stageId, stage.stageDependencies.length);
    }

    // Kahn's algorithm for topological sort
    const queue: string[] = [];
    const sorted: string[] = [];

    // Find all nodes with no incoming edges
    for (const [stageId, inDegree] of inDegreeMap.entries()) {
      if (inDegree === 0) {
        queue.push(stageId);
      }
    }

    // Process queue
    while (queue.length > 0) {
      const current = queue.shift();
      if (current) {
        sorted.push(current);

        // Find stages that depend on current stage
        for (const [stageId, dependencies] of dependencyMap.entries()) {
          if (dependencies.has(current)) {
            // Remove this dependency
            dependencies.delete(current);
            
            // Update in-degree
            const newInDegree = inDegreeMap.get(stageId) || 0;
            if (newInDegree > 0) {
              inDegreeMap.set(stageId, newInDegree - 1);
              
              // If in-degree becomes 0, add to queue
              if (inDegreeMap.get(stageId) === 0) {
                queue.push(stageId);
              }
            }
          }
        }
      }
    }

    // Check if all stages were processed (no cycles)
    if (sorted.length !== stages.length) {
      throw new Error(
        "TemporalExecutionRuntime.buildExecutionRoute: Stage dependency graph contains a cycle"
      );
    }

    return sorted;
  }
}
