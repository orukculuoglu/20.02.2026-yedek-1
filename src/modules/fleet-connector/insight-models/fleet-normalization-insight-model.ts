/**
 * Fleet Normalization Insight Model
 *
 * Pure deterministic transformer that creates high-level operational insight
 * from normalized aggregate data.
 *
 * This insight model:
 * - Consumes FleetNormalizationReadModel (aggregate data)
 * - Derives five health dimensions
 * - Generates deterministic operational insights
 * - Returns synthesis of all findings
 * - Never exposes raw external records
 * - Never mutates inputs
 * - Never calls external systems
 * - Never emits events
 * - Remains fully deterministic
 */

import { FleetNormalizationReadModel } from '../read-models';

import {
  ExternalFleetOperationalStatus,
  ExternalFleetRentalStatus,
  ExternalFleetMaintenanceStatus,
} from '../contracts';

import {
  FleetNormalizationInsightModel,
  FleetNormalizationInsightItem,
  FleetNormalizationInsightLevel,
  FleetNormalizationInsightCode,
} from './fleet-normalization-insight-model.result';

/**
 * createFleetNormalizationInsightModel
 *
 * Pure deterministic insight transformer for normalized aggregate data.
 *
 * Takes a normalized data summary and derives multi-dimensional operational
 * insight, assessing data quality, operational availability, maintenance
 * pressure, rental availability, and overall health.
 *
 * This is information extraction and synthesis only - no business logic
 * beyond aggregating data into insight levels. Processing is strictly
 * deterministic given same input.
 *
 * Determinism guarantees:
 * - All levels derived from fixed aggregate counts
 * - Insights always generated in fixed order
 * - No internal ID generation
 * - No internal timestamp generation
 * - No network calls
 * - No mutation of read model
 * - No event emission
 * - Fully reproducible given same input
 *
 * @param readModel - Normalized aggregate data summary
 * @returns Multi-dimensional operational insight model
 */
