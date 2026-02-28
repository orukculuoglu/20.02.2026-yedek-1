/**
 * Vehicle Intelligence Panel
 * Displays comprehensive vehicle analysis from VehicleAggregate
 */

import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Clock, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { vehicleIntelligenceStore, generateStatusBadge, generateSummaryLine } from '../../vehicle-intelligence';
import { rebuildVehicleAggregate } from '../../vehicle-intelligence/vehicleAggregator';
import { vioStore } from '../intelligence/vioStore';
import { generateAndStoreVIO, getLastGenerationStatus } from '../intelligence/vioOrchestrator';
import type { VehicleAggregate } from '../../vehicle-intelligence/types';
import type { VehicleIntelligenceOutput } from '../intelligence/vioTypes';

interface VehicleIntelligencePanelProps {
  onBack?: () => void;
}

export function VehicleIntelligencePanel({ onBack }: VehicleIntelligencePanelProps) {
  const [vehicleId, setVehicleId] = useState<string>('');
  const [vin, setVin] = useState<string>('');
  const [plate, setPlate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aggregate, setAggregate] = useState<VehicleAggregate | null>(null);
  const [vio, setVio] = useState<VehicleIntelligenceOutput | null>(null);
  const [activeTab, setActiveTab] = useState<'intelligence' | 'machine-output'>('intelligence');
  
  // VIO generation status tracking
  const [vioGenerationStatus, setVioGenerationStatus] = useState<{
    status: 'ok' | 'failed';
    at: string;
    error?: string;
  } | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  // UI polish: Evidence toggle and copy feedback
  const [showEvidence, setShowEvidence] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<'summary' | 'json' | null>(null);

  // Debug flag for Machine Output tab visibility (?debug=1 in URL)
  const debugEnabled = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('debug') === '1' : false;
  
  // Force activeTab to 'intelligence' if debug is disabled and tab is 'machine-output'
  React.useEffect(() => {
    if (!debugEnabled && activeTab === 'machine-output') {
      setActiveTab('intelligence');
    }
  }, [debugEnabled, activeTab]);

  const handleLoadVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId.trim() || !plate.trim()) {
      setError('Lütfen araç ID ve plakasını girin');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await vehicleIntelligenceStore.getOrBuild(
        vehicleId.trim(),
        vin.trim() || `VIN-${vehicleId}`,
        plate.trim().toUpperCase()
      );

      setAggregate(result);
      // VIO generation happens in useEffect when aggregate changes
      console.log('[VehicleIntelligencePanel] ✓ Vehicle aggregate loaded:', result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(`Araç yüklenirken hata: ${message}`);
      setAggregate(null);
      setVio(null);
      setVioGenerationStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Auto-generate VIO when aggregate loads/changes
   */
  useEffect(() => {
    if (!aggregate) return;

    console.log('[VehicleIntelligencePanel] Generating VIO for aggregate:', aggregate.plate);

    // Generate and store VIO through orchestrator
    const genResult = generateAndStoreVIO(aggregate);

    if (genResult.ok === true) {
      // Load generated VIO for machine output tab
      const vioResult = vioStore.get(aggregate.vehicleId);
      setVio(vioResult);

      // Store generation status
      setVioGenerationStatus({
        status: 'ok',
        at: genResult.generatedAt,
      });

      console.log('[VehicleIntelligencePanel] ✓ VIO generated successfully');
    } else if (genResult.ok === false) {
      // Generation failed but aggregate is loaded
      setVio(null);
      const errorMsg = genResult.error;
      setVioGenerationStatus({
        status: 'failed',
        at: new Date().toISOString(),
        error: errorMsg,
      });

      console.warn('[VehicleIntelligencePanel] ⚠️ VIO generation failed:', errorMsg);
    }
  }, [aggregate?.vehicleId, aggregate?.timestamp]);

  /**
   * Manual recalculate intelligence action
   * Rebuilds aggregate which triggers VIO regeneration via useEffect
   * (useEffect watches aggregate.timestamp which changes on rebuild)
   */
  const handleRecalculateIntelligence = () => {
    if (!aggregate) return;

    try {
      setIsRecalculating(true);

      // Rebuild aggregate from scratch (refresh all calculations)
      const refreshed = rebuildVehicleAggregate(aggregate);
      
      // Update aggregate state, which triggers useEffect for VIO generation
      // timestamp changes automatically, so useEffect dependency [aggregate?.timestamp] will fire
      setAggregate(refreshed);

      console.log('[VehicleIntelligencePanel] ✓ Intelligence recalculation triggered');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
      console.error('[VehicleIntelligencePanel] Error recalculating:', message);
      setError(`Yeniden hesaplama hatası: ${message}`);
    } finally {
      setIsRecalculating(false);
    }
  };

  /**
   * Copy summary to clipboard
   */
  const handleCopySummary = () => {
    if (!aggregate) return;
    navigator.clipboard.writeText(aggregate.insightSummary).then(() => {
      setCopyFeedback('summary');
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  /**
   * Copy VIO JSON to clipboard
   */
  const handleCopyJSON = () => {
    if (!vio) return;
    navigator.clipboard.writeText(JSON.stringify(vio, null, 2)).then(() => {
      setCopyFeedback('json');
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  const statusBadge = useMemo(() => {
    if (!aggregate) return '';
    return generateStatusBadge(
      aggregate.indexes.trustIndex,
      aggregate.derived.structuralRisk,
      aggregate.derived.mechanicalRisk,
      aggregate.derived.odometerAnomaly
    );
  }, [aggregate]);

  const summaryLine = useMemo(() => {
    if (!aggregate) return '';
    return generateSummaryLine(
      aggregate.indexes.trustIndex,
      aggregate.indexes.reliabilityIndex,
      aggregate.dataSources.damageRecords.length,
      aggregate.dataSources.serviceRecords.length
    );
  }, [aggregate]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Araç Zekası</h1>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            ← Geri
          </button>
        )}
      </div>

      {/* Vehicle Input Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Araç Bilgilerini Girin</h2>
        <form onSubmit={handleLoadVehicle} className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Araç ID (Gerekli)"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="VIN (İsteğe bağlı)"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Plaka (Gerekli)"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
          >
            {isLoading ? 'Yükleniyor...' : 'Yükle'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Results Section: Always visible */}

      {/* Tabs - Always visible, disabled when no aggregate */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('intelligence')}
          disabled={!aggregate}
          className={`px-6 py-3 font-medium transition border-b-2 ${
            !aggregate
              ? 'border-transparent text-gray-400 cursor-not-allowed'
              : activeTab === 'intelligence'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Intelligence View
        </button>
        {/* Machine Output tab (debug only) */}
        {debugEnabled && (
          <button
            onClick={() => setActiveTab('machine-output')}
            disabled={!aggregate}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              !aggregate
                ? 'border-transparent text-gray-400 cursor-not-allowed'
                : activeTab === 'machine-output'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Machine Output
          </button>
        )}
      </div>

      {/* VIO Generation Status Display - Always visible */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {aggregate && vioGenerationStatus?.status === 'ok' ? (
              <>
                <CheckCircle size={20} className="text-green-600" />
                <div>
                  <p className="font-medium text-green-700">✓ Zeka Analizi Başarılı</p>
                  <p className="text-xs text-gray-600">
                    Son güncelleme: {new Date(vioGenerationStatus.at).toLocaleString('tr-TR')}
                  </p>
                </div>
              </>
            ) : aggregate && vioGenerationStatus?.status === 'failed' ? (
              <>
                <AlertCircle size={20} className="text-red-600" />
                <div>
                  <p className="font-medium text-red-700">✗ Zeka Analizi Başarısız</p>
                  <p className="text-xs text-red-600">
                    Hata: {vioGenerationStatus.error || 'Bilinmeyen hata'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Clock size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium text-gray-700">Analiz Beklemede</p>
                  <p className="text-xs text-gray-600">
                    {aggregate ? 'Oluşturuluyor...' : 'Araç yüklemek için yukarıdaki formu kullanın'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Control Buttons - Only visible when aggregate exists */}
          {aggregate && (
            <div className="flex items-center gap-2">
              {/* Evidence Toggle */}
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
              >
                {showEvidence ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showEvidence ? 'Detayları Gizle' : 'Detayları Göster'}
              </button>

              {/* Recalculate Button */}
              <button
                onClick={handleRecalculateIntelligence}
                disabled={isRecalculating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium text-sm"
              >
                <RefreshCw size={16} className={isRecalculating ? 'animate-spin' : ''} />
                {isRecalculating ? 'Hesaplanıyor...' : 'Yeniden Hesapla'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Area - Changes based on aggregate state */}
      {!aggregate && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 mt-6">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Araç Zekası Analizi</h3>
            <p className="text-gray-600 mb-6">
              Araç verilerinizi analiz etmek için aşağıdaki bilgileri girin.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">1</div>
                <div>
                  <p className="font-medium text-gray-900">Araç ID</p>
                  <p className="text-xs text-gray-600">Gerekli alan</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">2</div>
                <div>
                  <p className="font-medium text-gray-900">Plaka</p>
                  <p className="text-xs text-gray-600">Gerekli alan</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">3</div>
                <div>
                  <p className="font-medium text-gray-900">VIN (İsteğe bağlı)</p>
                  <p className="text-xs text-gray-600">Opsiyonel alan</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">
              Bu ekran bakım, OBD, sigorta, KM ve hasar verilerinizi işleyip analiz üretir.
            </p>
          </div>
        </div>
      )}

      {aggregate && (
        <div className="space-y-4 mt-4">

          {/* Intelligence View Tab */}
          {activeTab === 'intelligence' && (
            <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{aggregate.plate}</h2>
                <p className="text-sm text-gray-600 mt-1">VIN: {aggregate.vin}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{aggregate.indexes.trustIndex}</div>
                <p className="text-sm text-gray-600">Güven Indeksi</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Durum</p>
                <p className="text-lg font-semibold text-gray-900">{statusBadge}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Özet</p>
                <p className="text-sm text-gray-700">{summaryLine}</p>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Trust Index */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Güven İndeksi</p>
              <p className="text-3xl font-bold text-blue-600">{aggregate.indexes.trustIndex}/100</p>
              <p className="text-xs text-gray-500 mt-2">Araç güvenilirliği</p>
            </div>

            {/* Reliability Index */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Güvenilirlik</p>
              <p className="text-3xl font-bold text-green-600">{aggregate.indexes.reliabilityIndex}/100</p>
              <p className="text-xs text-gray-500 mt-2">Mekanik işlerlik</p>
            </div>

            {/* Maintenance Discipline */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Bakım Disiplini</p>
              <p className="text-3xl font-bold text-purple-600">{aggregate.indexes.maintenanceDiscipline}/100</p>
              <p className="text-xs text-gray-500 mt-2">Bakım uyumu</p>
            </div>

            {/* Data Source Count */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Veri Kaynakları</p>
              <p className="text-3xl font-bold text-orange-600">
                {Object.values(aggregate.dataSources).filter((arr) => arr.length > 0).length}/5
              </p>
              <p className="text-xs text-gray-500 mt-2">Mevcut kaynaklar</p>
            </div>
          </div>

          {/* Risk Badges */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Metrikleri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Structural Risk */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Yapısal Risk</span>
                  <span className="text-sm font-bold text-gray-900">
                    {aggregate.derived.structuralRisk}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                    style={{ width: `${aggregate.derived.structuralRisk}%` }}
                  />
                </div>
              </div>

              {/* Mechanical Risk */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Mekanik Risk</span>
                  <span className="text-sm font-bold text-gray-900">
                    {aggregate.derived.mechanicalRisk}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                    style={{ width: `${aggregate.derived.mechanicalRisk}%` }}
                  />
                </div>
              </div>

              {/* Service Gap */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Bakım Açığı</span>
                  <span className="text-sm font-bold text-gray-900">
                    {aggregate.derived.serviceGapScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                    style={{ width: `${aggregate.derived.serviceGapScore}%` }}
                  />
                </div>
              </div>

              {/* Insurance Risk */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Sigorta Riski</span>
                  <span className="text-sm font-bold text-gray-900">
                    {aggregate.derived.insuranceRisk}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                    style={{ width: `${aggregate.derived.insuranceRisk}%` }}
                  />
                </div>
              </div>

              {/* Odometer Anomaly */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Kilometre</span>
                  <span className={`text-sm font-bold ${aggregate.derived.odometerAnomaly ? 'text-red-600' : 'text-green-600'}`}>
                    {aggregate.derived.odometerAnomaly ? '🚨 Anomali' : '✓ Normal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium uppercase">KM Geçmişi</p>
              <p className="text-2xl font-bold text-blue-900">{aggregate.dataSources.kmHistory.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg shadow-sm p-4 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium uppercase">OBD Kodları</p>
              <p className="text-2xl font-bold text-purple-900">{aggregate.dataSources.obdRecords.length}</p>
            </div>
            <div className="bg-orange-50 rounded-lg shadow-sm p-4 border border-orange-200">
              <p className="text-xs text-orange-600 font-medium uppercase">Sigorta Kayıtları</p>
              <p className="text-2xl font-bold text-orange-900">{aggregate.dataSources.insuranceRecords.length}</p>
            </div>
            <div className="bg-red-50 rounded-lg shadow-sm p-4 border border-red-200">
              <p className="text-xs text-red-600 font-medium uppercase">Hasar Kayıtları</p>
              <p className="text-2xl font-bold text-red-900">{aggregate.dataSources.damageRecords.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
              <p className="text-xs text-green-600 font-medium uppercase">Hizmet Kayıtları</p>
              <p className="text-2xl font-bold text-green-900">{aggregate.dataSources.serviceRecords.length}</p>
            </div>
          </div>

          {/* Insight Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Analiz Özeti</h3>
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-xs font-medium"
              >
                <Copy size={14} />
                {copyFeedback === 'summary' ? 'Kopyalandı!' : 'Özeti Kopyala'}
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
              {aggregate.insightSummary}
            </div>
          </div>

          {/* Evidence Panel (Collapsible Details) */}
          {showEvidence && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-4">Detaylı Analiz Kanıtı</h3>
              
              {/* Data Sources Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Veri Kaynakları</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">KM GEÇMİŞİ</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{aggregate.dataSources.kmHistory.length}</p>
                    {aggregate.dataSources.kmHistory.length > 0 && (
                      <p className="text-xs text-blue-700 mt-2">
                        Son: {new Date(aggregate.dataSources.kmHistory[aggregate.dataSources.kmHistory.length - 1]?.date || '').toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                  <div className="bg-purple-50 p-3 rounded border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium">OBD KODLARI</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{aggregate.dataSources.obdRecords.length}</p>
                    {aggregate.dataSources.obdRecords.length > 0 && (
                      <p className="text-xs text-purple-700 mt-2">
                        Son: {new Date(aggregate.dataSources.obdRecords[aggregate.dataSources.obdRecords.length - 1]?.date || '').toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                  <div className="bg-orange-50 p-3 rounded border border-orange-200">
                    <p className="text-xs text-orange-600 font-medium">SİGORTA KAYITLARI</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">{aggregate.dataSources.insuranceRecords.length}</p>
                    {aggregate.dataSources.insuranceRecords.length > 0 && (
                      <p className="text-xs text-orange-700 mt-2">
                        Son: {new Date(aggregate.dataSources.insuranceRecords[aggregate.dataSources.insuranceRecords.length - 1]?.date || '').toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <p className="text-xs text-red-600 font-medium">HASAR KAYITLARI</p>
                    <p className="text-2xl font-bold text-red-900 mt-1">{aggregate.dataSources.damageRecords.length}</p>
                    {aggregate.dataSources.damageRecords.length > 0 && (
                      <p className="text-xs text-red-700 mt-2">
                        Son: {new Date(aggregate.dataSources.damageRecords[aggregate.dataSources.damageRecords.length - 1]?.date || '').toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-xs text-green-600 font-medium">HİZMET KAYITLARI</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{aggregate.dataSources.serviceRecords.length}</p>
                    {aggregate.dataSources.serviceRecords.length > 0 && (
                      <p className="text-xs text-green-700 mt-2">
                        Son: {new Date(aggregate.dataSources.serviceRecords[aggregate.dataSources.serviceRecords.length - 1]?.date || '').toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Derived Metrics Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Türetilmiş Metrikler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Kilometre Anomalisi</span>
                      <span className={`text-sm font-bold ${aggregate.derived.odometerAnomaly ? 'text-red-600' : 'text-green-600'}`}>
                        {aggregate.derived.odometerAnomaly ? '🚨 Evet' : '✓ Hayır'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded border border-orange-200">
                    <div>
                      <p className="text-xs font-semibold text-orange-700 uppercase mb-2">Kilometre Zekası</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-gray-700">Rollback:</span>
                          <span className={`ml-1 font-bold ${aggregate.derived.kmIntelligence.hasRollback ? 'text-red-600' : 'text-green-600'}`}>
                            {aggregate.derived.kmIntelligence.hasRollback ? 'Evet' : 'Hayır'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Severity:</span>
                          <span className="ml-1 font-bold text-gray-900">{aggregate.derived.kmIntelligence.rollbackSeverity}/100</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Volatility:</span>
                          <span className="ml-1 font-bold text-gray-900">{aggregate.derived.kmIntelligence.volatilityScore}/100</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Usage:</span>
                          <span className="ml-1 font-bold text-gray-900">{aggregate.derived.kmIntelligence.usageClass}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Bakım Açığı Puanı</span>
                      <span className="text-sm font-bold text-gray-900">{aggregate.derived.serviceGapScore}/100</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Yapısal Risk</span>
                      <span className="text-sm font-bold text-gray-900">{aggregate.derived.structuralRisk}/100</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Mekanik Risk</span>
                      <span className="text-sm font-bold text-gray-900">{aggregate.derived.mechanicalRisk}/100</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Sigorta Riski</span>
                      <span className="text-sm font-bold text-gray-900">{aggregate.derived.insuranceRisk}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indexes Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Zeka İndeksleri</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium uppercase mb-1">Güven İndeksi</p>
                    <p className="text-3xl font-bold text-blue-900">{aggregate.indexes.trustIndex}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded border border-green-200">
                    <p className="text-xs text-green-600 font-medium uppercase mb-1">Güvenilirlik</p>
                    <p className="text-3xl font-bold text-green-900">{aggregate.indexes.reliabilityIndex}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium uppercase mb-1">Bakım Disiplini</p>
                    <p className="text-3xl font-bold text-purple-900">{aggregate.indexes.maintenanceDiscipline}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Analiz: {new Date(aggregate.timestamp).toLocaleString('tr-TR')}
            </p>
          </div>
            </div>
          )}

          {/* Machine Output Tab (Debug Only) */}
          {debugEnabled && activeTab === 'machine-output' && (
            <div className="space-y-4">
              {vio ? (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Machine Output (JSON)</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Standardized VIO (Vehicle Intelligence Output) contract for downstream module consumption.
                      </p>
                    </div>
                    <button
                      onClick={handleCopyJSON}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-xs font-medium whitespace-nowrap"
                    >
                      <Copy size={14} />
                      {copyFeedback === 'json' ? 'Kopyalandı!' : 'JSON Kopyala'}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed">
                    {JSON.stringify(vio, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-lg shadow-sm p-6 border border-yellow-200">
                  <p className="text-yellow-700 font-medium">
                    ⚠️ Makine çıkışı henüz oluşturulmadı. Lütfen araç bilgilerini yeniden yükleyin.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
