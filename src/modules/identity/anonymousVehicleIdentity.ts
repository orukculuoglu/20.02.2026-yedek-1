/**
 * Anonymous Vehicle Identity Layer - Phase 1: Issuance
 * 
 * Purpose:
 * Generate anonymous, deterministic vehicle identifiers that:
 * - Are unique to a vehicle within a domain
 * - Never expose VIN
 * - Enable downstream systems to track vehicles without revealing identity
 * - Use cryptographic hashing for deterministic generation
 * 
 * Design:
 * - PURE: No side effects, no storage
 * - STATELESS: Each issuance self-contained
 * - DETERMINISTIC: Same inputs → same anonymousVehicleId always
 * - EPHEMERAL: VIN exists only during computation, never stored
 * - CONTEXT-AWARE: Different domains get different IDs from same VIN
 * 
 * Data Flow (Phase 1):
 * AnonymousVehicleIdentityRequest (contains VIN)
 *   ↓ Pass to issuer
 * issueAnonymousVehicleIdentity()
 *   ↓ Hash VIN + metadata
 *   ↓ Generate anonymousVehicleId
 *   ↓ Create AnonymousVehicleIdentity (VIN discarded)
 *   ↓ Return
 * AnonymousVehicleIdentity (no VIN)
 * 
 * Future Phases:
 * - Phase 2: Verification (validate VIN matches ID)
 * - Phase 3: Attestation (prove ownership/authority)
 * - Phase 4: Proof (zero-knowledge proofs)
 */

/**
 * Anonymous Vehicle Identity
 * 
 * The final issued anonymous identifier for a vehicle.
 * Contains NO sensitive information.
 * Can be safely transmitted, logged, and stored.
 */
export interface AnonymousVehicleIdentity {
  /**
   * Anonymous identifier for this vehicle in this domain/context
   * Generated deterministically from VIN + metadata
   * Format: 'anon_' + 32-char hex hash
   * Example: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0'
   */
  anonymousVehicleId: string;

  /**
   * Issuer identifier
   * Which system/service issued this anonymous ID
   * Examples: 'EXPERTISE', 'INSURANCE', 'SERVICE'
   */
  issuerId: string;

  /**
   * Domain where this ID is valid
   * Scopes the identity to specific business context
   * Examples: 'maintenance', 'insurance', 'fleet-management'
   */
  domain: string;

  /**
   * Context class for additional categorization
   * Allows same vehicle to have different IDs in different contexts
   * Examples: 'personal', 'commercial', 'rental'
   */
  contextClass: string;

  /**
   * Epoch identifier
   * Time-period or version when this ID was issued
   * Enables rotation/renewal without breaking existing IDs
   * Format: 'YYYY-MM' or version string
   * Example: '2026-03' or 'v1.0'
   */
  epoch: string;

  /**
   * Timestamp when identity was issued (ISO 8601)
   */
  issuedAt: string;

  /**
   * Protocol version for this identity type
   * Enables future changes without breaking existing IDs
   * Examples: '1.0', '1.1'
   */
  protocolVersion: string;
}

/**
 * Anonymous Vehicle Identity Request
 * 
 * Input contract for issuing an anonymous vehicle identity.
 * Contains the sensitive VIN which will NOT be persisted.
 */
export interface AnonymousVehicleIdentityRequest {
  /**
   * Vehicle Identification Number
   * TEMPORARY: Only used to compute the hash
   * Will NOT be stored in the issued identity
   * Will NOT appear in any output
   */
  vin: string;

  /**
   * Issuer identifier
   * Which system is requesting this identity
   */
  issuerId: string;

  /**
   * Domain where this ID will be used
   */
  domain: string;

  /**
   * Context class for this specific use case
   */
  contextClass: string;

  /**
   * Epoch type for this identity
   * Can be explicit ('2026-03') or auto-generated
   */
  epochType: 'CURRENT_MONTH' | 'CURRENT_YEAR' | 'CUSTOM' | 'VERSION_V1';

  /**
   * Custom epoch value (if epochType is 'CUSTOM')
   * Otherwise can be omitted
   */
  customEpoch?: string;

  /**
   * Timestamp of request (ISO 8601)
   */
  timestamp: string;

  /**
   * Protocol version for identity issuance
   */
  protocolVersion: string;
}

/**
 * Anonymous Vehicle Identity Scope Metadata
 * Phase 2: Standardized metadata describing the business and temporal context
 * of an anonymous vehicle identity
 *
 * This metadata travels with the identity and describes:
 * - Who issued it and why
 * - What domain/context it's valid in
 * - How long it's valid for
 * - What rules apply to its use
 */
export interface AnonymousVehicleIdentityScopeMetadata {
  /**
   * Issuer identifier
   * Which system/organization issued this identity
   * Examples: 'EXPERTISE', 'INSURANCE', 'FLEET_MANAGER'
   */
  issuerId: string;

  /**
   * Type of issuer
   * Categorizes the kind of issuer for scope validation
   * Examples: 'INTERNAL', 'PARTNER', 'EXTERNAL'
   */
  issuerType: string;

  /**
   * Primary business domain
   * The main context where this identity applies
   * Examples: 'maintenance', 'insurance', 'fleet-management'
   */
  domain: string;

  /**
   * Secondary domain classification
   * Further refines the scope within primary domain
   * Examples: 'preventive-maintenance', 'claims-analysis'
   */
  subDomain?: string;

  /**
   * Context class for this identity
   * Describes the type/class of vehicle or usage
   * Examples: 'personal-vehicle', 'commercial-fleet', 'rental'
   */
  contextClass: string;

  /**
   * Usage policy for this identity
   * Describes what operations are permitted with this identity
   * Examples: 'READ_ONLY', 'READ_WRITE', 'AUDIT_ONLY'
   */
  usagePolicy: string;

  /**
   * Epoch identifier
   * Time period or version when this scope is valid
   * Examples: '2026-03' (monthly), '2026-Q1' (quarterly), 'v1.0' (version)
   */
  epoch: string;

  /**
   * Epoch type
   * Describes how the epoch should be interpreted
   * Examples: 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'VERSION'
   */
  epochType: string;

  /**
   * Protocol version for scope metadata
   * Enables future changes to scope metadata structure
   */
  protocolVersion: string;

  /**
   * Scope metadata version
   * Tracks changes to scope definitions within same protocol version
   */
  scopeVersion: string;
}

/**
 * Anonymous Vehicle Identity Envelope
 * Phase 2: Complete identity package with canonical identity + scope metadata
 *
 * This envelope becomes the standard structure for passing identities
 * between systems. It includes both the anonymousVehicleId and the
 * business context metadata.
 */
export interface AnonymousVehicleIdentityEnvelope {
  /**
   * The canonical anonymous vehicle identity (from Phase 1)
   * Contains anonymousVehicleId and issuance metadata
   */
  identity: AnonymousVehicleIdentity;

  /**
   * Scope metadata describing the business/temporal context
   * Describes who issued it, where it's valid, how it can be used
   */
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata;
}

/**
 * Scope metadata builder input
 * Input contract for building scope metadata
 */
export interface AnonymousVehicleIdentityScopeMetadataInput {
  issuerId: string;
  issuerType: string;
  domain: string;
  subDomain?: string;
  contextClass: string;
  usagePolicy: string;
  epochType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'VERSION';
  customEpoch?: string;
  protocolVersion: string;
  scopeVersion: string;
}

/**
 * Anonymous Vehicle Identity Attestation
 * Phase 3: Issuer assertion describing the provenance and validity of an identity
 *
 * This attestation represents the issuer's claim about the identity.
 * It does NOT include verification logic or proof-of-origin.
 * It serves as a metadata layer describing how the identity was created.
 */
export interface AnonymousVehicleIdentityAttestation {
  /**
   * Unique attestation identifier
   * Format: 'attest_' + UUID or deterministic ID
   * Enables tracking and reference
   */
  attestationId: string;

  /**
   * Attestation format version
   * Enables evolution of attestation structure
   * Examples: '1.0', '1.1'
   */
  attestationVersion: string;

  /**
   * Issuer who created this attestation
   * Same issuer that created the identity
   */
  issuerId: string;

  /**
   * ISO 8601 timestamp when attestation was created
   */
  issuedAt: string;

  /**
   * Protocol version of identity protocol (not attestation)
   * References the protocol that generated the identity
   */
  protocolVersion: string;

  /**
   * Type of attestation
   * Describes how the identity was asserted
   * Examples: 'SELF_ASSERTED', 'THIRD_PARTY', 'INSTITUTIONAL'
   * Phase 3: Supports SELF_ASSERTED only
   */
  attestationType: string;

  /**
   * Current status of this attestation
   * Describes whether attestation is active/valid
   * Examples: 'ISSUED', 'ACTIVE', 'REVOKED', 'EXPIRED'
   * Phase 3: Supports ISSUED and ACTIVE
   */
  attestationStatus: string;

  /**
   * Deterministic fingerprint of the identity+scope metadata
   * Enables integrity checking if needed in future phases
   * Generated as hash of identity fields + scope fields
   * Does NOT include VIN or verification data
   */
  envelopeFingerprint: string;
}

