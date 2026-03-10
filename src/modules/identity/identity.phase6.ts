import type {
  AnonymousVehicleIdentityAttestedEnvelope,
  AnonymousVehicleIdentityTemporalValidationInput,
  AnonymousVehicleIdentityTemporalValidationResult,
  AnonymousVehicleIdentityTemporalStatus,
} from './identity.types';
import { generateDeterministicHash } from './identity.phase1';

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
