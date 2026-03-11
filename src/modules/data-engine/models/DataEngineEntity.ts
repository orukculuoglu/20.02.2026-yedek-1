/**
 * Data Engine Entity Model
 *
 * Canonical internal representation of vehicle-intelligence objects within
 * the Data Engine Core.
 *
 * This is the PRIMARY unit of work for the Data Engine.
 * Multiple feeds may collapse into a single entity through normalization.
 *
 * Central Principle:
 * - identityId is the exclusive vehicle linkage key
 * - payload contains normalized intelligence
 * - metadata provides full traceability back to source feeds
 * - timestamps enable temporal analysis and causality tracking
 */

import type { DataEngineTimestampModel } from '../types/DataEngineTimestampModel';
import type { FeedMetadataStructure } from '../metadata/FeedMetadataStructure';

/**
 * Data Engine Entity.
 *
 * Canonical internal representation of a normalized vehicle-intelligence object
 * within the Data Engine Core.
 *
 * This is the PRIMARY unit of work for the Data Engine.
 * Multiple feeds may collapse into a single entity through normalization.
 *
 * Central Principle:
 * - identityId is the exclusive vehicle linkage key
 * - payload contains source-specific or normalized intelligence
 * - metadata provides full traceability back to source feeds
 * - timestamps enable temporal analysis and causality tracking
 */
export interface DataEngineEntity {
  /**
   * Unique identifier for this entity instance.
   * Deterministically generated from identityId + entityType + payload signature.
   *
   * Enables: deduplication, idempotency, audit trail linking
   *
   * Example: 'entity_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0'
   */
  readonly entityId: string;

  /**
   * PRIMARY vehicle linkage identifier.
   *
   * CRITICAL: This is NOT the VIN.
   * This is the anonymousVehicleId from the Identity Layer.
   *
   * Why identityId instead of VIN?
   * - Privacy: VIN never stored in aggregation layer
   * - Multi-issuer: Different issuers provide different IDs for same vehicle
   * - Linkage: Identity protocol handles VIN-to-ID resolution upstream
   * - Isolation: Data Engine operates on identities, not raw VINs
   *
   * Example: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0'
   */
  readonly identityId: string;

  /**
   * Entity type classification.
   * Broad categorization of what this intelligence object represents.
   *
   * Examples: 'maintenance_event', 'repair_record', 'diagnostic_report',
   *           'recommendation_set', 'incident_alert', 'parts_usage'
   * 
   * Used for: filtering, routing, impact analysis graph construction
   */
  readonly entityType: string;

  /**
   * Canonical category for this entity (optional).
   * May differ from entityType when entity represents a normalized concept.
   *
   * Examples: 'CANONICAL_SERVICE_EVENT', 'CANONICAL_INCIDENT_RECORD',
   *           'CANONICAL_PARTS_USAGE'
   *
   * Used for: signal generation, downstream graph/index operations
   */
  readonly canonicalCategory?: string;

  /**
   * Actual intelligence payload.
   * Source-specific or normalized data structure.
   *
   * Structure varies by entityType and source.
   * May be:
   * - Raw feed data (pre-normalization)
   * - Normalized canonical form (post-normalization)
   * - Hybrid (with schema version indicators)
   *
   * Responsibility: Upstream system (Intelligence Engine) or
   * future normalization phase manages shape/evolution.
   */
  readonly payload: Record<string, unknown>;

  /**
   * Feed metadata structure.
   * Source traceability, schema version, confidence level, institutional context.
   */
  readonly feedMetadata: FeedMetadataStructure;

  /**
   * Timestamp envelope.
   * Event, observed, ingested, and possibly processed moments.
   */
  readonly feedTimestamps: DataEngineTimestampModel;

  /**
   * Entity lifecycle state (optional).
   * Tracks the maturity or processing stage of this entity.
   *
   * Examples: 'INGESTED', 'NORMALIZED', 'ENRICHED', 'INDEXED'
   * Used for: workflow tracking, completeness assessment
   */
  readonly lifecycleState?: string;
}
