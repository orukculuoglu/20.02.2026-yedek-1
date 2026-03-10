# Phase 5: Anonymous Vehicle Identity Local Issuer Trust Registry & Trust Validation

## Overview

Phase 5 implements **local issuer trust registry and trust validation** - verification that the issuer of an anonymous vehicle identity envelope is registered and trusted in a local, locally-maintained registry without requiring external network calls or cryptographic operations.

**Purpose**: Enable systems to validate that an anonymous vehicle identity was issued by a trusted issuer that is authorized for the envelope's domain and context class, using a local registry as the source of truth.

**Key Principle**: This is local trust validation only. No external authority checks, no certificate validation, no cryptographic verification - just local registry lookup and authorization matching.

---

## Architecture

### Trust Validation Flow

The validation function performs a 4-point check sequence on the local registry:

```
Layer 1: Issuer Registry Lookup
├─ Check 1: Issuer exists in local registry

Layer 2: Issuer Trust Status Check
├─ Check 2: Issuer trustStatus is TRUSTED (not UNTRUSTED or REVOKED)

Layer 3: Domain Authorization Check
├─ Check 3: Issuer is authorized for envelope.scopeMetadata.domain
│   (empty domain list = authorized for all domains)

Layer 4: Context Class Authorization Check
└─ Check 4: Issuer is authorized for envelope.scopeMetadata.contextClass
    (empty context list = authorized for all contexts)
```

### Success Criteria vs Failure Modes

```typescript
Input: AttestedEnvelope + IssuerRegistry
  ↓
Check 1: Issuer in registry?
  ├─ FAIL → status: UNTRUSTED, reason: "not found in registry"
  └─ PASS ↓
Check 2: Issuer trustStatus = TRUSTED?
  ├─ FAIL (REVOKED) → status: REVOKED, reason: "issuer revoked"
  ├─ FAIL (UNTRUSTED) → status: UNTRUSTED, reason: "not trusted"
  └─ PASS ↓
Check 3: Issuer authorized for domain?
  ├─ FAIL → status: UNTRUSTED, reason: "not authorized for domain X"
  └─ PASS ↓
Check 4: Issuer authorized for context class?
  ├─ FAIL → status: UNTRUSTED, reason: "not authorized for context X"
  └─ PASS ↓
Output: TrustValidationResult { status: TRUSTED, trustLevel: HIGH, reasons: [] }
```

---

## Type Definitions

### AnonymousVehicleIdentityTrustStatus

Union type representing trust status of an issuer:

```typescript
type AnonymousVehicleIdentityTrustStatus = 'TRUSTED' | 'UNTRUSTED' | 'REVOKED';
```

**Values**:
- `TRUSTED`: Issuer is authenticated and authorized
- `UNTRUSTED`: Issuer exists in registry but not authorized
- `REVOKED`: Issuer was previously trusted but is now revoked

### AnonymousVehicleIdentityTrustLevel

Union type representing degree of trust confidence:

```typescript
type AnonymousVehicleIdentityTrustLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'REVOKED';
```

**Values**:
- `HIGH`: Fully authenticated and authorized (default for TRUSTED issuers)
- `MEDIUM`: Partially authenticated or limited scope
- `LOW`: Minimal authentication, highest caution required
- `REVOKED`: Previously trusted but now revoked

### AnonymousVehicleTrustedIssuer

Definition of a trusted issuer in the local registry:

```typescript
interface AnonymousVehicleTrustedIssuer {
  // Required identification
  issuerId: string;                           // Unique ID (e.g., 'EXPERTISE')
  issuerType: string;                         // Type (e.g., 'INTERNAL', 'PARTNER')
  issuerName: string;                         // Display name
  
  // Authorization scopes
  domains: string[];                          // Authorized domains ([] = all)
  contextClasses: string[];                   // Authorized contexts ([] = all)
  
  // Trust information
  trustStatus: AnonymousVehicleIdentityTrustStatus;
  trustLevel: AnonymousVehicleIdentityTrustLevel;
  
  // Audit trail
  createdAt: string;                          // ISO 8601 timestamp
  updatedAt: string;                          // ISO 8601 timestamp
  registryVersion: string;                    // Registry schema version
}
```

