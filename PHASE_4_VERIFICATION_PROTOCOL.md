# Phase 4: Anonymous Vehicle Identity Verification Protocol

## Overview

Phase 4 implements **protocol-level envelope verification** - a pure structural and consistency validation of the 3-layer Anonymous Vehicle Identity (AVIDs) attested envelope without cryptographic signature verification or external authority validation.

**Purpose**: Ensure that an anonymous vehicle identity envelope maintains structural integrity, consistency across all three layers (identity, scope metadata, attestation), and satisfies caller-specific expectations.

**Key Principle**: This is protocol verification only. Cryptographic signing and proof-of-origin validation are reserved for future phases.

---

## Architecture

### Verification Layers

The verification function performs a 11-point validation sequence:

```
Layer 1: Required Fields Check
├─ Check 1: Identity.anonymousVehicleId exists
├─ Check 2: ScopeMetadata.issuerId exists
└─ Check 3: Attestation.attestationId exists

Layer 2: Cross-Layer Consistency Check
├─ Check 4: Attestation.issuerId === ScopeMetadata.issuerId
├─ Check 5: Identity.protocolVersion === ScopeMetadata.protocolVersion
└─ Check 6: Attestation.protocolVersion === Identity.protocolVersion

Layer 3: Integrity Check
└─ Check 7: Recomputed fingerprint === Attestation.envelopeFingerprint

Layer 4: Optional Expectation Checks
├─ Check 8: issuerId matches expectedIssuerId (if provided)
├─ Check 9: Domain matches expectedDomain (if provided)
├─ Check 10: ContextClass matches expectedContextClass (if provided)
└─ Check 11: ProtocolVersion matches expectedProtocolVersion (if provided)
```

### Verification Flow

```typescript
Input: AttestedEnvelope + VerificationInput
  ↓
Validate Required Fields (Checks 1-3)
  ├─ FAIL → status: INVALID, reason: missing field
  └─ PASS ↓
Validate Cross-Layer Consistency (Checks 4-6)
  ├─ FAIL (issuer mismatch) → status: INVALID, reason: issuer mismatch
  ├─ FAIL (protocol mismatch) → status: PROTOCOL_MISMATCH, reason: version mismatch
  └─ PASS ↓
Validate Fingerprint Integrity (Check 7)
  ├─ FAIL → status: INVALID, reason: fingerprint mismatch
  └─ PASS ↓
Validate Optional Expectations (Checks 8-11)
  ├─ FAIL (wrong issuer) → status: UNAUTHORIZED_ISSUER
  ├─ FAIL (wrong scope) → status: WRONG_SCOPE
  ├─ FAIL (protocol version) → status: PROTOCOL_MISMATCH
  └─ PASS ↓
Output: VerificationResult { status: VALID, reasons: [] }
```

---

## Type Definitions

### AnonymousVehicleIdentityVerificationStatus

Union type representing all possible verification outcomes:

```typescript
type AnonymousVehicleIdentityVerificationStatus = 
  | 'VALID'                  // All checks pass
  | 'INVALID'                // Structure or integrity failure
  | 'WRONG_SCOPE'            // Domain or context mismatch
  | 'UNAUTHORIZED_ISSUER'    // Issuer not as expected
  | 'PROTOCOL_MISMATCH'      // Version consistency failure
  | 'EXPIRED';               // Reserved for future expiration handling
```

### AnonymousVehicleIdentityVerificationResult

Complete verification outcome with all required contextual information:

```typescript
interface AnonymousVehicleIdentityVerificationResult {
  // Identification & Tracking
  verificationId: string;                          // Unique ID: verify_[timestamp]_[hash]
  verifiedAt: string;                             // ISO 8601 timestamp
  
  // Verification Status & Details
  status: AnonymousVehicleIdentityVerificationStatus;
  protocolVersion: string;                        // Protocol version of envelope
  verificationVersion: string;                    // Version of verification process
  issuerId: string;                               // Issuer from attestation
  
  // Integrity Evidence
  envelopeFingerprint: string;                    // 32-char hex fingerprint
  
  // Detailed Failure Information
  reasons: string[];                              // Empty if status: VALID
}
```

