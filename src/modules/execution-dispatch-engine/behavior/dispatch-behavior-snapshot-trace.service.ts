import {
  EvaluationTraceRecord,
  IntegrationTraceRecord,
  BehaviorTraceHookRecord,
  BehaviorSnapshotRecord,
  SnapshotStatus,
  TraceStatus,
} from './dispatch-behavior-snapshot-trace.types';

/**
 * Dispatch Behavior Snapshot / Trace Hook Service Contract
 *
 * Defines the pure domain contract (interface) for snapshot and trace hooks.
 *
 * Purpose:
 * This contract defines the snapshot and trace service surface without any implementation.
 * It specifies what inputs are needed and what snapshot/trace records are produced.
 * No logging, persistence, telemetry, or orchestration.
 *
 * Note:
 * This is a pure contract/interface definition only. Implementation is deferred.
 * No snapshot or trace logic defined here, only the input/output contract.
 */

/**
 * Behavior Snapshot / Trace Hook Service Contract
 *
 * Defines the surface contract for snapshot and trace hooks without implementation.
 *
 * Constraints:
 * - No implementation provided
 * - No persistence logic
 * - No logging logic
 * - No telemetry
 * - No orchestration
 * - No side effects
 * - Only contract definition
 */
export interface DispatchBehaviorSnapshotTraceService {
  /**
   * Create behavior snapshot
   *
   * Contracts:
   * - Input: Snapshot parameters
   * - Output: Behavior snapshot record with all references
   * - Pure assembly: No side effects, no persistence
   * - Deterministic: Same input always produces same output
   *
   * @param snapshotId - Snapshot ID
   * @param dispatchId - Dispatch ID
   * @param behaviorProfileRef - Behavior profile reference
   * @param evaluationResultRef - Evaluation result reference
   * @param integrationRef - Integration reference
   * @param traceRef - Trace reference
   * @param status - Snapshot status
   * @param createdAt - Creation timestamp
   * @param updatedAt - Update timestamp
   * @returns Behavior snapshot record
   */
  createBehaviorSnapshot(
    snapshotId: string,
    dispatchId: string,
    behaviorProfileRef: string,
    evaluationResultRef: string,
    integrationRef: string,
    traceRef: string,
    status: SnapshotStatus,
    createdAt: number,
    updatedAt: number
  ): BehaviorSnapshotRecord;

  /**
   * Create behavior trace hook
   *
   * Contracts:
   * - Input: Trace hook parameters
   * - Output: Behavior trace hook record linking artifacts
   * - Pure assembly: No side effects, no logging
   * - Deterministic: Same input always produces same output
   *
   * @param traceHookId - Trace hook ID
   * @param dispatchId - Dispatch ID
   * @param sourceRef - Source artifact reference
   * @param sourceType - Source artifact type
   * @param targetRef - Target artifact reference
   * @param targetType - Target artifact type
   * @param traceRef - Trace reference
   * @param status - Trace hook status
   * @param createdAt - Creation timestamp
   * @param updatedAt - Update timestamp
   * @returns Behavior trace hook record
   */
  createBehaviorTraceHook(
    traceHookId: string,
    dispatchId: string,
    sourceRef: string,
    sourceType: string,
    targetRef: string,
    targetType: string,
    traceRef: string,
    status: TraceStatus,
    createdAt: number,
    updatedAt: number
  ): BehaviorTraceHookRecord;

  /**
   * Create evaluation trace record
   *
   * Contracts:
   * - Input: Evaluation trace parameters
   * - Output: Evaluation trace record
   * - Pure assembly: No side effects, no recording
   * - Deterministic: Same input always produces same output
   *
   * @param traceId - Trace ID
   * @param dispatchId - Dispatch ID
   * @param evaluationInputRef - Evaluation input reference
   * @param evaluationResultRef - Evaluation result reference
   * @param traceRef - Trace reference
   * @param status - Trace status
   * @param createdAt - Creation timestamp
   * @param updatedAt - Update timestamp
   * @returns Evaluation trace record
   */
  createEvaluationTrace(
    traceId: string,
    dispatchId: string,
    evaluationInputRef: string,
    evaluationResultRef: string,
    traceRef: string,
    status: TraceStatus,
    createdAt: number,
    updatedAt: number
  ): EvaluationTraceRecord;

  /**
   * Create integration trace record
   *
   * Contracts:
   * - Input: Integration trace parameters
   * - Output: Integration trace record
   * - Pure assembly: No side effects, no recording
   * - Deterministic: Same input always produces same output
   *
   * @param traceId - Trace ID
   * @param dispatchId - Dispatch ID
   * @param runtimeOutcomeRef - Runtime outcome reference
   * @param integrationContractRef - Integration contract reference
   * @param traceRef - Trace reference
   * @param status - Trace status
   * @param createdAt - Creation timestamp
   * @param updatedAt - Update timestamp
   * @returns Integration trace record
   */
  createIntegrationTrace(
    traceId: string,
    dispatchId: string,
    runtimeOutcomeRef: string,
    integrationContractRef: string,
    traceRef: string,
    status: TraceStatus,
    createdAt: number,
    updatedAt: number
  ): IntegrationTraceRecord;
}