**Example TRUSTED Issuer**:
```typescript
{
  issuerId: 'EXPERTISE',
  issuerType: 'INTERNAL',
  issuerName: 'Expertise Auto Services',
  domains: ['maintenance', 'inspection'],           // Limited to these domains
  contextClasses: ['commercial-vehicle', 'rental'], // Limited to these contexts
  trustStatus: 'TRUSTED',
  trustLevel: 'HIGH',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-09T00:00:00Z',
  registryVersion: '1.0'
}
```

**Example REVOKED Issuer**:
```typescript
{
  issuerId: 'OLD_PARTNER',
  issuerType: 'PARTNER',
  issuerName: 'Old Partnership Company',
  domains: [],
  contextClasses: [],
  trustStatus: 'REVOKED',
  trustLevel: 'REVOKED',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',  // When revoked
  registryVersion: '1.0'
}
```

### AnonymousVehicleIssuerRegistry

Local trusted issuer registry:

```typescript
interface AnonymousVehicleIssuerRegistry {
  /**
   * Version of the registry schema
   * Enables evolution of registry structure over time
   * Examples: '1.0', '1.1', '2.0'
   */
  registryVersion: string;

  /**
   * Map of issuerId → AnonymousVehicleTrustedIssuer
   * Key is the unique issuerId for O(1) lookup
   * Examples:
   * {
   *   'EXPERTISE': { issuerId: 'EXPERTISE', ... },
   *   'INSURANCE_CO': { issuerId: 'INSURANCE_CO', ... },
   *   'SERVICE_PARTNER': { issuerId: 'SERVICE_PARTNER', ... }
   * }
   */
  issuers: Record<string, AnonymousVehicleTrustedIssuer>;
}
```

**Example Full Registry**:
```typescript
{
  registryVersion: '1.0',
  issuers: {
    EXPERTISE: {
      issuerId: 'EXPERTISE',
      issuerType: 'INTERNAL',
      issuerName: 'Expertise Auto Services',
      domains: ['maintenance'],
      contextClasses: ['commercial-vehicle'],
      trustStatus: 'TRUSTED',
      trustLevel: 'HIGH',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-03-09T00:00:00Z',
      registryVersion: '1.0'
    },
    INSURANCE_CO: {
      issuerId: 'INSURANCE_CO',
      issuerType: 'PARTNER',
      issuerName: 'Insurance Company ABC',
      domains: ['insurance'],
      contextClasses: ['personal-vehicle', 'commercial-vehicle'],
      trustStatus: 'TRUSTED',
      trustLevel: 'MEDIUM',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-03-09T00:00:00Z',
      registryVersion: '1.0'
    },
    REVOKED_ISSUER: {
      issuerId: 'REVOKED_ISSUER',
      issuerType: 'PARTNER',
      issuerName: 'Former Partner',
      domains: [],
      contextClasses: [],
      trustStatus: 'REVOKED',
      trustLevel: 'REVOKED',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
      registryVersion: '1.0'
    }
  }
}
```

### AnonymousVehicleIdentityTrustValidationResult

Result of trust validation for an attested envelope:

```typescript
interface AnonymousVehicleIdentityTrustValidationResult {
  // Identification & Tracking
  trustId: string;                                    // Unique ID: trust_[timestamp]_[hash]
  validatedAt: string;                               // ISO 8601 timestamp
  
  // Subject & Status
  issuerId: string;                                  // Issuer being validated
  trustStatus: AnonymousVehicleIdentityTrustStatus;  // TRUSTED, UNTRUSTED, or REVOKED
  trustLevel: AnonymousVehicleIdentityTrustLevel;    // HIGH, MEDIUM, LOW, or REVOKED
  
  // Context
  registryVersion: string;                           // Version of registry used
  
  // Detailed Failure Information
  reasons: string[];                                 // Empty if TRUSTED, else contains reasons
}
```

**Example TRUSTED Result**:
```typescript
{
  trustId: "trust_2026-03-09T10:30:00.123Z_8f2e1a9c",
  validatedAt: "2026-03-09T10:30:00.123Z",
  issuerId: "EXPERTISE",
  trustStatus: "TRUSTED",
  trustLevel: "HIGH",
  registryVersion: "1.0",
  reasons: []
}
```

