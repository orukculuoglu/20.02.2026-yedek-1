import React, { useState, useMemo, useEffect } from 'react';
import { Cpu, Database, RefreshCw, TrendingUp, AlertTriangle, Info, ChevronDown, X, Package, Settings } from 'lucide-react';
import { mockDataEngineV1 } from '../data/dataEngine.mock';
import { createAftermarketMetrics } from '../utils/aftermarketMetrics';
import { buildDataEngineSummary, getIndexMetadata, getTrendArrow, getFormulaExplanation, getSecurityExplanation } from '../src/engine/dataEngine/dataEngineAggregator';
import { buildFleetRiskSummary } from '../src/engine/fleetRisk/fleetRiskAggregator';
import { getPartMasterCatalog, getSupplierOffers, getPartIndices } from '../services/dataService';
import { DataEngineIndices } from '../services/dataEngineIndices';
import { PartIndex } from '../services/dataEngineIndices';
import { AftermarketProductCard, VehicleProfile } from '../types';
import { PartMasterPart, PartMasterCatalog } from '../types/partMaster';
import { OffersPanel } from '../components/OffersPanel';
import { getLastRiskIndexEvents, getRiskIndexEventsByVehicleId } from '../src/modules/data-engine/eventLogger';
import type { RiskIndexEvent } from '../src/modules/data-engine/eventLogger';
import { sanitizeMeta } from '../src/modules/data-engine/utils/sanitizeMeta';
import { RiskSegmentDashboard } from '../src/modules/data-engine/components/RiskSegmentDashboard';
import TenantAnalyticsDashboard from '../src/modules/data-engine/components/TenantAnalyticsDashboard';
import OperationalRiskList from '../src/modules/data-engine/components/OperationalRiskList';
import OperationalRiskDashboard from '../src/modules/data-engine/components/OperationalRiskDashboard';
import { formatConfidence } from '../src/modules/data-engine/utils/normalizeConfidence';
import { getRecommendationEventLog } from '../src/services/recommendationEngine';
import { getDataEngineEvents } from '../src/modules/data-engine/ingestion/dataEngineIngestion';
import { isRealApiEnabled } from '../services/apiClient';
import { getQueueStats } from '../src/modules/data-engine/eventQueue';
import { flushQueuedEvents } from '../src/modules/data-engine/ingestion/dataEngineEventSender';
import { getTelemetrySnapshot } from '../src/modules/data-engine/telemetry/dataEngineTelemetry';

