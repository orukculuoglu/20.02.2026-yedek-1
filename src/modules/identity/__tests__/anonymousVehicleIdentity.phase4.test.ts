/**
 * Anonymous Vehicle Identity - Phase 4 Verification Protocol Tests
 * 
 * Tests for envelope verification, consistency checking, and validation
 * 
 * Coverage:
 * - Basic envelope verification (VALID case)
 * - Invalid envelope detection (missing fields)
 * - Fingerprint integrity validation
 * - Issuer consistency checking
 * - Protocol version consistency
 * - Scope matching (domain, context class)
 * - Unauthorized issuer detection
 * - Error handling and edge cases
 */

import {
  issueAnonymousVehicleIdentity,
  buildAnonymousVehicleIdentityScopeMetadata,
  buildAnonymousVehicleIdentityEnvelope,
  buildAnonymousVehicleIdentityAttestation,
  buildAnonymousVehicleIdentityAttestedEnvelope,
  verifyAnonymousVehicleIdentityEnvelope,
  AnonymousVehicleIdentityRequest,
  AnonymousVehicleIdentityScopeMetadataInput,
  AnonymousVehicleIdentityAttestationInput,
  AnonymousVehicleIdentityVerificationInput,
} from '../anonymousVehicleIdentity';

describe('Anonymous Vehicle Identity - Phase 4: Verification Protocol', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // TEST DATA SETUP
  // ═══════════════════════════════════════════════════════════════════════════

  const baseRequest: AnonymousVehicleIdentityRequest = {
    vin: 'JF1GC4B3X0E002345',
    issuerId: 'EXPERTISE',
    domain: 'maintenance',
    contextClass: 'commercial-vehicle',
    epochType: 'CURRENT_MONTH',
    timestamp: '2026-03-09T10:30:00Z',
    protocolVersion: '1.0',
  };

  const baseScopeMetadataInput: AnonymousVehicleIdentityScopeMetadataInput = {
    issuerId: 'EXPERTISE',
    issuerType: 'INTERNAL',
    domain: 'maintenance',
    subDomain: 'preventive-maintenance',
    contextClass: 'commercial-vehicle',
    usagePolicy: 'READ_WRITE',
    epochType: 'MONTHLY',
    protocolVersion: '1.0',
    scopeVersion: '1.0',
  };

  const baseAttestationInput: AnonymousVehicleIdentityAttestationInput = {
    issuerId: 'EXPERTISE',
    attestationType: 'SELF_ASSERTED',
    attestationStatus: 'ISSUED',
    attestationVersion: '1.0',
    timestamp: '2026-03-09T10:30:00Z',
  };

  const baseVerificationInput: AnonymousVehicleIdentityVerificationInput = {
    verificationVersion: '1.0',
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC VERIFICATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Basic Envelope Verification', () => {
    it('should successfully verify a valid attested envelope', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, baseVerificationInput);

      expect(result.status).toBe('VALID');
      expect(result.reasons).toHaveLength(0);
      expect(result.verificationId).toMatch(/^verify_/);
      expect(result.protocolVersion).toBe('1.0');
      expect(result.verificationVersion).toBe('1.0');
      expect(result.issuerId).toBe('EXPERTISE');
    });

    it('should generate unique verification IDs', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result1 = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, baseVerificationInput);
      // Small delay to ensure different timestamp
      const result2 = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, baseVerificationInput);

      expect(result1.verificationId).not.toBe(result2.verificationId);
    });

    it('should include verified at timestamp', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);
      const beforeTime = new Date().toISOString();

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, baseVerificationInput);

      const afterTime = new Date().toISOString();
      expect(result.verifiedAt >= beforeTime && result.verifiedAt <= afterTime).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INVALID ENVELOPE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Invalid Envelope Detection', () => {
    it('should detect missing identity anonymousVehicleId', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const invalidEnvelope = {
        ...attestedEnvelope,
        identity: { ...attestedEnvelope.identity, anonymousVehicleId: '' },
      };

      const result = verifyAnonymousVehicleIdentityEnvelope(invalidEnvelope, baseVerificationInput);

      expect(result.status).toBe('INVALID');
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons[0]).toContain('anonymousVehicleId');
    });

    it('should detect missing scope metadata issuerId', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const invalidEnvelope = {
        ...attestedEnvelope,
        scopeMetadata: { ...attestedEnvelope.scopeMetadata, issuerId: '' },
      };

      const result = verifyAnonymousVehicleIdentityEnvelope(invalidEnvelope, baseVerificationInput);

      expect(result.status).toBe('INVALID');
      expect(result.reasons.some((r) => r.includes('issuerId'))).toBe(true);
    });

    it('should detect missing attestation attestationId', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const invalidEnvelope = {
        ...attestedEnvelope,
        attestation: { ...attestedEnvelope.attestation, attestationId: '' },
      };

      const result = verifyAnonymousVehicleIdentityEnvelope(invalidEnvelope, baseVerificationInput);

      expect(result.status).toBe('INVALID');
      expect(result.reasons.some((r) => r.includes('attestationId'))).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ISSUER CONSISTENCY TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Issuer Consistency Verification', () => {
    it('should detect issuer mismatch between attestation and scope', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const invalidEnvelope = {
        ...attestedEnvelope,
        attestation: { ...attestedEnvelope.attestation, issuerId: 'DIFFERENT_ISSUER' },
      };

      const result = verifyAnonymousVehicleIdentityEnvelope(invalidEnvelope, baseVerificationInput);

      expect(result.status).toBe('INVALID');
      expect(result.reasons.some((r) => r.includes('issuerId'))).toBe(true);
    });

    it('should accept valid issuer when verification provides expected issuer ID', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
        ...baseVerificationInput,
        expectedIssuerId: 'EXPERTISE',
      });

      expect(result.status).toBe('VALID');
    });

    it('should detect unauthorized issuer when expected issuer does not match', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
        ...baseVerificationInput,
        expectedIssuerId: 'DIFFERENT_ISSUER',
      });

      expect(result.status).toBe('UNAUTHORIZED_ISSUER');
      expect(result.reasons.some((r) => r.includes('expectedIssuerId'))).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FINGERPRINT INTEGRITY TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Envelope Fingerprint Verification', () => {
    it('should detect fingerprint mismatch when identity is modified', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const invalidEnvelope = {
        ...attestedEnvelope,
        identity: { ...attestedEnvelope.identity, domain: 'different-domain' },
      };

      const result = verifyAnonymousVehicleIdentityEnvelope(invalidEnvelope, baseVerificationInput);

      expect(result.status).toBe('INVALID');
      expect(result.reasons.some((r) => r.includes('fingerprint'))).toBe(true);
    });

    it('should detect fingerprint mismatch when scope is modified', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const invalidEnvelope = {
        ...attestedEnvelope,
        scopeMetadata: { ...attestedEnvelope.scopeMetadata, usagePolicy: 'READ_ONLY' },
      };

      const result = verifyAnonymousVehicleIdentityEnvelope(invalidEnvelope, baseVerificationInput);

      expect(result.status).toBe('INVALID');
      expect(result.reasons.some((r) => r.includes('fingerprint'))).toBe(true);
    });

    it('should include envelope fingerprint in verification result', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, baseVerificationInput);

      expect(result.envelopeFingerprint).toBe(attestation.envelopeFingerprint);
      expect(result.envelopeFingerprint).toMatch(/^[a-f0-9]{32}$/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PROTOCOL VERSION CONSISTENCY TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Protocol Version Consistency', () => {
    it('should verify when all protocol versions match', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, baseVerificationInput);

      expect(result.status).toBe('VALID');
      expect(result.protocolVersion).toBe('1.0');
    });

    it('should detect protocol mismatch between identity and scope', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const invalidEnvelope = {
        ...attestedEnvelope,
        scopeMetadata: { ...attestedEnvelope.scopeMetadata, protocolVersion: '2.0' },
      };

      const result = verifyAnonymousVehicleIdentityEnvelope(invalidEnvelope, baseVerificationInput);

      expect(result.status).toBe('PROTOCOL_MISMATCH');
      expect(result.reasons.some((r) => r.includes('protocol version'))).toBe(true);
    });

    it('should detect protocol mismatch between attestation and identity', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const invalidEnvelope = {
        ...attestedEnvelope,
        attestation: { ...attestedEnvelope.attestation, protocolVersion: '2.0' },
      };

      const result = verifyAnonymousVehicleIdentityEnvelope(invalidEnvelope, baseVerificationInput);

      expect(result.status).toBe('PROTOCOL_MISMATCH');
    });

    it('should detect protocol mismatch when expected version differs', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
        ...baseVerificationInput,
        expectedProtocolVersion: '2.0',
      });

      expect(result.status).toBe('PROTOCOL_MISMATCH');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SCOPE MATCHING TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Scope Matching Verification', () => {
    it('should accept valid domain when expected domain matches', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
        ...baseVerificationInput,
        expectedDomain: 'maintenance',
      });

      expect(result.status).toBe('VALID');
    });

    it('should detect wrong scope when domain does not match', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
        ...baseVerificationInput,
        expectedDomain: 'insurance',
      });

      expect(result.status).toBe('WRONG_SCOPE');
      expect(result.reasons.some((r) => r.includes('domain'))).toBe(true);
    });

    it('should accept valid context class when expected context matches', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
        ...baseVerificationInput,
        expectedContextClass: 'commercial-vehicle',
      });

      expect(result.status).toBe('VALID');
    });

    it('should detect wrong scope when context class does not match', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
        ...baseVerificationInput,
        expectedContextClass: 'personal-vehicle',
      });

      expect(result.status).toBe('WRONG_SCOPE');
      expect(result.reasons.some((r) => r.includes('context class'))).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIPLE CRITERIA TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Multiple Criteria Verification', () => {
    it('should verify with multiple expected criteria', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
        verificationVersion: '1.0',
        expectedIssuerId: 'EXPERTISE',
        expectedDomain: 'maintenance',
        expectedContextClass: 'commercial-vehicle',
        expectedProtocolVersion: '1.0',
      });

      expect(result.status).toBe('VALID');
    });

    it('should report first failure when multiple criteria fail', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
        verificationVersion: '1.0',
        expectedIssuerId: 'WRONG_ISSUER',
        expectedDomain: 'wrong-domain',
      });

      expect(result.status).toBe('UNAUTHORIZED_ISSUER'); // First check that fails (issuer check comes before domain)
      expect(result.reasons.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // NO VIN EXPOSURE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('VIN Protection in Verification', () => {
    it('should not expose VIN in verification result', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, baseVerificationInput);

      const resultStr = JSON.stringify(result);
      expect(resultStr).not.toContain('JF1GC4B3X0E002345');
      expect(resultStr).not.toContain('vin');
    });

    it('should not reference VIN in verification reasons', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const invalidEnvelope = {
        ...attestedEnvelope,
        identity: { ...attestedEnvelope.identity, anonymousVehicleId: '' },
      };

      const result = verifyAnonymousVehicleIdentityEnvelope(invalidEnvelope, baseVerificationInput);

      const reasonsStr = result.reasons.join('|');
      expect(reasonsStr).not.toContain('JF1GC4B3X0E002345');
    });
  });
});
