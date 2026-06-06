/**
 * Fleet Batch Normalization Runner Result
 * 
 * Defines result structures for batch normalization processing.
 */

import { FleetNormalizedVehicleRecord } from '../contracts';

/**
 * FleetBatchNormalizationStatus
 * 
 * Overall status of batch normalization run.
 */
export enum FleetBatchNormalizationStatus {
  /**
   * All records were successfully normalized.
   */
  COMPLETED = 'completed',

  /**
   * Some records were normalized, but some were rejected.
   */
  COMPLETED_WITH_REJECTIONS = 'completed-with-rejections',

  /**
   * No records were normalized. All were rejected or input was invalid.
   */
  FAILED = 'failed',

  /**
   * Input was empty (no external records provided).
   */
  EMPTY = 'empty',
}

/**
 * FleetBatchNormalizationRejectReason
 * 
 * Enum-based rejection reasons for individual records or entire batch.
 */
export enum FleetBatchNormalizationRejectReason {
  /**
   * normalizedRecordId is missing or empty at expected array index.
   */
  MISSING_NORMALIZED_RECORD_ID = 'missing-normalized-record-id',

  /**
   * tenantId is missing or empty in batch input.
   */
  MISSING_TENANT_ID = 'missing-tenant-id',

  /**
   * normalizedAt is missing or empty in batch input.
   */
  MISSING_NORMALIZED_AT = 'missing-normalized-at',
}

/**
 * FleetBatchNormalizationRejectedRef
 * 
 * Information about a rejected record with reason.
 */
export interface FleetBatchNormalizationRejectedRef {
  /**
   * The externalRecordRef from the rejected external record.
   * 
   * Identifies which external record was rejected.
   */
  externalRecordRef: string;

  /**
   * Enum-based reason why this record was rejected.
   */
  reason: FleetBatchNormalizationRejectReason;
}

/**
 * FleetBatchNormalizationResult
 * 
 * Complete result of batch normalization run.
 * 
 * Contains normalized records and structured rejection information.
 * No free-text messages or raw data.
 */
export interface FleetBatchNormalizationResult {
  /**
   * Overall status of the batch run.
   */
  status: FleetBatchNormalizationStatus;

  /**
   * Successfully normalized vehicle records.
   * 
   * Empty if no records were successfully normalized.
   */
  normalizedRecords: FleetNormalizedVehicleRecord[];

  /**
   * Rejected external record references with enum-based reasons.
   * 
   * Empty if all records were successfully normalized.
   */
  rejectedRefs: FleetBatchNormalizationRejectedRef[];
}
