/**
 * Enumeration of penalty types that can be applied during index calculation.
 * Penalties reduce or modify the score based on negative factors.
 * 
 * - MISSING_DATA: Applied when critical data is missing from input
 * - STALE_DATA: Applied when data is older than freshness threshold
 * - LOW_CONFIDENCE: Applied when data confidence is below acceptable level
 * - INCOMPLETE_EVIDENCE: Applied when insufficient evidence is available
 * - DATA_QUALITY: Applied when data quality score is poor
 * - TEMPORAL_DECAY: Applied based on time since measurement
 */
export enum PenaltyType {
  MISSING_DATA = 'MISSING_DATA',
  STALE_DATA = 'STALE_DATA',
  LOW_CONFIDENCE = 'LOW_CONFIDENCE',
  INCOMPLETE_EVIDENCE = 'INCOMPLETE_EVIDENCE',
  DATA_QUALITY = 'DATA_QUALITY',
  TEMPORAL_DECAY = 'TEMPORAL_DECAY',
}
