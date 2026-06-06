/**
 * Fleet Batch Normalization Runner
 * 
 * Pure deterministic batch processor that transforms external fleet vehicle records
 * into safe normalized internal records.
 * 
 * This runner:
 * - Takes an array of external fleet vehicle records
 * - Performs safe shape transformation for each record
 * - Returns normalized records and rejected refs structurally
 * - Never generates IDs or timestamps
 * - Never mutates inputs
 * - Never calls external systems
 * - Never emits events
 * - Remains fully deterministic
 */

import { normalizeExternalFleetVehicleRecord } from '../normalization';

import {
  FleetBatchNormalizationRuntimeInput,
  FleetBatchNormalizationResult,
  FleetBatchNormalizationStatus,
  FleetBatchNormalizationRejectReason,
  FleetBatchNormalizationRejectedRef,
} from './fleet-batch-normalization-runner.result';

/**
 * runFleetBatchNormalization
 * 
 * Pure deterministic batch processor for external to normalized transformation.
 * 
 * Takes an array of external fleet vehicle records and transforms them into
 * normalized internal records with caller-provided contextual information.
 * 
 * This is batch shape transformation only - no business logic or validation
 * happens here. All operational statuses are passed through as-is without
 * modification. Processing is strictly deterministic given same input.
 * 
 * Determinism guarantees:
 * - normalizedRecordIds are caller-provided, used in order
 * - normalizedAt is caller-provided, used as-is
 * - tenantId is caller-provided, used as-is
 * - fleetId is caller-provided if present, used as-is
 * - No internal ID generation
 * - No internal timestamp generation
 * - No network calls
 * - No mutation of external records array
 * - No mutation of normalizedRecordIds array
 * - No event emission
 * - Fully reproducible given same input
 * 
 * @param input - Batch runtime input with external records and caller-provided context
 * @returns Batch normalization result with status, normalized records, and rejected refs
 */
export function runFleetBatchNormalization(
  input: FleetBatchNormalizationRuntimeInput
): FleetBatchNormalizationResult {
  const {
    externalRecords,
    normalizedRecordIds,
    tenantId,
    fleetId,
    normalizedAt,
  } = input;

  // ============================================
  // A) EMPTY INPUT CHECK
  // ============================================

  if (!externalRecords || externalRecords.length === 0) {
    return {
      status: FleetBatchNormalizationStatus.EMPTY,
      normalizedRecords: [],
      rejectedRefs: [],
    };
  }

  // ============================================
  // B) GLOBAL REQUIRED CONTEXT VALIDATION
  // ============================================

  // Check tenantId
  if (!tenantId || tenantId.trim() === '') {
    const rejectedRefs: FleetBatchNormalizationRejectedRef[] = externalRecords.map(
      (record) => ({
        externalRecordRef: record.externalRecordRef || '',
        reason: FleetBatchNormalizationRejectReason.MISSING_TENANT_ID,
      })
    );

    return {
      status: FleetBatchNormalizationStatus.FAILED,
      normalizedRecords: [],
      rejectedRefs,
    };
  }

  // Check normalizedAt
  if (!normalizedAt || normalizedAt.trim() === '') {
    const rejectedRefs: FleetBatchNormalizationRejectedRef[] = externalRecords.map(
      (record) => ({
        externalRecordRef: record.externalRecordRef || '',
        reason: FleetBatchNormalizationRejectReason.MISSING_NORMALIZED_AT,
      })
    );

    return {
      status: FleetBatchNormalizationStatus.FAILED,
      normalizedRecords: [],
      rejectedRefs,
    };
  }

  // ============================================
  // C) PER-RECORD PROCESSING
  // ============================================

  const normalizedRecords = [];
  const rejectedRefs: FleetBatchNormalizationRejectedRef[] = [];

  for (let index = 0; index < externalRecords.length; index++) {
    const externalRecord = externalRecords[index];
    const normalizedRecordId = normalizedRecordIds[index];

    // Check if normalizedRecordId is available and non-empty
    if (!normalizedRecordId || normalizedRecordId.trim() === '') {
      rejectedRefs.push({
        externalRecordRef: externalRecord.externalRecordRef || '',
        reason:
          FleetBatchNormalizationRejectReason.MISSING_NORMALIZED_RECORD_ID,
      });
      continue;
    }

    // Normalize the record using the pure mapper
    const normalizedRecord = normalizeExternalFleetVehicleRecord({
      externalRecord,
      normalizedRecordId,
      tenantId,
      fleetId,
      normalizedAt,
    });

    normalizedRecords.push(normalizedRecord);
  }

  // ============================================
  // D) STATUS CALCULATION
  // ============================================

  let status: FleetBatchNormalizationStatus;

  if (normalizedRecords.length > 0 && rejectedRefs.length === 0) {
    status = FleetBatchNormalizationStatus.COMPLETED;
  } else if (normalizedRecords.length > 0 && rejectedRefs.length > 0) {
    status = FleetBatchNormalizationStatus.COMPLETED_WITH_REJECTIONS;
  } else if (normalizedRecords.length === 0 && rejectedRefs.length > 0) {
    status = FleetBatchNormalizationStatus.FAILED;
  } else {
    // Should not reach here (empty input already handled)
    status = FleetBatchNormalizationStatus.EMPTY;
  }

  return {
    status,
    normalizedRecords,
    rejectedRefs,
  };
}
