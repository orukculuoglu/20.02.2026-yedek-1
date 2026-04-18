/**
 * Routing Optimization Runtime Service
 * Protocol-clean implementation of routing domain specialization.
 * Adapts shared orchestration to routing candidates only.
 * Deterministic: same input always produces same output.
 * No class, no factory, no ID generation.
 * No mutation of input state.
 */

import type { RoutingOptimizationRuntimeInput, RoutingOptimizationRuntime, RoutingOptimizationResult } from "../contracts/routing-optimization-runtime.contract";
import type { OptimizationCandidateAction } from "../contracts/optimization-candidate-action.contract";
import { deterministicOptimizationRuntimeOrchestrator } from "./deterministic-optimization-runtime-orchestrator";

/**
 * Routing optimization runtime service.
 * Minimal constant satisfying RoutingOptimizationRuntime interface.
 * Adapts shared orchestration to routing domain.
 * No class, no factory, no ID generation.
 */
export const routingOptimizationRuntime: RoutingOptimizationRuntime = {
  optimize: (input: RoutingOptimizationRuntimeInput): RoutingOptimizationResult => {
    // Convert routing candidates to shared OptimizationCandidateAction (RoutingCandidateAction is a subtype)
    const candidateActions: readonly OptimizationCandidateAction[] = input.routingCandidates;

    // Create shared orchestration input
    const sharedInput = {
      optimization: {
        objective: input.objective,
        constraints: input.constraints,
        tieBreak: input.tieBreak,
        candidateActions,
      },
      selectionLimit: input.selectionLimit,
      resultId: input.resultId,
    };

    // Call shared orchestrator
    const sharedResult = deterministicOptimizationRuntimeOrchestrator.orchestrate(sharedInput);

    // Filter result to routing domain (all candidates are routing, so all results are routing)
    const result: RoutingOptimizationResult = {
      resultId: sharedResult.resultId,
      selectedRoutingActions: sharedResult.selectedActions,
      rejectedRoutingCandidates: sharedResult.rejectedCandidates,
    };

    return result;
  },
};
