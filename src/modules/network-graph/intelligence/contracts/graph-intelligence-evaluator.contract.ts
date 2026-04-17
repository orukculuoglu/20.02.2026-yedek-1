/**
 * Graph Intelligence Evaluator Contract
 * Defines the structural interface for deterministic graph intelligence evaluation.
 * Maps graph intelligence input to deterministic graph intelligence result.
 * No scoring, no propagation, no policy, only structural transformation.
 */

import type { GraphIntelligenceInput } from "./graph-intelligence-input.contract";
import type { GraphIntelligenceResult } from "./graph-intelligence-result.contract";

/**
 * GraphIntelligenceEvaluator
 * Deterministic structural contract for graph intelligence evaluation.
 * Accepts explicit input, produces explicit result.
 * Transformation is deterministic: same input always produces same result.
 * No side effects, no mutation of input graph structures.
 */
export interface GraphIntelligenceEvaluator {
  /**
   * Evaluate graph intelligence on provided input.
   * Reads runtime envelope structure deterministically.
   * Produces observations based on observation scope and input context.
   * Input graph structures are never mutated.
   *
   * @param input - Graph intelligence input (envelope, scope, context)
   * @returns Graph intelligence result (observations)
   */
  evaluate(input: GraphIntelligenceInput): GraphIntelligenceResult;
}
