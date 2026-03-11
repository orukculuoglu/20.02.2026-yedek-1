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
 * - normalizedAttributes contains canonical intelligence data
 * - metadata provides full traceability back to source feeds
 * - timestamps enable temporal analysis and causality tracking
 */

import type { DataEngineTimestampModel } from './DataEngineTimestampModel';
import type { FeedMetadataStructure } from '../metadata/FeedMetadataStructure';

// ═══════════════════════════════════════════════════════════════════════════════
// ENTITY TYPE DEFINITION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Data Engine Entity Type Classification.
 *
 * Constrained set of entity types that can be produced by the Data Engine.
 * Supports normalization readiness and downstream graph/index preparation.
 */
export type DataEngineEntityType =
  | 'MAINTENANCE_EVENT'
  | 'REPAIR_EVENT'
  | 'DAMAGE_EVENT'
  | 'DIAGNOSTIC_EVENT'
  | 'PART_EVENT'
  | 'USAGE_EVENT'
  | 'OTHER';

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
 * - normalizedAttributes contains normalized intelligence data
 * - metadata provides full traceability back to source feeds
 * - timestamps enable temporal analysis and causality tracking
 */
export interface DataEngineEntity {
  /**
   * Unique identifier for this entity instance.
   * Deterministically generated from identityId + entityType + normalizedAttributes signature.
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
   * Constrained set of canonical entity types supported by the Data Engine.
   *
   * Examples: MAINTENANCE_EVENT, REPAIR_EVENT, DIAGNOSTIC_EVENT, DAMAGE_EVENT
   * 
   * Used for: filtering, routing, impact analysis graph construction
   */
  readonly entityType: DataEngineEntityType;

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
   * Normalized intelligence attributes.
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
  readonly normalizedAttributes: Record<string, unknown>;

  /**
   * Metadata structure.
   * Source traceability, schema version, confidence level, institutional context.
   */
  readonly metadata: FeedMetadataStructure;

  /**
   * Timestamp envelope.
   * Event, observed, ingested, and possibly processed moments.
   */
  readonly timestamps: DataEngineTimestampModel;

  /**
   * Entity lifecycle state (optional).
   * Tracks the maturity or processing stage of this entity.
   *
   * Examples: 'INGESTED', 'NORMALIZED', 'ENRICHED', 'INDEXED'
   * Used for: workflow tracking, completeness assessment
   */
  readonly lifecycleState?: string;
}
