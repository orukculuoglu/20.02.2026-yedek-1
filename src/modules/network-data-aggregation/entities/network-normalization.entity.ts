/**
 * MOTOR 3 — PHASE 4: NETWORK NORMALIZATION ENTITY
 * Immutable Entity Structures for Normalization Layer
 *
 * Scope:
 * - Entity layer only
 * - No normalization logic
 * - No aggregation logic
 * - No orchestration
 * - No factories that transform data
 * - No validation logic
 * - No runtime generation
 *
 * Purpose:
 * Provide immutable entity representations for the normalization flow
 * that transforms raw upstream events into canonical network events.
 */

import type {
  NetworkDomain,
  NetworkEventType,
  NetworkSourceRef,
  NetworkEventSourceKind,
} from '../types/network-foundation.types';
import type { NetworkEvent } from '../types/network-event.types';

// ============================================================================
// NORMALIZATION INPUT ENTITY
// ============================================================================

/**
 * Constructor input contract for NetworkNormalizationInputEntity.
 * Represents raw upstream input data required to construct the entity.
 * All fields required (no optional ambiguity).
 */
export interface CreateNetworkNormalizationInputInput {
  readonly sourceKind: NetworkEventSourceKind;
  readonly sourceEventId: string;
  readonly sourceTimestamp: string;
  readonly domain: NetworkDomain;
  readonly eventType: NetworkEventType;
  readonly rawContext: Readonly<Record<string, unknown>>;
  readonly sourceRef: NetworkSourceRef;
}

/**
 * Immutable entity representation of normalization input.
 *
 * Represents raw upstream input entering the normalization flow.
 * All properties are readonly and immutable once constructed.
 */
export class NetworkNormalizationInputEntity {
  /**
   * Classification of the upstream source system.
   * Immutable once constructed.
   */
  readonly sourceKind: NetworkEventSourceKind;

  /**
   * Event identifier from the upstream source system.
   * Immutable once constructed.
   */
  readonly sourceEventId: string;

  /**
   * Timestamp from the upstream source system.
   * Immutable once constructed.
   */
  readonly sourceTimestamp: string;

  /**
   * Domain classification for this event.
   * Immutable once constructed.
   */
  readonly domain: NetworkDomain;

  /**
   * Event type classification.
   * Immutable once constructed.
   */
  readonly eventType: NetworkEventType;

  /**
   * Raw, unprocessed context from upstream source.
   * Immutable once constructed.
   */
  readonly rawContext: Readonly<Record<string, unknown>>;

  /**
   * Source origin reference.
   * Immutable once constructed.
   */
  readonly sourceRef: NetworkSourceRef;

  /**
   * Construct a NetworkNormalizationInputEntity from explicit input.
   *
   * @param input - Fully specified normalization input data
   */
  constructor(input: CreateNetworkNormalizationInputInput) {
    this.sourceKind = input.sourceKind;
    this.sourceEventId = input.sourceEventId;
    this.sourceTimestamp = input.sourceTimestamp;
    this.domain = input.domain;
    this.eventType = input.eventType;
    this.rawContext = input.rawContext;
    this.sourceRef = input.sourceRef;
  }
}

// ============================================================================
// NORMALIZATION RESULT ENTITY
// ============================================================================

/**
 * Constructor input contract for NetworkNormalizationResultEntity.
 * Represents normalized result data required to construct the entity.
 * All fields required (no optional ambiguity).
 */
export interface CreateNetworkNormalizationResultInput {
  readonly networkEvent: NetworkEvent;
  readonly normalizationTimestamp: string;
  readonly normalizationVersion: string;
}

/**
 * Immutable entity representation of normalization result.
 *
 * Represents the normalized canonical output from normalization flow.
 * All properties are readonly and immutable once constructed.
 */
export class NetworkNormalizationResultEntity {
  /**
   * Canonical network event produced by normalization.
   * Immutable once constructed.
   */
  readonly networkEvent: NetworkEvent;

  /**
   * Timestamp when normalization was completed.
   * Immutable once constructed.
   */
  readonly normalizationTimestamp: string;

  /**
   * Version identifier for the normalization process.
   * Immutable once constructed.
   */
  readonly normalizationVersion: string;

  /**
   * Construct a NetworkNormalizationResultEntity from explicit input.
   *
   * @param input - Fully specified normalization result data
   */
  constructor(input: CreateNetworkNormalizationResultInput) {
    this.networkEvent = input.networkEvent;
    this.normalizationTimestamp = input.normalizationTimestamp;
    this.normalizationVersion = input.normalizationVersion;
  }
}

// ============================================================================
// NORMALIZATION ENVELOPE ENTITY
// ============================================================================

/**
 * Constructor input contract for NetworkNormalizationEnvelopeEntity.
 * Represents envelope data required to construct the entity.
 * All fields required (no optional ambiguity).
 */
export interface CreateNetworkNormalizationEnvelopeInput {
  readonly input: NetworkNormalizationInputEntity;
  readonly result: NetworkNormalizationResultEntity;
}

/**
 * Immutable entity representation of normalization envelope.
 *
 * Encapsulates the normalization input and result in a single,
 * immutable, traceable envelope for processing, transport, and logging.
 * All properties are readonly and immutable once constructed.
 */
export class NetworkNormalizationEnvelopeEntity {
  /**
   * Raw input entering the normalization flow.
   * Immutable once constructed.
   */
  readonly input: NetworkNormalizationInputEntity;

  /**
   * Normalized result from the normalization flow.
   * Immutable once constructed.
   */
  readonly result: NetworkNormalizationResultEntity;

  /**
   * Construct a NetworkNormalizationEnvelopeEntity from explicit input.
   *
   * @param input - Fully specified envelope data
   */
  constructor(input: CreateNetworkNormalizationEnvelopeInput) {
    this.input = input.input;
    this.result = input.result;
  }
}
