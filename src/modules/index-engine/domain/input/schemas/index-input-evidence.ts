import { EvidenceType } from '../enums/evidence-type';

/**
 * IndexInputEvidence packages explainable evidence with provenance tracking.
 * Each piece of evidence can be independently justified and related to upstream sources.
 */
export interface IndexInputEvidence {
  /**
   * Type and category of this evidence
   */
  evidenceType: EvidenceType;

  /**
   * Human-readable label for this evidence
   */
  label: string;

  /**
   * The actual evidence value
   */
  value: string | number | boolean | Record<string, unknown>;

  /**
   * Unit of measurement (if applicable, e.g., 'days', 'count', 'ppm', 'percentage')
   */
  unit?: string;

  /**
   * Confidence in this evidence (0.0 - 1.0)
   * Indicates completeness, freshness, or reliability of the data point
   */
  confidence: number;

  /**
   * ISO 8601 timestamp when this evidence was measured/observed
   */
  timestamp: Date;

  /**
   * References to related upstream artifacts supporting this evidence
   */
  relatedRefIds?: string[];

  /**
   * Optional: Additional contextual metadata
   */
  metadata?: Record<string, unknown>;
}
