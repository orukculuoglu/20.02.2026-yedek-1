/**
 * Example Identity Binding Cases
 *
 * Realistic scenarios demonstrating identity binding evaluation across different
 * feed sources and identity context conditions.
 * Shows how the binding layer handles real-world identity characteristics.
 */

import type { DataEngineIdentityBindingCandidate } from '../models/DataEngineIdentityBindingCandidate';
import type { DataEngineIdentityBindingResult } from '../models/DataEngineIdentityBindingResult';
import { evaluateIdentityBinding } from '../models/evaluateIdentityBinding';
import { defaultBindingPolicy } from '../models/DataEngineIdentityBindingPolicy';

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 1: SERVICE CENTER - COMPLETE, FULLY TRUSTED IDENTITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A modern authorized service center submits a maintenance feed
 * with complete and trustworthy identity context.
 *
 * Identity characteristics:
 * - Full identityId present
 * - Trusted issuer
 * - Scope matches feed type
 * - Environment matches system
 * - Trust level: HIGH
 * - Valid issuedAt and expiresAt
 * - Not revoked
 * - Minimal staleness
 *
 * Expected Outcome: BOUND
 * - No identity context issues
 * - Feed can proceed downstream with full confidence
 */
export const caseServiceCenterFullyTrusted: DataEngineIdentityBindingCandidate = {
  intakeCandidateId: 'cand_20260311_srv_clean_001',
  sourceOrigin: 'SERVICE',
  candidateTimestamp: '2026-03-11T16:05:30Z',

  identityContext: {
    identityId: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0',
    issuerId: 'SERVICE_CENTER_METRO_42',
    scope: 'authorized-dealers',
    environment: 'production',
    trustLevel: 'HIGH',
    issuedAt: '2024-03-15T08:30:00Z',
    expiresAt: '2027-03-15T08:30:00Z',
    revoked: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 2: TELEMATICS PROVIDER - VALID BUT INCOMPLETE FEDERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A telematics provider submits a diagnostic feed with valid identity
 * but incomplete federation context.
 *
 * Identity characteristics:
 * - Valid identityId and issuer
 * - Scope and environment present
 * - Trust level: MEDIUM
 * - Temporal validity good
 * - Federation context present but not fully complete
 *   (missing federation chain or delegation info)
 *
 * Expected Outcome: BOUND_WITH_LIMITATIONS
 * - No blocking issues
 * - Incomplete federation context is a limiting issue
 * - Default policy tolerates incomplete federation (allows binding with limitations)
 * - Downstream systems must note the federation completeness limitation
 */
export const caseTelematicsIncompleteFedetation: DataEngineIdentityBindingCandidate = {
  intakeCandidateId: 'cand_20260311_tel_fed_001',
  sourceOrigin: 'TELEMATICS',
  candidateTimestamp: '2026-03-11T14:40:00Z',

  identityContext: {
    identityId: 'anon_d0i2h5f6g1e4j7k9f8g3c6d9e7f0a4b5',
    issuerId: 'TELEMATICS_PROVIDER_XYZ',
    scope: 'telematics-partners',
    environment: 'production',
    trustLevel: 'MEDIUM',
    issuedAt: '2025-08-15T10:00:00Z',
    expiresAt: '2027-08-15T10:00:00Z',
    revoked: false,
    federation: {
      mode: 'OIDC',
      // Missing 'chain' or 'delegatedBy' for complete traceability
      issuedBy: 'TELEMATICS_IDP',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 3: FLEET SYSTEM - REVOKED IDENTITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A fleet management system submits a maintenance forecast feed
 * but the identity has been revoked (vehicle no longer in fleet, partnership ended, etc.).
 *
 * Identity characteristics:
 * - Valid identityId present
 * - Issuer and scope defined
 * - BUT: revoked flag is true
 * - Revocation indicates the identity is no longer trusted
 *
 * Expected Outcome: REJECTED
 * - REVOKED_IDENTITY is a BLOCKING issue
 * - Default policy rejects revoked identities (non-negotiable)
 * - Feed cannot proceed downstream
 */
export const caseFleetRevokedIdentity: DataEngineIdentityBindingCandidate = {
  intakeCandidateId: 'cand_20260311_fleet_revoked_001',
  sourceOrigin: 'FLEET',
  candidateTimestamp: '2026-03-11T15:30:00Z',

  identityContext: {
    identityId: 'anon_b8g0f3d4e9c2h5i7d6e0f1a4b7c5d8e1',
    issuerId: 'FLEET_OPS_NETWORK_002',
    scope: 'fleet-operations',
    environment: 'production',
    trustLevel: 'MEDIUM',
    issuedAt: '2024-01-10T09:00:00Z',
    expiresAt: '2026-01-10T09:00:00Z',
    revoked: true, // ← REVOKED
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 4: INSURANCE PROVIDER - EXPIRED IDENTITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: An insurance claims system submits a claim-related feed but
 * the identity has expired (claim policy ended, identity validity period lapsed).
 *
 * Identity characteristics:
 * - Valid identityId and issuer
 * - expiresAt is in the past
 * - Temporally invalid
 *
 * Default Policy Behavior:
 * - expiredIdentityBehavior: 'QUARANTINE' (not hard rejection)
 * - Expired identity can be reviewed for recency or policy exception
 *
 * Expected Outcome: QUARANTINED (not REJECTED)
 * - EXPIRED_IDENTITY is raised as a limiting issue (policy quarantines)
 * - Default policy quarantines instead of hard-rejecting
 * - Manual review can determine if identity should be accepted
 *   (e.g., if claim is recent and identity just expired, acceptable)
 */
export const caseInsuranceExpiredIdentity: DataEngineIdentityBindingCandidate = {
  intakeCandidateId: 'cand_20260311_ins_expired_001',
  sourceOrigin: 'INSURANCE',
  candidateTimestamp: '2026-03-11T10:00:00Z',

  identityContext: {
    identityId: 'anon_c9h1g4e5f0d3i6j8e7f2b5c8d6e9f2a3',
    issuerId: 'INSURANCE_CLAIMS_SYSTEM',
    scope: 'claims-processing',
    environment: 'production',
    trustLevel: 'MEDIUM',
    issuedAt: '2023-03-15T08:30:00Z',
    expiresAt: '2026-02-15T08:30:00Z', // ← EXPIRED (before now)
    revoked: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 5: THIRD PARTY SERVICE - STALE IDENTITY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A third-party service provider (collision repair partner) submits
 * a damage assessment feed. The identity is very old (5+ years).
 *
 * Identity characteristics:
 * - Valid identityId and issuer
 * - Still within expiration window
 * - BUT: issued 5+ years ago
 * - Staleness raises concern: does identity still accurately represent the entity?
 *
 * Default Policy Behavior:
 * - staleIdentityBehavior: 'QUARANTINE'
 * - maxIdentityAgeMillis: 5 years
 * - Stale identity is not automatically rejected but quarantined for review
 *
 * Expected Outcome: QUARANTINED
 * - IDENTITY_STALE issue raised
 * - Policy quarantines for manual determination
 * - Operational question: does the old identity still validate this feed?
 */
export const casePartnerStaleIdentity: DataEngineIdentityBindingCandidate = {
  intakeCandidateId: 'cand_20260311_partner_stale_001',
  sourceOrigin: 'THIRD_PARTY_SERVICE',
  candidateTimestamp: '2026-03-11T12:00:00Z',

  identityContext: {
    identityId: 'anon_e1j3i6g7h2f5k8l0g9h4d7e0f8g1b5c6',
    issuerId: 'REPAIR_PARTNER_NETWORK_A',
    scope: 'partner-services',
    environment: 'production',
    trustLevel: 'MEDIUM',
    issuedAt: '2020-06-01T14:00:00Z', // ← 5+ years old
    expiresAt: '2027-06-01T14:00:00Z', // Still valid
    revoked: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 6: MANUFACTURER - ISSUER MISMATCH
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A vehicle is submitted with identity supposedly from MANUFACTURER
 * source type, but the issuer is from TELEMATICS_PROVIDER system.
 *
 * Identity characteristics:
 * - Valid identityId
 * - But: issuer does not match expected manufacturer issuer
 * - This is a characteristic mismatch suggesting possible identity confusion
 *
 * Default Policy Behavior:
 * - issuerMismatchBehavior: 'REJECT'
 * - Issuer mismatch is treated seriously and causes rejection
 *
 * Expected Outcome: REJECTED
 * - ISSUER_MISMATCH issue raised with LIMITING severity
 * - Policy behavior is REJECT, so feed is rejected
 */
export const caseManufacturerIssuerMismatch: DataEngineIdentityBindingCandidate = {
  intakeCandidateId: 'cand_20260311_mfg_mismatch_001',
  sourceOrigin: 'MANUFACTURER',
  candidateTimestamp: '2026-03-11T11:15:00Z',

  identityContext: {
    identityId: 'anon_f2k4j7h8i3g6l9o1h8i5e2f0g9h2c7d8',
    issuerId: 'TELEMATICS_PROVIDER_XYZ', // ← Wrong issuer for MANUFACTURER source
    scope: 'telematics-only',
    environment: 'production',
    trustLevel: 'MEDIUM',
    issuedAt: '2025-06-01T10:00:00Z',
    expiresAt: '2027-06-01T10:00:00Z',
    revoked: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 7: LOW-TRUST PARTNER - ACCEPTABLE WITH LIMITATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A low-confidence partner (small, newer service center) submits
 * a maintenance feed. Identity context is valid but trust level is LOW.
 *
 * Identity characteristics:
 * - Valid identityId and supporting context
 * - Trust level: LOW (newer, less-established partner)
 * - All temporal and structural checks pass
 *
 * Default Policy Behavior:
 * - allowLowTrustBinding: true
 * - LOW_TRUST_BINDING is a LIMITING issue but permitted by policy
 *
 * Expected Outcome: BOUND_WITH_LIMITATIONS
 * - Feed proceeds with explicit trust limitation flag
 * - Downstream systems see LOW_TRUST_BINDING and apply extra caution
 * - Operationally useful: don't reject good data from newer partners,
 *   but flag it for additional scrutiny
 */
export const caseLowTrustPartnerAcceptable: DataEngineIdentityBindingCandidate = {
  intakeCandidateId: 'cand_20260311_lowtr_001',
  sourceOrigin: 'SERVICE',
  candidateTimestamp: '2026-03-11T13:45:00Z',

  identityContext: {
    identityId: 'anon_g3l5k8i9j4h7m0p2i9j6f3g1h0i3d8e9',
    issuerId: 'NEW_SERVICE_PARTNER_2024',
    scope: 'partner-services',
    environment: 'production',
    trustLevel: 'LOW', // ← Low trust but otherwise valid
    issuedAt: '2025-06-15T09:00:00Z',
    expiresAt: '2027-06-15T09:00:00Z',
    revoked: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 8: MISSING ISSUER CONTEXT - UNRESOLVED
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A feed arrives with identityId but no issuer information.
 * Cannot assess where the identity came from or whether it's trustworthy.
 *
 * Identity characteristics:
 * - identityId present
 * - But: NO issuerId
 * - Missing critical context for binding assessment
 * - This is unresolvable without issuer context
 *
 * Expected Outcome: UNRESOLVED
 * - MISSING_ISSUER_CONTEXT is a LIMITING issue that signals critical missing context
 * - Lack of issuer context prevents confident binding decision
 * - Feed cannot proceed; upstream must provide issuer information
 * - Status is UNRESOLVED, not BOUND_WITH_LIMITATIONS
 */
export const caseMissingIssuerContext: DataEngineIdentityBindingCandidate = {
  intakeCandidateId: 'cand_20260311_noissuer_001',
  sourceOrigin: 'OTHER',
  candidateTimestamp: '2026-03-11T14:20:00Z',

  identityContext: {
    identityId: 'anon_h4m6l9j0k5i8n1q3j0k7g4h2i1j4e9f0',
    // issuerId missing ← CRITICAL
    scope: undefined,
    environment: 'production',
    trustLevel: 'LOW',
    issuedAt: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z',
    revoked: false,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CASE 9: ENVIRONMENT MISMATCH - WARNING WITH BINDING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Scenario: A feed marked for 'staging' environment is received by system
 * running in 'production'. This is unusual but not necessarily dangerous.
 *
 * Default Policy Behavior:
 * - environmentMismatchBehavior: 'WARN'
 * - Environment mismatch triggers warning but allows binding
 *
 * Expected Outcome: BOUND_WITH_LIMITATIONS
 * - ENVIRONMENT_MISMATCH raised as warning
 * - Feed can proceed but with environment concern flagged
 * - Useful for cross-environment testing or data migration scenarios
 */
export const caseEnvironmentMismatch: DataEngineIdentityBindingCandidate = {
  intakeCandidateId: 'cand_20260311_envmis_001',
  sourceOrigin: 'TELEMATICS',
  candidateTimestamp: '2026-03-11T15:00:00Z',

  identityContext: {
    identityId: 'anon_i5n7m0k1l6j9o2r4k1l8h5i3j2k5f0g1',
    issuerId: 'TELEMATICS_PROVIDER_XYZ',
    scope: 'telematics-partners',
    environment: 'staging', // ← Mismatch: system is 'production'
    trustLevel: 'MEDIUM',
    issuedAt: '2026-01-15T08:00:00Z',
    expiresAt: '2027-01-15T08:00:00Z',
    revoked: false,
  },
};
