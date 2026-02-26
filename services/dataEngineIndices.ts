/**
 * Data Engine Indices Generator
 * Produces actionable business intelligence indices from PartMaster canonical data
 * Used by: Data Engine, Risk Analysis, Dashboard charting
 * 
 * Indices:
 * - priceVolatility01: Price change tracking
 * - supplyStress01: Stock + lead time pressure  
 * - demandPressure01: Part group demand coefficients
 * - trustScore01: Data quality + offer coverage
 */

import { 
  PartMasterSnapshot,
  SupplyHealthIndex,
  StockRiskIndex,
  MarginOpportunityIndex,
  VelocityIndex,
  PartMasterPart,
  PartMasterCatalog,
  SupplierOffer,
} from '../types/partMaster';

export interface PartIndex {
  partMasterId: string;
  sku: string;
  name: string;
  category: string;
  partGroup?: string;
  priceVolatility: number;        // 0-100
  supplyStress: number;            // 0-100
  demandPressure: number;          // 0-100
  trustScore: number;              // 0-100
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DataEngineIndices {
  indexId: string;
  tenantId: string;
  generatedAt: string;
  partCount: number;
  offerCount: number;
  categoryMetrics: Array<{
    category: string;
    partCount: number;
    avgPriceVolatility: number;
    avgSupplyStress: number;
    highRiskCount: number;
  }>;
  topPriceVolatility: PartIndex[];
  topSupplyStress: PartIndex[];
  topDemandPressure: PartIndex[];
  lowTrustScore: PartIndex[];
  averages: {
    priceVolatility: number;
    supplyStress: number;
    demandPressure: number;
    trustScore: number;
  };
}

/**
 * Build Part Indices from catalog + offers (NEW CANONICAL APPROACH)
 */
export function buildPartIndices(
  catalog: PartMasterCatalog,
  offers: SupplierOffer[] = [],
  signals?: any
): DataEngineIndices {
  const indexId = `IDX-${Date.now()}`;
  
  // Process each part
  const partIndices: PartIndex[] = catalog.parts.map(part => {
    const priceVolatility = calculatePriceVolatility(part, offers);
    const supplyStress = calculateSupplyStress(part, offers);
    const demandPressure = calculateDemandPressure(part);
    const trustScore = calculateTrustScore(part, offers);
    
    const avgRisk = (priceVolatility + supplyStress + demandPressure) / 3;
    let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (avgRisk >= 75) riskLevel = 'CRITICAL';
    else if (avgRisk >= 60) riskLevel = 'HIGH';
    else if (avgRisk >= 40) riskLevel = 'MEDIUM';
    
    return {
      partMasterId: part.partMasterId,
      sku: part.sku,
      name: part.name,
      category: part.category,
      partGroup: part.partGroup,
      priceVolatility: Math.round(priceVolatility),
      supplyStress: Math.round(supplyStress),
      demandPressure: Math.round(demandPressure),
      trustScore: Math.round(trustScore),
      riskLevel,
    };
  });

  const byCategory = new Map<string, PartIndex[]>();
  partIndices.forEach(idx => {
    const cat = idx.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(idx);
  });

  const categoryMetrics = Array.from(byCategory.entries()).map(([cat, parts]) => ({
    category: cat,
    partCount: parts.length,
    avgPriceVolatility: Math.round(parts.reduce((s, p) => s + p.priceVolatility, 0) / parts.length),
    avgSupplyStress: Math.round(parts.reduce((s, p) => s + p.supplyStress, 0) / parts.length),
    highRiskCount: parts.filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').length,
  }));

  const topPriceVolatility = [...partIndices].sort((a, b) => b.priceVolatility - a.priceVolatility).slice(0, 10);
  const topSupplyStress = [...partIndices].sort((a, b) => b.supplyStress - a.supplyStress).slice(0, 10);
  const topDemandPressure = [...partIndices].sort((a, b) => b.demandPressure - a.demandPressure).slice(0, 10);
  const lowTrustScore = [...partIndices].sort((a, b) => a.trustScore - b.trustScore).slice(0, 10);

  const averages = {
    priceVolatility: Math.round(partIndices.reduce((s, p) => s + p.priceVolatility, 0) / partIndices.length || 0),
    supplyStress: Math.round(partIndices.reduce((s, p) => s + p.supplyStress, 0) / partIndices.length || 0),
    demandPressure: Math.round(partIndices.reduce((s, p) => s + p.demandPressure, 0) / partIndices.length || 0),
    trustScore: Math.round(partIndices.reduce((s, p) => s + p.trustScore, 0) / partIndices.length || 0),
  };

  console.log(`[Indices] computed: ${partIndices.length} parts | priceVol=${averages.priceVolatility} supplyStress=${averages.supplyStress} trustScore=${averages.trustScore}`);

  return {
    indexId,
    tenantId: catalog.tenantId,
    generatedAt: new Date().toISOString(),
    partCount: partIndices.length,
    offerCount: offers.length,
    categoryMetrics,
    topPriceVolatility,
    topSupplyStress,
    topDemandPressure,
    lowTrustScore,
    averages,
  };
}

function calculatePriceVolatility(part: PartMasterPart, offers: SupplierOffer[]): number {
  const relevantOffers = offers.filter(o => o.partMasterId === part.partMasterId);
  
  if (relevantOffers.length === 0) {
    return part.qualityTier === 'OEM' ? 30 : 50;
  }

  const prices = relevantOffers.map(o => o.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b) / prices.length;
  
  const spread = avgPrice > 0 ? ((maxPrice - minPrice) / avgPrice) * 100 : 0;
  const supplierCount = new Set(relevantOffers.map(o => o.supplierId)).size;
  const supplierStability = Math.max(0, 100 - (supplierCount * 10));
  const tierFactor = part.qualityTier === 'OEM' ? 20 : part.qualityTier === 'PREMIUM' ? 35 : 50;
  
  return Math.min(100, Math.max(0, (spread + tierFactor + supplierStability) / 2.5));
}

function calculateSupplyStress(part: PartMasterPart, offers: SupplierOffer[]): number {
  const relevantOffers = offers.filter(o => o.partMasterId === part.partMasterId);
  
  if (relevantOffers.length === 0) {
    return 45;
  }

  const avgLeadDays = relevantOffers.reduce((s, o) => s + o.leadDays, 0) / relevantOffers.length;
  const leadTimeFactor = Math.min(100, (avgLeadDays / 30) * 100);
  
  const totalStock = relevantOffers.reduce((s, o) => s + o.stock, 0);
  const stockFactor = totalStock === 0 ? 100 : Math.max(10, 100 - (Math.log(totalStock + 1) * 20));
  
  const leadTimes = relevantOffers.map(o => o.leadDays);
  const variance = calculateVariance(leadTimes);
  const varianceFactor = Math.min(100, variance * 2);
  
  return (leadTimeFactor * 0.4 + stockFactor * 0.4 + varianceFactor * 0.2);
}

function calculateDemandPressure(part: PartMasterPart): number {
  const categoryPressure: Record<string, number> = {
    'BRAKE': 75, 'POWERTRAIN': 70, 'TRANSMISSION': 65, 'SUSPENSION': 60,
    'COOLING': 50, 'ELECTRONIC': 55, 'FUEL': 45, 'BODY': 30,
    'LIGHTING': 35, 'INTERIOR': 20, 'AFTERMARKET': 40, 'OTHER': 40,
  };

  const basePressure = categoryPressure[part.category] || 40;
  const tierModifier = part.qualityTier === 'OEM' && part.category === 'BRAKE' ? 1.2 : 1.0;
  const fitmentFactor = part.fitments.length > 3 ? 1.15 : 1.0;
  
  return Math.min(100, basePressure * tierModifier * fitmentFactor);
}

function calculateTrustScore(part: PartMasterPart, offers: SupplierOffer[]): number {
  let score = 50;
  
  if (part.dataQuality) {
    score += (part.dataQuality / 100) * 30;
  }
  
  const avgOemConfidence = part.oemRefs.length > 0
    ? part.oemRefs.reduce((s, ref) => s + (ref.confidence || 50), 0) / part.oemRefs.length
    : 0;
  score += (avgOemConfidence / 100) * 20;
  
  const relevantOffers = offers.filter(o => o.partMasterId === part.partMasterId);
  const offerCoverage = Math.min(100, (relevantOffers.length / 3) * 100);
  score += (offerCoverage / 100) * 20;
  
  const fitmentCompleteness = Math.min(100, (part.fitments.length / 5) * 100);
  score += (fitmentCompleteness / 100) * 20;
  
  if (part.aftermarketRefs.length >= 2) {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b) / values.length;
}

/**
 * Generate Supply Health Index from PM snapshot
 */
export function generateSupplyHealthIndex(snapshot: PartMasterSnapshot): SupplyHealthIndex {
  console.log('[DataEngine] Generating SupplyHealthIndex...');
  
  const suppliers = snapshot.suppliers.map(sup => {
    // Find all parts supplied
    const supplyEdges = snapshot.edges.filter(e => e.supplierId === sup.supplierId);
    const partCount = supplyEdges.length;
    
    // Average lead days and calculate reliability
    const avgLeadDays = supplyEdges.length > 0
      ? Math.round(supplyEdges.reduce((sum, e) => sum + e.leadDays, 0) / supplyEdges.length)
      : 0;
    
    const reliabilityScore = sup.reliabilityScore || 85;
    
    // Calculate volatility from price signals of supplied parts
    const suppliedPartIds = supplyEdges.map(e => e.partId);
    const priceSignals = snapshot.priceSignals.filter(ps => suppliedPartIds.includes(ps.partId));
    const avgVolatility = priceSignals.length > 0
      ? Math.round(priceSignals.reduce((sum, ps) => sum + (ps.volatilityPercent || 0), 0) / priceSignals.length)
      : 0;
    
    // Calculate score: 100 = best (low lead time, high reliability, low volatility)
    const leadTimeScore = Math.max(0, 100 - (avgLeadDays * 5)); // Penalize long lead times
    const volatilityScore = Math.max(0, 100 - avgVolatility);
    const score = Math.round((reliabilityScore + leadTimeScore + volatilityScore) / 3);
    
    return {
      supplierId: sup.supplierId,
      supplierName: sup.name,
      score,
      avgLeadDays,
      reliabilityScore,
      volatilityScore: avgVolatility,
      partCount,
      recentOrderCount: supplyEdges.length,
      onTimeDeliveryPercent: reliabilityScore,
    };
  });
  
  console.log(`[DataEngine] SupplyHealthIndex: ${suppliers.length} suppliers scored`);
  
  return {
    indexId: `SHI-${Date.now()}`,
    tenantId: snapshot.tenantId,
    generatedAt: new Date().toISOString(),
    suppliers,
  };
}

/**
 * Generate Stock Risk Index from PM snapshot
 * Identifies critical, aging, and dead stock situations
 */
export function generateStockRiskIndex(snapshot: PartMasterSnapshot): StockRiskIndex {
  console.log('[DataEngine] Generating StockRiskIndex...');
  
  const riskMatrix = snapshot.parts
    .map(part => {
      const inv = snapshot.inventory.find(i => i.partId === part.partId);
      const sales = snapshot.salesSignals.find(s => s.partId === part.partId);
      
      if (!inv || !sales) return null;
      
      const onHand = inv.onHand || 0;
      const reserved = inv.reserved || 0;
      const available = onHand - reserved;
      const dailyAvg = sales.dailyAverage || 0.1;
      const daysToStockout = Math.round(available / dailyAvg);
      const deadStockRisk = sales.deadStockRisk || 0;
      
      let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      const riskFactors: string[] = [];
      
      // Determine risk level
      if (daysToStockout < 3 && dailyAvg > 1) {
        riskLevel = 'CRITICAL';
        riskFactors.push('imminent_stockout');
      } else if (deadStockRisk > 75) {
        riskLevel = 'CRITICAL';
        riskFactors.push('critical_dead_stock');
      } else if (daysToStockout < 7) {
        riskLevel = 'HIGH';
        riskFactors.push('low_inventory');
      } else if (deadStockRisk > 50) {
        riskLevel = 'HIGH';
        riskFactors.push('high_dead_stock_risk');
      } else if (daysToStockout < 15) {
        riskLevel = 'MEDIUM';
        riskFactors.push('moderate_inventory');
      } else if (onHand > (dailyAvg * 60)) {
        riskLevel = 'MEDIUM';
        riskFactors.push('excess_stock');
      }
      
      // Suggested action
      let suggestedAction = 'MONITOR';
      if (riskLevel === 'CRITICAL') {
        suggestedAction = 'URGENT_REORDER';
      } else if (riskLevel === 'HIGH') {
        suggestedAction = 'REORDER_NEEDED';
      } else if (riskFactors.includes('excess_stock')) {
        suggestedAction = 'REDUCE_ORDERS';
      }
      
      return {
        partId: part.partId,
        partSku: part.sku,
        partName: part.name,
        riskLevel,
        riskFactors,
        suggestedAction,
        daysToStockout: Math.max(0, daysToStockout),
      };
    })
    .filter((item) => item !== null) as Array<{
      partId: string;
      partSku: string;
      partName: string;
      riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      riskFactors: string[];
      suggestedAction: string;
      daysToStockout: number;
    }>;
  
  console.log(`[DataEngine] StockRiskIndex: ${riskMatrix.length} parts analyzed`);
  
  return {
    indexId: `SRI-${Date.now()}`,
    tenantId: snapshot.tenantId,
    generatedAt: new Date().toISOString(),
    riskMatrix,
  };
}

/**
 * Generate Margin Opportunity Index from PM snapshot
 * Identifies high-margin and fast-selling products
 */
export function generateMarginOpportunityIndex(snapshot: PartMasterSnapshot): MarginOpportunityIndex {
  console.log('[DataEngine] Generating MarginOpportunityIndex...');
  
  const opportunities = snapshot.parts
    .map(part => {
      const sales = snapshot.salesSignals.find(s => s.partId === part.partId);
      const edges = snapshot.edges.filter(e => e.partId === part.partId);
      
      if (!sales || edges.length === 0) return null;
      
      // Calculate margin
      const buyPrice = edges.reduce((sum, e) => sum + e.unitPrice, 0) / edges.length;
      const sellPrice = sales.avgPrice || 0;
      const marginPercent = buyPrice > 0 ? Math.round(((sellPrice - buyPrice) / buyPrice) * 100) : 0;
      
      const volume = sales.soldQty || 0;
      const revenue = (sales.soldValue || 0);
      
      // Determine recommendation
      let recommendation = 'MONITOR';
      const marginTrend = sales.marginTrend || 'STABLE';
      
      if (marginPercent > 40 && volume > 50) {
        recommendation = 'PROMOTE';
      } else if (marginPercent > 35) {
        recommendation = 'INCREASE_PRICE';
      } else if (marginPercent < 10 && volume > 100) {
        recommendation = 'OPTIMIZE_COST';
      } else if (marginPercent < 5) {
        recommendation = 'DISCONTINUE';
      }
      
      return {
        partId: part.partId,
        partSku: part.sku,
        partName: part.name,
        marginPercent,
        marginTrend,
        volumeSold30d: volume,
        revenue30d: revenue,
        recommendation,
      };
    })
    .filter((item) => item !== null)
    .sort((a, b) => b.revenue30d - a.revenue30d)
    .slice(0, 50) as any[];
  
  console.log(`[DataEngine] MarginOpportunityIndex: ${opportunities.length} opportunities identified`);
  
  return {
    indexId: `MOI-${Date.now()}`,
    tenantId: snapshot.tenantId,
    generatedAt: new Date().toISOString(),
    opportunities,
  };
}

/**
 * Generate Velocity Index from PM snapshot
 * Segments parts into fast movers, steady sellers, and slow movers
 */
export function generateVelocityIndex(snapshot: PartMasterSnapshot): VelocityIndex {
  console.log('[DataEngine] Generating VelocityIndex...');
  
  // Segment parts by velocity
  const fastMovers = snapshot.parts
    .map(part => {
      const sales = snapshot.salesSignals.find(s => s.partId === part.partId);
      const inv = snapshot.inventory.find(i => i.partId === part.partId);
      
      if (!sales || !inv) return null;
      
      const dailyAvg = sales.dailyAverage || 0.1;
      const onHand = inv.onHand || 0;
      
      // Only include high-velocity items
      if (dailyAvg < 1) return null;
      
      const daysToStockout = Math.round(onHand / dailyAvg);
      const safetyStock = inv.safetyStock || 5;
      const targetStock = Math.round(dailyAvg * 14); // 2 weeks coverage
      
      return {
        partId: part.partId,
        partSku: part.sku,
        daysToStockout,
        daysToReorder: Math.max(0, daysToStockout - 3),
        recommendedOrderQty: Math.max(0, targetStock - onHand),
      };
    })
    .filter((item) => item !== null)
    .sort((a: any, b: any) => a.daysToStockout - b.daysToStockout)
    .slice(0, 20) as any[];
  
  // Slow movers
  const slowMovers = snapshot.parts
    .map(part => {
      const sales = snapshot.salesSignals.find(s => s.partId === part.partId);
      const inv = snapshot.inventory.find(i => i.partId === part.partId);
      
      if (!sales || !inv) return null;
      
      const dailyAvg = sales.dailyAverage || 0.1;
      const onHand = inv.onHand || 0;
      const lastMovedDate = inv.lastMovedDate ? new Date(inv.lastMovedDate) : new Date();
      const lastMovedDaysAgo = Math.floor((Date.now() - lastMovedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Only include low-velocity items with aging stock
      if (dailyAvg > 1 || lastMovedDaysAgo < 30) return null;
      
      let recommendedAction: 'HOLD' | 'DISCOUNT' | 'DISCONTINUE' = 'HOLD';
      if (lastMovedDaysAgo > 180) {
        recommendedAction = 'DISCONTINUE';
      } else if (lastMovedDaysAgo > 90) {
        recommendedAction = 'DISCOUNT';
      }
      
      return {
        partId: part.partId,
        partSku: part.sku,
        lastMovedDaysAgo,
        currentOnHand: onHand,
        recommendedAction,
      };
    })
    .filter((item) => item !== null)
    .sort((a: any, b: any) => b.lastMovedDaysAgo - a.lastMovedDaysAgo)
    .slice(0, 20) as any[];
  
  console.log(`[DataEngine] VelocityIndex: ${fastMovers.length} fast movers, ${slowMovers.length} slow movers`);
  
  return {
    indexId: `VI-${Date.now()}`,
    tenantId: snapshot.tenantId,
    generatedAt: new Date().toISOString(),
    tiers: {
      fastMovers,
      slowMovers,
    },
  };
}

/**
 * Generate all indices simultaneously (batch operation)
 */
export async function generateAllIndices(snapshot: PartMasterSnapshot) {
  console.log('[DataEngine] Generating all indices from PM snapshot...');
  
  return {
    supplyHealth: generateSupplyHealthIndex(snapshot),
    stockRisk: generateStockRiskIndex(snapshot),
    marginOpportunity: generateMarginOpportunityIndex(snapshot),
    velocity: generateVelocityIndex(snapshot),
    generatedAt: new Date().toISOString(),
  };
}
