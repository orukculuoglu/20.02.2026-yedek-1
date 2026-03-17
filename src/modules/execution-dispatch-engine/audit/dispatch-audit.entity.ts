import { DispatchSnapshotStatus, DispatchLogLevel } from './dispatch-snapshot.enums';
import { DispatchSnapshot } from './dispatch-snapshot.types';
import { DispatchLogEntry } from './dispatch-log.types';
import { DispatchAuditRecord } from './dispatch-audit.types';
import { DispatchRuntimeStatus } from '../runtime';
import { DispatchDeliveryStatus, DispatchAckStatus } from '../tracking';

/**
 * Input contract for creating a new DispatchSnapshot
 *
 * All timestamps and IDs must be explicitly provided from audit boundaries.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All IDs explicitly provided
 * - All timestamps explicitly provided
 */
export interface CreateDispatchSnapshotInput {
  /**
   * Snapshot ID (explicitly provided, not generated)
   */
  snapshotId: string;

  /**
   * The dispatch intent ID
   */
  dispatchId: string;

  /**
   * The runtime aggregate ID
   */
  runtimeAggregateId: string;

  /**
   * The tracking record ID
   */
  trackingId: string;

  /**
   * Summary of the snapshot
   */
  summary: string;

  /**
   * Runtime status being captured
   */
  runtimeStatus: DispatchRuntimeStatus;

  /**
   * Delivery status being captured
   */
  deliveryStatus: DispatchDeliveryStatus;

  /**
   * Acknowledgement status being captured
   */
  ackStatus: DispatchAckStatus;

  /**
   * Timestamp of creation (explicitly provided from audit layer)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided from audit layer)
   */
  updatedAt: number;
}

/**
 * Input contract for updating a DispatchSnapshot status
 *
 * Used to transition a snapshot to a new status state.
 *
 * Constraints:
 * - No mutation of original snapshot
 * - No Date.now() - new timestamp explicit
 * - Produces new immutable object
 */
export interface UpdateDispatchSnapshotStatusInput {
  /**
   * The existing snapshot to update
   */
  snapshot: DispatchSnapshot;

  /**
   * New snapshot status
   */
  newStatus: DispatchSnapshotStatus;

  /**
   * Updated summary
   */
  summary: string;

  /**
   * Timestamp of update (explicitly provided, no Date.now())
   */
  updatedAt: number;
}

/**
 * Input contract for creating a new DispatchLogEntry
 *
 * All timestamps and IDs must be explicitly provided from audit boundaries.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All IDs explicitly provided
 * - All timestamps explicitly provided
 */
export interface CreateDispatchLogEntryInput {
  /**
   * Log entry ID (explicitly provided, not generated)
   */
  logEntryId: string;

  /**
   * The dispatch intent ID
   */
  dispatchId: string;

  /**
   * The runtime aggregate ID
   */
  runtimeAggregateId: string;

  /**
   * The tracking record ID
   */
  trackingId: string;

  /**
   * Log level severity
   */
  level: DispatchLogLevel;

  /**
   * Log entry message
   */
  message: string;

  /**
   * Contextual data (optional)
   */
  context: Record<string, unknown>;

  /**
   * Timestamp of creation (explicitly provided from audit layer)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided from audit layer)
   */
  updatedAt: number;
}

/**
 * Input contract for creating a new DispatchAuditRecord
 *
 * All timestamps and IDs must be explicitly provided from audit boundaries.
 *
 * Constraints:
 * - No mutation of input
 * - No Date.now() calls
 * - All IDs explicitly provided
 * - All timestamps explicitly provided
 */
export interface CreateDispatchAuditRecordInput {
  /**
   * Audit record ID (explicitly provided, not generated)
   */
  auditRecordId: string;

  /**
   * The dispatch snapshot to include
   */
  snapshot: DispatchSnapshot;

  /**
   * The log entries to include
   */
  logs: readonly DispatchLogEntry[];

  /**
   * Timestamp of creation (explicitly provided from audit layer)
   */
  createdAt: number;

  /**
   * Timestamp of last update (explicitly provided from audit layer)
   */
  updatedAt: number;
}

/**
 * Factory function to create a DispatchSnapshot
 *
 * Produces a deterministic snapshot entity with:
 * - snapshotStatus set to CREATED
 * - All IDs and timestamps explicit from input
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateDispatchSnapshotInput
 * @returns DispatchSnapshot - Immutable snapshot object
 */
export function createDispatchSnapshot(
  input: CreateDispatchSnapshotInput
): DispatchSnapshot {
  return Object.freeze({
    snapshotId: input.snapshotId,
    dispatchId: input.dispatchId,
    runtimeAggregateId: input.runtimeAggregateId,
    trackingId: input.trackingId,
    snapshotStatus: DispatchSnapshotStatus.CREATED,
    summary: input.summary,
    runtimeStatus: input.runtimeStatus,
    deliveryStatus: input.deliveryStatus,
    ackStatus: input.ackStatus,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Update DispatchSnapshot status deterministically
 *
 * Produces a new immutable snapshot with updated status.
 *
 * Constraints:
 * - No mutation of original snapshot
 * - Immutable spread pattern
 * - All timestamps explicit
 * - Pure deterministic update only
 *
 * @param input - UpdateDispatchSnapshotStatusInput
 * @returns DispatchSnapshot - New immutable snapshot object
 */
export function updateDispatchSnapshotStatus(
  input: UpdateDispatchSnapshotStatusInput
): DispatchSnapshot {
  return Object.freeze({
    ...input.snapshot,
    snapshotStatus: input.newStatus,
    summary: input.summary,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create a DispatchLogEntry
 *
 * Produces a deterministic log entry entity with:
 * - All IDs and timestamps explicit from input
 * - Context frozen (immutable)
 * - No input mutation
 * - Pure deterministic object creation only
 *
 * @param input - CreateDispatchLogEntryInput
 * @returns DispatchLogEntry - Immutable log entry object
 */
export function createDispatchLogEntry(
  input: CreateDispatchLogEntryInput
): DispatchLogEntry {
  return Object.freeze({
    logEntryId: input.logEntryId,
    dispatchId: input.dispatchId,
    runtimeAggregateId: input.runtimeAggregateId,
    trackingId: input.trackingId,
    level: input.level,
    message: input.message,
    context: Object.freeze({ ...input.context }),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

/**
 * Factory function to create a DispatchAuditRecord
 *
 * Produces a deterministic audit record entity that combines snapshot and logs.
 *
 * Constraints:
 * - No Date.now() - timestamps explicitly provided
 * - No Math.random() - no randomness
 * - No input mutation - creates new object
 * - All IDs explicit
 * - All timestamps explicit
 * - Logs array frozen (immutable)
 * - Pure deterministic assembly only
 *
 * @param input - CreateDispatchAuditRecordInput
 * @returns DispatchAuditRecord - Immutable audit record object
 */
export function createDispatchAuditRecord(
  input: CreateDispatchAuditRecordInput
): DispatchAuditRecord {
  return Object.freeze({
    auditRecordId: input.auditRecordId,
    snapshot: input.snapshot,
    logs: Object.freeze([...input.logs]),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}
