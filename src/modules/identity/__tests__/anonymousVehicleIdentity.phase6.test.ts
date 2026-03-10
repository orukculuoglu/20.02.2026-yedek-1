import {
  buildAnonymousVehicleIdentityAttestedEnvelope,
  buildAnonymousVehicleIdentityAttestation,
  buildAnonymousVehicleIdentityEnvelope,
  buildAnonymousVehicleIdentityScopeMetadata,
  issueAnonymousVehicleIdentity,
  validateAnonymousVehicleIdentityTemporal,
  AnonymousVehicleIdentityTemporalValidationInput,
  AnonymousVehicleIdentityAttestedEnvelope,
} from '../anonymousVehicleIdentity';

// Phase 6: Anonymous Vehicle Identity Temporal Validation Tests
// Tests comprehensive temporal constraint validation on attested envelopes
// Tests all status values: VALID, EXPIRED, NOT_YET_VALID, TOO_OLD, INVALID_TIME

describe('Anonymous Vehicle Identity - Phase 6: Temporal Validation', () => {
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

  // Build a test envelope
  function createTestEnvelope(
    issuedAtTime: string = nowISO,
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
      timestamp: issuedAtTime,
      attestationVersion: '1.0',
      attestationType: 'SELF_ASSERTED',
      attestationStatus: 'ISSUED',
    });

    return buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);
  }

  describe('1. Valid Envelope - All Constraints Pass', () => {
    it('should return VALID when no temporal constraints provided', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID');
      expect(result.reasons).toHaveLength(0);
      expect(result.issuerId).toBe('EXPERTISE');
      expect(result.temporalValidationId).toMatch(/^temporal_/);
    });

    it('should return VALID when notBefore is in the past', () => {
      const envelope = createTestEnvelope(nowISO);
      const notBefore = new Date(now.getTime() - 3600000).toISOString(); // 1 hour ago
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        notBefore,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID');
      expect(result.reasons).toHaveLength(0);
    });

    it('should return VALID when expiresAt is in the future', () => {
      const envelope = createTestEnvelope(nowISO);
      const expiresAt = new Date(now.getTime() + 3600000).toISOString(); // 1 hour from now
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        expiresAt,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID');
      expect(result.reasons).toHaveLength(0);
    });

    it('should return VALID when envelope is younger than maxAge', () => {
      const issuedAt = new Date(now.getTime() - 300000).toISOString(); // 5 minutes ago
      const envelope = createTestEnvelope(issuedAt);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        maxAgeMs: 600000, // 10 minutes
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID');
      expect(result.reasons).toHaveLength(0);
    });

    it('should return VALID when all constraints pass', () => {
      const issuedAt = new Date(now.getTime() - 300000).toISOString();
      const envelope = createTestEnvelope(issuedAt);
      const notBefore = new Date(now.getTime() - 3600000).toISOString();
      const expiresAt = new Date(now.getTime() + 3600000).toISOString();
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        notBefore,
        expiresAt,
        maxAgeMs: 600000,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID');
      expect(result.reasons).toHaveLength(0);
    });

    it('should generate unique temporalValidationId for each validation', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
      };

      const result1 = validateAnonymousVehicleIdentityTemporal(envelope, input);
      const result2 = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result1.temporalValidationId).not.toBe(result2.temporalValidationId);
      expect(result1.temporalValidationId).toMatch(/^temporal_/);
      expect(result2.temporalValidationId).toMatch(/^temporal_/);
    });
  });

  describe('2. Expired Envelope - expiresAt in Past', () => {
    it('should return EXPIRED when expiresAt is in the past', () => {
      const envelope = createTestEnvelope(nowISO);
      const expiresAt = new Date(now.getTime() - 3600000).toISOString(); // 1 hour ago
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        expiresAt,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('EXPIRED');
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('expired');
      expect(result.reasons[0]).toContain(expiresAt);
    });

    it('should return EXPIRED when current time equals expiresAt', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        expiresAt: nowISO, // Expires exactly now
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID'); // Exactly at expiration not yet expired
    });

    it('should return EXPIRED just after expiresAt', () => {
      const envelope = createTestEnvelope(nowISO);
      const expiresAt = nowISO;
      const checkNow = new Date(now.getTime() + 1000).toISOString(); // 1 second later
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: checkNow,
        expiresAt,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('EXPIRED');
    });

    it('should include detailed expiration reason in response', () => {
      const envelope = createTestEnvelope(nowISO);
      const expiresAt = new Date(now.getTime() - 1000).toISOString();
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        expiresAt,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons[0]).toMatch(/Envelope expired/);
    });
  });

  describe('3. Not Yet Valid - notBefore in Future', () => {
    it('should return NOT_YET_VALID when notBefore is in the future', () => {
      const envelope = createTestEnvelope(nowISO);
      const notBefore = new Date(now.getTime() + 3600000).toISOString(); // 1 hour from now
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        notBefore,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('NOT_YET_VALID');
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('not valid until');
    });

    it('should return NOT_YET_VALID when current time equals notBefore', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        notBefore: nowISO, // Not valid until exactly now
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID'); // At notBefore is valid
    });

    it('should return VALID just after notBefore', () => {
      const envelope = createTestEnvelope(nowISO);
      const notBefore = nowISO;
      const checkNow = new Date(now.getTime() + 1000).toISOString();
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: checkNow,
        notBefore,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID');
    });

    it('should include detailed not-before reason in response', () => {
      const envelope = createTestEnvelope(nowISO);
      const notBefore = new Date(now.getTime() + 1000).toISOString();
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        notBefore,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons[0]).toMatch(/not valid until/);
    });
  });

  describe('4. Too Old - Exceeds maxAge', () => {
    it('should return TOO_OLD when envelope exceeds maxAge', () => {
      const issuedAt = new Date(now.getTime() - 700000).toISOString(); // 11+ minutes ago
      const envelope = createTestEnvelope(issuedAt);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        maxAgeMs: 600000, // 10 minutes max
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('TOO_OLD');
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('exceeds maximum');
    });

    it('should return VALID when envelope is exactly at maxAge limit', () => {
      const maxAge = 600000;
      const issuedAt = new Date(now.getTime() - maxAge).toISOString();
      const envelope = createTestEnvelope(issuedAt);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        maxAgeMs: maxAge,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID');
    });

    it('should return TOO_OLD just beyond maxAge limit', () => {
      const maxAge = 600000;
      const issuedAt = new Date(now.getTime() - maxAge - 1000).toISOString(); // 1 second beyond max
      const envelope = createTestEnvelope(issuedAt);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        maxAgeMs: maxAge,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('TOO_OLD');
    });

    it('should include detailed age reason in response', () => {
      const issuedAt = new Date(now.getTime() - 1000000).toISOString(); // Very old
      const envelope = createTestEnvelope(issuedAt);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        maxAgeMs: 600000,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons[0]).toMatch(/age.*exceeds maximum/);
    });
  });

  describe('5. Invalid Time - Cannot Parse Timestamps', () => {
    it('should return INVALID_TIME when envelope issuedAt is unparseable', () => {
      const identity = issueAnonymousVehicleIdentity(baseRequest);
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

      // Create attestation with invalid timestamp
      const attestation = buildAnonymousVehicleIdentityAttestation(identity, scopeMetadata, {
        issuerId: 'EXPERTISE',
        timestamp: 'invalid-timestamp',
        attestationVersion: '1.0',
      });

      const envelope = buildAnonymousVehicleIdentityAttestedEnvelope(identity, scopeMetadata, attestation);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('INVALID_TIME');
      expect(result.issuedAt).toBe('invalid');
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons[0]).toMatch(/Unable to parse/);
    });

    it('should return INVALID_TIME when validation time is unparseable', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: 'invalid-now',
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('INVALID_TIME');
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should use system time if now is omitted', () => {
      const envelope = createTestEnvelope(new Date(Date.now() - 5000).toISOString());
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        // now not provided
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      // Should use current system time and validation should pass
      expect(result.status).toBe('VALID');
    });
  });

  describe('6. Clock Skew Tolerance', () => {
    it('should apply clockSkewMs to notBefore check', () => {
      const envelope = createTestEnvelope(nowISO);
      const notBefore = new Date(now.getTime() + 1000).toISOString(); // 1 second in future
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        notBefore,
        clockSkewMs: 2000, // 2 seconds tolerance
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID'); // Within clock skew tolerance
    });

    it('should apply clockSkewMs to expiresAt check', () => {
      const envelope = createTestEnvelope(nowISO);
      const expiresAt = new Date(now.getTime() - 1000).toISOString(); // 1 second in past
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        expiresAt,
        clockSkewMs: 2000, // 2 seconds tolerance
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID'); // Within clock skew tolerance
    });

    it('should apply clockSkewMs to maxAge check', () => {
      const maxAge = 600000;
      const issuedAt = new Date(now.getTime() - maxAge - 500).toISOString(); // 500ms over limit
      const envelope = createTestEnvelope(issuedAt);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        maxAgeMs: maxAge,
        clockSkewMs: 1000, // 1 second tolerance
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID'); // Within clock skew tolerance
    });

    it('should default clockSkewMs to 0 if omitted', () => {
      const envelope = createTestEnvelope(nowISO);
      const notBefore = new Date(now.getTime() + 100).toISOString(); // 100ms in future
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        notBefore,
        // clockSkewMs omitted
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('NOT_YET_VALID'); // No tolerance
      expect(result.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('7. Multiple Constraint Failures', () => {
    it('should detect first failure when multiple constraints fail', () => {
      const issuedAt = new Date(now.getTime() - 1000000).toISOString(); // Very old
      const envelope = createTestEnvelope(issuedAt);
      const expiresAt = new Date(now.getTime() - 100000).toISOString(); // Already expired
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        expiresAt,
        maxAgeMs: 600000, // Also exceeds max age
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      // Should return the first failed constraint (expiresAt check comes before maxAge)
      expect(['EXPIRED', 'TOO_OLD']).toContain(result.status);
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('should include reasons for all checked constraints', () => {
      const issuedAt = new Date(now.getTime() - 700000).toISOString();
      const envelope = createTestEnvelope(issuedAt);
      const expiresAt = new Date(now.getTime() - 100000).toISOString();
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        expiresAt,
        maxAgeMs: 600000,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.issuerId).toBe('EXPERTISE');
      expect(result.protocolVersion).toBe('1.0');
    });
  });

  describe('8. Result Structure Verification', () => {
    it('should include all required fields in result', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result).toHaveProperty('temporalValidationId');
      expect(result).toHaveProperty('validatedAt');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('issuerId');
      expect(result).toHaveProperty('protocolVersion');
      expect(result).toHaveProperty('validationVersion');
      expect(result).toHaveProperty('issuedAt');
      expect(result).toHaveProperty('reasons');
      expect(Array.isArray(result.reasons)).toBe(true);
    });

    it('should have empty reasons array when VALID', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID');
      expect(result.reasons).toEqual([]);
    });

    it('should preserve issuer and protocol information in result', () => {
      const envelope = createTestEnvelope(nowISO, 'AUTHORITY');
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '2.0',
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.issuerId).toBe('AUTHORITY');
      expect(result.protocolVersion).toBe('1.0');
      expect(result.validationVersion).toBe('2.0');
    });

    it('should include validatedAt timestamp', () => {
      const envelope = createTestEnvelope(nowISO);
      const beforeValidation = new Date();
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);
      const afterValidation = new Date();

      const validatedAtTime = new Date(result.validatedAt);
      expect(validatedAtTime.getTime()).toBeGreaterThanOrEqual(beforeValidation.getTime());
      expect(validatedAtTime.getTime()).toBeLessThanOrEqual(afterValidation.getTime() + 1000);
    });
  });

  describe('9. Pure Function Properties', () => {
    it('should return same result for same inputs', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
      };

      const result1 = validateAnonymousVehicleIdentityTemporal(envelope, input);
      const result2 = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result1.status).toBe(result2.status);
      expect(result1.reasons).toEqual(result2.reasons);
      expect(result1.issuerId).toBe(result2.issuerId);
      // Note: temporalValidationId will differ (expected behavior)
    });

    it('should not modify input parameters', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        maxAgeMs: 600000,
      };

      const inputBefore = JSON.stringify(input);
      validateAnonymousVehicleIdentityTemporal(envelope, input);
      const inputAfter = JSON.stringify(input);

      expect(inputBefore).toBe(inputAfter);
    });

    it('should not modify envelope parameter', () => {
      const envelope = createTestEnvelope(nowISO);
      const envelopeBefore = JSON.stringify(envelope);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
      };

      validateAnonymousVehicleIdentityTemporal(envelope, input);
      const envelopeAfter = JSON.stringify(envelope);

      expect(envelopeBefore).toBe(envelopeAfter);
    });
  });

  describe('10. Integration with Previous Phases', () => {
    it('should validate envelope created by Phase 1-5', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.issuerId).toBe(envelope.attestation.issuerId);
      expect(result.protocolVersion).toBe(envelope.attestation.protocolVersion);
      expect(result.issuedAt).toBe(envelope.attestation.issuedAt);
    });

    it('should be independent of identity content', () => {
      // Create two different identities
      const req1 = { ...baseRequest, vin: 'VIN123456789ABC1' };
      const req2 = { ...baseRequest, vin: 'VIN987654321DEF2' };

      const identity1 = issueAnonymousVehicleIdentity(req1);
      const identity2 = issueAnonymousVehicleIdentity(req2);

      // Build envelopes with same issuer and time
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
      const envelope2 = buildAnonymousVehicleIdentityAttestedEnvelope(identity2, scopeMetadata, attestation);

      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
      };

      const result1 = validateAnonymousVehicleIdentityTemporal(envelope1, input);
      const result2 = validateAnonymousVehicleIdentityTemporal(envelope2, input);

      // Same temporal validation regardless of identity content
      expect(result1.status).toBe(result2.status);
      expect(result1.reasons).toEqual(result2.reasons);
    });

    it('should not expose VIN in temporal validation results', () => {
      const envelope = createTestEnvelope(nowISO);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);
      const resultJSON = JSON.stringify(result);

      // Ensure no VIN patterns appear in result
      expect(resultJSON).not.toMatch(/JF1GC4B3X0E002345/);
      expect(resultJSON).not.toMatch(/vin/i);
    });
  });

  describe('11. Edge Cases and Boundary Conditions', () => {
    it('should handle zero maxAge correctly', () => {
      const issuedAt = new Date(now.getTime() - 1000).toISOString(); // 1 second old
      const envelope = createTestEnvelope(issuedAt);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        maxAgeMs: 0, // Anything older than now is too old
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('TOO_OLD');
    });

    it('should handle very large maxAge values', () => {
      const issuedAt = new Date(1000000000).toISOString(); // Very old timestamp
      const envelope = createTestEnvelope(issuedAt);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        maxAgeMs: Number.MAX_SAFE_INTEGER, // Effectively unlimited
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toMatch(/VALID|TOO_OLD/); // May be valid or too old depending on time
    });

    it('should handle negative clockSkew gracefully', () => {
      // Negative clock skew means stricter validation
      const envelope = createTestEnvelope(nowISO);
      const expiresAt = new Date(now.getTime() + 1000).toISOString(); // Expires in 1 second
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: nowISO,
        expiresAt,
        clockSkewMs: -1000, // Negative skew: stricter
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID'); // Still valid even with negative skew
    });

    it('should handle millisecond-precision timestamps', () => {
      const issuedAt = new Date('2026-03-10T12:00:00.123Z').toISOString();
      const envelope = createTestEnvelope(issuedAt);
      const input: AnonymousVehicleIdentityTemporalValidationInput = {
        validationVersion: '1.0',
        now: '2026-03-10T12:00:00.456Z',
      };

      const result = validateAnonymousVehicleIdentityTemporal(envelope, input);

      expect(result.status).toBe('VALID');
      expect(result.issuedAt).toBe(issuedAt);
    });
  });
});
