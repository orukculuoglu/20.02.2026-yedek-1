/**
 * Data Engine Feed Envelope
 *
 * Standardized ingestion container for intelligence-related feed data
 * from external sources (services, insurance, fleet systems, expert engines, etc.).
 *
 * This envelope wraps incoming feed records and prepares them for:
 * - Identity-based vehicle linking (via identityId)
 * - Source traceability (via metadata)
 * - Temporal analysis (via timestamps)
 * - Normalization preparation (schema version awareness)
 */

import type { DataSourceType } from '../types/DataSourceType';
import type { DataEngineTimestampModel } from './DataEngineTimestampModel';
import type { FeedMetadataStructure } from '../metadata/FeedMetadataStructure';

/**
 * Data Engine Feed Envelope.
 *
 * Standardized ingestion container for intelligence-related feed data
 * from external sources (services, insurance, fleet systems, expert engines, etc.).
 *
 * This envelope wraps incoming feed records and prepares them for:
 * - Identity-based vehicle linking (via identityId)
 * - Source traceability (via metadata)
 * - Temporal analysis (via timestamps)
 * - Normalization preparation (schema version awareness)
 *
 * Central Principle:
 * Feed envelopes are stateless, immutable containers.
 * Normalization happens AFTER ingestion (Phase 2+).
 */
export interface DataEngineFeedEnvelope {
  /**
   * Unique identifier for this feed record.
   * Deterministically generated from identityId + sourceType + feedPayload signature.
   *
   * Enables: deduplication, idempotency tracking, feed lineage
   *
   * Example: 'feed_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0'
   */
  readonly feedId: string;

  /**
   * PRIMARY vehicle linkage identifier (same semantic as DataEngineEntity).
   *
   * CRITICAL: This is the anonymousVehicleId from the Identity Layer.
   * NOT the VIN.
   *
   * This is how feeds are grouped and linked to specific vehicles
   * within the aggregation system.
   *
   * Example: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0'
   */
  readonly identityId: string;

  /**
   * Source system type classification.
   * Indicates what KIND of system provided this feed.
   *
   * Used for: feed routing, source scheduling, confidence assessment,
   * institutional context lookup
   */
  readonly sourceType: DataSourceType;

  /**
   * Raw or minimally-processed feed payload.
   * The actual intelligence data from the source system.
   *
   * Examples:
   * - SERVICE: { workOrderId, repairCodes, partsList, serviceDate, notes }
   * - INSURANCE: { claimId, claimDate, damageType, estimatedCost }
   * - TELEMATICS: { diag_faults, fuel_efficiency, mileage, lastUpdate }
   *
   * May contain source-specific field names and structures.
   * Normalization happens downstream (Phase 2+).
   */
  readonly feedPayload: Record<string, unknown>;

  /**
   * Feed metadata envelope.
   * Source traceability, schema version, conformance level, institutional context.
   */
  readonly feedMetadata: FeedMetadataStructure;

  /**
   * Timestamp envelope.
   * Event, observed, ingested, and possibly processed moments.
   */
  readonly feedTimestamps: DataEngineTimestampModel;

  /**
   * Feed classification (optional).
   * Additional semantic categorization beyond sourceType.
   *
   * Examples: 'critical_repair', 'routine_maintenance',
   *           'safety_alert', 'warranty_claim'
   *
   * Used for: prioritization, impact assessment, signal generation
   */
  readonly feedClassification?: string;
}
