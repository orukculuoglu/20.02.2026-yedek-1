/**
 * Data Engine Normalization Status
 *
 * Enumeration of possible outcomes from semantic normalization.
 *
 * NORMALIZED:              Feed successfully normalized to canonical entity
 * NORMALIZED_WITH_WARNINGS: Feed normalized but with non-blocking issues requiring note
 * REJECTED:                Feed cannot be normalized due to blocking issues
 */

export type DataEngineNormalizationStatus =
  | 'NORMALIZED'
  | 'NORMALIZED_WITH_WARNINGS'
  | 'REJECTED';