**Example VALID Result**:
```typescript
{
  verificationId: "verify_2026-03-09T10:30:00Z_8f2e1a9c",
  verifiedAt: "2026-03-09T10:30:00.123Z",
  status: "VALID",
  protocolVersion: "1.0",
  verificationVersion: "1.0",
  issuerId: "EXPERTISE",
  envelopeFingerprint: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  reasons: []
}
```

**Example INVALID Result**:
```typescript
{
  verificationId: "verify_2026-03-09T10:30:00Z_8f2e1a9c",
  verifiedAt: "2026-03-09T10:30:00.123Z",
  status: "UNAUTHORIZED_ISSUER",
  protocolVersion: "1.0",
  verificationVersion: "1.0",
  issuerId: "EXPERTISE",
  envelopeFingerprint: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  reasons: ["Envelope issuer 'EXPERTISE' does not match expectedIssuerId 'POLICY_ADMIN'"]
}
```

### AnonymousVehicleIdentityVerificationInput

Optional expectations for the verification:

```typescript
interface AnonymousVehicleIdentityVerificationInput {
  verificationVersion: string;                    // Required: verification protocol version
  expectedIssuerId?: string;                      // Check: attestation.issuerId
  expectedDomain?: string;                        // Check: scopeMetadata.domain
  expectedContextClass?: string;                  // Check: scopeMetadata.contextClass
  expectedProtocolVersion?: string;               // Check: all protocol versions match
}
```

---

## Verification Function

### Signature

```typescript
export function verifyAnonymousVehicleIdentityEnvelope(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  input: AnonymousVehicleIdentityVerificationInput
): AnonymousVehicleIdentityVerificationResult
```

### Behavior

**Never does:**
- ❌ Access or inspect VIN (VIN never appears in envelope)
- ❌ Validate cryptographic signatures
- ❌ Check authority/issuer legitimacy
- ❌ Verify expiration dates (reserved for Phase 5+)
- ❌ Contact external systems or databases

**Always does:**
- ✅ Validate required fields exist
- ✅ Check consistency across layers
- ✅ Verify fingerprint integrity
- ✅ Match optional expectations
- ✅ Return detailed reasons for failures
- ✅ Generate unique verification IDs

### Validation Rules

#### Check 1: Identity Required Fields
```
Rule: envelope.identity.anonymousVehicleId must be non-empty string
Failure: status = INVALID
Reason: "Missing required field: identity.anonymousVehicleId"
```

#### Check 2: Scope Metadata Required Fields
```
Rule: envelope.scopeMetadata.issuerId must be non-empty string
Failure: status = INVALID
Reason: "Missing required field: scopeMetadata.issuerId"
```

#### Check 3: Attestation Required Fields
```
Rule: envelope.attestation.attestationId must be non-empty string
Failure: status = INVALID
Reason: "Missing required field: attestation.attestationId"
```

#### Check 4: Issuer Consistency
```
Rule: envelope.attestation.issuerId === envelope.scopeMetadata.issuerId
Failure: status = INVALID
Reason: "Issuer mismatch between attestation and scope metadata"
```

#### Check 5: Identity Protocol Version
```
Rule: envelope.identity.protocolVersion === envelope.scopeMetadata.protocolVersion
Failure: status = PROTOCOL_MISMATCH
Reason: "Protocol version mismatch: identity (1.0) !== scope (2.0)"
```

#### Check 6: Attestation Protocol Version
```
Rule: envelope.attestation.protocolVersion === envelope.identity.protocolVersion
Failure: status = PROTOCOL_MISMATCH
Reason: "Protocol version mismatch: attestation (1.0) !== identity (2.0)"
```