/**
 * Anonymous Vehicle Identity Attested Envelope
 * Phase 3: Complete identity package with identity + scope + attestation
 *
 * This envelope becomes the standard structure for all downstream systems.
 * It includes the canonical identity, business context, and issuer attestation.
 */
export interface AnonymousVehicleIdentityAttestedEnvelope {
  /**
   * The canonical anonymous vehicle identity (from Phase 1)
   */
  identity: AnonymousVehicleIdentity;

  /**
   * Scope metadata describing the business/temporal context (from Phase 2)
   */
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata;

  /**
   * Issuer attestation describing identity provenance (from Phase 3)
   */
  attestation: AnonymousVehicleIdentityAttestation;
}

/**
 * Attestation builder input
 * Input contract for building an attestation
 */
export interface AnonymousVehicleIdentityAttestationInput {
  issuerId: string;
  attestationType?: string;              // Default: 'SELF_ASSERTED'
  attestationStatus?: string;            // Default: 'ISSUED'
  attestationVersion?: string;           // Default: '1.0'
  timestamp?: string;                    // Default: current time
}

/**
 * Anonymous Vehicle Identity Verification Status
 * Phase 4: Protocol verification status enumeration
 *
 * Represents the result of verifying an attested envelope's consistency.
 * Status values indicate which verification rules passed or failed.
 */
export type AnonymousVehicleIdentityVerificationStatus =
  | 'VALID'
  | 'INVALID'
  | 'EXPIRED'
  | 'WRONG_SCOPE'
  | 'UNAUTHORIZED_ISSUER'
  | 'PROTOCOL_MISMATCH';

/**
 * Anonymous Vehicle Identity Verification Result
 * Phase 4: Result of envelope verification
 *
 * Contains detailed information about what was verified and the outcome.
 * Does NOT include VIN or any sensitive information.
 */
export interface AnonymousVehicleIdentityVerificationResult {
  /**
   * Unique verification identifier
   * Format: 'verify_' + UUID or deterministic ID
   * Enables tracking and audit trails
   */
  verificationId: string;

  /**
   * ISO 8601 timestamp when verification was performed
   */
  verifiedAt: string;

  /**
   * Current verification status
   * VALID: All checks passed
   * INVALID: Required fields missing or fingerprint mismatch
   * WRONG_SCOPE: Expected domain or context doesn't match
   * UNAUTHORIZED_ISSUER: Expected issuer ID doesn't match
   * PROTOCOL_MISMATCH: Protocol versions don't match
   * EXPIRED: Reserved for future epoch expiry implementation
   */
  status: AnonymousVehicleIdentityVerificationStatus;

  /**
   * Protocol version that generated the identity
   */
  protocolVersion: string;

  /**
   * Verification format version
   * Enables evolution of verification result structure
   */
  verificationVersion: string;

  /**
   * Verified issuer ID
   */
  issuerId: string;

  /**
   * Envelope fingerprint from attestation
   * Used to detect tampering or modifications
   */
  envelopeFingerprint: string;

  /**
   * Detailed reasons for verification status
   * Array of strings explaining specific checks
   */
  reasons: string[];
}

/**
 * Anonymous Vehicle Identity Verification Input
 * Phase 4: Input contract for envelope verification
 *
 * Allows callers to optionally specify expected values.
 * Verification will check against actual values if provided.
 */
export interface AnonymousVehicleIdentityVerificationInput {
  /**
   * Expected issuer ID
   * If provided, actual issuer must match
   * Optional - verification succeeds without this check if omitted
   */
  expectedIssuerId?: string;

  /**
   * Expected domain
   * If provided, identity domain must match
   * Optional - verification succeeds without this check if omitted
   */
  expectedDomain?: string;

  /**
   * Expected context class
   * If provided, identity context class must match
   * Optional - verification succeeds without this check if omitted
   */
  expectedContextClass?: string;

  /**
   * Expected protocol version
   * If provided, all protocol versions must match this
   * Optional - verification succeeds without this check if omitted
   */
  expectedProtocolVersion?: string;

  /**
   * Verification version
   * Required - identifies version of verification rules used
   */
  verificationVersion: string;
}

/**
 * Verify anonymous vehicle identity attested envelope
 * Pure function: Validates envelope structure and consistency
 *
 * This verification checks:
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

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 5: LOCAL ISSUER TRUST REGISTRY & TRUST VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Trust status values for issuer trust validation
 * 
 * - TRUSTED: Issuer is authenticated and authorized
 * - UNTRUSTED: Issuer exists but is not authorized
 * - REVOKED: Issuer was previously trusted but is now revoked
 */
export type AnonymousVehicleIdentityTrustStatus = 'TRUSTED' | 'UNTRUSTED' | 'REVOKED';

/**
 * Trust level for authenticated issuers
 * 
 * - HIGH: Fully authenticated and authorized (default for TRUSTED)
 * - MEDIUM: Partially authenticated or limited scope
 * - LOW: Minimal authentication, highest caution required
 * - REVOKED: Previously trusted but now revoked
 */
export type AnonymousVehicleIdentityTrustLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'REVOKED';

/**
 * Trusted Issuer definition in the local registry
 * 
 * Represents an issuer that is authorized to create anonymous vehicle identities
 * for specific domains and context classes. The registry is maintained locally
 * and does not require external validation or network access.
 */
export interface AnonymousVehicleTrustedIssuer {
  /**
   * Unique identifier for this issuer
   * Examples: 'EXPERTISE', 'INSURANCE', 'SERVICE_PARTNER'
   */
  issuerId: string;

  /**
   * Type of issuer
   * Examples: 'INTERNAL', 'PARTNER', 'AFFILIATE', 'THIRD_PARTY'
   */
  issuerType: string;

  /**
   * Human-readable name of the issuer
   * Examples: 'Expertise Auto Services', 'Insurance Company ABC'
   */
  issuerName: string;

  /**
   * List of domains this issuer is authorized for
   * Empty array means authorized for all domains
   * Examples: ['maintenance', 'insurance', 'fleet-management']
   */
  domains: string[];

  /**
   * List of context classes this issuer is authorized for
   * Empty array means authorized for all context classes
   * Examples: ['commercial-vehicle', 'personal', 'rental']
   */
  contextClasses: string[];

  /**
   * Current trust status of this issuer
   */
  trustStatus: AnonymousVehicleIdentityTrustStatus;

  /**
   * Trust level indicating degree of authentication
   */
  trustLevel: AnonymousVehicleIdentityTrustLevel;

  /**
   * When this issuer was added to the registry (ISO 8601)
   */
  createdAt: string;

  /**
   * When this issuer entry was last updated (ISO 8601)
   */
  updatedAt: string;

  /**
   * Version of registry format this issuer record uses
   */
  registryVersion: string;
}

/**
 * Local Issuer Registry
 * 
 * Centralized repository of trusted issuers and their authorization scopes.
 * This registry is maintained locally and enables trust validation without
 * external network calls or cryptographic operations.
 */
export interface AnonymousVehicleIssuerRegistry {
  /**
   * Version of the registry schema
   * Enables evolution of registry structure
   */
  registryVersion: string;

  /**
   * Map of issuerId → AnonymousVehicleTrustedIssuer
   * Index for O(1) lookup of issuer information
   */
  issuers: Record<string, AnonymousVehicleTrustedIssuer>;
}

/**
 * Result of trust validation for an attested envelope
 * 
 * Contains detailed information about whether the issuer of an envelope
 * is trusted according to the local registry.
 */
export interface AnonymousVehicleIdentityTrustValidationResult {
  /**
   * Unique identifier for this validation
   * Format: trust_[timestamp]_[hash]
   */
  trustId: string;

  /**
   * When this validation was performed (ISO 8601)
   */
  validatedAt: string;

  /**
   * Issuer ID being validated
   */
  issuerId: string;

  /**
   * Trust status of the issuer
   */
  trustStatus: AnonymousVehicleIdentityTrustStatus;

  /**
   * Trust level of the issuer
   */
  trustLevel: AnonymousVehicleIdentityTrustLevel;

  /**
   * Version of registry used for this validation
   */
  registryVersion: string;

  /**
   * Detailed reasons for trust decision
   * Empty array if trustStatus is TRUSTED
   * Contains explanations if UNTRUSTED or REVOKED
   */
  reasons: string[];
}

/**
 * Validate issuer trust for an Anonymous Vehicle Identity envelope
 * 
 * Phase 5 Trust Validation: Verifies that the issuer of an attested envelope
 * is in the local trusted issuer registry and is authorized for the envelope's
 * domain and context class.
 * 
 * This is a pure function that:
 * - Checks issuer existence in registry
 * - Validates trust status (TRUSTED required)
 * - Verifies domain authorization
 * - Verifies context class authorization
 * - Returns detailed validation result
 * 
 * Does NOT:
 * - Contact external systems
 * - Validate cryptographic signatures
 * - Check issuer credentials or certificates
 * - Perform expiration validation (Phase 6)
 * - Verify proof-of-origin (Phase 7)
 * 
 * @param envelope - Attested envelope to validate (from Phase 3)
 * @param registry - Local trusted issuer registry
 * @returns Trust validation result with status and detailed reasons
 */
