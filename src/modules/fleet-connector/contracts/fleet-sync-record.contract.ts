/**
 * Fleet Sync Record Contract
 * 
 * Defines the contract for fleet connector synchronization records.
 * 
 * Tracks the state and outcome of each data ingestion event from
 * an external fleet system.
 * 
 * Scope:
 * - Inbound only (read from external system)
 * - Inbound synchronization pattern
 * - Tracks partial imports, warnings, and errors
 */

/**
 * FleetSyncDirection
 * 
 * Direction of data flow for synchronization.
 * Only inbound is supported in this phase.
 */
export enum FleetSyncDirection {
  /** Data flows FROM external system INTO our system */
  INBOUND = 'inbound',
}

/**
 * FleetSyncStatus
 * 
 * Overall status of a synchronization event.
 */
export enum FleetSyncStatus {
  /** Sync record created, not yet started */
  CREATED = 'created',
  
  /** Sync is currently in progress */
  RUNNING = 'running',
  
  /** Sync completed successfully, all records processed */
  COMPLETED = 'completed',
  
  /** Sync completed, but some records had warnings (partial success) */
  COMPLETED_WITH_WARNINGS = 'completed-with-warnings',
  
  /** Sync failed and did not complete */
  FAILED = 'failed',
  
  /** Sync was cancelled before completion */
  CANCELLED = 'cancelled',
}

/**
 * FleetSyncErrorCode
 * 
 * Classification of sync failures.
 * Helps diagnose and troubleshoot connector issues.
 */
export enum FleetSyncErrorCode {
  /** External system not reachable */
  CONNECTOR_UNAVAILABLE = 'connector-unavailable',
  
  /** Authentication or authorization failed */
  AUTHORIZATION_FAILED = 'authorization-failed',
  
  /** Scope denied: requested data access not permitted */
  SCOPE_DENIED = 'scope-denied',
  
  /** Received data in unexpected format */
  INVALID_FORMAT = 'invalid-format',
  
  /** Data normalization failed (data quality issue) */
  NORMALIZATION_FAILED = 'normalization-failed',
  
  /** Some records imported, some failed (partial import) */
  PARTIAL_IMPORT = 'partial-import',
  
  /** Other/unknown error */
  UNKNOWN = 'unknown',
}

/**
 * FleetExternalSyncRecord
 * 
 * Audit and tracking record for one synchronization event.
 * 
 * Used for:
 * - Auditing connector activity
 * - Diagnosing sync failures
 * - Tracking partial imports
 * - Monitoring data quality
 * 
 * Security:
 * - No credential information
 * - Only summary counts and status
 * 
 * Timestamps:
 * - Caller-provided (ISO 8601 format expected)
 * - Timestamps supplied externally, not generated
 */
export interface FleetExternalSyncRecord {
  /** Unique identifier for this sync event */
  syncId: string;
  
  /** ID of the connector that performed this sync */
  connectorId: string;
  
  /** Tenant ID for multi-tenant tracking */
  tenantId: string;
  
  /** Fleet ID (optional, for multi-fleet connectors) */
  fleetId?: string;
  
  /** Direction: always inbound in this version */
  syncDirection: FleetSyncDirection;
  
  /** Current status of sync */
  syncStatus: FleetSyncStatus;
  
  /**
   * ISO 8601 timestamp when sync started.
   * Caller-provided.
   */
  syncStartedAt: string;
  
  /**
   * ISO 8601 timestamp when sync completed.
   * Optional (only set when status is COMPLETED* or FAILED).
   * Caller-provided.
   */
  syncCompletedAt?: string;
  
  /** Number of vehicle records successfully imported */
  importedVehicleCount: number;
  
  /** Number of contract records successfully imported */
  importedContractCount: number;
  
  /** Number of records rejected during import (data quality, validation failures) */
  rejectedRecordCount: number;
  
  /** Number of warnings encountered (data quality issues that didn't prevent import) */
  warningCount: number;
  
  /**
   * Error code if sync failed.
   * Only set if syncStatus is FAILED or CANCELLED.
   */
  errorCode?: FleetSyncErrorCode;
}
