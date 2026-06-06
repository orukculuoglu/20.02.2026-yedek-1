/**
 * Fleet Normalization Result Contract
 * 
 * Defines the contract for normalization operation results.
 * 
 * A normalization result represents the outcome of normalizing one or more
 * external fleet records. It contains references to accepted records,
 * rejected records, and any issues encountered.
 * 
 * Containers for safe references only:
 * - Accepted records embedded (full normalized vehicle records)
 * - Rejected records as external references only
 * - Issues as ID references only
 * 
 * Contract-only: contains no runtime normalization logic.
 */

import type {
  FleetNormalizedVehicleRecord,
} from './fleet-normalized-vehicle.contract';
import type {
  FleetNormalizationIssue,
} from './fleet-normalization-issue.contract';

/**
 * FleetNormalizationResultStatus
 * 
 * Overall status of a normalization operation.
 */
export enum FleetNormalizationResultStatus {
  /** All records successfully normalized and accepted */
  SUCCESS = 'success',
  
  /** Records accepted but with non-critical issues present */
  SUCCESS_WITH_WARNINGS = 'success-with-warnings',
  
  /** Operation failed, no records accepted */
  FAILED = 'failed',
  
  /** Operation quarantined due to critical issues, manual review required */
  QUARANTINED = 'quarantined',
}

/**
 * FleetNormalizationResult
 * 
 * Result container for a normalization operation.
 * 
 * This represents the complete outcome of normalizing one or more external
 * fleet records. It contains:
 * - Accepted normalized records (full records, safe for use)
 * - Rejected record references (safe external references only)
 * - Issues detected (issue IDs only, no free-text)
 * 
 * The result is designed to be safe for logging, storage, and transmission
 * without exposing sensitive external data.
 * 
 * Security:
 * - Accepted records are normalized and safe for use
 * - Rejected records are referenced by external ID only
 * - Issues are referenced by issue ID only, no free-text messages
 * - No direct sensitive vehicle identities
 * 
 * Timestamps:
 * - createdAt: when normalization operation completed (caller-provided)
 * 
 * Traceability:
 * - Linked to connector via connectorId
 * - Linked to sync operation via syncId (if applicable)
 * - Linked to tenant via tenantId
 */
export interface FleetNormalizationResult {
  /**
   * Unique identifier for this normalization result.
   * 
   * Generated internally to track this specific normalization operation outcome.
   * Used for auditing and correlation.
   */
  resultId: string;
  
  /**
   * Connector ID that performed the normalization.
   * 
   * Links to FleetConnectorConfig.
   * Identifies which connector produced this result.
   */
  connectorId: string;
  
  /**
   * Sync operation ID this result is part of (optional).
   * 
   * May be absent for ad-hoc or non-sync normalization operations.
   * Links to FleetExternalSyncRecord if applicable.
   * Used to correlate with broader sync operations.
   */
  syncId?: string;
  
  /**
   * Tenant identifier for multi-tenant isolation.
   * 
   * Required for access control and data partitioning.
   */
  tenantId: string;
  
  /**
   * Fleet identifier from connector context (optional).
   * 
   * May be absent for single-fleet connector configurations.
   */
  fleetId?: string;
  
  /**
   * Overall result status.
   * 
   * Indicates whether normalization succeeded and if issues were present.
   */
  status: FleetNormalizationResultStatus;
  
  /**
   * Normalized vehicle records that were accepted.
   * 
   * These records are safe for use by Fleet Rental intelligence,
   * readiness analysis, service routing, and outcome tracking.
   * 
   * Each record is a full FleetNormalizedVehicleRecord with all fields.
   * Records may have status of ACCEPTED or ACCEPTED_WITH_WARNINGS.
   * 
   * May be empty if no records were accepted.
   */
  acceptedRecords: FleetNormalizedVehicleRecord[];
  
  /**
   * References to external records that were rejected.
   * 
   * Contains only the externalRecordRef values of rejected records.
   * Does NOT contain full record data.
   * 
   * Used for:
   * - Identifying which external records failed normalization
   * - Preventing duplicate processing attempts
   * - Audit trail of rejections
   * 
   * May be empty if all records were accepted.
   */
  rejectedRecordRefs: string[];
  
  /**
   * References to issues detected during normalization.
   * 
   * Contains only the issueId values of detected issues.
   * Does NOT contain full issue details or free-text messages.
   * 
   * Issues are tracked separately in the normalization issue storage.
   * Use issueId to correlate with FleetNormalizationIssue records.
   * 
   * May be empty if no issues were detected.
   */
  issueRefs: string[];
  
  /**
   * ISO 8601 timestamp when this normalization operation completed.
   * 
   * Caller-provided, not generated locally.
   * Used to track age of normalization and detect stale results.
   * 
   * Format: "2024-01-15T10:30:00Z" or "2024-01-15T10:30:00+02:00"
   */
  createdAt: string;
}
