import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Package, CheckCircle, Clock, DollarSign, Star, Loader2, EyeOff } from 'lucide-react';
import { getEffectiveOffersForPart } from '../services/dataService';
import { PartMasterPart, EffectiveOffer, OfferRecommendation } from '../types/partMaster';

interface OffersPanelProps {
  selectedPart: PartMasterPart | null;
  institutionId?: string;
  tenantId?: string;
}

const DEFAULT_INSTITUTION_ID = 'INST-001';

export const OffersPanel: React.FC<OffersPanelProps> = ({ 
  selectedPart, 
  institutionId = DEFAULT_INSTITUTION_ID,
  tenantId = 'LENT-CORP-DEMO'
}) => {
  const [recommendation, setRecommendation] = React.useState<OfferRecommendation | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!selectedPart) {
      setRecommendation(null);
      return;
    }

    const loadOffers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('[OffersUI] Loading offers:', {
          partMasterId: selectedPart.partMasterId,
          institutionId,
          tenantId,
        });

        const rec = await getEffectiveOffersForPart(
          selectedPart.partMasterId,
          institutionId,
          tenantId
        );

        if (rec.best) {
          console.log('[OffersUI] Best offer loaded:', {
            offer_id: rec.best.offer_id,
            supplier_id: rec.best.supplier_id,
            score_total: rec.best.score_total,
            net_price: rec.best.net_price,
          });
        }

        setRecommendation(rec);
      } catch (err) {
        console.error('[OffersUI] Error loading offers:', err);
        setError('Teklifler yüklenirken hata oluştu');
        setRecommendation({ part_master_id: selectedPart.partMasterId, institution_id: institutionId, best: null, alternatives: [], timestamp: new Date().toISOString() });
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [selectedPart?.partMasterId, institutionId, tenantId]);

  if (!selectedPart) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Package size={32} className="mx-auto mb-4 text-slate-300" />
        <p className="text-sm">Teklifler görmek için bir parça seçin</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
        <Loader2 size={28} className="text-indigo-600 animate-spin" />
        <p className="text-sm text-slate-600">Teklifler yükleniyor...</p>
      </div>
    );
  }

  if (error || !recommendation) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle size={32} className="mx-auto mb-4 text-amber-600" />
        <p className="text-sm font-medium text-slate-700">{error || 'Teklifler yüklenemedi'}</p>
      </div>
    );
  }

  const bestOffer = recommendation.best;
  const alternatives = recommendation.alternatives || [];

  return (
    <div className="space-y-6 p-6">
      {/* Best Offer Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl border border-emerald-200 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4 flex items-center gap-3">
          <Star size={20} className="text-white fill-white" />
          <h4 className="text-white font-bold">En İyi Teklif</h4>
        </div>

        {bestOffer ? (
          <div className="p-6 space-y-4">
            {/* Supplier & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tedarikçi</p>
                <p className="text-lg font-bold text-slate-800">{bestOffer.supplier_id}</p>
                <p className="text-xs text-slate-400 mt-1">Kalite: {bestOffer.quality_grade}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Net Fiyat</p>
                <p className="text-2xl font-black text-emerald-700">{bestOffer.net_price} ₺</p>
                <p className="text-xs text-slate-400 mt-1">Liste: {bestOffer.list_price} ₺</p>
              </div>
            </div>

            {/* Score & Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Skor</p>
                <p className="text-xl font-black text-indigo-600 mt-1">{bestOffer.score_total}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Stok</p>
                <p className="text-xl font-black text-blue-600 mt-1">{bestOffer.stock_on_hand}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Süre</p>
                <p className="text-xl font-black text-orange-600 mt-1">{bestOffer.lead_time_days}g</p>
              </div>
            </div>

            {/* Reason Badges */}
            {bestOffer.reason_badges && bestOffer.reason_badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {bestOffer.reason_badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Warnings & Actions */}
            <div className="space-y-3">
              {!bestOffer.purchasable && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-red-700">Satın alınamaz (stok yok veya başka neden)</span>
                </div>
              )}

              <button
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                  bestOffer.purchasable
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
                disabled={!bestOffer.purchasable}
                onClick={() => {
                  console.log('[OffersUI] Sipariş İste:', bestOffer.offer_id);
                  alert(`Sipariş istendi: ${bestOffer.offer_id}`);
                }}
              >
                Sipariş İste
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500">
            <EyeOff size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Bu parça için teklif bulunamadı</p>
          </div>
        )}
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingDown size={18} className="text-slate-600" />
            Alternatifler ({alternatives.length})
          </h4>

          <div className="space-y-2">
            {alternatives.map((alt, idx) => (
              <div
                key={alt.offer_id}
                className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-400">#{alt.rankingPosition || idx + 2}</span>
                      <p className="font-semibold text-slate-800">{alt.supplier_id}</p>
                      <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {alt.quality_grade}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-3 text-xs">
                      <div>
                        <p className="text-slate-400 font-bold uppercase">Fiyat</p>
                        <p className="font-black text-slate-800 mt-1">{alt.net_price} ₺</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase">Stok</p>
                        <p className="font-black text-slate-800 mt-1">{alt.stock_on_hand}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase">Süre</p>
                        <p className="font-black text-slate-800 mt-1">{alt.lead_time_days}g</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase">Skor</p>
                        <p className="font-black text-indigo-600 mt-1">{alt.score_total}</p>
                      </div>
                    </div>

                    {alt.reason_badges && alt.reason_badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {alt.reason_badges.map((badge, bidx) => (
                          <span
                            key={bidx}
                            className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className="ml-4 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    onClick={() => {
                      console.log('[OffersUI] Kontrol tıklandı:', alt.offer_id);
                      alert(`Detaylar: ${alt.offer_id}`);
                    }}
                  >
                    Gör
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
