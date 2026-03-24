/**
 * MOTOR 3 — PHASE 5: NETWORK NORMALIZATION RUNTIME
 * Orchestration Skeleton for Normalization Flow
 *
 * Scope:
 * - Orchestration only
 * - No business logic
 * - No normalization rules
 * - No transformation logic
 * - No data mutation beyond assignment
 * - No ID generation
 * - No timestamp generation
 * - No validation logic
 *
 * Purpose:
 * Define a deterministic, minimal runtime pipeline for the normalization flow
 * using existing entities and contracts.
 */

import type {
  NetworkNormalizationInput,
  NetworkNormalizationResult,
  NetworkNormalizationEnvelope,
} from '../types/network-normalization.types';
import {
  NetworkNormalizationInputEntity,
  NetworkNormalizationResultEntity,
  NetworkNormalizationEnvelopeEntity,
} from '../entities/network-normalization.entity';
import type { NetworkEvent } from '../types/network-event.types';

// ============================================================================
// NORMALIZATION RUNTIME FUNCTION
// ============================================================================

/**
 * Deterministic normalization orchestration function.
 *
 * Orchestrates the normalization flow by:
 * 1. Creating a NetworkNormalizationInputEntity from raw input
 * 2. Creating a NetworkNormalizationResultEntity with canonical event
 * 3. Creating a NetworkNormalizationEnvelopeEntity combining both
 * 4. Returning the envelope as a plain contract object
 *
 * This function is pure and deterministic:
 * - No side effects beyond object construction
 * - No validation
 * - No transformation
 * - No ID or timestamp generation
 * - All inputs explicitly provided
 *
 * @param input - Raw normalization input from upstream
 * @param networkEvent - Canonical network event (pre-constructed)
 * @returns NetworkNormalizationEnvelope - Plain contract object
 */
export function normalizeNetworkEvent(
  input: NetworkNormalizationInput,
  networkEvent: NetworkEvent
): NetworkNormalizationEnvelope {
  // Step 1: Create NetworkNormalizationInputEntity from input
  const inputEntity = new NetworkNormalizationInputEntity({
    sourceKind: input.sourceKind,
    sourceEventId: input.sourceEventId,
    sourceTimestamp: input.sourceTimestamp,
    domain: input.domain,
    eventType: input.eventType,
    rawContext: input.rawContext,
    sourceRef: input.sourceRef,
  });

  // Step 2: Create NetworkNormalizationResultEntity
  const resultEntity = new NetworkNormalizationResultEntity({
    networkEvent,
    normalizationTimestamp: input.sourceTimestamp,
    normalizationVersion: '1.0.0',
  });

  // Step 3: Create NetworkNormalizationEnvelopeEntity
  const envelopeEntity = new NetworkNormalizationEnvelopeEntity({
    input: inputEntity,
    result: resultEntity,
  });

  // Step 4: Return envelope as plain contract object
  return {
    input: {
      sourceKind: envelopeEntity.input.sourceKind,
      sourceEventId: envelopeEntity.input.sourceEventId,
      sourceTimestamp: envelopeEntity.input.sourceTimestamp,
      domain: envelopeEntity.input.domain,
      eventType: envelopeEntity.input.eventType,
      rawContext: envelopeEntity.input.rawContext,
      sourceRef: envelopeEntity.input.sourceRef,
    },
    result: {
      networkEvent: envelopeEntity.result.networkEvent,
      normalizationTimestamp: envelopeEntity.result.normalizationTimestamp,
      normalizationVersion: envelopeEntity.result.normalizationVersion,
    },
  };
}
