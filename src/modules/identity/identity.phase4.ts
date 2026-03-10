import type {
  AnonymousVehicleIdentityAttestedEnvelope,
  AnonymousVehicleIdentityVerificationInput,
  AnonymousVehicleIdentityVerificationResult,
  AnonymousVehicleIdentityVerificationStatus,
} from './identity.types';
import { generateDeterministicHash } from './identity.phase1';
import { buildAnonymousVehicleIdentityEnvelopeFingerprint } from './identity.phase2';

/**
 * PHASE 4: ENVELOPE VERIFICATION (11-point consistency check)
 *
 * Verify anonymous vehicle identity envelope integrity through 11-point check:
 * - All required fields are present
 * - Issuer ID consistency across layers
 * - Protocol version consistency
 * - Fingerprint integrity
 * - Optional expected values (if provided)
 *
 * This does NOT:
 * - Use VIN
 * - Verify VIN matches ID
 * - Validate issuer authority
 * - Check cryptographic signatures
 * - Implement proof-of-origin
 *
 * @param envelope - AnonymousVehicleIdentityAttestedEnvelope to verify
 * @param input - AnonymousVehicleIdentityVerificationInput with expected values
 * @returns AnonymousVehicleIdentityVerificationResult with status and details
 */
export function verifyAnonymousVehicleIdentityEnvelope(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  input: AnonymousVehicleIdentityVerificationInput
): AnonymousVehicleIdentityVerificationResult {
  const reasons: string[] = [];
  let status: AnonymousVehicleIdentityVerificationStatus = 'VALID';
  const verifiedAt = new Date().toISOString();

  // Generate verification ID (deterministic)
  const verificationIdInput = `${envelope.identity.anonymousVehicleId}|${envelope.attestation.attestationId}|${verifiedAt}`;
  const verificationIdSuffix = generateDeterministicHash(verificationIdInput).substring(0, 16);
  const verificationId = `verify_${verificationIdSuffix}`;

  // Check 1: Required identity fields
  if (!envelope.identity?.anonymousVehicleId) {
    reasons.push('Identity missing anonymousVehicleId');
    status = 'INVALID';
  }

  // Check 2: Required scope metadata fields
  if (!envelope.scopeMetadata?.issuerId) {
    reasons.push('Scope metadata missing issuerId');
    status = 'INVALID';
  }

  // Check 3: Required attestation fields
  if (!envelope.attestation?.attestationId) {
    reasons.push('Attestation missing attestationId');
    status = 'INVALID';
  }

  // Check 4: Issuer consistency
  if (envelope.attestation.issuerId !== envelope.scopeMetadata.issuerId) {
    reasons.push(
      `Attestation issuerId (${envelope.attestation.issuerId}) does not match scope issuerId (${envelope.scopeMetadata.issuerId})`
    );
    status = 'INVALID';
  }

  // Check 5: Identity and scope protocol version consistency
  if (envelope.identity.protocolVersion !== envelope.scopeMetadata.protocolVersion) {
    reasons.push(
      `Identity protocol version (${envelope.identity.protocolVersion}) does not match scope protocol version (${envelope.scopeMetadata.protocolVersion})`
    );
    status = 'PROTOCOL_MISMATCH';
  }

  // Check 6: Attestation and identity protocol version consistency
  if (envelope.attestation.protocolVersion !== envelope.identity.protocolVersion) {
    reasons.push(
      `Attestation protocol version (${envelope.attestation.protocolVersion}) does not match identity protocol version (${envelope.identity.protocolVersion})`
    );
    status = 'PROTOCOL_MISMATCH';
  }

  // Check 7: Recompute fingerprint and validate
  const recomputedFingerprint = buildAnonymousVehicleIdentityEnvelopeFingerprint(
    envelope.identity,
    envelope.scopeMetadata,
    envelope.attestation.attestationVersion
  );

  if (recomputedFingerprint !== envelope.attestation.envelopeFingerprint) {
    reasons.push(
      `Envelope fingerprint mismatch: expected ${envelope.attestation.envelopeFingerprint}, computed ${recomputedFingerprint}`
    );
    status = 'INVALID';
  }

  // Check 8: Optional expected issuer ID
  if (input.expectedIssuerId && envelope.scopeMetadata.issuerId !== input.expectedIssuerId) {
    reasons.push(
      `Expected issuerId (${input.expectedIssuerId}) does not match actual issuerId (${envelope.scopeMetadata.issuerId})`
    );
    status = 'UNAUTHORIZED_ISSUER';
  }

  // Check 9: Optional expected domain
  if (input.expectedDomain && envelope.identity.domain !== input.expectedDomain) {
    reasons.push(
      `Expected domain (${input.expectedDomain}) does not match actual domain (${envelope.identity.domain})`
    );
    status = 'WRONG_SCOPE';
  }

  // Check 10: Optional expected context class
  if (input.expectedContextClass && envelope.identity.contextClass !== input.expectedContextClass) {
    reasons.push(
      `Expected context class (${input.expectedContextClass}) does not match actual context class (${envelope.identity.contextClass})`
    );
    status = 'WRONG_SCOPE';
  }

  // Check 11: Optional expected protocol version
  if (input.expectedProtocolVersion && envelope.identity.protocolVersion !== input.expectedProtocolVersion) {
    reasons.push(
      `Expected protocol version (${input.expectedProtocolVersion}) does not match actual protocol version (${envelope.identity.protocolVersion})`
    );
    status = 'PROTOCOL_MISMATCH';
  }

  // Build result
  const result: AnonymousVehicleIdentityVerificationResult = {
    verificationId,
    verifiedAt,
    status,
    protocolVersion: envelope.identity.protocolVersion,
    verificationVersion: input.verificationVersion,
    issuerId: envelope.scopeMetadata.issuerId,
    envelopeFingerprint: envelope.attestation.envelopeFingerprint,
    reasons,
  };

  return result;
}
