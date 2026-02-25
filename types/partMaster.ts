/**
 * PartMaster - Canonical Single Source of Truth for Parts Ecosystem
 * Used by: Aftermarket, B2B Network, Stock Signals, Risk Analysis, Data Engine
 */

// ========== CORE ENTITIES ==========

export interface Part {
  partId: string;           // UUID or stable key
  sku: string;              // Unique within tenant
  name: string;
  brand?: string;
  description?: string;
  category: PartCategory;
  subcategory?: string;
  
  // Cross-references
  oemRefs: string[];        // OEM part numbers
  crossRefs: string[];      // Equivalent aftermarket parts
  
  // Physical properties
  unit: 'adet' | 'litre' | 'set' | 'metre' | 'kg';
  packSize: number;
  weight?: number;          // kg
  dimensions?: string;      // cm or JSON
  
  // Status & Source
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  source: 'ERP' | 'EXCEL' | 'MANUAL' | 'B2B' | 'MOCK';
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type PartCategory = 
  | 'POWERTRAIN'       // Motor, şanzıman, viskoplatin
  | 'TRANSMISSION'     // Manual, Otomatik, CVT
  | 'ELECTRONIC'       // Sensörler, ECU, batarya
  | 'BODY'             // Şasi, kapı, cam
  | 'COOLING'          // Radiator, su pompası
  | 'FUEL'             // Yakıt sistemi
  | 'BRAKE'            // Fren sistemi
  | 'SUSPENSION'       // Amortisör, yatak
  | 'LIGHTING'         // Far, arka lamba
  | 'INTERIOR'         // Döşeme, tabela
  | 'AFTERMARKET'      // Aksesuar, sarf malzeme
  | 'OTHER';

export interface Supplier {
  supplierId: string;
  name: string;
  type: 'WHOLESALER' | 'DISTRIBUTOR' | 'MANUFACTURER' | 'B2B_NETWORK';
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  
  // Performance metrics
  avgLeadDays?: number;
  reliabilityScore?: number;  // 0-100
  priceCompetitiveness?: number;
  
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPartEdge {
  edgeId: string;
  supplierId: string;
  partId: string;
  
  // Pricing & Supply
  supplierSku?: string;
  unitPrice: number;
  currency: 'USD' | 'EUR' | 'TRY';
  minOrderQty: number;
  packQty?: number;
  
  // Lead time
  leadDays: number;           // Standard delivery
  expeditedLeadDays?: number;
  
  // Status
  active: boolean;
  lastUpdated: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  inventoryId: string;
  partId: string;
  warehouseId: string;         // or location code
  
  // Stock levels
  onHand: number;
  reserved: number;            // Already allocated
  inTransit: number;           // Ordered but not arrived
  safetyStock: number;         // Minimum required level
  maxStock?: number;
  
  // Valuation
  unitCost?: number;           // Last cost
  totalValue?: number;         // onHand * unitCost
  
  // Aging
  status: 'GOOD' | 'AGING' | 'DEAD_STOCK';
  lastMovedDate?: string;      // Last in/out activity
  
  updatedAt: string;
}

export interface SalesSignal {
  signalId: string;
  partId: string;
  period: 'D30' | 'D90' | 'D180' | 'D365';  // Last 30/90/180/365 days
  
  // Demand metrics
  soldQty: number;             // Total units sold
  soldValue?: number;          // Revenue
  avgPrice?: number;           // Average selling price
  
  // Velocity
  dailyAverage?: number;
  weeklyTrend?: 'UP' | 'DOWN' | 'STABLE';
  seasonalFactor?: number;     // 1.0 = normal
  
  // Profitability
  marginPercent?: number;
  marginTrend?: 'UP' | 'DOWN' | 'STABLE';
  
  // Risk flags
  deadStockRisk?: number;      // 0-100, >80 = critical
  forecastStock?: number;      // Projected 30-day coverage
  
  generatedAt: string;
  source?: 'ERP' | 'MANUAL' | 'ESTIMATED' | 'MOCK';
}

export interface PriceSignal {
  signalId: string;
  partId: string;
  
  // Price tracking
  lastUnitPrice: number;
  avgPrice30d?: number;
  minPrice30d?: number;
  maxPrice30d?: number;
  
  // Volatility
  volatilityPercent?: number;  // 0-100
  trend?: 'UP' | 'DOWN' | 'STABLE';
  
  // Masking for KVKK
  masked: boolean;             // If true, price hidden from certain roles
  maskedReason?: 'CONFIDENTIAL' | 'CUSTOMER_SPECIFIC' | 'NEGOTIATED';
  