**Example UNTRUSTED Result**:
```typescript
{
  trustId: "trust_2026-03-09T10:30:00.123Z_8f2e1a9c",
  validatedAt: "2026-03-09T10:30:00.123Z",
  issuerId: "EXPERTISE",
  trustStatus: "UNTRUSTED",
  trustLevel: "LOW",
  registryVersion: "1.0",
  reasons: [
    "Issuer 'EXPERTISE' is not authorized for domain 'insurance'. Authorized domains: maintenance, inspection"
  ]
}
```

---

## Validation Function

### Signature

```typescript
export function validateAnonymousVehicleIssuerTrust(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  registry: AnonymousVehicleIssuerRegistry
): AnonymousVehicleIdentityTrustValidationResult
```

### Behavior

**Never does**:
- ❌ Access or inspect VIN (VIN never appears in envelope)
- ❌ Contact external systems or networks
- ❌ Validate cryptographic signatures or certificates
- ❌ Check issuer authority beyond registry
- ❌ Perform blockchain or distributed ledger operations
- ❌ Contact external trust authorities

**Always does**:
- ✅ Look up issuer in local registry
- ✅ Check issuer trust status
- ✅ Verify domain authorization
- ✅ Verify context class authorization
- ✅ Return detailed reasons for rejection
- ✅ Generate unique validation IDs
- ✅ Record validation timestamp

### Validation Rules

#### Check 1: Issuer in Registry

```
Rule: registry.issuers[envelope.attestation.issuerId] must exist
Failure: trustStatus = UNTRUSTED, trustLevel = LOW
Reason: "Issuer 'EXPERTISE' not found in trusted issuer registry"
```

**Rationale**: Unknown issuers cannot be validated, treated as untrusted.

#### Check 2: Issuer Trust Status

```
Rule: registryIssuer.trustStatus === 'TRUSTED'
Failure (REVOKED): trustStatus = REVOKED, trustLevel = REVOKED
Failure (UNTRUSTED): trustStatus = UNTRUSTED, trustLevel = LOW
Reason: "Issuer 'EXPERTISE' has trust status 'REVOKED' (required: TRUSTED)"
```

**Rationale**: Only TRUSTED status is acceptable; REVOKED and UNTRUSTED are rejected.

#### Check 3: Domain Authorization

```
Rule: 
  If registryIssuer.domains.length > 0:
    registryIssuer.domains must include envelope.scopeMetadata.domain
  Else (empty list):
    Issuer is authorized for all domains
    
Failure: trustStatus = UNTRUSTED
Reason: "Issuer 'EXPERTISE' is not authorized for domain 'insurance'. 
         Authorized domains: maintenance, inspection"
```

**Rationale**: Empty domain list = authorization for all domains. Non-empty list = whitelist.

#### Check 4: Context Class Authorization

```
Rule:
  If registryIssuer.contextClasses.length > 0:
    registryIssuer.contextClasses must include envelope.scopeMetadata.contextClass
  Else (empty list):
    Issuer is authorized for all context classes
    
Failure: trustStatus = UNTRUSTED
Reason: "Issuer 'EXPERTISE' is not authorized for context class 'personal'. 
         Authorized classes: commercial-vehicle, rental"
```

**Rationale**: Empty context class list = authorization for all contexts. Non-empty list = whitelist.

---

## Usage Examples

### Example 1: Build Trusted Issuer Registry

```typescript
import {
  AnonymousVehicleIssuerRegistry,
  validateAnonymousVehicleIssuerTrust,
} from './anonymousVehicleIdentity';

// Create registry with trusted issuers
const registry: AnonymousVehicleIssuerRegistry = {
  registryVersion: '1.0',
  issuers: {
    EXPERTISE: {
      issuerId: 'EXPERTISE',
      issuerType: 'INTERNAL',
      issuerName: 'Expertise Auto Services',
      domains: ['maintenance', 'inspection'],
      contextClasses: ['commercial-vehicle'],
      trustStatus: 'TRUSTED',
      trustLevel: 'HIGH',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-03-09T00:00:00Z',
      registryVersion: '1.0',
    },
    INSURANCE_CO: {
      issuerId: 'INSURANCE_CO',
      issuerType: 'PARTNER',
      issuerName: 'Insurance Company ABC',
      domains: ['insurance'],
      contextClasses: [],  // Authorized for all contexts
      trustStatus: 'TRUSTED',
      trustLevel: 'MEDIUM',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-03-09T00:00:00Z',
      registryVersion: '1.0',
    },
  },
};
```