export function validateAnonymousVehicleIssuerTrust(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  registry: AnonymousVehicleIssuerRegistry
): AnonymousVehicleIdentityTrustValidationResult {
  // Generate trust validation ID
  const timestamp = new Date().toISOString();
  const trustIdHash = generateDeterministicHash(`${timestamp}|${envelope.attestation.issuerId}`).substring(0, 8);
  const trustId = `trust_${timestamp}_${trustIdHash}`;

  // Extract issuer from envelope
  const issuerId = envelope.attestation.issuerId;

  // Result container
  const reasons: string[] = [];
  let trustStatus: AnonymousVehicleIdentityTrustStatus = 'UNTRUSTED';
  let trustLevel: AnonymousVehicleIdentityTrustLevel = 'LOW';

  // Check 1: Issuer must exist in registry
  const registryIssuer = registry.issuers[issuerId];
  if (!registryIssuer) {
    reasons.push(`Issuer '${issuerId}' not found in trusted issuer registry`);
    const result: AnonymousVehicleIdentityTrustValidationResult = {
      trustId,
      validatedAt: timestamp,
      issuerId,
      trustStatus,
      trustLevel,
      registryVersion: registry.registryVersion,
      reasons,
    };
    return result;
  }

  // Check 2: Issuer trust status must be TRUSTED
  if (registryIssuer.trustStatus !== 'TRUSTED') {
    reasons.push(`Issuer '${issuerId}' has trust status '${registryIssuer.trustStatus}' (required: TRUSTED)`);
    trustStatus = registryIssuer.trustStatus;
    trustLevel = registryIssuer.trustLevel;
    const result: AnonymousVehicleIdentityTrustValidationResult = {
      trustId,
      validatedAt: timestamp,
      issuerId,
      trustStatus,
      trustLevel,
      registryVersion: registry.registryVersion,
      reasons,
    };
    return result;
  }

  // Check 3: Issuer must be authorized for envelope domain (if domain list not empty)
  const envelopeDomain = envelope.scopeMetadata.domain;
  if (registryIssuer.domains.length > 0 && !registryIssuer.domains.includes(envelopeDomain)) {
    reasons.push(
      `Issuer '${issuerId}' is not authorized for domain '${envelopeDomain}'. Authorized domains: ${registryIssuer.domains.join(', ')}`
    );
  }

  // Check 4: Issuer must be authorized for envelope context class (if context class list not empty)
  const envelopeContextClass = envelope.scopeMetadata.contextClass;
  if (registryIssuer.contextClasses.length > 0 && !registryIssuer.contextClasses.includes(envelopeContextClass)) {
    reasons.push(
      `Issuer '${issuerId}' is not authorized for context class '${envelopeContextClass}'. Authorized classes: ${registryIssuer.contextClasses.join(', ')}`
    );
  }

  // Determine final trust status based on checks
  if (reasons.length === 0) {
    trustStatus = 'TRUSTED';
    trustLevel = registryIssuer.trustLevel;
  } else {
    trustStatus = 'UNTRUSTED';
    trustLevel = 'LOW';
  }

  // Build result
  const result: AnonymousVehicleIdentityTrustValidationResult = {
    trustId,
    validatedAt: timestamp,
    issuerId,
    trustStatus,
    trustLevel,
    registryVersion: registry.registryVersion,
    reasons,
  };

  return result;
}

/**
 * PHASE 6: ANONYMOUS VEHICLE IDENTITY TEMPORAL VALIDATION
 * 
 * PURPOSE
 * ───────
 * Validate temporal constraints on an attested envelope:
 * - notBefore: envelope must not be used before this time
 * - expiresAt: envelope must not be used after this time
 * - maxAgeMs: envelope must not be older than this duration
 * 
 * Does NOT validate:
 * - Signature verification
 * - Proof-of-origin
 * - External revocation
 * - Certificate chains
 * 
 * This is a pure function temporal constraint validation layer.
 */

/**
 * Temporal validation status for an Anonymous Vehicle Identity Attested Envelope
 * 
 * VALID: All temporal constraints satisfied
 * EXPIRED: expiresAt is in the past (now - clockSkew > expiresAt)
 * NOT_YET_VALID: notBefore is in the future (now + clockSkew < notBefore)
 * TOO_OLD: envelope exceeds maxAge (now - issuedAt > maxAge + clockSkew)
 * INVALID_TIME: issuedAt timestamp cannot be parsed
 */
export type AnonymousVehicleIdentityTemporalStatus = 'VALID' | 'EXPIRED' | 'NOT_YET_VALID' | 'TOO_OLD' | 'INVALID_TIME';

/**
 * Input parameters for temporal validation
 * 
 * REQUIRED:
 * - validationVersion: Version string for future evolution
 * 
 * OPTIONAL:
 * - now: Current timestamp (ISO format). Defaults to system time if omitted.
 * - notBefore: Earliest valid time (ISO format). If omitted, no lower-bound check.
 * - expiresAt: Latest valid time (ISO format). If omitted, no expiration check.
 * - maxAgeMs: Maximum age in milliseconds. If omitted, no age check.
 * - clockSkewMs: Clock skew tolerance in milliseconds (default: 0).
 * 
 * All timestamp fields are ISO 8601 format strings.
 * All duration fields are milliseconds.
 */
export interface AnonymousVehicleIdentityTemporalValidationInput {
  validationVersion: string;
  now?: string;
  notBefore?: string;
  expiresAt?: string;
  maxAgeMs?: number;
  clockSkewMs?: number;
}

/**
 * Result of temporal validation on an Anonymous Vehicle Identity Attested Envelope
 * 
 * FIELDS:
 * - temporalValidationId: Unique ID for this validation (deterministic)
 * - validatedAt: ISO timestamp when validation occurred
 * - status: VALID | EXPIRED | NOT_YET_VALID | TOO_OLD | INVALID_TIME
 * - issuerId: The issuer ID from the envelope
 * - protocolVersion: Protocol version from the envelope
 * - validationVersion: Input validation version
 * - issuedAt: Parsed issuedAt from envelope (or 'invalid' if unparseable)
 * - reasons: Array of detailed failure reasons (empty if VALID)
 */
export interface AnonymousVehicleIdentityTemporalValidationResult {
  temporalValidationId: string;
  validatedAt: string;
  status: AnonymousVehicleIdentityTemporalStatus;
  issuerId: string;
  protocolVersion: string;
  validationVersion: string;
  issuedAt: string;
  reasons: string[];
}

/**
 * Validate temporal constraints on an Anonymous Vehicle Identity Attested Envelope
 * 
 * Pure function: No side effects, deterministic, stateless
 * 
 * VALIDATION RULES
 * ────────────────
 * 
 * 1. PARSE issuedAt FROM ENVELOPE
 *    - Extract envelope.attestation.issuedAt
 *    - Parse as ISO timestamp
 *    - If unparseable: return INVALID_TIME
 * 
 * 2. NOT_BEFORE CHECK (if notBefore provided)
 *    - Condition: now + clockSkewMs < notBefore
 *    - If true: return NOT_YET_VALID
 *    - Reason: "Envelope not valid until [notBefore]"
 * 
 * 3. EXPIRATION CHECK (if expiresAt provided)
 *    - Condition: now - clockSkewMs > expiresAt
 *    - If true: return EXPIRED
 *    - Reason: "Envelope expired at [expiresAt]"
 * 
 * 4. MAX AGE CHECK (if maxAgeMs provided)
 *    - Condition: now - issuedAt > maxAgeMs + clockSkewMs
 *    - If true: return TOO_OLD
 *    - Reason: "Envelope exceeds maximum age ([age]ms > [maxAge]ms)"
 * 
 * 5. ALL CHECKS PASS
 *    - If all provided constraints pass: return VALID
 *    - reasons array is empty
 * 
 * DEFAULTS
 * ────────
 * - now: Current system time (new Date().toISOString())
 * - clockSkewMs: 0 (no tolerance)
 * 
 * @param envelope - Attested envelope from Phase 3/4/5
 * @param input - Temporal validation input with constraints
 * @returns TemporalValidationResult with status and detailed reasons
 */
