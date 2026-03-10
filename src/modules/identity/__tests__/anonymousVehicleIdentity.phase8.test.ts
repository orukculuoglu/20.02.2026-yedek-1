import {
  buildAnonymousVehicleIdentityAttestedEnvelope,
  buildAnonymousVehicleIdentityAttestation,
  buildAnonymousVehicleIdentityScopeMetadata,
  issueAnonymousVehicleIdentity,
  buildAnonymousVehicleIdentityProof,
  buildAnonymousVehicleIdentityProofEnvelope,
  buildAnonymousVehicleIdentityFederationMetadata,
  buildAnonymousVehicleIdentityFederationEnvelope,
  validateAnonymousVehicleIdentityFederation,
  AnonymousVehicleIdentityFederationMetadataInput,
  AnonymousVehicleIdentityFederationValidationInput,
  AnonymousVehicleIdentityProofEnvelope,
  AnonymousVehicleIdentityFederationEnvelope,
} from '../anonymousVehicleIdentity';

// Phase 8: Anonymous Vehicle Identity Federation/Interoperability Layer Tests
// Tests federation metadata, envelope composition, and local validation rules

describe('Anonymous Vehicle Identity - Phase 8: Federation Layer', () => {
  // Test data setup
  const now = new Date('2026-03-10T12:00:00Z');
  const nowISO = now.toISOString();

  // Base request for identity generation
  const baseRequest = {
    vin: 'JF1GC4B3X0E002345',
    issuerId: 'EXPERTISE',
    domain: 'maintenance',
    contextClass: 'commercial-vehicle',
    epochType: 'CURRENT_MONTH' as const,
    timestamp: nowISO,
    protocolVersion: '1.0',
  };

  // Build a test proof envelope (Phase 1-7)
  function createTestProofEnvelope(
    issuerId: string = 'EXPERTISE'
  ): AnonymousVehicleIdentityProofEnvelope {
    const identity = issueAnonymousVehicleIdentity(baseRequest);
    const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata({
      issuerId,
      issuerType: 'EXPERTISE',
      domain: 'maintenance',
      contextClass: 'commercial-vehicle',
      usagePolicy: 'READ_WRITE',
      epochType: 'MONTHLY',
      protocolVersion: '1.0',
      scopeVersion: '1.0',
    });

    const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, {
      issuerId,
      timestamp: nowISO,
      attestationVersion: '1.0',
      attestationType: 'SELF_ASSERTED',
      attestationStatus: 'ISSUED',
    });

    const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(
      identity,
      scopeMetadata,
      attestation
    );
    const proof = buildAnonymousVehicleIdentityProof(attestedEnvelope, {});

    return buildAnonymousVehicleIdentityProofEnvelope(attestedEnvelope, proof);
  }

  describe('1. Federation Metadata Creation', () => {
    it('should create federation metadata with defaults', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});

      expect(metadata.federationVersion).toBe('1.0');
      expect(metadata.federationStatus).toBe('FEDERATED');
      expect(metadata.interoperabilityLevel).toBe('LOCAL');
      expect(metadata.allowedIssuerIds).toEqual([]);
      expect(metadata.allowedDomains).toEqual([]);
    });

    it('should generate unique federationId', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata1 = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        timestamp: nowISO,
      });
      const metadata2 = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        timestamp: new Date(now.getTime() + 100).toISOString(),
      });

      expect(metadata1.federationId).not.toBe(metadata2.federationId);
      expect(metadata1.federationId).toMatch(/^fed_/);
    });

    it('should set issuerId from proof envelope', () => {
      const proofEnvelope = createTestProofEnvelope('AUTHORITY');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});

      expect(metadata.issuerId).toBe('AUTHORITY');
    });

    it('should use current time if timestamp omitted', () => {
      const proofEnvelope = createTestProofEnvelope();
      const beforeBuild = new Date();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});
      const afterBuild = new Date();

      const metadataTime = new Date(metadata.createdAt);
      expect(metadataTime.getTime()).toBeGreaterThanOrEqual(beforeBuild.getTime());
      expect(metadataTime.getTime()).toBeLessThanOrEqual(afterBuild.getTime() + 1000);
    });

    it('should have same createdAt and updatedAt initially', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        timestamp: nowISO,
      });

      expect(metadata.createdAt).toBe(metadata.updatedAt);
      expect(metadata.createdAt).toBe(nowISO);
    });

    it('should include all required fields', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});

      expect(metadata).toHaveProperty('federationId');
      expect(metadata).toHaveProperty('federationVersion');
      expect(metadata).toHaveProperty('federationStatus');
      expect(metadata).toHaveProperty('issuerId');
      expect(metadata).toHaveProperty('federationDomain');
      expect(metadata).toHaveProperty('interoperabilityLevel');
      expect(metadata).toHaveProperty('allowedIssuerIds');
      expect(metadata).toHaveProperty('allowedDomains');
      expect(metadata).toHaveProperty('createdAt');
      expect(metadata).toHaveProperty('updatedAt');
    });
  });

  describe('2. Federation Metadata - Custom Input', () => {
    it('should use custom federationVersion', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationVersion: '2.0',
      });

      expect(metadata.federationVersion).toBe('2.0');
    });

    it('should use custom federationStatus', () => {
      const proofEnvelope = createTestProofEnvelope();
      const statuses: Array<'FEDERATED' | 'ISOLATED' | 'RESTRICTED' | 'BLOCKED'> = [
        'FEDERATED',
        'ISOLATED',
        'RESTRICTED',
        'BLOCKED',
      ];

      statuses.forEach((status) => {
        const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
          federationStatus: status,
        });
        expect(metadata.federationStatus).toBe(status);
      });
    });

    it('should use custom federationDomain', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationDomain: 'automotive-network',
      });

      expect(metadata.federationDomain).toBe('automotive-network');
    });

    it('should use custom interoperabilityLevel', () => {
      const proofEnvelope = createTestProofEnvelope();
      const levels = ['LOCAL', 'REGIONAL', 'GLOBAL'] as const;

      levels.forEach((level) => {
        const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
          interoperabilityLevel: level,
        });
        expect(metadata.interoperabilityLevel).toBe(level);
      });
    });

    it('should use custom allowedIssuerIds', () => {
      const proofEnvelope = createTestProofEnvelope();
      const allowedIssuers = ['EXPERTISE', 'AUTHORITY', 'THIRD_PARTY'];
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        allowedIssuerIds: allowedIssuers,
      });

      expect(metadata.allowedIssuerIds).toEqual(allowedIssuers);
    });

    it('should use custom allowedDomains', () => {
      const proofEnvelope = createTestProofEnvelope();
      const allowedDomains = ['maintenance', 'insurance', 'rental'];
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        allowedDomains: allowedDomains,
      });

      expect(metadata.allowedDomains).toEqual(allowedDomains);
    });

    it('should use custom federationId', () => {
      const proofEnvelope = createTestProofEnvelope();
      const customId = 'custom_fed_001';
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationId: customId,
      });

      expect(metadata.federationId).toBe(customId);
    });
  });

  describe('3. Federation Envelope Creation', () => {
    it('should create federation envelope with all components', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      expect(federationEnvelope).toBeDefined();
      expect(federationEnvelope.identity).toBe(proofEnvelope.identity);
      expect(federationEnvelope.scopeMetadata).toBe(proofEnvelope.scopeMetadata);
      expect(federationEnvelope.attestation).toBe(proofEnvelope.attestation);
      expect(federationEnvelope.proof).toBe(proofEnvelope.proof);
      expect(federationEnvelope.federationMetadata).toBe(metadata);
    });

    it('should include all required fields', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      expect(federationEnvelope).toHaveProperty('identity');
      expect(federationEnvelope).toHaveProperty('scopeMetadata');
      expect(federationEnvelope).toHaveProperty('attestation');
      expect(federationEnvelope).toHaveProperty('proof');
      expect(federationEnvelope).toHaveProperty('federationMetadata');
    });

    it('should maintain issuerId consistency', () => {
      const proofEnvelope = createTestProofEnvelope('AUTHORITY');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      expect(federationEnvelope.proof.issuerId).toBe('AUTHORITY');
      expect(federationEnvelope.federationMetadata.issuerId).toBe('AUTHORITY');
    });

    it('should throw error if proof issuerId mismatch', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});
      metadata.issuerId = 'DIFFERENT_ISSUER';

      expect(() => {
        buildAnonymousVehicleIdentityFederationEnvelope(proofEnvelope, metadata);
      }).toThrow('issuerId does not match');
    });
  });

  describe('4. FEDERATED Status Validation', () => {
    it('should return valid for FEDERATED status with no restrictions', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope);

      expect(result.isValid).toBe(true);
      expect(result.reasons).toHaveLength(0);
      expect(result.federationStatus).toBe('FEDERATED');
    });

    it('should return valid for FEDERATED with matching expectedIssuerId', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedIssuerIds: ['EXPERTISE', 'AUTHORITY'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'EXPERTISE',
      });

      expect(result.isValid).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });

    it('should return valid for FEDERATED when allowedIssuerIds is empty (all allowed)', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedIssuerIds: [], // Empty = all allowed
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'ANY_ISSUER',
      });

      expect(result.isValid).toBe(true);
    });

    it('should return valid for FEDERATED when allowedDomains is empty (all allowed)', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedDomains: [], // Empty = all allowed
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedDomain: 'ANY_DOMAIN',
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe('5. BLOCKED Status Validation', () => {
    it('should return invalid for BLOCKED status immediately', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'BLOCKED',
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope);

      expect(result.isValid).toBe(false);
      expect(result.federationStatus).toBe('BLOCKED');
      expect(result.reasons).toContain('Federation status is BLOCKED');
    });

    it('should be invalid regardless of issuer whitelist when BLOCKED', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'BLOCKED',
        allowedIssuerIds: ['EXPERTISE'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'EXPERTISE',
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe('6. ISOLATED Status Validation', () => {
    it('should return non-valid for ISOLATED status', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'ISOLATED',
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope);

      expect(result.isValid).toBe(false);
      expect(result.federationStatus).toBe('ISOLATED');
      expect(result.reasons).toContain(
        'Federation status is ISOLATED (local scope only)'
      );
    });

    it('should include ISOLATED reason even with matching issuer', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'ISOLATED',
        allowedIssuerIds: ['EXPERTISE'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'EXPERTISE',
      });

      expect(result.isValid).toBe(false);
      expect(result.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('7. RESTRICTED Status Validation', () => {
    it('should return non-valid for RESTRICTED status', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'RESTRICTED',
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope);

      expect(result.isValid).toBe(false);
      expect(result.federationStatus).toBe('RESTRICTED');
      expect(result.reasons).toContain('Federation status is RESTRICTED');
    });

    it('should include RESTRICTED reason even with matching issuer', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'RESTRICTED',
        allowedIssuerIds: ['EXPERTISE'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'EXPERTISE',
      });

      expect(result.isValid).toBe(false);
      expect(result.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('8. Issuer Authorization Validation', () => {
    it('should reject issuer not in allowed list', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedIssuerIds: ['AUTHORITY', 'THIRD_PARTY'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'EXPERTISE',
      });

      expect(result.isValid).toBe(false);
      expect(result.reasons[0]).toContain('not in allowed issuers');
    });

    it('should accept issuer in allowed list', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedIssuerIds: ['EXPERTISE', 'AUTHORITY'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'EXPERTISE',
      });

      expect(result.isValid).toBe(true);
    });

    it('should accept any issuer when allowedIssuerIds is empty', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedIssuerIds: [],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'ANY_ISSUER',
      });

      expect(result.isValid).toBe(true);
    });

    it('should not check issuer if expectedIssuerId not provided', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedIssuerIds: ['AUTHORITY'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        // expectedIssuerId not provided
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe('9. Domain Authorization Validation', () => {
    it('should reject domain not in allowed list', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedDomains: ['insurance', 'rental'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedDomain: 'maintenance',
      });

      expect(result.isValid).toBe(false);
      expect(result.reasons[0]).toContain('not in allowed domains');
    });

    it('should accept domain in allowed list', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedDomains: ['maintenance', 'insurance'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedDomain: 'maintenance',
      });

      expect(result.isValid).toBe(true);
    });

    it('should accept any domain when allowedDomains is empty', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedDomains: [],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedDomain: 'ANY_DOMAIN',
      });

      expect(result.isValid).toBe(true);
    });

    it('should not check domain if expectedDomain not provided', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedDomains: ['insurance'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        // expectedDomain not provided
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe('10. Combined Issuer and Domain Validation', () => {
    it('should validate both issuer and domain when both provided', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedIssuerIds: ['EXPERTISE'],
        allowedDomains: ['maintenance'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'EXPERTISE',
        expectedDomain: 'maintenance',
      });

      expect(result.isValid).toBe(true);
    });

    it('should fail if issuer valid but domain invalid', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedIssuerIds: ['EXPERTISE'],
        allowedDomains: ['insurance'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'EXPERTISE',
        expectedDomain: 'maintenance',
      });

      expect(result.isValid).toBe(false);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should fail if domain valid but issuer invalid', () => {
      const proofEnvelope = createTestProofEnvelope('EXPERTISE');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
        allowedIssuerIds: ['AUTHORITY'],
        allowedDomains: ['maintenance'],
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope, {
        expectedIssuerId: 'EXPERTISE',
        expectedDomain: 'maintenance',
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe('11. Validation Result Structure', () => {
    it('should include all required fields in validation result', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope);

      expect(result).toHaveProperty('federationValidationId');
      expect(result).toHaveProperty('validatedAt');
      expect(result).toHaveProperty('federationStatus');
      expect(result).toHaveProperty('issuerId');
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('reasons');
      expect(Array.isArray(result.reasons)).toBe(true);
    });

    it('should have empty reasons for valid result', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'FEDERATED',
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope);

      expect(result.isValid).toBe(true);
      expect(result.reasons).toEqual([]);
    });

    it('should preserve federationStatus in result', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        federationStatus: 'RESTRICTED',
      });
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope);

      expect(result.federationStatus).toBe('RESTRICTED');
    });

    it('should preserve issuerId in result', () => {
      const proofEnvelope = createTestProofEnvelope('AUTHORITY');
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result = validateAnonymousVehicleIdentityFederation(federationEnvelope);

      expect(result.issuerId).toBe('AUTHORITY');
    });

    it('should generate unique validationId', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const result1 = validateAnonymousVehicleIdentityFederation(federationEnvelope);
      const result2 = validateAnonymousVehicleIdentityFederation(federationEnvelope);

      expect(result1.federationValidationId).not.toBe(result2.federationValidationId);
      expect(result1.federationValidationId).toMatch(/^fed_val_/);
    });
  });

  describe('12. Pure Function Properties', () => {
    it('should return same federation metadata for same inputs', () => {
      const proofEnvelope = createTestProofEnvelope();
      const input: AnonymousVehicleIdentityFederationMetadataInput = {
        federationId: 'fixed_id',
        timestamp: nowISO,
      };

      const metadata1 = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, input);
      const metadata2 = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, input);

      expect(metadata1.federationId).toBe(metadata2.federationId);
      expect(metadata1.createdAt).toBe(metadata2.createdAt);
    });

    it('should not modify input parameters', () => {
      const proofEnvelope = createTestProofEnvelope();
      const input: AnonymousVehicleIdentityFederationMetadataInput = {
        federationStatus: 'FEDERATED',
        allowedIssuerIds: ['EXPERTISE'],
        timestamp: nowISO,
      };

      const inputBefore = JSON.stringify(input);
      buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, input);
      const inputAfter = JSON.stringify(input);

      expect(inputBefore).toBe(inputAfter);
    });

    it('should not modify proof envelope', () => {
      const proofEnvelope = createTestProofEnvelope();
      const envelopeBefore = JSON.stringify(proofEnvelope);

      buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});

      const envelopeAfter = JSON.stringify(proofEnvelope);
      expect(envelopeBefore).toBe(envelopeAfter);
    });
  });

  describe('13. Integration with Phases 1-7', () => {
    it('should work with any Phase 1-7 proof envelope', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});

      expect(metadata.issuerId).toBe(proofEnvelope.proof.issuerId);
    });

    it('should be independent of identity content', () => {
      const req1 = { ...baseRequest, vin: 'VIN123456789ABC1' };
      const req2 = { ...baseRequest, vin: 'VIN987654321DEF2' };

      const identity1 = issueAnonymousVehicleIdentity(req1);
      const identity2 = issueAnonymousVehicleIdentity(req2);

      const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata({
        issuerId: 'EXPERTISE',
        issuerType: 'EXPERTISE',
        domain: 'maintenance',
        contextClass: 'commercial-vehicle',
        usagePolicy: 'READ_WRITE',
        epochType: 'MONTHLY',
        protocolVersion: '1.0',
        scopeVersion: '1.0',
      });

      const attestation = buildAnonymousVehicleIdentityAttestation(identity1, scopeMetadata, {
        issuerId: 'EXPERTISE',
        timestamp: nowISO,
      });

      const attestedEnvelope1 = buildAnonymousVehicleIdentityAttestedEnvelope(
        identity1,
        scopeMetadata,
        attestation
      );
      const attestedEnvelope2 = buildAnonymousVehicleIdentityAttestedEnvelope(
        identity2,
        scopeMetadata,
        attestation
      );

      const proof1 = buildAnonymousVehicleIdentityProof(attestedEnvelope1, { timestamp: nowISO });
      const proof2 = buildAnonymousVehicleIdentityProof(attestedEnvelope2, { timestamp: nowISO });

      const proofEnvelope1 = buildAnonymousVehicleIdentityProofEnvelope(attestedEnvelope1, proof1);
      const proofEnvelope2 = buildAnonymousVehicleIdentityProofEnvelope(attestedEnvelope2, proof2);

      const metadata1 = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope1, {
        timestamp: nowISO,
      });
      const metadata2 = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope2, {
        timestamp: nowISO,
      });

      // Same federation rules regardless of identity content
      expect(metadata1.federationStatus).toBe(metadata2.federationStatus);
    });

    it('should not expose VIN in federation structures', () => {
      const proofEnvelope = createTestProofEnvelope();
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {});
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      const metadataJSON = JSON.stringify(metadata);
      const envelopeJSON = JSON.stringify(federationEnvelope);

      expect(metadataJSON).not.toMatch(/JF1GC4B3X0E002345/);
      expect(envelopeJSON).not.toMatch(/JF1GC4B3X0E002345/);
    });
  });

  describe('14. Extensibility for Multi-Issuer Scenarios', () => {
    it('should support multiple issuer whitelisting', () => {
      const proofEnvelope = createTestProofEnvelope();
      const allowedIssuers = ['EXPERTISE', 'AUTHORITY', 'THIRD_PARTY', 'PARTNER'];
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        allowedIssuerIds: allowedIssuers,
      });

      allowedIssuers.forEach((issuer) => {
        const result = validateAnonymousVehicleIdentityFederation(
          buildAnonymousVehicleIdentityFederationEnvelope(proofEnvelope, metadata),
          { expectedIssuerId: issuer }
        );
        expect(result.isValid).toBe(true);
      });
    });

    it('should support multiple domain whitelisting', () => {
      const proofEnvelope = createTestProofEnvelope();
      const allowedDomains = ['maintenance', 'insurance', 'rental', 'sales'];
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        allowedDomains: allowedDomains,
      });

      allowedDomains.forEach((domain) => {
        const result = validateAnonymousVehicleIdentityFederation(
          buildAnonymousVehicleIdentityFederationEnvelope(proofEnvelope, metadata),
          { expectedDomain: domain }
        );
        expect(result.isValid).toBe(true);
      });
    });

    it('should support different interoperability levels', () => {
      const proofEnvelope = createTestProofEnvelope();
      const levels = ['LOCAL', 'REGIONAL', 'GLOBAL'] as const;

      levels.forEach((level) => {
        const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
          interoperabilityLevel: level,
        });
        expect(metadata.interoperabilityLevel).toBe(level);
      });
    });

    it('should track federation domain classification', () => {
      const proofEnvelope = createTestProofEnvelope();
      const federationDomains = ['automotive-network', 'supply-chain', 'insurance-pool'];

      federationDomains.forEach((domain) => {
        const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
          federationDomain: domain,
        });
        expect(metadata.federationDomain).toBe(domain);
      });
    });
  });

  describe('15. Federation State Management', () => {
    it('should track federation creation and update times', () => {
      const proofEnvelope = createTestProofEnvelope();
      const createdTime = '2026-03-10T12:00:00Z';
      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
        timestamp: createdTime,
      });

      expect(metadata.createdAt).toBe(createdTime);
      expect(metadata.updatedAt).toBe(createdTime);
    });

    it('should support federation version tracking', () => {
      const proofEnvelope = createTestProofEnvelope();
      const versions = ['1.0', '1.1', '2.0', 'alpha', 'beta'];

      versions.forEach((version) => {
        const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, {
          federationVersion: version,
        });
        expect(metadata.federationVersion).toBe(version);
      });
    });

    it('should preserve all federation configuration in envelope', () => {
      const proofEnvelope = createTestProofEnvelope();
      const input: AnonymousVehicleIdentityFederationMetadataInput = {
        federationStatus: 'FEDERATED',
        federationDomain: 'automotive-network',
        interoperabilityLevel: 'REGIONAL',
        allowedIssuerIds: ['EXPERTISE', 'AUTHORITY'],
        allowedDomains: ['maintenance', 'insurance'],
      };

      const metadata = buildAnonymousVehicleIdentityFederationMetadata(proofEnvelope, input);
      const federationEnvelope = buildAnonymousVehicleIdentityFederationEnvelope(
        proofEnvelope,
        metadata
      );

      expect(federationEnvelope.federationMetadata.federationStatus).toBe('FEDERATED');
      expect(federationEnvelope.federationMetadata.federationDomain).toBe('automotive-network');
      expect(federationEnvelope.federationMetadata.interoperabilityLevel).toBe('REGIONAL');
      expect(federationEnvelope.federationMetadata.allowedIssuerIds).toEqual([
        'EXPERTISE',
        'AUTHORITY',
      ]);
      expect(federationEnvelope.federationMetadata.allowedDomains).toEqual([
        'maintenance',
        'insurance',
      ]);
    });
  });
});
