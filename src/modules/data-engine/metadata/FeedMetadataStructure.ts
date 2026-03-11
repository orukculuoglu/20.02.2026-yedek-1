/**
 * Feed Metadata Structure
 *
 * Provides traceability, schema versioning, confidence signals, and contextual
 * information necessary for source auditing, lineage tracking, schema evolution,
 * and normalization readiness assessment.
 */

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