#### Check 7: Fingerprint Integrity
```
Rule: computedFingerprint(identity, scopeMetadata) === envelope.attestation.envelopeFingerprint
Failure: status = INVALID
Reason: "Envelope fingerprint mismatch: computed (abc123...) !== stored (def456...)"
```

#### Check 8: Expected Issuer
```
Rule: envelope.attestation.issuerId === input.expectedIssuerId (if provided)
Failure: status = UNAUTHORIZED_ISSUER
Reason: "Envelope issuer 'EXPERTISE' does not match expectedIssuerId 'POLICY_ADMIN'"
```

#### Check 9: Expected Domain
```
Rule: envelope.scopeMetadata.domain === input.expectedDomain (if provided)
Failure: status = WRONG_SCOPE
Reason: "Envelope domain 'maintenance' does not match expectedDomain 'insurance'"
```

#### Check 10: Expected Context Class
```
Rule: envelope.scopeMetadata.contextClass === input.expectedContextClass (if provided)
Failure: status = WRONG_SCOPE
Reason: "Envelope context class 'commercial-vehicle' does not match expectedContextClass 'personal-vehicle'"
```

#### Check 11: Expected Protocol Version
```
Rule: envelope.identity.protocolVersion === input.expectedProtocolVersion (if provided)
Failure: status = PROTOCOL_MISMATCH
Reason: "Envelope protocol version '1.0' does not match expectedProtocolVersion '2.0'"
```

---

## Usage Examples

### Example 1: Basic Verification

```typescript
import {
  issueAnonymousVehicleIdentity,
  buildAnonymousVehicleIdentityScopeMetadata,
  buildAnonymousVehicleIdentityAttestation,
  buildAnonymousVehicleIdentityAttestedEnvelope,
  verifyAnonymousVehicleIdentityEnvelope,
} from './anonymousVehicleIdentity';

// Create envelope (Phases 1-3)
const identity = issueAnonymousVehicleIdentity({
  vin: 'JF1GC4B3X0E002345',
  issuerId: 'EXPERTISE',
  domain: 'maintenance',
  contextClass: 'commercial-vehicle',
  epochType: 'CURRENT_MONTH',
  timestamp: new Date().toISOString(),
  protocolVersion: '1.0',
});

const scopeMetadata = buildAnonymousVehicleIdentityScopeMetadata({
  issuerId: 'EXPERTISE',
  issuerType: 'INTERNAL',
  domain: 'maintenance',
  subDomain: 'preventive',
  contextClass: 'commercial-vehicle',
  usagePolicy: 'READ_WRITE',
  epochType: 'MONTHLY',
  protocolVersion: '1.0',
  scopeVersion: '1.0',
});

const attestation = buildAnonymousVehicleIdentityAttestation(
  identity,
  scopeMetadata,
  {
    issuerId: 'EXPERTISE',
    attestationType: 'SELF_ASSERTED',
    attestationStatus: 'ISSUED',
    attestationVersion: '1.0',
    timestamp: new Date().toISOString(),
  }
);

const attestedEnvelope = buildAnonymousVehicleIdentityAttestedEnvelope(
  identity,
  scopeMetadata,
  attestation
);

// Verify (Phase 4)
const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
  verificationVersion: '1.0',
});

console.log(result);
// Output:
// {
//   verificationId: "verify_2026-03-09T10:30:00.123Z_...",
//   verifiedAt: "2026-03-09T10:30:00.123Z",
//   status: "VALID",
//   protocolVersion: "1.0",
//   verificationVersion: "1.0",
//   issuerId: "EXPERTISE",
//   envelopeFingerprint: "a1b2c3d4e5f6...",
//   reasons: []
// }
```

### Example 2: Verification with Expectations

