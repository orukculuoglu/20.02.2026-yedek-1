/**
 * Stock Optimization Runtime Service
 * Protocol-clean implementation of stock domain specialization.
 * Adapts shared orchestration to stock candidates only.
 * Deterministic: same input always produces same output.
 * No class, no factory, no ID generation.
 * No mutation of input state.
 */

import type { StockOptimizationRuntimeInput, StockOptimizationRuntime, StockOptimizationResult } from "../contracts/stock-optimization-runtime.contract";
import type { OptimizationCandidateAction } from "../contracts/optimization-candidate-action.contract";
import { deterministicOptimizationRuntimeOrchestrator } from "./deterministic-optimization-runtime-orchestrator";

/**
 * Stock optimization runtime service.
 * Minimal constant satisfying StockOptimizationRuntime interface.
 * Adapts shared orchestration to stock domain.
 * No class, no factory, no ID generation.
 */
export const stockOptimizationRuntime: StockOptimizationRuntime = {
  optimize: (input: StockOptimizationRuntimeInput): StockOptimizationResult => {
    // Convert stock candidates to shared OptimizationCandidateAction (StockCandidateAction is a subtype)
    const candidateActions: readonly OptimizationCandidateAction[] = input.stockCandidates;

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

    // Filter result to stock domain (all candidates are stock, so all results are stock)
    const result: StockOptimizationResult = {
      resultId: sharedResult.resultId,
      selectedStockActions: sharedResult.selectedActions,
      rejectedStockCandidates: sharedResult.rejectedCandidates,
    };

    return result;
  },
};
