/**
 * ANONYMOUS VEHICLE IDENTITY (AVID) ENGINE
 *
 * Unified module entry point for the complete AVID identity lifecycle.
 * Provides access to all types and phase implementations through a single import path.
 *
 * USAGE:
 * Import from @/modules/identity instead of individual phase files:
 *
 * Example import instead of individual phase files:
 *   import {
 *     issueAnonymousVehicleIdentity,
 *     buildAnonymousVehicleIdentityEnvelope,
 *     AnonymousVehicleIdentity,
 *   } from '@/modules/identity';
 *
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * MODULE STRUCTURE
 *
 * Phase 1: Issuance
 *   - Issue anonymous identities from VIN
 *   - Deterministic hashing
 *   - Pure function, no side effects
 *
 * Phase 2: Scope Metadata & Envelope
 *   - Build business context metadata
 *   - Create envelope fingerprints
 *   - Enable integrity tracking
 *
 * Phase 3: Attestation
 *   - Attest envelopes with issuer assertions
 *   - Create signatures and proof markers
 *   - Package identity with issuer claims
 *
 * Phase 4: Verification
 *   - Verify attestation structure and content
 *   - Validate envelope integrity
 *   - Pure validation, no external calls
 *
 * Phase 5: Trust Validation
 *   - Check issuer trust status against registry
 *   - Validate issuer credentials
 *   - Local-only validation (no external calls)
 *
 * Phase 6: Temporal Validation
 *   - Validate time-based constraints
 *   - Check epoch and temporal boundaries
 *   - Ensure identity validity period
 *
 * Phase 7: Proof Layer
 *   - Build proof structures for attestations
 *   - Create proof fingerprints
 *   - Combine envelope + proof into final package
 *
 * Phase 8: Federation & Interoperability
 *   - Add federation metadata
 *   - Define multi-issuer collaboration rules
 *   - Enable local federation without external calls
 *
 * Phase 9: Orchestrator
 *   - Pipeline orchestrator for all phases
 *   - Execute 1-8 in sequence
 *   - Return complete federated identity
 *
 * ════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  // Phase 1: Issuance
  AnonymousVehicleIdentityRequest,
  AnonymousVehicleIdentity,

  // Phase 2: Scope Metadata & Envelope
  AnonymousVehicleIdentityScopeMetadata,
  AnonymousVehicleIdentityScopeMetadataInput,
  AnonymousVehicleIdentityEnvelope,

  // Phase 3: Attestation
  AnonymousVehicleIdentityAttestationInput,
  AnonymousVehicleIdentityAttestation,
  AnonymousVehicleIdentityAttestedEnvelope,

  // Phase 4: Verification
  AnonymousVehicleIdentityVerificationInput,
  AnonymousVehicleIdentityVerificationResult,

  // Phase 5: Trust Validation
  AnonymousVehicleTrustedIssuer,
  AnonymousVehicleIssuerRegistry,
  AnonymousVehicleIdentityTrustValidationInput,
  AnonymousVehicleIdentityTrustStatus,
  AnonymousVehicleIdentityTrustLevel,
  AnonymousVehicleIdentityTrustValidationResult,

  // Phase 6: Temporal Validation
  AnonymousVehicleIdentityTemporalValidationInput,
  AnonymousVehicleIdentityTemporalValidationResult,

  // Phase 7: Proof Layer
  AnonymousVehicleIdentityProofInput,
  AnonymousVehicleIdentityProof,
  AnonymousVehicleIdentityProofEnvelope,

  // Phase 8: Federation & Interoperability
  AnonymousVehicleIdentityFederationMetadataInput,
  AnonymousVehicleIdentityFederationMetadata,
  AnonymousVehicleIdentityFederationEnvelope,
  AnonymousVehicleIdentityFederationValidationInput,
  AnonymousVehicleIdentityFederationValidationResult,
} from './identity.types';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 1: ISSUANCE
// ═══════════════════════════════════════════════════════════════════════════════

export {
  issueAnonymousVehicleIdentity,
  generateDeterministicHash,
} from './identity.phase1';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2: SCOPE METADATA & ENVELOPE
// ═══════════════════════════════════════════════════════════════════════════════

export {
  buildAnonymousVehicleIdentityScopeMetadata,
  buildAnonymousVehicleIdentityEnvelope,
  buildAnonymousVehicleIdentityEnvelopeFingerprint,
} from './identity.phase2';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3: ATTESTATION
// ═══════════════════════════════════════════════════════════════════════════════

export {
  buildAnonymousVehicleIdentityAttestation,
  buildAnonymousVehicleIdentityAttestedEnvelope,
} from './identity.phase3';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 4: VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

export {
  verifyAnonymousVehicleIdentityEnvelope,
} from './identity.phase4';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 5: TRUST VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export {
  validateAnonymousVehicleIssuerTrust,
} from './identity.phase5';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 6: TEMPORAL VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export {
  validateAnonymousVehicleIdentityTemporal,
} from './identity.phase6';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 7: PROOF LAYER
// ═══════════════════════════════════════════════════════════════════════════════

export {
  buildAnonymousVehicleIdentityProofFingerprint,
  buildAnonymousVehicleIdentityProof,
  buildAnonymousVehicleIdentityProofEnvelope,
} from './identity.phase7';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 8: FEDERATION & INTEROPERABILITY
// ═══════════════════════════════════════════════════════════════════════════════

export {
  buildAnonymousVehicleIdentityFederationMetadata,
  buildAnonymousVehicleIdentityFederationEnvelope,
  validateAnonymousVehicleIdentityFederation,
} from './identity.phase8';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 9: ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════

export {
  createFederatedVehicleIdentity,
} from './identity.phase9';

export type {
  CreateFederatedVehicleIdentityOptions,
} from './identity.phase9';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 10: GUARD LAYER
// ═══════════════════════════════════════════════════════════════════════════════

export {
  createFederatedVehicleIdentityGuarded,
  GuardLayerError,
  GuardLayerErrorCode,
} from './identity.phase10';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 11: FEED / EXCHANGE LAYER
// ═══════════════════════════════════════════════════════════════════════════════

export {
  buildAnonymousVehicleIdentityExchangeRecord,
  buildAnonymousVehicleIdentityExchangePayload,
} from './identity.phase11';

export type {
  AnonymousVehicleIdentityExchangeStatus,
  AnonymousVehicleIdentityExchangeRecord,
  AnonymousVehicleIdentityExchangePayload,
} from './identity.phase11';

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 12: EVENT LAYER
// ═══════════════════════════════════════════════════════════════════════════════

export {
  buildAnonymousVehicleIdentityEvent,
  buildAnonymousVehicleIdentityEventBundle,
  buildAnonymousVehicleIdentityEventBundleExtended,
} from './identity.phase12';

export type {
  AnonymousVehicleIdentityEventType,
  AnonymousVehicleIdentityEvent,
  AnonymousVehicleIdentityEventBundle,
} from './identity.phase12';
