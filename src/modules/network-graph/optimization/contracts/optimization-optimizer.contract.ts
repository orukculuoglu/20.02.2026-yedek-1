/**
 * Optimization Optimizer Contract
 * Defines the deterministic optimization boundary.
 * Explicit input → output transformation with no hidden behavior.
 */

import type { OptimizationInput } from "./optimization-input.contract";
import type { OptimizationResult } from "./optimization-result.contract";

/**
 * OptimizationOptimizer
 * Defines the deterministic boundary for optimization transformation.
 * Same input always produces same output.
 * No hidden state, no randomness, no side effects, no mutation.
 */
export interface OptimizationOptimizer {
  /**
   * Deterministic optimization function.
   * Transforms explicit OptimizationInput into explicit OptimizationResult.
   * Guaranteed deterministic: same input ⟹ same output
   * No mutation of input or shared state
   * @param input - Explicit optimization input (objective, constraints, tie-break, candidates)
   * @returns Explicit optimization result (selected actions, rejected candidates)
   */
  readonly optimize: (input: OptimizationInput) => OptimizationResult;
}

/**
 * Optimization optimizer behavior:
 * - Deterministic boundary: same input always produces same output
 * - Explicit transformation: OptimizationInput → OptimizationResult
 * - No hidden behavior, no hidden state, no mutation of input
 * - No scoring engine embedded
 * - No ranking algorithm embedded
 * - No probabilistic search
 * - No recommendation logic embedded
 * - Pure function contract (structural definition only)
 */
