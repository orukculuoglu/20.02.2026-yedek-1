/**
 * MOTOR 3 — PHASE 3: NETWORK NORMALIZATION CONTRACT
 * Type Contracts for Normalization Flow
 *
 * Scope:
 * - Contract definitions only
 * - No normalization logic
 * - No aggregation logic
 * - No orchestration
 * - No factories
 * - No guards
 * - No runtime behavior
 *
 * Purpose:
 * Define the type contracts for the normalization flow
 * that transforms raw upstream events into canonical network events.
 */

import type {
  NetworkDomain,
  NetworkEventType,
  NetworkSourceRef,
  NetworkEventSourceKind,
} from './network-foundation.types';
import type { NetworkEvent } from './network-event.types';

// ============================================================================
// NORMALIZATION INPUT CONTRACT
// ============================================================================

/**
 * Represents raw upstream input entering the normalization flow.
 *
 * This contract captures untransformed data from upstream sources
 * (Motor 2, external feeds, work order systems) before normalization.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkNormalizationInput {
  /**
   * Classification of the upstream source system.
   * Indicates which system produced the raw event.
   */
  readonly sourceKind: NetworkEventSourceKind;

  /**
   * Event identifier from the upstream source system.
   * Original source event ID (not normalized).
   */
  readonly sourceEventId: string;

  /**
   * Timestamp from the upstream source system.
   * As ISO 8601 string representing when event occurred.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly sourceTimestamp: string;

  /**
   * Domain classification for this event.
   * Which business domain the event belongs to.
   */
  readonly domain: NetworkDomain;

  /**
   * Event type classification.
   * What kind of state change or event occurred.
   */
  readonly eventType: NetworkEventType;

  /**
   * Raw, unprocessed context from upstream source.
   * Contains original event payload without transformation.
   * Structure determined by originating system.
   */
  readonly rawContext: Readonly<Record<string, unknown>>;

  /**
   * Source origin reference.
   * Maintains complete traceability of event source.
   */
  readonly sourceRef: NetworkSourceRef;
}

// ============================================================================
// NORMALIZATION RESULT CONTRACT
// ============================================================================

/**
 * Represents the normalized canonical output from normalization flow.
 *
 * This contract captures the result of normalizing raw upstream input
 * into the canonical NetworkEvent structure.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkNormalizationResult {
  /**
   * Canonical network event produced by normalization.
   * Fully normalized and contracted event ready for downstream processing.
   */
  readonly networkEvent: NetworkEvent;

  /**
   * Timestamp when normalization was completed.
   * As ISO 8601 string representing when normalization occurred.
   * Format: YYYY-MM-DDTHH:mm:ss.sssZ
   */
  readonly normalizationTimestamp: string;

  /**
   * Version identifier for the normalization process.
   * Indicates which normalization schema/version was applied.
   * Format: SEMVER (e.g., "1.0.0")
   */
  readonly normalizationVersion: string;
}

// ============================================================================
// NORMALIZATION ENVELOPE CONTRACT
// ============================================================================

/**
 * Represents a transport-safe structure for normalization processing.
 *
 * Encapsulates the normalization input and result in a single,
 * immutable, traceable envelope for processing, transport, and logging.
 *
 * Immutable contract: all fields readonly.
 */
export interface NetworkNormalizationEnvelope {
  /**
   * Raw input entering the normalization flow.
   * Untransformed upstream data.
   */
  readonly input: NetworkNormalizationInput;

  /**
   * Normalized result from the normalization flow.
   * Canonical network event and normalization metadata.
   */
  readonly result: NetworkNormalizationResult;
}
