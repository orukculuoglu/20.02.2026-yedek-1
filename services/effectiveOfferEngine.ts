/**
 * EffectiveOffer Scoring Engine
 * Computes net prices, availability scores, lead time scores, supplier reputation
 * Determines "best offer" and "alternatives" for a given part
 *
 * Single source of truth for offer evaluation across Aftermarket, Bakım Merkezi, DataEngine
 */

import type {
  SupplierOffer,
  EffectiveOffer,
  InstitutionPriceRule,
  OfferRecommendation,
  PartMasterPart,
  Supplier,
} from '../types/partMaster';

// ==================== SCORING CONSTANTS ====================

const PRICE_WEIGHT = 0.40;
const LEAD_TIME_WEIGHT = 0.30;
const STOCK_WEIGHT = 0.20;
const QUALITY_WEIGHT = 0.10;

// Quality tier rankings (for scoring)
const QUALITY_TIER_SCORE: Record<string, number> = {
  OEM: 100,
  OES: 85,
  AFTERMARKET_A: 60,
  AFTERMARKET_B: 30,
};

// ==================== PRICE CALCULATION ====================

/**
 * Calculate net price: list_price - discount + freight
 */
export function calculateNetPrice(
  offer: SupplierOffer,
  rules: InstitutionPriceRule[]
): number {
  // Find matching rule (supplier-specific or fallback to general)
  const rule = rules.find(r => r.supplier_id === offer.supplier_id)
    || rules.find(r => !r.supplier_id);

  if (!rule) {
    // No rule: return list price as-is
    return offer.list_price;
  }

  let netPrice = offer.list_price;

  // Apply discount
  if (rule.discount_pct !== undefined && rule.discount_pct > 0) {
    netPrice = netPrice * (1 - rule.discount_pct / 100);
  }

  // Add freight
  if (rule.freight_flat !== undefined && rule.freight_flat > 0) {
    netPrice += rule.freight_flat;
  }

  return Math.round(netPrice);
}

// ==================== AVAILABILITY SCORE ====================

/**
 * Stock availability score: 0-100
 * 100 = plenty (>100), 0 = out of stock
 */
export function calculateAvailabilityScore(
  offer: SupplierOffer
): number {
  if (offer.stock_on_hand === 0) return 0;
  if (offer.stock_on_hand < 5) return 30;
  if (offer.stock_on_hand < 20) return 60;
  if (offer.stock_on_hand < 100) return 85;
  return 100;
}

// ==================== LEAD TIME SCORE ====================

/**
 * Lead time score: 0-100
 * 100 = 1 day, 0 = 14+ days
 * Logarithmic scale for fairness
 */
export function calculateLeadTimeScore(
  offer: SupplierOffer
): number {
  const days = offer.lead_time_days || 5;
  if (days <= 1) return 100;
  if (days <= 2) return 85;
  if (days <= 3) return 70;
  if (days <= 5) return 50;
  if (days <= 7) return 30;
  if (days <= 14) return 15;
  return 0;
}

// ==================== QUALITY SCORE ====================

/**
 * Quality grade score: 0-100
 * OEM > OES > AFTERMARKET_A > AFTERMARKET_B
 */
export function calculateQualityScore(
  offer: SupplierOffer
): number {
  return QUALITY_TIER_SCORE[offer.quality_grade] || 0;
}

// ==================== PRICE SCORE (RELATIVE) ====================

/**
 * Price score: 0-100
 * Relative to min/max prices in offer list
 * Lowest price = 100, highest = 0
 */
export function calculatePriceScore(
  netPrice: number,
  minPrice: number,
  maxPrice: number
): number {
  if (minPrice === maxPrice) return 50; // All same price
  // Normalized: (max - price) / (max - min)
  const score = ((maxPrice - netPrice) / (maxPrice - minPrice)) * 100;
  return Math.max(0, Math.min(100, score));
}

// ==================== SUPPLIER SCORE ====================

/**
 * Supplier reputation score: 0-100
 * Based on supplier rating (reliability + competitiveness)
 */
export function calculateSupplierScore(
  supplier: Supplier | null
): number {
  if (!supplier) return 50; // Default if supplier not found
  const reliability = supplier.reliabilityScore || 80;
  const competitiveness = supplier.priceCompetitiveness || 75;
  return (reliability + competitiveness) / 2;
}

// ==================== TRUST SCORE ====================

/**
 * Overall trust score: 0-100
 * Weighted average of quality, supplier reliability, and availability
 */
export function calculateTrustScore(
  offer: SupplierOffer,
  qualityScore: number,
  supplierScore: number,
  availabilityScore: number
): number {
  // If out of stock: penalize heavily
  if (offer.stock_on_hand === 0) {
    return (qualityScore * 0.5 + supplierScore * 0.3 + availabilityScore * 0.1) / 0.9;
  }
  
  return (
    qualityScore * 0.4 +
    supplierScore * 0.3 +
    availabilityScore * 0.3
  );
}

// ==================== REASON BADGES ====================

/**
 * Human-readable reason badges for offer selection
 */
