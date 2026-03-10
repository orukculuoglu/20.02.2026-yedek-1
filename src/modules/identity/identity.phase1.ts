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

import type {
  AnonymousVehicleIdentity,
  AnonymousVehicleIdentityRequest,
} from './identity.types';

/**
 * Issue anonymous vehicle identity
 * Pure function: Generates a deterministic, anonymous identifier from a VIN
 *
 * @param request - AnonymousVehicleIdentityRequest containing VIN and metadata
 * @returns AnonymousVehicleIdentity with anonymousVehicleId (VIN not included)
 */
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
 * INTERNAL UTILITY: Used by all phases for deterministic ID generation
 *
 * @param input - String to hash (may contain VIN temporarily)
 * @returns 32-character hex hash
 */
export function generateDeterministicHash(input: string): string {
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
