/**
 * PHASE 11: ANONYMOUS VEHICLE IDENTITY FEED / EXCHANGE LAYER
 *
 * Exchange model for federated identity distribution and feed management.
 * Structures for preparing identities for export to external systems.
 *
 * Responsibilities:
 * - Define exchange record structure
 * - Generate exchange payloads for external systems
 * - Track exchange status and metadata
 * - No network calls, no queue integration, no VIN exposure
 */

import type {
  AnonymousVehicleIdentityFederationEnvelope,
  AnonymousVehicleIdentityFederationMetadata,
} from './identity.types';

import { generateDeterministicHash } from './identity.phase1';

/**
 * Exchange status for an identity ready for or in the process of being exported
 *
 * READY: Identity has been created and is ready for export
 * QUEUED: Identity is queued in an exchange system
 * EXPORTED: Identity has been successfully exported
 * REJECTED: Identity failed validation or export requirements and was rejected
 */
export type AnonymousVehicleIdentityExchangeStatus =
  | 'READY'
  | 'QUEUED'
  | 'EXPORTED'
  | 'REJECTED';

/**
 * Exchange record for an Anonymous Vehicle Identity
 *
 * Tracks metadata for identity exchange operations.
 * Built from federation envelope metadata without exposing VIN.
 *
 * FIELDS:
 * - exchangeId: Unique exchange identifier (deterministic)
 * - exchangeVersion: Version of exchange record schema
 * - exchangeStatus: Current status (READY, QUEUED, EXPORTED, REJECTED)
 * - issuerId: Issuer ID from federation metadata
 * - targetSystem: Target system or feed name
 * - exportedAt: ISO timestamp when exchange record was created
 * - federationId: Federation ID from federation metadata
 * - envelopeFingerprint: Fingerprint linking to attestation envelope
 */
export interface AnonymousVehicleIdentityExchangeRecord {
  /**
   * Unique exchange identifier
   * Format: exchange_[hash_suffix]
   * Deterministic from federationId + targetSystem + timestamp
   */
  exchangeId: string;

  /**
   * Version of the exchange record schema
   * Enables evolution of exchange structure
   */
  exchangeVersion: string;

  /**
   * Current exchange status
   * READY: Ready for export
   * QUEUED: Queued in exchange system
   * EXPORTED: Successfully exported
   * REJECTED: Failed validation or export
   */
  exchangeStatus: AnonymousVehicleIdentityExchangeStatus;

  /**
   * Issuer ID from federation metadata
   * Identifies the organization that issued the identity
   */
  issuerId: string;

  /**
   * Target system or feed name
   * Where the identity will be exchanged
   */
  targetSystem: string;

  /**
   * ISO timestamp when exchange record was created
   */
  exportedAt: string;

  /**
   * Federation ID from federation metadata
   * Links to the federation layer
   */
  federationId: string;

  /**
   * Envelope fingerprint for integrity reference
   * Links to attestation envelope
   */
  envelopeFingerprint: string;
}

/**
 * Exchange payload for identity distribution
 *
 * Complete package for exporting a federated identity.
 * Combines federation envelope with exchange metadata.
 *
 * FIELDS:
 * - federationEnvelope: Complete federated identity (phases 1-8)
 * - exchangeRecord: Exchange metadata (phase 11)
 */
export interface AnonymousVehicleIdentityExchangePayload {
  /**
   * Complete federated identity envelope
   * Contains all phases 1-8 data
   */
  federationEnvelope: AnonymousVehicleIdentityFederationEnvelope;

  /**
   * Exchange record with metadata
   * Contains exchange status and tracking information
   */
  exchangeRecord: AnonymousVehicleIdentityExchangeRecord;
}

/**
 * Build an exchange record for a federated identity
 *
 * Pure function: Creates exchange metadata from federation envelope.
 * Does NOT perform network calls or queue operations.
 * Does NOT expose VIN or sensitive data.
 *
 * DETERMINISTIC GENERATION:
 * - exchangeId is deterministic from federationId + targetSystem + timestamp
 * - Same inputs → same exchangeId
 * - Enables consistent tracking across systems
 *
 * DEFAULTS:
 * - exchangeVersion: '1.0'
 * - exchangeStatus: 'READY'
 * - exportedAt: current ISO timestamp (or provided)
 *
 * VALIDATION:
 * - Verifies federation envelope has required fields
 * - Verifies federation metadata has federationId and issuerId
 *
 * @param federationEnvelope - Fed envelope from Phase 8
 * @param targetSystem - Target system or feed name for exchange
 * @param input - Optional configuration (exchangeVersion, exportedAt)
 * @returns AnonymousVehicleIdentityExchangeRecord
 * @throws Error if federation envelope is invalid
 */
