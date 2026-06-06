/**
 * Fleet Normalization Insight Model Result
 *
 * Defines high-level operational insight structures derived from normalized data.
 */

/**
 * FleetNormalizationInsightLevel
 *
 * Five-point scale for evaluating fleet health dimensions.
 *
 * - good: no issues detected
 * - watch: minor issues present that may need monitoring
 * - warning: notable issues that should be addressed soon
 * - critical: severe issues requiring immediate attention
 * - unknown: insufficient data to assess
 */
export enum FleetNormalizationInsightLevel {
  Good = 'good',
  Watch = 'watch',
  Warning = 'warning',
  Critical = 'critical',
  Unknown = 'unknown',
}

/**
 * FleetNormalizationInsightCode
 *
 * Specific operational findings from normalized data analysis.
 *
 * - normalization-healthy: no issues detected in normalization
 * - rejected-records-present: external records failed normalization
 * - incomplete-context-present: normalized records missing descriptor data
 * - invalid-mileage-present: normalized records with negative mileage
 * - blocked-rental-presence: rental status blocked records present
 * - maintenance-pressure-present: maintenance issues detected
 * - low-availability: insufficient available vehicles
 * - mixed-operational-state: vehicles in non-active operational states
 * - no-normalized-records: zero normalized records in dataset
 */
export enum FleetNormalizationInsightCode {
  NormalizationHealthy = 'normalization-healthy',
  RejectedRecordsPresent = 'rejected-records-present',
  IncompleteContextPresent = 'incomplete-context-present',
  InvalidMileagePresent = 'invalid-mileage-present',
  BlockedRentalPresence = 'blocked-rental-presence',
  MaintenancePressurePresent = 'maintenance-pressure-present',
  LowAvailability = 'low-availability',
  MixedOperationalState = 'mixed-operational-state',
  NoNormalizedRecords = 'no-normalized-records',
}

/**
 * FleetNormalizationInsightItem
 *
 * Single operational finding with severity and related count.
 *
 * Provides insight code, severity level, and count of affected records.
 */
export interface FleetNormalizationInsightItem {
  /**
   * Specific operational finding code.
   */
  code: FleetNormalizationInsightCode;

  /**
   * Severity level for this finding.
   */
  level: FleetNormalizationInsightLevel;

  /**
   * Count of affected records or related metric.
   *
   * Meaning depends on code:
   * - rejected-records-present: number of rejected records
   * - incomplete-context-present: number of incomplete records
   * - invalid-mileage-present: number of invalid mileage records
   * - blocked-rental-presence: number of blocked records
   * - maintenance-pressure-present: number of maintenance issues
   * - low-availability: number of unavailable records
   * - mixed-operational-state: number of non-active operational state records
   */
  count: number;
}

/**
 * FleetNormalizationInsightModel
 *
 * High-level operational insight derived from normalized aggregate data.
 *
 * Contains multi-dimensional health assessment of fleet normalization:
 * - Data quality (completeness, validity, rejection rate)
 * - Operational availability (active vs non-active vehicles)
 * - Maintenance pressure (upcoming or overdue maintenance)
 * - Rental availability (available vs unavailable vehicles)
 * - Overall health (synthesis of all dimensions)
 *
 * No raw record arrays. No free-text fields. No external update fields.
 * Aggregate insight only. No IDs. No timestamps.
 */
export interface FleetNormalizationInsightModel {
  /**
   * Overall normalized data health from all dimensions.
   *
   * Highest severity level across all health dimensions.
   * - critical: any dimension is critical
   * - warning: any dimension is warning (none critical)
   * - watch: any dimension is watch (none critical/warning)
   * - good: all dimensions are good or only normalization-healthy insight exists
   * - unknown: zero normalized records with no other condition
   */
  overallHealth: FleetNormalizationInsightLevel;

  /**
   * Data quality assessment based on rejection rate and validity.
   *
   * - critical: zero normalized records
   * - warning: rejected records exist OR invalid mileage exists
   * - watch: incomplete descriptive context exists
   * - good: all data complete and valid
   */
  dataQualityLevel: FleetNormalizationInsightLevel;

  /**
   * Operational availability of active vehicles.
   *
   * - unknown: zero normalized records
   * - critical: zero active records
   * - warning: out-of-service records exist OR maintenance count > active count
   * - watch: maintenance records exist OR inactive records exist
   * - good: majority are active and available
   */
  operationalAvailabilityLevel: FleetNormalizationInsightLevel;

  /**
   * Maintenance workload and urgency.
   *
   * - unknown: zero normalized records
   * - critical: overdue or service-open issues exist
   * - watch: due-soon maintenance items exist
   * - good: maintenance clear or minimal
   */
  maintenancePressureLevel: FleetNormalizationInsightLevel;

  /**
   * Vehicle availability for rental.
   *
   * - unknown: zero normalized records
   * - critical: zero available vehicles
   * - warning: blocked vehicles exist
   * - watch: rented vehicles exceed available vehicles
   * - good: sufficient vehicles available
   */
  rentalAvailabilityLevel: FleetNormalizationInsightLevel;

  /**
   * Detailed operational findings array.
   *
   * Deterministic insight items in fixed order.
   * Each item represents a specific operational condition with severity.
   */
  insights: FleetNormalizationInsightItem[];
}
