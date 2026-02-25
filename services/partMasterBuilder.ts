/**
 * PartMasterBuilder - Canonical SKU Registry
 * Single source of truth for parts across ERP/Excel/Manual/B2B/Mock
 * Normalization + Merge Strategies
 */

import { PartMasterItem, PartDataSource, PartMasterCategory } from '../types';
import { B2BNetworkState, B2BPart } from '../types';

const generatePartId = (sku: string, tenantId: string): string => {
  return `${tenantId}-${sku}`.replace(/[^a-zA-Z0-9-]/g, '');
};

/**
 * Build PartMaster from ERP data
 */
export function buildFromERP(erpItems: any[], tenantId: string): PartMasterItem[] {
  console.log('[PartMaster] Build from ERP:', erpItems.length, 'items');
  
  if (!erpItems.length) return [];
  
  return erpItems.map(item => ({
    partId: generatePartId(item.sku || item.id, tenantId),
    sku: item.sku || item.id,
    name: item.name || item.description || 'Unknown',
    brand: item.brand || 'Generic',
    category: item.category || 'aftermarket',
    
    oemRefs: item.oemRefs || item.oem_references || [],
    crossRefs: item.crossRefs || item.equivalent_parts || [],
    tags: item.tags || [],
    
    unit: item.unit || item.uom || 'adet',
    packSize: item.packSize || item.pack_qty || 1,
    
    pricing: {
      buy: item.costPrice || item.cost || 0,
      sell: item.salePrice || item.price || 0,
      currency: item.currency || 'TRY',
      updatedAt: item.priceUpdatedAt || new Date().toISOString(),
    },
    
    inventory: {
      onHand: item.qtyOnHand || item.stock || 0,
      reserved: item.qtyReserved || item.reserved || 0,
      incoming: item.qtyIncoming || item.inTransit || 0,
      leadDays: item.leadDays || item.lead_time_days || 7,
      warehouseId: item.warehouseId,
      updatedAt: item.inventoryUpdatedAt || new Date().toISOString(),
    },
    
    demandSignals: {
      dailyAvg30d: (item.sales30d || 0) / 30 || 0.1,
      weeklyTrend: item.trend || 'STABLE',
      deadStockRisk30d: calculateDeadStockRisk(item.sales30d || 0, item.qtyOnHand || 0),
      turnover30d: item.sales30d || 0,
      coverageDays: calculateCoverageDays(item.qtyOnHand || 0, item.sales30d || 0),
    },
    
    source: 'ERP',
    tenantId,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: item.updatedBy || 'ERP_SYNC',
  }));
}

/**
 * Build PartMaster from Excel/CSV
 */
export function buildFromExcel(excelRows: any[], tenantId: string): PartMasterItem[] {
  console.log('[PartMaster] Build from Excel:', excelRows.length, 'rows');
  
  if (!excelRows.length) return [];
  
  return excelRows.map(row => ({
    partId: generatePartId(row.sku || row.code, tenantId),
    sku: row.sku || row.code || '',
    name: row.name || row.description || row.part_name || '',
    brand: row.brand || row.manufacturer || 'Generic',
    category: row.category || 'aftermarket',
    
    oemRefs: (row.oem_refs || row.oemRefs || '').split(',').filter((x: string) => x.trim()),
    crossRefs: (row.cross_refs || row.crossRefs || '').split(',').filter((x: string) => x.trim()),
    tags: (row.tags || '').split(',').filter((x: string) => x.trim()),
    
    unit: row.unit || row.uom || 'adet',
    packSize: parseInt(row.pack_size || row.packSize || '1'),
    
    pricing: {
      buy: parseFloat(row.cost_price || row.buy_price || '0'),
      sell: parseFloat(row.sale_price || row.sell_price || '0'),
      currency: row.currency || 'TRY',
      updatedAt: new Date().toISOString(),
    },
    
    inventory: {
      onHand: parseInt(row.stock || row.qty_on_hand || '0'),
      reserved: parseInt(row.reserved || '0'),
      incoming: parseInt(row.incoming || row.on_order || '0'),
      leadDays: parseInt(row.lead_days || '7'),
      warehouseId: row.warehouse_id,
      updatedAt: new Date().toISOString(),
    },
    
    demandSignals: {
      dailyAvg30d: parseInt(row.sales_30d || '0') / 30 || 0.1,
      weeklyTrend: 'STABLE',
      deadStockRisk30d: calculateDeadStockRisk(parseInt(row.sales_30d || '0'), parseInt(row.stock || '0')),
      turnover30d: parseInt(row.sales_30d || '0'),
      coverageDays: calculateCoverageDays(parseInt(row.stock || '0'), parseInt(row.sales_30d || '0')),
    },
    
    source: 'EXCEL',
    tenantId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'EXCEL_IMPORT',
  }));
}

/**
 * Build PartMaster from B2B Network data
 */
