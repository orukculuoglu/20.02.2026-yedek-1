import { IndexType } from '../enums/index-type';
import { IndexBand } from '../enums/index-band';
import { IndexSubjectType } from '../enums/index-subject-type';
import { IndexMetadata } from './index-metadata';
import { IndexExplanation } from './index-explanation';

/**
 * IndexRecord is the core domain model representing a single measurement
 * of a specific dimension (index) for a subject entity.
 * 
 * All fields are time-aware and deterministically calculated from the
 * Vehicle Intelligence Graph layer.
 */
export interface IndexRecord {
  /**
   * Unique identifier for this index record (UUID v4)
   * Format: {indexType}:{subjectId}:{calculatedAtTimestamp}
   */
  indexId: string;

  /**
   * The type of index being measured
   */
  indexType: IndexType;

  /**
   * The type of entity being indexed
   */
  subjectType: IndexSubjectType;

  /**
   * The unique identifier of the entity being indexed
   */
  subjectId: string;

  /**
   * The numerical score (0.0 - 1.0)
   * 0.0 = worst condition
   * 1.0 = optimal condition
   */
  score: number;

  /**
   * The classification band derived from the score
   * Deterministically calculated from score value
   */
  band: IndexBand;

  /**
   * Confidence level in this measurement (0.0 - 1.0)
   * Indicates reliability and completeness of available data
   */
  confidence: number;

  /**
   * ISO 8601 timestamp when this index was calculated
   */
  calculatedAt: Date;

  /**
   * ISO 8601 timestamp when this measurement was as of (the reference point)
   */
  validAt: Date;

  /**
   * ISO 8601 timestamp when this measurement becomes valid
   */
  validFrom: Date;

  /**
   * ISO 8601 timestamp when this measurement expires/becomes stale
   */
  validTo: Date;

  /**
   * Human-readable and machine-readable explanation of the score
   */
  explanation: IndexExplanation;

  /**
   * Additional metadata for traceability and context
   */
  metadata: IndexMetadata;
}
