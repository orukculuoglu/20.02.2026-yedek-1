import { DispatchLogLevel } from './dispatch-snapshot.enums';

/**
 * Dispatch Log Entry Type
 *
 * Represents a single entry in the dispatch audit trail.
 *
 * A log entry captures:
 * - References to dispatch, runtime aggregate, and tracking record
 * - Severity level of the logged event
 * - Message describing the event
 * - Contextual data related to the event
 * - Explicit timestamps for audit ordering
 *
 * Purpose:
 * Log entries form a chronological audit trail of dispatch execution events.
 * They provide traceability and diagnostic information for debugging and auditing
 * dispatch execution without requiring persistence implementation.
 *
 * Multiple log entries may be created for a single dispatch as it progresses
 * through its lifecycle, providing a complete execution history.
 */
export interface DispatchLogEntry {
  /**
   * Unique identifier for this log entry
   * Explicitly provided, not generated
   */
  logEntryId: string;

  /**
   * The dispatch intent referenced in this log entry
   * Reused from dispatch domain layer
   */
  dispatchId: string;

  /**
   * The runtime aggregate ID referenced in this log entry
   * Links to the execution-ready artifact
   */
  runtimeAggregateId: string;

  /**
   * The tracking record ID referenced in this log entry
   * Links to the delivery tracking artifact
   */
  trackingId: string;

  /**
   * Severity/importance level of this log entry
   * Must be one of DispatchLogLevel enum values
   */
  level: DispatchLogLevel;

  /**
   * Human-readable message describing the logged event
   * Provides primary context for understanding the event
   */
  message: string;

  /**
   * Optional structured context data related to this log entry
   * Contains key-value pairs providing additional diagnostic information
   * Examples: error details, state transitions, actor responses, etc.
   */
  context: Record<string, unknown>;

  /**
   * Timestamp when this log entry was created (milliseconds since epoch)
   * Explicitly provided from audit boundaries, no Date.now() calls
   */
  createdAt: number;

  /**
   * Timestamp when this log entry was last updated (milliseconds since epoch)
   * Explicitly provided from audit boundaries, no hidden calculations
   */
  updatedAt: number;
}
