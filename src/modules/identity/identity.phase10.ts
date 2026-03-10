/**
 * PHASE 10: ANONYMOUS VEHICLE IDENTITY GUARD LAYER
 *
 * Safety layer for the AVID identity pipeline.
 * Validates inputs before execution and provides error handling.
 *
 * Responsibilities:
 * - Validate VIN format and length
 * - Validate issuer registry if provided
 * - Wrap pipeline execution in try/catch
 * - Provide clear error messages
 * - No business logic modifications
 */

import type {
  AnonymousVehicleIdentityRequest,
  AnonymousVehicleIdentityFederationEnvelope,
} from './identity.types';

import {
  createFederatedVehicleIdentity,
  CreateFederatedVehicleIdentityOptions,
} from './identity.phase9';

/**
 * Guard layer error codes
 */
export enum GuardLayerErrorCode {
  INVALID_VEHICLE_IDENTITY_REQUEST = 'INVALID_VEHICLE_IDENTITY_REQUEST',
  IDENTITY_PIPELINE_EXECUTION_FAILED = 'IDENTITY_PIPELINE_EXECUTION_FAILED',
}

/**
 * Guard layer error with typed error code
 */
export class GuardLayerError extends Error {
  constructor(
    public code: GuardLayerErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GuardLayerError';
    Object.setPrototypeOf(this, GuardLayerError.prototype);
  }
}

/**
 * Validate VIN format and length
 *
 * VIN Validation Rules:
 * - Must exist (not null, not undefined)
 * - Must be a string
 * - Must be between 11 and 17 characters
 * - Standard VIN = 17 characters
 * - Partial VIN (11-16) allowed for legacy systems
 *
 * @param vin - Vehicle Identification Number to validate
 * @throws GuardLayerError if VIN is invalid
 */
function validateVIN(vin: unknown): void {
  // Check 1: VIN must exist
  if (!vin) {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'VIN is required',
      { field: 'vin', reason: 'missing' }
    );
  }

  // Check 2: VIN must be a string
  if (typeof vin !== 'string') {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'VIN must be a string',
      { field: 'vin', received: typeof vin, reason: 'invalid_type' }
    );
  }

  // Check 3: VIN must have minimum length (11 characters)
  if (vin.length < 11) {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      `VIN is too short: ${vin.length} characters (minimum: 11)`,
      { field: 'vin', length: vin.length, reason: 'too_short' }
    );
  }

  // Check 4: VIN must have maximum length (17 characters)
  if (vin.length > 17) {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      `VIN is too long: ${vin.length} characters (maximum: 17)`,
      { field: 'vin', length: vin.length, reason: 'too_long' }
    );
  }
}

/**
 * Validate request input for federated vehicle identity creation
 *
 * Validation Rules:
 * 1. VIN must exist and be valid
 * 2. issuerId must exist (required)
 * 3. domain must exist (required)
 * 4. protocolVersion if provided must be a string
 *
 * @param request - AnonymousVehicleIdentityRequest to validate
 * @throws GuardLayerError if request is invalid
 */
function validateRequest(request: unknown): asserts request is AnonymousVehicleIdentityRequest {
  // Null/undefined check
  if (!request || typeof request !== 'object') {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'Request must be an object',
      { received: typeof request, reason: 'invalid_type' }
    );
  }

  const req = request as Record<string, unknown>;

  // Validate VIN
  validateVIN(req.vin);

  // Validate issuerId
  if (!req.issuerId) {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'issuerId is required',
      { field: 'issuerId', reason: 'missing' }
    );
  }

  if (typeof req.issuerId !== 'string') {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'issuerId must be a string',
      { field: 'issuerId', received: typeof req.issuerId, reason: 'invalid_type' }
    );
  }

  // Validate domain
  if (!req.domain) {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'domain is required',
      { field: 'domain', reason: 'missing' }
    );
  }

  if (typeof req.domain !== 'string') {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'domain must be a string',
      { field: 'domain', received: typeof req.domain, reason: 'invalid_type' }
    );
  }

  // Validate contextClass if provided
  if (req.contextClass && typeof req.contextClass !== 'string') {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'contextClass must be a string',
      { field: 'contextClass', received: typeof req.contextClass, reason: 'invalid_type' }
    );
  }

  // Validate protocolVersion if provided
  if (req.protocolVersion && typeof req.protocolVersion !== 'string') {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'protocolVersion must be a string',
      { field: 'protocolVersion', received: typeof req.protocolVersion, reason: 'invalid_type' }
    );
  }
}

/**
 * Validate issuer registry if provided
 *
 * Validation Rules:
 * 1. If registry provided, must be an object
 * 2. Must have registryVersion (string)
 * 3. Must have issuers field (object)
 *
 * @param registry - Issuer registry to validate
 * @throws GuardLayerError if registry is invalid
 */