export function buildAnonymousVehicleIdentityExchangeRecord(
  federationEnvelope: AnonymousVehicleIdentityFederationEnvelope,
  targetSystem: string,
  input?: {
    exchangeVersion?: string;
    exchangeStatus?: AnonymousVehicleIdentityExchangeStatus;
    exportedAt?: string;
  }
): AnonymousVehicleIdentityExchangeRecord {
  // Validate inputs
  if (!federationEnvelope?.federationMetadata) {
    throw new Error('Invalid federation envelope: missing federation metadata');
  }

  if (!federationEnvelope.federationMetadata.federationId) {
    throw new Error('Invalid federation metadata: missing federationId');
  }

  if (!federationEnvelope.federationMetadata.issuerId) {
    throw new Error('Invalid federation metadata: missing issuerId');
  }

  if (!federationEnvelope.attestation?.envelopeFingerprint) {
    throw new Error('Invalid attestation: missing envelopeFingerprint');
  }

  if (!targetSystem) {
    throw new Error('targetSystem is required');
  }

  // Extract parameters
  const exchangeVersion = input?.exchangeVersion || '1.0';
  const exchangeStatus = input?.exchangeStatus || 'READY';
  const exportedAt = input?.exportedAt || new Date().toISOString();
  const federationId = federationEnvelope.federationMetadata.federationId;
  const issuerId = federationEnvelope.federationMetadata.issuerId;
  const envelopeFingerprint = federationEnvelope.attestation.envelopeFingerprint;

  // Generate deterministic exchange ID
  const exchangeIdInput = `${federationId}|${targetSystem}|${exportedAt}`;
  const exchangeIdSuffix = generateDeterministicHash(exchangeIdInput).substring(0, 16);
  const exchangeId = `exchange_${exchangeIdSuffix}`;

  // Build exchange record
  const exchangeRecord: AnonymousVehicleIdentityExchangeRecord = {
    exchangeId,
    exchangeVersion,
    exchangeStatus,
    issuerId,
    targetSystem,
    exportedAt,
    federationId,
    envelopeFingerprint,
  };

  return exchangeRecord;
}

/**
 * Build an exchange payload for identity distribution
 *
 * Pure function: Combines federation envelope with exchange record.
 * Does NOT perform network calls or queue operations.
 * Does NOT expose VIN or sensitive data.
 *
 * STRUCTURE:
 * - federationEnvelope: All phases 1-8 in complete form
 * - exchangeRecord: Exchange metadata from Phase 11
 *
 * VALIDATION:
 * - Verifies federation envelope integrity
 * - Verifies exchange record has required fields
 * - Ensures consistency of federationId between envelope and record
 *
 * @param federationEnvelope - Fed envelope from Phase 8
 * @param exchangeRecord - Exchange record from Phase 11
 * @returns AnonymousVehicleIdentityExchangePayload
 * @throws Error if inputs are invalid
 */
export function buildAnonymousVehicleIdentityExchangePayload(
  federationEnvelope: AnonymousVehicleIdentityFederationEnvelope,
  exchangeRecord: AnonymousVehicleIdentityExchangeRecord
): AnonymousVehicleIdentityExchangePayload {
  // Validate federation envelope
  if (!federationEnvelope?.identity?.anonymousVehicleId) {
    throw new Error('Invalid federation envelope: missing identity');
  }

  if (!federationEnvelope?.federationMetadata?.federationId) {
    throw new Error('Invalid federation envelope: missing federation metadata');
  }

  // Validate exchange record
  if (!exchangeRecord?.exchangeId) {
    throw new Error('Invalid exchange record: missing exchangeId');
  }

  if (!exchangeRecord?.federationId) {
    throw new Error('Invalid exchange record: missing federationId');
  }

  // Verify consistency
  if (exchangeRecord.federationId !== federationEnvelope.federationMetadata.federationId) {
    throw new Error(
      'Mismatch: exchange record federationId does not match envelope federationId'
    );
  }

  if (exchangeRecord.issuerId !== federationEnvelope.federationMetadata.issuerId) {
    throw new Error(
      'Mismatch: exchange record issuerId does not match envelope issuerId'
    );
  }

  // Build exchange payload
  const exchangePayload: AnonymousVehicleIdentityExchangePayload = {
    federationEnvelope,
    exchangeRecord,
  };

  return exchangePayload;
}
