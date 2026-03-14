/**
 * CompositeSourceIndexRef tracks traceability to source indexes
 * Maintains full lineage from composite back to constituent measurements
 */
export interface CompositeSourceIndexRef {
  /**
   * Type of index that was used (e.g., RELIABILITY_INDEX, MAINTENANCE_INDEX)
   */
  indexType: string;

  /**
   * Unique identifier of the source index record
   */
  indexId: string;

  /**
   * Score from this index (0.0 - 1.0)
   */
  score: number;

  /**
   * Confidence level in this index (0.0 - 1.0)
   */
  confidence: number;

  /**
   * Optional: Weight this index was given in composite calculation
   * Used for explainability
   */
  weightHint?: number;

  /**
   * ISO 8601 timestamp when this index was observed
   */
  observedAt?: string;

  /**
   * ISO 8601 timestamp when this index becomes valid
   */
  validFrom?: string;

  /**
   * ISO 8601 timestamp when this index expires
   */
  validTo?: string;
}