export function createFleetNormalizationInsightModel(
  readModel: FleetNormalizationReadModel
): FleetNormalizationInsightModel {
  // ============================================
  // A) HELPER: Read counts from distributions
  // ============================================

  // Operational status counts - from fixed distribution array
  const operationalCounts = {
    active:
      readModel.operationalStatusDistribution.find(
        (d) => d.status === ExternalFleetOperationalStatus.ACTIVE
      )?.count ?? 0,
    inactive:
      readModel.operationalStatusDistribution.find(
        (d) => d.status === ExternalFleetOperationalStatus.INACTIVE
      )?.count ?? 0,
    maintenance:
      readModel.operationalStatusDistribution.find(
        (d) => d.status === ExternalFleetOperationalStatus.MAINTENANCE
      )?.count ?? 0,
    outOfService:
      readModel.operationalStatusDistribution.find(
        (d) => d.status === ExternalFleetOperationalStatus.OUT_OF_SERVICE
      )?.count ?? 0,
    unknown:
      readModel.operationalStatusDistribution.find(
        (d) => d.status === ExternalFleetOperationalStatus.UNKNOWN
      )?.count ?? 0,
  };

  // Rental status counts - from fixed distribution array
  const rentalCounts = {
    available:
      readModel.rentalStatusDistribution.find(
        (d) => d.status === ExternalFleetRentalStatus.AVAILABLE
      )?.count ?? 0,
    rented:
      readModel.rentalStatusDistribution.find(
        (d) => d.status === ExternalFleetRentalStatus.RENTED
      )?.count ?? 0,
    reserved:
      readModel.rentalStatusDistribution.find(
        (d) => d.status === ExternalFleetRentalStatus.RESERVED
      )?.count ?? 0,
    blocked:
      readModel.rentalStatusDistribution.find(
        (d) => d.status === ExternalFleetRentalStatus.BLOCKED
      )?.count ?? 0,
    unknown:
      readModel.rentalStatusDistribution.find(
        (d) => d.status === ExternalFleetRentalStatus.UNKNOWN
      )?.count ?? 0,
  };

  // Maintenance status counts - from fixed distribution array
  const maintenanceCounts = {
    clear:
      readModel.maintenanceStatusDistribution.find(
        (d) => d.status === ExternalFleetMaintenanceStatus.CLEAR
      )?.count ?? 0,
    dueSoon:
      readModel.maintenanceStatusDistribution.find(
        (d) => d.status === ExternalFleetMaintenanceStatus.DUE_SOON
      )?.count ?? 0,
    overdue:
      readModel.maintenanceStatusDistribution.find(
        (d) => d.status === ExternalFleetMaintenanceStatus.OVERDUE
      )?.count ?? 0,
    serviceOpen:
      readModel.maintenanceStatusDistribution.find(
        (d) => d.status === ExternalFleetMaintenanceStatus.SERVICE_OPEN
      )?.count ?? 0,
    unknown:
      readModel.maintenanceStatusDistribution.find(
        (d) => d.status === ExternalFleetMaintenanceStatus.UNKNOWN
      )?.count ?? 0,
  };

  // ============================================
  // B) DATA QUALITY LEVEL
  // ============================================

  let dataQualityLevel: FleetNormalizationInsightLevel;

  if (readModel.totalNormalizedRecords === 0) {
    dataQualityLevel = FleetNormalizationInsightLevel.Critical;
  } else if (
    readModel.totalRejectedRecords > 0 ||
    readModel.invalidMileageCount > 0
  ) {
    dataQualityLevel = FleetNormalizationInsightLevel.Warning;
  } else if (readModel.incompleteDescriptiveContextCount > 0) {
    dataQualityLevel = FleetNormalizationInsightLevel.Watch;
  } else {
    dataQualityLevel = FleetNormalizationInsightLevel.Good;
  }

  // ============================================
  // C) OPERATIONAL AVAILABILITY LEVEL
  // ============================================

  let operationalAvailabilityLevel: FleetNormalizationInsightLevel;

  if (readModel.totalNormalizedRecords === 0) {
    operationalAvailabilityLevel = FleetNormalizationInsightLevel.Unknown;
  } else if (operationalCounts.active === 0) {
    operationalAvailabilityLevel = FleetNormalizationInsightLevel.Critical;
  } else if (
    operationalCounts.outOfService > 0 ||
    operationalCounts.maintenance > operationalCounts.active
  ) {
    operationalAvailabilityLevel = FleetNormalizationInsightLevel.Warning;
  } else if (
    operationalCounts.maintenance > 0 ||
    operationalCounts.inactive > 0
  ) {
    operationalAvailabilityLevel = FleetNormalizationInsightLevel.Watch;
  } else {
    operationalAvailabilityLevel = FleetNormalizationInsightLevel.Good;
  }

  // ============================================
  // D) MAINTENANCE PRESSURE LEVEL
  // ============================================

  let maintenancePressureLevel: FleetNormalizationInsightLevel;

  if (readModel.totalNormalizedRecords === 0) {
    maintenancePressureLevel = FleetNormalizationInsightLevel.Unknown;
  } else if (maintenanceCounts.overdue > 0 || maintenanceCounts.serviceOpen > 0) {
    maintenancePressureLevel = FleetNormalizationInsightLevel.Critical;
  } else if (maintenanceCounts.dueSoon > 0) {
    maintenancePressureLevel = FleetNormalizationInsightLevel.Watch;
  } else {
    maintenancePressureLevel = FleetNormalizationInsightLevel.Good;
  }

  // ============================================
  // E) RENTAL AVAILABILITY LEVEL
  // ============================================

  let rentalAvailabilityLevel: FleetNormalizationInsightLevel;

  if (readModel.totalNormalizedRecords === 0) {
    rentalAvailabilityLevel = FleetNormalizationInsightLevel.Unknown;
  } else if (rentalCounts.available === 0) {
    rentalAvailabilityLevel = FleetNormalizationInsightLevel.Critical;
  } else if (rentalCounts.blocked > 0) {
    rentalAvailabilityLevel = FleetNormalizationInsightLevel.Warning;
  } else if (rentalCounts.rented > rentalCounts.available) {
    rentalAvailabilityLevel = FleetNormalizationInsightLevel.Watch;
  } else {
    rentalAvailabilityLevel = FleetNormalizationInsightLevel.Good;
  }

  // ============================================
  // F) BUILD INSIGHTS ARRAY
  // ============================================

  const insights: FleetNormalizationInsightItem[] = [];

  // Insert insights in fixed deterministic order

  // 1) no-normalized-records
  if (readModel.totalNormalizedRecords === 0) {
    insights.push({
      code: FleetNormalizationInsightCode.NoNormalizedRecords,
      level: FleetNormalizationInsightLevel.Critical,
      count: 0,
    });
  }

  // 2) rejected-records-present
  if (readModel.totalRejectedRecords > 0) {
    insights.push({
      code: FleetNormalizationInsightCode.RejectedRecordsPresent,
      level: FleetNormalizationInsightLevel.Warning,
      count: readModel.totalRejectedRecords,
    });
  }

  // 3) incomplete-context-present
  if (readModel.incompleteDescriptiveContextCount > 0) {
    insights.push({
      code: FleetNormalizationInsightCode.IncompleteContextPresent,
      level: FleetNormalizationInsightLevel.Watch,
      count: readModel.incompleteDescriptiveContextCount,
    });
  }

  // 4) invalid-mileage-present
  if (readModel.invalidMileageCount > 0) {
    insights.push({
      code: FleetNormalizationInsightCode.InvalidMileagePresent,
      level: FleetNormalizationInsightLevel.Warning,
      count: readModel.invalidMileageCount,
    });
  }

  // 5) blocked-rental-presence
  if (rentalCounts.blocked > 0) {
    insights.push({
      code: FleetNormalizationInsightCode.BlockedRentalPresence,
      level: FleetNormalizationInsightLevel.Warning,
      count: rentalCounts.blocked,
    });
  }

  // 6) maintenance-pressure-present
  const totalMaintenancePressure =
    maintenanceCounts.overdue +
    maintenanceCounts.serviceOpen +
    maintenanceCounts.dueSoon;
  if (totalMaintenancePressure > 0) {
    insights.push({
      code: FleetNormalizationInsightCode.MaintenancePressurePresent,
      level:
        maintenanceCounts.overdue > 0 || maintenanceCounts.serviceOpen > 0
          ? FleetNormalizationInsightLevel.Critical
          : FleetNormalizationInsightLevel.Watch,
      count: totalMaintenancePressure,
    });
  }

  // 7) low-availability
  if (
    rentalCounts.available === 0 ||
    operationalCounts.active === 0
  ) {
    insights.push({
      code: FleetNormalizationInsightCode.LowAvailability,
      level: FleetNormalizationInsightLevel.Critical,
      count: rentalCounts.available === 0 ? rentalCounts.available : operationalCounts.active,
    });
  }

  // 8) mixed-operational-state
  const nonActiveOperationalCount =
    operationalCounts.inactive +
    operationalCounts.maintenance +
    operationalCounts.outOfService +
    operationalCounts.unknown;
  if (nonActiveOperationalCount > 0) {
    insights.push({
      code: FleetNormalizationInsightCode.MixedOperationalState,
      level: FleetNormalizationInsightLevel.Watch,
      count: nonActiveOperationalCount,
    });
  }

  // 9) normalization-healthy (only if no other insights)
  if (insights.length === 0) {
    insights.push({
      code: FleetNormalizationInsightCode.NormalizationHealthy,
      level: FleetNormalizationInsightLevel.Good,
      count: readModel.totalNormalizedRecords,
    });
  }

  // ============================================
  // G) DETERMINE OVERALL HEALTH
  // ============================================

  let overallHealth: FleetNormalizationInsightLevel;

  // Find highest severity level across all insights
  const hasInsightLevel = (level: FleetNormalizationInsightLevel) =>
    insights.some((insight) => insight.level === level);

  if (hasInsightLevel(FleetNormalizationInsightLevel.Critical)) {
    overallHealth = FleetNormalizationInsightLevel.Critical;
  } else if (hasInsightLevel(FleetNormalizationInsightLevel.Warning)) {
    overallHealth = FleetNormalizationInsightLevel.Warning;
  } else if (hasInsightLevel(FleetNormalizationInsightLevel.Watch)) {
    overallHealth = FleetNormalizationInsightLevel.Watch;
  } else if (
    insights.length === 1 &&
    insights[0].code === FleetNormalizationInsightCode.NormalizationHealthy
  ) {
    overallHealth = FleetNormalizationInsightLevel.Good;
  } else {
    overallHealth = FleetNormalizationInsightLevel.Unknown;
  }

  // ============================================
  // H) RETURN INSIGHT MODEL
  // ============================================

  return {
    overallHealth,
    dataQualityLevel,
    operationalAvailabilityLevel,
    maintenancePressureLevel,
    rentalAvailabilityLevel,
    insights,
  };
}
