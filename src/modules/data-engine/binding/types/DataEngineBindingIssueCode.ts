/**
 * Data Engine Binding Issue Code
 *
 * Machine-readable codes for issues encountered during identity binding evaluation.
 * Each code represents a specific binding quality concern that informs the binding decision.
 */

/**
 * Binding issue codes.
 *
 * Organized by category for operational clarity.
 */
export enum DataEngineBindingIssueCode {
  // ─────────────────────────────────────────────────────────────────────────────
  // MISSING IDENTITY CONTEXT
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Feed provides no identity context at all.
   * Cannot evaluate binding without minimum identity information.
   */
  MISSING_IDENTITY_CONTEXT = 'MISSING_IDENTITY_CONTEXT',

  /**
   * identityId is absent or null.
   * Cannot proceed without primary identity reference.
   */
  MISSING_IDENTITY_ID = 'MISSING_IDENTITY_ID',

  /**
   * Issuer context is missing or incomplete.
   * Cannot assess identity trustworthiness without issuer information.
   */
  MISSING_ISSUER_CONTEXT = 'MISSING_ISSUER_CONTEXT',

  /**
   * Scope information is missing from identity context.
   * Cannot verify identity validity within expected operational scope.
   */
  MISSING_SCOPE_CONTEXT = 'MISSING_SCOPE_CONTEXT',

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPATIBILITY MISMATCHES
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Issuer identity does not match expected issuer for this feed source.
   * Example: Feed from SERVICE source but identity issued by TELEMATICS provider.
   */
  ISSUER_MISMATCH = 'ISSUER_MISMATCH',

  /**
   * Identity scope conflicts with feed source or operational context.
   * Example: Identity scoped to 'fleet-ops' but feed from a retail service network.
   */
  SCOPE_MISMATCH = 'SCOPE_MISMATCH',

  /**
   * Environment classification of identity does not match feed environment.
   * Example: Identity marked for 'staging' environment but feed from 'production'.
   */
  ENVIRONMENT_MISMATCH = 'ENVIRONMENT_MISMATCH',

  // ─────────────────────────────────────────────────────────────────────────────
  // IDENTITY VALIDITY AND LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Identity has been revoked.
   * Identity is no longer valid for use.
   * Hard binding failure; cannot recover.
   */
  REVOKED_IDENTITY = 'REVOKED_IDENTITY',

  /**
   * Identity has expired (expiresAt before now).
   * Identity is temporally invalid.
   * Policy may determine soft failure (quarantine) or hard failure (reject).
   */
  EXPIRED_IDENTITY = 'EXPIRED_IDENTITY',

  /**
   * Identity is not yet valid (issuedAt after now).
   * Identity lifecycle has not begun.
   * Hard binding failure.
   */
  IDENTITY_NOT_YET_VALID = 'IDENTITY_NOT_YET_VALID',

  /**
   * Identity age is beyond expected operational range.
   * Example: Identity issued more than 5 years ago; binding to current feed is questionable.
   * Concern: stale identity may no longer accurately represent the vehicle context.
   */
  IDENTITY_STALE = 'IDENTITY_STALE',

  // ─────────────────────────────────────────────────────────────────────────────
  // TRUST AND FEDERATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Identity trust level is below acceptable threshold.
   * Identity may be from low-confidence or unvetted source.
   * Binding is possible but limited.
   */
  LOW_TRUST_BINDING = 'LOW_TRUST_BINDING',

  /**
   * Federation context is incomplete or ambiguous.
   * Federated identity chain cannot be fully validated.
   * Example: Identity from federated partner but federation path is unclear.
   */
  INCOMPLETE_FEDERATION_CONTEXT = 'INCOMPLETE_FEDERATION_CONTEXT',

  /**
   * Federation mode or federation path is not supported by current system.
   * Example: Identity uses federation protocol version not compatible with Data Engine.
   */
  UNSUPPORTED_FEDERATION_PATH = 'UNSUPPORTED_FEDERATION_PATH',

  /**
   * Identity context is ambiguous and requires clarification.
   * Examples:
   * - Multiple possible issuer interpretations
   * - Conflicting trust indicators
   * - Unclear scope boundaries
   * Cannot safely proceed without manual review.
   */
  AMBIGUOUS_BINDING_CONTEXT = 'AMBIGUOUS_BINDING_CONTEXT',

  // ─────────────────────────────────────────────────────────────────────────────
  // STRUCTURAL AND OPERATIONAL CONCERNS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Identity context structure is malformed or invalid.
   * Cannot parse or interpret identity fields.
   * Hard binding failure.
   */
  MALFORMED_IDENTITY_CONTEXT = 'MALFORMED_IDENTITY_CONTEXT',

  /**
   * Identity characteristics do not align with feed characteristics.
   * Example: Vehicle identity from manufacturer but feed from independent service.
   * Possible identity/feed mismatch.
   */
  IDENTITY_FEED_CHARACTERISTIC_MISMATCH = 'IDENTITY_FEED_CHARACTERISTIC_MISMATCH',

  /**
   * Temporal sequence of identity lifecycle is invalid.
   * Example: expiresAt before issuedAt.
   */
  INVALID_IDENTITY_TEMPORAL_SEQUENCE = 'INVALID_IDENTITY_TEMPORAL_SEQUENCE',
}
