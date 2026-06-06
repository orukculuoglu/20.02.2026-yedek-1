/**
 * Fleet Normalization Read Model Result
 * 
 * Defines aggregate read model structures for normalized vehicle data.
 */

import {
  ExternalFleetOperationalStatus,
  ExternalFleetRentalStatus,
  ExternalFleetMaintenanceStatus,
} from '../contracts';

export {
  ExternalFleetOperationalStatus,
  ExternalFleetRentalStatus,
  ExternalFleetMaintenanceStatus,
} from '../contracts';

/**
 * FleetStatusDistribution<T>
 * 
 * Generic status count with fixed type parameter for specific status enums.
 * 
 * Represents a single status and the count of records matching it.
 */
export interface FleetStatusDistribution<T extends string> {
  /**
   * The status value from the normalized record.
   */
  status: T;

  /**
   * The count of normalized records with this status.
   * 
   * Zero if no records have this status.
   */
  count: number;
}

/**
 * FleetNormalizationReadModel
 * 
 * Aggregate read model for normalized fleet vehicle data.
 * 
 * Contains aggregate-only information extracted from normalized records.
 * No raw record arrays. No free-text fields. No external update fields.
 * 
 * Summary of normalization result providing fleet-level operational insight.
 */
export interface FleetNormalizationReadModel {
  /**
   * Total count of successfully normalized records.
   */
  totalNormalizedRecords: number;

  /**
   * Total count of rejected external records.
   */
  totalRejectedRecords: number;

  /**
   * Operational status distribution across all normalized records.
   * 
   * Always includes all possible ExternalFleetOperationalStatus values
   * in deterministic fixed order: ACTIVE, INACTIVE, MAINTENANCE, OUT_OF_SERVICE, UNKNOWN.
   * 
   * Each status has a count of matching records (zero if no matches).
   */
  operationalStatusDistribution: FleetStatusDistribution<ExternalFleetOperationalStatus>[];

  /**
   * Rental status distribution across all normalized records.
   * 
   * Always includes all possible ExternalFleetRentalStatus values
   * in deterministic fixed order: AVAILABLE, RENTED, RESERVED, BLOCKED, UNKNOWN.
   * 
   * Each status has a count of matching records (zero if no matches).
   */
  rentalStatusDistribution: FleetStatusDistribution<ExternalFleetRentalStatus>[];

  /**
   * Maintenance status distribution across all normalized records.
   * 
   * Always includes all possible ExternalFleetMaintenanceStatus values
   * in deterministic fixed order: CLEAR, DUE_SOON, OVERDUE, SERVICE_OPEN, UNKNOWN.
   * 
   * Each status has a count of matching records (zero if no matches).
   */
  maintenanceStatusDistribution: FleetStatusDistribution<ExternalFleetMaintenanceStatus>[];

  /**
   * Count of records with incomplete descriptive context.
   * 
   * A record is incomplete if brand, model, or year is missing.
   */
  incompleteDescriptiveContextCount: number;

  /**
   * Count of records with invalid mileage.
   * 
   * A record has invalid mileage if currentMileage is less than 0.
   */
  invalidMileageCount: number;
}
