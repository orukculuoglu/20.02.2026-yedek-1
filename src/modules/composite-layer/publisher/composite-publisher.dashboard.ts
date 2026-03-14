import type { CompositeRecord } from '../core/composite.types';
import type { CompositeDashboardProjection } from './composite-publisher.types';

/**
 * Build dashboard summary projection from a composite record.
 *
 * Extracts summary and top drivers from explanation for UI display.
 * Preserves score, confidence, band, and severity information.
 * Maintains deterministic ordering from underlying explanation.
 *
 * @param record - Source CompositeRecord
 * @returns CompositeDashboardProjection ready for dashboard UI
 */
export function buildCompositeDashboardProjection(
  record: CompositeRecord,
): CompositeDashboardProjection {
  const {
    compositeId,
    compositeType,
    normalizedScore,
    confidence,
    band,
    severity,
    explanation,
  } = record;

  // Extract summary and top drivers from explanation
  const summary = explanation?.summary;
  const topDrivers = explanation?.strongestPositiveDrivers ?? [];

  return {
    compositeType,
    compositeId,
    normalizedScore,
    confidence,
    summary,
    topDrivers,
    bandLabel: band?.label,
    severity,
  };
}
