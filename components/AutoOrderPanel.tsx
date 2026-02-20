

import React, { useState, useEffect } from 'react';
import { 
    Zap, TrendingUp, Package, Calendar, AlertCircle, 
    CheckCircle, Plus, Trash2, ShoppingCart, Info, 
    ArrowRight, Sparkles, Layers, Check, X, Box, Send, AlertTriangle
} from 'lucide-react';
import { generateReorderSuggestions, ReorderSuggestion } from '../services/autoOrderService';
// Fix: Use consistent lowercase casing for erpOutbox to resolve casing conflict
import { enqueueEvent } from '../services/erp/erpOutbox';

interface AutoOrderPanelProps {
    tenantId: string;
}

export const AutoOrderPanel: React.FC<AutoOrderPanelProps> = ({ tenantId }) => {
    const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [orderedIds, setOrderedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        // Simulate data acquisition
        setLoading(true);
        setTimeout(() => {
            const data = generateReorderSuggestions({ tenantId });
            setSuggestions(data);
            
            // Initialize default quantities from ranges
            const initialQs: Record<string, number> = {};
            data.forEach(s => {
                // Parse "5-10 adet" -> 5
                const min = parseInt(s.recommendedRange.split('-')[0]) || 1;
                initialQs[s.id] = min;
            });
            setQuantities(initialQs);
            
            setLoading(false);
        }, 800);
    }, [tenantId]);

    const toggleSelection = (id: string) => {
        if (orderedIds.has(id)) return;
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleQuantityChange = (id: string, val: string) => {
        const num = parseInt(val);
        setQuantities(prev => ({
            ...prev,
            [id]: isNaN(num) ? 0 : num
        }));
    };

    const handleCreateOrder = async () => {
        if (selectedIds.size === 0) return;

        // Validation
        let hasInvalidQty = false;
        selectedIds.forEach(id => {
            const q = quantities[id];
            if (!q || q < 1 || q > 999) hasInvalidQty = true;
        });

        if (hasInvalidQty) {
            setErrorMsg("Lütfen seçili tüm kalemler için 1-999 arası geçerli bir miktar giriniz.");
            setTimeout(() => setErrorMsg(null), 3000);
            return;
        }

        const selectedItems = suggestions.filter(s => selectedIds.has(s.id));
        
        // Convert to payload as requested
        const payload = {
            items: selectedItems.map(s => ({
                id: s.id,
                category: s.category,
                quantity: quantities[s.id],
                season: s.seasonalityLabel,
                confidence: s.confidenceScore,
                recommendedRange: s.recommendedRange,
                velocity: s.velocitySignal
            })),
            totalItems: selectedIds.size,
            timestamp: Date.now()
        };

        // Enqueue to ERP Outbox
        enqueueEvent({
            tenantId,
            workOrderId: "STOCK_REPLENISHMENT", 
            type: 'AUTO_STOCK_ORDER',
            payload
        });

        // Prevention of duplicates for this session
        const newOrderedSet = new Set(orderedIds);
        selectedIds.forEach(id => newOrderedSet.add(id));
        setOrderedIds(newOrderedSet);

        // Feedback & UI Reset
        setSelectedIds(new Set());
        // Re-initialize quantities for non-ordered items to their defaults (optional, but clean)
        const resetQs: Record<string, number> = {};
        suggestions.forEach(s => {
            const min = parseInt(s.recommendedRange.split('-')[0]) || 1;
            resetQs[s.id] = min;
        });
        setQuantities(resetQs);
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const getVelocityBadge = (signal: string) => {
        switch (signal) {
            case 'HIGH': return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-100 uppercase tracking-tighter">Hızlı Devir</span>;
            case 'MEDIUM': return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black border border-blue-100 uppercase tracking-tighter">Orta Devir</span>;
            case 'LOW': return <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black border border-slate-100 uppercase tracking-tighter">Düşük Devir</span>;
            default: return null;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500 space-y-8 relative">
            {/* Success Toast */}
            {showToast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-emerald-50">
                    <Check size={18} strokeWidth={3} /> Sipariş Talebi ERP Kuyruğuna Eklendi
                </div>
            )}

            {/* Error Toast */}
            {errorMsg && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-rose-50">
                    <AlertTriangle size={18} strokeWidth={3} /> {errorMsg}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Zap size={28} className="text-amber-500 fill-amber-500" /> Akıllı Stok Sinyalleri
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Geçmiş 30 günlük operasyon sinyallerine göre asenkron sipariş önerileri.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
                        <Calendar size={18} className="text-indigo-500" />
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mevsimsel Sinyal</p>
                            <p className="text-xs font-bold text-slate-700">Kış Geçiş Periyodu</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Zone */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp size={18} className="text-indigo-600" /> En Hareketli Kategoriler
                            </h3>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">İlk 10 Kategori</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                                <Sparkles className="animate-pulse mb-3" />
                                <p className="text-sm font-medium">Sinyaller analiz ediliyor...</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {suggestions.map((sug) => {
                                    const isSelected = selectedIds.has(sug.id);
                                    const isOrdered = orderedIds.has(sug.id);
                                    const currentQty = quantities[sug.id] || 0;

                                    return (
                                        <div 
                                            key={sug.id} 
                                            className={`p-5 flex items-center justify-between transition-colors group ${
                                                isOrdered ? 'bg-slate-50/50 opacity-60' : 
                                                isSelected ? 'bg-indigo-50/30' : 'hover:bg-slate-50/80'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => !isOrdered && toggleSelection(sug.id)}>
                                                {/* Checkbox UI */}
                                                <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center shrink-0 ${
                                                    isOrdered ? 'bg-slate-300 border-slate-300' :
                                                    isSelected ? 'bg-indigo-600 border-indigo-600' : 
                                                    'border-slate-300 bg-white group-hover:border-indigo-400'
                                                }`}>
                                                    {(isSelected || isOrdered) && <Check size={14} strokeWidth={4} className="text-white" />}
                                                </div>

                                                <div className={`p-3 rounded-2xl shrink-0 ${sug.velocitySignal === 'HIGH' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Package size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className={`font-bold text-sm truncate ${isOrdered ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                            {sug.category}
                                                        </h4>
                                                        {isOrdered && (
                                                            <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase">Talep Edildi</span>
                                                        )}
                                                        {sug.seasonalityLabel !== 'Genel' && !isOrdered && (
                                                            <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold border border-amber-100 uppercase tracking-tighter">
                                                                {sug.seasonalityLabel} Odaklı
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {getVelocityBadge(sug.velocitySignal)}
                                                        <span className="text-[10px] text-slate-400 font-bold">Güven: %{sug.confidenceScore}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6 shrink-0">
                                                <div className="text-right">
                                                    <p className={`text-xs font-black tracking-tight ${isOrdered ? 'text-slate-400' : 'text-indigo-600'}`}>
                                                        {sug.recommendedRange}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Öneri Aralığı</p>
                                                </div>

                                                {/* Quantity Input */}
                                                <div className="flex flex-col items-center">
                                                    <input 
                                                        type="number"
                                                        min="1"
                                                        max="999"
                                                        step="1"
                                                        disabled={!isSelected || isOrdered}
                                                        value={currentQty}
                                                        onChange={(e) => handleQuantityChange(sug.id, e.target.value)}
                                                        className={`w-16 px-2 py-1.5 text-center text-sm font-black rounded-lg border-2 transition-all outline-none ${
                                                            isOrdered ? 'bg-slate-50 border-slate-100 text-slate-300' :
                                                            isSelected 
                                                                ? 'bg-white border-indigo-500 text-indigo-700 shadow-sm' 
                                                                : 'bg-slate-50 border-slate-200 text-slate-400'
                                                        }`}
                                                    />
                                                    <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Miktar</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Draft Zone */}
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col min-h-[500px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingCart size={20} className="text-amber-400" /> Sipariş Özeti
                            </h3>
                            {selectedIds.size > 0 && (
                                <button 
                                    onClick={() => setSelectedIds(new Set())} 
                                    className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1"
                                >
                                    <Trash2 size={12} /> Seçimi Kaldır
                                </button>
                            )}
                        </div>

                        <div className="flex-1 space-y-3 relative z-10">
                            {selectedIds.size > 0 ? (
                                suggestions.filter(s => selectedIds.has(s.id)).map(item => (
                                    <div key={item.id} className="bg-white/10 p-4 rounded-2xl border border-white/5 flex justify-between items-center group animate-in slide-in-from-bottom-2">
                                        <div>
                                            <p className="text-xs font-bold text-white">{item.category}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-indigo-300 font-bold">{quantities[item.id]} adet</span>
                                                <span className="text-[9px] text-slate-500">•</span>
                                                <span className="text-[9px] text-slate-500">{item.recommendedRange} önerisi içinden</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => toggleSelection(item.id)}
                                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-[2rem]">
                                    <Box size={40} className="text-slate-700 mb-4" />
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Henüz bir kategori seçilmedi.<br/>Soldaki listeden kutucukları işaretleyerek başlayın.
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedIds.size > 0 && (
                            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                                <button 
                                    onClick={handleCreateOrder}
                                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2"
                                >
                                    Sipariş Oluştur <Send size={18} />
                                </button>
                                <p className="text-[9px] text-slate-500 text-center mt-4 uppercase font-bold tracking-widest">
                                    {selectedIds.size} Kategori Seçildi
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-6 flex gap-4">
                        <Info size={24} className="text-blue-500 shrink-0" />
                        <div>
                            <h4 className="text-sm font-black text-blue-900 uppercase mb-1">Stok Talep Politikası</h4>
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                Öneri aralığına bağlı kalarak veya özel ihtiyaçlarına göre miktar belirleyebilirsiniz. Talebiniz ERP çıkış kuyruğuna (Outbox) aktarılarak depo onayına sunulur.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};