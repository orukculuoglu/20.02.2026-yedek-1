/**
 * Fleet Normalization Read Model
 * 
 * Pure deterministic aggregate processor that creates a normalized data summary
 * from batch normalization results.
 * 
 * This read model:
 * - Takes a batch normalization result
 * - Extracts aggregate information only
 * - Returns deterministic operational insight
 * - Never exposes raw external records
 * - Never mutates inputs
 * - Never calls external systems
 * - Never emits events
 * - Remains fully deterministic
 */

import { FleetBatchNormalizationResult } from '../batch-normalization';

import {
  FleetNormalizationReadModel,
  FleetStatusDistribution,
  ExternalFleetOperationalStatus,
  ExternalFleetRentalStatus,
  ExternalFleetMaintenanceStatus,
} from './fleet-normalization-read-model.result';

/**
 * createFleetNormalizationReadModel
 * 
 * Pure deterministic aggregate processor for normalized fleet data.
 * 
 * Takes a batch normalization result and extracts aggregate information,
 * summarizing normalized vehicle data into fleet-level operational insight.
 * 
 * This is information extraction only - no business logic or validation
 * happens here. All data is read from normalized records in deterministic manner.
 * Processing is strictly deterministic given same input.
 * 
 * Determinism guarantees:
 * - All status distributions include fixed set of statuses in fixed order
 * - Count calculations are deterministic based on data matching
 * - No internal ID generation
 * - No internal timestamp generation
 * - No network calls
 * - No mutation of batch result
 * - No event emission
 * - Fully reproducible given same input
 * 
 * @param result - Batch normalization result with normalized records and rejected refs
 * @returns Aggregate normalized data read model
 */
export function createFleetNormalizationReadModel(
  result: FleetBatchNormalizationResult
): FleetNormalizationReadModel {
  // ============================================
  // A) BASIC COUNTS
  // ============================================

  const totalNormalizedRecords = result.normalizedRecords.length;
  const totalRejectedRecords = result.rejectedRefs.length;

  // ============================================
  // B) STATUS DISTRIBUTIONS
  // ============================================

  // Operational status distribution - fixed order
  const operationalStatusDistribution: FleetStatusDistribution<ExternalFleetOperationalStatus>[] =
    [
      ExternalFleetOperationalStatus.ACTIVE,
      ExternalFleetOperationalStatus.INACTIVE,
      ExternalFleetOperationalStatus.MAINTENANCE,
      ExternalFleetOperationalStatus.OUT_OF_SERVICE,
      ExternalFleetOperationalStatus.UNKNOWN,
    ].map((status) => ({
      status,
      count: result.normalizedRecords.filter(
        (record) => record.operationalStatus === status
      ).length,
    }));

  // Rental status distribution - fixed order
  const rentalStatusDistribution: FleetStatusDistribution<ExternalFleetRentalStatus>[] = [
    ExternalFleetRentalStatus.AVAILABLE,
    ExternalFleetRentalStatus.RENTED,
    ExternalFleetRentalStatus.RESERVED,
    ExternalFleetRentalStatus.BLOCKED,
    ExternalFleetRentalStatus.UNKNOWN,
  ].map((status) => ({
    status,
    count: result.normalizedRecords.filter(
      (record) => record.rentalStatus === status
    ).length,
  }));

  // Maintenance status distribution - fixed order
  const maintenanceStatusDistribution: FleetStatusDistribution<ExternalFleetMaintenanceStatus>[] =
    [
      ExternalFleetMaintenanceStatus.CLEAR,
      ExternalFleetMaintenanceStatus.DUE_SOON,
      ExternalFleetMaintenanceStatus.OVERDUE,
      ExternalFleetMaintenanceStatus.SERVICE_OPEN,
      ExternalFleetMaintenanceStatus.UNKNOWN,
    ].map((status) => ({
      status,
      count: result.normalizedRecords.filter(
        (record) => record.maintenanceStatus === status
      ).length,
    }));

  // ============================================
  // C) INCOMPLETE DESCRIPTIVE CONTEXT
  // ============================================

  const incompleteDescriptiveContextCount = result.normalizedRecords.filter(
    (record) =>
      !record.brand ||
      record.brand.trim() === '' ||
      !record.model ||
      record.model.trim() === '' ||
      !record.year ||
      record.year < 1900
  ).length;

  // ============================================
  // D) INVALID MILEAGE
  // ============================================

  const invalidMileageCount = result.normalizedRecords.filter(
    (record) =>
      record.currentMileage !== undefined &&
      record.currentMileage !== null &&
      record.currentMileage < 0
  ).length;

  // ============================================
  // E) RETURN AGGREGATE READ MODEL
  // ============================================

  return {
    totalNormalizedRecords,
    totalRejectedRecords,
    operationalStatusDistribution,
    rentalStatusDistribution,
    maintenanceStatusDistribution,
    incompleteDescriptiveContextCount,
    invalidMileageCount,
  };
}
