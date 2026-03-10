import type {
  AnonymousVehicleIdentityAttestedEnvelope,
  AnonymousVehicleIdentityProofInput,
  AnonymousVehicleIdentityProof,
  AnonymousVehicleIdentityProofEnvelope,
} from './identity.types';
import { generateDeterministicHash } from './identity.phase1';

/**
 * PHASE 7: ANONYMOUS VEHICLE IDENTITY PROOF LAYER
 *
 * PURPOSE
 * ───────
 * Add a protocol-level proof structure to attested envelopes.
 * This phase creates the standardized proof framework that enables
 * future phases (Phase 8+) to add cryptographic validation,
 * distributed proof strategies, and advanced trust mechanisms.
 *
 * Does NOT validate:
 * - Cryptographic signatures
 * - Certificate chains
 * - External authorities
 * - Proof-of-origin
 *
 * This is a pure structural proof layer.
 */

/**
 * Build proof fingerprint for an Anonymous Vehicle Identity Attested Envelope
 *
 * Pure function: Creates deterministic hash representing proof identity
 * Does NOT include VIN, does NOT validate externally, does NOT use cryptography
 *
 * INPUTS:
 * - envelope: AnonymousVehicleIdentityAttestedEnvelope (from Phase 3-6)
 * - input: Proof input (optional fields for customization)
 *
 * COMPUTATION:
 * - Hash envelope fingerprint + proof metadata
 * - Ensures unique identifiers for each proof
 * - Enables future binding verification
 *
 * @param envelope - Attested envelope with Phase 1-6 data
 * @param input - Optional proof input parameters
 * @returns 32-character hex proof fingerprint
 */
export function buildAnonymousVehicleIdentityProofFingerprint(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  input: AnonymousVehicleIdentityProofInput
): string {
  // Extract proof metadata
  const proofType = input.proofType || 'STRUCTURAL_PROOF';
  const proofVersion = input.proofVersion || '1.0';
  const timestamp = input.timestamp || new Date().toISOString();
  const proofBindingRef = input.proofBindingRef || 'default';

  // Create deterministic input from proof + envelope fields
  // Order is critical for consistency
  const fingerprintInput = [
    envelope.attestation.envelopeFingerprint,
    envelope.attestation.issuerId,
    envelope.attestation.attestationId,
    proofType,
    proofVersion,
    timestamp,
    proofBindingRef,
    envelope.attestation.protocolVersion,
  ].join('|');

  // Generate deterministic hash
  return generateDeterministicHash(fingerprintInput);
}

/**
 * Build an Anonymous Vehicle Identity Proof
 *
 * Pure function: Creates proof structure for a Phase 3-6 attested envelope
 *
 * INPUT:
 * - envelope: AnonymousVehicleIdentityAttestedEnvelope (from Phase 1-6)
 * - input: Optional proof parameters (proofId, proofVersion, proofType, proofBindingRef, timestamp)
 *
 * OUTPUT:
 * AnonymousVehicleIdentityProof containing:
 * - Unique proof ID (deterministic from envelope + timestamp)
 * - Proof metadata (version, type, status)
 * - Proof fingerprint (deterministic)
 * - Issuer and protocol version from envelope
 * - References to envelope via fingerprint
 *
 * DEFAULTS:
 * - proofVersion: '1.0'
 * - proofType: 'STRUCTURAL_PROOF'
 * - timestamp: current ISO time
 * - proofBindingRef: envelope fingerprint
 *
 * VALIDATION:
 * - Verifies envelope has attestation with fingerprint
 *
 * @param envelope - Attested envelope from Phases 1-6
 * @param input - Optional proof input parameters
 * @returns AnonymousVehicleIdentityProof
 */
