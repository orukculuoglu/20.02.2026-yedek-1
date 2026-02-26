import React from 'react';
import { Search, Zap, CheckCircle, Package, Info } from 'lucide-react';
import { getPartMasterCatalog, getSupplierOffers, getPartIndices } from '../services/dataService';
import { PartMasterCatalog, SupplierOffer } from '../types/partMaster';
import { DataEngineIndices } from '../services/dataEngineIndices';
import { BestOfferWidget } from '../components/BestOfferWidget';

interface ProcessedStockItem {
    partMasterId: string;
    sku: string;
    name: string;
    category: string;
    partGroup?: string;
    stock: number;
    leadDays: number;
    trustScore: number;
    riskScore: number;
    orderSuggestion: number;
}

export const PartStockSignals: React.FC = () => {
    const [stockData, setStockData] = React.useState<ProcessedStockItem[]>([]);
    const [catalog, setCatalog] = React.useState<PartMasterCatalog | null>(null);
    const [indices, setIndices] = React.useState<DataEngineIndices | null>(null);
    const [loading, setLoading] = React.useState(true);
    
    const tenantId = 'LENT-CORP-DEMO'; // From env or auth context
    
    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            console.log('[PartStockSignals] Loading Part Master Catalog + Offers + Indices...');
            
            try {
                // 1. Get canonical Part Master catalog
                const pmCatalog = await getPartMasterCatalog(tenantId);
                setCatalog(pmCatalog);
                
                console.log('[PartStockSignals] Catalog loaded:', {
                    parts: pmCatalog.parts.length,
                    brands: pmCatalog.brands.length,
                });
                
                // 2. Get supplier offers (B2B bridge)
                const offers = await getSupplierOffers(pmCatalog, tenantId);
                console.log('[PartStockSignals] Offers loaded:', offers.length);
                
                // 3. Get computed indices
                const computedIndices = await getPartIndices(pmCatalog, offers);
                setIndices(computedIndices);
                
                console.log('[PartStockSignals] Indices computed:', {
                    parts: computedIndices.partCount,
                    avgSupplyStress: computedIndices.averages.supplyStress,
                });
                
                // 4. Process display data
                const processed: ProcessedStockItem[] = pmCatalog.parts.map(part => {
                    // Find indices for this part
                    const topSupply = computedIndices.topSupplyStress.find(i => i.partMasterId === part.partMasterId);
                    const relevantOffers = offers.filter(o => o.partMasterId === part.partMasterId);
                    const totalStock = relevantOffers.reduce((s, o) => s + o.stock, 0);
                    const avgLeadDays = relevantOffers.length > 0
                        ? Math.round(relevantOffers.reduce((s, o) => s + o.leadDays, 0) / relevantOffers.length)
                        : 7;
                    
                    // Order suggestion: if supply < 10 days, suggest reorder
                    const orderSuggestion = (totalStock <= 5 || avgLeadDays > 5) ? 10 : 0;
                    
                    return {
                        partMasterId: part.partMasterId,
                        sku: part.sku,
                        name: part.name,
                        category: part.category,
                        partGroup: part.partGroup,
                        stock: totalStock,
                        leadDays: avgLeadDays,
                        trustScore: part.dataQuality || 85,
                        riskScore: topSupply?.supplyStress || 45,
                        orderSuggestion,
                    };
                });
                
                setStockData(processed);
                setLoading(false);
            } catch (error) {
                console.error('[PartStockSignals] Error loading catalog:', error);
                setLoading(false);
            }
        };
        
        loadData();
    }, [tenantId]);
    
    const processedData = stockData;
    const source = catalog?.generatedAt ? 'CANONICAL' : 'UNKNOWN';
    const totalStockValue = stockData.reduce((s, item) => s + (item.stock * 1000), 0); // Estimate
    const highRiskCount = stockData.filter(item => item.riskScore > 60).length;

    return (
        <div className="p-8 animate-in fade-in duration-500 space-y-8 h-full flex flex-col bg-slate-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Package size={28} className="text-indigo-600" /> Parça & Stok Sinyalleri
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 italic font-medium">Veri Kaynağı: <span className="font-bold text-slate-700">{source}</span> | TenantId: <span className="font-bold text-slate-700">{tenantId}</span></p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-cyan-50 border border-cyan-100 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                        <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Veri Kaynağı</span>
                        <span className="text-xs font-bold text-cyan-700 uppercase px-2 py-1 bg-cyan-100 rounded">{source}</span>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                        <Zap size={18} className="text-indigo-600 fill-indigo-600 animate-pulse" />
                        <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Engine Status</p>
                            <p className="text-xs font-bold text-indigo-700 uppercase">PartMaster Live</p>
                        </div>
                    </div>
                </div>
            </div>

            {indices && (
                <div className="grid grid-cols-5 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Toplam Parça</p>
                        <p className="text-2xl font-black text-slate-800">{indices.partCount}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Toplam Teklif</p>
                        <p className="text-2xl font-black text-slate-800">{indices.offerCount}</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Ort. Fiyat Volatilite</p>
                        <p className="text-2xl font-black text-slate-800">{indices.averages.priceVolatility}%</p>
                    </div>
                    <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-red-600 uppercase">Yüksek Risk Parça</p>
                        <p className="text-2xl font-black text-red-700">{highRiskCount}</p>
                    </div>
                    <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Ort. Güven Skoru</p>
                        <p className="text-2xl font-black text-blue-700">{indices.averages.trustScore}</p>
                    </div>
                </div>
            )}
            
            {loading && <div className="text-center py-8 text-slate-500">Parça verisi yükleniyor...</div>}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Parça adı veya kategori ara..." 
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white" 
                        />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Son Veri Güncelleme: 17.02.2026</span>
                    </div>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase font-black tracking-widest sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Parça</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4 text-center">Stok</th>
                                <th className="px-6 py-4 text-center">Son30 Satış</th>
                                <th className="px-6 py-4 text-center">Günlük Ort.</th>
                                <th className="px-6 py-4 text-center">Tahmini Tükenme</th>
                                <th className="px-6 py-4 text-center">Risk Skoru</th>
                                <th className="px-6 py-4 text-center">Sipariş Önerisi</th>
                                <th className="px-6 py-4">Önerilen Tedarikçi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {processedData.map((item) => (
                                <tr key={item.partId || item.sku} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sku}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase border border-slate-200">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-slate-700 text-sm">{item.inventory?.onHand || 0}</span>
                                            <span className="text-[9px] text-slate-400 font-medium">{item.unit}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-slate-600 text-sm">{item.salesSignal?.soldQty || 0}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-black text-indigo-600 text-sm">{(item.salesSignal?.dailyAverage || 0).toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`font-black text-sm ${item.daysToZero < 10 ? 'text-rose-600' : 'text-slate-700'}`}>
                                                {item.daysToZero} Gün
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Kalan Süre</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-tighter shadow-sm ${
                                                item.riskScore >= 80 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                item.riskScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                {item.riskScore >= 80 ? 'KRİTİK' : item.riskScore >= 50 ? 'YÜKSEK' : 'DÜŞÜK'} ({item.riskScore})
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {item.orderSuggestion > 0 ? (
                                            <div className="inline-flex flex-col items-center bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl shadow-sm animate-in zoom-in-95">
                                                <span className="text-indigo-800 font-black text-sm">+{item.orderSuggestion}</span>
                                                <span className="text-[8px] text-indigo-400 font-black uppercase leading-none">Talep Önerisi</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                                                <CheckCircle size={14}/> Yeterli
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.partMasterId ? (
                                            <BestOfferWidget
                                              partMasterId={item.partMasterId}
                                              institutionId="INST-001"
                                              tenantId="LENT-CORP-DEMO"
                                              compact={true}
                                            />
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                        <Info size={24} className="text-amber-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-widest text-indigo-400">Tahminleme Notu</h4>
                        <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1 font-medium">
                            Hesaplamalar <strong>Differential Privacy</strong> kalkanı altında, son 30 günlük satış trendlerini baz almaktadır. 
                            Tahmini tükenme süresi 15 günün altındaki kalemler için otomatik talep sinyali oluşturulur.
                        </p>
                    </div>
                </div>
                
                <button className="relative z-10 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2">
                    <Zap size={16} fill="currentColor" /> Analiz Raporunu İndir
                </button>
            </div>
        </div>
    );
};
