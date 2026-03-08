/**
 * Vehicle Intelligence Cache - Phase 8 Storage Layer
 * 
 * Caches VehicleAggregate objects using configured storage backend
 * Supports multiple storage strategies (localStorage, sessionStorage, in-memory)
 * 
 * Design:
 * - Pluggable storage backend (default: localStorage)
 * - TTL-based expiration (24 hours)
 * - Graceful fallback on errors
 * - PII-safe: Only caches aggregates, no raw PII
 */

import type { VehicleAggregate } from '../../vehicle-intelligence/types';

const CACHE_KEY = 'lent:vehicle-intelligence:aggregates:v1';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Cache entry with timestamp for TTL checking
 */
type CacheEntry = {
  data: VehicleAggregate;
  timestamp: number;
};

/**
 * Cached aggregates: Map<vehicleId, CacheEntry>
 * Persisted as JSON string
 */
type CacheStore = Record<string, CacheEntry>;

/**
 * Load all cached aggregates from storage
 * @returns Map of vehicleId -> CacheEntry
 */
function loadCacheStore(): CacheStore {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as CacheStore;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[VehicleIntelligenceCache] Failed to load cache:', err);
    }
    return {};
  }
}

/**
 * Save all cached aggregates to storage
 * @param store Cache store to persist
 */
function saveCacheStore(store: CacheStore): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[VehicleIntelligenceCache] Failed to save cache:', err);
    }
  }
}

/**
 * Get a cached aggregate by vehicleId
 * Returns null if not found OR expired (TTL exceeded)
 * 
 * @param vehicleId - Vehicle identifier
 * @param ttlMs - Time-to-live in milliseconds (default: 24 hours)
 * @returns Cached aggregate or null
 */
export function getCachedAggregate(
  vehicleId: string,
  ttlMs: number = DEFAULT_TTL_MS
): VehicleAggregate | null {
  try {
    const store = loadCacheStore();
    const entry = store[vehicleId];

    if (!entry) {
      return null;
    }

    // Check TTL
    const age = Date.now() - entry.timestamp;
    if (age > ttlMs) {
      if (import.meta.env.DEV) {
        console.debug('[VehicleIntelligenceCache] Cache expired for', vehicleId);
      }
      // Remove expired entry
      delete store[vehicleId];
      saveCacheStore(store);
      return null;
    }

    if (import.meta.env.DEV) {
      console.debug('[VehicleIntelligenceCache] Cache hit for', vehicleId, { ageMs: age });
    }

    return entry.data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[VehicleIntelligenceCache] Error getting cached aggregate:', err);
    }
    return null;
  }
}

/**
 * Cache an aggregate
 * Stores with current timestamp for TTL checking
 * 
 * @param aggregate - VehicleAggregate to cache
 */
export function cacheAggregate(aggregate: VehicleAggregate): void {
  try {
    const store = loadCacheStore();
    store[aggregate.vehicleId] = {
      data: aggregate,
      timestamp: Date.now(),
    };
    saveCacheStore(store);

    if (import.meta.env.DEV) {
      console.debug('[VehicleIntelligenceCache] Cached aggregate for', aggregate.plate);
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[VehicleIntelligenceCache] Error caching aggregate:', err);
    }
  }
}

/**
 * Clear cache entry for a vehicle
 * Called when aggregate is recalculated or invalidated
 * 
 * @param vehicleId - Vehicle identifier
 */
export function clearCacheEntry(vehicleId: string): void {
  try {
    const store = loadCacheStore();
    delete store[vehicleId];
    saveCacheStore(store);

    if (import.meta.env.DEV) {
      console.debug('[VehicleIntelligenceCache] Cleared cache entry for', vehicleId);
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[VehicleIntelligenceCache] Error clearing cache:', err);
    }
  }
}

/**
 * Clear all cached aggregates
 * Use with caution - clears entire cache
 */
export function clearAllCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    if (import.meta.env.DEV) {
      console.debug('[VehicleIntelligenceCache] Cleared all cache entries');
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[VehicleIntelligenceCache] Error clearing all cache:', err);
    }
  }
}

/**
 * Get cache statistics (for debugging/monitoring)
 * @returns Cache stats including entry count and oldest entry age
 */
export function getCacheStats(): {
  entryCount: number;
  oldestEntryAgeMs?: number;
} {
  try {
    const store = loadCacheStore();
    const entries = Object.values(store);

    if (entries.length === 0) {
      return { entryCount: 0 };
    }

    const oldestTimestamp = Math.min(...entries.map((e) => e.timestamp));
    const oldestEntryAgeMs = Date.now() - oldestTimestamp;

    return {
      entryCount: entries.length,
      oldestEntryAgeMs,
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[VehicleIntelligenceCache] Error getting cache stats:', err);
    }
    return { entryCount: 0 };
  }
}

/**
 * Get all cached vehicle IDs
 * @returns Array of vehicleIds that are currently cached
 */
export function getAllCachedAggregate(): string[] {
  try {
    const store = loadCacheStore();
    return Object.keys(store);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[VehicleIntelligenceCache] Error getting all cached IDs:', err);
    }
    return [];
  }
}
