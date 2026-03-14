import { IndexSubjectType } from '../../enums/index-subject-type';
import { IndexInputRef } from './index-input-ref';
import { IndexInputEvidence } from './index-input-evidence';
import { IndexInputSnapshot } from './index-input-snapshot';
import { IndexInputFeatureSet } from './index-input-feature-set';

/**
 * IndexInput is the canonical input model for index calculations.
 * Carries normalized, explainable evidence from the Vehicle Intelligence Graph
 * into index calculators.
 * 
 * All fields are time-aware and deterministically traceable.
 */
export interface IndexInput {
  /**
   * Unique identifier for this input (UUID v4)
   * Format: {subjectType}:{subjectId}:{capturedAtTimestamp}
   */
  inputId: string;

  /**
   * The type of entity being measured
   */
  subjectType: IndexSubjectType;

  /**
   * The unique identifier of the entity being measured
   */
  subjectId: string;

  /**
   * ISO 8601 timestamp when this measurement was directly observed
   */
  observedAt: Date;

  /**
   * ISO 8601 timestamp when this input snapshot is valid as-of
   * (the reference point for the measurement)
   */
  validAt: Date;

  /**
   * ISO 8601 timestamp when this input becomes valid
   */
  validFrom: Date;

  /**
   * ISO 8601 timestamp when this input expires/becomes stale
   */
  validTo: Date;

  /**
   * Count of events included in this input aggregation
   */
  eventCount: number;

  /**
   * Count of distinct data sources contributing to this input
   */
  sourceCount: number;

  /**
   * Count of intelligence nodes referenced in this input
   */
  intelligenceCount: number;

  /**
   * Count of signals included in this input
   */
  signalCount: number;

  /**
   * Trust score from Vehicle Intelligence Graph (0.0 - 1.0)
   * Aggregate trust level of the data
   */
  trustScore: number;

  /**
   * Provenance score from Vehicle Intelligence Graph (0.0 - 1.0)
   * Quality and depth of data lineage
   */
  provenanceScore: number;

  /**
   * Data quality score (0.0 - 1.0)
   * Completeness, freshness, and consistency of incoming data
   */
  dataQualityScore: number;

  /**
   * References to upstream graph artifacts providing this input
   */
  refs: IndexInputRef[];

  /**
   * Explainable evidence pieces supporting the input
   */
  evidence: IndexInputEvidence[];

  /**
   * Calculator-ready normalized features
   */
  featureSet: IndexInputFeatureSet;

  /**
   * Snapshot metadata capturing ingestion state
   */
  snapshot: IndexInputSnapshot;

  /**
   * Optional: Additional metadata for context
   */
  metadata?: Record<string, unknown>;
}
