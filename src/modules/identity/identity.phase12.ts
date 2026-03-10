/**
 * PHASE 12: ANONYMOUS VEHICLE IDENTITY EVENT LAYER
 *
 * Event model for audit, traceability, and lifecycle tracking.
 * Records major milestones in the identity creation and federation process.
 *
 * Responsibilities:
 * - Define event types for identity lifecycle
 * - Create audit trail of identity operations
 * - Track federation and validation events
 * - No logging systems, no message queues, no VIN exposure
 */

import type {
  AnonymousVehicleIdentityFederationEnvelope,
} from './identity.types';

import { generateDeterministicHash } from './identity.phase1';

/**
 * Event types for Anonymous Vehicle Identity lifecycle
 *
 * IDENTITY_CREATED: Identity has been issued
 * IDENTITY_VERIFIED: Attestation has been verified
 * IDENTITY_TRUST_VALIDATED: Issuer trust has been validated
 * IDENTITY_TEMPORAL_VALIDATED: Temporal constraints have been validated
 * IDENTITY_PROOF_CREATED: Proof structure has been created
 * IDENTITY_FEDERATED: Identity has been federated
 * IDENTITY_EXCHANGE_CREATED: Exchange record has been created
 */
export type AnonymousVehicleIdentityEventType =
  | 'IDENTITY_CREATED'
  | 'IDENTITY_VERIFIED'
  | 'IDENTITY_TRUST_VALIDATED'
  | 'IDENTITY_TEMPORAL_VALIDATED'
  | 'IDENTITY_PROOF_CREATED'
  | 'IDENTITY_FEDERATED'
  | 'IDENTITY_EXCHANGE_CREATED';

/**
 * Event for tracking milestones in Anonymous Vehicle Identity lifecycle
 *
 * Represents a single operation or validation event in the identity pipeline.
 * Used for audit trails and traceability.
 *
 * FIELDS:
 * - eventId: Unique event identifier (deterministic)
 * - eventType: Type of event (creation, verification, federation, etc.)
 * - eventTimestamp: ISO timestamp when event occurred
 * - issuerId: Issuer ID from federation metadata
 * - federationId: Federation ID from federation metadata
 * - envelopeFingerprint: Fingerprint linking to attestation/proof chain
 */
export interface AnonymousVehicleIdentityEvent {
  /**
   * Unique event identifier
   * Format: event_[hash_suffix]
   * Deterministic from federationId + eventType + timestamp
   */
  eventId: string;

  /**
   * Type of event in the identity lifecycle
   */
  eventType: AnonymousVehicleIdentityEventType;

  /**
   * ISO timestamp when this event occurred
   */
  eventTimestamp: string;

  /**
   * Issuer ID from federation metadata
   * Identifies the organization that issued the identity
   */
  issuerId: string;

  /**
   * Federation ID from federation metadata
   * Links to the federation layer and identity record
   */
  federationId: string;

  /**
   * Envelope fingerprint for integrity reference
   * Links to attestation/proof chain
   */
  envelopeFingerprint: string;
}

/**
 * Bundle of events for a federated identity
 *
 * Groups all events associated with a single federated identity.
 * Provides complete audit trail for lifecycle tracking.
 *
 * FIELDS:
 * - federationId: Federation ID linking all events
 * - events: Array of AnonymousVehicleIdentityEvent
 */
export interface AnonymousVehicleIdentityEventBundle {
  /**
   * Federation ID from federation metadata
   * Links all events in this bundle to a single identity
   */
  federationId: string;

  /**
   * Events in this bundle
   * Ordered chronologically from creation to final state
   */
  events: AnonymousVehicleIdentityEvent[];
}

/**
 * Build a single event for identity lifecycle tracking
 *
 * Pure function: Creates an event record from federation envelope.
 * Does NOT implement logging, message queues, or persistence.
 * Does NOT expose VIN or sensitive data.
 *
 * DETERMINISTIC GENERATION:
 * - eventId is deterministic from federationId + eventType + timestamp
 * - Same inputs → same eventId
 * - Enables consistent tracking across systems
 *
 * VALIDATION:
 * - Verifies federation envelope has required fields
 * - Verifies federation metadata has federationId and issuerId
 * - Verifies attestation has envelopeFingerprint
 *
 * @param federationEnvelope - Federation envelope from Phase 8
 * @param eventType - Type of event occurring
 * @param timestamp - ISO timestamp (default: now)
 * @returns AnonymousVehicleIdentityEvent
 * @throws Error if federation envelope is invalid
 */
export function buildAnonymousVehicleIdentityEvent(
  federationEnvelope: AnonymousVehicleIdentityFederationEnvelope,
  eventType: AnonymousVehicleIdentityEventType,
  timestamp?: string
): AnonymousVehicleIdentityEvent {
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

  if (!eventType) {
    throw new Error('eventType is required');
  }

  // Extract parameters
  const eventTimestamp = timestamp || new Date().toISOString();
  const federationId = federationEnvelope.federationMetadata.federationId;
  const issuerId = federationEnvelope.federationMetadata.issuerId;
  const envelopeFingerprint = federationEnvelope.attestation.envelopeFingerprint;

  // Generate deterministic event ID
  const eventIdInput = `${federationId}|${eventType}|${eventTimestamp}`;
  const eventIdSuffix = generateDeterministicHash(eventIdInput).substring(0, 16);
  const eventId = `event_${eventIdSuffix}`;

  // Build event
  const event: AnonymousVehicleIdentityEvent = {
    eventId,
    eventType,
    eventTimestamp,
    issuerId,
    federationId,
    envelopeFingerprint,
  };

  return event;
}

