/**
 * Data Engine Entity
 *
 * Canonical representation of a data entity after semantic normalization.
 * This is the standardized output of Phase 4 normalization.
 */

export type DataEngineEntityType =
  | 'MAINTENANCE_EVENT'
  | 'DAMAGE_EVENT'
  | 'DIAGNOSTIC_EVENT'
  | 'SERVICE_RECORD'
  | 'ACCIDENT_REPORT'
  | 'INSPECTION_RESULT'
  | 'TELEMETRY_SNAPSHOT'
  | 'PARTS_REPLACEMENT'
  | 'WARRANTY_CLAIM'
  | 'OTHER';

export interface DataEngineEntity {
  /**
   * Unique entity identifier (deterministically derived from identity + timestamp + type)
   */
  entityId: string;

  /**
   * Identity ID from binding result
   */
  identityId: string;

  /**
   * Canonical entity type based on feed classification
   */
  entityType: DataEngineEntityType;

  /**
   * Source system that originated this feed
   */
  sourceSystem: string;

  /**
   * Semantic normalized attributes (standardized across sources)
   */
  normalizedAttributes: Record<string, unknown>;

  /**
   * Audit trail information
   */
  metadata: {
    schemaVersion: string;
    normalizedAt: string;
    normalizationSource: string;
  };

  /**
   * Temporal boundaries of the entity
   */
  temporal: {
    eventDate?: string;
    eventTimestamp?: string;
    recordedDate: string;
    recordedTimestamp: string;
  };

  /**
   * Quality indicators
   */
  quality: {
    completeness: 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    hasInferredValues: boolean;
    normalizationWarnings: number;
  };
}
