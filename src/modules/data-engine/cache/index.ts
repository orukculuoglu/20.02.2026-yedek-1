/**
 * Data Engine - Cache Module
 * Handles Vehicle Intelligence aggregate caching with TTL support
 */

export {
  getCachedAggregate,
  cacheAggregate,
  clearCacheEntry,
  clearAllCache,
  getCacheStats,
  getAllCachedAggregate,
} from './vehicleIntelligenceCache';
