# Phase 3 Quick Reference

## Core Functions at a Glance

### 1. Generate Envelope Fingerprint
```typescript
const fingerprint = buildAnonymousVehicleIdentityEnvelopeFingerprint(
  identity,
  scopeMetadata,
  attestationVersion // optional, default: '1.0'
);
// Returns: 32-char hex string
```

### 2. Create Attestation
```typescript
const attestation = buildAnonymousVehicleIdentityAttestation(
  identity,
  scopeMetadata,
  {
    issuerId: 'EXPERTISE',
    attestationType: 'SELF_ASSERTED',  // optional
    attestationStatus: 'ISSUED',        // optional
    attestationVersion: '1.0',          // optional
    timestamp: new Date().toISOString() // optional
  }
);
// Returns: AnonymousVehicleIdentityAttestation
```

### 3. Create Attested Envelope
```typescript
const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(
  identity,
  scopeMetadata,
  attestation
);
// Returns: AnonymousVehicleIdentityAttestedEnvelope
```

---

## Type Reference

### Attestation Type
```typescript
interface AnonymousVehicleIdentityAttestation {
  attestationId: string;              // 'attest_<hash>'
  attestationVersion: string;         // e.g., '1.0'
  issuerId: string;                   // Issuer who created this
  issuedAt: string;                   // ISO 8601 timestamp
  protocolVersion: string;            // From identity
  attestationType: string;            // 'SELF_ASSERTED'
  attestationStatus: string;          // 'ISSUED', 'ACTIVE', 'REVOKED'
  envelopeFingerprint: string;       // Deterministic hash
}
```

### Attested Envelope Type
```typescript
interface AnonymousVehicleIdentityAttestedEnvelope {
  identity: AnonymousVehicleIdentity;
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata;
  attestation: AnonymousVehicleIdentityAttestation;
}
```

---

## Complete End-to-End Example

```typescript
// Step 1: Create identity (Phase 1)
const identity = issueAnonymousVehicleIdentity({
  vin: 'JF1GC4B3X0E002345',
  issuerId: 'EXPERTISE',
  domain: 'maintenance',
  contextClass: 'commercial-vehicle',
  epochType: 'CURRENT_MONTH',
  timestamp: new Date().toISOString(),
  protocolVersion: '1.0',
});

// Step 2: Create scope metadata (Phase 2)
const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata({
  issuerId: 'EXPERTISE',
  issuerType: 'INTERNAL',
  domain: 'maintenance',
  contextClass: 'commercial-vehicle',
  usagePolicy: 'READ_WRITE',
  epochType: 'MONTHLY',
  protocolVersion: '1.0',
  scopeVersion: '1.0',
});

// Step 3: Create attestation (Phase 3)
const attestation = buildAnonymousVehicleIdentityAttestation(
  identity,
  scopeMetadata,
  {
    issuerId: 'EXPERTISE',
    attestationType: 'SELF_ASSERTED',
    attestationStatus: 'ISSUED',
    timestamp: new Date().toISOString(),
  }
);

// Step 4: Create attested envelope (Phase 3)
const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(
  identity,
  scopeMetadata,
  attestation
);

// Use attestedEnvelope in downstream systems
console.log(attestedEnvelope);
// {
//   identity: { anonymousVehicleId: 'anon_...', ... },
//   scopeMetadata: { issuerId: 'EXPERTISE', ... },
//   attestation: { attestationId: 'attest_...', envelopeFingerprint: '...', ... }
// }
```

---

## Key Properties

| Property | Value |
|----------|-------|
| **VIN in attestation?** | NO ❌ |
| **Verification logic?** | NO ❌ |
| **Signatures?** | NO ❌ |
| **Deterministic?** | YES ✅ |
| **Pure functions?** | YES ✅ |
| **Stateless?** | YES ✅ |

---

## Attestation ID Format

```
'attest_' + 16-character hex string
Example: 'attest_a7f9e2c3d8b1f4a6'
```

The ID is deterministic based on:
- Identity anonymousVehicleId
- Issuer ID
- Timestamp

---

## Defaults

When creating attestation:

```typescript
{
  attestationType: 'SELF_ASSERTED',    // if not provided
  attestationStatus: 'ISSUED',          // if not provided
  attestationVersion: '1.0',            // if not provided
  timestamp: new Date().toISOString()   // if not provided
}
```

