import React, { useState, useMemo } from 'react';
import { Cpu, Database, RefreshCw, TrendingUp, AlertTriangle, Info, ChevronDown, X } from 'lucide-react';
import { mockDataEngineV1 } from '../data/dataEngine.mock';
import { createAftermarketMetrics } from '../utils/aftermarketMetrics';
import { AftermarketProductCard } from '../types';

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

  // Mock veriyi yükle
  const mockData = mockDataEngineV1;

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

        {/* RIGHT: Endeks Paneli (V0) + V1 Stratejik Öneriler */}
        <div className="space-y-6">
          {/* Endeks Paneli (V0) */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" />
                Endeks Paneli (V0)
              </h3>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Seçili Bölge</p>
                <p className="text-sm font-semibold text-slate-700">{selectedCity} / {selectedDistrict}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {(() => {
                // Data Engine Scores (now dynamic from demoMetrics)
                const scores = {
                  genelRisk: Math.round(demoMetrics?.generalRisk ?? 0),
                  dayanıklılık: Math.round(demoMetrics?.durability ?? 0),
                  maliyetBaskısı: Math.round(demoMetrics?.costPressure ?? 0),
                  tedarikStresi: Math.round(demoMetrics?.supplyStress ?? 0),
                  guvenSkoru: Math.round(demoMetrics?.trustScore ?? 0),
                  markaEtkisi: Math.round(demoMetrics?.brandImpact ?? 0),
                };

                const indices = [
                  { key: 'genelRisk', label: 'Genel Risk', scoreKey: 'genelRisk' as const },
                  { key: 'dayanıklılık', label: 'Dayanıklılık', scoreKey: 'dayanıklılık' as const },
                  { key: 'maliyetBaskısı', label: 'Maliyet Baskısı', scoreKey: 'maliyetBaskısı' as const },
                  { key: 'tedarikStresi', label: 'Tedarik Stresi', scoreKey: 'tedarikStresi' as const },
                  { key: 'guvenSkoru', label: 'Güven Skoru', scoreKey: 'guvenSkoru' as const },
                  { key: 'markaEtkisi', label: 'Marka Etkisi', scoreKey: 'markaEtkisi' as const, isNew: true },
                ];

                return indices.map((index) => {
                  const value = scores[index.scoreKey];
                  return (
                    <div key={index.key} className="bg-white rounded-lg p-4 border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-500 uppercase">{index.label}</p>
                          {index.isNew && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">V1</span>}
                        </div>
                        <button
                          onClick={() => setSelectedIndexDetail(selectedIndexDetail === index.key ? null : index.key)}
                          className="p-1 hover:bg-slate-100 rounded transition-colors"
                          title="Detay göster"
                        >
                          <Info size={14} className="text-indigo-600" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-2xl font-bold ${value > 70 ? 'text-rose-600' : value > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {value || '—'}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            value > 70 ? 'bg-rose-500' : value > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(value, 100) || 0}%` }}
                        ></div>
                      </div>

                      {/* Detay Açıklaması (Dinamik) */}
                      {selectedIndexDetail === index.key && mockData.indexMeta[index.key as keyof typeof mockData.indexMeta] && (
                        <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 rounded p-3">
                          <p className="text-xs font-bold text-slate-700 mb-2">Formül:</p>
                          <p className="text-xs text-slate-600 font-mono mb-3">{mockData.indexMeta[index.key as keyof typeof mockData.indexMeta].formula}</p>
                          <p className="text-xs font-bold text-slate-700 mb-1">Veri Kaynakları:</p>
                          <div className="flex flex-wrap gap-1">
                            {mockData.indexMeta[index.key as keyof typeof mockData.indexMeta].dataSources.map((src) => (
                              <span key={src} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">
                                {src}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
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
    </div>
  );
};