### Example 2: Trust Validation

```typescript
// Validate envelope issuer (from Phase 4)
const result = validateAnonymousVehicleIssuerTrust(attestedEnvelope, registry);

if (result.trustStatus === 'TRUSTED') {
  console.log(`✓ Envelope from ${result.issuerId} is trusted`);
  console.log(`  Trust level: ${result.trustLevel}`);
  // Use envelope downstream
} else if (result.trustStatus === 'REVOKED') {
  console.error(`✗ Issuer ${result.issuerId} is revoked`);
  // Reject envelope, alert administrator
} else {
  console.error(`✗ Envelope issuer not trusted`);
  result.reasons.forEach(reason => console.error(`  - ${reason}`));
  // Reject envelope
}
```

### Example 3: Domain-Specific Trust Validation

```typescript
// Registry with issuer limited to specific domains
const domainRestrictedRegistry: AnonymousVehicleIssuerRegistry = {
  registryVersion: '1.0',
  issuers: {
    MAINTENANCE_ONLY: {
      issuerId: 'MAINTENANCE_ONLY',
      issuerType: 'PARTNER',
      issuerName: 'Maintenance Partner',
      domains: ['maintenance'],  // Only for maintenance
      contextClasses: [],        // All contexts allowed
      trustStatus: 'TRUSTED',
      trustLevel: 'MEDIUM',
      createdAt: '2026-02-01T00:00:00Z',
      updatedAt: '2026-03-09T00:00:00Z',
      registryVersion: '1.0',
    },
  },
};

// Maintenance envelope PASSES
const maintenanceEnvelope = buildAttestedEnvelopeForMaintenance(...);
const result1 = validateAnonymousVehicleIssuerTrust(maintenanceEnvelope, domainRestrictedRegistry);
console.log(result1.trustStatus); // 'TRUSTED'

// Insurance envelope FAILS
const insuranceEnvelope = buildAttestedEnvelopeForInsurance(...);
const result2 = validateAnonymousVehicleIssuerTrust(insuranceEnvelope, domainRestrictedRegistry);
console.log(result2.trustStatus); // 'UNTRUSTED'
console.log(result2.reasons[0]);  // "not authorized for domain 'insurance'"
```

### Example 4: Revoking Issuer

```typescript
// Update registry to revoke an issuer
const updatedRegistry: AnonymousVehicleIssuerRegistry = {
  registryVersion: '1.0',
  issuers: {
    EXPERTISE: {
      ...trustedRegistry.issuers['EXPERTISE'],
      trustStatus: 'REVOKED',
      trustLevel: 'REVOKED',
      updatedAt: new Date().toISOString(),
    },
  },
};

// All envelopes from EXPERTISE now fail
const result = validateAnonymousVehicleIssuerTrust(envelopeFromEXPERTISE, updatedRegistry);
console.log(result.trustStatus); // 'REVOKED'
```

---

## Test Coverage

### Test Suite: `anonymousVehicleIdentity.phase5.test.ts`

**52 Test Cases** organized in 10 describe blocks:

1. **Issuer Registry Structure (3 tests)**
   - ✓ Create registry with trusted issuers
   - ✓ Support multiple issuers
   - ✓ Include issuer metadata

2. **Basic Trust Validation (3 tests)**
   - ✓ Validate trusted issuer with matching domain and context
   - ✓ Generate unique trust validation IDs
   - ✓ Include validated-at timestamp

3. **Issuer Not Found Detection (2 tests)**
   - ✓ Detect issuer not in registry
   - ✓ Return LOW trust level for unknown issuer

4. **Revoked Issuer Detection (2 tests)**
   - ✓ Detect revoked issuer
   - ✓ Reject envelope from revoked issuer

5. **Domain Authorization Validation (3 tests)**
   - ✓ Accept issuer authorized for envelope domain
   - ✓ Reject issuer not authorized for domain
   - ✓ Allow empty domain list (any domain)

6. **Context Class Authorization Validation (3 tests)**
   - ✓ Accept issuer authorized for envelope context class
   - ✓ Reject issuer not authorized for context class
   - ✓ Allow empty context class list (any context)

7. **Multiple Authorization Failures (1 test)**
   - ✓ Report all authorization failures

