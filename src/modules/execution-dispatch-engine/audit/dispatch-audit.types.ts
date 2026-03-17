import { DispatchSnapshot } from './dispatch-snapshot.types';
import { DispatchLogEntry } from './dispatch-log.types';

/**
 * Dispatch Audit Record Type
 *
 * Represents the complete deterministic audit artifact for a dispatch execution state.
 *
 * An audit record combines:
 * - A snapshot capturing the dispatch state at a specific moment
 * - A collection of log entries providing the audit trail for that state
 *
 * Purpose:
 * The audit record serves as the primary artifact for audit trails, traceability,
 * and future replay-safe diagnostics. It provides a complete view of dispatch
 * execution state and history in an immutable, audit-safe form.
 *
 * Multiple audit records may be created for a single dispatch as it progresses
 * through its lifecycle, each representing a snapshot at a different point in time.
 */
export interface DispatchAuditRecord {
  /**
   * Unique identifier for this audit record
   * Explicitly provided, not generated
   */
  auditRecordId: string;

  /**
   * The dispatch snapshot captured in this audit record
   * Contains point-in-time state from runtime, tracking, and ack layers
   */
  snapshot: DispatchSnapshot;

  /**
   * The audit trail of log entries for this dispatch
   * Provides chronological record of all events leading to the snapshot state
   * Readonly to maintain immutability of the audit record
   */
  readonly logs: readonly DispatchLogEntry[];

  /**
   * Timestamp when this audit record was created (milliseconds since epoch)
   * Explicitly provided from audit boundaries, no Date.now() calls
   */
  createdAt: number;

  /**
   * Timestamp when this audit record was last updated (milliseconds since epoch)
   * Explicitly provided from audit boundaries, no hidden calculations
   */
  updatedAt: number;
}
