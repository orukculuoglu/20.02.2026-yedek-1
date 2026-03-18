import {
  TraceStatus,
  SnapshotStatus,
  EvaluationTraceRecord,
  IntegrationTraceRecord,
  BehaviorTraceHookRecord,
  BehaviorSnapshotRecord,
} from './dispatch-behavior-snapshot-trace.types';

/**
 * Input contract for creating an evaluation trace record
 *
 * All parameters must be explicitly provided from trace layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateEvaluationTraceRecordInput {
  /**
   * Trace ID (explicitly provided, not generated)
   */
  traceId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Evaluation input reference
   */
  evaluationInputRef: string;

  /**
   * Evaluation result reference
   */
  evaluationResultRef: string;

  /**
   * Trace reference
   */
  traceRef: string;

  /**
   * Trace status
   */
  status: TraceStatus;

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
 * Input contract for creating an integration trace record
 *
 * All parameters must be explicitly provided from trace layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateIntegrationTraceRecordInput {
  /**
   * Trace ID (explicitly provided, not generated)
   */
  traceId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Runtime outcome reference
   */
  runtimeOutcomeRef: string;

  /**
   * Integration contract reference
   */
  integrationContractRef: string;

  /**
   * Trace reference
   */
  traceRef: string;

  /**
   * Trace status
   */
  status: TraceStatus;

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
 * Input contract for creating a behavior trace hook record
 *
 * All parameters must be explicitly provided from trace layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateBehaviorTraceHookRecordInput {
  /**
   * Trace hook ID (explicitly provided, not generated)
   */
  traceHookId: string;

  /**
   * Dispatch ID
   */
  dispatchId: string;

  /**
   * Source artifact reference
   */
  sourceRef: string;

  /**
   * Source artifact type
   */
  sourceType: string;

  /**
   * Target artifact reference
   */
  targetRef: string;

  /**
   * Target artifact type
   */
  targetType: string;

  /**
   * Trace reference
   */
  traceRef: string;

  /**
   * Trace hook status
   */
  status: TraceStatus;

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
 * Input contract for creating a behavior snapshot record
 *
 * All parameters must be explicitly provided from snapshot layer.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All parameters explicitly provided
 * - All timestamps explicit
 */
export interface CreateBehaviorSnapshotRecordInput {
  /**
   * Snapshot ID (explicitly provided, not generated)
   */
  snapshotId: string;

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
   * Trace reference
   */
  traceRef: string;

  /**
   * Snapshot status
   */
  status: SnapshotStatus;

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
 * Factory function to create an evaluation trace record
 *
 * Produces a deterministic trace record entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateEvaluationTraceRecordInput
 * @returns EvaluationTraceRecord - Immutable trace record object
 */
export function createEvaluationTraceRecord(
  input: CreateEvaluationTraceRecordInput
): EvaluationTraceRecord {
  return Object.freeze({
    traceId: input.traceId,
    dispatchId: input.dispatchId,
    evaluationInputRef: input.evaluationInputRef,
    evaluationResultRef: input.evaluationResultRef,
    traceRef: input.traceRef,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create an integration trace record
 *
 * Produces a deterministic trace record entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateIntegrationTraceRecordInput
 * @returns IntegrationTraceRecord - Immutable trace record object
 */
export function createIntegrationTraceRecord(
  input: CreateIntegrationTraceRecordInput
): IntegrationTraceRecord {
  return Object.freeze({
    traceId: input.traceId,
    dispatchId: input.dispatchId,
    runtimeOutcomeRef: input.runtimeOutcomeRef,
    integrationContractRef: input.integrationContractRef,
    traceRef: input.traceRef,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create a behavior trace hook record
 *
 * Produces a deterministic trace hook entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateBehaviorTraceHookRecordInput
 * @returns BehaviorTraceHookRecord - Immutable trace hook object
 */
export function createBehaviorTraceHookRecord(
  input: CreateBehaviorTraceHookRecordInput
): BehaviorTraceHookRecord {
  return Object.freeze({
    traceHookId: input.traceHookId,
    dispatchId: input.dispatchId,
    sourceRef: input.sourceRef,
    sourceType: input.sourceType,
    targetRef: input.targetRef,
    targetType: input.targetType,
    traceRef: input.traceRef,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create a behavior snapshot record
 *
 * Produces a deterministic snapshot entity with:
 * - All parameters explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateBehaviorSnapshotRecordInput
 * @returns BehaviorSnapshotRecord - Immutable snapshot object
 */
export function createBehaviorSnapshotRecord(
  input: CreateBehaviorSnapshotRecordInput
): BehaviorSnapshotRecord {
  return Object.freeze({
    snapshotId: input.snapshotId,
    dispatchId: input.dispatchId,
    behaviorProfileRef: input.behaviorProfileRef,
    evaluationResultRef: input.evaluationResultRef,
    integrationRef: input.integrationRef,
    traceRef: input.traceRef,
    status: input.status,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}