/**
 * Build an event bundle for a federated identity
 *
 * Pure function: Creates a complete audit trail of identity lifecycle events.
 * Does NOT implement logging, message queues, or persistence.
 * Does NOT expose VIN or sensitive data.
 *
 * GENERATED EVENTS:
 * - IDENTITY_CREATED: Identity was issued (Phase 1)
 * - IDENTITY_VERIFIED: Attestation was verified (Phase 4)
 * - IDENTITY_FEDERATED: Identity was federated (Phase 8)
 *
 * Additional events can be added as optional extensions.
 *
 * STRUCTURE:
 * - federationId: Links all events together
 * - events: Array of events in chronological order
 *
 * VALIDATION:
 * - Verifies federation envelope has required fields
 * - Verifies federation metadata integrity
 * - Verifies attestation structure
 *
 * @param federationEnvelope - Federation envelope from Phase 8
 * @returns AnonymousVehicleIdentityEventBundle with audit trail
 * @throws Error if federation envelope is invalid
 */
export function buildAnonymousVehicleIdentityEventBundle(
  federationEnvelope: AnonymousVehicleIdentityFederationEnvelope
): AnonymousVehicleIdentityEventBundle {
  // Validate federation envelope
  if (!federationEnvelope?.federationMetadata) {
    throw new Error('Invalid federation envelope: missing federation metadata');
  }

  if (!federationEnvelope.federationMetadata.federationId) {
    throw new Error('Invalid federation metadata: missing federationId');
  }

  if (!federationEnvelope.attestation?.envelopeFingerprint) {
    throw new Error('Invalid attestation: missing envelopeFingerprint');
  }

  const federationId = federationEnvelope.federationMetadata.federationId;

  // Generate base timestamp for all events
  const baseTimestamp = new Date().toISOString();

  // Build events array with core lifecycle events
  const events: AnonymousVehicleIdentityEvent[] = [];

  // Event 1: Identity Created (Phase 1)
  // Represents the issuance of the anonymous identity
  const createdEvent = buildAnonymousVehicleIdentityEvent(
    federationEnvelope,
    'IDENTITY_CREATED',
    baseTimestamp
  );
  events.push(createdEvent);

  // Event 2: Identity Verified (Phase 4)
  // Represents verification of the attestation
  const verifiedEvent = buildAnonymousVehicleIdentityEvent(
    federationEnvelope,
    'IDENTITY_VERIFIED',
    baseTimestamp
  );
  events.push(verifiedEvent);

  // Event 3: Identity Federated (Phase 8)
  // Represents federation with interoperability rules
  const federatedEvent = buildAnonymousVehicleIdentityEvent(
    federationEnvelope,
    'IDENTITY_FEDERATED',
    baseTimestamp
  );
  events.push(federatedEvent);

  // Build event bundle
  const eventBundle: AnonymousVehicleIdentityEventBundle = {
    federationId,
    events,
  };

  return eventBundle;
}

/**
 * Build a complete event bundle with extended events
 *
 * Helper function to create an event bundle with additional event types
 * beyond the core lifecycle events.
 *
 * CORE EVENTS (always included):
 * - IDENTITY_CREATED
 * - IDENTITY_VERIFIED
 * - IDENTITY_FEDERATED
 *
 * EXTENDED EVENTS (optional, based on what phases were executed):
 * - IDENTITY_TRUST_VALIDATED: If trust validation was performed
 * - IDENTITY_TEMPORAL_VALIDATED: If temporal validation was performed
 * - IDENTITY_PROOF_CREATED: If proof layer was created
 * - IDENTITY_EXCHANGE_CREATED: If exchange record was created
 *
 * @param federationEnvelope - Federation envelope from Phase 8+
 * @param extendedEventTypes - Optional extended event types to include
 * @returns AnonymousVehicleIdentityEventBundle with core and extended events
 * @throws Error if federation envelope is invalid
 */
export function buildAnonymousVehicleIdentityEventBundleExtended(
  federationEnvelope: AnonymousVehicleIdentityFederationEnvelope,
  extendedEventTypes?: AnonymousVehicleIdentityEventType[]
): AnonymousVehicleIdentityEventBundle {
  // Start with base bundle
  const baseBundle = buildAnonymousVehicleIdentityEventBundle(federationEnvelope);

  // Add extended events if provided
  if (extendedEventTypes && extendedEventTypes.length > 0) {
    const baseTimestamp = new Date().toISOString();

    for (const eventType of extendedEventTypes) {
      // Skip core events (already in base bundle)
      if (
        eventType === 'IDENTITY_CREATED' ||
        eventType === 'IDENTITY_VERIFIED' ||
        eventType === 'IDENTITY_FEDERATED'
      ) {
        continue;
      }

      const extendedEvent = buildAnonymousVehicleIdentityEvent(
        federationEnvelope,
        eventType,
        baseTimestamp
      );
      baseBundle.events.push(extendedEvent);
    }
  }

  return baseBundle;
}
