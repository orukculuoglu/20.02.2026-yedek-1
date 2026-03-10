/**
 * Anonymous Vehicle Identity - Phase 5 Trust Validation Tests
 * 
 * Tests for local issuer trust registry and trust validation
 * 
 * Coverage:
 * - Issuer registry creation and querying
 * - Trust validation with local registry
 * - Domain authorization checking
 * - Context class authorization checking
 * - Revoked issuer detection
 * - Trust status validation
 * - Trust level assignment
 */

import {
  issueAnonymousVehicleIdentity,
  buildAnonymousVehicleIdentityScopeMetadata,
  buildAnonymousVehicleIdentityAttestation,
  buildAnonymousVehicleIdentityAttestedEnvelope,
  validateAnonymousVehicleIssuerTrust,
  AnonymousVehicleIdentityRequest,
  AnonymousVehicleIdentityScopeMetadataInput,
  AnonymousVehicleIdentityAttestationInput,
  AnonymousVehicleIssuerRegistry,
  AnonymousVehicleTrustedIssuer,
} from '../anonymousVehicleIdentity';

describe('Anonymous Vehicle Identity - Phase 5: Trust Validation', () => {
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

  // Build trusted issuer for EXPERTISE
  const trustedIssuer: AnonymousVehicleTrustedIssuer = {
    issuerId: 'EXPERTISE',
    issuerType: 'INTERNAL',
    issuerName: 'Expertise Auto Services',
    domains: ['maintenance', 'inspection'],
    contextClasses: ['commercial-vehicle', 'rental'],
    trustStatus: 'TRUSTED',
    trustLevel: 'HIGH',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-09T00:00:00Z',
    registryVersion: '1.0',
  };

  // Build trusted registry with EXPERTISE
  const trustedRegistry: AnonymousVehicleIssuerRegistry = {
    registryVersion: '1.0',
    issuers: {
      EXPERTISE: trustedIssuer,
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRY STRUCTURE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Issuer Registry Structure', () => {
    it('should create registry with trusted issuers', () => {
      // Given: Registry with issuer
      const registry: AnonymousVehicleIssuerRegistry = {
        registryVersion: '1.0',
        issuers: {
          EXPERTISE: trustedIssuer,
        },
      };

      // When: Accessing registry
      // Then: Issuer should be present
      expect(registry.issuers['EXPERTISE']).toBeDefined();
      expect(registry.issuers['EXPERTISE'].issuerId).toBe('EXPERTISE');
      expect(registry.registryVersion).toBe('1.0');
    });

    it('should support multiple issuers in registry', () => {
      // Given: Registry with multiple issuers
      const registry: AnonymousVehicleIssuerRegistry = {
        registryVersion: '1.0',
        issuers: {
          EXPERTISE: { ...trustedIssuer, issuerId: 'EXPERTISE' },
          INSURANCE_CO: {
            ...trustedIssuer,
            issuerId: 'INSURANCE_CO',
            issuerName: 'Insurance Company ABC',
            domains: ['insurance'],
          },
        },
      };

      // When: Checking registry
      // Then: Both issuers present
      expect(Object.keys(registry.issuers)).toHaveLength(2);
      expect(registry.issuers['EXPERTISE']).toBeDefined();
      expect(registry.issuers['INSURANCE_CO']).toBeDefined();
    });

    it('should include issuer metadata', () => {
      // Given: Trusted issuer
      // Then: All required metadata present
      expect(trustedIssuer.issuerId).toBe('EXPERTISE');
      expect(trustedIssuer.issuerType).toBe('INTERNAL');
      expect(trustedIssuer.issuerName).toBe('Expertise Auto Services');
      expect(trustedIssuer.domains).toContain('maintenance');
      expect(trustedIssuer.contextClasses).toContain('commercial-vehicle');
      expect(trustedIssuer.trustStatus).toBe('TRUSTED');
      expect(trustedIssuer.trustLevel).toBe('HIGH');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC TRUST VALIDATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Basic Trust Validation', () => {
    it('should validate trusted issuer with matching domain and context', () => {
      // Given: Valid envelope with trusted issuer
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating trust
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Should be TRUSTED
      expect(result.trustStatus).toBe('TRUSTED');
      expect(result.trustLevel).toBe('HIGH');
      expect(result.issuerId).toBe('EXPERTISE');
      expect(result.reasons).toHaveLength(0);
    });

    it('should generate unique trust validation IDs', () => {
      // Given: Same envelope
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating twice
      const result1 = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);
      const result2 = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: IDs should be different
      expect(result1.trustId).not.toBe(result2.trustId);
    });

    it('should include validated at timestamp', () => {
      // Given: Envelope
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);
      const beforeTime = new Date().toISOString();

      // When: Validating
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Timestamp should be in valid range
      const afterTime = new Date().toISOString();
      expect(result.validatedAt >= beforeTime && result.validatedAt <= afterTime).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ISSUER NOT FOUND TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Issuer Not Found Detection', () => {
    it('should detect issuer not in registry', () => {
      // Given: Envelope with UNKNOWN_ISSUER
      const identity = issueAnonymousVehicleIdentity({
        ...baseRequest,
        issuerId: 'UNKNOWN_ISSUER',
      });
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, {
        ...baseAttestationInput,
        issuerId: 'UNKNOWN_ISSUER',
      });
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating trust
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Should be UNTRUSTED
      expect(result.trustStatus).toBe('UNTRUSTED');
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons[0]).toContain('not found in trusted issuer registry');
    });

    it('should return LOW trust level for unknown issuer', () => {
      // Given: Unknown issuer
      const identity = issueAnonymousVehicleIdentity({
        ...baseRequest,
        issuerId: 'UNKNOWN_ISSUER',
      });
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, {
        ...baseAttestationInput,
        issuerId: 'UNKNOWN_ISSUER',
      });
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Trust level should be LOW
      expect(result.trustLevel).toBe('LOW');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // REVOKED ISSUER TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Revoked Issuer Detection', () => {
    it('should detect revoked issuer', () => {
      // Given: Registry with revoked issuer
      const revokedRegistry: AnonymousVehicleIssuerRegistry = {
        registryVersion: '1.0',
        issuers: {
          EXPERTISE: {
            ...trustedIssuer,
            trustStatus: 'REVOKED',
            trustLevel: 'REVOKED',
          },
        },
      };

      // When: Creating envelope and validating
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = validateAnonymousVehicleIssuerTrust(envelope, revokedRegistry);

      // Then: Should detect REVOKED status
      expect(result.trustStatus).toBe('REVOKED');
      expect(result.reasons.some((r) => r.includes('REVOKED'))).toBe(true);
    });

    it('should reject envelope from revoked issuer', () => {
      // Given: Revoked issuer with REVOKED status
      const revokedRegistry: AnonymousVehicleIssuerRegistry = {
        registryVersion: '1.0',
        issuers: {
          EXPERTISE: {
            ...trustedIssuer,
            trustStatus: 'REVOKED',
            trustLevel: 'REVOKED',
          },
        },
      };

      // When: Validating envelope
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);
      const result = validateAnonymousVehicleIssuerTrust(envelope, revokedRegistry);

      // Then: Trust validation should fail
      expect(result.trustStatus).not.toBe('TRUSTED');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN AUTHORIZATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Domain Authorization Validation', () => {
    it('should accept issuer authorized for envelope domain', () => {
      // Given: Issuer authorized for 'maintenance' domain
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Should be TRUSTED (domain match)
      expect(result.trustStatus).toBe('TRUSTED');
    });

    it('should reject issuer not authorized for envelope domain', () => {
      // Given: Issuer NOT authorized for 'insurance' domain
      const identity = issueAnonymousVehicleIdentity({
        ...baseRequest,
        domain: 'insurance', // Not in trustedIssuer.domains
      });
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata({
        ...baseScopeMetadataInput,
        domain: 'insurance',
      });
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Should be UNTRUSTED
      expect(result.trustStatus).toBe('UNTRUSTED');
      expect(result.reasons.some((r) => r.includes('not authorized for domain'))).toBe(true);
    });

    it('should allow empty domain list (any domain)', () => {
      // Given: Issuer with empty domain list (authorized for all)
      const universalRegistry: AnonymousVehicleIssuerRegistry = {
        registryVersion: '1.0',
        issuers: {
          EXPERTISE: {
            ...trustedIssuer,
            domains: [], // Empty = authorized for all domains
          },
        },
      };

      // When: Creating envelope with any domain and validating
      const identity = issueAnonymousVehicleIdentity({
        ...baseRequest,
        domain: 'any-domain',
      });
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata({
        ...baseScopeMetadataInput,
        domain: 'any-domain',
      });
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = validateAnonymousVehicleIssuerTrust(envelope, universalRegistry);

      // Then: Should be TRUSTED (empty list allows all)
      expect(result.trustStatus).toBe('TRUSTED');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT CLASS AUTHORIZATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Context Class Authorization Validation', () => {
    it('should accept issuer authorized for envelope context class', () => {
      // Given: Issuer authorized for 'commercial-vehicle' context
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Should be TRUSTED
      expect(result.trustStatus).toBe('TRUSTED');
    });

    it('should reject issuer not authorized for envelope context class', () => {
      // Given: Issuer NOT authorized for 'personal' context
      const identity = issueAnonymousVehicleIdentity({
        ...baseRequest,
        contextClass: 'personal', // Not in trustedIssuer.contextClasses
      });
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata({
        ...baseScopeMetadataInput,
        contextClass: 'personal',
      });
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Should be UNTRUSTED
      expect(result.trustStatus).toBe('UNTRUSTED');
      expect(result.reasons.some((r) => r.includes('not authorized for context class'))).toBe(true);
    });

    it('should allow empty context class list (any context)', () => {
      // Given: Issuer with empty context class list
      const universalRegistry: AnonymousVehicleIssuerRegistry = {
        registryVersion: '1.0',
        issuers: {
          EXPERTISE: {
            ...trustedIssuer,
            contextClasses: [], // Empty = authorized for all contexts
          },
        },
      };

      // When: Creating envelope with any context and validating
      const identity = issueAnonymousVehicleIdentity({
        ...baseRequest,
        contextClass: 'any-context',
      });
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata({
        ...baseScopeMetadataInput,
        contextClass: 'any-context',
      });
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = validateAnonymousVehicleIssuerTrust(envelope, universalRegistry);

      // Then: Should be TRUSTED
      expect(result.trustStatus).toBe('TRUSTED');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTIPLE AUTHORIZATION FAILURES TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Multiple Authorization Failures', () => {
    it('should report all authorization failures', () => {
      // Given: Issuer that fails both domain AND context checks
      const identity = issueAnonymousVehicleIdentity({
        ...baseRequest,
        domain: 'insurance', // Not authorized
        contextClass: 'personal', // Not authorized
      });
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata({
        ...baseScopeMetadataInput,
        domain: 'insurance',
        contextClass: 'personal',
      });
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Should report both failures
      expect(result.trustStatus).toBe('UNTRUSTED');
      expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TRUST LEVEL ASSIGNMENT TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Trust Level Assignment', () => {
    it('should assign HIGH trust level for trusted issuer', () => {
      // Given: Trusted issuer with HIGH trust level
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Should have HIGH trust level
      expect(result.trustLevel).toBe('HIGH');
    });

    it('should assign LOW trust level for untrusted issuer', () => {
      // Given: Unknown issuer
      const identity = issueAnonymousVehicleIdentity({
        ...baseRequest,
        issuerId: 'UNKNOWN',
      });
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, {
        ...baseAttestationInput,
        issuerId: 'UNKNOWN',
      });
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Should have LOW trust level
      expect(result.trustLevel).toBe('LOW');
    });

    it('should assign REVOKED trust level for revoked issuer', () => {
      // Given: Revoked issuer
      const revokedRegistry: AnonymousVehicleIssuerRegistry = {
        registryVersion: '1.0',
        issuers: {
          EXPERTISE: {
            ...trustedIssuer,
            trustStatus: 'REVOKED',
            trustLevel: 'REVOKED',
          },
        },
      };

      // When: Validating envelope from revoked issuer
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = validateAnonymousVehicleIssuerTrust(envelope, revokedRegistry);

      // Then: Should have REVOKED trust level
      expect(result.trustLevel).toBe('REVOKED');
    });

    it('should assign MEDIUM trust level for partly authorized issuer', () => {
      // Given: Issuer with MEDIUM trust level
      const mediumRegistry: AnonymousVehicleIssuerRegistry = {
        registryVersion: '1.0',
        issuers: {
          EXPERTISE: {
            ...trustedIssuer,
            trustLevel: 'MEDIUM',
          },
        },
      };

      // When: Validating envelope
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = validateAnonymousVehicleIssuerTrust(envelope, mediumRegistry);

      // Then: Should respect MEDIUM trust level from registry
      expect(result.trustLevel).toBe('MEDIUM');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRY VERSION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Registry Version Tracking', () => {
    it('should include registry version in validation result', () => {
      // Given: Registry with version
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Result should include registry version
      expect(result.registryVersion).toBe(trustedRegistry.registryVersion);
    });

    it('should handle different registry versions', () => {
      // Given: Registry with version 2.0
      const v2Registry: AnonymousVehicleIssuerRegistry = {
        registryVersion: '2.0',
        issuers: {
          EXPERTISE: trustedIssuer,
        },
      };

      // When: Validating
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      const result = validateAnonymousVehicleIssuerTrust(envelope, v2Registry);

      // Then: Should use v2.0 registry version
      expect(result.registryVersion).toBe('2.0');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // NO VIN EXPOSURE TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('VIN Protection in Trust Validation', () => {
    it('should not expose VIN in trust validation result', () => {
      // Given: Envelope created from VIN
      const identity = issueAnonymousVehicleIdentity(baseRequest);
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, baseAttestationInput);
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating trust
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: VIN should never appear
      const resultStr = JSON.stringify(result);
      expect(resultStr).not.toContain('JF1GC4B3X0E002345');
      expect(resultStr).not.toContain('vin');
    });

    it('should not reference VIN in trust validation reasons', () => {
      // Given: Invalid envelope scenario
      const identity = issueAnonymousVehicleIdentity({
        ...baseRequest,
        issuerId: 'UNKNOWN',
      });
      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata(baseScopeMetadataInput);
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, {
        ...baseAttestationInput,
        issuerId: 'UNKNOWN',
      });
      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);

      // When: Validating (will fail)
      const result = validateAnonymousVehicleIssuerTrust(envelope, trustedRegistry);

      // Then: Reasons should never mention VIN
      const reasonsStr = result.reasons.join('|');
      expect(reasonsStr).not.toContain('JF1GC4B3X0E002345');
    });
  });
});
