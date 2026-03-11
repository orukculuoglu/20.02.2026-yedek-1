/**
 * Data Engine Core — Phase 1 Object Model
 *
 * Foundational type system for multi-source intelligence data ingestion,
 * normalization preparation, and vehicle identity linkage.
 *
 * Central Principle:
 * - identityId is the PRIMARY linkage key (not VIN)
 * - VIN is never persisted or used for internal linking
 * - All feeds are source-aware and time-aware
 * - Metadata facilitates future normalization without implementing it
 */

// ═══════════════════════════════════════════════════════════════════════════════
// DATA SOURCE TYPE MODEL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Data source classification for feed origin tracking.
 *
 * Supports multi-institutional, multi-channel intelligence ingestion.
 * Each source type has distinct data characteristics and reliability profiles.
 *
 * Extensible for future source categories (not hardcoded enums).
 */
export type DataSourceType =
  | 'SERVICE'           // Authorized service centers, repair shops
  | 'INSURANCE'         // Insurance companies, claims systems
  | 'FLEET'             // Fleet management operators
  | 'EXPERT_SYSTEM'     // Internal expert/recommendation engines
  | 'PARTS_NETWORK'     // Parts suppliers, inventory systems
  | 'TELEMATICS'        // Vehicle telematics, OBD systems
  | 'MANUFACTURER'      // OEM service records, bulletins
  | 'DEALER'            // Authorized dealer networks
  | 'THIRD_PARTY_SERVICE' // External vendors, API partners
  | 'OTHER';            // Catch-all for non-standard sources

// ═══════════════════════════════════════════════════════════════════════════════
// TIMESTAMP MODEL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Data Engine timestamp envelope.
 *
 * Distinguishes critical time concepts for:
 * - Event causality (when something actually happened)
 * - Observation latency (how quickly it was recorded)
 * - Ingestion tracking (when it entered the Data Engine)
 * - Processing sequencing (for deterministic ordering)
 *
 * All timestamps are ISO 8601 UTC format.
 */
export interface DataEngineTimestampModel {
  /**
   * Event timestamp.
   * When the event occurred in the real world / source system.
   * This is the causally relevant moment.
   *
   * Example: A repair completed at 2026-03-11T14:30:00Z
   */
  readonly eventTimestamp: string;

  /**
   * Observed timestamp.
   * When the event was first recorded/observed by the originating system.
   * May differ from eventTimestamp due to source system delays.
   *
   * Example: Recorded in shop system at 2026-03-11T14:35:00Z (5 min delay)
   */
  readonly observedTimestamp: string;

  /**
   * Ingested timestamp.
   * When this Data Engine received/imported this feed record.
   * Marks entry into the aggregation system.
   *
   * Example: Imported at 2026-03-11T15:00:00Z (25 min after observation)
   */
  readonly ingestedTimestamp: string;

  /**
   * Processed timestamp (optional).
   * When the Data Engine Core completed normalization preparation.
   * Only set after Phase 1 structural processing is complete.
   *
   * Example: Processed at 2026-03-11T15:05:00Z
   */
  readonly processedTimestamp?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEED METADATA STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Feed metadata envelope.
 *
 * Provides traceability, schema contracts, confidence signals, and contextual
 * information necessary for:
 * - Source auditing and lineage tracking
 * - Schema evolution and versioning
 * - Normalization readiness assessment
 * - Institutional/regional context binding
 *
 * Does NOT store normalized data (that lives in payload).
 * Only stores metadata about the feed itself.
 */
export interface FeedMetadataStructure {
  /**
   * Unique identifier for the source system instance.
   * Points to the specific system that generated this feed.
   *
   * Example: 'SERVICE_CENTER_42', 'INSURANCE_PARTNER_AAA', 'FLEET_OPS_MAIN'
   */
  readonly sourceId: string;

  /**
   * Human-readable source name or identifier (optional).
   * Useful for logging, monitoring, and human/UI reference.
   *
   * Example: 'Downtown Service Center', 'Acme Insurance Claims'
   */
  readonly sourceInstanceName?: string;

  /**
   * Feed schema version (semantic versioning).
   * Enables tracking payload structure evolution over time.
   *
   * Example: '1.0.0', '1.1.0', '2.0.0'
   * Used for: schema migration, compatibility checks, payload parsing
   */
  readonly schemaVersion: string;

  /**
   * Conformance level indicator.
   * Signals the reliability/completeness of this feed relative to schema.
   *
   * STRICT: Fully validates against schema, all fields present
   * FLEXIBLE: Partial schema compliance, lenient field requirements
   * LEGACY: Older schema version, may need transformation
   *
   * Enables graduated normalization strategies per source.
   */
  readonly conformanceLevel?: 'STRICT' | 'FLEXIBLE' | 'LEGACY';

  /**
   * ISO 3166-1 alpha-2 region code (optional).
   * Geographic/regulatory context for this feed.
   *
   * Example: 'US', 'EU', 'JP', 'CN'
   * Used for: regional data handling compliance, geographic intelligence
   */
  readonly regionCode?: string;

  /**
   * Issuer/institutional context (optional).
   * Identifies the organizational entity responsible for this feed.
   *
   * issuerId: Unique identifier for the issuing institution
   * realm: Optional domain/category for multi-tenant contexts
   *
   * Example:
   *   { issuerId: 'PARTNER_003', realm: 'insurance-claims' }
   */
  readonly issuerContext?: {
    readonly issuerId: string;
    readonly realm?: string;
  };

  /**
   * Feed type / intelligence category (optional).
   * Classifies what KIND of intelligence this feed contains.
   *
   * Used for: feed routing, normalization strategy selection,
   * signal generation target detection
   *
   * Examples: 'maintenance', 'repair_history', 'incident', 'recommendation',
   *           'parts_usage', 'diagnostic', 'safety_alert'
   */
  readonly feedType?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA ENGINE ENTITY
// ═══════════════════════════════════════════════════════════════════════════════

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
   * future normalization phase (Phase 2+) manages shape/evolution.
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
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA ENGINE FEED ENVELOPE
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTED TYPE SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Phase 1 exports 5 core types and interfaces:
 *
 * 1. DataSourceType
 *    Union type for intelligence feed origin classification.
 *    Supports service, insurance, fleet, expert systems, and more.
 *
 * 2. DataEngineTimestampModel
 *    Timestamp envelope distinguishing event, observed, ingested, processed moments.
 *
 * 3. FeedMetadataStructure
 *    Metadata for source traceability, schema versioning, confidence signals.
 *
 * 4. DataEngineEntity
 *    Canonical internal representation for normalized intelligence objects.
 *    Primary linkage: identityId (not VIN).
 *
 * 5. DataEngineFeedEnvelope
 *    Standardized ingestion container for multi-source intelligence feeds.
 *    Prepares feeds for identity-linkage and normalization.
 */
