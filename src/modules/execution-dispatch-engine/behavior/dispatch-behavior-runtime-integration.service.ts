import {
  RuntimeOutcomeReference,
  BehaviorEvaluationHandoffInput,
  DispatchBehaviorRuntimeIntegrationContract,
} from './dispatch-behavior-runtime-integration.types';

/**
 * Dispatch Behavior Runtime Integration Service Contract
 *
 * Defines the pure domain contract (interface) for runtime-to-behavior integration.
 *
 * Purpose:
 * This contract defines the integration service surface without any implementation.
 * It specifies what inputs are needed and what outputs are produced.
 * No runtime orchestration, dispatch calls, or side effects.
 *
 * Note:
 * This is a pure contract/interface definition only. Implementation is deferred.
 * No integration algorithms or orchestration logic defined here.
 */

/**
 * Behavior Runtime Integration Service Contract
 *
 * Defines the surface contract for runtime-to-behavior integration without implementation.
 *
 * Constraints:
 * - No implementation provided
 * - No orchestration logic
 * - No dispatch calls
 * - No side effects
 * - Only contract definition
 */
export interface DispatchBehaviorRuntimeIntegrationService {
  /**
   * Map runtime outcome reference to behavior evaluation handoff
   *
   * Contracts:
   * - Input: Runtime outcome reference, dispatch, profile
   * - Output: Behavior evaluation handoff input
   * - Pure mapping: No side effects, no orchestration
   * - Deterministic: Same input always produces same output
   *
   * @param runtimeOutcomeRef - Runtime outcome reference
   * @param dispatchId - Dispatch ID
   * @param behaviorProfileRef - Behavior profile reference
   * @returns Behavior evaluation handoff input
   */
  mapRuntimeOutcomeToBehaviorInput(
    runtimeOutcomeRef: string,
    dispatchId: string,
    behaviorProfileRef: string
  ): BehaviorEvaluationHandoffInput;

  /**
   * Create behavior integration contract
   *
   * Contracts:
   * - Input: Integration parameters
   * - Output: Integration contract with all required references
   * - Pure assembly: No side effects, no calculation
   * - Deterministic: Same input always produces same output
   *
   * @param integrationId - Integration ID
   * @param dispatchId - Dispatch ID
   * @param runtimeOutcomeRef - Runtime outcome reference
   * @param behaviorProfileRef - Behavior profile reference
   * @param evaluationInputRef - Evaluation input reference
   * @param traceRef - Trace reference
   * @param createdAt - Creation timestamp
   * @param updatedAt - Update timestamp
   * @returns Integration contract
   */
  createIntegrationContract(
    integrationId: string,
    dispatchId: string,
    runtimeOutcomeRef: string,
    behaviorProfileRef: string,
    evaluationInputRef: string,
    traceRef: string,
    createdAt: number,
    updatedAt: number
  ): DispatchBehaviorRuntimeIntegrationContract;
}
