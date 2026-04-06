/**
 * Temporal Execution Plan
 * Deterministic execution plan contract.
 * Explicit stage list, route, dependencies, readiness markers.
 * No business logic, no interpretation.
 */

import type { ExecutionStage } from "./TemporalExecutionStage.ts";

/**
 * ExecutionPlan
 * Complete execution plan for a temporal preparation result.
 * Defines what stages will execute, their order, and their readiness.
 * Pure structure, no business semantics.
 */
export interface ExecutionPlan {
  // Unique execution plan identifier (caller-provided)
  executionId: string;
  
  // Execution session context identifier (matches TemporalExecutionContext)
  executionSessionId: string;
  
  // When execution was initiated (caller-provided)
  executionStartedAt: number;
  
  // All execution stages in this plan
  // Stages are the primary building blocks of execution
  stages: ExecutionStage[];
  
  // Explicit execution route: ordered list of stage IDs
  // Specifies the intended sequence of execution
  // Respects dependencies but provides explicit ordering
  executionRoute: string[];
  
  // Complete dependency graph for this execution
  // Maps each stage ID to all stages it depends on (transitive)
  // Useful for validation and understanding implications of stage ordering
  stageDependencyGraph: Map<string, Set<string>>;
  
  // Readiness validation results
  // isReady indicates whether execution plan is valid and executable
  isReady: boolean;
  
  // Error messages from readiness validation
  // Empty if isReady is true
  readinessErrors: string[];
  
  // When this execution plan was created (caller-provided)
  createdAt: number;
  
  // Metadata for execution context
  metadata: Record<string, unknown>;
}

/**
 * ExecutionPlanBuilder
 * Deterministic construction of execution plans.
 * Assembles stages and routes without interpretation.
 */
export class ExecutionPlanBuilder {
  /**
   * build
   * Construct an execution plan from explicit stages and route.
   *
   * @param executionId - Unique execution plan identifier
   * @param executionSessionId - Execution session context identifier
   * @param executionStartedAt - When execution was initiated (caller-provided)
   * @param stages - Execution stages
   * @param executionRoute - Ordered list of stage IDs to execute
   * @param createdAt - When plan was created (caller-provided)
   * @param metadata - Caller-provided context
   * @returns Complete execution plan
   */
  static build(
    executionId: string,
    executionSessionId: string,
    executionStartedAt: number,
    stages: ExecutionStage[],
    executionRoute: string[],
    createdAt: number,
    metadata: Record<string, unknown>
  ): ExecutionPlan {
    // Validate required fields
    if (!executionId || typeof executionId !== "string") {
      throw new Error("ExecutionPlanBuilder.build: executionId must be a non-empty string");
    }
    if (!executionSessionId || typeof executionSessionId !== "string") {
      throw new Error("ExecutionPlanBuilder.build: executionSessionId must be a non-empty string");
    }
    if (typeof executionStartedAt !== "number" || executionStartedAt < 0) {
      throw new Error("ExecutionPlanBuilder.build: executionStartedAt must be a non-negative number");
    }
    if (!Array.isArray(stages)) {
      throw new Error("ExecutionPlanBuilder.build: stages must be an array");
    }
    if (!Array.isArray(executionRoute)) {
      throw new Error("ExecutionPlanBuilder.build: executionRoute must be an array");
    }
    if (typeof createdAt !== "number" || createdAt < 0) {
      throw new Error("ExecutionPlanBuilder.build: createdAt must be a non-negative number");
    }

    // Build stage ID set for validation
    const stageIdSet = new Set(stages.map(s => s.stageId));
    
    // Build dependency graph to detect cycles and issues
    const stageDependencyGraph = new Map<string, Set<string>>();
    const readinessErrors: string[] = [];

    // Initialize graph with direct dependencies
    for (const stage of stages) {
      stageDependencyGraph.set(stage.stageId, new Set(stage.stageDependencies));
    }

    // Validate stage references in route
    for (let i = 0; i < executionRoute.length; i++) {
      const stageId = executionRoute[i];
      if (!stageIdSet.has(stageId)) {
        readinessErrors.push(
          `executionRoute[${i}] references unknown stage ID "${stageId}"`
        );
      }
    }

    // Validate all stage dependencies are known
    for (const stage of stages) {
      for (const depId of stage.stageDependencies) {
        if (!stageIdSet.has(depId)) {
          readinessErrors.push(
            `stage "${stage.stageId}" depends on unknown stage ID "${depId}"`
          );
        }
      }
    }

    // Detect simple cycles (self-dependency)
    for (const stage of stages) {
      if (stage.stageDependencies.includes(stage.stageId)) {
        readinessErrors.push(
          `stage "${stage.stageId}" has circular dependency (depends on itself)`
        );
      }
    }

    // Detect route violations (stage executed before its dependencies)
    // Build route position map
    const routePositions = new Map<string, number>();
    for (let i = 0; i < executionRoute.length; i++) {
      routePositions.set(executionRoute[i], i);
    }

    for (const stage of stages) {
      const stagePosition = routePositions.get(stage.stageId);
      if (stagePosition !== undefined) {
        for (const depId of stage.stageDependencies) {
          const depPosition = routePositions.get(depId);
          if (depPosition !== undefined && depPosition >= stagePosition) {
            readinessErrors.push(
              `stage "${stage.stageId}" (position ${stagePosition}) depends on "${depId}" (position ${depPosition}), but dependencies must execute first`
            );
          }
        }
      }
    }

    // Validate each stage has valid structure
    for (const stage of stages) {
      if (!stage.stageId || typeof stage.stageId !== "string") {
        readinessErrors.push("stage.stageId must be a non-empty string");
      }
      if (!Array.isArray(stage.steps) || stage.steps.length === 0) {
        readinessErrors.push(`stage "${stage.stageId}" must have at least one step`);
      }
    }

    const isReady = readinessErrors.length === 0;

    return {
      executionId,
      executionSessionId,
      executionStartedAt,
      stages,
      executionRoute,
      stageDependencyGraph,
      isReady,
      readinessErrors,
      createdAt,
      metadata,
    };
  }

  /**
   * getStageById
   * Retrieve a stage by its ID from an execution plan.
   *
   * @param plan - Execution plan
   * @param stageId - Stage identifier to find
   * @returns Stage or undefined if not found
   */
  static getStageById(plan: ExecutionPlan, stageId: string): ExecutionStage | undefined {
    return plan.stages.find(s => s.stageId === stageId);
  }

  /**
   * getStagesByPosition
   * Retrieve stages in execution route order from an execution plan.
   *
   * @param plan - Execution plan
   * @returns Array of stages in route order
   */
  static getStagesByPosition(plan: ExecutionPlan): ExecutionStage[] {
    return plan.executionRoute
      .map(stageId => plan.stages.find(s => s.stageId === stageId))
      .filter((stage): stage is ExecutionStage => stage !== undefined);
  }

  /**
   * countStepsInPlan
   * Count total steps across all stages in an execution plan.
   *
   * @param plan - Execution plan
   * @returns Total step count
   */
  static countStepsInPlan(plan: ExecutionPlan): number {
    return plan.stages.reduce((total, stage) => total + stage.steps.length, 0);
  }
}
