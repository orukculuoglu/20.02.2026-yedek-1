/**
 * Fleet Normalization Mapper
 * 
 * Pure deterministic mapper that transforms external fleet vehicle records
 * into safe normalized internal records.
 * 
 * This mapper:
 * - Takes an external fleet vehicle record
 * - Performs safe shape transformation
 * - Returns a normalized internal record
 * - Never generates IDs or timestamps
 * - Never mutates inputs
 * - Never calls external systems
 * - Never emits events
 * - Remains fully deterministic
 */

import {
  FleetNormalizedVehicleRecord,
  FleetNormalizedVehicleSource,
  FleetNormalizedRecordStatus,
} from '../contracts';

import { FleetNormalizationMapperRuntimeInput } from './fleet-normalization-mapper.input';

/**
 * normalizeExternalFleetVehicleRecord
 * 
 * Pure deterministic mapper for external to normalized transformation.
 * 
 * Takes an external fleet vehicle record and transforms it into a
 * normalized internal record with caller-provided contextual information.
 * 
 * This is shape transformation only - no business logic or validation
 * happens here. All operational statuses are passed through as-is
 * without modification.
 * 
 * Determinism guarantees:
 * - normalizedRecordId is caller-provided, used as-is
 * - normalizedAt is caller-provided, used as-is
 * - tenantId is caller-provided, used as-is
 * - fleetId is caller-provided if present, used as-is
 * - No internal ID generation
 * - No internal timestamp generation
 * - No network calls
 * - No mutation of external record
 * - No event emission
 * - Fully reproducible given same input
 * 
 * @param input - Mapper runtime input with external record and caller-provided context
 * @returns Normalized vehicle record
 */
export function normalizeExternalFleetVehicleRecord(
  input: FleetNormalizationMapperRuntimeInput
): FleetNormalizedVehicleRecord {
  const {
    externalRecord,
    normalizedRecordId,
    tenantId,
    fleetId,
    normalizedAt,
  } = input;

  // ============================================
  // NORMALIZATION TRANSFORMATION
  // ============================================

  // Determine normalization status based on required fields
  const status: FleetNormalizedRecordStatus =
    externalRecord.connectorId &&
    externalRecord.connectorId.trim() !== '' &&
    externalRecord.externalRecordRef &&
    externalRecord.externalRecordRef.trim() !== ''
      ? FleetNormalizedRecordStatus.ACCEPTED
      : FleetNormalizedRecordStatus.REJECTED;

  // Create normalized vehicle record
  const normalizedRecord: FleetNormalizedVehicleRecord = {
    normalizedRecordId,
    connectorId: externalRecord.connectorId,
    fleetId,
    tenantId,
    externalRecordRef: externalRecord.externalRecordRef,
    source: FleetNormalizedVehicleSource.CONNECTOR,
    status,
    brand: externalRecord.brand,
    model: externalRecord.model,
    year: externalRecord.year,
    currentMileage: externalRecord.currentMileage,
    operationalStatus: externalRecord.operationalStatus,
    rentalStatus: externalRecord.rentalStatus,
    maintenanceStatus: externalRecord.maintenanceStatus,
    normalizedAt,
    sourceUpdatedAt: externalRecord.lastUpdatedAt,
    internalOnlyPlateRef: externalRecord.internalOnlyPlateRef,
  };

  return normalizedRecord;
}