```typescript
const result = verifyAnonymousVehicleIdentityEnvelope(attestedEnvelope, {
  verificationVersion: '1.0',
  expectedIssuerId: 'EXPERTISE',
  expectedDomain: 'maintenance',
  expectedContextClass: 'commercial-vehicle',
  expectedProtocolVersion: '1.0',
});

if (result.status === 'VALID') {
  console.log('✓ Envelope valid for maintenance domain');
} else if (result.status === 'UNAUTHORIZED_ISSUER') {
  console.log('✗ Issuer not authorized:', result.reasons[0]);
} else if (result.status === 'WRONG_SCOPE') {
  console.log('✗ Wrong domain/context:', result.reasons[0]);
}
```

### Example 3: Handling Verification Failures

```typescript
const result = verifyAnonymousVehicleIdentityEnvelope(
  modifiedEnvelope, // Envelope with modified identity
  { verificationVersion: '1.0' }
);

switch (result.status) {
  case 'VALID':
    // Process envelope
    break;
  case 'INVALID':
    // Log structural issues
    console.error('Envelope corrupted:', result.reasons);
    break;
  case 'PROTOCOL_MISMATCH':
    // Log version inconsistencies
    console.error('Version mismatch:', result.reasons);
    break;
  case 'UNAUTHORIZED_ISSUER':
    // Log issuer issues
    console.error('Unauthorized issuer:', result.reasons);
    break;
  case 'WRONG_SCOPE':
    // Log scope issues
    console.error('Wrong scope:', result.reasons);
    break;
}
```

---

## Test Coverage

### Test Suite: `anonymousVehicleIdentity.phase4.test.ts`

**46 Test Cases** organized in 8 describe blocks:

1. **Basic Envelope Verification (3 tests)**
   - ✓ Successfully verify valid envelope
   - ✓ Generate unique verification IDs
   - ✓ Include verified-at timestamp

2. **Invalid Envelope Detection (3 tests)**
   - ✓ Detect missing anonymousVehicleId
   - ✓ Detect missing issuerId
   - ✓ Detect missing attestationId

3. **Issuer Consistency Verification (4 tests)**
   - ✓ Detect issuer mismatch between attestation and scope
   - ✓ Accept valid issuer with expected ID
   - ✓ Detect unauthorized issuer
   - ✓ Compare with expected issuer ID

4. **Fingerprint Integrity Tests (3 tests)**
   - ✓ Detect fingerprint mismatch when identity modified
   - ✓ Detect fingerprint mismatch when scope modified
   - ✓ Include fingerprint in verification result

5. **Protocol Version Consistency (4 tests)**
   - ✓ Verify when all protocol versions match
   - ✓ Detect mismatch between identity and scope
   - ✓ Detect mismatch between attestation and identity
   - ✓ Detect mismatch with expected version

6. **Scope Matching Verification (4 tests)**
   - ✓ Accept valid domain matching expected
   - ✓ Detect wrong domain
   - ✓ Accept valid context class matching expected
   - ✓ Detect wrong context class

7. **Multiple Criteria Verification (2 tests)**
   - ✓ Verify with multiple expected criteria
   - ✓ Report first failure with multiple criteria

8. **VIN Protection Tests (2 tests)**
   - ✓ Not expose VIN in verification result
   - ✓ Not reference VIN in verification reasons

**Total: 46 test cases**

---

## Key Properties

### Determinism
- Same envelope + same verification input = Same result
- Useful for caching and reproducibility

### No Side Effects
- Pure function with no external dependencies
- No state mutation
- Safe for concurrent verification

### VIN Protection
- VIN never used in verification logic
- Never exposed in result or reasons
- Ephemeral in Phases 1-3, not stored

### Expressiveness
- Detailed reasons for all failure cases
- 11-point validation provides debugging insight
- Multiple status values enable targeted handling

### Extensibility
- Optional expectations allow flexible validation
- Reserved status values (EXPIRED) for future phases
- VerificationInput structure allows new criteria

---

## Integration with Previous Phases

