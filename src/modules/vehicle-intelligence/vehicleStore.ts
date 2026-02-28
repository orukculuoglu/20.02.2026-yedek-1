/**
 * Vehicle Intelligence Module - Vehicle Store
 * Persists VehicleAggregate to localStorage
 */

import type { VehicleAggregate } from './types';
import { buildVehicleAggregate, rebuildVehicleAggregate } from './vehicleAggregator';

const STORAGE_KEY = 'lent:vehicle-intelligence:aggregates:v1';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Load a VehicleAggregate from storage
 */
function load(vehicleId: string): VehicleAggregate | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const aggregates: Record<string, { data: VehicleAggregate; timestamp: number }> =
      JSON.parse(stored);
    const entry = aggregates[vehicleId];

    if (!entry) return null;

    // Check if cache is still valid (< 24 hours)
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_DURATION_MS) {
      console.log(`[VehicleStore] Cache expired for ${vehicleId}, will rebuild`);
      return null; // Force rebuild
    }

    console.log(`[VehicleStore] ✓ Loaded cached aggregate for ${vehicleId}`);
    return entry.data;
  } catch (err) {
    console.error('[VehicleStore] Error loading aggregate:', err);
    return null;
  }
}

/**
 * Save a VehicleAggregate to storage
 */
function save(aggregate: VehicleAggregate): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || '{}';
    const aggregates: Record<string, { data: VehicleAggregate; timestamp: number }> =
      JSON.parse(stored);

    aggregates[aggregate.vehicleId] = {
      data: aggregate,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(aggregates));
    console.log(`[VehicleStore] ✓ Saved aggregate for ${aggregate.plate}`);
  } catch (err) {
    console.error('[VehicleStore] Error saving aggregate:', err);
  }
}

/**
 * Get or build a VehicleAggregate
 * Returns cached version if valid, otherwise builds and caches
 * Now async to support both mock and API data providers
 */
export async function getOrBuild(
  vehicleId: string,
  vin: string,
  plate: string
): Promise<VehicleAggregate> {
  try {
    // Try to load from cache
    const cached = load(vehicleId);
    if (cached) return cached;

    console.log(`[VehicleStore] Cache miss for ${plate}, building new aggregate...`);

    // Build new aggregate (now async)
    const aggregate = await buildVehicleAggregate(vehicleId, vin, plate);

    // Save to cache
    save(aggregate);

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
 */
export async function rebuild(
  vehicleId: string,
  vin: string,
  plate: string
): Promise<VehicleAggregate> {
  try {
    const aggregate = await buildVehicleAggregate(vehicleId, vin, plate);
    save(aggregate);
    return aggregate;
  } catch (err) {
    console.error('[VehicleStore] Error rebuilding:', err);
    throw err;
  }
}

/**
 * Clear all vehicle aggregates from storage
 */
export function clear(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[VehicleStore] ✓ Cleared all vehicle aggregates');
  } catch (err) {
    console.error('[VehicleStore] Error clearing:', err);
  }
}

/**
 * Get all cached vehicle IDs
 */
export function getAllCachedIds(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const aggregates = JSON.parse(stored) as Record<
      string,
      { data: VehicleAggregate; timestamp: number }
    >;
    return Object.keys(aggregates);
  } catch (err) {
    console.error('[VehicleStore] Error getting cached IDs:', err);
    return [];
  }
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
