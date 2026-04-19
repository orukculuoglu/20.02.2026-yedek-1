/**
 * Regional Balancing Optimization Runtime Service
 * Protocol-clean implementation of regional balancing domain specialization.
 * Adapts shared orchestration to regional balancing candidates only.
 * Deterministic: same input always produces same output.
 * No class, no factory, no ID generation.
 * No mutation of input state.
 */

import type { RegionalBalancingOptimizationRuntimeInput, RegionalBalancingOptimizationRuntime, RegionalBalancingOptimizationResult } from "../contracts/regional-balancing-optimization-runtime.contract";
import type { OptimizationCandidateAction } from "../contracts/optimization-candidate-action.contract";
import { deterministicOptimizationRuntimeOrchestrator } from "./deterministic-optimization-runtime-orchestrator";

/**
 * Regional balancing optimization runtime service.
 * Minimal constant satisfying RegionalBalancingOptimizationRuntime interface.
 * Adapts shared orchestration to regional balancing domain.
 * No class, no factory, no ID generation.
 */
export const regionalBalancingOptimizationRuntime: RegionalBalancingOptimizationRuntime = {
  optimize: (input: RegionalBalancingOptimizationRuntimeInput): RegionalBalancingOptimizationResult => {
    // Convert regional balancing candidates to shared OptimizationCandidateAction
    // (RegionalBalancingCandidateAction is a subtype)
    const candidateActions: readonly OptimizationCandidateAction[] = input.regionalBalancingCandidates;

    // Create shared orchestration input
    const sharedInput = {
      optimization: {
        objective: input.objective,
        constraints: input.constraints,
        tieBreak: input.tieBreak,
        candidateActions,
        runtimeContext: null,
      },
      selectionLimit: input.selectionLimit,
      resultId: input.resultId,
    };

    // Call shared orchestrator
    const sharedResult = deterministicOptimizationRuntimeOrchestrator.orchestrate(sharedInput);

    // Filter result to regional balancing domain
    // (all candidates are regional balancing, so all results are regional balancing)
    const result: RegionalBalancingOptimizationResult = {
      resultId: sharedResult.resultId,
      selectedRegionalBalancingActions: sharedResult.selectedActions,
      rejectedRegionalBalancingCandidates: sharedResult.rejectedCandidates,
    };

    return result;
  },
};