export function buildFromB2B(b2bNetwork: B2BNetworkState, tenantId: string): PartMasterItem[] {
  console.log('[PartMaster] Build from B2B:', b2bNetwork.parts?.length || 0, 'parts');
  
  const parts = b2bNetwork.parts || [];
  
  return parts.map(b2bPart => ({
    partId: generatePartId(b2bPart.id || b2bPart.name, tenantId),
    sku: b2bPart.sku || b2bPart.id || b2bPart.name,
    name: b2bPart.name || 'B2B Part',
    brand: b2bPart.brand || 'B2B Supply',
    category: 'aftermarket',
    
    oemRefs: [],
    crossRefs: [],
    tags: ['b2b-network', 'external-supply'],
    
    unit: 'adet',
    packSize: 1,
    
    pricing: {
      buy: b2bPart.price || 0,
      sell: Math.ceil((b2bPart.price || 0) * 1.3), // 30% markup
      currency: 'TRY',
      updatedAt: new Date().toISOString(),
    },
    
    inventory: {
      onHand: b2bPart.stock || 0,
      reserved: 0,
      incoming: 0,
      leadDays: 14,
      warehouseId: undefined,
      updatedAt: new Date().toISOString(),
    },
    
    demandSignals: {
      dailyAvg30d: 0.1, // B2B doesn't have historical data
      weeklyTrend: 'STABLE',
      deadStockRisk30d: 0,
      turnover30d: 0,
      coverageDays: 999, // Unknown
    },
    
    source: 'B2B',
    tenantId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'B2B_SYNC',
  }));
}

/**
 * Build PartMaster from Manual entries (CSV/JSON)
 */
export function buildFromManual(manualItems: any[], tenantId: string): PartMasterItem[] {
  console.log('[PartMaster] Build from Manual:', manualItems.length, 'items');
  
  return manualItems.map(item => ({
    partId: generatePartId(item.sku, tenantId),
    sku: item.sku,
    name: item.name,
    brand: item.brand || 'Manual Entry',
    category: item.category || 'aftermarket',
    
    oemRefs: item.oemRefs || [],
    crossRefs: item.crossRefs || [],
    tags: item.tags || ['manual'],
    
    unit: item.unit || 'adet',
    packSize: item.packSize || 1,
    
    pricing: {
      buy: item.pricing?.buy || 0,
      sell: item.pricing?.sell || 0,
      currency: 'TRY',
      updatedAt: new Date().toISOString(),
    },
    
    inventory: {
      onHand: item.inventory?.onHand || 0,
      reserved: item.inventory?.reserved || 0,
      incoming: item.inventory?.incoming || 0,
      leadDays: item.inventory?.leadDays || 7,
      warehouseId: item.inventory?.warehouseId,
      updatedAt: new Date().toISOString(),
    },
    
    demandSignals: {
      dailyAvg30d: item.demandSignals?.dailyAvg30d || 0.1,
      weeklyTrend: item.demandSignals?.weeklyTrend || 'STABLE',
      deadStockRisk30d: item.demandSignals?.deadStockRisk30d || 0,
      turnover30d: item.demandSignals?.turnover30d || 0,
      coverageDays: item.demandSignals?.coverageDays || 30,
    },
    
    source: 'MANUAL',
    tenantId,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: item.updatedBy || 'MANUAL',
  }));
}

/**
 * Merge strategy: Combine parts from multiple sources
 * Rule: sku aynıysa merge; sku yoksa fuzzy match
 * Priority: ERP > EXCEL > MANUAL > B2B > MOCK
 */
export function mergePartMasters(
  sources: { source: PartDataSource; items: PartMasterItem[] }[],
  tenantId: string
): PartMasterItem[] {
  const merged: Map<string, PartMasterItem> = new Map();
  
  // Sort by priority
  const PRIORITY: Record<PartDataSource, number> = {
    ERP: 1,
    EXCEL: 2,
    MANUAL: 3,
    B2B: 4,
    MOCK: 5,
  };
  
  sources.sort((a, b) => (PRIORITY[a.source] || 10) - (PRIORITY[b.source] || 10));
  
  for (const { source, items } of sources) {
    for (const item of items) {
      if (!item.tenantId) item.tenantId = tenantId;
      
      if (item.sku && merged.has(item.sku)) {
        // SKU exists: merge if source has higher priority
        const existing = merged.get(item.sku)!;
        if ((PRIORITY[source] || 10) < (PRIORITY[existing.source] || 10)) {
          merged.set(item.sku, item);
          console.log(`[PartMaster] Merged ${item.sku}: ${existing.source} -> ${source}`);
        }
      } else {
        // New SKU or no SKU: add it
        merged.set(item.sku || item.partId, item);
      }
    }
  }
  
  console.log('[PartMaster] Merge result:', merged.size, 'unique parts');
  return Array.from(merged.values());
}

/**
 * Helper: Calculate dead stock risk
 * High risk if sales < 1 per 30 days
 */
function calculateDeadStockRisk(sales30d: number, onHand: number): number {
  if (sales30d === 0) return onHand > 0 ? 100 : 0;
  const dailyAvg = sales30d / 30;
  const daysToZero = onHand / dailyAvg;
  
  if (daysToZero > 180) return 80; // More than 6 months
  if (daysToZero > 90) return 50; // More than 3 months
  if (daysToZero > 30) return 20; // More than 1 month
  return 0;
}

/**
 * Helper: Calculate coverage days based on stock and demand
 */
function calculateCoverageDays(onHand: number, sales30d: number): number {
  if (sales30d === 0) return onHand > 0 ? 999 : 0;
  const dailyAvg = sales30d / 30;
  return Math.round(onHand / dailyAvg);
}
