import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock, ShieldCheck, Zap, Info } from 'lucide-react';
import { AlternativeSignal, getAlternativesForPart } from '../services/b2bNetworkService';

interface B2BAlternativesPanelProps {
    tenantId: string;
    partLabel: string;
    vehicleBrand?: string;
}

export const B2BAlternativesPanel: React.FC<B2BAlternativesPanelProps> = ({ 
    tenantId, 
    partLabel, 
    vehicleBrand 
}) => {
    const alternatives = getAlternativesForPart({ tenantId, partHint: partLabel, brandHint: vehicleBrand });

    const getAvailabilityIcon = (level: string) => {
        switch (level) {
            case 'HIGH': return <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />;
            case 'MEDIUM': return <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200" />;
            case 'LOW': return <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200" />;
            default: return <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />;
        }
    };

    const getCompatBadge = (signal: string) => {
        switch (signal) {
            case 'COMPATIBLE': 
                return <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100 uppercase">Tam Uyumlu</span>;
            case 'UNCERTAIN':
                return <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-100 uppercase">Katalog Onayı Bekliyor</span>;
            default:
                return <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">Bilinmiyor</span>;
        }
    };

    return (
        <div className="mt-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={12} className="text-amber-400 fill-amber-400" /> B2B Ağ Alternatifleri
                </h5>
                <div className="flex items-center gap-2">
                   <div className="flex gap-1 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Müsait</span>
                   </div>
                </div>
            </div>

            <div className="space-y-3">
                {alternatives.map((alt) => (
                    <div key={alt.id} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                {getAvailabilityIcon(alt.availabilitySignal)}
                                <div>
                                    <p className="text-xs font-bold text-slate-100">{alt.brandLabel}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">{alt.tier} SEGMENT</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-emerald-400">~ {alt.priceMin.toLocaleString()} - {alt.priceMax.toLocaleString()} ₺</p>
                                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-0.5">
                                    <Clock size={10} /> {alt.leadTimeLabel}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                            {getCompatBadge(alt.compatSignal)}
                            <button className="text-[9px] font-bold text-indigo-400 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-tighter">
                               Siparişe Dönüştür <Clock size={10} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 flex items-start gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[9px] text-blue-300 leading-tight">
                    Fiyatlar ve stok durumları SafeCore Supply Network üzerinden anlık sinyal olarak alınmaktadır. Satın alma aşamasında nihai teyit gereklidir.
                </p>
            </div>
        </div>
    );
};
