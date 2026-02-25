/**
 * Data Engine Indices Generator
 * Produces actionable business intelligence indices from PartMaster canonical data
 * Used by: Data Engine, Risk Analysis, Dashboard charting
 */

import { 
  PartMasterSnapshot,
  SupplyHealthIndex,
  StockRiskIndex,
  MarginOpportunityIndex,
  VelocityIndex,
} from '../types/partMaster';

/**
 * Generate Supply Health Index from PM snapshot
 * Scores suppliers based on lead times, reliability, volatility
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
