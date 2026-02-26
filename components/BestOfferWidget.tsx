import React, { useState, useEffect } from 'react';
import { TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { getEffectiveOffersForPart } from '../services/dataService';
import { offerCache } from '../utils/offerCache';
import { EffectiveOffer, OfferRecommendation } from '../types/partMaster';

interface BestOfferWidgetProps {
  partMasterId: string;
  institutionId?: string;
  tenantId?: string;
  compact?: boolean;
  onClick?: () => void;
}

const DEFAULT_INSTITUTION_ID = 'INST-001';

export const BestOfferWidget: React.FC<BestOfferWidgetProps> = ({
  partMasterId,
  institutionId = DEFAULT_INSTITUTION_ID,
  tenantId = 'LENT-CORP-DEMO',
  compact = false,
  onClick,
}) => {
  const [bestOffer, setBestOffer] = useState<EffectiveOffer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOffer = async () => {
      setLoading(true);

      try {
        // Check cache first
        const cached = offerCache.get(partMasterId, institutionId);
        if (cached?.best) {
          console.log('[BestOfferWidget] Using cached offer:', partMasterId);
          setBestOffer(cached.best);
          setLoading(false);
          return;
        }

        // Fetch from API
        const rec = await getEffectiveOffersForPart(
          partMasterId,
          institutionId,
          tenantId
        );

        if (rec.best) {
          // Cache the result
          offerCache.set(partMasterId, institutionId, rec);
          setBestOffer(rec.best);
        }
      } catch (err) {
        console.error('[BestOfferWidget] Error loading offer:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOffer();
  }, [partMasterId, institutionId, tenantId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1">
        <Loader2 size={14} className="animate-spin text-slate-400" />
        <span className="text-xs text-slate-400">Yükleniyor...</span>
      </div>
    );
  }

  if (!bestOffer) {
    return (
      <span className="text-xs text-slate-400">—</span>
    );
  }

  return compact ? (
    // Compact mode (for PartStockSignals)
    <button
      onClick={onClick}
      className="text-xs text-slate-700 hover:text-indigo-600 font-semibold transition-colors"
    >
      <span className="block">{bestOffer.supplier_id}</span>
      <span className="block font-black text-slate-800">{bestOffer.net_price} ₺</span>
      <span className="text-[10px] text-slate-400">{bestOffer.lead_time_days}g</span>
    </button>
  ) : (
    // Full mode (for Aftermarket detail)
    <div
      onClick={onClick}
      className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Önerilen Teklif</p>
          <p className="text-sm font-bold text-slate-800 mt-1">{bestOffer.supplier_id}</p>
          <p className="text-lg font-black text-emerald-700 mt-2">{bestOffer.net_price} ₺</p>
          <div className="flex gap-2 mt-2">
            <span className="text-[9px] font-bold bg-white px-2 py-1 rounded border border-emerald-200">
              Stok: {bestOffer.stock_on_hand}
            </span>
            <span className="text-[9px] font-bold bg-white px-2 py-1 rounded border border-emerald-200">
              {bestOffer.lead_time_days}g
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block px-2 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg">
            {bestOffer.score_total}
          </span>
        </div>
      </div>
      {bestOffer.reason_badges && bestOffer.reason_badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {bestOffer.reason_badges.slice(0, 2).map((badge, idx) => (
            <span
              key={idx}
              className="text-[8px] font-bold bg-white text-slate-600 px-1.5 py-0.5 rounded"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
