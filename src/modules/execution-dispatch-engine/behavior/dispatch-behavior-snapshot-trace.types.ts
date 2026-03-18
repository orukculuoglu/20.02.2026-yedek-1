/**
 * Dispatch Behavior Snapshot / Trace Hook Types
 *
 * Models the explicit domain contracts for behavior snapshot and trace hooks
 * without implementing logging, persistence, or telemetry.
 *
 * Purpose:
 * Snapshot and trace contracts define how Layer 9 behavior evaluation and
 * integration are recorded for auditability and traceability, separate from
 * persistence or observability implementations.
 * Provides deterministic snapshot and trace contracts only.
 */

/**
 * Trace Status Enum
 *
 * Represents the status of a trace hook record.
 *
 * States:
 * - CREATED: Trace hook record created
 * - RECORDED: Trace information recorded
 * - LINKED: Trace linked to related records
 * - COMPLETE: Trace recording complete
 */
export enum TraceStatus {
  CREATED = 'CREATED',
  RECORDED = 'RECORDED',
  LINKED = 'LINKED',
  COMPLETE = 'COMPLETE',
}

/**
 * Snapshot Status Enum
 *
 * Represents the status of a behavior snapshot.
 *
 * States:
 * - CREATED: Snapshot record created
 * - MATERIALIZED: Snapshot data materialized
 * - ARCHIVED: Snapshot archived
 * - COMPLETE: Snapshot processing complete
 */
export enum SnapshotStatus {
  CREATED = 'CREATED',
  MATERIALIZED = 'MATERIALIZED',
  ARCHIVED = 'ARCHIVED',
  COMPLETE = 'COMPLETE',
}

/**
 * Evaluation Trace Record Type
 *
 * Represents a trace record for behavior evaluation.
 *
 * Immutable:
 * Evaluation trace records are immutable once created.
 */
export interface EvaluationTraceRecord {
  /**
   * Unique identifier for this evaluation trace
   * Explicitly provided from trace layer
   */
  traceId: string;

  /**
   * Dispatch ID being traced
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Evaluation input reference
   * Reference to the evaluation input being traced
   */
  evaluationInputRef: string;

  /**
   * Evaluation result reference
   * Reference to the evaluation result produced
   */
  evaluationResultRef: string;

  /**
   * Trace reference for auditability
   * Reference for full trace chain
   */
  traceRef: string;

  /**
   * Current trace status
   * The state of the evaluation trace
   */
  status: TraceStatus;

  /**
   * Timestamp when trace was created (milliseconds since epoch)
   * Explicitly provided from trace layer
   */
  createdAt: number;

  /**
   * Timestamp when trace was last updated (milliseconds since epoch)
   * Explicitly provided from trace layer
   */
  updatedAt: number;
}

/**
 * Integration Trace Record Type
 *
 * Represents a trace record for runtime-behavior integration.
 *
 * Immutable:
 * Integration trace records are immutable once created.
 */
export interface IntegrationTraceRecord {
  /**
   * Unique identifier for this integration trace
   * Explicitly provided from trace layer
   */
  traceId: string;

  /**
   * Dispatch ID being traced
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Runtime outcome reference
   * Reference to the runtime outcome being integrated
   */
  runtimeOutcomeRef: string;

  /**
   * Integration contract reference
   * Reference to the integration contract produced
   */
  integrationContractRef: string;

  /**
   * Trace reference for auditability
   * Reference for full trace chain
   */
  traceRef: string;

  /**
   * Current trace status
   * The state of the integration trace
   */
  status: TraceStatus;

  /**
   * Timestamp when trace was created (milliseconds since epoch)
   * Explicitly provided from trace layer
   */
  createdAt: number;

  /**
   * Timestamp when trace was last updated (milliseconds since epoch)
   * Explicitly provided from trace layer
   */
  updatedAt: number;
}

/**
 * Behavior Trace Hook Record Type
 *
 * Represents a trace hook between two layers.
 *
 * Immutable:
 * Trace hooks are immutable once created.
 */
export interface BehaviorTraceHookRecord {
  /**
   * Unique identifier for this trace hook
   * Explicitly provided from trace layer
   */
  traceHookId: string;

  /**
   * Dispatch ID being traced
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Source artifact reference
   * Reference to the source artifact in trace chain
   */
  sourceRef: string;

  /**
   * Source artifact type
   * Classification of source artifact (outcome, profile, evaluation, etc.)
   * String classification
   */
  sourceType: string;

  /**
   * Target artifact reference
   * Reference to the target artifact in trace chain
   */
  targetRef: string;

  /**
   * Target artifact type
   * Classification of target artifact (input, result, contract, etc.)
   * String classification
   */
  targetType: string;

  /**
   * Trace reference for auditability
   * Reference for full trace chain
   */
  traceRef: string;

  /**
   * Current trace hook status
   * The state of the trace hook
   */
  status: TraceStatus;

  /**
   * Timestamp when trace hook was created (milliseconds since epoch)
   * Explicitly provided from trace layer
   */
  createdAt: number;

  /**
   * Timestamp when trace hook was last updated (milliseconds since epoch)
   * Explicitly provided from trace layer
   */
  updatedAt: number;
}

/**
 * Behavior Snapshot Record Type
 *
 * Represents a complete behavior snapshot at a point in time.
 *
 * Immutable:
 * Snapshots are immutable once created.
 */
export interface BehaviorSnapshotRecord {
  /**
   * Unique identifier for this snapshot
   * Explicitly provided from snapshot layer
   */
  snapshotId: string;

  /**
   * Dispatch ID being snapshotted
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * Behavior profile reference
   * Reference to the behavior profile in snapshot
   */
  behaviorProfileRef: string;

  /**
   * Evaluation result reference
   * Reference to the evaluation result in snapshot
   */
  evaluationResultRef: string;

  /**
   * Integration reference
   * Reference to the integration contract in snapshot
   */
  integrationRef: string;

  /**
   * Trace reference for auditability
   * Reference for complete trace chain
   */
  traceRef: string;

  /**
   * Current snapshot status
   * The state of the snapshot
   */
  status: SnapshotStatus;

  /**
   * Timestamp when snapshot was created (milliseconds since epoch)
   * Explicitly provided from snapshot layer
   */
  createdAt: number;

  /**
   * Timestamp when snapshot was last updated (milliseconds since epoch)
   * Explicitly provided from snapshot layer
   */
  updatedAt: number;
}
