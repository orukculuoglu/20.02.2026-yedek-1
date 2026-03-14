import type { CompositeRecord } from '../core/composite.types';
import type { CompositeSignalProjection } from './composite-publisher.types';

/**
 * Build signal handoff projection from a composite record.
 *
 * This is the minimal canonical form for Signal Engine consumption.
 * No signal generation or semantics are applied here—only field mapping
 * and projection into the handoff shape.
 *
 * @param record - Source CompositeRecord
 * @returns CompositeSignalProjection ready for signal engine
 */
export function buildCompositeSignalProjection(
  record: CompositeRecord,
): CompositeSignalProjection {
  const {
    compositeId,
    compositeType,
    normalizedScore,
    confidence,
    band,
    severity,
    validFrom,
    validTo,
  } = record;

  return {
    compositeType,
    compositeId,
    normalizedScore,
    confidence,
    bandLabel: band?.label,
    severity,
    validFrom,
    validTo,
  };
}
