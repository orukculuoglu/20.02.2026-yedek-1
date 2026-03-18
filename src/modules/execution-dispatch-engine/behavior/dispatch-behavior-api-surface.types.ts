import { DispatchBehaviorDisposition } from './dispatch-behavior.enums';

/**
 * Dispatch Behavior API Surface Types
 *
 * Models the explicit domain contracts for Layer 9 behavior API exposure.
 *
 * Purpose:
 * API surface contracts define how Layer 9 behavior artifacts are exposed
 * through API endpoints, separate from HTTP transport or controller logic.
 * Provides deterministic API contracts for requests and responses.
 *
 * Note:
 * This layer defines pure API contracts only. No HTTP implementation,
 * controller logic, or transport semantics are defined here.
 */

/**
 * API Status Enum
 *
 * Represents the status of an API operation.
 *
 * States:
 * - REQUEST_RECEIVED: Request received and validated
 * - PROCESSING: Request being processed
 * - SUCCESS: Operation completed successfully
 * - FAILED: Operation failed
 * - ERROR: Unexpected error occurred
 */
export enum APIStatus {
  REQUEST_RECEIVED = 'REQUEST_RECEIVED',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
}

/**
 * Behavior Evaluation API Request Type
 *
 * Represents the API request contract for behavior evaluation.
 *
 * Immutable:
 * Requests are immutable once created.
 */
export interface BehaviorEvaluationAPIRequest {
  /**
   * Unique identifier for this API request
   * Explicitly provided from API layer
   */
  requestId: string;

  /**
   * Dispatch ID to evaluate
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Behavior profile reference
   * Reference to behavior profile for evaluation
   */
  behaviorProfileRef: string;

  /**
   * Runtime outcome reference
   * Reference to the runtime outcome being evaluated
   */
  runtimeOutcomeRef: string;

  /**
   * Timestamp when request was created (milliseconds since epoch)
   * Explicitly provided from API layer
   */
  createdAt: number;
}

/**
 * Behavior Evaluation API Response Type
 *
 * Represents the API response contract for behavior evaluation.
 * References the complete evaluation result without duplication.
 *
 * Immutable:
 * Responses are immutable once created.
 */
export interface BehaviorEvaluationAPIResponse {
  /**
   * Request ID that triggered this response
   * Matches the original request ID
   */
  requestId: string;

  /**
   * Dispatch ID being evaluated
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Behavior profile reference
   * Reference to behavior profile evaluated
   */
  behaviorProfileRef: string;

  /**
   * Evaluation result reference
   * Reference to complete evaluation result in Layer 9
   */
  evaluationResultRef: string;

  /**
   * Final resolved disposition
   * The determined system behavior for this dispatch
   * Derived from evaluation verdicts
   */
  finalDisposition: DispatchBehaviorDisposition;

  /**
   * Trace reference for complete auditability
   * Reference to evaluation trace
   */
  traceRef: string;

  /**
   * API operation status
   * The status of the API operation itself
   */
  status: APIStatus;

  /**
   * Timestamp when response was created (milliseconds since epoch)
   * Explicitly provided from API layer
   */
  createdAt: number;

  /**
   * Timestamp when response was last updated (milliseconds since epoch)
   * Explicitly provided from API layer
   */
  updatedAt: number;
}

/**
 * Runtime Integration API Request Type
 *
 * Represents the API request contract for runtime integration.
 *
 * Immutable:
 * Requests are immutable once created.
 */
export interface RuntimeIntegrationAPIRequest {
  /**
   * Unique identifier for this API request
   * Explicitly provided from API layer
   */
  requestId: string;

  /**
   * Dispatch ID to integrate
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Runtime outcome reference
   * Reference to runtime outcome for integration
   */
  runtimeOutcomeRef: string;

  /**
   * Behavior profile reference
   * Reference to behavior profile for integration
   */
  behaviorProfileRef: string;

  /**
   * Timestamp when request was created (milliseconds since epoch)
   * Explicitly provided from API layer
   */
  createdAt: number;
}

/**
 * Runtime Integration API Response Type
 *
 * Represents the API response contract for runtime integration.
 * References the complete integration contract without duplication.
 *
 * Immutable:
 * Responses are immutable once created.
 */
export interface RuntimeIntegrationAPIResponse {
  /**
   * Request ID that triggered this response
   * Matches the original request ID
   */
  requestId: string;

  /**
   * Dispatch ID being integrated
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Integration contract reference
   * Reference to complete integration contract in Layer 9
   */
  integrationRef: string;

  /**
   * Runtime outcome reference
   * Reference to runtime outcome integrated
   */
  runtimeOutcomeRef: string;

  /**
   * Behavior profile reference
   * Reference to behavior profile used for integration
   */
  behaviorProfileRef: string;

  /**
   * Trace reference for complete auditability
   * Reference to integration trace
   */
  traceRef: string;

  /**
   * API operation status
   * The status of the API operation itself
   */
  status: APIStatus;

  /**
   * Timestamp when response was created (milliseconds since epoch)
   * Explicitly provided from API layer
   */
  createdAt: number;

  /**
   * Timestamp when response was last updated (milliseconds since epoch)
   * Explicitly provided from API layer
   */
  updatedAt: number;
}

/**
 * Behavior Snapshot API Request Type
 *
 * Represents the API request contract for snapshot creation.
 *
 * Immutable:
 * Requests are immutable once created.
 */
export interface BehaviorSnapshotAPIRequest {
  /**
   * Unique identifier for this API request
   * Explicitly provided from API layer
   */
  requestId: string;

  /**
   * Dispatch ID to snapshot
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Behavior profile reference
   * Reference to behavior profile for snapshot
   */
  behaviorProfileRef: string;

  /**
   * Evaluation result reference
   * Reference to evaluation result to snapshot
   */
  evaluationResultRef: string;

  /**
   * Integration reference
   * Reference to integration contract to snapshot
   */
  integrationRef: string;

  /**
   * Timestamp when request was created (milliseconds since epoch)
   * Explicitly provided from API layer
   */
  createdAt: number;
}

/**
 * Behavior Snapshot API Response Type
 *
 * Represents the API response contract for snapshot creation.
 * References the complete snapshot without duplication.
 *
 * Immutable:
 * Responses are immutable once created.
 */
export interface BehaviorSnapshotAPIResponse {
  /**
   * Request ID that triggered this response
   * Matches the original request ID
   */
  requestId: string;

  /**
   * Dispatch ID being snapshotted
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Snapshot reference
   * Reference to complete snapshot in Layer 9
   */
  snapshotRef: string;

  /**
   * Evaluation result reference
   * Reference to evaluation result in snapshot
   */
  evaluationResultRef: string;

  /**
   * Integration reference
   * Reference to integration contract in snapshot
   */
  integrationRef: string;

  /**
   * Trace reference for complete auditability
   * Reference to snapshot trace
   */
  traceRef: string;

  /**
   * API operation status
   * The status of the API operation itself
   */
  status: APIStatus;

  /**
   * Timestamp when response was created (milliseconds since epoch)
   * Explicitly provided from API layer
   */
  createdAt: number;

  /**
   * Timestamp when response was last updated (milliseconds since epoch)
   * Explicitly provided from API layer
   */
  updatedAt: number;
}