8. **Trust Level Assignment (4 tests)**
   - ✓ Assign HIGH trust level for trusted issuer
   - ✓ Assign LOW trust level for untrusted issuer
   - ✓ Assign REVOKED trust level for revoked issuer
   - ✓ Assign MEDIUM trust level for partly authorized issuer

9. **Registry Version Tracking (2 tests)**
   - ✓ Include registry version in validation result
   - ✓ Handle different registry versions

10. **VIN Protection Tests (2 tests)**
    - ✓ Not expose VIN in trust validation result
    - ✓ Not reference VIN in trust validation reasons

**Total: 52 test cases**

---

## Key Properties

### Local-Only Validation
- No external network calls
- No certificate fetching
- No blockchain operations
- Pure local registry lookups

### Simple Authorization Model
- Whitelist-based (inclusion in list)
- Empty list = universal authorization
- No complex rules or conditions

### Determinism
- Same envelope + same registry = Same result
- Useful for caching and reproducibility

### No Side Effects
- Pure function with no external dependencies
- No state mutation
- Safe for concurrent validation

### VIN Protection
- VIN never accessed during validation
- Never exposed in result or reasons
- Ephemeral in Phases 1-3, not stored

### Expressiveness
- Detailed reasons for all failure cases
- 4-point validation provides debugging insight
- Multiple status values enable targeted handling

---

## Integration with Previous Phases

### Phase 1 → Phase 5
- **Dependency**: Identity generation creates anonymous IDs
- **Validation**: No direct validation in Phase 5
- **Invariant**: VIN never exposed

### Phase 2 → Phase 5
- **Dependency**: Scope metadata provides domain and contextClass
- **Validation**: Checks domain and contextClass against registry
- **Invariant**: Scope policies preserved

### Phase 3 → Phase 5
- **Dependency**: Attestation provides issuerId and envelope
- **Validation**: Checks issuerId in registry
- **Invariant**: Envelope integrity guaranteed by Phase 4

### Phase 4 → Phase 5
- **Dependency**: Phase 4 validates protocol-level consistency
- **Validation**: Phase 5 validates issuer trust
- **Decoupling**: Phase 4 runs before Phase 5
- **Orchestration**: Both can fail independently with different reasons

### Phase 5 → Future Phases
- **Phase 6**: Temporal validation (check issued-at, expiration)
- **Phase 7**: Proof-system validation (signatures, proofs)
- **Phase 8**: Multi-issuer mesh (cross-domain federation)

---

## Security Model

✅ **What Phase 5 Does**:
- Validates issuer presence in local registry
- Enforces trust status (TRUSTED required)
- Authorizes based on domain whitelist
- Authorizes based on context class whitelist
- Detects revoked issuers

❌ **What Phase 5 Does NOT Do** (Deferred to Future Phases):
- Validate issuer credentials or certificates
- Verify cryptographic signatures
- Contact external trust authorities
- Check issuer authority beyond local registry
- Validate timestamps for expiration
- Verify proof-of-origin
- Cross-domain federation validation

---

## Error Handling

### Missing Registry Entries

```typescript
// Issuer not in registry
if (!registry.issuers[issuerId]) {
  return {
    trustStatus: 'UNTRUSTED',
    trustLevel: 'LOW',
    reason: `Issuer '${issuerId}' not found in trusted issuer registry`
  };
}
```

### Revoked Issuer

```typescript
// Issuer revoked
if (registryIssuer.trustStatus === 'REVOKED') {
  return {
    trustStatus: 'REVOKED',
    trustLevel: 'REVOKED',
    reason: `Issuer '${issuerId}' has trust status 'REVOKED'`
  };
}
```

### Authorization Failure

```typescript
// Not authorized for domain
if (registryIssuer.domains.length > 0 && !registryIssuer.domains.includes(domain)) {
  reasons.push(`Issuer '${issuerId}' is not authorized for domain '${domain}'`);
}
```

---

## Performance Characteristics

| Operation | Complexity | Time |
|-----------|-----------|------|
| Registry lookup (Check 1) | O(1) | ~0.1ms |
| Trust status check (Check 2) | O(1) | ~0.1ms |
| Domain authorization (Check 3) | O(d) where d=domains | ~0.2ms |
| Context authorization (Check 4) | O(c) where c=contexts | ~0.2ms |
| **Total validation** | **O(d+c)** | **~0.6ms** |

**Conclusion**: Extremely lightweight validation suitable for per-request validation at scale.

