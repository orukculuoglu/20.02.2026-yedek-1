/**
 * ExpertReportDetail - Inspect and edit a single report
 * Shows checklist with accordion, score panel, and finalize button
 * Triggers risk sync when finalizing
 */

import React, { useState, useEffect } from 'react';
import type { ExpertReport, ChecklistResult } from '../types';
import { reportStore } from '../store';
import { auditStore } from '../audit';
import { recomputeScoreAndFlags } from '../scoring.stub';
import { syncRiskFromExpertReport } from '../risk/riskSync';
import { vehicleStore } from '../vehicle/vehicleStore';
import { StatusBadge } from '../components/StatusBadge';
import { ScorePanel } from '../components/ScorePanel';
import { ChecklistSectionAccordion } from '../components/ChecklistSectionAccordion';
import { AlertCircle, CheckCircle } from 'lucide-react';

type RiskSyncStatus = 'idle' | 'syncing' | 'ok' | 'failed';

interface ExpertReportDetailProps {
  reportId: string;
  onBack: () => void;
}

export function ExpertReportDetail({ reportId, onBack }: ExpertReportDetailProps) {
  const [report, setReport] = useState<ExpertReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [finalizeConfirm, setFinalizeConfirm] = useState(false);
  const [riskSyncStatus, setRiskSyncStatus] = useState<RiskSyncStatus>('idle');
  const [riskSyncError, setRiskSyncError] = useState<string | null>(null);
  const [vehicleRiskScore, setVehicleRiskScore] = useState<number | null>(null);

  // Load report on mount
  useEffect(() => {
    if (reportId) {
      const loaded = reportStore.getById(reportId);
      if (loaded) {
        setReport(loaded);
        // Load vehicle risk score if available
        const vehicle = vehicleStore.getById(loaded.vehicleId);
        if (vehicle && vehicle.riskScore !== undefined) {
          setVehicleRiskScore(vehicle.riskScore);
        }
      }
      setIsLoading(false);
    }
  }, [reportId]);

  if (isLoading || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Rapor yükleniyor...</div>
      </div>
    );
  }

  const isLocked = report.status === 'Final';

  // Update a single item result
  const handleUpdateItem = (itemId: string, result: ChecklistResult) => {
    if (isLocked) return;

    setIsSaving(true);

    // Find and update the item
    let found = false;
    for (const section of report.checklist) {
      const item = section.items.find(i => i.id === itemId);
      if (item) {
        item.result = result;
        found = true;
        break;
      }
    }

    if (found) {
      // Recompute score and flags
      recomputeScoreAndFlags(report);

      // Save updated report
      reportStore.upsert(report);

      // Audit log
      auditStore.append({
        reportId: report.id,
        action: 'UPDATE_ITEM',
        actorId: 'current_user',
        meta: { itemId, result },
      });

      // Update UI
      setReport({ ...report });
    }

    setIsSaving(false);
  };

  // Finalize the report (includes risk sync)
  const handleFinalize = async () => {
    if (isLocked) return;

    setIsSaving(true);
    setRiskSyncStatus('idle');
    setRiskSyncError(null);

    try {
      report.status = 'Final';
      report.finalizedAt = new Date().toISOString();

      // Final score computation
      recomputeScoreAndFlags(report);

      // Save
      reportStore.upsert(report);

      // Audit log for finalize
      auditStore.append({
        reportId: report.id,
        action: 'FINALIZE',
        actorId: 'current_user',
      });

      // Update UI state (report is now locked)
      setReport({ ...report });
      setFinalizeConfirm(false);

      // Now trigger async risk sync
      setRiskSyncStatus('syncing');

      const syncResult = await syncRiskFromExpertReport(report);

      if (syncResult.success) {
        setRiskSyncStatus('ok');
        setVehicleRiskScore(syncResult.riskScore || null);
        console.log(`[UI] Risk sync succeeded: vehicle riskScore=${syncResult.riskScore}`);
      } else {
        setRiskSyncStatus('failed');
        setRiskSyncError(syncResult.reason || 'Bilinmeyen bir hata oluştu');
        console.error(`[UI] Risk sync failed: ${syncResult.reason}`);
      }
    } catch (error) {
      setRiskSyncStatus('failed');
      setRiskSyncError(error instanceof Error ? error.message : 'Beklenmeyen hata');
      console.error('[UI] Finalize error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {report.plate}
            </h1>
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                <strong>VIN:</strong> {report.vin}
              </div>
              <div>
                <strong>Oluşturan:</strong> {report.createdBy} •{' '}
                {new Date(report.createdAt).toLocaleString('tr-TR')}
              </div>
              {report.finalizedAt && (
                <div>
                  <strong>Kesinleştirilme:</strong>{' '}
                  {new Date(report.finalizedAt).toLocaleString('tr-TR')}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={report.status} size="lg" />
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ← Liste
            </button>
          </div>
        </div>

        {/* Finalize Warning */}
        {isLocked && (
          <div className="mb-6 bg-amber-100 border-l-4 border-amber-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold text-amber-900">
                  Bu rapor kesinleştirilmiştir
                </h3>
                <p className="text-sm text-amber-800">
                  Kesinleştirilmiş raporlar düzenlenemez. Yeni bir rapor oluşturmanız
                  gerekmektedir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Risk Sync Status */}
        {isLocked && (
          <>
            {riskSyncStatus === 'syncing' && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin text-blue-600">⟳</div>
                  <div className="text-sm text-blue-700">
                    Araç risk puanı senkronize ediliyor...
                  </div>
                </div>
              </div>
            )}

            {riskSyncStatus === 'ok' && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <div className="font-semibold text-green-900">
                      Risk puanı senkronize edildi ✓
                    </div>
                    <div className="text-sm text-green-700">
                      Araç Risk Puanı: <strong>{vehicleRiskScore}</strong>/100
                    </div>
                  </div>
                </div>
              </div>
            )}

            {riskSyncStatus === 'failed' && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-900">
                      Risk puanı senkronize edilemedi
                    </div>
                    <div className="text-sm text-red-700 mt-1">
                      {riskSyncError}
                    </div>
                    <div className="text-xs text-red-600 mt-2">
                      Not: Rapor kesinleştirilmiştir, ancak risk puanı güncellenememiştir.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Finalize Confirmation Modal */}
        {finalizeConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Raporu Kesinleştir
              </h2>
              <p className="text-gray-600 mb-6">
                Bu raporu kesinleştirildikten sonra değiştirilemez. Emin misiniz?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setFinalizeConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  İptal
                </button>
                <button
                  onClick={handleFinalize}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                >
                  {isSaving ? 'Kaydediliyor...' : 'Kesinleştir'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Layout: Checklist + Score Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Checklist */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Kontrol Listesi
            </h2>

            {report.checklist.map(section => (
              <ChecklistSectionAccordion
                key={section.id}
                section={section}
                isLocked={isLocked}
                onItemResultChange={(itemId, result) =>
                  handleUpdateItem(itemId, result)
                }
              />
            ))}
          </div>

          {/* Right: Score Panel */}
          <div>
            <ScorePanel report={report} />

            {/* Finalize Button */}
            {!isLocked && (
              <button
                onClick={() => setFinalizeConfirm(true)}
                disabled={isSaving}
                className="w-full mt-4 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {isSaving ? '⏳ İşleniyor...' : '✓ Raporu Kesinleştir'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
