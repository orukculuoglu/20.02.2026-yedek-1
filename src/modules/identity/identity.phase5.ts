import type {
  AnonymousVehicleIdentityAttestedEnvelope,
  AnonymousVehicleIdentityTrustValidationResult,
  AnonymousVehicleIdentityTrustStatus,
  AnonymousVehicleIdentityTrustLevel,
  AnonymousVehicleIssuerRegistry,
} from './identity.types';
import { generateDeterministicHash } from './identity.phase1';

/**
 * PHASE 5: LOCAL ISSUER TRUST REGISTRY & TRUST VALIDATION
 *
 * PURPOSE
 * ───────
 * Validate that the issuer of an attested envelope is in the local trusted issuer
 * registry and is authorized for the envelope's domain and context class.
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
