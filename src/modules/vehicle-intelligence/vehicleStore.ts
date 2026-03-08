/**
 * Vehicle Intelligence Module - Vehicle Store
 * Legacy entry point for aggregate caching
 * Now delegates to data-engine/cache/vehicleIntelligenceCache
 */

import type { VehicleAggregate } from './types';
import { buildVehicleAggregate, emitRecalculationEvents } from './vehicleAggregator';
import {
  getCachedAggregate,
  cacheAggregate,
  clearAllCache,
  getAllCachedAggregate,
} from '../data-engine/cache/vehicleIntelligenceCache';

/**
 * Get or build a VehicleAggregate
 * Returns cached version if valid, otherwise builds and caches
 * Now delegates to vehicleIntelligenceCache module
 */
export async function getOrBuild(
  vehicleId: string,
  vin: string,
  plate: string
): Promise<VehicleAggregate> {
  try {
    // Try to load from cache module
    const cached = getCachedAggregate(vehicleId);
    if (cached) return cached;

    console.log(`[VehicleStore] Cache miss for ${plate}, building new aggregate...`);

    // Build new aggregate
    const aggregate = await buildVehicleAggregate(vehicleId, vin, plate);

    // Save using cache module
    cacheAggregate(aggregate);

    return aggregate;
  } catch (err) {
    console.error('[VehicleStore] Error in getOrBuild:', err);

    // Fallback: return minimal aggregate
    return {
      vehicleId,
      vin,
      plate,
      timestamp: new Date().toISOString(),
      dataSources: {
        kmHistory: [],
        obdRecords: [],
        insuranceRecords: [],
        damageRecords: [],
        serviceRecords: [],
      },
      derived: {
        odometerAnomaly: false,
        kmIntelligence: {
          hasRollback: false,
          rollbackSeverity: 0,
          rollbackEvidenceCount: 0,
          volatilityScore: 0,
          usageClass: 'normal',
        },
        serviceGapScore: 0,
        serviceDiscipline: {
          timeGapScore: 0,
          kmGapScore: 0,
          regularityScore: 0,
          disciplineScore: 0,
        },
        obdIntelligence: {
          totalFaultCount: 0,
          uniqueFaultCodes: 0,
          categoryBreakdown: {
            engine: 0,
            transmission: 0,
            emission: 0,
            electrical: 0,
            brake: 0,
            other: 0,
          },
          highestSeverity: 'low',
          repeatedFaults: [],
          severityScore: 0,
        },
        insuranceDamageCorrelation: {
          claimCount: 0,
          damageCount: 0,
          matchedEvents: 0,
          mismatchType: 'none',
          correlationScore: 0,
        },
        structuralRisk: 0,
        mechanicalRisk: 0,
        insuranceRisk: 0,
      },
      indexes: {
        trustIndex: 50,
        reliabilityIndex: 50,
        maintenanceDiscipline: 50,
      },
      insightSummary: 'Veri toplanırken hata oluştu.',
    };
  }
}

/**
 * Rebuild and resave an aggregate (refresh)
 * Now delegates to vehicleIntelligenceCache module
 * Emits recalculation events to trigger snapshot/index/signal recomputation
 */
export async function rebuild(
  vehicleId: string,
  vin: string,
  plate: string
): Promise<VehicleAggregate> {
  try {
    const aggregate = await buildVehicleAggregate(vehicleId, vin, plate);
    cacheAggregate(aggregate);
    
    // Emit recalculation events to trigger snapshot pipeline update
    // Fire-and-forget: Does not block UI update
    emitRecalculationEvents(aggregate).catch(err => {
      console.error('[VehicleStore] Error emitting recalculation events:', err);
    });
    
    return aggregate;
  } catch (err) {
    console.error('[VehicleStore] Error rebuilding:', err);
    throw err;
  }
}

/**
 * Clear all vehicle aggregates from storage
 * Now delegates to vehicleIntelligenceCache module
 */
export function clear(): void {
  clearAllCache();
}

/**
 * Get all cached vehicle IDs
 * Now delegates to vehicleIntelligenceCache module
 */
export function getAllCachedIds(): string[] {
  return getAllCachedAggregate();
}

/**
 * Export store as object (for testing/debugging)
 */
export const vehicleIntelligenceStore = {
  getOrBuild,
  rebuild,
  clear,
  getAllCachedIds,
};
