/**
 * src/engine/aftermarket/aftermarketMetrics.ts
 * Refactored: Uses scoreEngine.ts for unified scoring, powered by Data Engine
 */

import { AftermarketProductCard, SimulationSuggestion } from '../../../types';
import {
  ScoreInputs,
  DataEngineScores,
  createDataEngineScores,
  clamp,
} from '../dataEngine/scoreEngine';
import { mockSuggestions } from '../dataEngine/dataEngine.mock';

/**
 * Safe numeric converter: any value → number | fallback
 */
const toNum = (v: any, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Bölgesel multiplier haritası (şehir/ilçe kombinasyonları)
 * Örnek: İstanbul Maslak 1.15 (yüksek talep), Ankara Çankaya 0.95 (düşük talep)
 */
const REGION_MULTIPLIERS: Record<string, Record<string, number>> = {
  'İstanbul': {
    'Maslak': 1.15,
    'Kuruçeşme': 1.08,
    'Taksim': 1.12,
    'Beylikdüzü': 1.05,
    'Ümraniye': 1.00,
    'Başakşehir': 0.98,
  },
  'Ankara': {
    'Çankaya': 0.95,
    'Keçiören': 0.88,
    'Ostim': 1.06,
    'Mamak': 0.92,
    'Cebeci': 0.90,
  },
  'İzmir': {
    'Karşıyaka': 1.03,
    'Bornova': 1.05,
    'Alsancak': 1.08,
    'Konak': 1.02,
  },
};

/**
 * Tedarik zorluk endeksi (bölge-tabanlı, sipariş süresi vb.)
 * 0-100 ölçeğinde, yüksek = daha zor tedarik
 */
const SUPPLY_DIFFICULTY: Record<string, Record<string, number>> = {
  'İstanbul': {
    'Maslak': 70,
    'Kuruçeşme': 50,
    'Taksim': 60,
    'Beylikdüzü': 40,
    'Ümraniye': 45,
    'Başakşehir': 35,
  },
  'Ankara': {
    'Çankaya': 55,
    'Keçiören': 60,
    'Ostim': 65,
    'Mamak': 58,
    'Cebeci': 62,
  },
  'İzmir': {
    'Karşıyaka': 50,
    'Bornova': 55,
    'Alsancak': 48,
    'Konak': 52,
  },
};

export interface AftermarketMetricsContext {
  selectedCity: string;
  selectedDistrict: string;
  targetDays: number; // Hedef stok gün sayısı (30 vs)
  modelGroup?: string;
  simulationSuggestion?: SimulationSuggestion | null;
  regionMultipliers?: Record<string, Record<string, number>>;
  supplyDifficulty?: Record<string, Record<string, number>>;
}

export interface AftermarketMetricsOutput {
  // Talep metrikleri
  baseDailyDemand: number; // 30 günlük satışdan türeyen günlük ortalama
  regionMultiplier: number; // Bölgesel etkisi
  effectiveDailyDemand: number; // baseDailyDemand * regionMultiplier

  // Stok metrikleri
  usableStock: number; // stock - reserved
  minStock: number; // Minimum güvenli stok miktarı
  daysLeftBeforeStockout: number; // Kaç günde tükenecek

  // Sipariş metrikleri
  orderSuggestionQty: number; // Kaç adet sipariş önerilir
  
  // Durum sonucu
  stockStatus: 'Yeterli' | 'Yetersiz stok'; // Mevcut stok yeterli mi?

  // Eski risk metrikleri (backward compat)
  demandPressure: number; // 0-100, normalize talep
  supplyRisk: number; // 0-100, tedarik zorluk + multiplikatör
  stockCoverDays: number; // currentStock / effectiveDailyDemand
  riskScore: number; // 0-100, weighted kombinasyon

  // YENİ: Data Engine Scores (from scoreEngine.ts)
  engineScores: DataEngineScores;
  
  // UI convenience: Individual scores from Data Engine
  generalRisk: number;      // 0..100
  durability: number;       // 0..100
  costPressure: number;     // 0..100
  supplyStress: number;     // 0..100
  brandImpact: number;      // 0..100
  trustScore: number;       // 0..100

  // Simülasyon bilgisi
  simulationActive: boolean;
  simulatedMultiplier?: number; // Veri Motoru'ndan gelen multiplier
}

/**
 * Bölgesel multiplier'ı al (şehir/ilçe kombinasyonundan)
 */
export function getRegionMultiplier(
  city: string,
  district: string,
  customMultipliers?: Record<string, Record<string, number>>
): number {
  const source = customMultipliers || REGION_MULTIPLIERS;
  return source[city]?.[district] ?? 1.0;
}

/**
 * Bölgesel tedarik zorluğu al
 */
export function getSupplyDifficulty(
  city: string,
  district: string,
  customDifficulty?: Record<string, Record<string, number>>
): number {
  const source = customDifficulty || SUPPLY_DIFFICULTY;
  return source[city]?.[district] ?? 50; // default 50 (orta zorluk)
}

/**
 * Öneri etiketinin bölge/parça ile eşleşip eşleşmediğini kontrol et
 */
export function isSimulationMatching(
  item: AftermarketProductCard,
  suggestion: SimulationSuggestion,
  selectedCity: string,
  selectedDistrict: string
): boolean {
  if (!suggestion) return false;

  const cityMatch =
    (suggestion.region || '').toLowerCase() === (selectedCity || '').toLowerCase();

  // district opsiyonel; suggestion.district varsa onu da kilitle
  const districtMatch = suggestion.district
    ? (suggestion.district || '').toLowerCase() === (selectedDistrict || '').toLowerCase()
    : true;

  const itemCategory = (item.category || '').toLowerCase();
  const partGroupMatch = itemCategory.includes((suggestion.partGroup || '').toLowerCase());

  return cityMatch && districtMatch && partGroupMatch;
}

/**
 * Inventory item'ını ScoreInputs'a dönüştür
 * 
 * Mapping:
 * - baseDailyDemand * regionMultiplier → effectiveDailyDemand
 * - stock - reserved → usableStock
 * - Tedarik difficulty + multiplier → supplyRisk (0..1)
 * - Talep baskısı → demandPressure (0..1)
 * - Stok kapsama günleri → stockRisk (0..1)
 * - Simülasyon: aktifse confidence + impact iletilir
 */
function mapToScoreInputs(
  item: AftermarketProductCard,
  metrics: {
    baseDailyDemand: number;
    regionMultiplier: number;
    usableStock: number;
    minStock: number;
    daysLeftBeforeStockout: number;
  },
  context: AftermarketMetricsContext,
  simulationActive: boolean
): ScoreInputs {
  const effectiveDailyDemand = metrics.baseDailyDemand * metrics.regionMultiplier;
  
  // Demand pressure: normalize daily demand (0-100 → 0-1)
  const demandPressure = clamp((effectiveDailyDemand / 1.0) * 100, 0, 100) / 100;
  
  // Supply risk: difficulty + multiplier effect
  const supplyDiffScore = getSupplyDifficulty(
    context.selectedCity,
    context.selectedDistrict,
    context.supplyDifficulty
  );
  const supplyRisk = clamp(
    supplyDiffScore * (metrics.regionMultiplier > 1 ? 1.2 : 0.9),
    0,
    100
  ) / 100;
  
  // Stock risk: güçlü kapsama günleri
  const stockCoverDays = effectiveDailyDemand > 0 
    ? metrics.usableStock / effectiveDailyDemand
    : 999;
  
  let stockRisk: number;
  if (stockCoverDays < 7) stockRisk = 0.9; // 90/100
  else if (stockCoverDays < 15) stockRisk = 0.6;
  else if (stockCoverDays < 30) stockRisk = 0.3;
  else stockRisk = 0.1;
  
  // Simulation info (if matching)
  const simSuggestion = simulationActive ? context.simulationSuggestion : undefined;
  
  return {
    effectiveDailyDemand,
    daysLeftBeforeStockout: metrics.daysLeftBeforeStockout,
    minStock: metrics.minStock,
    usableStock: metrics.usableStock,
    supplyRisk,
    demandPressure,
    stockRisk,
    
    // Simülasyon
    simulationActive,
    simulationConfidence: simSuggestion?.confidence,
    simulationImpact: simSuggestion?.impact,
    
    // Financial/Brand (defaults for now)
    marginPercent: item.marginPercent ?? 25,
    brandTier: item.brandTier ?? 'EQUIVALENT',
    
    // Data quality (defaults)
    dataCompleteness: 0.75,
    sourceCoverage: 0.70,
    consistencyScore: 0.80,
    
    // Vehicle signals
    mileageKm: 120000,
    incidentRate: 0.15,
  };
}

/**
 * Ana metrikler hesaplama fonksiyonu
 * Talep, stok, risk hesaplamaları + Data Engine scoring
 */
export function createAftermarketMetrics(
  item: AftermarketProductCard,
  context: AftermarketMetricsContext
): AftermarketMetricsOutput {
  
  // Guard: All numeric fields sanitized at source
  const last30Sales = toNum(item.last30Sales, 0);
  const stock = toNum(item.stock, 0);
  const reserved = toNum(item.reserved, 0);
  
  const selectedCity = (context.selectedCity || '').trim() || 'İstanbul';
  const selectedDistrict = (context.selectedDistrict || '').trim() || 'Maslak';
  const targetDays = toNum(context.targetDays, 30);
  
  // 1. TALEP HESAPLAMALARI
  // ======================
  const baseDailyDemand = last30Sales <= 0 ? 0.1 : last30Sales / 30;
  
  const regionMultiplier = toNum(
    getRegionMultiplier(selectedCity, selectedDistrict, context.regionMultipliers),
    1.0
  );
  
  const effectiveDailyDemand = baseDailyDemand * regionMultiplier;
  
  // 2. STOK ANALİZİ
  // ==============
  const usableStock = Math.max(0, stock - reserved);
  let minStock = Math.ceil(effectiveDailyDemand * targetDays);
  minStock = Math.max(0, toNum(minStock, 0));
  
  // 3. SİMÜLASYON OVERRİDE
  // ====================
  let simulationActive = false;
  let simulatedMultiplier: number | undefined;
  let adjustedMinStock = minStock;
  
  if (context.simulationSuggestion && isSimulationMatching(item, context.simulationSuggestion, selectedCity, selectedDistrict)) {
    simulationActive = true;
    const changePercent = toNum(context.simulationSuggestion.changePercent, 0);
    adjustedMinStock = Math.round(minStock * (1 + changePercent / 100));
    simulatedMultiplier = toNum(1 + changePercent / 100, 1);
  }
  
  // 4. STOK DURUMU
  // ==============
  const daysLeftBeforeStockout = effectiveDailyDemand > 0
    ? Math.floor(usableStock / effectiveDailyDemand)
    : 999;
  const safeDaysLeft = toNum(daysLeftBeforeStockout, 999);
  
  const stockStatus: 'Yeterli' | 'Yetersiz stok' = usableStock >= adjustedMinStock
    ? 'Yeterli'
    : 'Yetersiz stok';
  
  // 5. SİPARİŞ ÖNERİSİ
  // ==================
  const orderSuggestionQty = Math.max(0, adjustedMinStock - usableStock);
  
  // 6. ENSKİ RİSK HESAPLAMALARI (backward compat)
  // ============================================
  const demandPressure = Math.max(0, Math.min(100, (effectiveDailyDemand / 1.0) * 100));
  const supplyDiffScore = getSupplyDifficulty(
    selectedCity,
    selectedDistrict,
    context.supplyDifficulty
  );
  const supplyRisk = Math.max(0, Math.min(
    100,
    supplyDiffScore * (regionMultiplier > 1 ? 1.2 : 0.9)
  ));
  
  const stockCoverDays = effectiveDailyDemand > 0
    ? usableStock / effectiveDailyDemand
    : 999;
  
  const stockRiskScore = stockCoverDays < 7
    ? 90
    : stockCoverDays < 15
    ? 60
    : stockCoverDays < 30
    ? 30
    : 10;
  
  const riskScore = Math.round(demandPressure * 0.35 + supplyRisk * 0.35 + stockRiskScore * 0.30);
  
  // 7. DATA ENGINE SCORES (YENİ)
  // ============================
  const scoreInputs = mapToScoreInputs(
    item,
    {
      baseDailyDemand,
      regionMultiplier,
      usableStock,
      minStock: adjustedMinStock,
      daysLeftBeforeStockout: safeDaysLeft,
    },
    {
      selectedCity,
      selectedDistrict,
      targetDays,
      modelGroup: context.modelGroup,
      simulationSuggestion: context.simulationSuggestion,
      regionMultipliers: context.regionMultipliers,
      supplyDifficulty: context.supplyDifficulty,
    },
    simulationActive
  );
  
  const engineScores = createDataEngineScores(scoreInputs);
  
  // 8. SONUÇ
  // =======
  return {
    // Talep metrikleri
    baseDailyDemand,
    regionMultiplier,
    effectiveDailyDemand,
    usableStock,
    minStock,
    daysLeftBeforeStockout: safeDaysLeft,
    orderSuggestionQty,
    stockStatus,
    
    // Eski risk metrikleri (backward compat)
    demandPressure,
    supplyRisk,
    stockCoverDays,
    riskScore,
    
    // Data Engine Scores (complete object)
    engineScores,
    
    // UI convenience: Individual scores from Data Engine
    generalRisk: engineScores.generalRisk,
    durability: engineScores.durability,
    costPressure: engineScores.costPressure,
    supplyStress: engineScores.supplyStress,
    brandImpact: engineScores.brandImpact,
    trustScore: engineScores.trustScore,
    
    // Simulation info
    simulationActive,
    simulatedMultiplier,
  };
}

/**
 * Risk labeli döndür
 */
export function getRiskLabel(riskScore: number): string {
  if (riskScore <= 40) return 'Güvenli';
  if (riskScore <= 70) return 'Orta';
  return 'Kritik';
}

/**
 * Risk rengi döndür (Tailwind className)
 */
export function getRiskColor(riskScore: number): string {
  if (riskScore <= 40) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (riskScore <= 70) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-rose-100 text-rose-700 border-rose-200';
}