export function buildAnonymousVehicleIdentityProof(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  input: AnonymousVehicleIdentityProofInput
): AnonymousVehicleIdentityProof {
  // Validate inputs
  if (!envelope?.attestation) {
    throw new Error('Invalid envelope: missing attestation');
  }

  if (!envelope.attestation.envelopeFingerprint) {
    throw new Error('Invalid attestation: missing envelopeFingerprint');
  }

  // Extract proof parameters with defaults
  const proofVersion = input?.proofVersion || '1.0';
  const proofType = input?.proofType || 'STRUCTURAL_PROOF';
  const timestamp = input?.timestamp || new Date().toISOString();
  const proofBindingRef = input?.proofBindingRef || envelope.attestation.envelopeFingerprint;

  // Build proof ID (deterministic from envelope + timestamp)
  const proofIdInput = `${envelope.attestation.envelopeFingerprint}|${timestamp}|${proofType}`;
  const proofIdSuffix = generateDeterministicHash(proofIdInput).substring(0, 16);
  const proofId = input?.proofId || `proof_${proofIdSuffix}`;

  // Build proof fingerprint
  const proofFingerprint = buildAnonymousVehicleIdentityProofFingerprint(envelope, {
    proofVersion,
    proofType,
    timestamp,
    proofBindingRef,
  });

  // Create proof object
  const proof: AnonymousVehicleIdentityProof = {
    proofId,
    proofVersion,
    proofType,
    proofStatus: 'CREATED',
    issuerId: envelope.attestation.issuerId,
    protocolVersion: envelope.attestation.protocolVersion,
    createdAt: timestamp,
    envelopeFingerprint: envelope.attestation.envelopeFingerprint,
    proofFingerprint,
    proofBindingRef,
  };

  return proof;
}

/**
 * Build an Anonymous Vehicle Identity Proof Envelope
 *
 * Pure function: Combines attested envelope with proof into final package
 *
 * INPUT:
 * - envelope: AnonymousVehicleIdentityAttestedEnvelope (from Phase 1-5)
 * - proof: AnonymousVehicleIdentityProof (from Phase 7)
 *
 * OUTPUT:
 * AnonymousVehicleIdentityProofEnvelope containing:
 * - All Phase 1-5 data (identity, scope, attestation)
 * - Phase 7 proof structure
 *
 * VALIDATION:
 * - Verifies envelope has all required fields
 * - Verifies proof has all required fields
 * - Ensures consistency between envelope and proof issuerId
 *
 * @param envelope - Attested envelope from Phases 1-6
 * @param proof - Proof object from Phase 7
 * @returns AnonymousVehicleIdentityProofEnvelope
 */
export function buildAnonymousVehicleIdentityProofEnvelope(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  proof: AnonymousVehicleIdentityProof
): AnonymousVehicleIdentityProofEnvelope {
  // Validate attested envelope
  if (!envelope?.identity?.anonymousVehicleId) {
    throw new Error('Invalid envelope: missing identity');
  }

  if (!envelope?.scopeMetadata?.issuerId) {
    throw new Error('Invalid envelope: missing scope metadata');
  }

  if (!envelope?.attestation?.attestationId) {
    throw new Error('Invalid envelope: missing attestation');
  }

  // Validate proof
  if (!proof?.proofId) {
    throw new Error('Invalid proof: missing proofId');
  }

  if (!proof?.envelopeFingerprint) {
    throw new Error('Invalid proof: missing envelopeFingerprint');
  }

  // Verify consistency between envelope and proof
  if (proof.envelopeFingerprint !== envelope.attestation.envelopeFingerprint) {
    throw new Error(
      'Mismatch: proof envelopeFingerprint does not match attestation envelopeFingerprint'
    );
  }

  if (proof.issuerId !== envelope.attestation.issuerId) {
    throw new Error('Mismatch: proof issuerId does not match attestation issuerId');
  }

  // Build final proof envelope
  const proofEnvelope: AnonymousVehicleIdentityProofEnvelope = {
    identity: envelope.identity,
    scopeMetadata: envelope.scopeMetadata,
    attestation: envelope.attestation,
    proof,
  };

  return proofEnvelope;
}
