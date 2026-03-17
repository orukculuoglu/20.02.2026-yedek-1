/**
 * Dispatch Snapshot Status Enum
 *
 * Defines the lifecycle status of a dispatch snapshot artifact.
 *
 * Status progression:
 * - CREATED: Snapshot record initialized
 * - CAPTURED: Snapshot has been filled with runtime and tracking data
 * - ARCHIVED: Snapshot has been archived for long-term storage/audit
 */
export enum DispatchSnapshotStatus {
  CREATED = 'CREATED',
  CAPTURED = 'CAPTURED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Dispatch Log Level Enum
 *
 * Defines the severity/importance level of a log entry in the audit trail.
 *
 * Levels:
 * - INFO: Informational message about normal dispatch operations
 * - WARNING: Cautionary message indicating potential issues or state changes
 * - ERROR: Error message indicating failures or exceptional conditions
 */
export enum DispatchLogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}
