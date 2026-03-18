import {
  RuntimeIntegrationStatus,
  RuntimeOutcomeReference,
  BehaviorEvaluationHandoffInput,
  DispatchBehaviorRuntimeIntegrationContract,
} from './dispatch-behavior-runtime-integration.types';

/**
 * Input contract for creating a runtime integration contract
 *
 * All parameters must be explicitly provided from integration layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 * - No calculation or mapping logic
 */
export interface CreateDispatchBehaviorRuntimeIntegrationContractInput {
  /**
   * Integration ID (explicitly provided, not generated)
   */
  integrationId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Runtime outcome reference
   */
  runtimeOutcomeRef: string;

  /**
   * Behavior profile reference
   */
  behaviorProfileRef: string;

  /**
   * Evaluation input reference
   */
  evaluationInputRef: string;

  /**
   * Trace reference
   */
  traceRef: string;

  /**
   * Integration status
   */
  status: RuntimeIntegrationStatus;

  /**
   * Timestamp of creation (explicitly provided)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided)
   */
  updatedAt: number;
}

/**
 * Factory function to create a runtime integration contract
 *
 * Produces a deterministic integration contract entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateDispatchBehaviorRuntimeIntegrationContractInput
 * @returns DispatchBehaviorRuntimeIntegrationContract - Immutable integration contract object
 */
export function createDispatchBehaviorRuntimeIntegrationContract(
  input: CreateDispatchBehaviorRuntimeIntegrationContractInput
): DispatchBehaviorRuntimeIntegrationContract {
  return Object.freeze({
    integrationId: input.integrationId,
    dispatchId: input.dispatchId,
    runtimeOutcomeRef: input.runtimeOutcomeRef,
    behaviorProfileRef: input.behaviorProfileRef,
    evaluationInputRef: input.evaluationInputRef,
    traceRef: input.traceRef,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}