export const DataEngine: React.FC = () => {
  // State management
  const [selectedIndexDetail, setSelectedIndexDetail] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [selectedDistrict, setSelectedDistrict] = useState('Maslak');
  const [signalFilters, setSignalFilters] = useState({
    source: 'All',
    city: 'All',
    model: 'All',
  });

  // Part Master indices state
  const [partIndices, setPartIndices] = React.useState<DataEngineIndices | null>(null);
  const [indicesLoading, setIndicesLoading] = React.useState(true);
  
  // Part Master catalog state (for Teklifler tab)
  const [catalog, setCatalog] = React.useState<PartMasterCatalog | null>(null);
  const [selectedPart, setSelectedPart] = React.useState<PartMasterPart | null>(null);
  const [searchPartTerm, setSearchPartTerm] = React.useState('');

  // Risk Index Events state
  const [riskIndexEvents, setRiskIndexEvents] = React.useState<RiskIndexEvent[]>([]);
  const [filterVehicleId, setFilterVehicleId] = React.useState('');
  const [maxEventsForDashboard, setMaxEventsForDashboard] = React.useState(100);
  const [selectedEventForDrawer, setSelectedEventForDrawer] = React.useState<RiskIndexEvent | null>(null);
  const [tenantAnalyticsPeriod, setTenantAnalyticsPeriod] = React.useState<'week' | 'month' | 'all'>('month');
  const [operationalRiskSegmentFilter, setOperationalRiskSegmentFilter] = React.useState<'all' | 'medium' | 'high'>('all');
  const [queueFlushLoading, setQueueFlushLoading] = React.useState(false);
  const [telemetry, setTelemetry] = React.useState(getTelemetrySnapshot());
  const tenantId = 'LENT-CORP-DEMO';

  // Load Part Master indices
  React.useEffect(() => {
    const loadIndices = async () => {
      try {
        const pmCatalog = await getPartMasterCatalog('LENT-CORP-DEMO');
        setCatalog(pmCatalog);
        
        const offers = await getSupplierOffers(pmCatalog, 'LENT-CORP-DEMO');
        const indices = await getPartIndices(pmCatalog, offers);
        setPartIndices(indices);
        
        // Select first part by default
        if (pmCatalog.parts.length > 0) {
          setSelectedPart(pmCatalog.parts[0]);
        }
        
        setIndicesLoading(false);
      } catch (error) {
        console.error('[DataEngine] Error loading indices:', error);
        setIndicesLoading(false);
      }
    };
    loadIndices();
  }, []);

  // Load Risk Index Events
  React.useEffect(() => {
    const events = getLastRiskIndexEvents(tenantId, 20);
    setRiskIndexEvents(events);
  }, []);

  // Refresh telemetry every 2 seconds (DEV only)
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      const interval = setInterval(() => {
        setTelemetry(getTelemetrySnapshot());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  // Mock veriyi yükle
  const mockData = mockDataEngineV1;

  // Demo fleet for V2 data engine (Real-world simulation)
  const demoFleet: VehicleProfile[] = useMemo(() => [
    {
      vehicle_id: 'V001',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2018,
      engine: '1.6L',
      transmission: 'Manual',
      last_query: '2025-02-20',
      total_queries: 45,
      mileage: 125000,
      institutionId: 'INST-001',
      average_part_life_score: 72,
      failure_frequency_index: 28,
      risk_score: 45,
      resale_value_prediction: 85000,
      damage_probability: 0.22,
      compatible_parts_count: 324,
    },
    {
      vehicle_id: 'V002',
      brand: 'Honda',
      model: 'Civic',
      year: 2016,
      engine: '1.5L',
      transmission: 'Automatic',
      last_query: '2025-02-21',
      total_queries: 52,
      mileage: 165000,
      institutionId: 'INST-001',
      average_part_life_score: 58,
      failure_frequency_index: 42,
      risk_score: 68,
      resale_value_prediction: 72000,
      damage_probability: 0.52,
      compatible_parts_count: 287,
    },
    {
      vehicle_id: 'V003',
      brand: 'Ford',
      model: 'Focus',
      year: 2017,
      engine: '1.6L',
      transmission: 'Manual',
      last_query: '2025-02-19',
      total_queries: 38,
      mileage: 145000,
      institutionId: 'INST-001',
      average_part_life_score: 65,
      failure_frequency_index: 35,
      risk_score: 52,
      resale_value_prediction: 78000,
      damage_probability: 0.35,
      compatible_parts_count: 295,
    },
    {
      vehicle_id: 'V004',
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2015,
      engine: '1.4L',
      transmission: 'Automatic',
      last_query: '2025-02-21',
      total_queries: 61,
      mileage: 195000,
      institutionId: 'INST-001',
      average_part_life_score: 42,
      failure_frequency_index: 58,
      risk_score: 75,
      resale_value_prediction: 65000,
      damage_probability: 0.71,
      compatible_parts_count: 278,
    },
    {
      vehicle_id: 'V005',
      brand: 'Hyundai',
      model: 'Elantra',
      year: 2019,
      engine: '1.6L',
      transmission: 'Manual',
      last_query: '2025-02-20',
      total_queries: 32,
      mileage: 95000,
      institutionId: 'INST-001',
      average_part_life_score: 82,
      failure_frequency_index: 15,
      risk_score: 28,
      resale_value_prediction: 95000,
      damage_probability: 0.12,
      compatible_parts_count: 306,
    },
  ], []);

  // Build Data Engine Summary V2 (Real calculations from fleet)
  const dataEngineSummary = useMemo(() => {
    return buildDataEngineSummary(demoFleet, {
      maintenanceCompliance: 0.87,
      dataCompletenessRate: 0.94,
    });
  }, [demoFleet]);

  // Demo inventory item (Aftermarket metric hesaplaması için)
  const demoItem: AftermarketProductCard = {
    sku: 'DEMO-001',
    name: 'Demo Ürün',
    brand: 'Demo Brand',
    category: 'Parça',
    oemCodes: [],
    tier: 'EQUIVALENT',
    stock: 100,
    reserved: 10,
    price: 1000,
    last30Sales: 30,
    fitment: [],
    city: selectedCity,
    district: selectedDistrict,
  };

  // ProcessedDemo item dengan data engine scores
  const demoMetrics = useMemo(() => {
    return createAftermarketMetrics(demoItem, {
      selectedCity,
      selectedDistrict,
      targetDays: 30,
    });
  }, [selectedCity, selectedDistrict]);

  // Filtreli sinyalleri hesapla
  const filteredSignals = useMemo(() => {
    return mockData.signals.filter((signal) => {
      const sourceMatch = signalFilters.source === 'All' || signal.source === signalFilters.source;
      const cityMatch = signalFilters.city === 'All' || signal.city === signalFilters.city;
      const modelMatch = signalFilters.model === 'All' || signal.model === signalFilters.model;
      return sourceMatch && cityMatch && modelMatch;
    });
  }, [signalFilters]);

  // Benzersiz değerler
  const uniqueSources = ['All', ...new Set(mockData.signals.map((s) => s.source))];
  const uniqueCities = ['All', ...new Set(mockData.signals.map((s) => s.city))];
  const uniqueModels = ['All', ...new Set(mockData.signals.map((s) => s.model))];

  // Tenant-level analytics calculation
  const tenantMetrics = React.useMemo(() => {
    const allEvents = getLastRiskIndexEvents(tenantId, 1000);
    
    // Apply date range filter
    let filteredEvents = allEvents;
    if (tenantAnalyticsPeriod !== 'all') {
      const now = new Date();
      const cutoff = tenantAnalyticsPeriod === 'week'
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      filteredEvents = allEvents.filter(e => new Date(e.generatedAt) >= cutoff);
    }

    if (filteredEvents.length === 0) {
      return null;
    }

    // Calculate average TrustIndex
    const trustValues = filteredEvents.map(e => {
      if (e.confidenceSummary?.average !== undefined) {
        const val = e.confidenceSummary.average;
        return val <= 1 ? val * 100 : val;
      }
      return 50;
    });
    const avgTrust = trustValues.reduce((a, b) => a + b, 0) / trustValues.length;

    // Calculate average ReliabilityIndex
    const reliabilityValues = filteredEvents.map(e => {
      if (e.indices?.length) {
        const reliabilityIdx = e.indices.find(idx => idx.key === 'reliabilityIndex');
        if (reliabilityIdx && typeof reliabilityIdx.value === 'number') {
          const val = reliabilityIdx.value;
          return val <= 1 ? val * 100 : val > 100 ? Math.min(100, val / 100) : val;
        }
      }
      return 50;
    });
    const avgReliability = reliabilityValues.length > 0 
      ? reliabilityValues.reduce((a, b) => a + b, 0) / reliabilityValues.length
      : 0;

    // Risk segments
    let lowCount = 0, mediumCount = 0, highCount = 0;
    trustValues.forEach(trust => {
      if (trust >= 75) lowCount++;
      else if (trust >= 50) mediumCount++;
      else highCount++;
    });

    // Insurance mismatch rate
    let mismatchCount = 0;
    filteredEvents.forEach(event => {
      if (event.indices) {
        event.indices.forEach(idx => {
          const key = (idx.key || '').toUpperCase();
          if (key.includes('INSURANCE_DAMAGE_INCONSISTENCY') || key.includes('CLAIM_WITHOUT_DAMAGE_RECORD')) {
            mismatchCount++;
          }
        });
      }
    });

    // Top 5 reasonCodes
    const reasonCodeMap = new Map<string, number>();
    filteredEvents.forEach(event => {
      if (event.indices) {
        event.indices.forEach(idx => {
          const key = idx.key || '';
          if (key && !key.includes('Index')) { // Skip index names
            const count = reasonCodeMap.get(key) || 0;
            reasonCodeMap.set(key, count + 1);
          }
        });
      }
    });

    const topReasonCodes = Array.from(reasonCodeMap.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Source breakdown
    const sourceMap = new Map<string, number>();
    filteredEvents.forEach(event => {
      const source = event.source || 'UNKNOWN';
      const count = sourceMap.get(source) || 0;
      sourceMap.set(source, count + 1);
    });

    return {
      avgTrust: Math.min(100, Math.max(0, avgTrust)),
      avgReliability: Math.min(100, Math.max(0, avgReliability)),
      lowRiskPercent: filteredEvents.length > 0 ? Math.round((lowCount / filteredEvents.length) * 100) : 0,
      mediumRiskPercent: filteredEvents.length > 0 ? Math.round((mediumCount / filteredEvents.length) * 100) : 0,
      highRiskPercent: filteredEvents.length > 0 ? Math.round((highCount / filteredEvents.length) * 100) : 0,
      mismatchPercent: filteredEvents.length > 0 ? Math.round((mismatchCount / filteredEvents.length) * 100) : 0,
      topReasonCodes,
      sourceBreakdown: Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
      totalEvents: filteredEvents.length
    };
  }, [tenantAnalyticsPeriod]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Veri Motoru</h2>
        <p className="text-slate-500 mt-1">Görsel altyapı (akış) + endeks üretimi (V0) + stratejik öneriler (V1)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Database size={20} />
            </div>
            <h3 className="font-semibold text-slate-700">Günlük Veri Girişi</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{mockData.kpi.gunlukVeriGirisi.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">kaydı işlendi (bugün)</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <RefreshCw size={20} />
            </div>
            <h3 className="font-semibold text-slate-700">Aktif Kaynaklar</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{mockData.kpi.aktifKaynaklar}</p>
          <p className="text-xs text-slate-500 mt-2">Bakım Merkezi, Aftermarket, Kütüphane, Sigorta, Filo, Galeri</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-semibold text-slate-700">İşlenen Endeks</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">{mockData.kpi.islenenEndeks.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">araç / {mockData.kpi.islenenEndeks.toLocaleString()} skor üretildi</p>
        </div>
      </div>

      {/* Main Layout: 2 Columns (Akış Haritası + Endeks Paneli) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* LEFT: Veri Akış Haritası (V0 - Korundu) */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Cpu size={20} className="text-blue-600" />
            Veri Akış Haritası
          </h3>

          <div className="space-y-6">
            {[
              { num: 1, title: 'Kaynaklar', desc: 'Bakım Merkezi / Aftermarket / Kütüphane / Sigorta / Filo / Galeri', color: 'blue' },
              { num: 2, title: 'Anonim Kimlik Dönüşümü (A2H)', desc: 'Hassas veri maskelenip, araç anonim ID\'ye dönüştürülür', color: 'indigo' },
              { num: 3, title: 'Temizleme & Normalizasyon', desc: 'Eksik değerler doldurulur, veri standardize edilir', color: 'cyan' },
              { num: 4, title: 'Özellik Çıkarımı', desc: 'KM, bölge, parça sınıfı, fiyat aralığı hesaplanır', color: 'purple' },
              { num: 5, title: 'Endeks Üretimi', desc: 'Risk / Dayanıklılık / Maliyet / Tedarik skorları üretilir', color: 'emerald' },
              { num: 6, title: 'Çıktı Modülleri', desc: 'Ekspertiz / Galeri / Sigorta / Filo / Bireysel / Risk Analizi', color: 'amber' },
            ].map((step, idx) => {
              const colorMap = {
                blue: 'bg-blue-50 border-blue-200 text-blue-900',
                indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
                cyan: 'bg-cyan-50 border-cyan-200 text-cyan-900',
                purple: 'bg-purple-50 border-purple-200 text-purple-900',
                emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                amber: 'bg-amber-50 border-amber-200 text-amber-900',
              };
              return (
                <div key={step.num}>
                  <div className={`border rounded-lg p-4 ${colorMap[step.color as keyof typeof colorMap]}`}>
                    <p className="font-bold text-sm">{step.num}. {step.title}</p>
                    <p className="text-xs mt-1 opacity-90">{step.desc}</p>
                  </div>
                  {idx < 5 && <div className="flex justify-center py-2"><div className="w-0.5 h-6 bg-slate-300"></div></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Endeks Paneli (V2) – Yeni Endeksler + Trendler */}
        <div className="space-y-6">
          {/* Endeks Paneli (V2) */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" />
                Endeks Paneli (V2 - Geliştirilmiş)
              </h3>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Filo</p>
                <p className="text-sm font-semibold text-slate-700">{dataEngineSummary.vehicleCount} araç</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {(() => {
                // V2 Endeks Listesi
                const indices = [
                  {
                    key: 'riskIndex',
                    label: 'Risk Endeksi (Son 6 Ay)',
                    value: dataEngineSummary.riskIndex,
                    tooltip: 'Filoningel ortalama risk puanı',
                    isNew: true,
                  },
                  {
                    key: 'durabilityIndex',
                    label: 'Filo Dayanıklılık Ortalaması',
                    value: dataEngineSummary.durabilityIndex,
                    tooltip: 'Araçların yaşlanması ve dayanıklılık göstergesi',
                    isNew: true,
                  },
                  {
                    key: 'costPressureIndex',
                    label: 'Operasyonel Maliyet Endeksi',
                    value: dataEngineSummary.costPressureIndex,
                    tooltip: 'Tamir/bakım maliyet yükü',
                    isNew: true,
                  },
                  {
                    key: 'maintenanceComplianceRatio',
                    label: 'Bakım Uyum Oranı',
                    value: dataEngineSummary.maintenanceComplianceRatio,
                    tooltip: 'Zamanında yapılan bakım yüzdesi',
                    isNew: true,
                  },
                  {
                    key: 'criticalDensity',
                    label: 'Kritik Yoğunluk (% risk ≥60)',
                    value: dataEngineSummary.criticalDensity,
                    tooltip: `Yüksek riskli araçlar: ${dataEngineSummary.criticalVehicleCount}/${dataEngineSummary.vehicleCount}`,
                    isNew: true,
                  },
                  {
                    key: 'dataReliabilityScore',
                    label: 'Veri Güvenilirlik Skoru',
                    value: dataEngineSummary.dataReliabilityScore,
                    tooltip: 'Eksiksiz ve doğru veri oranı',
                    isNew: true,
                  },
                ];

                // Önceki ayın değerleri (demirbaş - genellikle trend ile hesaplanır)
                const previousValues: Record<string, number> = {
                  riskIndex: dataEngineSummary.trend[dataEngineSummary.trend.length - 1]?.risk || 48,
                  durabilityIndex: 70,
                  costPressureIndex: 42,
                  maintenanceComplianceRatio: 85,
                  criticalDensity: 32,
                  dataReliabilityScore: 93,
                };

                return indices.map((index) => {
                  const value = index.value;
                  const prevValue = previousValues[index.key];
                  const trendArrow = getTrendArrow(value, prevValue);

                  // Renk seçimi: Daha düşük genellikle daha iyi risk endekslerinde
                  const getColor = (val: number, isRisk: boolean = false) => {
                    if (isRisk) {
                      // Risk endeksleri için: düşük iyi, yüksek kötü
                      if (val < 35) return 'text-emerald-600';
                      if (val < 60) return 'text-amber-600';
                      return 'text-rose-600';
                    }
                    // Pozitif endeksler için: yüksek iyi, düşük kötü
                    if (val > 70) return 'text-emerald-600';
                    if (val > 40) return 'text-amber-600';
                    return 'text-rose-600';
                  };

                  const getBarColor = (val: number, isRisk: boolean = false) => {
                    if (isRisk) {
                      if (val < 35) return 'bg-emerald-500';
                      if (val < 60) return 'bg-amber-500';
                      return 'bg-rose-500';
                    }
                    if (val > 70) return 'bg-emerald-500';
                    if (val > 40) return 'bg-amber-500';
                    return 'bg-rose-500';
                  };

                  const isRiskMetric =
                    index.key === 'riskIndex' || index.key === 'costPressureIndex' || index.key === 'criticalDensity';

                  return (
                    <div key={index.key} className="bg-white rounded-lg p-4 border border-slate-100 hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-500 uppercase">{index.label}</p>
                          {index.isNew && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">V2</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${trendArrow === '→' ? 'text-slate-400' : trendArrow === '↑' ? (isRiskMetric ? 'text-rose-600' : 'text-emerald-600') : (isRiskMetric ? 'text-emerald-600' : 'text-rose-600')}`}>
                            {trendArrow}
                          </span>
                          <button
                            onClick={() => setSelectedIndexDetail(selectedIndexDetail === index.key ? null : index.key)}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            title="Detay göster"
                          >
                            <Info size={14} className="text-indigo-600" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-2xl font-bold ${getColor(value, isRiskMetric)}`}>
                          {Math.round(value)}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">← {Math.round(prevValue)}</span>
                      </div>

                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getBarColor(value, isRiskMetric)}`}
                          style={{ width: `${Math.min(value, 100) || 0}%` }}
                        ></div>
                      </div>

                      {/* Detay Açıklaması - Single Source of Truth von fleetSummary */}
                      {selectedIndexDetail === index.key && (() => {
                        const explanation = getFormulaExplanation(dataEngineSummary, index.key as keyof typeof dataEngineSummary.formulaNotes);
                        return (
                          <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 rounded p-3">
                            <p className="text-xs font-bold text-slate-700 mb-2">📋 Açıklama:</p>
                            <p className="text-xs text-slate-600 mb-2">{explanation.rationale}</p>
                            <p className="text-xs font-bold text-slate-700 mb-2">🧮 Formül (buildFleetRiskSummary):</p>
                            <p className="text-xs text-slate-600 font-mono bg-white p-2 rounded border border-blue-200 mb-3 text-blue-900">
                              {explanation.formula}
                            </p>
                            <p className="text-xs font-bold text-slate-700 mb-1">🔗 Veri Kaynakları:</p>
                            <div className="flex flex-wrap gap-1">
                              {explanation.sources.map((src) => (
                                <span key={src} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">
                                  {src}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Özet Bilgiler + Security Assessment */}
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase font-bold">Kritik Araçlar</p>
                    <p className="text-xl font-bold text-slate-800">{dataEngineSummary.criticalVehicleCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase font-bold">Ort. Maruz Kalma</p>
                    <p className="text-xl font-bold text-slate-800">₺{dataEngineSummary.averageExposure.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600 uppercase font-bold">Toplam Filo</p>
                    <p className="text-xl font-bold text-slate-800">{dataEngineSummary.vehicleCount}</p>
                  </div>
                </div>
              </div>

              {/* Security Index (from fleetSummary) */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-bold text-slate-700 mb-2">🛡️ Filo Güvenlik Derecesi</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{dataEngineSummary.securityIndex.grade}</p>
                    <p className="text-xs text-slate-600">{Math.round(dataEngineSummary.securityIndex.score01 * 100)}% Güven</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-1">Nedenler:</p>
                    <ul className="text-xs text-slate-600 space-y-0.5">
                      {dataEngineSummary.securityIndex.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-slate-400">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stratejik Öneriler (V1) + Simülasyon */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-600" />
              Stratejik Öneriler (V1) - Simülasyon Bağlantılı
            </h3>

            {/* Bugünün Aksiyonu */}
            <div className="bg-white rounded-lg border border-amber-100 p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-amber-700 uppercase mb-2">Bugünün Aksiyonu</p>
                  <p className="text-sm text-slate-800 font-medium mb-3">{mockData.strategicRecommendations.today.recommendation}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded-full font-bold">ACİL</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                      {mockData.strategicRecommendations.today.region || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Parça Grubu</p>
                    <p className="text-sm font-semibold text-slate-800">{mockData.strategicRecommendations.today.partGroup}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Segment</p>
                    <p className="text-sm font-semibold text-slate-800">{mockData.strategicRecommendations.today.segment}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Stok Değişimi</p>
                    <p className={`text-sm font-bold ${mockData.strategicRecommendations.today.changePercent > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {mockData.strategicRecommendations.today.changePercent > 0 ? '+' : ''}{mockData.strategicRecommendations.today.changePercent}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Güven Oranı</p>
                    <p className="text-sm font-semibold text-slate-800">{(mockData.strategicRecommendations.today.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Etki Skoru:</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        mockData.strategicRecommendations.today.impact > 70
                          ? 'bg-rose-500'
                          : mockData.strategicRecommendations.today.impact > 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(mockData.strategicRecommendations.today.impact, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{mockData.strategicRecommendations.today.impact}</span>
                </div>
              </div>
            </div>

            {/* Bu Hafta */}
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-600 uppercase mb-3">Bu Hafta (Simülasyon Alanları Dahil)</p>
              <div className="space-y-3">
                {mockData.strategicRecommendations.thisWeek.map((rec) => (
                  <div key={rec.id} className="bg-white rounded-lg p-4 border border-slate-200 overflow-x-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <p className="text-xs font-bold text-slate-800">{rec.priority}. {rec.title}</p>
                        <p className="text-xs text-slate-600 mt-2">{rec.detail}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Bölge</p>
                          <p className="text-xs font-semibold text-slate-800">{rec.region}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Parça</p>
                          <p className="text-xs font-semibold text-slate-800">{rec.partGroup}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Segment</p>
                          <p className="text-xs font-semibold text-slate-800">{rec.segment}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Güven</p>
                          <p className="text-xs font-semibold text-slate-800">{(rec.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Stok Değişimi</p>
                          <p className={`text-sm font-bold ${rec.changePercent > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {rec.changePercent > 0 ? '+' : ''}{rec.changePercent}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Etki Skoru</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rec.impact > 70
                                    ? 'bg-rose-500'
                                    : rec.impact > 40
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(rec.impact, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">{rec.impact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notlar */}
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <p className="text-xs font-bold text-slate-700 mb-1">Notlar</p>
              <p className="text-xs text-slate-600">{mockData.strategicRecommendations.notes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bölgesel Konumlandırma (V1) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-8">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Database size={20} className="text-blue-600" />
          Bölgesel Konumlandırma (V1)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Bölge</th>
                <th className="px-4 py-3 text-center">Talep Endeksi</th>
                <th className="px-4 py-3 text-center">Tedarik Zorluğu</th>
                <th className="px-4 py-3 text-center">Önerilen Pozisyon</th>
                <th className="px-4 py-3">Açıklama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockData.regionalPositioning.map((region, idx) => {
                // Normalize demandIndex (1.xx format) to 0-100 scale
                const demandScore = Math.round(50 + (region.demandIndex - 1.0) * 190);
                const getColorClass = () => {
                  if (demandScore >= 80) return 'bg-red-50 border-red-200';
                  if (demandScore >= 60) return 'bg-orange-50 border-orange-200';
                  if (demandScore >= 40) return 'bg-yellow-50 border-yellow-200';
                  return 'bg-green-50 border-green-200';
                };
                const getBarColor = () => {
                  if (demandScore >= 80) return 'bg-red-500';
                  if (demandScore >= 60) return 'bg-orange-500';
                  if (demandScore >= 40) return 'bg-yellow-500';
                  return 'bg-green-500';
                };
                return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {region.city} / {region.district}
                  </td>
                  <td className="px-4 py-3">
                    <div className={`rounded-lg border p-3 ${getColorClass()}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-700">Talep Endeksi</span>
                        <span className="text-lg font-bold text-slate-800">{demandScore}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getBarColor()}`}
                          style={{ width: `${Math.min(demandScore, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1">Orijinal: {region.demandIndex.toFixed(2)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        region.supplyDifficulty === 'Yüksek'
                          ? 'bg-rose-100 text-rose-700'
                          : region.supplyDifficulty === 'Orta'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {region.supplyDifficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        region.stockPosition === 'Artır'
                          ? 'bg-blue-100 text-blue-700'
                          : region.stockPosition === 'Koru'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {region.stockPosition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{region.rationale}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sinyal Günlüğü – Filtreli (V1) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
            <RefreshCw size={18} className="text-slate-400" />
            Sinyal Günlüğü (V1 - Filtreleme)
          </h3>

          {/* Filtreler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Kaynak</label>
              <select
                value={signalFilters.source}
                onChange={(e) => setSignalFilters({ ...signalFilters, source: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {uniqueSources.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Şehir</label>
              <select
                value={signalFilters.city}
                onChange={(e) => setSignalFilters({ ...signalFilters, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Araç Modeli</label>
              <select
                value={signalFilters.model}
                onChange={(e) => setSignalFilters({ ...signalFilters, model: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {uniqueModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            {filteredSignals.length} / {mockData.signals.length} sinyal gösterilliyor
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Kaynak</th>
                <th className="px-6 py-4">Bölge</th>
                <th className="px-6 py-4">Araç</th>
                <th className="px-6 py-4">Olay</th>
                <th className="px-6 py-4 text-center">Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSignals.map((signal) => (
                <tr key={signal.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{signal.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded">{signal.source}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {signal.city} / {signal.district}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {signal.brand} {signal.model}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{signal.event}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                        signal.riskScore > 70
                          ? 'bg-rose-100 text-rose-700'
                          : signal.riskScore > 40
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {signal.riskScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSignals.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">Seçilen filtrelere uygun sinyal bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Part Master Indices Panel */}
      {partIndices && (
        <div className="mt-8 space-y-8">
          <div>
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-600" />
              Parça Endeksleri (Part Indices)
            </h3>

            {/* Top Categories */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {partIndices.categoryMetrics.slice(0, 4).map((cat) => (
                <div key={cat.category} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase">{cat.category}</p>
                  <p className="text-2xl font-black text-slate-800">{cat.partCount}</p>
                  <p className="text-xs text-slate-500 mt-1">parça</p>
                  <p className="text-[10px] text-red-600 mt-2 font-bold">{cat.highRiskCount} yüksek risk</p>
                </div>
              ))}
            </div>

            {/* Top Supply Stress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  Tedarik Baskısı (Top 10)
                </h4>
                <div className="space-y-3">
                  {partIndices.topSupplyStress.slice(0, 5).map((item) => (
                    <div key={item.partMasterId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="text-sm">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{item.supplyStress}%</p>
                        <p className="text-xs text-slate-400">risk score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Volatility */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-orange-600" />
                  Fiyat Volatilitesi (Top 10)
                </h4>
                <div className="space-y-3">
                  {partIndices.topPriceVolatility.slice(0, 5).map((item) => (
                    <div key={item.partMasterId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="text-sm">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{item.priceVolatility}%</p>
                        <p className="text-xs text-slate-400">volatility</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Score & Demand Pressure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  Düşük Güven Skoru (Top 10)
                </h4>
                <div className="space-y-3">
                  {partIndices.lowTrustScore.slice(0, 5).map((item) => (
                    <div key={item.partMasterId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="text-sm">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{item.trustScore}</p>
                        <p className="text-xs text-slate-400">güven skoru</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demand Pressure */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Database size={18} className="text-cyan-600" />
                  Talep Baskısı (Top 10)
                </h4>
                <div className="space-y-3">
                  {partIndices.topDemandPressure.slice(0, 5).map((item) => (
                    <div key={item.partMasterId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="text-sm">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.partGroup || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{item.demandPressure}%</p>
                        <p className="text-xs text-slate-400">pressure</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Index Summary */}
            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border border-slate-200 shadow-sm p-6">
              <h4 className="font-bold text-slate-800 mb-4">Ortalama Endeksler (Averages)</h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Fiyat Volatilitesi</p>
                  <p className="text-2xl font-black text-slate-800">{partIndices.averages.priceVolatility}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Tedarik Baskısı</p>
                  <p className="text-2xl font-black text-slate-800">{partIndices.averages.supplyStress}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Talep Baskısı</p>
                  <p className="text-2xl font-black text-slate-800">{partIndices.averages.demandPressure}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase">Güven Skoru</p>
                  <p className="text-2xl font-black text-slate-800">{partIndices.averages.trustScore}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teklifler (Supplier Offers) Panel */}
      {catalog && (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Package size={20} className="text-amber-600" />
              Teklifler (Supplier Offers)
            </h3>

            {/* Part List + Offers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT: Part Selection List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <input
                    type="text"
                    placeholder="Parça adı veya SKU ara..."
                    value={searchPartTerm}
                    onChange={(e) => setSearchPartTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="overflow-y-auto flex-1 max-h-[600px]">
                  {catalog.parts
                    .filter(
                      (part) =>
                        part.name.toLowerCase().includes(searchPartTerm.toLowerCase()) ||
                        part.sku.toLowerCase().includes(searchPartTerm.toLowerCase())
                    )
                    .map((part) => (
                      <button
                        key={part.partMasterId}
                        onClick={() => setSelectedPart(part)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-colors hover:bg-amber-50 ${
                          selectedPart?.partMasterId === part.partMasterId
                            ? 'bg-amber-50 border-l-4 border-l-amber-600'
                            : ''
                        }`}
                      >
                        <div className="font-semibold text-slate-800 text-sm">{part.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{part.sku}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{part.category}</div>
                      </button>
                    ))}
                </div>

                <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                  <p className="text-xs text-slate-500 font-bold">Toplam {catalog.parts.length} parça</p>
                </div>
              </div>

              {/* RIGHT: Offers Display */}
              <div className="lg:col-span-2">
                {selectedPart ? (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="mb-6 pb-6 border-b border-slate-200">
                      <h4 className="text-lg font-bold text-slate-800">{selectedPart.name}</h4>
                      <p className="text-sm text-slate-500 mt-1">SKU: <span className="font-mono font-bold">{selectedPart.sku}</span></p>
                      <p className="text-sm text-slate-500">Kategori: <span className="font-bold">{selectedPart.category}</span></p>
                    </div>

                    {/* OffersPanel Component */}
                    <OffersPanel
                      selectedPart={selectedPart}
                      institutionId="INST-001"
                      tenantId="LENT-CORP-DEMO"
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <Package size={32} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500">Bir parça seçin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tenant-Level Analytics Dashboard */}
      <div className="mt-8">
        <TenantAnalyticsDashboard 
          metrics={tenantMetrics}
          period={tenantAnalyticsPeriod}
          onPeriodChange={setTenantAnalyticsPeriod}
        />
      </div>

      {/* Operational Risk List - Aksiyon Katmanı */}
      <div className="mt-8">
        <OperationalRiskList 
          events={getLastRiskIndexEvents(tenantId, 500)}
          period={tenantAnalyticsPeriod}
          onPeriodChange={setTenantAnalyticsPeriod}
          segmentFilter={operationalRiskSegmentFilter}
          onSegmentFilterChange={setOperationalRiskSegmentFilter}
          onSelectVehicle={(vehicleId, event) => setSelectedEventForDrawer(event)}
        />
      </div>

      {/* Risk Segment Dashboard - Toplu Analitik */}
      <div className="mt-8">
        <RiskSegmentDashboard 
          events={getLastRiskIndexEvents(tenantId, 500)} 
          maxEvents={maxEventsForDashboard}
          onMaxEventsChange={setMaxEventsForDashboard}
        />
      </div>

      {/* Operational Risk Analytics - Kural Tetikleme Metrikleri + Risk Dağılımı */}
      <div className="mt-8">
        <OperationalRiskDashboard 
          events={getRecommendationEventLog()}
          showDevJson={import.meta.env.DEV}
        />
      </div>

      {/* Data Engine Event Stream (Phase 6.1 Ingestion, Phase 6.2 Sender) */}
      <div className="mt-8 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Event Stream (Ingestion) - Son 50 Olay
            </h3>
            {import.meta.env.DEV && (
              <div className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono">
                Sender: {isRealApiEnabled() ? "REAL (HTTP)" : "MOCK (Local)"}
              </div>
            )}
          </div>

          {(() => {
            const allEvents = getDataEngineEvents();
            const recentEvents = allEvents.slice(0, 50);

            if (recentEvents.length === 0) {
              return (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                  <Database size={32} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">Henüz hiçbir event kaydedilmemiştir</p>
                  <p className="text-xs text-slate-400 mt-2">Recommendations üretilince veya risk indices hesaplanınca olaylar burada görünecektir</p>
                </div>
              );
            }

            return (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Zaman</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Event Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Source</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700">Vehicle ID</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentEvents.map((evt) => (
                        <tr key={evt.eventId} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 text-slate-600 text-xs font-mono">
                            {new Date(evt.occurredAt).toLocaleString('tr-TR')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              evt.eventType === "RECOMMENDATIONS_GENERATED"
                                ? "bg-amber-100 text-amber-700"
                                : evt.eventType === "RISK_INDICES_UPDATED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {evt.eventType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-sm">
                            <span className="font-mono text-xs">{evt.source}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-semibold">
                            {evt.vehicleId}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {import.meta.env.DEV && (
                              <details className="inline-block group">
                                <summary className="cursor-pointer font-semibold text-blue-600 hover:text-blue-700 text-xs">
                                  Details
                                </summary>
                                <div className="absolute right-0 top-8 w-96 bg-slate-900 text-slate-100 p-3 rounded border border-slate-700 shadow-lg z-50 hidden group-open:block max-h-64 overflow-auto">
                                  <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                                    {JSON.stringify(
                                      {
                                        ...evt,
                                        payload: evt.payload /* sanitized in UI already */,
                                      },
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div>
                              </details>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* DEV-only: Event Queue Diagnostics (Phase 6.3) */}
      {import.meta.env.DEV && (
        <div className="mt-8">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-600" />
                  Event Queue (DEV)
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {(() => {
                    const stats = getQueueStats();
                    if (stats.size === 0) {
                      return "No events queued (✓ clean)";
                    }
                    return `${stats.size} event(s) pending retry | Oldest: ${stats.oldestAt ? new Date(stats.oldestAt).toLocaleTimeString('tr-TR') : 'N/A'} | Next retry: ${stats.oldestRetryAt ? new Date(stats.oldestRetryAt).toLocaleTimeString('tr-TR') : 'N/A'}`;
                  })()}
                </p>
              </div>
              <button
                onClick={async () => {
                  setQueueFlushLoading(true);
                  try {
                    const result = await flushQueuedEvents();
                    console.log("[DataEngine] Queue flush result:", result);
                  } catch (err) {
                    console.error("[DataEngine] Queue flush failed:", err);
                  } finally {
                    setQueueFlushLoading(false);
                  }
                }}
                disabled={queueFlushLoading || getQueueStats().size === 0}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  queueFlushLoading
                    ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                    : getQueueStats().size === 0
                    ? "bg-slate-200 text-slate-400 cursor-default"
                    : "bg-purple-600 text-white hover:bg-purple-700 active:scale-95"
                }`}
              >
                {queueFlushLoading ? "Flushing..." : "Flush Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEV-only: Data Engine Telemetry (Phase 6.5) */}
      {import.meta.env.DEV && (
        <div className="mt-8">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Database size={16} className="text-blue-600" />
                  Telemetry (DEV)
                </h4>
                <div className="text-xs text-slate-600 mt-2 grid grid-cols-2 gap-2">
                  <div>Sent: <span className="font-semibold text-green-600">{telemetry.totalSent}</span></div>
                  <div>Queued: <span className="font-semibold text-yellow-600">{telemetry.totalQueued}</span></div>
                  <div>Failed: <span className="font-semibold text-red-600">{telemetry.totalFailed}</span></div>
                  <div>Avg Latency: <span className="font-semibold">{telemetry.averageLatencyMs}ms</span></div>
                  <div>Queue Size: <span className="font-semibold">{telemetry.queueSize}</span></div>
                  <div>Success: <span className="font-semibold text-green-600">{telemetry.successRate.toFixed(1)}%</span></div>
                  <div>
                    Circuit: 
                    <span className={`font-semibold ml-1 ${
                      telemetry.circuitState === "CLOSED" 
                        ? "text-green-600" 
                        : telemetry.circuitState === "OPEN" 
                        ? "text-red-600" 
                        : "text-yellow-600"
                    }`}>
                      {telemetry.circuitState || "CLOSED"}
                    </span>
                  </div>
                  <div>Rate Limited: <span className="font-semibold text-orange-600">{telemetry.rateLimitedCount || 0}</span></div>
                </div>
                {telemetry.lastError && (
                  <p className="text-xs text-red-600 mt-2">Last Error: {telemetry.lastError}</p>
                )}
              </div>

              {/* Adaptive Runtime Config */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Settings size={16} className="text-purple-600" />
                  Adaptive Runtime Config (DEV)
                </h4>
                <div className="text-xs text-slate-600 mt-2 grid grid-cols-2 gap-2">
                  <div>Max Requests/10s: <span className="font-semibold text-purple-600">{telemetry.dynamicConfig?.maxRequestsPerWindow || 20}</span></div>
                  <div>Failure Threshold: <span className="font-semibold text-purple-600">{telemetry.dynamicConfig?.circuitFailureThreshold || 5}</span></div>
                  <div>Circuit Timeout: <span className="font-semibold text-purple-600">{telemetry.dynamicConfig?.circuitOpenTimeoutMs || 30000}ms</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Index Events */}
      <div className="mt-8 space-y-6">
        <div>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database size={20} className="text-blue-600" />
            Risk Index Events (Son 20)
          </h3>

          {/* Filter */}
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Vehicle ID filtrele..."
              value={filterVehicleId}
              onChange={(e) => setFilterVehicleId(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {filterVehicleId && (
              <button
                onClick={() => {
                  setFilterVehicleId('');
                  setRiskIndexEvents(getLastRiskIndexEvents(tenantId, 20));
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition"
              >
                Temizle
              </button>
            )}
            {filterVehicleId && (
              <button
                onClick={() => {
                  const filtered = getRiskIndexEventsByVehicleId(tenantId, filterVehicleId, 20);
                  setRiskIndexEvents(filtered);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                Filtrele
              </button>
            )}
          </div>

          {/* Events Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            {riskIndexEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Database size={32} className="mx-auto mb-4 text-slate-300" />
                <p>Henüz risk index event bulunmamaktadır</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Zaman</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Vehicle ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Trust</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Reliability</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Maintenance</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Güven Ort.</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Kaynak</th>
                  </tr>
                </thead>
                <tbody>
                  {riskIndexEvents.map((event, idx) => {
                    const trustIdx = event.indices.find(i => i.key === 'trustIndex');
                    const reliabilityIdx = event.indices.find(i => i.key === 'reliabilityIndex');
                    const maintenanceIdx = event.indices.find(i => i.key === 'maintenanceDiscipline');

                    return (
                      <tr
                        key={event.id}
                        onClick={() => setSelectedEventForDrawer(event)}
                        className="border-b border-slate-100 hover:bg-blue-50 transition cursor-pointer"
                      >
                        <td className="px-4 py-3 text-slate-700 text-xs">
                          {new Date(event.generatedAt).toLocaleString('tr-TR')}
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-semibold">{event.vehicleId}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {trustIdx ? (Math.round(trustIdx.value * 100) / 100).toFixed(1) : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {reliabilityIdx ? (Math.round(reliabilityIdx.value * 100) / 100).toFixed(1) : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {maintenanceIdx ? (Math.round(maintenanceIdx.value * 100) / 100).toFixed(1) : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-semibold">
                          {event.confidenceSummary
                            ? (() => {
                                let conf = event.confidenceSummary.average;
                                // Normalize: if 0-1, convert to 0-100
                                if (conf <= 1) conf *= 100;
                                // Bound to 0-100
                                conf = Math.min(100, Math.max(0, conf));
                                return conf.toFixed(1) + '%';
                              })()
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {event.source}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Drilldown Drawer - Araç Öyküsü */}
      {selectedEventForDrawer && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedEventForDrawer(null)} />
      )}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform z-50 overflow-y-auto ${
          selectedEventForDrawer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedEventForDrawer && selectedEventForDrawer.vehicleId && (
          <div className="space-y-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="font-bold text-lg text-slate-900">📌 Araç Öyküsü (Drilldown)</h3>
              <button
                onClick={() => setSelectedEventForDrawer(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Vehicle Header - VehicleID and Event Time only (No PII) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-slate-700">Vehicle ID</span>
                <span className="font-bold text-lg text-blue-900">{selectedEventForDrawer.vehicleId}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-blue-200 pt-2">
                <span className="text-slate-600">Event Zamanı</span>
                <span className="text-slate-700">
                  {new Date(selectedEventForDrawer.generatedAt).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Event Details Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase">Event Detayları</h4>

              {/* Risk Indices */}
              {selectedEventForDrawer.indices && selectedEventForDrawer.indices.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Endeksler</p>
                  <div className="space-y-1 text-xs">
                    {selectedEventForDrawer.indices.map((idx, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-slate-600">{idx.key}</span>
                        <span className="font-semibold text-slate-800">
                          {typeof idx.value === 'number' ? idx.value.toFixed(2) : idx.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Summary */}
              {selectedEventForDrawer.confidenceSummary && (
                <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Güven Özeti</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ortalama</span>
                      <span className="font-semibold text-slate-800">
                        {formatConfidence(selectedEventForDrawer.confidenceSummary.average)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Min</span>
                      <span className="font-semibold text-slate-800">
                        {formatConfidence(selectedEventForDrawer.confidenceSummary.min)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Max</span>
                      <span className="font-semibold text-slate-800">
                        {formatConfidence(selectedEventForDrawer.confidenceSummary.max)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Source */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <p className="text-xs font-semibold text-slate-700 mb-2">Veri Kaynağı</p>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium inline-block">
                  {selectedEventForDrawer.source}
                </span>
              </div>
              {/* Raw Meta JSON - DEV MODE ONLY (PII-SAFE SANITIZED) */}
              {import.meta.env.DEV && selectedEventForDrawer.indices && selectedEventForDrawer.indices.some(idx => idx.meta) && (
                <details className="bg-slate-50 border border-slate-200 rounded p-3 text-xs">
                  <summary className="font-semibold text-slate-700 cursor-pointer hover:text-slate-900">
                    Raw Meta JSON (Genişlet) - DEV ONLY [PII-safe: sanitized]
                  </summary>
                  <div className="mt-2 overflow-auto max-h-40 bg-slate-900 text-slate-100 p-2 rounded text-xs font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(
                      selectedEventForDrawer.indices
                        .filter(idx => idx.meta)
                        .map(idx => ({ key: idx.key, meta: sanitizeMeta(idx.meta) })),
                      null,
                      2
                    )}
                  </div>
                </details>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-4">
              <button
                onClick={() => setSelectedEventForDrawer(null)}
                className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium text-slate-700 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