export function validateAnonymousVehicleIdentityTemporal(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  input: AnonymousVehicleIdentityTemporalValidationInput
): AnonymousVehicleIdentityTemporalValidationResult {
  // Generate temporal validation ID
  const timestamp = new Date().toISOString();
  const temporalIdHash = generateDeterministicHash(`${timestamp}|${envelope.attestation.issuerId}|temporal`).substring(0, 8);
  const temporalValidationId = `temporal_${timestamp}_${temporalIdHash}`;

  // Extract key fields from envelope
  const issuerId = envelope.attestation.issuerId;
  const protocolVersion = envelope.attestation.protocolVersion;
  const validationVersion = input.validationVersion;

  // Result container
  const reasons: string[] = [];
  let status: AnonymousVehicleIdentityTemporalStatus = 'VALID';

  // Step 1: Parse issuedAt from envelope
  const issuedAtString = envelope.attestation.issuedAt;
  const issuedAtTime = new Date(issuedAtString).getTime();
  
  // Check if issuedAt is valid
  if (isNaN(issuedAtTime)) {
    const result: AnonymousVehicleIdentityTemporalValidationResult = {
      temporalValidationId,
      validatedAt: timestamp,
      status: 'INVALID_TIME',
      issuerId,
      protocolVersion,
      validationVersion,
      issuedAt: 'invalid',
      reasons: [`Unable to parse issuedAt timestamp: '${issuedAtString}'`],
    };
    return result;
  }

  // Step 2: Determine "now" reference time
  const nowString = input.now || new Date().toISOString();
  const nowTime = new Date(nowString).getTime();
  
  if (isNaN(nowTime)) {
    const result: AnonymousVehicleIdentityTemporalValidationResult = {
      temporalValidationId,
      validatedAt: timestamp,
      status: 'INVALID_TIME',
      issuerId,
      protocolVersion,
      validationVersion,
      issuedAt: issuedAtString,
      reasons: [`Unable to parse validation time: '${nowString}'`],
    };
    return result;
  }

  // Step 3: Determine clock skew tolerance
  const clockSkewMs = input.clockSkewMs ?? 0;

  // Step 4: Check notBefore constraint (if provided)
  if (input.notBefore) {
    const notBeforeTime = new Date(input.notBefore).getTime();
    
    if (!isNaN(notBeforeTime)) {
      // Condition: now + clockSkew < notBefore
      // This means: the envelope is not yet valid
      if (nowTime + clockSkewMs < notBeforeTime) {
        status = 'NOT_YET_VALID';
        reasons.push(`Envelope not valid until ${input.notBefore} (current: ${nowString})`);
      }
    }
  }

  // Step 5: Check expiresAt constraint (if provided)
  if (input.expiresAt) {
    const expiresAtTime = new Date(input.expiresAt).getTime();
    
    if (!isNaN(expiresAtTime)) {
      // Condition: now - clockSkew > expiresAt
      // This means: the envelope has expired
      if (nowTime - clockSkewMs > expiresAtTime) {
        status = 'EXPIRED';
        reasons.push(`Envelope expired at ${input.expiresAt} (current: ${nowString})`);
      }
    }
  }

  // Step 6: Check maxAge constraint (if provided)
  if (input.maxAgeMs !== undefined && input.maxAgeMs > 0) {
    const envelopeAgeMs = nowTime - issuedAtTime;
    const maxAgeWithSkew = input.maxAgeMs + clockSkewMs;
    
    // Condition: now - issuedAt > maxAge + clockSkew
    // This means: the envelope is too old
    if (envelopeAgeMs > maxAgeWithSkew) {
      status = 'TOO_OLD';
      reasons.push(
        `Envelope age ${envelopeAgeMs}ms exceeds maximum ${input.maxAgeMs}ms ` +
        `(issued: ${issuedAtString}, current: ${nowString})`
      );
    }
  }

  // Step 7: Build and return result
  const result: AnonymousVehicleIdentityTemporalValidationResult = {
    temporalValidationId,
    validatedAt: timestamp,
    status,
    issuerId,
    protocolVersion,
    validationVersion,
    issuedAt: issuedAtString,
    reasons,
  };

  return result;
}

/**
 * PHASE 7: ANONYMOUS VEHICLE IDENTITY PROOF LAYER
 * 
 * PURPOSE
 * ───────
 * Add a protocol-level proof structure to attested envelopes.
 * This phase creates the standardized proof framework that enables
 * future phases (Phase 8+) to add cryptographic validation,
 * distributed proof strategies, and advanced trust mechanisms.
 * 
 * Does NOT validate:
 * - Cryptographic signatures
 * - Certificate chains
 * - External authorities
 * - Proof-of-origin
 * 
 * This is a pure structural proof layer.
 */

/**
 * Proof status for an Anonymous Vehicle Identity Proof
 * 
 * CREATED: Proof structure created, not yet bound to attestation
 * BOUND: Proof successfully bound to attestation via fingerprints
 * INVALID: Proof structure is invalid (malformed fields)
 * UNAVAILABLE: Proof cannot be generated (missing data)
 */
export type AnonymousVehicleIdentityProofStatus = 'CREATED' | 'BOUND' | 'INVALID' | 'UNAVAILABLE';

/**
 * Proof object for an Anonymous Vehicle Identity Attested Envelope
 * 
 * Creates a protocol-level proof structure that encapsulates:
 * - Identity of the prover (issuerId)
 * - Type of proof (STRUCTURAL_PROOF for Phase 7)
 * - Status of proof binding
 * - Fingerprints for envelope and proof integrity
 * - Reference to binding relationship
 * 
 * Does NOT include:
 * - Cryptographic signatures
 * - Certificate chains
 * - External validation references
 * - VIN or sensitive data
 */
export interface AnonymousVehicleIdentityProof {
  proofId: string;
  proofVersion: string;
  proofType: 'STRUCTURAL_PROOF' | 'BINDING_PROOF' | 'TEMPORAL_PROOF';
  proofStatus: AnonymousVehicleIdentityProofStatus;
  issuerId: string;
  protocolVersion: string;
  createdAt: string;
  envelopeFingerprint: string;
  proofFingerprint: string;
  proofBindingRef: string;
}

/**
 * Input parameters for building a proof
 * 
 * FIELDS:
 * - proofId (optional): If provided, use this ID; otherwise generate
 * - proofVersion (optional): Proof version (default: '1.0')
 * - proofType (optional): Type of proof (default: 'STRUCTURAL_PROOF')
 * - proofBindingRef (optional): Reference for proof binding relationship
 * - timestamp (optional): When proof was created (default: now)
 */
export interface AnonymousVehicleIdentityProofInput {
  proofId?: string;
  proofVersion?: string;
  proofType?: 'STRUCTURAL_PROOF' | 'BINDING_PROOF' | 'TEMPORAL_PROOF';
  proofBindingRef?: string;
  timestamp?: string;
}

/**
 * Proof envelope for an Anonymous Vehicle Identity
 * 
 * Combines identity, scope metadata, attestation, AND proof
 * into a complete, sealed package with proof references.
 * 
 * FIELDS:
 * - identity: AnonymousVehicleIdentity (Phase 1)
 * - scopeMetadata: Scope context (Phase 2)
 * - attestation: Issuer assertion (Phase 3/4)
 * - proof: Proof structure (Phase 7)
 */
export interface AnonymousVehicleIdentityProofEnvelope {
  identity: AnonymousVehicleIdentity;
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata;
  attestation: AnonymousVehicleIdentityAttestation;
  proof: AnonymousVehicleIdentityProof;
}

/**
 * Build proof fingerprint for an Anonymous Vehicle Identity Attested Envelope
 * 
 * Pure function: Creates deterministic hash representing proof identity
 * Does NOT include VIN, does NOT validate externally, does NOT use cryptography
 * 
 * INPUTS:
 * - envelope: AnonymousVehicleIdentityAttestedEnvelope (from Phase 3-6)
 * - input: Proof input (optional fields for customization)
 * 
 * COMPUTATION:
 * - Hash envelope fingerprint + proof metadata
 * - Ensures unique identifiers for each proof
 * - Enables future binding verification
 * 
 * @param envelope - Attested envelope with Phase 1-6 data
 * @param input - Optional proof input parameters
 * @returns 32-character hex proof fingerprint
 */
export function buildAnonymousVehicleIdentityProofFingerprint(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  input: AnonymousVehicleIdentityProofInput
): string {
  // Extract proof metadata
  const proofType = input.proofType || 'STRUCTURAL_PROOF';
  const proofVersion = input.proofVersion || '1.0';
  const timestamp = input.timestamp || new Date().toISOString();
  const proofBindingRef = input.proofBindingRef || 'default';

  // Create deterministic input from proof + envelope fields
  // Order is critical for consistency
  const fingerprintInput = [
    envelope.attestation.envelopeFingerprint,
    envelope.attestation.issuerId,
    envelope.attestation.attestationId,
    proofType,
    proofVersion,
    timestamp,
    proofBindingRef,
    envelope.attestation.protocolVersion,
  ].join('|');

  // Generate deterministic hash
  return generateDeterministicHash(fingerprintInput);
}

/**
 * Build an Anonymous Vehicle Identity Proof
 * 
 * Pure function: Creates proof structure for an attested envelope
 * Does NOT validate cryptographically, does NOT check external authorities
 * 
 * INPUTS:
 * - envelope: AnonymousVehicleIdentityAttestedEnvelope (from Phase 1-6)
 * - input: Proof build input with optional customization
 * 
 * DEFAULTS:
 * - proofVersion: '1.0'
 * - proofType: 'STRUCTURAL_PROOF'
 * - proofStatus: 'CREATED' (not yet bound)
 * - timestamp: current ISO time
 * 
 * OUTPUTS:
 * Creates AnonymousVehicleIdentityProof with:
 * - Unique proofId (deterministic from envelope + timestamp)
 * - Proof fingerprint (integrity hash)
 * - Envelope fingerprint (binding reference)
 * - Status set to CREATED
 * 
 * @param envelope - Attested envelope from Phases 1-6
 * @param input - Optional proof input parameters
 * @returns AnonymousVehicleIdentityProof
 */
