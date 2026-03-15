import { WorkflowLogEntry, WorkflowLogEventType, WorkflowLogSnapshot } from './workflow-log.types';

/**
 * Build a deterministic log entry from explicit parameters.
 *
 * Constructs a complete log entry with:
 * - Unique identifier
 * - Event timestamp
 * - Event type classification
 * - Runtime state snapshot
 * - Descriptive message
 * - Optional metadata for additional context
 *
 * No Date.now() calls or random ID generation.
 * All values are explicit inputs.
 *
 * @param logId - Unique log entry identifier
 * @param timestamp - When the log entry was created
 * @param eventType - Type of workflow event
 * @param snapshot - Runtime state snapshot
 * @param message - Human-readable event description
 * @param metadata - Optional additional context data
 * @returns WorkflowLogEntry with all required fields
 *
 * Guarantees:
 * - All parameters are explicitly provided (no defaults)
 * - No internal timestamp generation
 * - No random ID generation
 * - Pure function, no side effects
 * - Production-safe contract
 */
export function buildWorkflowLogEntry(
  logId: string,
  timestamp: number,
  eventType: WorkflowLogEventType,
  snapshot: WorkflowLogSnapshot,
  message: string,
  metadata?: Record<string, unknown>,
): WorkflowLogEntry {
  return {
    logId,
    timestamp,
    eventType,
    snapshot,
    message,
    metadata,
  };
}