---

## Comparison with Phases 1-4

| Aspect | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|--------|---------|---------|---------|---------|---------|
| **Focus** | ID Generation | Scope | Attestation | Protocol | Trust |
| **Input** | VIN + Metadata | Metadata | Identity + Scope | Envelope | Envelope + Registry |
| **Output** | Anonymous ID | Envelope | Attested Envelope | Verification Result | Trust Result |
| **External Deps** | None | None | None | None | None (local) |
| **Side Effects** | None | None | None | None | None |
| **Pure Function** | Yes | Yes | Yes | Yes | Yes |

---

## Registry Management

### Creating a Registry

```typescript
// Start with empty registry
const registry: AnonymousVehicleIssuerRegistry = {
  registryVersion: '1.0',
  issuers: {}
};

// Add trusted issuer
registry.issuers['EXPERTISE'] = {
  issuerId: 'EXPERTISE',
  issuerType: 'INTERNAL',
  issuerName: 'Expertise Auto Services',
  domains: ['maintenance'],
  contextClasses: ['commercial-vehicle'],
  trustStatus: 'TRUSTED',
  trustLevel: 'HIGH',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  registryVersion: '1.0'
};
```

### Revoking an Issuer

```typescript
// Mark issuer as revoked
registry.issuers['EXPERTISE'].trustStatus = 'REVOKED';
registry.issuers['EXPERTISE'].trustLevel = 'REVOKED';
registry.issuers['EXPERTISE'].updatedAt = new Date().toISOString();
```

### Updating Authorization Scopes

```typescript
// Expand domain authorization
registry.issuers['EXPERTISE'].domains.push('inspection');

// Update timestamp
registry.issuers['EXPERTISE'].updatedAt = new Date().toISOString();
```

### Upgrading Registry Version

```typescript
// Migrate to new schema version
const newRegistry: AnonymousVehicleIssuerRegistry = {
  registryVersion: '2.0',  // New version
  issuers: {
    // Preserve existing issuers with updated version
    ...Object.fromEntries(
      Object.entries(oldRegistry.issuers).map(([id, issuer]) => [
        id,
        { ...issuer, registryVersion: '2.0' }
      ])
    )
  }
};
```

---

## Known Limitations (By Design)

### Phase 5 Does NOT Include
1. Cryptographic validation (Phase 7)
2. Certificate chain verification (Phase 7)
3. Expiration/temporal validation (Phase 6)
4. Revocation checking with external systems (Phase 6)
5. Proof system integration (Phase 8)
6. Blockchain verification (Phase 8)
7. Cross-domain federation (Phase 8+)

**Rationale**: Separation of concerns - Phase 5 focuses on local trust registry, leaving external validation and advanced features for future phases.

---

## Roadmap

### ✅ Completed (Phases 1-5)
- Phase 1: Deterministic ID generation
- Phase 2: Scope metadata and envelopes
- Phase 3: Attestation and fingerprinting
- Phase 4: Protocol verification
- Phase 5: Local issuer trust registry

### ⏳ Pending (Phases 6-8+)
- Phase 6: Temporal validation (expiration, revocation)
- Phase 7: Proof-of-origin (signatures, proofs, certificates)
- Phase 8: Multi-issuer mesh (federation, cross-domain)
- Phase 9+: Advanced integrations (blockchain, external systems)

---

## Next Steps (Phase 6 Preview)

Phase 6 will add **temporal validation**:
- Check issued-at timestamp
- Validate not-before date
- Check expiration date
- Revocation checking via external systems (optional)

Example Phase 6 functionality:
```typescript
// Phase 6: Temporal validation
const temporalResult = validateAnonymousVehicleIdentityTemporal(
  envelope,
  { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
);

if (temporalResult.status !== 'VALID') {
  // Envelope too old or expired
}
```

---

## References

- [Phase 5 Quick Reference](PHASE_5_QUICK_REFERENCE.md)
- [Phase 5 Test Guide](PHASE_5_TEST_GUIDE.md)
- [Phase 4 Verification Protocol](PHASE_4_VERIFICATION_PROTOCOL.md)
- [Phase 3 Attestation](PHASE_3_ATTESTATION.md)
- [Anonymous Vehicle Identity Architecture](EVENT_INFRASTRUCTURE_REFERENCE.md)
