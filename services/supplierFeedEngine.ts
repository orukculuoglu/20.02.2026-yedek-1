import type { SupplierPriceFeed } from '../types/partMaster';

/**
 * Supplier Feed Engine
 * 
 * Manages real-time price/stock feeds from suppliers
 * Replaces manual seed data with dynamic updates
 * 
 * Rules:
 * - valid_until < now → not purchasable
 * - stock_on_hand = 0 → can show in alternatives but not best offer
 * - Latest sync per (supplier_id, part_master_id) wins
 * - Expired records stay in DB but marked inactive
 */

// In-memory storage for demo (replaces DB in production)
let SUPPLIER_FEEDS: SupplierPriceFeed[] = [];

/**
 * Load all feeds from seed data (on startup)
 */
export async function initializeFeed(): Promise<void> {
  try {
    const { MOCK_SUPPLIER_FEEDS } = await import('./supplierFeed.seed');
    SUPPLIER_FEEDS = [...MOCK_SUPPLIER_FEEDS];
    console.log(`[FeedEngine] Initialized with ${SUPPLIER_FEEDS.length} feed records`);
  } catch (error) {
    console.error('[FeedEngine] Failed to initialize feeds', error);
  }
}

/**
 * Sync supplier feed
 * 
 * Behavior:
 * - Loads fresh feed for supplier
 * - Marks expired records (valid_until < now) as inactive
 * - Replaces old records with same part_id
 * - Calculates effective_price
 * 
 * @param supplierId - Supplier to sync
 * @returns Stats: { updated_records, expired_records }
 */
