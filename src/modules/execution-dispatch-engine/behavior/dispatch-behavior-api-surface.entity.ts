import {
  APIStatus,
  BehaviorEvaluationAPIRequest,
  BehaviorEvaluationAPIResponse,
  RuntimeIntegrationAPIRequest,
  RuntimeIntegrationAPIResponse,
  BehaviorSnapshotAPIRequest,
  BehaviorSnapshotAPIResponse,
} from './dispatch-behavior-api-surface.types';
import { DispatchBehaviorDisposition } from './dispatch-behavior.enums';

/**
 * Input contract for creating a behavior evaluation API request
 *
 * All parameters must be explicitly provided from API layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateBehaviorEvaluationAPIRequestInput {
  /**
   * Request ID (explicitly provided, not generated)
   */
  requestId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Behavior profile reference
   */
  behaviorProfileRef: string;

  /**
   * Runtime outcome reference
   */
  runtimeOutcomeRef: string;

  /**
   * Timestamp of creation (explicitly provided)
   */
  createdAt: number;
}

/**
 * Input contract for creating a behavior evaluation API response
 *
 * All parameters must be explicitly provided from API layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateBehaviorEvaluationAPIResponseInput {
  /**
   * Request ID
   */
  requestId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Behavior profile reference
   */
  behaviorProfileRef: string;

  /**
   * Evaluation result reference
   */
  evaluationResultRef: string;

  /**
   * Final disposition (explicitly provided)
   */
  finalDisposition: DispatchBehaviorDisposition;

  /**
   * Trace reference
   */
  traceRef: string;

  /**
   * API status
   */
  status: APIStatus;

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
 * Input contract for creating a runtime integration API request
 *
 * All parameters must be explicitly provided from API layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateRuntimeIntegrationAPIRequestInput {
  /**
   * Request ID (explicitly provided, not generated)
   */
  requestId: string;

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
   * Timestamp of creation (explicitly provided)
   */
  createdAt: number;
}

/**
 * Input contract for creating a runtime integration API response
 *
 * All parameters must be explicitly provided from API layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateRuntimeIntegrationAPIResponseInput {
  /**
   * Request ID
   */
  requestId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Integration contract reference
   */
  integrationRef: string;

  /**
   * Runtime outcome reference
   */
  runtimeOutcomeRef: string;

  /**
   * Behavior profile reference
   */
  behaviorProfileRef: string;

  /**
   * Trace reference
   */
  traceRef: string;

  /**
   * API status
   */
  status: APIStatus;

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
 * Input contract for creating a behavior snapshot API request
 *
 * All parameters must be explicitly provided from API layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateBehaviorSnapshotAPIRequestInput {
  /**
   * Request ID (explicitly provided, not generated)
   */
  requestId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Behavior profile reference
   */
  behaviorProfileRef: string;

  /**
   * Evaluation result reference
   */
  evaluationResultRef: string;

  /**
   * Integration reference
   */
  integrationRef: string;

  /**
   * Timestamp of creation (explicitly provided)
   */
  createdAt: number;
}

/**
 * Input contract for creating a behavior snapshot API response
 *
 * All parameters must be explicitly provided from API layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateBehaviorSnapshotAPIResponseInput {
  /**
   * Request ID
   */
  requestId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Snapshot reference
   */
  snapshotRef: string;

  /**
   * Evaluation result reference
   */
  evaluationResultRef: string;

  /**
   * Integration reference
   */
  integrationRef: string;

  /**
   * Trace reference
   */
  traceRef: string;

  /**
   * API status
   */
  status: APIStatus;

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
 * Factory function to create a behavior evaluation API request
 *
 * Produces a deterministic request entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateBehaviorEvaluationAPIRequestInput
 * @returns BehaviorEvaluationAPIRequest - Immutable request object
 */
export function createBehaviorEvaluationAPIRequest(
  input: CreateBehaviorEvaluationAPIRequestInput
): BehaviorEvaluationAPIRequest {
  return Object.freeze({
    requestId: input.requestId,
    dispatchId: input.dispatchId,
    behaviorProfileRef: input.behaviorProfileRef,
    runtimeOutcomeRef: input.runtimeOutcomeRef,
    createdAt: input.createdAt,
  });
}

/**
 * Factory function to create a behavior evaluation API response
 *
 * Produces a deterministic response entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateBehaviorEvaluationAPIResponseInput
 * @returns BehaviorEvaluationAPIResponse - Immutable response object
 */
export function createBehaviorEvaluationAPIResponse(
  input: CreateBehaviorEvaluationAPIResponseInput
): BehaviorEvaluationAPIResponse {
  return Object.freeze({
    requestId: input.requestId,
    dispatchId: input.dispatchId,
    behaviorProfileRef: input.behaviorProfileRef,
    evaluationResultRef: input.evaluationResultRef,
    finalDisposition: input.finalDisposition,
    traceRef: input.traceRef,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create a runtime integration API request
 *
 * Produces a deterministic request entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateRuntimeIntegrationAPIRequestInput
 * @returns RuntimeIntegrationAPIRequest - Immutable request object
 */
export function createRuntimeIntegrationAPIRequest(
  input: CreateRuntimeIntegrationAPIRequestInput
): RuntimeIntegrationAPIRequest {
  return Object.freeze({
    requestId: input.requestId,
    dispatchId: input.dispatchId,
    runtimeOutcomeRef: input.runtimeOutcomeRef,
    behaviorProfileRef: input.behaviorProfileRef,
    createdAt: input.createdAt,
  });
}

/**
 * Factory function to create a runtime integration API response
 *
 * Produces a deterministic response entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateRuntimeIntegrationAPIResponseInput
 * @returns RuntimeIntegrationAPIResponse - Immutable response object
 */
export function createRuntimeIntegrationAPIResponse(
  input: CreateRuntimeIntegrationAPIResponseInput
): RuntimeIntegrationAPIResponse {
  return Object.freeze({
    requestId: input.requestId,
    dispatchId: input.dispatchId,
    integrationRef: input.integrationRef,
    runtimeOutcomeRef: input.runtimeOutcomeRef,
    behaviorProfileRef: input.behaviorProfileRef,
    traceRef: input.traceRef,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create a behavior snapshot API request
 *
 * Produces a deterministic request entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateBehaviorSnapshotAPIRequestInput
 * @returns BehaviorSnapshotAPIRequest - Immutable request object
 */
export function createBehaviorSnapshotAPIRequest(
  input: CreateBehaviorSnapshotAPIRequestInput
): BehaviorSnapshotAPIRequest {
  return Object.freeze({
    requestId: input.requestId,
    dispatchId: input.dispatchId,
    behaviorProfileRef: input.behaviorProfileRef,
    evaluationResultRef: input.evaluationResultRef,
    integrationRef: input.integrationRef,
    createdAt: input.createdAt,
  });
}

/**
 * Factory function to create a behavior snapshot API response
 *
 * Produces a deterministic response entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateBehaviorSnapshotAPIResponseInput
 * @returns BehaviorSnapshotAPIResponse - Immutable response object
 */
export function createBehaviorSnapshotAPIResponse(
  input: CreateBehaviorSnapshotAPIResponseInput
): BehaviorSnapshotAPIResponse {
  return Object.freeze({
    requestId: input.requestId,
    dispatchId: input.dispatchId,
    snapshotRef: input.snapshotRef,
    evaluationResultRef: input.evaluationResultRef,
    integrationRef: input.integrationRef,
    traceRef: input.traceRef,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}
