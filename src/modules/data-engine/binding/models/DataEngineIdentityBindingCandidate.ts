/**
 * Data Engine Identity Binding Candidate
 *
 * Represents an accepted feed entering the identity binding evaluation phase.
 * Contains the feed reference and associated identity context needed to evaluate binding quality.
 */

import type { DataSourceType } from '../../types/DataSourceType';

/**
 * Identity context associated with a feed.
 *
 * This object captures identity information present in or derived from an accepted feed.
 * It is NOT a VIN resolution result.
 * It is NOT a canonical entity.
 * It is the identity context available for binding quality evaluation.
 */
export interface DataEngineIdentityContext {
  /**
   * Anonymous vehicle identity identifier.
   * Uniquely identifies the vehicle within the anonymous identity system.
   * This identifier was provided by the feed source.
   *
   * Example: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0'
   */
  readonly identityId: string;

  /**
   * Issuer of this identity (optional).
   * The system or organization that generated/manages this identityId.
   *
   * Examples:
   * - 'SERVICE_CENTER_NETWORK_001'
   * - 'TELEMATICS_PROVIDER_XYZ'
   * - 'INSURANCE_CLAIMS_SYSTEM'
   * - 'FLEET_OPS_CENTRAL'
   *
   * Critical for issuer mismatch detection and trust assessment.
   */
  readonly issuerId?: string;

  /**
   * Realm or scope of this identity (optional).
   * The operational boundary where this identity is valid.
   *
   * Examples:
   * - 'authorized-dealers'
   * - 'fleet-operations'
   * - 'insurance-partners'
   * - 'telematics-only'
   */
  readonly scope?: string;

  /**
   * Environment classification (optional).
   * The environment for which this identity is valid.
   *
   * Examples:
   * - 'production'
   * - 'staging'
   * - 'development'
   * - 'test'
   */
  readonly environment?: string;

  /**
   * Trust level of this identity (optional).
   * Reflects confidence in the identity source and binding.
   *
   * Values: 'LOW' | 'MEDIUM' | 'HIGH'
   * - LOW: Unknown source, limited confidence
   * - MEDIUM: Known but not fully trusted source
   * - HIGH: Trusted source with established validation
   *
   * Default if not provided: 'MEDIUM'
   */
  readonly trustLevel?: 'LOW' | 'MEDIUM' | 'HIGH';

  /**
   * When this identity was issued (optional).
   * ISO 8601 UTC timestamp.
   * Used to assess identity staleness and temporal validity.
   *
   * Example: '2024-03-15T08:30:00Z'
   */
  readonly issuedAt?: string;

  /**
   * When this identity expires (optional).
   * ISO 8601 UTC timestamp.
   * After this time, identity should not be used for binding.
   *
   * Example: '2026-03-15T08:30:00Z'
   */
  readonly expiresAt?: string;

  /**
   * Whether this identity has been revoked (optional).
   * If true, identity is no longer valid and should be rejected.
   * Default: false
   */
  readonly revoked?: boolean;

  /**
   * Federation context (optional).
   * Information about federated identity chain or federation mode.
   *
   * Examples:
   * - { mode: 'SAML2', issuedBy: 'partner-identity-provider' }
   * - { chain: ['direct'] }
   * - { delegatedBy: 'FLEET_MANAGER_SYSTEM' }
   *
   * Used to assess federation completeness and compatibility.
   */
  readonly federation?: {
    readonly mode?: string;
    readonly issuedBy?: string;
    readonly chain?: string[];
    readonly delegatedBy?: string;
  };
}

/**
 * Identity Binding Candidate.
 *
 * Represents an accepted feed from Phase 2 intake, together with its identity context,
 * ready for Phase 3 identity binding evaluation.
 *
 * Key principle:
 * This is the transition point from intake validation into binding quality assessment.
 * The feed has already passed Phase 2 intake requirements.
 * Now Phase 3 evaluates whether the identity context is sufficient for downstream use.
 */
export interface DataEngineIdentityBindingCandidate {
  /**
   * Reference to the accepted intake candidate (Phase 2 output).
   * Links this binding evaluation back to the intake result.
   *
   * Example: 'cand_20260311_srv_clean_001'
   */
  readonly intakeCandidateId: string;

  /**
   * Reference to the intake result (optional).
   * If Phase 2 intake result is available, reference it for full audit trail.
   *
   * Example: 'intake_result_20260311_001'
   */
  readonly intakeResultRef?: string;

  /**
   * Feed source type classification.
   * Used in source-aware policy evaluation.
   */
  readonly sourceOrigin: DataSourceType;

  /**
   * Identity context for this candidate.
   * Contains all identity information available for binding evaluation.
   */
  readonly identityContext: DataEngineIdentityContext;

  /**
   * Candidate timestamp (from intake).
   * When this candidate arrived at the intake boundary.
   * ISO 8601 UTC timestamp.
   */
  readonly candidateTimestamp: string;
}