function validateIssuerRegistry(registry: unknown): void {
  if (!registry) {
    // Registry is optional
    return;
  }

  if (typeof registry !== 'object' || Array.isArray(registry)) {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'Issuer registry must be an object',
      { field: 'issuerRegistry', received: typeof registry, reason: 'invalid_type' }
    );
  }

  const reg = registry as Record<string, unknown>;

  // Validate registryVersion
  if (!reg.registryVersion) {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'Issuer registry must have registryVersion',
      { field: 'issuerRegistry.registryVersion', reason: 'missing' }
    );
  }

  if (typeof reg.registryVersion !== 'string') {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'Issuer registry registryVersion must be a string',
      { field: 'issuerRegistry.registryVersion', received: typeof reg.registryVersion, reason: 'invalid_type' }
    );
  }

  // Validate issuers
  if (reg.issuers !== undefined && (typeof reg.issuers !== 'object' || Array.isArray(reg.issuers))) {
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'Issuer registry issuers must be an object',
      { field: 'issuerRegistry.issuers', received: typeof reg.issuers, reason: 'invalid_type' }
    );
  }
}

/**
 * Create a federated vehicle identity with guard layer validation
 *
 * Pure function: Validates inputs before executing the identity pipeline.
 * Does NOT modify request or options.
 * Does NOT perform network calls.
 * Does NOT have side effects.
 *
 * VALIDATION SEQUENCE:
 *
 * 1. INPUT VALIDATION
 *    - Validate request is an object
 *    - Validate VIN (must exist, be string, 11-17 chars)
 *    - Validate issuerId (must exist, be string)
 *    - Validate domain (must exist, be string)
 *    - Validate contextClass if provided (must be string)
 *    - Validate protocolVersion if provided (must be string)
 *
 * 2. REGISTRY VALIDATION (if provided)
 *    - Validate registry is an object
 *    - Validate registryVersion (must exist, be string)
 *    - Validate issuers field (must be object if present)
 *
 * 3. PIPELINE EXECUTION
 *    - Execute createFederatedVehicleIdentity from Phase 9
 *    - Wrap in try/catch for error handling
 *    - Return AnonymousVehicleIdentityFederationEnvelope on success
 *
 * ERROR HANDLING:
 *    - GuardLayerError: Input validation failures (immediate throw)
 *    - Pipeline errors: Caught and re-thrown with IDENTITY_PIPELINE_EXECUTION_FAILED
 *
 * @param request - AnonymousVehicleIdentityRequest with required VIN, issuerId, domain
 * @param options - Optional configuration for pipeline phases
 * @returns AnonymousVehicleIdentityFederationEnvelope if successful
 * @throws GuardLayerError if validation fails
 * @throws GuardLayerError if pipeline execution fails
 *
 * @example
 * ```typescript
 * const request: AnonymousVehicleIdentityRequest = {
 *   vin: 'JF1GC4B3X0E002345',  // 17 chars (standard VIN)
 *   issuerId: 'EXPERTISE',
 *   domain: 'maintenance',
 *   contextClass: 'commercial',
 *   epochType: 'CURRENT_MONTH',
 *   timestamp: new Date().toISOString(),
 *   protocolVersion: '1.0',
 * };
 *
 * const registry: AnonymousVehicleIssuerRegistry = {
 *   registryVersion: '1.0',
 *   issuers: {},
 * };
 *
 * try {
 *   const identity = createFederatedVehicleIdentityGuarded(request, {
 *     issuerRegistry: registry,
 *   });
 *   console.log('Identity created:', identity);
 * } catch (error) {
 *   if (error instanceof GuardLayerError) {
 *     console.error(`Validation error [${error.code}]: ${error.message}`, error.details);
 *   }
 * }
 * ```
 */
export function createFederatedVehicleIdentityGuarded(
  request: unknown,
  options: CreateFederatedVehicleIdentityOptions = {}
): AnonymousVehicleIdentityFederationEnvelope {
  // ═══════════════════════════════════════════════════════════════════════════════
  // VALIDATION PHASE
  // ═══════════════════════════════════════════════════════════════════════════════

  try {
    // Validate request input
    validateRequest(request);

    // Validate issuer registry if provided
    if (options.issuerRegistry) {
      validateIssuerRegistry(options.issuerRegistry);
    }
  } catch (error) {
    // Re-throw validation errors as-is
    if (error instanceof GuardLayerError) {
      throw error;
    }
    // Wrap unexpected errors
    throw new GuardLayerError(
      GuardLayerErrorCode.INVALID_VEHICLE_IDENTITY_REQUEST,
      'Unexpected validation error',
      { originalError: String(error) }
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // PIPELINE EXECUTION PHASE
  // ═══════════════════════════════════════════════════════════════════════════════

  try {
    const federatedIdentity = createFederatedVehicleIdentity(request, options);
    return federatedIdentity;
  } catch (error) {
    // Wrap pipeline execution errors
    throw new GuardLayerError(
      GuardLayerErrorCode.IDENTITY_PIPELINE_EXECUTION_FAILED,
      'Failed to create federated vehicle identity',
      {
        originalError: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      }
    );
  }
}
