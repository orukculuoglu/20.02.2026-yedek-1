/**
 * IndexInputSnapshot captures the time-aware ingestion state.
 * Tracks data freshness, temporal coverage, and data quality flags.
 */
export interface IndexInputSnapshot {
  /**
   * Unique identifier for this snapshot (UUID v4)
   */
  snapshotId: string;

  /**
   * ISO 8601 timestamp when this snapshot was captured
   */
  capturedAt: Date;

  /**
   * Number of seconds since the freshest data point in this snapshot
   * Lower values = fresher data
   */
  freshnessSeconds: number;

  /**
   * Description of the time period covered by this snapshot
   * Example: "last 30 days", "last 6 months", "current day"
   */
  temporalCoverage: string;

  /**
   * Indicates if this snapshot is considered stale or out-of-date
   * Used to flag inputs that may need recalculation
   */
  stale: boolean;

  /**
   * Flags indicating missing or problematic data in this snapshot
   * Examples: 'missing-odometer', 'incomplete-service-records', 'sensor-malfunction'
   */
  missingDataFlags: string[];

  /**
   * Optional: Count of data points/records in this snapshot
   */
  totalDataPoints?: number;

  /**
   * Optional: Percentage of expected data actually present (0-100)
   */
  dataCompletenessPercent?: number;
}
