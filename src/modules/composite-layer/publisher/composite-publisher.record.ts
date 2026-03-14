import type { CompositeRecord } from '../core/composite.types';
import type { CompositePublicationResult } from './composite-publisher.types';
import { buildCompositePublicationEnvelope } from './composite-publisher.envelope';

/**
 * Publish a composite record for downstream consumption.
 *
 * Wraps the fully-built record in a deterministic publication envelope.
 * No side effects, persistence, or external operations.
 *
 * @param record - Source CompositeRecord
 * @returns CompositePublicationResult containing publication envelope
 */
export function publishCompositeRecord(
  record: CompositeRecord,
): CompositePublicationResult {
  const envelope = buildCompositePublicationEnvelope(record);

  return {
    envelope,
  };
}
