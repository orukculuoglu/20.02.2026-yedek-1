/**
 * Anonymous Vehicle Identity - Phase 3 Integration Tests
 * 
 * Tests for attestation, integrity verification, and attested envelope building
 * 
 * Coverage:
 * - Envelope fingerprint generation (deterministic)
 * - Attestation creation with proper metadata
 * - Attested envelope assembly
 * - Input validation and error handling
 * - Consistency across multiple calls
 */

import {
  issueAnonymousVehicleIdentity,
  buildAnonymousVehicleIdentityScopeMetadata,
  buildAnonymousVehicleIdentityEnvelope,
  buildAnonymousVehicleIdentityEnvelopeFingerprint,
  buildAnonymousVehicleIdentityAttestation,
  buildAnonymousVehicleIdentityAttestedEnvelope,
  AnonymousVehicleIdentityRequest,
  AnonymousVehicleIdentityScopeMetadataInput,
  AnonymousVehicleIdentityAttestationInput,
} from '../anonymousVehicleIdentity';

describe('Anonymous Vehicle Identity - Phase 3: Attestation & Integrity', () => {
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ENVELOPE FINGERPRINT TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('buildAnonymousVehicleIdentityEnvelopeFingerprint', () => {
    it('should generate a 32-character hex fingerprint', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      const fingerprint = buildAnonymousVehicleIdentityEnvelopeFingerprint(identity, scopeMetadata);

      expect(fingerprint).toMatch(/^[a-f0-9]{32}$/);
    });

    it('should generate deterministic fingerprint (same inputs = same fingerprint)', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      const fingerprint1 = buildAnonymousVehicleIdentityEnvelopeFingerprint(identity, scopeMetadata);
      const fingerprint2 = buildAnonymousVehicleIdentityEnvelopeFingerprint(identity, scopeMetadata);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should generate different fingerprints from different identities', () => {
      const identity1 = issueAnonymousVehicleIdentity(baseRequest);
      const request2 = { ...baseRequest, vin: 'JF1GC4B3X0E002346' };
      const identity2 = issueAnonymousVehicleIdentity(request2);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      const fingerprint1 = buildAnonymousVehicleIdentityEnvelopeFingerprint(identity1, scopeMetadata);
      const fingerprint2 = buildAnonymousVehicleIdentityEnvelopeFingerprint(identity2, scopeMetadata);

      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should generate different fingerprints from different scope metadata', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata1 = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const scopeMetadata2Input = { ...baseScopeMetadataInput, usagePolicy: 'READ_ONLY' };
      const scopeMetadata2 = buildAnonymousVehicleIdentityScopeMetadata(scopeMetadata2Input);

      const fingerprint1 = buildAnonymousVehicleIdentityEnvelopeFingerprint(identity, scopeMetadata1);
      const fingerprint2 = buildAnonymousVehicleIdentityEnvelopeFingerprint(identity, scopeMetadata2);

      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should support custom attestation version in fingerprint', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      const fingerprint1 = buildAnonymousVehicleIdentityEnvelopeFingerprint(identity, scopeMetadata, '1.0');
      const fingerprint2 = buildAnonymousVehicleIdentityEnvelopeFingerprint(identity, scopeMetadata, '1.1');

      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ATTESTATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('buildAnonymousVehicleIdentityAttestation', () => {
    it('should create attestation with all required fields', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);

      expect(attestation).toHaveProperty('attestationId');
      expect(attestation).toHaveProperty('attestationVersion');
      expect(attestation).toHaveProperty('issuerId');
      expect(attestation).toHaveProperty('issuedAt');
      expect(attestation).toHaveProperty('protocolVersion');
      expect(attestation).toHaveProperty('attestationType');
      expect(attestation).toHaveProperty('attestationStatus');
      expect(attestation).toHaveProperty('envelopeFingerprint');
    });

    it('should generate attestation with correct ID format (attest_<hash>)', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);

      expect(attestation.attestationId).toMatch(/^attest_/);
      expect(attestation.attestationId.length).toBe(22); // 'attest_' (7) + 16-char hex
    });

    it('should use provided attestation version', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestationInput = { ...baseAttestationInput, attestationVersion: '1.1' };

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, attestationInput);

      expect(attestation.attestationVersion).toBe('1.1');
    });

    it('should default attestation version to 1.0', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestationInput = { issuerId: 'EXPERTISE' };

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, attestationInput);

      expect(attestation.attestationVersion).toBe('1.0');
    });

    it('should use provided issuer ID', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);

      expect(attestation.issuerId).toBe('EXPERTISE');
    });

    it('should default attestation type to SELF_ASSERTED', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestationInput = { issuerId: 'EXPERTISE' };

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, attestationInput);

      expect(attestation.attestationType).toBe('SELF_ASSERTED');
    });

    it('should default attestation status to ISSUED', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestationInput = { issuerId: 'EXPERTISE' };

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, attestationInput);

      expect(attestation.attestationStatus).toBe('ISSUED');
    });

    it('should default timestamp to current time if not provided', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestationInput = { issuerId: 'EXPERTISE' };
      const beforeTime = new Date().toISOString();

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, attestationInput);

      const afterTime = new Date().toISOString();
      // ISO 8601 strings are lexicographically comparable
      expect(attestation.issuedAt >= beforeTime && attestation.issuedAt <= afterTime).toBe(true);
    });

    it('should use provided timestamp', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const timestamp = '2026-03-09T10:30:00Z';
      const attestationInput = { ...baseAttestationInput, timestamp };

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, attestationInput);

      expect(attestation.issuedAt).toBe(timestamp);
    });

    it('should reference identity protocol version', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);

      expect(attestation.protocolVersion).toBe(identity.protocolVersion);
    });

    it('should include envelope fingerprint', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const expectedFingerprint = buildAnonymousVehicleIdentityEnvelopeFingerprint(
        identity,
        scopeMetadata,
        '1.0'
      );

      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);

      expect(attestation.envelopeFingerprint).toBe(expectedFingerprint);
    });

    it('should throw error if issuerId is missing', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const invalidInput = { ...baseAttestationInput, issuerId: '' };

      expect(() => {
        buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, invalidInput);
      }).toThrow('Missing required attestation field: issuerId');
    });

    it('should generate deterministic attestation ID', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const input = { ...baseAttestationInput, timestamp: '2026-03-09T10:30:00Z' };

      const attestation1 = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, input);
      const attestation2 = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, input);

      expect(attestation1.attestationId).toBe(attestation2.attestationId);
    });

    it('should generate different attestation IDs from different timestamps', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const input1 = { ...baseAttestationInput, timestamp: '2026-03-09T10:30:00Z' };
      const input2 = { ...baseAttestationInput, timestamp: '2026-03-09T10:31:00Z' };

      const attestation1 = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, input1);
      const attestation2 = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, input2);

      expect(attestation1.attestationId).not.toBe(attestation2.attestationId);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ATTESTED ENVELOPE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('buildAnonymousVehicleIdentityAttestedEnvelope', () => {
    it('should create attested envelope with all components', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);

      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(
        identity,
        scopeMetadata,
        attestation
      );

      expect(attestedEnvelope).toHaveProperty('identity', identity);
      expect(attestedEnvelope).toHaveProperty('scopeMetadata', scopeMetadata);
      expect(attestedEnvelope).toHaveProperty('attestation', attestation);
    });

    it('should throw error if identity is missing</anonymousVehicleId>', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const invalidIdentity = { ...identity, anonymousVehicleId: '' };

      expect(() => {
        buildAnonymousVehicleIdentityAttestedEnvelope(invalidIdentity, scopeMetadata, attestation);
      }).toThrow('Invalid identity: missing anonymousVehicleId');
    });

    it('should throw error if scope metadata is missing issuerId', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const invalidScopeMetadata = { ...scopeMetadata, issuerId: '' };

      expect(() => {
        buildAnonymousVehicleIdentityAttestedEnvelope(identity, invalidScopeMetadata, attestation);
      }).toThrow('Invalid scope metadata: missing issuerId');
    });

    it('should throw error if attestation is missing attestationId', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const invalidAttestation = { ...attestation, attestationId: '' };

      expect(() => {
        buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, invalidAttestation);
      }).toThrow('Invalid attestation: missing attestationId');
    });

    it('should throw error if attestation issuerId does not match scope metadata issuerId', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const invalidAttestation = { ...attestation, issuerId: 'DIFFERENT_ISSUER' };

      expect(() => {
        buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, invalidAttestation);
      }).toThrow('Mismatch: attestation issuerId does not match scope metadata issuerId');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3 END-TO-END INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Phase 3 Complete Flow', () => {
    it('should complete full Phase 1 + Phase 2 + Phase 3 flow', () => {
      // Phase 1: Issue identity
      const identity = issueAnonymousVehicleIdentity(baseRequest);

      // Assertions for Phase 1
      expect(identity.anonymousVehicleId).toBeDefined();
      expect(identity.anonymousVehicleId).toMatch(/^anon_/);
      expect(identity).not.toHaveProperty('vin');

      // Phase 2: Build scope metadata
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      // Assertions for Phase 2
      expect(scopeMetadata.issuerId).toBe('EXPERTISE');
      expect(scopeMetadata.domain).toBe('maintenance');

      // Phase 2: Build envelope
      const envelope = buildAnonymousVehicleIdentityEnvelope(identity, scopeMetadata);

      // Assertions for Phase 2 envelope
      expect(envelope.identity).toBe(identity);
      expect(envelope.scopeMetadata).toBe(scopeMetadata);

      // Phase 3: Create attestation
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);

      // Assertions for Phase 3
      expect(attestation.attestationId).toBeDefined();
      expect(attestation.issuerId).toBe('EXPERTISE');
      expect(attestation.envelopeFingerprint).toBeDefined();

      // Phase 3: Build attested envelope
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // Final assertions
      expect(attestedEnvelope.identity).toBe(identity);
      expect(attestedEnvelope.scopeMetadata).toBe(scopeMetadata);
      expect(attestedEnvelope.attestation).toBe(attestation);
    });

    it('should handle multiple issuers creating attestations for same identity', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      // First issuer creates attestation
      const attestation1 = buildAnonymousVehicleIdentityAttestation(
        identity,
        scopeMetadata,
        baseAttestationInput
      );

      // Different issuer tries to create attestation with different scope metadata
      const differentIssuerMetadataInput = { ...baseScopeMetadataInput, issuerId: 'DIFFERENT_ISSUER' };
      const differentIssuerMetadata = buildAnonymousVehicleIdentityScopeMetadata(differentIssuerMetadataInput);
      const differentIssuerInput = { ...baseAttestationInput, issuerId: 'DIFFERENT_ISSUER' };

      // Should successfully create attestation with matching issuer ID
      const attestation2 = buildAnonymousVehicleIdentityAttestation(
        identity,
        differentIssuerMetadata,
        differentIssuerInput
      );

      // Attestations should have different IDs (from different timestamps/issuers)
      expect(attestation1.attestationId).not.toBe(attestation2.attestationId);
    });

    it('should maintain envelope fingerprint consistency across phase progression', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);

      // Compute fingerprint directly
      const fingerprint = buildAnonymousVehicleIdentityEnvelopeFingerprint(identity, scopeMetadata);

      // Create attestation (which includes fingerprint)
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);

      // Verify fingerprint matches
      expect(attestation.envelopeFingerprint).toBe(fingerprint);

      // Create final envelope
      const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // Verify all components are present
      expect(attestedEnvelope.attestation.envelopeFingerprint).toBe(fingerprint);
    });
  });
});
