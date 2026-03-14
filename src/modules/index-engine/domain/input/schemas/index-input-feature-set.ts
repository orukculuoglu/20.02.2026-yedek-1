/**
 * IndexInputFeatureSet contains normalized, calculator-ready features.
 * Preprocesses raw evidence into features that calculators expect.
 * All features are optional but recommended for specific index types.
 */
export interface IndexInputFeatureSet {
  /**
   * Count of repeated failures or fault patterns (if applicable)
   * Used in RELIABILITY_INDEX and MAINTENANCE_INDEX calculations
   */
  repeatedFailureCount?: number;

  /**
   * Number of days maintenance is overdue or delayed
   * Used in MAINTENANCE_INDEX calculations
   */
  maintenanceDelayDays?: number;

  /**
   * Count of unresolved signals from Vehicle Intelligence Graph
   * Used in all index calculations for signal importance assessment
   */
  unresolvedSignalCount?: number;

  /**
   * Measure of data source variety (0.0 - 1.0)
   * Higher = more diverse sources = higher confidence
   * Used in DATA_QUALITY_INDEX and confidence calculations
   */
  sourceDiversity?: number;

  /**
   * Recency score for latest events/signals (0.0 - 1.0)
   * 1.0 = very recent, 0.0 = very old
   * Used in determining data freshness impact
   */
  eventRecencyScore?: number;

  /**
   * Weighted evidence score incorporating trust levels (0.0 - 1.0)
   * Pre-calculated from graph trust metrics
   * Used in INSURANCE_RISK_INDEX and OPERATIONAL_READINESS_INDEX
   */
  trustWeightedEvidenceScore?: number;

  /**
   * Provenance strength metric (0.0 - 1.0)
   * Measures depth and reliability of data lineage
   * Used in DATA_QUALITY_INDEX
   */
  provenanceStrength?: number;

  /**
   * Component utilization rate (0.0 - 1.0) if applicable
   * 1.0 = fully utilized, 0.0 = not utilized
   * Used in RELIABILITY_INDEX and MAINTENANCE_INDEX
   */
  utilizationRate?: number;

  /**
   * Age of entity in days (vehicle age, component age, etc.)
   * Used in RELIABILITY_INDEX and MAINTENANCE_INDEX
   */
  entityAgeInDays?: number;

  /**
   * Custom feature map for calculator-specific values
   * Allows flexible extension without schema changes
   */
  customFeatures?: Record<string, number | string | boolean>;
}