  lastUpdated: string;
  currency: 'USD' | 'EUR' | 'TRY';
}

export interface CategoryNode {
  categoryId: string;
  name: PartCategory;
  parentCategory?: PartCategory;
  description?: string;
  partCount?: number;          // Number of parts in this category
  totalStockValue?: number;    // Sum of all part values
}

export interface OEMCrossRef {
  refId: string;
  oem: string;                 // OEM code (BMW-00001)
  aftermarketId: string;       // Aftermarket part ID
  aftermarketSku: string;
  fitmentNotes?: string;
  confidence?: number;         // 0-100, match confidence
}

export interface Fitment {
  fitmentId: string;
  partId: string;
  vehiclePlatform: string;     // e.g., "BMW_F30_2012_2018"
  applicableModels?: string[];
  engineTypes?: string[];
  notes?: string;
}

// ========== AGGREGATE ROOT ==========

export interface PartMasterSnapshot {
  // Meta
  tenantId: string;
  generatedAt: string;
  expiresAt?: string;          // For cache invalidation
  source: 'REAL' | 'MOCK';
  
  // Core data collections
  parts: Part[];
  suppliers: Supplier[];
  edges: SupplierPartEdge[];
  inventory: InventoryItem[];
  salesSignals: SalesSignal[];
  priceSignals: PriceSignal[];
  categories: CategoryNode[];
  
  // Cross-reference mappings
  mappings: {
    oemCrossRefs: OEMCrossRef[];
    fitments: Fitment[];
  };
  
  // Summary statistics
  summary?: {
    totalParts: number;
    totalSuppliers: number;
    totalStockValue: number;
    totalOnHand: number;
    criticalStockCount: number;
    deadStockCount: number;
    avgTurnover30d: number;
  };
  
  // Content-type guarantee
  contentType: 'application/json';
}

// ========== INDICES (Data Engine outputs derived from PM) ==========

export interface SupplyHealthIndex {
  indexId: string;
  tenantId: string;
  generatedAt: string;
  
  // Metrics per supplier
  suppliers: Array<{
    supplierId: string;
    supplierName: string;
    score: number;              // 0-100
    avgLeadDays: number;
    reliabilityScore: number;
    volatilityScore: number;
    partCount: number;
    recentOrderCount?: number;
    onTimeDeliveryPercent?: number;
  }>;
}

export interface StockRiskIndex {
  indexId: string;
  tenantId: string;
  generatedAt: string;
  
  riskMatrix: Array<{
    partId: string;
    partSku: string;
    partName: string;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    riskFactors: string[];      // ['low_velocity', 'high_onhand', 'near_expiry']
    suggestedAction: string;
    daysToStockout?: number;
  }>;
}

export interface MarginOpportunityIndex {
  indexId: string;
  tenantId: string;
  generatedAt: string;
  
  opportunities: Array<{
    partId: string;
    partSku: string;
    partName: string;
    marginPercent: number;
    marginTrend: string;
    volumeSold30d: number;
    revenue30d: number;
    recommendation: string;     // e.g., "INCREASE_PRICE" | "PROMOTE" | "DISCONTINUE"
  }>;
}

export interface VelocityIndex {
  indexId: string;
  tenantId: string;
  generatedAt: string;
  
