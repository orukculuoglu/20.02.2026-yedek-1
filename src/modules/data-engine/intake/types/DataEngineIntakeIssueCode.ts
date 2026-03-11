/**
 * Data Engine Intake Issue Code
 *
 * Machine-readable codes for issues detected during intake evaluation.
 * Used for structured reporting, logging, and policy decisions.
 */

/**
 * Explicit issue codes for intake evaluation problems.
 *
 * Each code represents a specific, actionable intake concern:
 *
 * Identity Requirements:
 * - MISSING_IDENTITY_ID: Feed provides no identityId linkage
 *
 * Source Requirements:
 * - INVALID_SOURCE_TYPE: sourceType not in recognized DataSourceType union
 *
 * Envelope Requirements:
 * - MISSING_FEED_PAYLOAD: feedPayload is missing or undefined
 * - MISSING_FEED_METADATA: feedMetadata is missing entirely
 * - MISSING_FEED_TIMESTAMPS: feedTimestamps are missing entirely
 * - EMPTY_PAYLOAD: feedPayload is empty object {}
 * - INVALID_FEED_STRUCTURE: Overall envelope structure is malformed
 *
 * Timestamp Requirements:
 * - MALFORMED_TIMESTAMP: One or more timestamp fields malformed/unparseable
 * - TIMESTAMP_OUT_OF_RANGE: Timestamp far in future or distant past
 * - INVALID_TIMESTAMP_SEQUENCE: Temporal causality violated (observed < event, etc)
 *
 * Schema Requirements:
 * - UNSUPPORTED_SCHEMA_VERSION: schemaVersion not recognized or compatible
 *
 * Conformance Warnings:
 * - LEGACY_CONFORMANCE_WARNING: Feed uses older schema version but is still operational
 * - INCOMPLETE_OPTIONAL_METADATA: Optional metadata fields missing (region, issuer, etc)
 */
export type DataEngineIntakeIssueCode =
  | 'MISSING_IDENTITY_ID'
  | 'INVALID_SOURCE_TYPE'
  | 'MISSING_FEED_PAYLOAD'
  | 'MISSING_FEED_METADATA'
  | 'MISSING_FEED_TIMESTAMPS'
  | 'EMPTY_PAYLOAD'
  | 'INVALID_FEED_STRUCTURE'
  | 'MALFORMED_TIMESTAMP'
  | 'TIMESTAMP_OUT_OF_RANGE'
  | 'INVALID_TIMESTAMP_SEQUENCE'
  | 'UNSUPPORTED_SCHEMA_VERSION'
  | 'LEGACY_CONFORMANCE_WARNING'
  | 'INCOMPLETE_OPTIONAL_METADATA';
