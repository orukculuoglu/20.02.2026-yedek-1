import type { CompositeRecord } from '../core/composite.types';
import type { CompositeTimelineProjection } from './composite-publisher.types';

/**
 * Build timeline / graph projection from a composite record.
 *
 * Preserves vehicle/fleet context, score state, and temporal information
 * for timeline views and graph projections. No analytics transformations.
 *
 * @param record - Source CompositeRecord
 * @returns CompositeTimelineProjection ready for timeline systems
 */
export function buildCompositeTimelineProjection(
  record: CompositeRecord,
): CompositeTimelineProjection {
  const {
    compositeId,
    compositeType,
    score,
    normalizedScore,
    band,
    severity,
    createdAt,
  } = record;

  // Extract vehicle/fleet context if present
  let vehicleId: string | undefined;
  let fleetId: string | undefined;

  if ('vehicleId' in record) {
    vehicleId = record.vehicleId;
  }
  if ('fleetId' in record) {
    fleetId = record.fleetId;
  }

  return {
    compositeType,
    compositeId,
    vehicleId,
    fleetId,
    score,
    normalizedScore,
    bandLabel: band?.label,
    severity,
    createdAt,
  };
}