export async function syncSupplierFeed(supplierId: string): Promise<{
  success: boolean;
  supplier_id: string;
  updated_records: number;
  expired_records: number;
  timestamp: string;
}> {
  try {
    const now = new Date();
    const { MOCK_SUPPLIER_FEEDS } = await import('./supplierFeed.seed');
    
    // Get fresh feeds for this supplier from seed
    const freshFeeds = MOCK_SUPPLIER_FEEDS.filter(f => f.supplier_id === supplierId);
    
    console.log(`[FeedEngine] Syncing ${freshFeeds.length} records for supplier=${supplierId}`);
    
    // Remove old records for this supplier
    SUPPLIER_FEEDS = SUPPLIER_FEEDS.filter(f => f.supplier_id !== supplierId);
    
    // Add fresh records and calculate effective_price
    let expiredCount = 0;
    freshFeeds.forEach(feed => {
      const validUntil = new Date(feed.valid_until);
      const isExpired = validUntil < now;
      
      if (isExpired) {
        expiredCount++;
      }
      
      const calculatedFeed: SupplierPriceFeed = {
        ...feed,
        is_active: !isExpired,
        effective_price: feed.list_price * (1 - feed.discount_pct / 100) + feed.freight_cost,
        last_sync_at: now.toISOString(),
      };
      
      SUPPLIER_FEEDS.push(calculatedFeed);
    });
    
    console.log(`[FeedEngine] ✓ Synced ${freshFeeds.length} records (${expiredCount} expired)`);
    
    return {
      success: true,
      supplier_id: supplierId,
      updated_records: freshFeeds.length - expiredCount,
      expired_records: expiredCount,
      timestamp: now.toISOString(),
    };
  } catch (error) {
    console.error('[FeedEngine] Sync failed', error);
    return {
      success: false,
      supplier_id: supplierId,
      updated_records: 0,
      expired_records: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get active feed for a part from specific supplier
 * 
 * Returns null if:
 * - Record expired (valid_until < now)
 * - Not found
 * 
 * @param partMasterId - Part ID
 * @param supplierId - Supplier ID
 * @returns Active feed or null
 */
export async function getActiveFeedByPart(
  partMasterId: string,
  supplierId: string
): Promise<SupplierPriceFeed | null> {
  const now = new Date();
  
  const feed = SUPPLIER_FEEDS.find(
    f =>
      f.part_master_id === partMasterId &&
      f.supplier_id === supplierId &&
      f.is_active === true
  );
  
  if (!feed) {
    console.warn(`[FeedEngine] No active feed for part=${partMasterId}, supplier=${supplierId}`);
    return null;
  }
  
  // Check expiration
  const validUntil = new Date(feed.valid_until);
  if (validUntil < now) {
    console.warn(`[FeedEngine] Feed expired at ${feed.valid_until}`);
    return null;
  }
  
  return feed;
}

/**
 * Get all active feeds for a part (from all suppliers)
 * 
 * Filters out:
 * - Expired records
 * - Inactive records
 * 
 * @param partMasterId - Part ID
 * @returns Array of active feeds, sorted by effective_price ASC
 */
export async function getActiveFeedsForPart(
  partMasterId: string
): Promise<SupplierPriceFeed[]> {
  const now = new Date();
  
  console.log(`[FeedEngine] getActiveFeedsForPart: part=${partMasterId}, total_feeds=${SUPPLIER_FEEDS.length}, today=${now.toISOString().split('T')[0]}`);
  
  const activeFeeds = SUPPLIER_FEEDS.filter(f => {
    if (f.part_master_id !== partMasterId) return false;
    if (f.is_active === false) return false;
    
    const validUntil = new Date(f.valid_until);
    const isValid = validUntil >= now;
    
    if (!isValid) {
      console.log(`[FeedEngine] Feed ${f.id} expired: ${f.valid_until} < ${now.toISOString()}`);
    }
    
    return isValid; // Not expired
  });
  
  console.log(`[FeedEngine] getActiveFeedsForPart result: found ${activeFeeds.length} feeds for ${partMasterId}`);
  
  // Sort by effective price (best price first)
  return activeFeeds.sort((a, b) => (a.effective_price || 0) - (b.effective_price || 0));
}

/**
 * Get feed statistics
 * 
 * @param supplierId - Optional supplier filter
 * @returns { total, active, expired, by_quality_grade }
 */
export async function getFeedStats(supplierId?: string) {
  const now = new Date();
  
  let filtered = supplierId
    ? SUPPLIER_FEEDS.filter(f => f.supplier_id === supplierId)
    : SUPPLIER_FEEDS;
  
  const stats = {
    total: filtered.length,
    active: 0,
    expired: 0,
    by_quality_grade: {
      OEM: 0,
      OES: 0,
      AFTERMARKET_A: 0,
      AFTERMARKET_B: 0,
    },
  };
  
  filtered.forEach(feed => {
    const validUntil = new Date(feed.valid_until);
    const isExpired = validUntil < now;
    
    if (isExpired) {
      stats.expired++;
    } else {
      stats.active++;
    }
    
    // @ts-ignore - quality_grade is a key in stats
    stats.by_quality_grade[feed.quality_grade]++;
  });
  
  return stats;
}

/**
 * Manually add/update a feed record
 * Used for MANUAL source entries
 */
export async function upsertFeed(feed: SupplierPriceFeed): Promise<SupplierPriceFeed> {
  // Calculate effective price
  const calculatedFeed: SupplierPriceFeed = {
    ...feed,
    effective_price: feed.list_price * (1 - feed.discount_pct / 100) + feed.freight_cost,
  };
  
  // Remove existing record if present
  SUPPLIER_FEEDS = SUPPLIER_FEEDS.filter(
    f =>
      !(f.part_master_id === feed.part_master_id && f.supplier_id === feed.supplier_id)
  );
  
  SUPPLIER_FEEDS.push(calculatedFeed);
  
  console.log(`[FeedEngine] Upserted feed: ${feed.supplier_id} / ${feed.part_master_id}`);
  
  return calculatedFeed;
}

/**
 * Get all feeds (admin/debug)
 */
export function getAllFeeds(): SupplierPriceFeed[] {
  return SUPPLIER_FEEDS;
}
