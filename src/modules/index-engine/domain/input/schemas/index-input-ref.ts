import { RefType } from '../enums/ref-type';
import { RelationType } from '../enums/relation-type';

/**
 * IndexInputRef provides traceability to upstream graph artifacts.
 * Links index inputs to their source evidence in the Vehicle Intelligence Graph.
 */
export interface IndexInputRef {
  /**
   * Type of reference artifact
   */
  refType: RefType;

  /**
   * Unique identifier of the referenced artifact
   */
  refId: string;

  /**
   * Source module providing this reference (e.g., 'vehicle-intelligence-graph', 'data-engine')
   */
  sourceModule: string;

  /**
   * How this reference relates to the subject being indexed
   */
  relationType: RelationType;

  /**
   * ISO 8601 timestamp when this reference was observed/captured
   */
  observedAt: Date;

  /**
   * Optional: Additional metadata about the reference
   */
  metadata?: Record<string, unknown>;
}
