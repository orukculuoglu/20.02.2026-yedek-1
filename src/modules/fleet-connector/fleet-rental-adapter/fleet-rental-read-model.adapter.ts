/**
 * Fleet Rental Read Model Adapter
 *
 * Translates FleetRental domain model (vehicles, contracts) to Fleet Connector read model.
 *
 * Aggregates current vehicle and contract state into read-only insight model.
 * No mutations. No API calls. No React. No UI dependencies.
 */

import type { Vehicle, RentalContract } from '../../../../types/fleetRental';
import type { FleetNormalizationReadModel } from '../read-models';
import {
  ExternalFleetOperationalStatus,
  ExternalFleetRentalStatus,
  ExternalFleetMaintenanceStatus,
} from '../contracts/fleet-external-record.contract';

/**
 * Input data for read-model derivation
 */
export interface FleetRentalReadModelAdapterInput {
  vehicles: ReadonlyArray<Vehicle>;
  contracts: ReadonlyArray<RentalContract>;
}

/**
 * Derive a fleet normalization read model from FleetRental state
 *
 * @param input - FleetRental vehicles and contracts
 * @returns Fleet Connector read model with aggregated normalization data
 */
export function deriveFleetNormalizationReadModelFromFleetRental(
  input: FleetRentalReadModelAdapterInput
): FleetNormalizationReadModel {
  const { vehicles, contracts } = input;

  const totalNormalizedRecords = vehicles.length;
  const totalRejectedRecords = 0; // Current data has no explicit rejection tracking

  // Incomplete descriptive context: missing brand or model (year is optional)
  const incompleteDescriptiveContextCount = vehicles.filter(v => {
    const hasBrand = !!(v as any).brand;
    const hasModel = !!(v as any).model;
    return !hasBrand || !hasModel;
  }).length;

  // Invalid mileage: negative currentMileage
  const invalidMileageCount = vehicles.filter(v => v.currentMileage < 0).length;

  // Normalize vehicle status to enum value
  const normalizeOperationalStatus = (value: string | undefined): ExternalFleetOperationalStatus => {
    const normalized = String(value ?? '').toLowerCase();
    if (normalized === 'active') return ExternalFleetOperationalStatus.ACTIVE;
    if (normalized === 'inactive') return ExternalFleetOperationalStatus.INACTIVE;
    if (normalized === 'maintenance') return ExternalFleetOperationalStatus.MAINTENANCE;
    if (normalized === 'out_of_service' || normalized === 'out-of-service') return ExternalFleetOperationalStatus.OUT_OF_SERVICE;
    return ExternalFleetOperationalStatus.UNKNOWN;
  };

  // Operational status distribution
  const operationalStatusDistribution = [
    ExternalFleetOperationalStatus.ACTIVE,
    ExternalFleetOperationalStatus.INACTIVE,
    ExternalFleetOperationalStatus.MAINTENANCE,
    ExternalFleetOperationalStatus.OUT_OF_SERVICE,
    ExternalFleetOperationalStatus.UNKNOWN,
  ].map(status => ({
    status,
    count: vehicles.filter(v => normalizeOperationalStatus(v.status) === status).length,
  }));

  // Rental status distribution (based on active contracts)
  const rentalStatusDistribution = [
    ExternalFleetRentalStatus.AVAILABLE,
    ExternalFleetRentalStatus.RENTED,
    ExternalFleetRentalStatus.RESERVED,
    ExternalFleetRentalStatus.BLOCKED,
    ExternalFleetRentalStatus.UNKNOWN,
  ].map(status => {
    let count = 0;
    if (status === ExternalFleetRentalStatus.RENTED) {
      count = vehicles.filter(v =>
        contracts.some(c => c.vehicleId === v.vehicleId && c.status === 'ACTIVE')
      ).length;
    } else if (status === ExternalFleetRentalStatus.AVAILABLE) {
      count = vehicles.filter(v =>
        normalizeOperationalStatus(v.status) === ExternalFleetOperationalStatus.ACTIVE &&
        !contracts.some(c => c.vehicleId === v.vehicleId && c.status === 'ACTIVE')
      ).length;
    }
    return {
      status,
      count,
    };
  });

  // Maintenance status distribution (based on status and risk)
  const maintenanceStatusDistribution = [
    ExternalFleetMaintenanceStatus.CLEAR,
    ExternalFleetMaintenanceStatus.DUE_SOON,
    ExternalFleetMaintenanceStatus.OVERDUE,
    ExternalFleetMaintenanceStatus.SERVICE_OPEN,
    ExternalFleetMaintenanceStatus.UNKNOWN,
  ].map(status => {
    let count = 0;
    if (status === ExternalFleetMaintenanceStatus.OVERDUE) {
      count = vehicles.filter(v => normalizeOperationalStatus(v.status) === ExternalFleetOperationalStatus.MAINTENANCE).length;
    } else if (status === ExternalFleetMaintenanceStatus.DUE_SOON) {
      count = vehicles.filter(v => (v as any).maintenanceSignal === 'scheduled').length;
    } else if (status === ExternalFleetMaintenanceStatus.CLEAR) {
      count = vehicles.filter(v =>
        normalizeOperationalStatus(v.status) === ExternalFleetOperationalStatus.ACTIVE &&
        !(v as any).maintenanceSignal &&
        v.currentMileage < 50000
      ).length;
    }
    return {
      status,
      count,
    };
  });

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
