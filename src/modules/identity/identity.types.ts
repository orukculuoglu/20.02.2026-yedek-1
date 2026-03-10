/**
 * Anonymous Vehicle Identity - Type Definitions
 * 
 * Complete type system for all phases of the Anonymous Vehicle Identity Layer.
 * Contains all interfaces, types, and unions used across the AVID protocol.
 * 
 * Phases Included:
 * - Phase 1: Identity Issuance
 * - Phase 2: Scope Metadata
 * - Phase 3: Attestation
 * - Phase 4: Verification
 * - Phase 5: Trust Validation
 * - Phase 6: Temporal Validation
 * - Phase 7: Proof Layer
 * - Phase 8: Federation/Interoperability
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 1: ANONYMOUS VEHICLE IDENTITY ISSUANCE
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2: SCOPE METADATA
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3: ATTESTATION
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 4: PROTOCOL VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

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
 * Input for trust validation (optional fields only)
 */
export interface AnonymousVehicleIdentityTrustValidationInput {
  // This interface is currently empty as trust validation
  // operates on the envelope and registry only.
  // Provided for future extensibility.
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 6: TEMPORAL VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 7: PROOF LAYER
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 8: FEDERATION / INTEROPERABILITY
// ═══════════════════════════════════════════════════════════════════════════════

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
