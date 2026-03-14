import type { CompositeRecord } from '../core/composite.types';
import type { CompositePublicationEnvelope } from './composite-publisher.types';
import { createCompositeProjectionKey } from './composite-publisher.keys';
import { buildCompositeSignalProjection } from './composite-publisher.signal';
import { buildCompositeTimelineProjection } from './composite-publisher.timeline';
import { buildCompositeDashboardProjection } from './composite-publisher.dashboard';

/**
 * Build publication envelope from a composite record.
 *
 * Orchestrates:
 * 1. Projection key generation
 * 2. Signal payload building
 * 3. Timeline payload building
 * 4. Dashboard payload building
 * 5. Final envelope assembly
 *
 * All payloads are deterministic and transport-safe.
 * No side effects or external operations.
 *
 * @param record - Source CompositeRecord
 * @returns CompositePublicationEnvelope ready for downstream systems
 */
export function buildCompositePublicationEnvelope(
  record: CompositeRecord,
): CompositePublicationEnvelope {
  // 1. Create deterministic projection key
  const projectionKey = createCompositeProjectionKey(record);

  // 2. Build signal payload
  const signalPayload = buildCompositeSignalProjection(record);

  // 3. Build timeline payload
  const timelinePayload = buildCompositeTimelineProjection(record);

  // 4. Build dashboard payload
  const dashboardPayload = buildCompositeDashboardProjection(record);

  // 5. Assemble envelope
  const envelope: CompositePublicationEnvelope = {
    projectionKey,
    compositeType: record.compositeType,
    recordId: record.compositeId,
    createdAt: record.createdAt,
    record,
    signalPayload,
    timelinePayload,
    dashboardPayload,
  };

  return envelope;
}
