import type { CompositeRecord } from '../core/composite.types';

/**
 * Generate deterministic projection key for a composite record.
 *
 * Format: composite:{compositeType}:{vehicleOrFleetOrGlobal}:{createdAt}
 *
 * Determinism rules:
 * - Use vehicleId if present
 * - Else use fleetId if present
 * - Else use GLOBAL
 * - Resulting string is stable across multiple invocations
 *
 * @param record - Source CompositeRecord
 * @returns Deterministic projection key string
 */
export function createCompositeProjectionKey(record: CompositeRecord): string {
  const { compositeType, createdAt } = record;

  // Determine context: vehicle ID, fleet ID, or global
  let context: string;
  if ('vehicleId' in record && record.vehicleId) {
    context = record.vehicleId;
  } else if ('fleetId' in record && record.fleetId) {
    context = record.fleetId;
  } else {
    context = 'GLOBAL';
  }

  return `composite:${compositeType}:${context}:${createdAt}`;
}