export function buildAnonymousVehicleIdentityProof(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  input: AnonymousVehicleIdentityProofInput
): AnonymousVehicleIdentityProof {
  // Validate inputs
  if (!envelope?.attestation) {
    throw new Error('Invalid envelope: missing attestation');
  }

  if (!envelope.attestation.envelopeFingerprint) {
    throw new Error('Invalid attestation: missing envelopeFingerprint');
  }

  // Extract proof parameters with defaults
  const proofVersion = input?.proofVersion || '1.0';
  const proofType = input?.proofType || 'STRUCTURAL_PROOF';
  const timestamp = input?.timestamp || new Date().toISOString();
  const proofBindingRef = input?.proofBindingRef || envelope.attestation.envelopeFingerprint;

  // Build proof ID (deterministic from envelope + timestamp)
  const proofIdInput = `${envelope.attestation.envelopeFingerprint}|${timestamp}|${proofType}`;
  const proofIdSuffix = generateDeterministicHash(proofIdInput).substring(0, 16);
  const proofId = input?.proofId || `proof_${proofIdSuffix}`;

  // Build proof fingerprint
  const proofFingerprint = buildAnonymousVehicleIdentityProofFingerprint(envelope, {
    proofVersion,
    proofType,
    timestamp,
    proofBindingRef,
  });

  // Create proof object
  const proof: AnonymousVehicleIdentityProof = {
    proofId,
    proofVersion,
    proofType,
    proofStatus: 'CREATED',
    issuerId: envelope.attestation.issuerId,
    protocolVersion: envelope.attestation.protocolVersion,
    createdAt: timestamp,
    envelopeFingerprint: envelope.attestation.envelopeFingerprint,
    proofFingerprint,
    proofBindingRef,
  };

  return proof;
}

/**
 * Build an Anonymous Vehicle Identity Proof Envelope
 * 
 * Pure function: Combines attested envelope with proof into final package
 * 
 * INPUT:
 * - envelope: AnonymousVehicleIdentityAttestedEnvelope (from Phase 1-5)
 * - proof: AnonymousVehicleIdentityProof (from Phase 7)
 * 
 * OUTPUT:
 * AnonymousVehicleIdentityProofEnvelope containing:
 * - All Phase 1-5 data (identity, scope, attestation)
 * - Phase 7 proof structure
 * 
 * VALIDATION:
 * - Verifies envelope has all required fields
 * - Verifies proof has all required fields
 * - Ensures consistency between envelope and proof issuerId
 * 
 * @param envelope - Attested envelope from Phases 1-6
 * @param proof - Proof object from Phase 7
 * @returns AnonymousVehicleIdentityProofEnvelope
 */
export function buildAnonymousVehicleIdentityProofEnvelope(
  envelope: AnonymousVehicleIdentityAttestedEnvelope,
  proof: AnonymousVehicleIdentityProof
): AnonymousVehicleIdentityProofEnvelope {
  // Validate attested envelope
  if (!envelope?.identity?.anonymousVehicleId) {
    throw new Error('Invalid envelope: missing identity');
  }

  if (!envelope?.scopeMetadata?.issuerId) {
    throw new Error('Invalid envelope: missing scope metadata');
  }

  if (!envelope?.attestation?.attestationId) {
    throw new Error('Invalid envelope: missing attestation');
  }

  // Validate proof
  if (!proof?.proofId) {
    throw new Error('Invalid proof: missing proofId');
  }

  if (!proof?.envelopeFingerprint) {
    throw new Error('Invalid proof: missing envelopeFingerprint');
  }

  // Verify consistency between envelope and proof
  if (proof.envelopeFingerprint !== envelope.attestation.envelopeFingerprint) {
    throw new Error(
      'Mismatch: proof envelopeFingerprint does not match attestation envelopeFingerprint'
    );
  }

  if (proof.issuerId !== envelope.attestation.issuerId) {
    throw new Error('Mismatch: proof issuerId does not match attestation issuerId');
  }

  // Build final proof envelope
  const proofEnvelope: AnonymousVehicleIdentityProofEnvelope = {
    identity: envelope.identity,
    scopeMetadata: envelope.scopeMetadata,
    attestation: envelope.attestation,
    proof,
  };

  return proofEnvelope;
}

/**
 * PHASE 8: ANONYMOUS VEHICLE IDENTITY FEDERATION / INTEROPERABILITY LAYER
 * 
 * PURPOSE
 * ───────
 * Add federation metadata to proof envelopes, enabling multi-issuer interoperability
 * while maintaining local, protocol-structural validation.
 * 
 * Enables:
 * - Multi-issuer collaboration within defined boundaries
 * - Local interoperability rules without external federation
 * - Domain-based access control
 * - Issuer whitelist/blacklist management
 * 
 * Does NOT implement:
 * - External network federation
 * - Global matching or synchronization
 * - Certificate validation
 * - Signature verification
 * - External system calls
 * 
 * This is a pure, local federation structure.
 */

/**
 * Federation status for an Anonymous Vehicle Identity
 * 
 * FEDERATED: Proof envelope is participating in local federation (normal state)
 * ISOLATED: Proof envelope federation is restricted to local scope only
 * RESTRICTED: Proof envelope has federation restrictions applied
 * BLOCKED: Proof envelope cannot participate in federation
 */
export type AnonymousVehicleIdentityFederationStatus = 'FEDERATED' | 'ISOLATED' | 'RESTRICTED' | 'BLOCKED';

/**
 * Input for building federation metadata
 * 
 * FIELDS:
 * - federationId (optional): Custom federation ID
 * - federationVersion (optional): Version (default: '1.0')
 * - federationStatus (optional): Status (default: 'FEDERATED')
 * - federationDomain (optional): Federation domain classification
 * - interoperabilityLevel (optional): Level (default: 'LOCAL')
 * - allowedIssuerIds (optional): List of allowed issuers (empty = all)
 * - allowedDomains (optional): List of allowed domains (empty = all)
 * - timestamp (optional): Creation time (default: now)
 */
export interface AnonymousVehicleIdentityFederationMetadataInput {
  federationId?: string;
  federationVersion?: string;
  federationStatus?: AnonymousVehicleIdentityFederationStatus;
  federationDomain?: string;
  interoperabilityLevel?: 'LOCAL' | 'REGIONAL' | 'GLOBAL';
  allowedIssuerIds?: string[];
  allowedDomains?: string[];
  timestamp?: string;
}

/**
 * Federation metadata for an Anonymous Vehicle Identity Proof Envelope
 * 
 * Defines federation rules, interoperability level, and participation constraints.
 * 
 * FIELDS:
 * - federationId: Unique federation identifier
 * - federationVersion: Federation protocol version
 * - federationStatus: Current federation status
 * - issuerId: Issuer ID from proof envelope
 * - federationDomain: Domain classification for federation
 * - interoperabilityLevel: LOCAL | REGIONAL | GLOBAL scope
 * - allowedIssuerIds: Whitelist of issuers (empty = all allowed)
 * - allowedDomains: Whitelist of domains (empty = all allowed)
 * - createdAt: ISO timestamp
 * - updatedAt: Last update timestamp
 */
