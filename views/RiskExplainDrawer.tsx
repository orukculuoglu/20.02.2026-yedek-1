import React from 'react';
import { X, ChevronDown, Zap, Activity, AlertOctagon, ShieldAlert } from 'lucide-react';
import { VehicleProfile } from '../types';
import type { FleetRiskSummary } from '../src/engine/fleetRisk/fleetRiskAggregator';
import { getRiskColor, getRiskBadgeClasses, getRiskLabel } from '../src/utils/riskLabel';

export type RiskExplainType = 'average' | 'critical' | 'exposure' | 'security' | 'component-breakdown';

interface RiskExplainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: RiskExplainType;
  vehicles: VehicleProfile[];
  fleetSummary?: FleetRiskSummary | null;
  data?: any;
}

export const RiskExplainDrawer: React.FC<RiskExplainDrawerProps> = ({
  isOpen,
  onClose,
  type,
  vehicles,
  fleetSummary,
  data,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKEsc = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKEsc as any);
    return () => window.removeEventListener('keydown', handleKEsc as any);
  }, []);

  const renderContent = () => {
    switch (type) {
      case 'average': {
        const formulaNote = fleetSummary?.formulaNotes.avgRisk ?? 'Formül hesaplanamadı';
        const sorted = [...vehicles].sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0)).slice(0, 3);

        return (
          <div className="space-y-6">
            {/* Formula */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                📐 Formül
              </h4>
              <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs border border-slate-200">
                <div>{formulaNote}</div>
              </div>
            </div>

            {/* Contributing Vehicles */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                📋 Katkı Yapan Araçlar ({vehicles.length})
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {vehicles.map((v: VehicleProfile) => (
                  <div key={v.vehicle_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{v.brand} {v.model}</div>
                      <div className="text-xs text-slate-600 font-mono">{v.vehicle_id.substring(0, 12)}...</div>
                    </div>
                    <div className={`text-sm font-bold px-2 py-1 rounded ${getRiskBadgeClasses(v.risk_score)}`}>
                      {v.risk_score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Highlighted */}
            {sorted.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  ⚠️ En Yüksek Risk Taşıyanlar
                </h4>
                <div className="space-y-2">
                  {sorted.map((v: VehicleProfile, idx: number) => (
                    <div key={v.vehicle_id} className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-800">#{idx + 1} - {v.brand} {v.model}</span>
                        <span className="text-rose-700 font-bold text-lg">{v.risk_score}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono">{v.vehicle_id}</div>
                      <div className="text-xs text-rose-600 mt-1">{v.risk_primary_reason || 'Yüksek risk aracı'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'critical': {
        const formulaNote = fleetSummary?.formulaNotes.criticalCount ?? 'Formül hesaplanamadı';
        const critical = vehicles.filter((v: VehicleProfile) => (v.risk_score ?? 0) >= 60);
        const high = vehicles.filter((v: VehicleProfile) => (v.risk_score ?? 0) >= 50 && (v.risk_score ?? 0) < 60);

        return (
          <div className="space-y-6">
            {/* Threshold Explanation */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                📐 Formül
              </h4>
              <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs border border-slate-200">
                <div>{formulaNote}</div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                🎯 Standardize Eşikler
              </h4>
              <div className="space-y-2">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <div className="font-bold text-rose-700 text-sm">KRİTİK (≥ 60)</div>
                  <div className="text-xs text-slate-600 mt-1">Acil bakım ve etkileme gerekir.</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="font-bold text-amber-700 text-sm">YÜKSEK (50-59)</div>
                  <div className="text-xs text-slate-600 mt-1">Yakında bakım planlanmalı.</div>
                </div>
              </div>
            </div>

            {/* Critical Vehicles */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                🔴 KRİTİK ARAÇLAR (≥ 60) - {critical.length}
              </h4>
              {critical.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {critical.map((v: VehicleProfile) => (
                    <div key={v.vehicle_id} className="p-3 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-slate-800 text-sm">{v.brand} {v.model}</div>
                        <span className="font-bold text-rose-700">{v.risk_score}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono">{v.vehicle_id}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs">
                  Kritik seviyede araç yoktur. ✓
                </div>
              )}
            </div>

            {/* High Risk Vehicles */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                🟡 YÜKSEK RİSK ARAÇLAR (50-59) - {high.length}
              </h4>
              {high.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {high.map((v: VehicleProfile) => (
                    <div key={v.vehicle_id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-slate-800 text-sm">{v.brand} {v.model}</div>
                        <span className="font-bold text-amber-700">{v.risk_score}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono">{v.vehicle_id}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-xs">
                  Yüksek risk aracı yoktur. ✓
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'exposure': {
        const formulaNote = fleetSummary?.formulaNotes.exposure ?? 'Formül hesaplanamadı';
        const exposureVehicles = fleetSummary?.exposureVehicles ?? [];
        const totalExposure = fleetSummary?.exposure ?? 0;

        return (
          <div className="space-y-6">
            {/* Formula */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                📐 Formül
              </h4>
              <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs border border-slate-200">
                <div>{formulaNote}</div>
              </div>
            </div>

            {/* Contributing Vehicles */}
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                💰 Katkı Yapan Araçlar ({exposureVehicles.length})
              </h4>
              {exposureVehicles.length > 0 ? (
                <div>
                  <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                    {exposureVehicles.map((v: any) => (
                      <div key={v.vehicle_id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-slate-800 text-sm">{v.brand} {v.model} {v.year}</div>
                            <div className="text-xs text-slate-600 font-mono">{v.vehicle_id.substring(0, 12)}...</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-blue-700">{v.contribution.toLocaleString('tr-TR')} ₺</div>
                            <div className="text-xs text-slate-600">Risk: {v.risk_score}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600">
                          Resale: {(v.resale_value_prediction ?? 0).toLocaleString('tr-TR')} ₺ × 15% = {v.contribution.toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total */}
                  <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 font-bold text-right">
                    <div className="text-xs text-blue-600 mb-1">TOPLAM MARUZIYETI</div>
                    <div className="text-2xl text-blue-800">{totalExposure.toLocaleString('tr-TR')} ₺</div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-slate-600 text-sm">
                    risk_score &gt; 50 olan araç bulunmadığı için maruziyet <strong>0 ₺</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'security': {
        const securityIndex = fleetSummary?.securityIndex;
        const formulaNote = fleetSummary?.formulaNotes.securityIndex ?? '';

        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                ℹ️ Güvenlik Endeksi Hesaplaması
              </h4>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div>
                  <div className="font-bold text-blue-900 text-sm mb-1">Derece: {securityIndex?.grade}</div>
                  <div className="text-xs text-blue-900">Score: {securityIndex?.score01}</div>
                </div>
                
                <div className="text-xs text-slate-700 font-mono bg-white p-2 rounded border border-slate-200">
                  {formulaNote}
                </div>

                {securityIndex?.reasons && securityIndex.reasons.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-slate-800 mb-2">Faktörler:</div>
                    <ul className="text-xs text-slate-700 space-y-1 ml-3">
                      {securityIndex.reasons.map((reason, idx) => (
                        <li key={idx}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-slate-600 italic">
                  Endeks, ortalama risk skoru, kritik araç oranı ve finansal maruziyetin ağırlıklı kombinasyonundan oluşur.
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'component-breakdown': {
        // This would be used for DetailedRiskInspectionModal
        const v = data?.vehicle as VehicleProfile;
        if (!v) return <div>Araç verisi alinamadı.</div>;

        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                🔍 Risk Hesaplama Girdileri
              </h4>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm font-mono">
                <div><span className="text-slate-600">Kilometre:</span> <span className="font-bold">{v.mileage?.toLocaleString() ?? '?'} KM</span></div>
                <div><span className="text-slate-600">Hasar Olasılığı:</span> <span className="font-bold">{v.damage_probability}%</span></div>
                <div><span className="text-slate-600">Arıza Sıklığı (FFI):</span> <span className="font-bold">{v.failure_frequency_index}</span></div>
                <div><span className="text-slate-600">Ort. Parça Yaşam Skoru:</span> <span className="font-bold">{v.average_part_life_score}/100</span></div>
                <div><span className="text-slate-600">Toplam Sorgu:</span> <span className="font-bold">{v.total_queries}</span></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                📊 Normalize Sinyaller (0-1)
              </h4>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm font-mono">
                <div>healthRisk = (100 - {v.average_part_life_score}) / 100 = <span className="font-bold">{(((100 - (v.average_part_life_score ?? 70)) / 100).toFixed(3))}</span></div>
                <div>mileageRisk = log₁₀(1 + {v.mileage}) / log₁₀(200001) = <span className="font-bold">{((Math.log10(1 + (v.mileage ?? 0)) / Math.log10(200001)).toFixed(3))}</span></div>
                <div>damageRisk = {v.damage_probability} / 100 = <span className="font-bold">{((v.damage_probability ?? 0) / 100).toFixed(3)}</span></div>
                <div>freqRisk = {v.failure_frequency_index} / 2.5 = <span className="font-bold">{((v.failure_frequency_index ?? 0) / 2.5).toFixed(3)}</span></div>
                <div>queryRisk = {v.total_queries} / 50 = <span className="font-bold">{((v.total_queries ?? 0) / 50).toFixed(3)}</span></div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                🎲 Breakdown Hesaplaması (Ağırlıklı)
              </h4>
              <div className="space-y-2">
                {[
                  { name: 'Motor/Turbo', value: v.risk_breakdown?.powertrain ?? 0, weights: '45% health + 30% mileage + 25% freq' },
                  { name: 'Şanzıman', value: v.risk_breakdown?.transmission ?? 0, weights: '45% freq + 40% mileage + 15% health' },
                  { name: 'Elektronik', value: v.risk_breakdown?.electronics ?? 0, weights: '40% query + 35% health + 25% freq' },
                  { name: 'Hasar/Şasi', value: v.risk_breakdown?.body ?? 0, weights: '70% damage + 15% mileage + 15% health' },
                ].map((item) => (
                  <div key={item.name} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="font-bold text-slate-700">{item.value}/100</span>
                    </div>
                    <div className="text-xs text-slate-600">{item.weights}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-3">📌 Final Risk Score</h4>
              <div className="bg-gradient-to-r from-rose-50 to-amber-50 p-4 rounded-lg border border-rose-200">
                <div className="font-mono text-sm mb-2">
                  risk_score = (powertrain×0.30 + transmission×0.25 + electronics×0.20 + body×0.25) / 100 × 100
                </div>
                <div className="text-2xl font-bold text-slate-800">{v.risk_score} / 100</div>
                <div className="text-xs text-slate-600 mt-2">{v.risk_primary_reason}</div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl animate-in slide-in-from-right overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              {type === 'average' && '📈 Ortalama Filo Risk Skoru'}
              {type === 'critical' && '🚨 Kritik Araçlar Analizi'}
              {type === 'exposure' && '💰 Risk Maruziyeti'}
              {type === 'security' && '🛡️ Güvenlik Endeksi'}
              {type === 'component-breakdown' && '🔬 Risk Hesaplama Detayları'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>

        {/* Footer Note */}
        <div className="shrink-0 bg-slate-50 px-6 py-4 border-t border-slate-200 text-xs text-slate-600">
          <span>💡 Bu açıklama tamamen hesaplanan değerlere ve engine çıktılarına dayanmaktadır.</span>
        </div>
      </div>
    </>
  );
};
