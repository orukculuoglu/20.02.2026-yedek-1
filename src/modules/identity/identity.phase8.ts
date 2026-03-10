/**
 * PHASE 8: ANONYMOUS VEHICLE IDENTITY FEDERATION / INTEROPERABILITY LAYER
 *
 * Pure functions for federation metadata and local validation.
 * No external system calls, no cryptographic validation, no certificate checks.
 * Local federation rules only.
 */

import type {
  AnonymousVehicleIdentityProofEnvelope,
  AnonymousVehicleIdentityFederationMetadataInput,
  AnonymousVehicleIdentityFederationMetadata,
  AnonymousVehicleIdentityFederationEnvelope,
  AnonymousVehicleIdentityFederationValidationInput,
  AnonymousVehicleIdentityFederationValidationResult,
} from './identity.types';
import { generateDeterministicHash } from './identity.phase1';

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
