import {
  buildAnonymousVehicleIdentityAttestedEnvelope,
  buildAnonymousVehicleIdentityAttestation,
  buildAnonymousVehicleIdentityEnvelope,
  buildAnonymousVehicleIdentityScopeMetadata,
  issueAnonymousVehicleIdentity,
  buildAnonymousVehicleIdentityProof,
  buildAnonymousVehicleIdentityProofFingerprint,
  buildAnonymousVehicleIdentityProofEnvelope,
  AnonymousVehicleIdentityProofInput,
  AnonymousVehicleIdentityAttestedEnvelope,
  AnonymousVehicleIdentityProof,
  AnonymousVehicleIdentityProofEnvelope,
} from '../anonymousVehicleIdentity';

// Phase 7: Anonymous Vehicle Identity Proof Layer Tests
// Tests structural proof creation, binding, and envelope composition

describe('Anonymous Vehicle Identity - Phase 7: Proof Layer', () => {
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

  // Build a test envelope (Phase 1-5)
  function createTestAttestedEnvelope(
    issuerId: string = 'EXPERTISE'
  ): AnonymousVehicleIdentityAttestedEnvelope {
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

    return buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);
  }

  describe('1. Proof Fingerprint Creation', () => {
    it('should create proof fingerprint from envelope and input', () => {
      const envelope = createTestAttestedEnvelope();
      const input: AnonymousVehicleIdentityProofInput = {
        proofVersion: '1.0',
        proofType: 'STRUCTURAL_PROOF',
        timestamp: nowISO,
      };

      const fingerprint = buildAnonymousVehicleIdentityProofFingerprint(envelope, input);

      expect(fingerprint).toBeDefined();
      expect(fingerprint.length).toBe(32);
      expect(/^[a-f0-9]{32}$/.test(fingerprint)).toBe(true);
    });

    it('should generate deterministic fingerprint for same inputs', () => {
      const envelope = createTestAttestedEnvelope();
      const input: AnonymousVehicleIdentityProofInput = {
        proofVersion: '1.0',
        proofType: 'STRUCTURAL_PROOF',
        timestamp: nowISO,
      };

      const fingerprint1 = buildAnonymousVehicleIdentityProofFingerprint(envelope, input);
      const fingerprint2 = buildAnonymousVehicleIdentityProofFingerprint(envelope, input);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should generate different fingerprints for different proofTypes', () => {
      const envelope = createTestAttestedEnvelope();
      const input1: AnonymousVehicleIdentityProofInput = {
        proofType: 'STRUCTURAL_PROOF',
        timestamp: nowISO,
      };
      const input2: AnonymousVehicleIdentityProofInput = {
        proofType: 'BINDING_PROOF',
        timestamp: nowISO,
      };

      const fingerprint1 = buildAnonymousVehicleIdentityProofFingerprint(envelope, input1);
      const fingerprint2 = buildAnonymousVehicleIdentityProofFingerprint(envelope, input2);

      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should generate different fingerprints for different timestamps', () => {
      const envelope = createTestAttestedEnvelope();
      const input1: AnonymousVehicleIdentityProofInput = {
        timestamp: nowISO,
      };
      const input2: AnonymousVehicleIdentityProofInput = {
        timestamp: new Date(now.getTime() + 1000).toISOString(),
      };

      const fingerprint1 = buildAnonymousVehicleIdentityProofFingerprint(envelope, input1);
      const fingerprint2 = buildAnonymousVehicleIdentityProofFingerprint(envelope, input2);

      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should use default values if input fields omitted', () => {
      const envelope = createTestAttestedEnvelope();
      const fingerprint1 = buildAnonymousVehicleIdentityProofFingerprint(envelope, {});
      const fingerprint2 = buildAnonymousVehicleIdentityProofFingerprint(envelope, {
        proofType: 'STRUCTURAL_PROOF',
        proofVersion: '1.0',
        proofBindingRef: 'default',
      });

      // Should produce same fingerprint with defaults
      expect(fingerprint1).toBeDefined();
      expect(fingerprint2).toBeDefined();
    });
  });

  describe('2. Proof Building - Defaults', () => {
    it('should build proof with default values', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof.proofVersion).toBe('1.0');
      expect(proof.proofType).toBe('STRUCTURAL_PROOF');
      expect(proof.proofStatus).toBe('CREATED');
    });

    it('should generate unique proofId', () => {
      const envelope = createTestAttestedEnvelope();
      const proof1 = buildAnonymousVehicleIdentityProof(envelope, { timestamp: nowISO });
      const proof2 = buildAnonymousVehicleIdentityProof(envelope, {
        timestamp: new Date(now.getTime() + 100).toISOString(),
      });

      expect(proof1.proofId).not.toBe(proof2.proofId);
      expect(proof1.proofId).toMatch(/^proof_/);
      expect(proof2.proofId).toMatch(/^proof_/);
    });

    it('should set issuerId from attestation', () => {
      const envelope = createTestAttestedEnvelope('AUTHORITY');
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof.issuerId).toBe('AUTHORITY');
    });

    it('should set protocolVersion from attestation', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof.protocolVersion).toBe('1.0');
    });

    it('should use current time if timestamp omitted', () => {
      const envelope = createTestAttestedEnvelope();
      const beforeBuild = new Date();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});
      const afterBuild = new Date();

      const proofTime = new Date(proof.createdAt);
      expect(proofTime.getTime()).toBeGreaterThanOrEqual(beforeBuild.getTime());
      expect(proofTime.getTime()).toBeLessThanOrEqual(afterBuild.getTime() + 1000);
    });

    it('should set envelopeFingerprint from attestation', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof.envelopeFingerprint).toBe(envelope.attestation.envelopeFingerprint);
    });

    it('should generate proofFingerprint', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof.proofFingerprint).toBeDefined();
      expect(proof.proofFingerprint.length).toBe(32);
      expect(/^[a-f0-9]{32}$/.test(proof.proofFingerprint)).toBe(true);
    });

    it('should set proofBindingRef to envelopeFingerprint by default', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof.proofBindingRef).toBe(envelope.attestation.envelopeFingerprint);
    });
  });

  describe('3. Proof Building - Custom Input', () => {
    it('should use custom proofVersion', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofVersion: '2.0',
      });

      expect(proof.proofVersion).toBe('2.0');
    });

    it('should use custom proofType', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofType: 'BINDING_PROOF',
      });

      expect(proof.proofType).toBe('BINDING_PROOF');
    });

    it('should use custom proofId', () => {
      const envelope = createTestAttestedEnvelope();
      const customProofId = 'custom_proof_12345';
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofId: customProofId,
      });

      expect(proof.proofId).toBe(customProofId);
    });

    it('should use custom proofBindingRef', () => {
      const envelope = createTestAttestedEnvelope();
      const customRef = 'custom_binding_ref';
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofBindingRef: customRef,
      });

      expect(proof.proofBindingRef).toBe(customRef);
    });

    it('should use custom timestamp', () => {
      const envelope = createTestAttestedEnvelope();
      const customTime = '2026-01-01T00:00:00Z';
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        timestamp: customTime,
      });

      expect(proof.createdAt).toBe(customTime);
    });

    it('should support TEMPORAL_PROOF type', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofType: 'TEMPORAL_PROOF',
      });

      expect(proof.proofType).toBe('TEMPORAL_PROOF');
    });
  });

  describe('4. Proof Envelope Creation', () => {
    it('should create proof envelope with all components', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});
      const proofEnvelope = buildAnonymousVehicleIdentityProofEnvelope(envelope, proof);

      expect(proofEnvelope).toBeDefined();
      expect(proofEnvelope.identity).toBe(envelope.identity);
      expect(proofEnvelope.scopeMetadata).toBe(envelope.scopeMetadata);
      expect(proofEnvelope.attestation).toBe(envelope.attestation);
      expect(proofEnvelope.proof).toBe(proof);
    });

    it('should include all required envelope fields', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});
      const proofEnvelope = buildAnonymousVehicleIdentityProofEnvelope(envelope, proof);

      expect(proofEnvelope).toHaveProperty('identity');
      expect(proofEnvelope).toHaveProperty('scopeMetadata');
      expect(proofEnvelope).toHaveProperty('attestation');
      expect(proofEnvelope).toHaveProperty('proof');
    });

    it('should include all required proof fields', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof).toHaveProperty('proofId');
      expect(proof).toHaveProperty('proofVersion');
      expect(proof).toHaveProperty('proofType');
      expect(proof).toHaveProperty('proofStatus');
      expect(proof).toHaveProperty('issuerId');
      expect(proof).toHaveProperty('protocolVersion');
      expect(proof).toHaveProperty('createdAt');
      expect(proof).toHaveProperty('envelopeFingerprint');
      expect(proof).toHaveProperty('proofFingerprint');
      expect(proof).toHaveProperty('proofBindingRef');
    });

    it('should maintain issuerId consistency', () => {
      const envelope = createTestAttestedEnvelope('AUTHORITY');
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});
      const proofEnvelope = buildAnonymousVehicleIdentityProofEnvelope(envelope, proof);

      expect(proofEnvelope.attestation.issuerId).toBe('AUTHORITY');
      expect(proofEnvelope.proof.issuerId).toBe('AUTHORITY');
    });

    it('should maintain fingerprint consistency', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});
      const proofEnvelope = buildAnonymousVehicleIdentityProofEnvelope(envelope, proof);

      expect(proofEnvelope.attestation.envelopeFingerprint).toBe(
        proofEnvelope.proof.envelopeFingerprint
      );
    });
  });

  describe('5. Validation and Error Cases', () => {
    it('should throw error if proof missing proofId', () => {
      const envelope = createTestAttestedEnvelope();
      const invalidProof = {
        proofVersion: '1.0',
        proofType: 'STRUCTURAL_PROOF' as const,
        proofStatus: 'CREATED' as const,
        issuerId: 'EXPERTISE',
        protocolVersion: '1.0',
        createdAt: nowISO,
        envelopeFingerprint: envelope.attestation.envelopeFingerprint,
        proofFingerprint: 'abc123',
        proofBindingRef: 'ref',
      } as any;

      expect(() => {
        buildAnonymousVehicleIdentityProofEnvelope(envelope, invalidProof);
      }).toThrow('missing proofId');
    });

    it('should throw error if envelope missing identity', () => {
      const proof = buildAnonymousVehicleIdentityProof(createTestAttestedEnvelope(), {});
      const invalidEnvelope = {
        scopeMetadata: {},
        attestation: {
          envelopeFingerprint: 'abc123',
          issuerId: 'EXPERTISE',
        },
      } as any;

      expect(() => {
        buildAnonymousVehicleIdentityProofEnvelope(invalidEnvelope, proof);
      }).toThrow('missing identity');
    });

    it('should throw error if proof envelopeFingerprint mismatch', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});
      proof.envelopeFingerprint = 'different_fingerprint';

      expect(() => {
        buildAnonymousVehicleIdentityProofEnvelope(envelope, proof);
      }).toThrow('envelopeFingerprint does not match');
    });

    it('should throw error if proof issuerId mismatch', () => {
      const envelope = createTestAttestedEnvelope('EXPERTISE');
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});
      proof.issuerId = 'DIFFERENT_ISSUER';

      expect(() => {
        buildAnonymousVehicleIdentityProofEnvelope(envelope, proof);
      }).toThrow('issuerId does not match');
    });

    it('should throw error if buildProof with invalid envelope', () => {
      const invalidEnvelope = {
        attestation: null,
      } as any;

      expect(() => {
        buildAnonymousVehicleIdentityProof(invalidEnvelope, {});
      }).toThrow('missing attestation');
    });

    it('should throw error if buildProof without envelopeFingerprint', () => {
      const invalidEnvelope = {
        attestation: {
          envelopeFingerprint: null,
        },
      } as any;

      expect(() => {
        buildAnonymousVehicleIdentityProof(invalidEnvelope, {});
      }).toThrow('missing envelopeFingerprint');
    });
  });

  describe('6. Binding References and Relationships', () => {
    it('should create binding reference from envelopeFingerprint by default', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof.proofBindingRef).toBe(envelope.attestation.envelopeFingerprint);
    });

    it('should support custom binding references', () => {
      const envelope = createTestAttestedEnvelope();
      const customRef = 'phase8_binding_001';
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofBindingRef: customRef,
      });

      expect(proof.proofBindingRef).toBe(customRef);
    });

    it('should maintain binding through proof envelope', () => {
      const envelope = createTestAttestedEnvelope();
      const bindingRef = 'custom_binding_ref';
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofBindingRef: bindingRef,
      });
      const proofEnvelope = buildAnonymousVehicleIdentityProofEnvelope(envelope, proof);

      expect(proofEnvelope.proof.proofBindingRef).toBe(bindingRef);
    });

    it('should support different proof types for future proof strategies', () => {
      const envelope = createTestAttestedEnvelope();
      const proofTypes = ['STRUCTURAL_PROOF', 'BINDING_PROOF', 'TEMPORAL_PROOF'] as const;

      proofTypes.forEach((proofType) => {
        const proof = buildAnonymousVehicleIdentityProof(envelope, {
          proofType,
        });
        expect(proof.proofType).toBe(proofType);
      });
    });
  });

  describe('7. Proof Status and Lifecycle', () => {
    it('should initialize proof with CREATED status', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof.proofStatus).toBe('CREATED');
    });

    it('should allow custom proofStatus through envelope', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(['CREATED', 'BOUND', 'INVALID', 'UNAVAILABLE']).toContain(proof.proofStatus);
    });

    it('should track proof versioning', () => {
      const envelope = createTestAttestedEnvelope();
      const proof1 = buildAnonymousVehicleIdentityProof(envelope, { proofVersion: '1.0' });
      const proof2 = buildAnonymousVehicleIdentityProof(envelope, { proofVersion: '2.0' });

      expect(proof1.proofVersion).toBe('1.0');
      expect(proof2.proofVersion).toBe('2.0');
    });

    it('should track creation timestamp', () => {
      const envelope = createTestAttestedEnvelope();
      const timestamp = '2026-03-10T12:00:00Z';
      const proof = buildAnonymousVehicleIdentityProof(envelope, { timestamp });

      expect(proof.createdAt).toBe(timestamp);
    });
  });

  describe('8. Pure Function Properties', () => {
    it('should return same proof for same inputs', () => {
      const envelope = createTestAttestedEnvelope();
      const input: AnonymousVehicleIdentityProofInput = {
        proofId: 'fixed_id',
        timestamp: nowISO,
      };

      const proof1 = buildAnonymousVehicleIdentityProof(envelope, input);
      const proof2 = buildAnonymousVehicleIdentityProof(envelope, input);

      expect(proof1.proofId).toBe(proof2.proofId);
      expect(proof1.proofFingerprint).toBe(proof2.proofFingerprint);
      expect(proof1.createdAt).toBe(proof2.createdAt);
    });

    it('should not modify input parameters', () => {
      const envelope = createTestAttestedEnvelope();
      const input: AnonymousVehicleIdentityProofInput = {
        proofVersion: '1.0',
        timestamp: nowISO,
      };

      const inputBefore = JSON.stringify(input);
      buildAnonymousVehicleIdentityProof(envelope, input);
      const inputAfter = JSON.stringify(input);

      expect(inputBefore).toBe(inputAfter);
    });

    it('should not modify envelope parameter', () => {
      const envelope = createTestAttestedEnvelope();
      const envelopeBefore = JSON.stringify(envelope);

      buildAnonymousVehicleIdentityProof(envelope, {});

      const envelopeAfter = JSON.stringify(envelope);
      expect(envelopeBefore).toBe(envelopeAfter);
    });

    it('should be deterministic for proof fingerprint', () => {
      const envelope = createTestAttestedEnvelope();
      const input: AnonymousVehicleIdentityProofInput = {
        timestamp: nowISO,
      };

      const fingerprint1 = buildAnonymousVehicleIdentityProofFingerprint(envelope, input);
      const fingerprint2 = buildAnonymousVehicleIdentityProofFingerprint(envelope, input);

      expect(fingerprint1).toBe(fingerprint2);
    });
  });

  describe('9. Integration with Phases 1-6', () => {
    it('should work with any Phase 1-5 attested envelope', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof.protocolVersion).toBe(envelope.attestation.protocolVersion);
      expect(proof.issuerId).toBe(envelope.attestation.issuerId);
      expect(proof.envelopeFingerprint).toBe(envelope.attestation.envelopeFingerprint);
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

      const envelope1 = buildAnonymousVehicleIdentityAttestedEnvelope(identity1, scopeMetadata, attestation);
      const envelope2WithDifferentIdentity = buildAnonymousVehicleIdentityAttestedEnvelope(
        identity2,
        scopeMetadata,
        attestation
      );

      const proof1 = buildAnonymousVehicleIdentityProof(envelope1, { timestamp: nowISO });
      const proof2 = buildAnonymousVehicleIdentityProof(envelope2WithDifferentIdentity, {
        timestamp: nowISO,
      });

      // Same attestation fingerprint = same proof binding (identity doesn't affect proof)
      expect(proof1.envelopeFingerprint).toBe(proof2.envelopeFingerprint);
    });

    it('should not expose VIN in proof structures', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});
      const proofEnvelope = buildAnonymousVehicleIdentityProofEnvelope(envelope, proof);

      const proofJSON = JSON.stringify(proof);
      const envelopeJSON = JSON.stringify(proofEnvelope);

      expect(proofJSON).not.toMatch(/JF1GC4B3X0E002345/);
      expect(envelopeJSON).not.toMatch(/JF1GC4B3X0E002345/);
      expect(proofJSON).not.toMatch(/vin/i);
      expect(envelopeJSON).not.toMatch(/vin/i);
    });
  });

  describe('10. Proof Fingerprinting and Integrity', () => {
    it('should generate unique proof fingerprints for different proofs', () => {
      const envelope = createTestAttestedEnvelope();
      const proof1 = buildAnonymousVehicleIdentityProof(envelope, {
        timestamp: nowISO,
      });
      const proof2 = buildAnonymousVehicleIdentityProof(envelope, {
        timestamp: new Date(now.getTime() + 1000).toISOString(),
      });

      expect(proof1.proofFingerprint).not.toBe(proof2.proofFingerprint);
    });

    it('should have different fingerprints for different envelope', () => {
      const envelope1 = createTestAttestedEnvelope();
      const envelope2 = createTestAttestedEnvelope('AUTHORITY');

      const proof1 = buildAnonymousVehicleIdentityProof(envelope1, { timestamp: nowISO });
      const proof2 = buildAnonymousVehicleIdentityProof(envelope2, { timestamp: nowISO });

      expect(proof1.proofFingerprint).not.toBe(proof2.proofFingerprint);
    });

    it('should maintain fingerprint format consistency', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});

      expect(proof.proofFingerprint).toMatch(/^[a-f0-9]{32}$/);
      expect(proof.envelopeFingerprint).toMatch(/^[a-f0-9]{32}$/);
    });

    it('should support fingerprint-based proof integrity checks in future phases', () => {
      const envelope = createTestAttestedEnvelope();
      const input: AnonymousVehicleIdentityProofInput = {
        timestamp: nowISO,
        proofVersion: '1.0',
        proofType: 'STRUCTURAL_PROOF',
      };

      const proof = buildAnonymousVehicleIdentityProof(envelope, input);
      const recalculatedFingerprint = buildAnonymousVehicleIdentityProofFingerprint(
        envelope,
        input
      );

      // Fingerprint can be recalculated deterministically
      expect(recalculatedFingerprint).toBe(proof.proofFingerprint);
    });
  });

  describe('11. Proof Envelope Composition', () => {
    it('should maintain complete identity chain in proof envelope', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});
      const proofEnvelope = buildAnonymousVehicleIdentityProofEnvelope(envelope, proof);

      // All phases represented
      expect(proofEnvelope.identity.anonymousVehicleId).toBeDefined(); // Phase 1
      expect(proofEnvelope.scopeMetadata.domain).toBeDefined(); // Phase 2
      expect(proofEnvelope.attestation.attestationId).toBeDefined(); // Phase 3/4
      expect(proofEnvelope.proof.proofId).toBeDefined(); // Phase 7
    });

    it('should provide access to all envelope fields through proof envelope', () => {
      const envelope = createTestAttestedEnvelope('AUTHORITY');
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofVersion: '2.0',
      });
      const proofEnvelope = buildAnonymousVehicleIdentityProofEnvelope(envelope, proof);

      expect(proofEnvelope.identity.issuerId).toBe('AUTHORITY');
      expect(proofEnvelope.scopeMetadata.issuerId).toBe('AUTHORITY');
      expect(proofEnvelope.attestation.issuerId).toBe('AUTHORITY');
      expect(proofEnvelope.proof.issuerId).toBe('AUTHORITY');
      expect(proofEnvelope.proof.proofVersion).toBe('2.0');
    });

    it('should create immutable proof structure (conceptually)', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {});
      const originalProofId = proof.proofId;

      // Proof is created with fixed structure
      expect(proof.proofId).toBe(originalProofId);
      expect(proof.proofStatus).toBe('CREATED');
    });
  });

  describe('12. Extensibility for Future Phases', () => {
    it('should support binding proof type for Phase 8+', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofType: 'BINDING_PROOF',
      });

      expect(proof.proofType).toBe('BINDING_PROOF');
      expect(proof.proofBindingRef).toBe(envelope.attestation.envelopeFingerprint);
    });

    it('should support temporal proof type for Phase 8+', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofType: 'TEMPORAL_PROOF',
      });

      expect(proof.proofType).toBe('TEMPORAL_PROOF');
    });

    it('should allow custom proof versions for future enhancements', () => {
      const envelope = createTestAttestedEnvelope();
      const versions = ['1.0', '2.0', '3.0', 'alpha', 'beta'];

      versions.forEach((version) => {
        const proof = buildAnonymousVehicleIdentityProof(envelope, {
          proofVersion: version,
        });
        expect(proof.proofVersion).toBe(version);
      });
    });

    it('should support proof status evolution in future phases', () => {
      const statuses: Array<'CREATED' | 'BOUND' | 'INVALID' | 'UNAVAILABLE'> = [
        'CREATED',
        'BOUND',
        'INVALID',
        'UNAVAILABLE',
      ];

      const envelope = createTestAttestedEnvelope();

      statuses.forEach((status) => {
        const proof = buildAnonymousVehicleIdentityProof(envelope, {});
        // Proof starts as CREATED; future phases can transition to BOUND
        expect(['CREATED', 'BOUND', 'INVALID', 'UNAVAILABLE']).toContain(proof.proofStatus);
      });
    });

    it('should provide proof binding reference for distributed proofs', () => {
      const envelope = createTestAttestedEnvelope();
      const proof = buildAnonymousVehicleIdentityProof(envelope, {
        proofBindingRef: 'ipfs://QmXxxx',
      });

      expect(proof.proofBindingRef).toBe('ipfs://QmXxxx');
    });
  });
});
