import {
  APIStatus,
  BehaviorEvaluationAPIResponse,
  RuntimeIntegrationAPIResponse,
  BehaviorSnapshotAPIResponse,
} from './dispatch-behavior-api-surface.types';
import { DispatchBehaviorDisposition } from './dispatch-behavior.enums';

/**
 * Dispatch Behavior API Surface Service Contract
 *
 * Defines the pure domain contract (interface) for Layer 9 behavior API surface.
 *
 * Purpose:
 * This contract defines the behavior API surface without any implementation.
 * It specifies what inputs are needed and what API responses are produced.
 * No HTTP handlers, controllers, or transport logic.
 *
 * Note:
 * This is a pure contract/interface definition only. Implementation is deferred.
 * No API implementation logic, routing, or controller logic defined here.
 */

/**
 * Behavior API Surface Service Contract
 *
 * Defines the surface contract for behavior API endpoints without implementation.
 *
 * Constraints:
 * - No implementation provided
 * - No HTTP handlers
 * - No controller logic
 * - No transport logic
 * - No side effects
 * - Only contract definition
 */
export interface DispatchBehaviorAPISurfaceService {
  /**
   * Create behavior evaluation API response
   *
   * Contracts:
   * - Input: Evaluation parameters with explicit references
   * - Output: Behavior evaluation API response
   * - Pure assembly: No side effects, no orchestration
   * - Deterministic: Same input always produces same output
   *
   * @param requestId - API request ID
   * @param dispatchId - Dispatch ID
   * @param behaviorProfileRef - Behavior profile reference
   * @param evaluationResultRef - Evaluation result reference
   * @param finalDisposition - Final resolved disposition
   * @param traceRef - Trace reference
   * @param status - API operation status
   * @param createdAt - Creation timestamp
   * @param updatedAt - Update timestamp
   * @returns Behavior evaluation API response
   */
  createBehaviorEvaluationResponse(
    requestId: string,
    dispatchId: string,
    behaviorProfileRef: string,
    evaluationResultRef: string,
    finalDisposition: DispatchBehaviorDisposition,
    traceRef: string,
    status: APIStatus,
    createdAt: number,
    updatedAt: number
  ): BehaviorEvaluationAPIResponse;

  /**
   * Create runtime integration API response
   *
   * Contracts:
   * - Input: Integration parameters with explicit references
   * - Output: Runtime integration API response
   * - Pure assembly: No side effects, no orchestration
   * - Deterministic: Same input always produces same output
   *
   * @param requestId - API request ID
   * @param dispatchId - Dispatch ID
   * @param integrationRef - Integration contract reference
   * @param runtimeOutcomeRef - Runtime outcome reference
   * @param behaviorProfileRef - Behavior profile reference
   * @param traceRef - Trace reference
   * @param status - API operation status
   * @param createdAt - Creation timestamp
   * @param updatedAt - Update timestamp
   * @returns Runtime integration API response
   */
  createRuntimeIntegrationResponse(
    requestId: string,
    dispatchId: string,
    integrationRef: string,
    runtimeOutcomeRef: string,
    behaviorProfileRef: string,
    traceRef: string,
    status: APIStatus,
    createdAt: number,
    updatedAt: number
  ): RuntimeIntegrationAPIResponse;

  /**
   * Create behavior snapshot API response
   *
   * Contracts:
   * - Input: Snapshot parameters with explicit references
   * - Output: Behavior snapshot API response
   * - Pure assembly: No side effects, no persistence
   * - Deterministic: Same input always produces same output
   *
   * @param requestId - API request ID
   * @param dispatchId - Dispatch ID
   * @param snapshotRef - Snapshot reference
   * @param evaluationResultRef - Evaluation result reference
   * @param integrationRef - Integration contract reference
   * @param traceRef - Trace reference
   * @param status - API operation status
   * @param createdAt - Creation timestamp
   * @param updatedAt - Update timestamp
   * @returns Behavior snapshot API response
   */
  createBehaviorSnapshotResponse(
    requestId: string,
    dispatchId: string,
    snapshotRef: string,
    evaluationResultRef: string,
    integrationRef: string,
    traceRef: string,
    status: APIStatus,
    createdAt: number,
    updatedAt: number
  ): BehaviorSnapshotAPIResponse;
}
