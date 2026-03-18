import { DispatchBehaviorEvaluationInput, DispatchBehaviorEvaluationResult } from './dispatch-behavior-evaluation.types';

/**
 * Dispatch Behavior Evaluation Service Contract
 *
 * Defines the pure domain contract (interface) for behavior evaluation.
 *
 * Purpose:
 * This contract defines the evaluation service surface without any implementation.
 * It specifies what inputs are needed and what results are produced.
 * No runtime integration, orchestration, or side effects.
 *
 * Note:
 * This is a pure contract/interface definition only. Implementation is deferred.
 * No evaluation algorithms are defined here, only the input/output contract.
 */

/**
 * Behavior Evaluation Service Contract
 *
 * Defines the surface contract for behavior evaluation without implementation.
 *
 * Constraints:
 * - No implementation provided
 * - No algorithm internals
 * - No runtime orchestration
 * - No side effects
 * - Only contract definition
 */
export interface DispatchBehaviorEvaluationService {
  /**
   * Evaluate dispatch behavior
   *
   * Contracts:
   * - Input: Explicit evaluation input with all required parameters
   * - Output: Explicit evaluation result with all determinations
   * - Pure function: No side effects, no Date.now(), no randomness
   * - Deterministic: Same input always produces same output
   *
   * @param input - Behavior evaluation input
   * @returns Evaluation result (contract structure, no implementation)
   */
  evaluateDispatchBehavior(
    input: DispatchBehaviorEvaluationInput
  ): DispatchBehaviorEvaluationResult;
}