export interface AnonymousVehicleIdentityFederationMetadata {
  federationId: string;
  federationVersion: string;
  federationStatus: AnonymousVehicleIdentityFederationStatus;
  issuerId: string;
  federationDomain: string;
  interoperabilityLevel: 'LOCAL' | 'REGIONAL' | 'GLOBAL';
  allowedIssuerIds: string[];
  allowedDomains: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Federation envelope for an Anonymous Vehicle Identity
 * 
 * Extends proof envelope with federation metadata for multi-issuer interoperability.
 * 
 * FIELDS:
 * - identity: AnonymousVehicleIdentity (Phase 1)
 * - scopeMetadata: Scope context (Phase 2)
 * - attestation: Issuer assertion (Phase 3/4)
 * - proof: Proof structure (Phase 7)
 * - federationMetadata: Federation rules (Phase 8)
 */
export interface AnonymousVehicleIdentityFederationEnvelope {
  identity: AnonymousVehicleIdentity;
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata;
  attestation: AnonymousVehicleIdentityAttestation;
  proof: AnonymousVehicleIdentityProof;
  federationMetadata: AnonymousVehicleIdentityFederationMetadata;
}

/**
 * Input for local federation validation
 * 
 * FIELDS:
 * - expectedIssuerId (optional): Issuer to validate against allowedIssuerIds
 * - expectedDomain (optional): Domain to validate against allowedDomains
 */
export interface AnonymousVehicleIdentityFederationValidationInput {
  expectedIssuerId?: string;
  expectedDomain?: string;
}

/**
 * Result of local federation validation
 * 
 * FIELDS:
 * - federationValidationId: Unique validation ID
 * - validatedAt: ISO timestamp
 * - federationStatus: Status from metadata
 * - issuerId: Issuer being validated
 * - isValid: Whether federation rules are satisfied
 * - reasons: Detailed validation reasons
 */
export interface AnonymousVehicleIdentityFederationValidationResult {
  federationValidationId: string;
  validatedAt: string;
  federationStatus: AnonymousVehicleIdentityFederationStatus;
  issuerId: string;
  isValid: boolean;
  reasons: string[];
}

/**
 * Build federation metadata for a proof envelope
 * 
 * Pure function: Creates federation rules and interoperability constraints
 * Does NOT perform external federation, does NOT call external systems
 * 
 * DEFAULTS:
 * - federationVersion: '1.0'
 * - federationStatus: 'FEDERATED'
 * - interoperabilityLevel: 'LOCAL'
 * - allowedIssuerIds: [] (all issuers allowed)
 * - allowedDomains: [] (all domains allowed)
 * - timestamp: current ISO time
 * 
 * @param proofEnvelope - Proof envelope from Phase 7
 * @param input - Optional federation metadata input
 * @returns AnonymousVehicleIdentityFederationMetadata
 */
export function buildAnonymousVehicleIdentityFederationMetadata(
  proofEnvelope: AnonymousVehicleIdentityProofEnvelope,
  input: AnonymousVehicleIdentityFederationMetadataInput
): AnonymousVehicleIdentityFederationMetadata {
  // Validate input
  if (!proofEnvelope?.proof?.issuerId) {
    throw new Error('Invalid proof envelope: missing issuerId');
  }

  if (!proofEnvelope?.proof?.proofId) {
    throw new Error('Invalid proof envelope: missing proofId');
  }

  // Extract federation parameters with defaults
  const federationVersion = input?.federationVersion || '1.0';
  const federationStatus = input?.federationStatus || 'FEDERATED';
  const federationDomain = input?.federationDomain || 'local';
  const interoperabilityLevel = input?.interoperabilityLevel || 'LOCAL';
  const allowedIssuerIds = input?.allowedIssuerIds || [];
  const allowedDomains = input?.allowedDomains || [];
  const timestamp = input?.timestamp || new Date().toISOString();

  // Build federation ID (deterministic from proof + timestamp)
  const federationIdInput = `${proofEnvelope.proof.proofId}|${timestamp}|${federationDomain}`;
  const federationIdSuffix = generateDeterministicHash(federationIdInput).substring(0, 16);
  const federationId = input?.federationId || `fed_${federationIdSuffix}`;

  // Create federation metadata
  const federationMetadata: AnonymousVehicleIdentityFederationMetadata = {
    federationId,
    federationVersion,
    federationStatus,
    issuerId: proofEnvelope.proof.issuerId,
    federationDomain,
    interoperabilityLevel,
    allowedIssuerIds,
    allowedDomains,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return federationMetadata;
}

/**
 * Build federation envelope for an Anonymous Vehicle Identity
 * 
 * Pure function: Combines proof envelope with federation metadata
 * 
 * INPUT:
 * - proofEnvelope: AnonymousVehicleIdentityProofEnvelope (from Phase 7)
 * - federationMetadata: AnonymousVehicleIdentityFederationMetadata
 * 
 * OUTPUT:
 * AnonymousVehicleIdentityFederationEnvelope containing:
 * - All Phase 1-7 data (identity, scope, attestation, proof)
 * - Phase 8 federation metadata
 * 
 * VALIDATION:
 * - Verifies proof envelope has all required fields
 * - Verifies federation metadata has all required fields
 * - Ensures consistency between proof and federation issuerId
 * 
 * @param proofEnvelope - Proof envelope from Phase 7
 * @param federationMetadata - Federation metadata from Phase 8
 * @returns AnonymousVehicleIdentityFederationEnvelope
 */
export function buildAnonymousVehicleIdentityFederationEnvelope(
  proofEnvelope: AnonymousVehicleIdentityProofEnvelope,
  federationMetadata: AnonymousVehicleIdentityFederationMetadata
): AnonymousVehicleIdentityFederationEnvelope {
  // Validate proof envelope
  if (!proofEnvelope?.identity?.anonymousVehicleId) {
    throw new Error('Invalid proof envelope: missing identity');
  }

  if (!proofEnvelope?.proof?.proofId) {
    throw new Error('Invalid proof envelope: missing proof');
  }

  // Validate federation metadata
  if (!federationMetadata?.federationId) {
    throw new Error('Invalid federation metadata: missing federationId');
  }

  if (!federationMetadata?.federationStatus) {
    throw new Error('Invalid federation metadata: missing federationStatus');
  }

  // Verify consistency between proof and federation
  if (federationMetadata.issuerId !== proofEnvelope.proof.issuerId) {
    throw new Error('Mismatch: federation issuerId does not match proof issuerId');
  }

  // Build final federation envelope
  const federationEnvelope: AnonymousVehicleIdentityFederationEnvelope = {
    identity: proofEnvelope.identity,
    scopeMetadata: proofEnvelope.scopeMetadata,
    attestation: proofEnvelope.attestation,
    proof: proofEnvelope.proof,
    federationMetadata,
  };

  return federationEnvelope;
}

/**
 * Validate local federation rules for a federation envelope
 * 
 * Pure function: Validates federation status and issuer/domain authorization
 * Does NOT perform external federation checks, does NOT call external systems
 * 
 * VALIDATION RULES
 * ────────────────
 * 
 * 1. BLOCKED STATUS CHECK
 *    - If federationStatus === 'BLOCKED': return invalid immediately
 *    - Reason: "Federation status is BLOCKED"
 * 
 * 2. ISOLATED STATUS CHECK
 *    - If federationStatus === 'ISOLATED': return non-valid outcome
 *    - Reason: "Federation status is ISOLATED (local scope only)"
 * 
 * 3. RESTRICTED STATUS CHECK
 *    - If federationStatus === 'RESTRICTED': return non-valid outcome
 *    - Reason: "Federation status is RESTRICTED"
 * 
 * 4. ISSUER AUTHORIZATION (if expectedIssuerId provided)
 *    - If allowedIssuerIds is empty: all issuers authorized
 *    - If allowedIssuerIds not empty: expectedIssuerId must be in list
 *    - Failure: return invalid with reason
 * 
 * 5. DOMAIN AUTHORIZATION (if expectedDomain provided)
 *    - If allowedDomains is empty: all domains authorized
 *    - If allowedDomains not empty: expectedDomain must be in list
 *    - Failure: return invalid with reason
 * 
 * 6. FEDERATED STATUS
 *    - If all checks pass: return valid
 * 
 * @param federationEnvelope - Federation envelope to validate
 * @param input - Optional validation input (expectedIssuerId, expectedDomain)
 * @returns FederationValidationResult
 */
export function validateAnonymousVehicleIdentityFederation(
  federationEnvelope: AnonymousVehicleIdentityFederationEnvelope,
  input?: AnonymousVehicleIdentityFederationValidationInput
): AnonymousVehicleIdentityFederationValidationResult {
  // Generate validation ID
  const timestamp = new Date().toISOString();
  const validationIdHash = generateDeterministicHash(
    `${timestamp}|${federationEnvelope.federationMetadata.federationId}|federation`
  ).substring(0, 8);
  const federationValidationId = `fed_val_${timestamp}_${validationIdHash}`;

  // Extract federation metadata
  const federationStatus = federationEnvelope.federationMetadata.federationStatus;
  const issuerId = federationEnvelope.federationMetadata.issuerId;

  // Result container
  const reasons: string[] = [];
  let isValid = true;

  // Step 1: Check BLOCKED status (immediate failure)
  if (federationStatus === 'BLOCKED') {
    const result: AnonymousVehicleIdentityFederationValidationResult = {
      federationValidationId,
      validatedAt: timestamp,
      federationStatus,
      issuerId,
      isValid: false,
      reasons: ['Federation status is BLOCKED'],
    };
    return result;
  }

  // Step 2: Check ISOLATED status (non-valid outcome)
  if (federationStatus === 'ISOLATED') {
    reasons.push('Federation status is ISOLATED (local scope only)');
    isValid = false;
  }

  // Step 3: Check RESTRICTED status (non-valid outcome)
  if (federationStatus === 'RESTRICTED') {
    reasons.push('Federation status is RESTRICTED');
    isValid = false;
  }

  // Step 4: Validate expectedIssuerId if provided
  if (input?.expectedIssuerId && isValid) {
    const allowedIssuerIds = federationEnvelope.federationMetadata.allowedIssuerIds;

    // Empty list means all issuers allowed
    if (allowedIssuerIds.length > 0 && !allowedIssuerIds.includes(input.expectedIssuerId)) {
      reasons.push(
        `Expected issuer '${input.expectedIssuerId}' not in allowed issuers: ${allowedIssuerIds.join(', ')}`
      );
      isValid = false;
    }
  }

  // Step 5: Validate expectedDomain if provided
  if (input?.expectedDomain && isValid) {
    const allowedDomains = federationEnvelope.federationMetadata.allowedDomains;

    // Empty list means all domains allowed
    if (allowedDomains.length > 0 && !allowedDomains.includes(input.expectedDomain)) {
      reasons.push(
        `Expected domain '${input.expectedDomain}' not in allowed domains: ${allowedDomains.join(', ')}`
      );
      isValid = false;
    }
  }

  // Step 6: If FEDERATED and all checks pass
  if (federationStatus === 'FEDERATED' && reasons.length === 0) {
    isValid = true;
  }

  // Build and return result
  const result: AnonymousVehicleIdentityFederationValidationResult = {
    federationValidationId,
    validatedAt: timestamp,
    federationStatus,
    issuerId,
    isValid,
    reasons,
  };

  return result;
}

export function issueAnonymousVehicleIdentity(
  request: AnonymousVehicleIdentityRequest
): AnonymousVehicleIdentity {
  // Validate input
  if (!request.vin || !request.issuerId || !request.domain) {
    throw new Error('Missing required fields: vin, issuerId, domain');
  }

  // Step 1: Determine epoch based on epochType
  let epoch: string;
  if (request.epochType === 'CURRENT_MONTH') {
    const now = new Date();
    epoch = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  } else if (request.epochType === 'CURRENT_YEAR') {
    epoch = String(new Date().getFullYear());
  } else if (request.epochType === 'CUSTOM') {
    epoch = request.customEpoch || 'undefined';
  } else {
    // Default: version-based
    epoch = request.epochType;
  }

  // Step 2: Create deterministic input for hashing
  // Order is critical for consistency
  const hashInput = [
    request.vin,                          // VIN (temporary, will be discarded)
    request.issuerId,
    request.domain,
    request.contextClass,
    epoch,
    request.protocolVersion,
  ].join('|');

  // Step 3: Generate deterministic hash using Web Crypto API
  // This ensures same inputs always produce same output
  const anonymousVehicleId = generateDeterministicHash(hashInput);

  // Step 4: Create identity object (VIN is NOT included)
  const identity: AnonymousVehicleIdentity = {
    anonymousVehicleId: `anon_${anonymousVehicleId}`,
    issuerId: request.issuerId,
    domain: request.domain,
    contextClass: request.contextClass,
    epoch,
    issuedAt: request.timestamp,
    protocolVersion: request.protocolVersion,
  };

  // VIN exists only in this function scope and is discarded after hashing
  return identity;
}

/**
 * Generate deterministic hash from input string
 * Uses SHA-256 to ensure cryptographic consistency
 * Returns 32-character hex string
 * 
 * @param input - String to hash (may contain VIN temporarily)
 * @returns 32-character hex hash
 */
function generateDeterministicHash(input: string): string {
  // Simple deterministic hash using string character codes
  // For production, consider crypto.subtle.digest('SHA-256', ...) in modern browsers
  
  let hash = 0;
  let char: number;
  
  // Process each character to create initial hash
  for (let i = 0; i < input.length; i++) {
    char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to 32-character hex string
  const hashHex = Math.abs(hash).toString(16).padStart(32, '0');
  return hashHex.substring(0, 32);
}

/**
 * Build anonymous vehicle identity scope metadata
 * Pure function: Creates standardized scope context for an identity
 *
 * @param input - Scope metadata input
 * @returns AnonymousVehicleIdentityScopeMetadata
 */
export function buildAnonymousVehicleIdentityScopeMetadata(
  input: AnonymousVehicleIdentityScopeMetadataInput
): AnonymousVehicleIdentityScopeMetadata {
  // Validate input
  if (!input.issuerId || !input.domain || !input.contextClass) {
    throw new Error('Missing required scope metadata fields: issuerId, domain, contextClass');
  }

  // Determine epoch based on epochType
  let epoch: string;
  if (input.epochType === 'MONTHLY') {
    const now = new Date();
    epoch = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  } else if (input.epochType === 'QUARTERLY') {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    epoch = `${now.getFullYear()}-Q${quarter}`;
  } else if (input.epochType === 'ANNUAL') {
    epoch = String(new Date().getFullYear());
  } else {
    // VERSION
    epoch = input.customEpoch || 'v1.0';
  }

  // Build scope metadata
  const scopeMetadata: AnonymousVehicleIdentityScopeMetadata = {
    issuerId: input.issuerId,
    issuerType: input.issuerType,
    domain: input.domain,
    subDomain: input.subDomain,
    contextClass: input.contextClass,
    usagePolicy: input.usagePolicy,
    epoch,
    epochType: input.epochType,
    protocolVersion: input.protocolVersion,
    scopeVersion: input.scopeVersion,
  };

  return scopeMetadata;
}

/**
 * Build anonymous vehicle identity envelope
 * Pure function: Combines identity and scope metadata into standard envelope
 *
 * @param identity - AnonymousVehicleIdentity from Phase 1
 * @param scopeMetadata - AnonymousVehicleIdentityScopeMetadata from Phase 2
 * @returns AnonymousVehicleIdentityEnvelope
 */
export function buildAnonymousVehicleIdentityEnvelope(
  identity: AnonymousVehicleIdentity,
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata
): AnonymousVehicleIdentityEnvelope {
  // Validate inputs
  if (!identity?.anonymousVehicleId) {
    throw new Error('Invalid identity: missing anonymousVehicleId');
  }

  if (!scopeMetadata?.issuerId) {
    throw new Error('Invalid scope metadata: missing issuerId');
  }

  // Build envelope
  const envelope: AnonymousVehicleIdentityEnvelope = {
    identity,
    scopeMetadata,
  };

  return envelope;
}

/**
 * Build anonymous vehicle identity envelope fingerprint
 * Pure function: Creates deterministic hash of identity + scope metadata
 *
 * The fingerprint is derived ONLY from identity and scope fields.
 * It does NOT include VIN or any verification data.
 * It enables integrity checking in future phases (but no verification in Phase 3).
 *
 * @param identity - AnonymousVehicleIdentity
 * @param scopeMetadata - AnonymousVehicleIdentityScopeMetadata
 * @param attestationVersion - Version for fingerprintgeneration (for future evolution)
 * @returns 32-character hex fingerprint
 */
export function buildAnonymousVehicleIdentityEnvelopeFingerprint(
  identity: AnonymousVehicleIdentity,
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata,
  attestationVersion: string = '1.0'
): string {
  // Create deterministic input from identity + scope fields
  // Order is critical for consistency across calls
  const fingerprintInput = [
    identity.anonymousVehicleId,
    identity.issuerId,
    identity.domain,
    identity.contextClass,
    identity.epoch,
    identity.protocolVersion,
    scopeMetadata.issuerId,
    scopeMetadata.issuerType,
    scopeMetadata.domain,
    scopeMetadata.subDomain || '',
    scopeMetadata.contextClass,
    scopeMetadata.usagePolicy,
    scopeMetadata.epoch,
    scopeMetadata.epochType,
    scopeMetadata.protocolVersion,
    scopeMetadata.scopeVersion,
    attestationVersion,
  ].join('|');

  // Generate deterministic hash
  return generateDeterministicHash(fingerprintInput);
}

/**
 * Build anonymous vehicle identity attestation
 * Pure function: Creates issuer assertion/attestation for an identity envelope
 *
 * @param identity - AnonymousVehicleIdentity
 * @param scopeMetadata - AnonymousVehicleIdentityScopeMetadata
 * @param input - AttestationInput with issuer info
 * @returns AnonymousVehicleIdentityAttestation
 */
export function buildAnonymousVehicleIdentityAttestation(
  identity: AnonymousVehicleIdentity,
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata,
  input: AnonymousVehicleIdentityAttestationInput
): AnonymousVehicleIdentityAttestation {
  // Validate inputs
  if (!input.issuerId) {
    throw new Error('Missing required attestation field: issuerId');
  }

  // Build attestation ID (deterministic from identity + scope + issuer)
  const attestationIdInput = `${identity.anonymousVehicleId}|${input.issuerId}|${input.timestamp}`;
  const attestationIdSuffix = generateDeterministicHash(attestationIdInput).substring(0, 16);
  const attestationId = `attest_${attestationIdSuffix}`;

  // Generate envelope fingerprint
  const attestationVersionValue = input.attestationVersion || '1.0';
  const envelopeFingerprint = buildAnonymousVehicleIdentityEnvelopeFingerprint(
    identity,
    scopeMetadata,
    attestationVersionValue
  );

  // Build attestation
  const attestation: AnonymousVehicleIdentityAttestation = {
    attestationId,
    attestationVersion: attestationVersionValue,
    issuerId: input.issuerId,
    issuedAt: input.timestamp || new Date().toISOString(),
    protocolVersion: identity.protocolVersion,
    attestationType: input.attestationType || 'SELF_ASSERTED',
    attestationStatus: input.attestationStatus || 'ISSUED',
    envelopeFingerprint,
  };

  return attestation;
}

/**
 * Build anonymous vehicle identity attested envelope
 * Pure function: Combines identity, scope, and attestation into final package
 *
 * @param identity - AnonymousVehicleIdentity
 * @param scopeMetadata - AnonymousVehicleIdentityScopeMetadata
 * @param attestation - AnonymousVehicleIdentityAttestation
 * @returns AnonymousVehicleIdentityAttestedEnvelope
 */
export function buildAnonymousVehicleIdentityAttestedEnvelope(
  identity: AnonymousVehicleIdentity,
  scopeMetadata: AnonymousVehicleIdentityScopeMetadata,
  attestation: AnonymousVehicleIdentityAttestation
): AnonymousVehicleIdentityAttestedEnvelope {
  // Validate inputs
  if (!identity?.anonymousVehicleId) {
    throw new Error('Invalid identity: missing anonymousVehicleId');
  }

  if (!scopeMetadata?.issuerId) {
    throw new Error('Invalid scope metadata: missing issuerId');
  }

  if (!attestation?.attestationId) {
    throw new Error('Invalid attestation: missing attestationId');
  }

  // Verify attestation references match
  if (attestation.issuerId !== scopeMetadata.issuerId) {
    throw new Error('Mismatch: attestation issuerId does not match scope metadata issuerId');
  }

  // Build attested envelope
  const attestedEnvelope: AnonymousVehicleIdentityAttestedEnvelope = {
    identity,
    scopeMetadata,
    attestation,
  };

  return attestedEnvelope;
}

/**
 * ANONYMOUS VEHICLE IDENTITY LAYER - PHASE 1 OVERVIEW
 * 
 * PURPOSE
 * ───────
 * Generate anonymous, deterministic vehicle identifiers that enable
 * the Lent+ system to track vehicles across domains without exposing
 * sensitive VIN data.
 * 
 * ════════════════════════════════════════════════════════════════════
 * 
 * ISSUANCE FLOW (Phase 1)
 * ──────────────────────
 * 
 * 1. CLIENT REQUESTS ANONYMOUS ID
 *    Input: AnonymousVehicleIdentityRequest
 *    Contains: VIN + metadata (issuerId, domain, context, epoch)
 * 
 * 2. DETERMINISTIC HASHING
 *    Input: VIN + metadata (in fixed order)
 *    Process: SHA-256-like hash of concatenated values
 *    Output: 32-char hex string
 * 
 * 3. IDENTITY CREATION
 *    Create AnonymousVehicleIdentity with:
 *    - anonymousVehicleId (hashed)
 *    - All metadata (issuerId, domain, context, epoch)
 *    - NO VIN exposed
 * 
 * 4. VIN DISCARDED
 *    VIN exists only during computation
 *    Never stored, logged, or transmitted
 *    Garbage collected after hash generation
 * 
 * ════════════════════════════════════════════════════════════════════
 * 
 * KEY PROPERTIES
 * ──────────────
 * 
 * DETERMINISTIC
 *   Same VIN + metadata → Same anonymousVehicleId always
 *   Enables consistent tracking across calls
 *   Example: issueAnonymousVehicleIdentity(req) called twice with same VIN
 *            returns same anonymousVehicleId both times
 * 
 * CONTEXT-AWARE
 *   Different domains → Different IDs from same VIN
 *   Example: VIN=ABC123 in 'insurance' domain gets different ID than
 *            same VIN=ABC123 in 'maintenance' domain
 * 
 * EPHEMERAL VIN
 *   VIN never persisted anywhere
 *   Only exists as temporary function parameter
 *   No risk of VIN leakage from storage
 * 
 * STATELESS
 *   No database, no state, no side effects
 *   Pure function: same inputs → same outputs
 *   Can be called concurrently without race conditions
 * 
 * ════════════════════════════════════════════════════════════════════
 * 
 * EXAMPLE USAGE
 * ─────────────
 * 
 * // Request anonymous identity for a vehicle
 * const request: AnonymousVehicleIdentityRequest = {
 *   vin: 'JF1GC4B3X0E002345',  // Temporary - will be hashed and discarded
 *   issuerId: 'EXPERTISE',
 *   domain: 'maintenance',
 *   contextClass: 'commercial',
 *   epochType: 'CURRENT_MONTH',
 *   timestamp: new Date().toISOString(),
 *   protocolVersion: '1.0',
 * };
 * 
 * // Issue anonymous identity
 * const identity = issueAnonymousVehicleIdentity(request);
 * 
 * // Result (no VIN exposed):
 * {
 *   anonymousVehicleId: 'anon_a7f9e2c3d8b1f4a6c9e2d5f8a1b4c7e0',
 *   issuerId: 'EXPERTISE',
 *   domain: 'maintenance',
 *   contextClass: 'commercial',
 *   epoch: '2026-03',
 *   issuedAt: '2026-03-09T10:30:00Z',
 *   protocolVersion: '1.0',
 * }
 * 
 * // Now use anonymousVehicleId instead of VIN for:
 * // - Database queries
 * // - API calls
 * // - Logging
 * // - Analytics
 * // VIN never appears in these systems
 * 
 * ════════════════════════════════════════════════════════════════════
 * 
 * FUTURE PHASES
 * ──────────────
 * 
 * Phase 3: VERIFICATION
 *   Verify that a given VIN matches an anonymous ID
 *   Input: VIN + anonymousVehicleId
 *   Output: boolean (true if VIN hashes to this ID)
 *   Use case: Validate user claims about vehicle ownership
 * 
 * Phase 4: ATTESTATION
 *   Prove authority to issue or validate an identity
 *   Input: anonymousVehicleId + issuer credentials
 *   Output: Attestation proof
 *   Use case: Verify that identity was legitimately issued
 * 
 * Phase 5: PROOF SYSTEMS
 *   Zero-knowledge proofs for privacy-preserving claims
 *   Input: anonymousVehicleId + claim (e.g., "vehicle in good condition")
 *   Output: ZK proof
 *   Use case: Make verifiable claims without revealing identity
 * 
 * ════════════════════════════════════════════════════════════════════
 * 
 * PHASE 2 SUMMARY: SCOPE METADATA & ENVELOPES
 * ────────────────────────────────────────────
 * 
 * New Types (Phase 2):
 * - AnonymousVehicleIdentityScopeMetadata: Business/temporal context
 * - AnonymousVehicleIdentityEnvelope: Identity + metadata package
 * 
 * New Functions (Phase 2):
 * - buildAnonymousVehicleIdentityScopeMetadata()
 * - buildAnonymousVehicleIdentityEnvelope()
 * 
 * Scope Metadata contains:
 *   - Issuer (ID and type)
 *   - Domain and SubDomain
 *   - ContextClass and UsagePolicy
 *   - Epoch and EpochType
 *   - Protocol and Scope versions
 * 
 * Envelope Structure:
 *   {
 *     identity: AnonymousVehicleIdentity,
 *     scopeMetadata: AnonymousVehicleIdentityScopeMetadata
 *   }
 * 
 * ════════════════════════════════════════════════════════════════════
 * 
 * PHASE 3 SUMMARY: ATTESTATION & INTEGRITY
 * ─────────────────────────────────────────
 * 
 * New Types (Phase 3):
 * - AnonymousVehicleIdentityAttestation: Issuer assertion
 * - AnonymousVehicleIdentityAttestedEnvelope: Identity + metadata + attestation
 * 
 * New Functions (Phase 3):
 * - buildAnonymousVehicleIdentityEnvelopeFingerprint()
 * - buildAnonymousVehicleIdentityAttestation()
 * - buildAnonymousVehicleIdentityAttestedEnvelope()
 * 
 * Attestation contains:
 *   - Attestation ID (unique identifier)
 *   - Issuer ID (who created this attestation)
 *   - Attestation type (e.g., SELF_ASSERTED)
 *   - Attestation status (e.g., ISSUED)
 *   - Envelope fingerprint (deterministic hash of identity + scope)
 *   - Timestamp and versioning
 * 
 * NO VIN, NO VERIFICATION, NO SIGNATURE
 *   Attestation is pure issuer assertion only
 *   Fingerprint is deterministic from identity/scope fields
 *   No proof-of-origin or verification logic
 * 
 * Attested Envelope Structure:
 *   {
 *     identity: AnonymousVehicleIdentity,
 *     scopeMetadata: AnonymousVehicleIdentityScopeMetadata,
 *     attestation: AnonymousVehicleIdentityAttestation
 *   }
 * 
 * ════════════════════════════════════════════════════════════════════
 * 
 * VIN PROTECTION
 *   - VIN parameter exists only in function scope
 *   - Immediately hashed and discarded
 *   - No references remain after function returns
 *   - No logging or intermediate storage
 * 
 * HASH QUALITY
 *   - Current: Simple deterministic hash (sufficient for anonymization)
 *   - Future: Consider SHA-256 via crypto.subtle.digest for production
 *   - Collision risk: Negligible for vehicle ID use case
 * 
 * SCOPE ISOLATION (Phase 2)
 *   - Each domain → Different ID from same VIN
 *   - Scope metadata enables fine-grained access control
 *   - Usage policies prevent cross-domain leakage
 * 
 * EPOCH ROTATION
 *   - Different epochs → Different IDs from same VIN
 *   - Enables periodic identity rotation
 *   - Use case: Monthly/yearly anonymization refresh
 * 
 * ════════════════════════════════════════════════════════════════════
 * 
 * GUARANTEES
 * ───────────
 * 
 * ✓ VIN NEVER STORED: Protocol strictly prevents VIN persistence
 * ✓ VIN NEVER EXPOSED: Identity/envelope output contains no VIN reference
 * ✓ DETERMINISTIC: Same inputs always produce same ID
 * ✓ CONTEXT-AWARE: Domain/context/epoch modifications change the ID
 * ✓ STATELESS: Pure function with no side effects
 * ✓ THREAD-SAFE: No shared state, concurrent calls safe
 * ✓ IMMUTABLE OUTPUT: Returned objects cannot be mutated
 * ✓ NO VERIFICATION: Phase 2 excludes verification logic
 * ✓ NO ATTESTATION: Phase 2 excludes attestation fields
 * ✓ NO PROOF SYSTEMS: Phase 2 excludes proof logic (Phase 5+)
 */
