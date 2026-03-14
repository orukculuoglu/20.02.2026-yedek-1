/**
 * IndexMetadata provides additional context and traceability for an IndexRecord.
 * Maintains information about data quality, calculation inputs, and contextual factors.
 */
export interface IndexMetadata {
  /**
   * Number of events/observations used in calculation
   */
  eventCount: number;

  /**
   * Number of distinct data sources contributing to this index
   */
  sourceCount: number;

  /**
   * Primary algorithm or model version used for calculation
   */
  calculationModel: string;

  /**
   * Geographic region or operational context
   */
  region?: string;

  /**
   * Vehicle make/manufacturer (if applicable)
   */
  vehicleMake?: string;

  /**
   * Vehicle model (if applicable)
   */
  vehicleModel?: string;

  /**
   * Vehicle year (if applicable)
   */
  vehicleYear?: number;

  /**
   * Any custom tags or classifications for this index
   */
  tags?: Record<string, string>;

  /**
   * Data freshness indicator (days since last data update)
   */
  dataFreshnessInDays?: number;

  /**
   * Indicates if this index is provisional (incomplete data)
   */
  isProvisional?: boolean;

  /**
   * Any known limitations or caveats about this measurement
   */
  caveats?: string[];
}
