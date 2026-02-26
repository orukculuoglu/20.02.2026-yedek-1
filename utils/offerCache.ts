import { EffectiveOffer, OfferRecommendation } from '../types/partMaster';

interface CacheEntry {
  data: OfferRecommendation;
  timestamp: number;
}

class OfferRecommendationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(partMasterId: string, institutionId: string): string {
    return `${partMasterId}:${institutionId}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.TTL_MS;
  }

  get(partMasterId: string, institutionId: string): OfferRecommendation | null {
    const key = this.getCacheKey(partMasterId, institutionId);
    const entry = this.cache.get(key);

    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    console.log('[OfferCache] Cache hit:', key);
    return entry.data;
  }

  set(partMasterId: string, institutionId: string, data: OfferRecommendation): void {
    const key = this.getCacheKey(partMasterId, institutionId);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    console.log('[OfferCache] Cache set:', key);
  }

  clear(): void {
    this.cache.clear();
    console.log('[OfferCache] Cache cleared');
  }

  getSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const offerCache = new OfferRecommendationCache();
