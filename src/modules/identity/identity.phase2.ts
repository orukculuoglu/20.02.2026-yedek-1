/**
 * Anonymous Vehicle Identity Layer - Phase 2: Scope Metadata & Envelope
 *
 * Purpose:
 * Add business and temporal context to anonymous vehicle identities through
 * standardized scope metadata and envelope packaging.
 *
 * Design:
 * - Scope metadata describes who issued it, where it's valid, and usage rules
 * - Envelope combines identity (Phase 1) with scope metadata (Phase 2)
 * - Fingerprint provides integrity checking for downstream phases
 * - All operations are pure functions with no side effects
 *
 * Data Flow (Phase 2):
 * AnonymousVehicleIdentity (from Phase 1)
 *   ↓ Combined with ScopeMetadataInput
 * AnonymousVehicleIdentityEnvelope
 *   ↓ Standard package for all downstream systems
 * (Phase 3+: Add attestation, proofs, federation)
 */

import type {
  AnonymousVehicleIdentity,
  AnonymousVehicleIdentityScopeMetadata,
  AnonymousVehicleIdentityScopeMetadataInput,
  AnonymousVehicleIdentityEnvelope,
} from './identity.types';

import { generateDeterministicHash } from './identity.phase1';

/**
 * Build anonymous vehicle identity scope metadata
 * Pure function: Creates standardized scope context for an identity
 *
 * Scope metadata describes:
 * - Who issued the identity (issuer, issuer type)
 * - Where it's valid (domain, sub-domain)
 * - What context it applies to (context class, usage policy)
 * - Temporal scope (epoch, epoch type, protocol version)
 *
 * @param input - Scope metadata input with all required fields
 * @returns AnonymousVehicleIdentityScopeMetadata with normalized epoch
 */
export function buildAnonymousVehicleIdentityScopeMetadata(
  input: AnonymousVehicleIdentityScopeMetadataInput
): AnonymousVehicleIdentityScopeMetadata {
  // Validate input
  if (!input.issuerId || !input.domain || !input.contextClass) {
    throw new Error('Missing required scope metadata fields: issuerId, domain, contextClass');
  }

  // Determine epoch based on epochType
  let epoch: string;
  if (input.epochType === 'MONTHLY') {
    const now = new Date();
    epoch = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  } else if (input.epochType === 'QUARTERLY') {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    epoch = `${now.getFullYear()}-Q${quarter}`;
  } else if (input.epochType === 'ANNUAL') {
    epoch = String(new Date().getFullYear());
  } else {
    // VERSION
    epoch = input.customEpoch || 'v1.0';
  }

  // Build scope metadata
  const scopeMetadata: AnonymousVehicleIdentityScopeMetadata = {
    issuerId: input.issuerId,
    issuerType: input.issuerType,
    domain: input.domain,
    subDomain: input.subDomain,
    contextClass: input.contextClass,
    usagePolicy: input.usagePolicy,
    epoch,
    epochType: input.epochType,
    protocolVersion: input.protocolVersion,
    scopeVersion: input.scopeVersion,
  };

  return scopeMetadata;
}

/**
 * Build anonymous vehicle identity envelope
 * Pure function: Combines identity and scope metadata into standard envelope
 *
 * The envelope is the standard package for passing identities between systems.
 * It includes both the anonymous identifier and business context metadata.
 *
 * @param identity - AnonymousVehicleIdentity from Phase 1
 * @param scopeMetadata - AnonymousVehicleIdentityScopeMetadata from Phase 2
 * @returns AnonymousVehicleIdentityEnvelope containing both components
 */
export function buildAnonymousVehicleIdentityEnvelope(
  identity: AnonymousVehicleIdentity,
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata
): AnonymousVehicleIdentityEnvelope {
  // Validate inputs
  if (!identity?.anonymousVehicleId) {
    throw new Error('Invalid identity: missing anonymousVehicleId');
  }

  if (!scopeMetadata?.issuerId) {
    throw new Error('Invalid scope metadata: missing issuerId');
  }

  // Build envelope
  const envelope: AnonymousVehicleIdentityEnvelope = {
    identity,
    scopeMetadata,
  };

  return envelope;
}

/**
 * Build anonymous vehicle identity envelope fingerprint
 * Pure function: Creates deterministic hash of identity + scope metadata
 *
 * The fingerprint is derived ONLY from identity and scope fields.
 * It does NOT include VIN or any verification data.
 * It enables integrity checking in future phases (but no verification in Phase 2).
 *
 * Used by Phase 3 (attestation) and later phases for binding verification.
 *
 * @param identity - AnonymousVehicleIdentity from Phase 1
 * @param scopeMetadata - AnonymousVehicleIdentityScopeMetadata from Phase 2
 * @param attestationVersion - Version for fingerprint generation (for future evolution)
 * @returns 32-character hex fingerprint
 */
export function buildAnonymousVehicleIdentityEnvelopeFingerprint(
  identity: AnonymousVehicleIdentity,
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata,
  attestationVersion: string = '1.0'
): string {
  // Create deterministic input from identity + scope fields
  // Order is critical for consistency across calls
  const fingerprintInput = [
    identity.anonymousVehicleId,
    identity.issuerId,
    identity.domain,
    identity.contextClass,
    identity.epoch,
    identity.protocolVersion,
    scopeMetadata.issuerId,
    scopeMetadata.issuerType,
    scopeMetadata.domain,
    scopeMetadata.subDomain || '',
    scopeMetadata.contextClass,
    scopeMetadata.usagePolicy,
    scopeMetadata.epoch,
    scopeMetadata.epochType,
    scopeMetadata.protocolVersion,
    scopeMetadata.scopeVersion,
    attestationVersion,
  ].join('|');

  // Generate deterministic hash
  return generateDeterministicHash(fingerprintInput);
}