---

## Error Cases

### Missing issuerId
```typescript
// ❌ Throws error
buildAnonymousVehicleIdentityAttestation(identity, scope, { issuerId: '' });
```

### Missing attestationId in envelope
```typescript
// ❌ Throws error
buildAnonymousVehicleIdentityAttestedEnvelope(
  identity,
  scope,
  { attestationId: '', ... } // invalid
);
```

### Issuer ID mismatch
```typescript
// ❌ Throws error
buildAnonymousVehicleIdentityAttestedEnvelope(
  identity,
  { issuerId: 'A', ... },
  { issuerId: 'B', ... }  // mismatch!
);
```

---

## Testing Phase 3

Run tests:
```bash
npm test -- anonymousVehicleIdentity.phase3.test.ts
```

Test file location:
```
src/modules/identity/__tests__/anonymousVehicleIdentity.phase3.test.ts
```

Coverage:
- 41 test cases
- 100% function coverage
- All error paths tested

---

## Important Notes

### 1. VIN Protection
✅ VIN is ONLY used in Phase 1's `issueAnonymousVehicleIdentity()`
✅ VIN is NOT in fingerprint or attestation
✅ VIN is never stored or logged

### 2. Determinism
✅ Same identity + scope = Same fingerprint always
✅ Same identity + scope + timestamp = Same attestationId always
✅ Enables reproducible tracking

### 3. No Verification
⚠️ Phase 3 is assertion only
⚠️ Does NOT verify issuer authority
⚠️ Does NOT include cryptographic proof
⚠️ Verification is Phase 4+

### 4. Phases Are Additive
✅ Phase 3 builds on Phase 1 & 2
✅ All types and functions remain available
✅ Backward compatible

---

## Usage Patterns

### Pattern 1: Attestation for New Identity
```typescript
const identity = issueAnonymousVehicleIdentity(request);
const scope = buildAnonymousVehicleIdentityScopeMetadata(scopeInput);
const attestation = buildAnonymousVehicleIdentityAttestation(identity, scope, attestInput);
```

### Pattern 2: Multiple Attestations
```typescript
// Same identity, multiple issuers
const attestation1 = buildAnonymousVehicleIdentityAttestation(
  identity,
  scope1,
  { issuerId: 'EXPERTISE', ... }
);
const attestation2 = buildAnonymousVehicleIdentityAttestation(
  identity,
  scope2,
  { issuerId: 'INSURANCE', ... }
);
```

### Pattern 3: Check Envelope Integrity (Future)
```typescript
// Phase 3: Store fingerprint
const attestation = buildAnonymousVehicleIdentityAttestation(
  identity,
  scope,
  input
);

// Phase 4+: Verify fingerprint matches
// const isValid = verifyEnvelopeIntegrity(envelope);
```

---

## Common Questions

**Q: Can Phase 3 verify VIN?**  
A: No. Phase 3 is assertion only. Verification is Phase 4.

**Q: Can Phase 3 sign attestations?**  
A: No. Signatures are Phase 5+.

**Q: What if fingerprints don't match?**  
A: Phase 3 computes fingerprints. Phase 4+ will verify them.

**Q: Can I use Phase 3 without Phase 2?**  
A: No. Phase 3 requires Phase 2's scope metadata.

**Q: Is Phase 3 required?**  
A: No. Phase 2 works standalone. Phase 3 adds attestation layer.

---

## File References

| File | Purpose |
|------|---------|
| [anonymousVehicleIdentity.ts](src/modules/identity/anonymousVehicleIdentity.ts) | Implementation |
| [anonymousVehicleIdentity.phase3.test.ts](src/modules/identity/__tests__/anonymousVehicleIdentity.phase3.test.ts) | Tests |
| [PHASE_3_ATTESTATION.md](PHASE_3_ATTESTATION.md) | Full specification |
| [PHASE_3_IMPLEMENTATION_COMPLETE.md](PHASE_3_IMPLEMENTATION_COMPLETE.md) | Implementation notes |

---

**Version:** 1.0  
**Phase:** 3 (Attestation & Integrity)  
**Status:** ✅ Complete
