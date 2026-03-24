/**
 * MOTOR 3 — PHASE 6: NETWORK NORMALIZATION MAPPER
 * Deterministic Mapping Layer
 *
 * Scope:
 * - Mapping structure only
 * - No business logic
 * - No transformation rules
 * - No enrichment
 * - No conditional branching
 * - No validation
 * - No ID generation
 * - No timestamp generation beyond pass-through
 *
 * Purpose:
 * Define a deterministic mapping layer that transforms NetworkNormalizationInput
 * into canonical NetworkEvent using direct field passing.
 */

import type { NetworkNormalizationInput } from '../types/network-normalization.types';
import type { NetworkEvent, NetworkRelatedRefs } from '../types/network-event.types';

// ============================================================================
// NETWORK EVENT MAPPER
// ============================================================================

/**
 * Deterministic mapper from normalization input to canonical network event.
 *
 * Maps NetworkNormalizationInput to NetworkEvent using direct field passing:
 * - No transformations
 * - No mapping logic
 * - No enrichment
 * - No validation
 * - No conditionals
 * - Strict type safety
 *
 * @param input - Normalization input from upstream
 * @returns NetworkEvent - Canonical network event
 */
export function mapToNetworkEvent(input: NetworkNormalizationInput): NetworkEvent {
  const relatedRefs: NetworkRelatedRefs = {};

  return {
    networkEventId: input.sourceEventId,
    domain: input.domain,
    eventType: input.eventType,
    sourceRef: input.sourceRef,
    relatedRefs,
    eventTimestamp: input.sourceTimestamp,
    rawContext: input.rawContext,
  };
}
