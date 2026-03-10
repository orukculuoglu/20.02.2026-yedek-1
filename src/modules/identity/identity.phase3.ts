/**
 * Anonymous Vehicle Identity Layer - Phase 3: Attestation
 *
 * Purpose:
 * Add issuer attestation to envelopes, describing the provenance and validity
 * of anonymous vehicle identities through standardized attestation metadata.
 *
 * Design:
 * - Attestation represents the issuer's claim about the identity
 * - Includes fingerprint for integrity checking
 * - Does NOT include verification logic or proof-of-origin
 * - Serves as metadata layer describing how identity was created
 *
 * Data Flow (Phase 3):
 * AnonymousVehicleIdentityEnvelope (from Phase 2)
 *   ↓ Combined with AttestationInput
 * AnonymousVehicleIdentityAttestedEnvelope
 *   ↓ Standard package for Phase 4+ (verification, proof, federation)
 */

import type {
  AnonymousVehicleIdentity,
  AnonymousVehicleIdentityScopeMetadata,
  AnonymousVehicleIdentityAttestation,
  AnonymousVehicleIdentityAttestationInput,
  AnonymousVehicleIdentityAttestedEnvelope,
} from './identity.types';

import { generateDeterministicHash } from './identity.phase1';
import { buildAnonymousVehicleIdentityEnvelopeFingerprint } from './identity.phase2';

/**
 * Build anonymous vehicle identity attestation
 * Pure function: Creates issuer assertion/attestation for an identity envelope
 *
 * Attestation describes:
 * - Who issued the attestation (issuerId)
 * - Type of attestation (SELF_ASSERTED, THIRD_PARTY, etc.)
 * - Status of attestation (ISSUED, ACTIVE, REVOKED, EXPIRED)
 * - When attestation was created (issuedAt)
 * - Fingerprint for integrity verification
 *
 * Dependencies:
 * - generateDeterministicHash() from Phase 1 (for attestation ID)
 * - buildAnonymousVehicleIdentityEnvelopeFingerprint() from Phase 2 (for integrity)
 *
 * @param identity - AnonymousVehicleIdentity from Phase 1
 * @param scopeMetadata - AnonymousVehicleIdentityScopeMetadata from Phase 2
 * @param input - AttestationInput with issuer info and optional metadata
 * @returns AnonymousVehicleIdentityAttestation with fingerprint
 */
export function buildAnonymousVehicleIdentityAttestation(
  identity: AnonymousVehicleIdentity,
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata,
  input: AnonymousVehicleIdentityAttestationInput
): AnonymousVehicleIdentityAttestation {
  // Validate inputs
  if (!input.issuerId) {
    throw new Error('Missing required attestation field: issuerId');
  }

  // Build attestation ID (deterministic from identity + scope + issuer)
  const attestationIdInput = `${identity.anonymousVehicleId}|${input.issuerId}|${input.timestamp}`;
  const attestationIdSuffix = generateDeterministicHash(attestationIdInput).substring(0, 16);
  const attestationId = `attest_${attestationIdSuffix}`;

  // Generate envelope fingerprint
  const attestationVersionValue = input.attestationVersion || '1.0';
  const envelopeFingerprint = buildAnonymousVehicleIdentityEnvelopeFingerprint(
    identity,
    scopeMetadata,
    attestationVersionValue
  );

  // Build attestation
  const attestation: AnonymousVehicleIdentityAttestation = {
    attestationId,
    attestationVersion: attestationVersionValue,
    issuerId: input.issuerId,
    issuedAt: input.timestamp || new Date().toISOString(),
    protocolVersion: identity.protocolVersion,
    attestationType: input.attestationType || 'SELF_ASSERTED',
    attestationStatus: input.attestationStatus || 'ISSUED',
    envelopeFingerprint,
  };

  return attestation;
}

/**
 * Build anonymous vehicle identity attested envelope
 * Pure function: Combines identity, scope, and attestation into final package
 *
 * The attested envelope is the standard package for all downstream systems.
 * It includes:
 * - Phase 1: Anonymous identity (anonymousVehicleId)
 * - Phase 2: Business context (scope metadata)
 * - Phase 3: Issuer assertion (attestation)
 *
 * This envelope is passed to Phase 4 for verification and to Phase 5+ for
 * trust validation, temporal validation, proof structures, and federation rules.
 *
 * @param identity - AnonymousVehicleIdentity from Phase 1
 * @param scopeMetadata - AnonymousVehicleIdentityScopeMetadata from Phase 2
 * @param attestation - AnonymousVehicleIdentityAttestation from Phase 3
 * @returns AnonymousVehicleIdentityAttestedEnvelope containing all three components
 */
export function buildAnonymousVehicleIdentityAttestedEnvelope(
  identity: AnonymousVehicleIdentity,
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata,
  attestation: AnonymousVehicleIdentityAttestation
): AnonymousVehicleIdentityAttestedEnvelope {
  // Validate inputs
  if (!identity?.anonymousVehicleId) {
    throw new Error('Invalid identity: missing anonymousVehicleId');
  }

  if (!scopeMetadata?.issuerId) {
    throw new Error('Invalid scope metadata: missing issuerId');
  }

  if (!attestation?.attestationId) {
    throw new Error('Invalid attestation: missing attestationId');
  }

  // Verify attestation references match
  if (attestation.issuerId !== scopeMetadata.issuerId) {
    throw new Error('Mismatch: attestation issuerId does not match scope metadata issuerId');
  }

  // Build attested envelope
  const attestedEnvelope: AnonymousVehicleIdentityAttestedEnvelope = {
    identity,
    scopeMetadata,
    attestation,
  };

  return attestedEnvelope;
}
