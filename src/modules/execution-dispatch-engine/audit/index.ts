/**
 * Dispatch Audit Module
 *
 * Layer 8: Audit Core - Snapshot, Log & Deterministic Audit Model
 *
 * This module provides the audit core foundation for dispatch execution history
 * preservation and traceability. It defines deterministic snapshots and logs for
 * audit trails without requiring persistence or replay engine implementation.
 *
 * Exports:
 * - Deterministic snapshot and log level enums
 * - Snapshot contract capturing point-in-time state
 * - Log entry contract for audit trail entries
 * - Audit record contract combining snapshots and logs
 * - Factory functions for creating and updating audit artifacts
 *
 * Constraints:
 * - No Date.now() - all timestamps explicit from audit boundaries
 * - No Math.random() - fully deterministic
 * - No hidden clock access - all state transitions explicit
 * - Immutable construction - Object.freeze() on all artifacts
 * - All IDs explicit - no generation
 * - Pure deterministic state - no side effects
 *
 * Lifecycle:
 * This phase establishes the audit core foundation only.
 * It does NOT implement:
 * - Persistence
 * - Replay engine
 * - Analytics
 * - API handlers
 * - Background processing
 *
 * Next phases will build on this foundation to add persistence,
 * audit traceability, replay diagnostics, and analytics capabilities.
 */

export {
  DispatchSnapshotStatus,
  DispatchLogLevel,
} from './dispatch-snapshot.enums';

export type { DispatchSnapshot } from './dispatch-snapshot.types';

export type { DispatchLogEntry } from './dispatch-log.types';

export type { DispatchAuditRecord } from './dispatch-audit.types';

export {
  createDispatchSnapshot,
  updateDispatchSnapshotStatus,
  createDispatchLogEntry,
  createDispatchAuditRecord,
  type CreateDispatchSnapshotInput,
  type UpdateDispatchSnapshotStatusInput,
  type CreateDispatchLogEntryInput,
  type CreateDispatchAuditRecordInput,
} from './dispatch-audit.entity';