export function generateReasonBadges(
  offer: SupplierOffer,
  netPrice: number,
  minPrice: number,
  maxPrice: number,
  selectedAs: 'BEST' | 'ALTERNATIVE' | null
): string[] {
  const badges: string[] = [];

  // Price badges
  if (netPrice === minPrice) {
    badges.push('En ucuz');
  } else if (netPrice <= minPrice * 1.05) {
    badges.push('Uygun fiyat');
  }

  // Quality badges
  if (offer.quality_grade === 'OEM') {
    badges.push('OEM');
  } else if (offer.quality_grade === 'OES') {
    badges.push('OES');
  }

  // Stock badges
  if (offer.stock_on_hand > 0) {
    badges.push('Stok var');
  } else {
    badges.push('Stok yok');
  }

  // Lead time badges
  if (offer.lead_time_days <= 1) {
    badges.push('1 günde terim');
  } else if (offer.lead_time_days <= 2) {
    badges.push('Hızlı terim');
  }

  // Selection badge
  if (selectedAs === 'BEST') {
    badges.push('✓ En iyi');
  } else if (selectedAs === 'ALTERNATIVE') {
    badges.push('☆ Alternatif');
  }

  return badges;
}

// ==================== MAIN COMPUTATION ====================

/**
 * Compute EffectiveOffer for a single offer
 */
export function computeEffectiveOffer(
  offer: SupplierOffer,
  rules: InstitutionPriceRule[],
  supplier: Supplier | null,
  minPrice: number,
  maxPrice: number,
  institutionId: string,
  selectedAs: 'BEST' | 'ALTERNATIVE' | null = null
): EffectiveOffer {
  // Net price after rules
  const net_price = calculateNetPrice(offer, rules);

  // Individual scores
  const score_price = calculatePriceScore(net_price, minPrice, maxPrice);
  const score_lead_time = calculateLeadTimeScore(offer);
  const score_stock = calculateAvailabilityScore(offer);
  const score_quality = calculateQualityScore(offer);
  const score_supplier = calculateSupplierScore(supplier);

  // Weighted total score
  const score_total = Math.round(
    score_price * PRICE_WEIGHT +
    score_lead_time * LEAD_TIME_WEIGHT +
    score_stock * STOCK_WEIGHT +
    score_quality * QUALITY_WEIGHT
  );

  // Trust score (separate, for risk evaluation)
  const trust_score = Math.round(
    calculateTrustScore(offer, score_quality, score_supplier, score_stock)
  );

  // Reason badges
  const reason_badges = generateReasonBadges(
    offer,
    net_price,
    minPrice,
    maxPrice,
    selectedAs
  );

  // Purchasable check
  const purchasable = offer.stock_on_hand > 0;

  return {
    ...offer,
    institution_id: institutionId,
    net_price,
    score_total,
    score_price,
    score_lead_time,
    score_stock,
    score_quality,
    reason_badges,
    purchasable,
  };
}

/**
 * Compute EffectiveOffers for multiple offers (e.g., all offers for a part)
 * Returns best + alternatives
 */
export function computeOfferRecommendation(
  offers: SupplierOffer[],
  rules: InstitutionPriceRule[],
  suppliers: Map<string, Supplier>,
  partMasterId: string,
  institutionId: string
): OfferRecommendation {
  if (offers.length === 0) {
    return {
      part_master_id: partMasterId,
      institution_id: institutionId,
      best: null,
      alternatives: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Calculate net prices for range
  const netPrices = offers.map(o => calculateNetPrice(o, rules));
  const minPrice = Math.min(...netPrices);
  const maxPrice = Math.max(...netPrices);

  // Compute effective offers
  const effectiveOffers = offers.map((offer, idx) => {
    const supplier = suppliers.get(offer.supplier_id) || null;
    return computeEffectiveOffer(
      offer,
      rules,
      supplier,
      minPrice,
      maxPrice,
      institutionId
    );
  });

  // Sort by score_total descending
  const sorted = [...effectiveOffers].sort((a, b) => b.score_total - a.score_total);

  // Best = highest score + purchasable
  const bestIdx = sorted.findIndex(o => o.purchasable);
  const best = bestIdx >= 0 ? { ...sorted[bestIdx], rankingPosition: 1 } : null;

  // Alternatives = top 5 (excluding best)
  const alternatives = sorted
    .filter(o => o.offer_id !== best?.offer_id)
    .slice(0, 5)
    .map((o, idx) => ({
      ...o,
      rankingPosition: idx + 2,
    }));

  return {
    part_master_id: partMasterId,
    institution_id: institutionId,
    best,
    alternatives,
    timestamp: new Date().toISOString(),
  };
}

// ==================== BULK RECOMMENDATION ====================

/**
 * Compute recommendations for multiple parts at once
 */
export function computeBulkRecommendations(
  partOffers: Map<string, SupplierOffer[]>,
  rules: InstitutionPriceRule[],
  suppliers: Map<string, Supplier>,
  institutionId: string
): OfferRecommendation[] {
  const recommendations: OfferRecommendation[] = [];

  partOffers.forEach((offers, partMasterId) => {
    const rec = computeOfferRecommendation(
      offers,
      rules,
      suppliers,
      partMasterId,
      institutionId
    );
    recommendations.push(rec);
  });

  return recommendations;
}
