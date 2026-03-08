/**
 * Vehicle Intelligence Panel
 * Displays comprehensive vehicle analysis from VehicleAggregate
 * Phase 8.6: Emits vehicle intelligence events to timeline
 */

import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Clock, Copy, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { vehicleIntelligenceStore, generateStatusBadge, generateSummaryLine } from '../../vehicle-intelligence';
import { rebuildVehicleAggregate, emitRecalculationEvents, emitVehicleIntelligenceAggregatedEvent } from '../../vehicle-intelligence/vehicleAggregator';
import { vioStore } from '../intelligence/vioStore';
import { generateAndStoreVIO, getLastGenerationStatus } from '../intelligence/vioOrchestrator';
import { generateAndStoreVehicleRecommendations } from '../../vehicle-state/recommendationOrchestrator';
import { getVehicleStateSnapshot, getAllIndices, getExpertiseFindings, getKpiMetrics, getRiskMetrics, getDataSourcesCount, getCompositeScore, getExplainabilityDrivers, getRecentEvents, formatTimelineTimestamp, getDataSourcesSummary, getStatusFromSnapshot, getSummaryFromSnapshot, getCompositeVehicleScore, getVehicleIntelligenceRecommendations, getVehicleIntelligenceSummary } from '../../vehicle-state/snapshotAccessor';
import { generatePredictiveSignals } from '../../data-engine/signals/predictiveSignalsEngine';
import { explainCompositeScore, type ScoreExplainabilityResult } from '../../data-engine/scoring/scoreExplainability';
import { getVehicleTimeline, formatTimelineEventForDisplay, hasVehicleTimeline, formatTimelineTimestamp as formatTimelineTs } from '../../data-engine/timeline/vehicleTimeline';
import { sendDataEngineEvent } from '../../data-engine/ingestion/dataEngineEventSender';
import { VehicleEventTimeline } from '../components/VehicleEventTimeline';
import { PredictiveSignalsPanel } from '../../vehicle-intelligence/components/PredictiveSignalsPanel';
import { VehicleRecommendationsPanel } from '../../vehicle-intelligence/components/VehicleRecommendationsPanel';
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
  
  // Risk Indices from Vehicle State Snapshot
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  const [riskIndices, setRiskIndices] = useState<Array<{ key: string; value: number; confidence?: number }> | null>(null);
  const [showRiskJson, setShowRiskJson] = useState(false);
  
  // UI polish: Evidence toggle and copy feedback
  const [showEvidence, setShowEvidence] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<'summary' | 'json' | null>(null);

  // PHASE 8.4: Explainability and timeline expansion state
  const [expandedExplainability, setExpandedExplainability] = useState(false);
  const [expandedTimeline, setExpandedTimeline] = useState(false);
  
  // Phase 9.7.2: Recommendations reactivity bridge - triggers re-render when orchestrator completes storage
  const [recommendationsVersion, setRecommendationsVersion] = useState(0);

  // Debug flag for Machine Output tab visibility (?debug=1 in URL)
  const debugEnabled = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('debug') === '1' : false;
  
  // Force activeTab to 'intelligence' if debug is disabled and tab is 'machine-output'
  React.useEffect(() => {
    if (!debugEnabled && activeTab === 'machine-output') {
      setActiveTab('intelligence');
    }
  }, [debugEnabled, activeTab]);

  /**
   * Phase 8.6: Emit VEHICLE_INTELLIGENCE_ANALYZED event
   * Called after vehicle analysis completes
   * Fire-and-forget: Doesn't block UI, logged in console
   */
  const emitVehicleIntelligenceAnalyzedEvent = (vehicleIds: string) => {
    try {
      console.log('[VehicleIntelligencePanel] 🚀 emitVehicleIntelligenceAnalyzedEvent called for vehicleId:', vehicleIds);
      
      const snapshot = getVehicleStateSnapshot(vehicleIds);
      if (!snapshot) {
        console.warn('[VehicleIntelligencePanel] ⚠ No snapshot found, skipping event emission');
        return; // No snapshot = no analysis to emit
      }

      const compositeScore = getCompositeVehicleScore(vehicleIds);
      const allIndices = getAllIndices(vehicleIds);

      // Get domain counts
      const domainsPresent = [
        snapshot.risk ? 'risk' : null,
        snapshot.insurance ? 'insurance' : null,
        snapshot.part ? 'part' : null,
        snapshot.service ? 'service' : null,
        snapshot.diagnostics ? 'diagnostics' : null,
        snapshot.expertise ? 'expertise' : null,
        snapshot.odometer ? 'odometer' : null,
      ].filter((d): d is string => d !== null);

      const totalIndices =
        (allIndices.risk?.length || 0) +
        (allIndices.insurance?.length || 0) +
        (allIndices.part?.length || 0);

      const eventPayload = {
        domain: 'intelligence',
        compositeScore: compositeScore?.score ?? 0,
        riskLevel: compositeScore?.level ?? 'UNKNOWN',
        domainsPresent,
        totalIndices,
        explainabilityCount: getExplainabilityDrivers(vehicleIds)?.length ?? 0,
        snapshotTimestamp: snapshot.updatedAt,
      };

      console.log('[VehicleIntelligencePanel] 📦 Sending VEHICLE_INTELLIGENCE_ANALYZED event', {
        vehicleId: vehicleIds,
        eventType: 'VEHICLE_INTELLIGENCE_ANALYZED',
        source: 'VEHICLE_INTELLIGENCE',
        payload: eventPayload,
      });

      // Fire event asynchronously (Phase 8.6)
      sendDataEngineEvent({
        eventId: `evt-vio-${vehicleIds}-${Date.now()}`,
        eventType: 'VEHICLE_INTELLIGENCE_ANALYZED',
        source: 'VEHICLE_INTELLIGENCE',
        vehicleId: vehicleIds,
        tenantId: 'dev',
        occurredAt: new Date().toISOString(),
        schemaVersion: '1.0',
        piiSafe: true,
        payload: eventPayload,
      }).then((result) => {
        console.log('[VehicleIntelligencePanel] ✅ Event sent successfully', {
          vehicleId: vehicleIds,
          mode: result.mode,
          ok: result.ok,
        });
      }).catch((err) => {
        console.error('[VehicleIntelligencePanel] ❌ Failed to emit event:', err);
      });

      console.debug('[VehicleIntelligencePanel] ✓ VEHICLE_INTELLIGENCE_ANALYZED event emission queued', {
        vehicleId: vehicleIds,
        compositeScore: compositeScore?.score,
        domainsPresent: domainsPresent.length,
        totalIndices,
      });
    } catch (err) {
      console.error('[VehicleIntelligencePanel] ❌ Error emitting intelligence event:', err);
      // Non-blocking: Don't throw, just log
    }
  };

  /**
   * Phase 9.7.2: Callback handler for recommendation storage completion
   * Triggered when orchestrator finishes storing recommendations to snapshot
   * Updates recommendationsVersion to trigger React re-render
   * State update causes IIFE in render to read fresh recommendations from snapshot
   */
  const handleRecommendationsStored = () => {
    if (import.meta.env.DEV) {
      console.debug('[VehicleIntelligencePanel] 📝 Recommendations stored - triggering re-render');
    }
    setRecommendationsVersion(prev => prev + 1);
  };

  const handleLoadVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId.trim() || !plate.trim()) {
      setError('Lütfen araç ID ve plakasını girin');
      return;
    }

    console.log('\n================== PHASE 8.6 HOTFIX: "Yükle" Button Clicked ==================');
    console.log('[Button] User clicked "Yükle" (Load)', { vehicleId: vehicleId.trim(), plate: plate.trim() });

    try {
      setIsLoading(true);
      setError(null);

      console.log('[handleLoadVehicle] Step 1: Calling vehicleIntelligenceStore.getOrBuild()');
      const result = await vehicleIntelligenceStore.getOrBuild(
        vehicleId.trim(),
        vin.trim() || `VIN-${vehicleId}`,
        plate.trim().toUpperCase()
      );

      console.log('[handleLoadVehicle] Step 2: Aggregate loaded successfully', {
        vehicleId: result.vehicleId,
        timestamp: result.timestamp,
      });

      setAggregate(result);
      
      console.log('[handleLoadVehicle] Step 3: Emitting initial recalculation events to populate snapshot');
      // Emit recalculation events to hydrate snapshot (same as rebuild flow)
      // Fire-and-forget: events propagate through reducer pipeline
      emitRecalculationEvents(result).catch(err => {
        console.error('[handleLoadVehicle] Error emitting initial events:', err);
      });

      console.log('[handleLoadVehicle] Step 3b: Emitting aggregated intelligence summary (Phase 9.7.3)');
      // Phase 9.7.3: Guarantee vehicleIntelligenceSummary is populated before recommendations
      // This ensures first load matches recalculate path: both emit VEHICLE_INTELLIGENCE_AGGREGATED
      // getOrBuild() may return cached aggregate without re-emitting, so we emit here explicitly
      emitVehicleIntelligenceAggregatedEvent(result).catch(err => {
        console.error('[handleLoadVehicle] Error emitting aggregated event:', err);
      });

      // Small delay to allow events to propagate through reducer pipeline
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('[handleLoadVehicle] Step 4: Loading risk indices from hydrated snapshot');
      // Load risk indices for display (now snapshot should be populated from events)
      await loadRiskIndicesForExpertise(vehicleId.trim(), vin.trim() || `VIN-${vehicleId}`, plate.trim().toUpperCase());
      
      console.log('[handleLoadVehicle] Step 5: About to emit VEHICLE_INTELLIGENCE_ANALYZED event');
      // Phase 8.6: Emit vehicle intelligence analyzed event
      emitVehicleIntelligenceAnalyzedEvent(vehicleId.trim());
      
      console.log('[handleLoadVehicle] Step 6: Generating and storing vehicle recommendations (Phase 9.6)');
      // Phase 9.6: Generate recommendations asynchronously after analysis completes
      // Fire-and-forget: Does not block UI, no event emission, stores in snapshot only
      // Phase 9.7.2: Pass callback to trigger re-render when storage completes
      generateAndStoreVehicleRecommendations(vehicleId.trim(), handleRecommendationsStored).catch(err => {
        console.error('[handleLoadVehicle] Recommendation generation error (non-fatal):', err);
      });
      
      console.log('[handleLoadVehicle] ✓ Complete - waiting 500ms for event persistence');
      // VIO generation happens in useEffect when aggregate changes
      console.log('[VehicleIntelligencePanel] ✓ Vehicle aggregate loaded:', result);
    } catch (err) {
      // Safely extract error message from various error types
      let message = 'Bilinmeyen hata';
      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        message = String((err as Record<string, any>).message);
      } else if (typeof err === 'string') {
        message = err;
      }
      console.error('[handleLoadVehicle] ✗ Error:', message);
      setError(`Araç yüklenirken hata: ${message}`);
      setAggregate(null);
      setVio(null);
      setVioGenerationStatus(null);
    } finally {
      setIsLoading(false);
      console.log('================== END "Yükle" Flow ==================\n');
    }
  };

  /**
   * Load Risk Indices from Data Engine
   */
  /**
   * Load Risk Indices from Vehicle State Snapshot
   * Single Source of Truth: Always read from snapshots, never direct events
   */
  const loadRiskIndicesForExpertise = async (vehicleId: string, vin: string, plate: string) => {
    try {
      console.log('[AUTO-EXPERT][RISK] Loading from snapshot:', { vehicleId, vin, plate });
      setRiskLoading(true);
      setRiskError(null);
      setRiskIndices(null);

      // Get snapshot (Single Source of Truth)
      const snapshot = getVehicleStateSnapshot(vehicleId);
      
      if (!snapshot) {
        setRiskError(`Araç ${vehicleId} için veri bulunamadı. Lütfen veri motorunu çalıştırın.`);
        setRiskLoading(false);
        return;
      }

      // Get all indices from snapshot  
      const allIndices = getAllIndices(vehicleId);
      const combined = [
        ...(allIndices.risk || []),
        ...(allIndices.insurance || []),
        ...(allIndices.part || []),
      ];

      console.log('[AUTO-EXPERT][RISK] Snapshot loaded:', {
        vehicleId,
        riskCount: allIndices.risk.length,
        insuranceCount: allIndices.insurance.length,
        partCount: allIndices.part.length,
        total: combined.length,
        updatedAt: snapshot.updatedAt,
      });

      setRiskIndices(combined);
      setRiskError(null);
    } catch (err) {
      // Safely extract error message from various error types
      let message = 'Bilinmeyen hata';
      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        message = String((err as Record<string, any>).message);
      } else if (typeof err === 'string') {
        message = err;
      }
      console.error('[AUTO-EXPERT][RISK] Snapshot load error:', message);
      setRiskError(`Risk verisi alınamadı: ${message}`);
      setRiskIndices(null);
    } finally {
      setRiskLoading(false);
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
   * Phase 8.6: Also emits vehicle intelligence analyzed event
   */
  const handleRecalculateIntelligence = async () => {
    if (!aggregate) return;

    console.log('\n================== PHASE 8.6 HOTFIX: "Yeniden Hesapla" Button Clicked ==================');
    console.log('[Button] User clicked "Yeniden Hesapla" (Recalculate)', { vehicleId: aggregate.vehicleId });

    try {
      setIsRecalculating(true);

      console.log('[handleRecalculateIntelligence] Step 1: Calling vehicleIntelligenceStore.rebuild()');
      // Rebuild aggregate from scratch and persist to cache
      const refreshed = await vehicleIntelligenceStore.rebuild(
        aggregate.vehicleId,
        aggregate.vin,
        aggregate.plate
      );
      
      console.log('[handleRecalculateIntelligence] Step 2: Aggregate rebuilt and cached, updating state');
      // Update aggregate state, which triggers useEffect for VIO generation
      // timestamp changes automatically, so useEffect dependency [aggregate?.timestamp] will fire
      setAggregate(refreshed);

      console.log('[handleRecalculateIntelligence] Step 3: About to emit VEHICLE_INTELLIGENCE_ANALYZED event');
      // Phase 8.6: Emit event after recalculation
      emitVehicleIntelligenceAnalyzedEvent(aggregate.vehicleId);

      console.log('[handleRecalculateIntelligence] Step 4: Generating and storing vehicle recommendations (Phase 9.6)');
      // Phase 9.6: Generate recommendations asynchronously after analysis completes
      // Fire-and-forget: Does not block UI, no event emission, stores in snapshot only
      // Phase 9.7.2: Pass callback to trigger re-render when storage completes
      generateAndStoreVehicleRecommendations(aggregate.vehicleId, handleRecommendationsStored).catch(err => {
        console.error('[handleRecalculateIntelligence] Recommendation generation error (non-fatal):', err);
      });

      console.log('[handleRecalculateIntelligence] ✓ Intelligence recalculation triggered');
    } catch (err) {
      // Safely extract error message from various error types
      let message = 'Bilinmeyen hata';
      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        message = String((err as Record<string, any>).message);
      } else if (typeof err === 'string') {
        message = err;
      }
      console.error('[handleRecalculateIntelligence] ✗ Error:', message);
      setError(`Yeniden hesaplama hatası: ${message}`);
    } finally {
      setIsRecalculating(false);
      console.log('================== END "Yeniden Hesapla" Flow ==================\n');
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
    if (!vehicleId) return '';
    const status = getStatusFromSnapshot(vehicleId);
    return status.label;
  }, [vehicleId]);

  const summaryLine = useMemo(() => {
    if (!vehicleId) return '';
    return getSummaryFromSnapshot(vehicleId);
  }, [vehicleId]);

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
              <div className="flex items-end gap-8">
                {/* PHASE 8.3: Composite Vehicle Score - Authoritative unified score */}
                <div className="text-right">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {getCompositeVehicleScore(vehicleId)?.score ?? 0}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Bileşik Araç Puanı</p>
                  {(() => {
                    const compositeScore = getCompositeVehicleScore(vehicleId);
                    if (compositeScore) {
                      return (
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {compositeScore.level === 'high-risk'
                            ? '🚨 Yüksek Risk'
                            : compositeScore.level === 'medium-risk'
                            ? '⚠️ Orta Risk'
                            : '✓ Düşük Risk'}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
                {/* Trust Index */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{getKpiMetrics(vehicleId)?.trustIndex ?? 0}</div>
                  <p className="text-sm text-gray-600">Güven Indeksi</p>
                </div>
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

          {/* PHASE 8.4: Score Explainability Summary */}
          {(() => {
            const explanation = explainCompositeScore(getVehicleStateSnapshot(vehicleId));
            if (!explanation) return null;

            return (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-sm p-6 border border-amber-200 mb-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedExplainability(!expandedExplainability)}>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Skor Açıklaması</h3>
                    <p className="text-sm text-gray-600 mt-1">Puanı neden bu değerde? Hangi faktörler etkiliyordu?</p>
                  </div>
                  <div>{expandedExplainability ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}</div>
                </div>
                {expandedExplainability && (
                  <div className="mt-4 space-y-3">
                    {/* Summary points */}
                    <div className="space-y-2">
                      {explanation.summary.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                    {/* Dominant drivers */}
                    {explanation.dominantDrivers.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {explanation.dominantDrivers.slice(0, 6).map((driver, idx) => (
                          <div key={idx} className={`p-3 rounded border ${driver.effect === 'negative' ? 'bg-red-50 border-red-200' : driver.effect === 'positive' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{driver.label}</span>
                              <span className={`text-xs font-bold ${driver.effect === 'negative' ? 'text-red-600' : driver.effect === 'positive' ? 'text-green-600' : 'text-gray-600'}`}>{driver.effect === 'negative' ? '↓' : driver.effect === 'positive' ? '↑' : '='}  {driver.magnitude.toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{driver.sourceDomain.charAt(0).toUpperCase() + driver.sourceDomain.slice(1)} domain</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* PHASE 8.3: Score Breakdown - Composite Vehicle Score Components */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bileşik Araç Puanı Analizi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(() => {
                const compositeScore = getCompositeVehicleScore(vehicleId);
                if (!compositeScore) {
                  return <div className="text-sm text-gray-500 col-span-full">Snapshot bulunamadı</div>;
                }

                return (
                  <>
                    {/* Risk Score Contribution (50% weight) */}
                    <div className="bg-white rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Risk Skoru (50%)</span>
                        <span className="text-sm font-bold text-purple-700">{compositeScore.breakdown.risk}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${compositeScore.breakdown.risk}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Trust, Reliability, Maintenance, Inverse Risk Avg
                      </p>
                    </div>

                    {/* Insurance Score Contribution (30% weight) */}
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Sigorta Skoru (30%)</span>
                        <span className="text-sm font-bold text-blue-700">{compositeScore.breakdown.insurance}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${compositeScore.breakdown.insurance}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Continuity, Claims, Coverage, Inverse Fraud
                      </p>
                    </div>

                    {/* Part Score Contribution (20% weight) */}
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Parça Skoru (20%)</span>
                        <span className="text-sm font-bold text-indigo-700">{compositeScore.breakdown.part}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${compositeScore.breakdown.part}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Critical Parts, Supply, Volatility, Est. Cost
                      </p>
                    </div>

                    {/* Risk Reasons */}
                    {compositeScore.reasons.length > 0 && (
                      <div className="col-span-full mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Puanı Etkileyen Faktörler</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {compositeScore.reasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-xs mt-1">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Trust Index */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Güven İndeksi</p>
              <p className="text-3xl font-bold text-blue-600">{getKpiMetrics(vehicleId)?.trustIndex ?? 0}/100</p>
              <p className="text-xs text-gray-500 mt-2">Araç güvenilirliği</p>
            </div>

            {/* Reliability Index */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Güvenilirlik</p>
              <p className="text-3xl font-bold text-green-600">{getKpiMetrics(vehicleId)?.reliabilityIndex ?? 0}/100</p>
              <p className="text-xs text-gray-500 mt-2">Mekanik işlerlik</p>
            </div>

            {/* Maintenance Discipline */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Bakım Disiplini</p>
              <p className="text-3xl font-bold text-purple-600">{getKpiMetrics(vehicleId)?.maintenanceDiscipline ?? 0}/100</p>
              <p className="text-xs text-gray-500 mt-2">Bakım uyumu</p>
            </div>

            {/* Data Source Count */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Veri Kaynakları</p>
              <p className="text-3xl font-bold text-orange-600">{getDataSourcesCount(vehicleId)}/7</p>
              <p className="text-xs text-gray-500 mt-2">Mevcut kaynaklar</p>
            </div>
          </div>

          {/* Risk Badges */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Metrikleri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                const riskMetrics = getRiskMetrics(vehicleId);
                if (!riskMetrics) {
                  return <div className="text-sm text-gray-500 col-span-full">Snapshot bulunamadı</div>;
                }

                return (
                  <>
                    {/* Structural Risk */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Yapısal Risk</span>
                        <span className="text-sm font-bold text-gray-900">
                          {riskMetrics.structuralRisk}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${riskMetrics.structuralRisk}%` }}
                        />
                      </div>
                    </div>

                    {/* Mechanical Risk */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Mekanik Risk</span>
                        <span className="text-sm font-bold text-gray-900">
                          {riskMetrics.mechanicalRisk}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${riskMetrics.mechanicalRisk}%` }}
                        />
                      </div>
                    </div>

                    {/* Service Gap */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Bakım Açığı</span>
                        <span className="text-sm font-bold text-gray-900">
                          {riskMetrics.serviceGapScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${riskMetrics.serviceGapScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Insurance Risk */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Sigorta Riski</span>
                        <span className="text-sm font-bold text-gray-900">
                          {riskMetrics.insuranceRisk}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${riskMetrics.insuranceRisk}%` }}
                        />
                      </div>
                    </div>

                    {/* Odometer Anomaly */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Kilometre</span>
                        <span className={`text-sm font-bold ${riskMetrics.odometerAnomaly ? 'text-red-600' : 'text-green-600'}`}>
                          {riskMetrics.odometerAnomaly ? '🚨 Anomali' : '✓ Normal'}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* PHASE 8.4: Explainability Drivers Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Puan Etkenleri</h3>
            <div className="space-y-3">
              {(() => {
                const drivers = getExplainabilityDrivers(vehicleId);
                if (drivers.length === 0) {
                  return (
                    <p className="text-sm text-gray-500">
                      Puan etkenlerini belirlemek için yeterli veri yok
                    </p>
                  );
                }

                return drivers.map((driver) => (
                  <div
                    key={`${driver.domain}-${driver.key}`}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {driver.label}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            driver.effect === 'up'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {driver.effect === 'up' ? '↑' : '↓'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                driver.effect === 'up'
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${driver.value}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                          {driver.value}/100
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Etkinlik: {driver.magnitude.toFixed(1)} puan sapma •{' '}
                        <span className="capitalize">{driver.domain} Alanı</span>
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* PHASE 8.5: Predictive Signals Section */}
          {(() => {
            const snapshot = getVehicleStateSnapshot(vehicleId);
            const signals = generatePredictiveSignals(snapshot);
            // Filter out filtered signals to show only above-threshold signals
            const visibleSignals = signals.filter(s => !s.filtered);
            return <PredictiveSignalsPanel signals={visibleSignals} />;
          })()}

          {/* PHASE 9.7: Vehicle Recommendations Section */}
          {(() => {
            const recommendations = getVehicleIntelligenceRecommendations(vehicleId);
            const summary = getVehicleIntelligenceSummary(vehicleId);
            return (
              <VehicleRecommendationsPanel
                vehicleId={vehicleId}
                recommendations={recommendations}
                metadata={{
                  recommendationCount: summary?.recommendationCount,
                  highSeverityRecommendationCount: summary?.highSeverityRecommendationCount,
                  lastRecommendationsUpdatedAt: summary?.lastRecommendationsUpdatedAt,
                }}
              />
            );
          })()}

          {/* PHASE 8.4: Enhanced Timeline Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedTimeline(!expandedTimeline)}>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Araç Zaman Çizelgesi</h3>
                <p className="text-sm text-gray-600 mt-1">Araç tarihçesi - son işlenen olaylar</p>
              </div>
              <div>{expandedTimeline ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}</div>
            </div>
            {expandedTimeline && (
            <div className="space-y-2 max-h-96 overflow-y-auto mt-4">
              {(() => {
                const events = getRecentEvents(vehicleId, 10);
                const snapshot = getVehicleStateSnapshot(vehicleId);
                
                // Create synthetic timeline from snapshot domain updates
                const synthEvents: Array<{
                  eventType: string;
                  domain: string;
                  timestamp: string;
                  description: string;
                }> = [];

                if (snapshot?.risk?.lastUpdatedAt) {
                  synthEvents.push({
                    eventType: 'INDICES_UPDATED',
                    domain: 'risk',
                    timestamp: snapshot.risk.lastUpdatedAt || new Date().toISOString(),
                    description: 'Risk indeksleri güncellendi',
                  });
                }
                if (snapshot?.insurance?.lastUpdatedAt) {
                  synthEvents.push({
                    eventType: 'INDICES_UPDATED',
                    domain: 'insurance',
                    timestamp: snapshot.insurance.lastUpdatedAt || new Date().toISOString(),
                    description: 'Sigorta indeksleri güncellendi',
                  });
                }
                if (snapshot?.part?.lastUpdatedAt) {
                  synthEvents.push({
                    eventType: 'INDICES_UPDATED',
                    domain: 'part',
                    timestamp: snapshot.part.lastUpdatedAt || new Date().toISOString(),
                    description: 'Parça indeksleri güncellendi',
                  });
                }
                if (snapshot?.expertise?.lastUpdatedAt) {
                  synthEvents.push({
                    eventType: 'FINDINGS_UPDATED',
                    domain: 'expertise',
                    timestamp: snapshot.expertise.lastUpdatedAt || new Date().toISOString(),
                    description: 'Uzmanlık bulguları güncellendi',
                  });
                }
                if (snapshot?.odometer?.lastUpdatedAt) {
                  synthEvents.push({
                    eventType: 'ODOMETER_RECORDED',
                    domain: 'odometer',
                    timestamp: snapshot.odometer.lastUpdatedAt || new Date().toISOString(),
                    description: `Kilometre kaydı: ${snapshot.odometer.currentKm?.toLocaleString('tr-TR')} km`,
                  });
                }
                if (snapshot?.diagnostics?.lastUpdatedAt) {
                  synthEvents.push({
                    eventType: 'OBD_SCAN',
                    domain: 'diagnostics',
                    timestamp: snapshot.diagnostics.lastUpdatedAt || new Date().toISOString(),
                    description: `OBD taraması: ${snapshot.diagnostics.obdCount} kod`,
                  });
                }

                // PHASE 8.6 FINAL: Combine and sort with proper timestamp handling
                const allEvents = [...events, ...synthEvents]
                  .map((evt: any) => ({
                    ...evt,
                    // Normalize timestamp: use recurredAt (from real events) or timestamp (from synth events)
                    timestamp: evt.occurredAt || evt.timestamp || evt.lastUpdatedAt || new Date().toISOString(),
                  }))
                  .sort((a, b) => {
                    const timeA = new Date(a.timestamp).getTime();
                    const timeB = new Date(b.timestamp).getTime();
                    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
                  })
                  .slice(0, 10);

                if (allEvents.length === 0) {
                  return (
                    <p className="text-sm text-gray-500">
                      Son olay kaydı bulunamadı
                    </p>
                  );
                }

                const domainColors: Record<string, string> = {
                  risk: 'bg-red-100 text-red-800 border-red-300',
                  insurance: 'bg-blue-100 text-blue-800 border-blue-300',
                  part: 'bg-purple-100 text-purple-800 border-purple-300',
                  expertise: 'bg-green-100 text-green-800 border-green-300',
                  odometer: 'bg-orange-100 text-orange-800 border-orange-300',
                  diagnostics: 'bg-pink-100 text-pink-800 border-pink-300',
                  service: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                };

                return allEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition"
                  >
                    <div className="flex-shrink-0 w-2 bg-gray-400 rounded-full mt-2" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded border ${
                            domainColors[event.domain] ||
                            'bg-gray-200 text-gray-800 border-gray-300'
                          }`}
                        >
                          {event.domain.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600">
                          {(() => {
                            const formatted = formatTimelineTimestamp(event.timestamp);
                            if (import.meta.env.DEV) {
                              console.debug('[VehicleIntelligencePanel Recent Events] Event timestamp:', {
                                eventType: event.eventType,
                                domain: event.domain,
                                timestamp: event.timestamp,
                                formatted,
                              });
                            }
                            return formatted;
                          })()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{event.description}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
            )}
          </div>

          {/* Data Sources Summary - PHASE 8.2: From Snapshot (Single Source of Truth) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(() => {
              const dataSources = getDataSourcesSummary(vehicleId);
              if (!dataSources) {
                return (
                  <div className="col-span-full text-sm text-gray-500 py-4">
                    Snapshot bulunamadı - Veri kaynakları gösterilemiyor
                  </div>
                );
              }
              return (
                <>
                  <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium uppercase">KM Geçmişi</p>
                    <p className="text-2xl font-bold text-blue-900">{dataSources.kmHistory}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg shadow-sm p-4 border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium uppercase">OBD Kodları</p>
                    <p className="text-2xl font-bold text-purple-900">{dataSources.obdRecords}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg shadow-sm p-4 border border-orange-200">
                    <p className="text-xs text-orange-600 font-medium uppercase">Sigorta Kayıtları</p>
                    <p className="text-2xl font-bold text-orange-900">{dataSources.insuranceRecords}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg shadow-sm p-4 border border-red-200">
                    <p className="text-xs text-red-600 font-medium uppercase">Hasar Kayıtları</p>
                    <p className="text-2xl font-bold text-red-900">{dataSources.damageRecords}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
                    <p className="text-xs text-green-600 font-medium uppercase">Hizmet Kayıtları</p>
                    <p className="text-2xl font-bold text-green-900">{dataSources.serviceRecords}</p>
                  </div>
                </>
              );
            })()}
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
              
              {/* Data Sources Details - PHASE 8.2: From Snapshot (Single Source of Truth) */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Veri Kaynakları</h4>
                {(() => {
                  const dataSources = getDataSourcesSummary(vehicleId);
                  if (!dataSources) {
                    return <div className="text-sm text-gray-500">Snapshot bulunamadı</div>;
                  }
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium">KM GEÇMİŞİ</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{dataSources.kmHistory}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded border border-purple-200">
                        <p className="text-xs text-purple-600 font-medium">OBD KODLARI</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">{dataSources.obdRecords}</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded border border-orange-200">
                        <p className="text-xs text-orange-600 font-medium">SİGORTA KAYITLARI</p>
                        <p className="text-2xl font-bold text-orange-900 mt-1">{dataSources.insuranceRecords}</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded border border-red-200">
                        <p className="text-xs text-red-600 font-medium">HASAR KAYITLARI</p>
                        <p className="text-2xl font-bold text-red-900 mt-1">{dataSources.damageRecords}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="text-xs text-green-600 font-medium">HİZMET KAYITLARI</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{dataSources.serviceRecords}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Derived Metrics Details - PHASE 8.2: From Snapshot (Single Source of Truth) */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Türetilmiş Metrikler (Snapshot)</h4>
                {(() => {
                  const riskMetrics = getRiskMetrics(vehicleId);
                  if (!riskMetrics) {
                    return <div className="text-sm text-gray-500">Snapshot bulunamadı</div>;
                  }
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Kilometre Anomalisi</span>
                          <span className={`text-sm font-bold ${riskMetrics.odometerAnomaly ? 'text-red-600' : 'text-green-600'}`}>
                            {riskMetrics.odometerAnomaly ? '🚨 Evet' : '✓ Hayır'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Bakım Açığı Puanı</span>
                          <span className="text-sm font-bold text-gray-900">{riskMetrics.serviceGapScore}/100</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Yapısal Risk</span>
                          <span className="text-sm font-bold text-gray-900">{riskMetrics.structuralRisk}/100</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Mekanik Risk</span>
                          <span className="text-sm font-bold text-gray-900">{riskMetrics.mechanicalRisk}/100</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Sigorta Riski</span>
                          <span className="text-sm font-bold text-gray-900">{riskMetrics.insuranceRisk}/100</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Indexes Details - PHASE 8.2: From Snapshot (Single Source of Truth) */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Zeka İndeksleri (Snapshot)</h4>
                {(() => {
                  const kpiMetrics = getKpiMetrics(vehicleId);
                  if (!kpiMetrics) {
                    return <div className="text-sm text-gray-500">Snapshot bulunamadı</div>;
                  }
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded border border-blue-200">
                        <p className="text-xs text-blue-600 font-medium uppercase mb-1">Güven İndeksi</p>
                        <p className="text-3xl font-bold text-blue-900">{kpiMetrics.trustIndex}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded border border-green-200">
                        <p className="text-xs text-green-600 font-medium uppercase mb-1">Güvenilirlik</p>
                        <p className="text-3xl font-bold text-green-900">{kpiMetrics.reliabilityIndex}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded border border-purple-200">
                        <p className="text-xs text-purple-600 font-medium uppercase mb-1">Bakım Disiplini</p>
                        <p className="text-3xl font-bold text-purple-900">{kpiMetrics.maintenanceDiscipline}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Data Engine Risk Indices Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Data Engine Risk Indeksleri</h3>
                  {riskIndices && (
                    <button
                      onClick={() => setShowRiskJson(!showRiskJson)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                    >
                      {showRiskJson ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showRiskJson ? 'JSON Gizle' : 'JSON Göster'}
                    </button>
                  )}
                </div>

                {riskLoading && (
                  <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
                    <RefreshCw size={16} className="animate-spin" />
                    Risk indeksleri yükleniyor...
                  </div>
                )}

                {riskError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    <AlertCircle size={16} className="inline mr-2" />
                    Risk verisi alınamadı
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer font-medium">Detaylar</summary>
                      <pre className="mt-1 text-xs bg-white p-2 rounded border border-red-200 overflow-x-auto">
                        {riskError}
                      </pre>
                    </details>
                  </div>
                )}

                {riskIndices && !riskError && (
                  <div className="space-y-3">
                    {/* Key Indices Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {riskIndices
                        .filter(idx => ['trustIndex', 'reliabilityIndex', 'maintenanceDiscipline'].includes(idx.key))
                        .map(idx => (
                          <div
                            key={idx.key}
                            className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded border border-gray-300"
                          >
                            <p className="text-xs text-gray-600 font-medium uppercase mb-1">
                              {idx.key === 'trustIndex'
                                ? 'Güven'
                                : idx.key === 'reliabilityIndex'
                                ? 'Güvenilirlik'
                                : 'Bakım Disiplini'}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">{idx.value}</p>
                            <p className="text-xs text-gray-600 mt-1">Güven: {idx.confidence}%</p>
                          </div>
                        ))}
                    </div>

                    {/* Other Risk Indices */}
                    {riskIndices.some(idx => !['trustIndex', 'reliabilityIndex', 'maintenanceDiscipline'].includes(idx.key)) && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Ek Risk İndeksleri</p>
                        <div className="space-y-2">
                          {riskIndices
                            .filter(idx => !['trustIndex', 'reliabilityIndex', 'maintenanceDiscipline'].includes(idx.key))
                            .map(idx => (
                              <div key={idx.key} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {idx.key.replace(/([A-Z])/g, ' $1').trim()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-bold text-gray-900">{idx.value}</span>
                                  <p className="text-xs text-gray-600">{idx.confidence}% güven</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* JSON Debug View */}
                    {showRiskJson && (
                      <div className="mt-4 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
                        <p className="text-xs font-medium text-gray-400 mb-2">JSON Görünümü</p>
                        <pre className="text-xs leading-relaxed font-mono max-h-96 overflow-y-auto">
                          {JSON.stringify(riskIndices, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Analiz: {new Date(aggregate.timestamp).toLocaleString('tr-TR')}
            </p>
          </div>

          {/* Vehicle Event Timeline - Read-only event history from database */}
          <VehicleEventTimeline vehicleId={vehicleId} />
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
