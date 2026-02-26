/**
 * PartMasterBuilder - Canonical SKU Registry
 * Single source of truth for parts across ERP/Excel/Manual/B2B/Mock
 * Normalization + Merge Strategies
 */

import { PartMasterItem, PartDataSource, PartMasterCategory } from '../types';
import { B2BNetworkState, B2BPart } from '../types';
import { PartMasterPart, PartCategory, QualityTier, Brand, OemRef, AftermarketRef, PartMasterCatalog } from '../types/partMaster';

// ========== CANONICAL PART MASTER CATALOG BUILDER ==========

/**
 * Build canonical Part Master Catalog with 20+ seed parts
 * Single source of truth for Aftermarket, Bakım Merkezi, Risk Analysis, Data Engine
 */
export function buildPartMasterCatalog(tenantId = 'LENT-CORP-DEMO'): PartMasterCatalog {
  const brands: Brand[] = [
    { brandId: 'BREMBO', name: 'Brembo', origin: 'Italy', tier: 'OEM', reliability: 98 },
    { brandId: 'BOSCH', name: 'Bosch', origin: 'Germany', tier: 'OEM', reliability: 97 },
    { brandId: 'MANN', name: 'Mann', origin: 'Germany', tier: 'OEM', reliability: 96 },
    { brandId: 'NGK', name: 'NGK', origin: 'Japan', tier: 'OEM', reliability: 95 },
    { brandId: 'LUK', name: 'LuK', origin: 'Germany', tier: 'OEM', reliability: 94 },
    { brandId: 'DAYCO', name: 'Dayco', origin: 'USA', tier: 'OEM', reliability: 93 },
    { brandId: 'SACHS', name: 'Sachs', origin: 'Germany', tier: 'OEM', reliability: 92 },
    { brandId: 'VALEO', name: 'Valeo', origin: 'France', tier: 'OEM', reliability: 91 },
    { brandId: 'MAHLE', name: 'Mahle', origin: 'Germany', tier: 'OEM', reliability: 90 },
    { brandId: 'TRW', name: 'TRW', origin: 'USA', tier: 'AFTERMARKET', reliability: 85 },
    { brandId: 'CASTROL', name: 'Castrol', origin: 'UK', tier: 'AFTERMARKET', reliability: 88 },
    { brandId: 'SHELL', name: 'Shell', origin: 'Netherlands', tier: 'AFTERMARKET', reliability: 87 },
  ];

  const vehiclePlatforms = {
    'BMW_F30_2012_2019': 'BMW F30 3 Series (2012-2019)',
    'VAG_PQ35': 'VW Passat B6/Mk5 Golf (2003-2014)',
    'VAG_MQB': 'VW Golf 7, Passat B8, Audi A3/A4 (2013+)',
    'FORD_C1': 'Ford Focus, Fiesta C1 Platform (2011-2019)',
    'TOYOTA_M10A': 'Toyota Corolla M10A (2014-2022)',
    'HONDA_9TH': 'Honda Civic 9th Gen (2012-2015)',
  } as Record<string, string>;

  // Seed 24 parts (minimum 20 required)
  const partSeeds = [
    {
      sku: 'BRAKE_PAD_FRONT_001', name: 'Fren Balatası Ön', category: 'BRAKE' as PartCategory, partGroup: 'Brake System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Brembo',
      oemRefs: [{ refId: 'OEM-FR-001', oemCode: 'BMW-34-11-6-790-866', brand: 'BMW', vehicleFitment: 'BMW_F30_2012_2019', confidence: 100 }],
      platforms: ['BMW_F30_2012_2019', 'VAG_MQB'],
    },
    {
      sku: 'FILTER_OIL_001', name: 'Yağ Filtresi', category: 'POWERTRAIN' as PartCategory, partGroup: 'Filtration System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Mann',
      oemRefs: [{ refId: 'OEM-OF-001', oemCode: 'BMW-11-42-8-584-233', brand: 'BMW', vehicleFitment: 'BMW_F30_2012_2019', confidence: 100 }],
      platforms: ['BMW_F30_2012_2019', 'VAG_MQB'],
    },
    {
      sku: 'FILTER_AIR_001', name: 'Hava Filtresi', category: 'POWERTRAIN' as PartCategory, partGroup: 'Filtration System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Mann',
      oemRefs: [{ refId: 'OEM-AF-001', oemCode: 'BMW-13-71-7-571-490', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'TIMING_BELT_001', name: 'Triger Seti', category: 'POWERTRAIN' as PartCategory, partGroup: 'Engine Components', qualityTier: 'OEM' as QualityTier, priceBrand: 'Dayco',
      oemRefs: [{ refId: 'OEM-TB-001', oemCode: 'FORD-1S7Z-6268-CA', brand: 'Ford', vehicleFitment: 'FORD_C1', confidence: 98 }],
      platforms: ['FORD_C1'],
    },
    {
      sku: 'ABSORBER_001', name: 'Amortisör Ön', category: 'SUSPENSION' as PartCategory, partGroup: 'Suspension System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Sachs',
      oemRefs: [{ refId: 'OEM-AB-001', oemCode: 'BMW-33-52-6-779-714', brand: 'BMW', vehicleFitment: 'BMW_F30_2012_2019', confidence: 97 }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'CLUTCH_SET_001', name: 'Debriyaj Seti', category: 'TRANSMISSION' as PartCategory, partGroup: 'Transmission Components', qualityTier: 'PREMIUM' as QualityTier, priceBrand: 'LuK',
      oemRefs: [{ refId: 'OEM-CL-001', oemCode: 'VW-1K0-141-165', brand: 'Volkswagen' }],
      platforms: ['VAG_PQ35', 'VAG_MQB'],
    },
    {
      sku: 'SPARK_PLUG_001', name: 'Ateşleme Bujisi', category: 'POWERTRAIN' as PartCategory, partGroup: 'Engine Components', qualityTier: 'OEM' as QualityTier, priceBrand: 'NGK',
      oemRefs: [{ refId: 'OEM-SP-001', oemCode: 'BMW-12-12-1-748-375', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'IGNITION_COIL_001', name: 'İgnisyon Bobini', category: 'ELECTRONIC' as PartCategory, partGroup: 'Ignition System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Bosch',
      oemRefs: [{ refId: 'OEM-IC-001', oemCode: 'BMW-12-13-8-646-718', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'THERMOSTAT_001', name: 'Termostat', category: 'COOLING' as PartCategory, partGroup: 'Cooling System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Mahle',
      oemRefs: [{ refId: 'OEM-TH-001', oemCode: 'BMW-11-53-7-533-017', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'FAN_RADIATOR_001', name: 'Radyatör Fanı', category: 'COOLING' as PartCategory, partGroup: 'Cooling System', qualityTier: 'EQUIVALENT' as QualityTier, priceBrand: 'Bosch',
      oemRefs: [{ refId: 'OEM-RF-001', oemCode: 'BMW-17-42-7-596-268', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'OIL_5W30_001', name: 'Motor Yağı 5W30', category: 'AFTERMARKET' as PartCategory, partGroup: 'Maintenance Products', qualityTier: 'EQUIVALENT' as QualityTier, priceBrand: 'Castrol',
      oemRefs: [{ refId: 'OEM-OL-001', oemCode: 'BMW-11-00-7-722-575', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019', 'VAG_MQB'],
    },
    {
      sku: 'CABIN_FILTER_001', name: 'Kabin Hava Filtresi', category: 'AFTERMARKET' as PartCategory, partGroup: 'Filtration System', qualityTier: 'EQUIVALENT' as QualityTier, priceBrand: 'Mann',
      oemRefs: [{ refId: 'OEM-CF-001', oemCode: 'BMW-64-31-9-163-509', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'TEMP_SENSOR_001', name: 'Çalişma Isı Sensörü', category: 'ELECTRONIC' as PartCategory, partGroup: 'Sensor System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Bosch',
      oemRefs: [{ refId: 'OEM-TS-001', oemCode: 'BMW-13-62-7-618-989', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'O2_SENSOR_001', name: 'Oksijen Sensörü', category: 'ELECTRONIC' as PartCategory, partGroup: 'Emission System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Bosch',
      oemRefs: [{ refId: 'OEM-O2-001', oemCode: 'BMW-11-78-7-557-016', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'BRAKE_OIL_001', name: 'Fren Sıvısı DOT4', category: 'BRAKE' as PartCategory, partGroup: 'Brake System', qualityTier: 'EQUIVALENT' as QualityTier, priceBrand: 'Bosch',
      oemRefs: [{ refId: 'OEM-BO-001', oemCode: 'BMW-81-22-9-407-765', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'TIRE_195_65_15', name: 'Lastik 195/65/R15', category: 'AFTERMARKET' as PartCategory, partGroup: 'Tire System', qualityTier: 'ECONOMY' as QualityTier, priceBrand: 'TRW',
      oemRefs: [],
      platforms: ['FORD_C1'],
    },
    {
      sku: 'HARNESS_ENG_001', name: 'Motor Kabloyması', category: 'ELECTRONIC' as PartCategory, partGroup: 'Wiring System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Bosch',
      oemRefs: [{ refId: 'OEM-HN-001', oemCode: 'BMW-12-51-8-605-006', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'BRAKE_PAD_REAR_001', name: 'Fren Balatası Arka', category: 'BRAKE' as PartCategory, partGroup: 'Brake System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Brembo',
      oemRefs: [{ refId: 'OEM-BR-001', oemCode: 'BMW-34-21-6-857-148', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'DOOR_LOCK_001', name: 'Kapı Kilit Motorü', category: 'BODY' as PartCategory, partGroup: 'Door Lock System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Bosch',
      oemRefs: [{ refId: 'OEM-DL-001', oemCode: 'BMW-51-25-7-202-455', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'WASHER_FLUID_001', name: 'Silecek Sıvı -20C', category: 'AFTERMARKET' as PartCategory, partGroup: 'Maintenance Products', qualityTier: 'ECONOMY' as QualityTier, priceBrand: 'Shell',
      oemRefs: [],
      platforms: ['BMW_F30_2012_2019', 'VAG_MQB'],
    },
    {
      sku: 'COMPRESSOR_BELT_001', name: 'Kompresör Kayışı', category: 'COOLING' as PartCategory, partGroup: 'AC System', qualityTier: 'PREMIUM' as QualityTier, priceBrand: 'Dayco',
      oemRefs: [{ refId: 'OEM-CB-001', oemCode: 'BMW-11-28-7-576-220', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'AIRBAG_MODULE_001', name: 'Ön Hava Yastığı Kontrol Modülü', category: 'BODY' as PartCategory, partGroup: 'Safety System', qualityTier: 'OEM' as QualityTier, priceBrand: 'Bosch',
      oemRefs: [{ refId: 'OEM-AB-001', oemCode: 'BMW-65-77-9-268-433', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'ABS_PUMP_001', name: 'ABS Pompa Modülü', category: 'BRAKE' as PartCategory, partGroup: 'Brake System', qualityTier: 'PREMIUM' as QualityTier, priceBrand: 'Bosch',
      oemRefs: [{ refId: 'OEM-AP-001', oemCode: 'BMW-34-51-6-859-403', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
    {
      sku: 'LINK_ROD_Z_001', name: 'Sürüş Kolu Z-Rod', category: 'SUSPENSION' as PartCategory, partGroup: 'Suspension System', qualityTier: 'EQUIVALENT' as QualityTier, priceBrand: 'Bosch',
      oemRefs: [{ refId: 'OEM-LZ-001', oemCode: 'BMW-31-35-6-765-145', brand: 'BMW' }],
      platforms: ['BMW_F30_2012_2019'],
    },
  ];

  const parts: PartMasterPart[] = partSeeds.map((seed, idx) => {
    const brand = brands.find(b => b.name === seed.priceBrand) || { brandId: 'GENERIC', name: seed.priceBrand };
    
    return {
      partMasterId: `PM-${String(idx + 1).padStart(4, '0')}`,
      tenantId,
      sku: seed.sku,
      name: seed.name,
      description: `${seed.partGroup} - ${seed.qualityTier} quality`,
      category: seed.category,
      partGroup: seed.partGroup,
      qualityTier: seed.qualityTier,
      brand: brand as Brand,
      oemRefs: seed.oemRefs as OemRef[],
      aftermarketRefs: [],
      fitments: seed.platforms.map((platform, pidx) => ({
        fitmentId: `FIT-${seed.sku}-${pidx}`,
        vehiclePlatform: platform,
        yearRange: platform === 'BMW_F30_2012_2019' ? { from: 2012, to: 2019 } : 
                   platform === 'VAG_MQB' ? { from: 2013, to: 2024 } :
                   platform === 'FORD_C1' ? { from: 2011, to: 2019 } :
                   platform === 'TOYOTA_M10A' ? { from: 2014, to: 2022 } :
                   platform === 'HONDA_9TH' ? { from: 2012, to: 2015 } :
                   { from: 2012, to: 2024 },
      })),
      unit: 'adet',
      packSize: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataQuality: 90 + Math.random() * 10,
    };
  });

  console.log(`[PartMaster] catalog size: ${parts.length} parts`);

  return {
    tenantId,
    generatedAt: new Date().toISOString(),
    parts,
    brands,
    platformFitments: vehiclePlatforms,
  };
}

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