  tiers: {
    fastMovers: Array<{
      partId: string;
      partSku: string;
      daysToStockout: number;
      daysToReorder: number;
      recommendedOrderQty: number;
    }>;
    slowMovers: Array<{
      partId: string;
      partSku: string;
      lastMovedDaysAgo: number;
      currentOnHand: number;
      recommendedAction: 'HOLD' | 'DISCOUNT' | 'DISCONTINUE';
    }>;
  };
}

// ========== API RESPONSE TYPES ==========

export interface GetPartMasterSnapshotRequest {
  tenantId: string;
  category?: PartCategory;
  includeHistorical?: boolean;
}

export interface GetPartMasterSnapshotResponse {
  success: boolean;
  data?: PartMasterSnapshot;
  error?: string;
  timestamp: string;
}

export interface GetDataEngineIndicesResponse {
  success: boolean;
  data: {
    supplyHealth: SupplyHealthIndex;
    stockRisk: StockRiskIndex;
    marginOpportunity: MarginOpportunityIndex;
    velocity: VelocityIndex;
  };
  timestamp: string;
}

// ========== CONSTANTS ==========

export const PART_MASTER_MOCK: PartMasterSnapshot = {
  tenantId: 'LENT-CORP-DEMO',
  generatedAt: new Date().toISOString(),
  source: 'MOCK',
  contentType: 'application/json',
  
  parts: [
    {
      partId: 'PM-001',
      sku: 'BRAKE-FP-001',
      name: 'Fren Balatası Ön',
      brand: 'Brembo',
      category: 'BRAKE',
      subcategory: 'Pad Set',
      oemRefs: ['BMW-34-25-6-761-671', 'OEM-BRAKE-001'],
      crossRefs: ['BOSCH-BP-001', 'DELPHI-FP-001'],
      unit: 'set',
      packSize: 1,
      status: 'ACTIVE',
      source: 'MOCK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      partId: 'PM-002',
      sku: 'OIL-FILTER-001',
      name: 'Yağ Filtresi',
      brand: 'Mann',
      category: 'POWERTRAIN',
      subcategory: 'Filters',
      oemRefs: ['BMW-11-42-8-584-233'],
      crossRefs: ['BOSCH-OF-001'],
      unit: 'adet',
      packSize: 1,
      status: 'ACTIVE',
      source: 'MOCK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      partId: 'PM-003',
      sku: 'AIR-FILTER-001',
      name: 'Hava Filtresi',
      brand: 'Mann',
      category: 'POWERTRAIN',
      subcategory: 'Filters',
      oemRefs: [],
      crossRefs: [],
      unit: 'adet',
      packSize: 1,
      status: 'ACTIVE',
      source: 'MOCK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      partId: 'PM-004',
      sku: 'SERPENTINE-BELT-001',
      name: 'Serpantin Kayışı',
      brand: 'Contitech',
      category: 'POWERTRAIN',
      oemRefs: [],
      crossRefs: [],
      unit: 'adet',
      packSize: 1,
      status: 'ACTIVE',
      source: 'MOCK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      partId: 'PM-005',
      sku: 'MOTOR-OIL-5W30',
      name: 'Motor Yağı 5W30',
      brand: 'Castrol',
      category: 'POWERTRAIN',
      oemRefs: [],
      crossRefs: ['SHELL-5W30', 'MOBIL-5W30'],
      unit: 'litre',
      packSize: 5,
      status: 'ACTIVE',
      source: 'MOCK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  
  suppliers: [
    {
      supplierId: 'SUPP-001',
      name: 'Brembo Tedarik',
      type: 'DISTRIBUTOR',
      country: 'İtalya',
      avgLeadDays: 5,
      reliabilityScore: 95,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      supplierId: 'SUPP-002',
      name: 'Mann Filter',
      type: 'MANUFACTURER',
      country: 'Almanya',
      avgLeadDays: 7,
      reliabilityScore: 92,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      supplierId: 'SUPP-003',
      name: 'B2B Parça Ağı',
      type: 'B2B_NETWORK',
      avgLeadDays: 3,
      reliabilityScore: 85,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  
  edges: [
    {
      edgeId: 'EDGE-001',
      supplierId: 'SUPP-001',
      partId: 'PM-001',
      supplierSku: 'BREMBO-FP-EU-001',
      unitPrice: 850,
      currency: 'TRY',
      minOrderQty: 1,
      leadDays: 5,
      active: true,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      edgeId: 'EDGE-002',
      supplierId: 'SUPP-002',
      partId: 'PM-002',
      supplierSku: 'MANN-OF-TRY-001',
      unitPrice: 350,
      currency: 'TRY',
      minOrderQty: 5,
      leadDays: 7,
      active: true,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  
  inventory: [
    {
      inventoryId: 'INV-001',
      partId: 'PM-001',
      warehouseId: 'WH-ISTANBUL',
      onHand: 15,
      reserved: 2,
      inTransit: 0,
      safetyStock: 5,
      unitCost: 850,
      totalValue: 12750,
      status: 'GOOD',
      updatedAt: new Date().toISOString(),
    },
    {
      inventoryId: 'INV-002',
      partId: 'PM-002',
      warehouseId: 'WH-ISTANBUL',
      onHand: 45,
      reserved: 5,
      inTransit: 10,
      safetyStock: 10,
      unitCost: 350,
      totalValue: 15750,
      status: 'GOOD',
      updatedAt: new Date().toISOString(),
    },
    {
      inventoryId: 'INV-003',
      partId: 'PM-003',
      warehouseId: 'WH-ISTANBUL',
      onHand: 8,
      reserved: 1,
      inTransit: 0,
      safetyStock: 3,
      unitCost: 280,
      totalValue: 2240,
      status: 'GOOD',
      updatedAt: new Date().toISOString(),
    },
    {
      inventoryId: 'INV-004',
      partId: 'PM-004',
      warehouseId: 'WH-ISTANBUL',
      onHand: 2,
      reserved: 0,
      inTransit: 0,
      safetyStock: 3,
      unitCost: 4500,
      totalValue: 9000,
      status: 'AGING',
      lastMovedDate: '2026-01-15',
      updatedAt: new Date().toISOString(),
    },
    {
      inventoryId: 'INV-005',
      partId: 'PM-005',
      warehouseId: 'WH-ISTANBUL',
      onHand: 120,
      reserved: 20,
      inTransit: 50,
      safetyStock: 30,
      unitCost: 85,
      totalValue: 10200,
      status: 'GOOD',
      updatedAt: new Date().toISOString(),
    },
  ],
  
  salesSignals: [
    {
      signalId: 'SIGNAL-001',
      partId: 'PM-001',
      period: 'D30',
      soldQty: 120,
      soldValue: 102000,
      avgPrice: 850,
      dailyAverage: 4,
      weeklyTrend: 'STABLE',
      marginPercent: 25,
      deadStockRisk: 0,
      forecastStock: 3.75,
      generatedAt: new Date().toISOString(),
      source: 'MOCK',
    },
    {
      signalId: 'SIGNAL-002',
      partId: 'PM-002',
      period: 'D30',
      soldQty: 90,
      soldValue: 31500,
      avgPrice: 350,
      dailyAverage: 3,
      weeklyTrend: 'UP',
      marginPercent: 28,
      deadStockRisk: 0,
      forecastStock: 15,
      generatedAt: new Date().toISOString(),
      source: 'MOCK',
    },
    {
      signalId: 'SIGNAL-003',
      partId: 'PM-003',
      period: 'D30',
      soldQty: 30,
      soldValue: 8400,
      avgPrice: 280,
      dailyAverage: 1,
      weeklyTrend: 'STABLE',
      marginPercent: 30,
      deadStockRisk: 10,
      forecastStock: 8,
      generatedAt: new Date().toISOString(),
      source: 'MOCK',
    },
    {
      signalId: 'SIGNAL-004',
      partId: 'PM-004',
      period: 'D30',
      soldQty: 5,
      soldValue: 31000,
      avgPrice: 6200,
      dailyAverage: 0.17,
      weeklyTrend: 'DOWN',
      marginPercent: 35,
      deadStockRisk: 80,
      forecastStock: 400,
      generatedAt: new Date().toISOString(),
      source: 'MOCK',
    },
    {
      signalId: 'SIGNAL-005',
      partId: 'PM-005',
      period: 'D30',
      soldQty: 400,
      soldValue: 48000,
      avgPrice: 120,
      dailyAverage: 13.3,
      weeklyTrend: 'UP',
      marginPercent: 40,
      deadStockRisk: 0,
      forecastStock: 9,
      generatedAt: new Date().toISOString(),
      source: 'MOCK',
    },
  ],
  
  priceSignals: [
    {
      signalId: 'PRICE-001',
      partId: 'PM-001',
      lastUnitPrice: 850,
      avgPrice30d: 845,
      volatilityPercent: 2,
      trend: 'STABLE',
      masked: false,
      lastUpdated: new Date().toISOString(),
      currency: 'TRY',
    },
    {
      signalId: 'PRICE-002',
      partId: 'PM-002',
      lastUnitPrice: 350,
      avgPrice30d: 348,
      volatilityPercent: 1,
      trend: 'UP',
      masked: false,
      lastUpdated: new Date().toISOString(),
      currency: 'TRY',
    },
  ],
  
  categories: [
    {
      categoryId: 'CAT-BRAKE',
      name: 'BRAKE',
      description: 'Fren sistemi parçaları',
      partCount: 10,
      totalStockValue: 25000,
    },
    {
      categoryId: 'CAT-POWERTRAIN',
      name: 'POWERTRAIN',
      description: 'İtme sistemi',
      partCount: 20,
      totalStockValue: 85000,
    },
    {
      categoryId: 'CAT-ELECTRONIC',
      name: 'ELECTRONIC',
      description: 'Elektronik bileşenler',
      partCount: 15,
      totalStockValue: 45000,
    },
  ],
  
  mappings: {
    oemCrossRefs: [
      {
        refId: 'REF-001',
        oem: 'BMW-34-25-6-761-671',
        aftermarketId: 'PM-001',
        aftermarketSku: 'BRAKE-FP-001',
        confidence: 100,
      },
    ],
    fitments: [
      {
        fitmentId: 'FIT-001',
        partId: 'PM-001',
        vehiclePlatform: 'BMW_F30_2012_2018',
        engineTypes: ['N20', 'N26'],
      },
    ],
  },
  
  summary: {
    totalParts: 5,
    totalSuppliers: 3,
    totalStockValue: 49940,
    totalOnHand: 190,
    criticalStockCount: 1,
    deadStockCount: 1,
    avgTurnover30d: 129,
  },
};