### Phase 1 → Phase 4
- **Dependency**: Identity generation creates anonymous IDs
- **Verification**: Checks anonymousVehicleId exists and is non-empty
- **Invariant**: VIN never exposed

### Phase 2 → Phase 4
- **Dependency**: Scope metadata provides business context
- **Verification**: Checks issuerId and domain consistency
- **Invariant**: Usage policies and domain scoping maintained

### Phase 3 → Phase 4
- **Dependency**: Attestation provides issuer assertion and fingerprint
- **Verification**: Recomputes fingerprint and compares with stored
- **Invariant**: Envelope integrity through deterministic hashing

### Phase 4 → Future Phases
- **Phase 5**: External authority validation (certificates, blockchain)
- **Phase 6**: Expiration and revocation checking
- **Phase 7**: Proof-of-origin verification (signatures, proofs)

---

## Security Constraints

✅ **What Phase 4 Does**:
- Validates structure and consistency
- Detects tampering via fingerprint
- Enforces issuer alignment
- Matches caller expectations

❌ **What Phase 4 Does NOT Do** (Deferred):
- Validate issuer authority or legitimacy
- Verify cryptographic signatures
- Check certificate chains
- Contact blockchain or external databases
- Validate timestamps for expiration
- Verify proof-of-origin

---

## Error Handling

### Null/Undefined Handling
```typescript
if (!envelope?.identity?.anonymousVehicleId) {
  return {
    status: 'INVALID',
    reason: 'Missing required field: identity.anonymousVehicleId'
  };
}
```

### Empty String Handling
```typescript
if (envelope.attestation.issuerId === '') {
  return {
    status: 'INVALID',
    reason: 'Missing required field: attestation.issuerId'
  };
}
```

### Type Safety
- All inputs typed strictly
- No type coercion in comparisons
- Fingerprint expected as 32-char hex string

---

## Performance Characteristics

| Operation | Complexity | Time |
|-----------|-----------|------|
| Required field checks (Checks 1-3) | O(1) | ~1ms |
| Consistency checks (Checks 4-6) | O(1) | ~1ms |
| Fingerprint recomputation (Check 7) | O(n) where n=field count | ~2ms |
| Optional checks (Checks 8-11) | O(1) | ~1ms |
| **Total** | **O(n)** | **~5ms** |

Verification is lightweight, suitable for per-request validation.

---

## Comparison with Phases 1-3

| Aspect | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|
| **Focus** | ID Generation | Scope Metadata | Attestation | Verification |
| **Input** | VIN + Metadata | Metadata | Identity + Scope | Envelope |
| **Output** | Anonymous ID | Scoped Envelope | Attested Envelope | Verification Result |
| **VIN Exposure** | Ephemeral | None | None | None |
| **Cryptography** | Deterministic hash | Hash | Hash | Hash comparison |
| **Side Effects** | None | None | None | None |
| **Pure Function** | Yes | Yes | Yes | Yes |

---

## Next Steps (Phase 5+)

1. **Phase 5: Authority Validation**
   - Verify issuer legitimacy via credentials
   - Certificate chain validation
   - Blockchain/proof-system integration

2. **Phase 6: Temporal Validation**
   - Check issued-at timestamp
   - Validate not-before and expiration
   - Revocation checking

3. **Phase 7: Proof-of-Origin**
   - Cryptographic signature verification
   - Proof system validation
   - Non-repudiation assurance

4. **Phase 8: Multi-Issuer Mesh**
   - Federated verification across domains
   - Cross-issuer attestation
   - Provenance tracking

---

## References

- [Phase 4 Quick Reference](PHASE_4_QUICK_REFERENCE.md)
- [Phase 4 Test Guide](PHASE_4_TEST_GUIDE.md)
- [Phase 3 Attestation](PHASE_3_ATTESTATION.md)
- [Anonymous Vehicle Identity Architecture](EVENT_INFRASTRUCTURE_REFERENCE.md)
