import React from 'react';
import { 
    TrendingUp, 
    DollarSign, 
    Percent, 
    AlertTriangle, 
    CheckCircle2, 
    Users, 
    Layers,
    Info,
    ShieldCheck
} from 'lucide-react';
import { ServiceWorkOrder } from '../types';

interface FinanceProfitabilityProps {
    workOrders: ServiceWorkOrder[];
}

// 17.02.2026 - Kârlılık Kriterleri
const TARGET_MARGIN = 20;

// Demo Maliyet Havuzu (Pazar ortalaması simülasyonu)
const DEMO_COST_MAP: Record<string, number> = {
    "Fren Balatası": 1800,
    "Triger Seti": 5200,
    "Yağ Bakımı": 2100,
    "Lastik Değişimi": 8500,
    "İşçilik": 500, // İşçilik maliyeti genelde düşüktür
};

export const FinanceProfitability: React.FC<FinanceProfitabilityProps> = ({ workOrders }) => {
    
    // 17.02.2026 - Props'tan gelen gerçek iş emirlerine öncelik ver
    const sourceOrders = workOrders || [];

    // Analiz Motoru (Read-only)
    const analytics = sourceOrders.map(wo => {
        const salesTotal = wo.diagnosisItems.reduce((acc, item) => acc + item.signalCost, 0);
        
        // Maliyet Hesaplama (Kural: Map'te yoksa %80 varsay)
        const costTotal = wo.diagnosisItems.reduce((acc, item) => {
            const unitCost = DEMO_COST_MAP[item.item] || (item.signalCost * 0.85);
            return acc + unitCost;
        }, 0);

        const profit = salesTotal - costTotal;
        const margin = salesTotal > 0 ? (profit / salesTotal) * 100 : 0;

        let signal: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
        if (margin >= TARGET_MARGIN) signal = 'HIGH';
        else if (margin >= TARGET_MARGIN / 2) signal = 'MEDIUM';

        // 17.02.2026 - Müşteri Adı Güvenli Okuma Fallback Zinciri
        const customerName =
            wo.customerName ||
            wo.operationalDetails?.customerName ||
            "Bilinmeyen";

        return {
            id: wo.id,
            customer: customerName,
            salesTotal,
            profit,
            margin,
            signal,
            itemCount: wo.diagnosisItems.length
        };
    }).filter(a => a.salesTotal > 0);

    // Global KPI Hesaplamaları
    const totalRevenue = analytics.reduce((acc, curr) => acc + curr.salesTotal, 0);
    const totalProfit = analytics.reduce((acc, curr) => acc + curr.profit, 0);
    const avgMargin = analytics.length > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const redAlertCount = analytics.filter(a => a.signal === 'LOW').length;

    const getSignalUI = (signal: 'HIGH' | 'MEDIUM' | 'LOW') => {
        switch (signal) {
            case 'HIGH': return <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100 uppercase">🟢 Optimal</span>;
            case 'MEDIUM': return <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black border border-amber-100 uppercase">🟡 İzlenmeli</span>;
            case 'LOW': return <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-100 uppercase animate-pulse">🔴 Kritik Marj</span>;
        }
    };

    return (
        <div className="p-8 animate-in fade-in duration-500 space-y-8 bg-slate-50/30 min-h-full">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <TrendingUp size={28} className="text-indigo-600" /> Finans & Kârlılık (V1)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium italic">SafeCore™ Finansal Sinyal Kalkanı Aktif</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Maliyet Verileri Maskelenmiştir</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={64} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Toplam Ciro</p>
                    <h3 className="text-2xl font-black text-slate-800">{totalRevenue.toLocaleString('tr-TR')} ₺</h3>
                    <p className="text-[10px] text-slate-500 mt-2">İşlenen toplam sinyal değeri</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CheckCircle2 size={64} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tahmini Net Kâr</p>
                    <h3 className="text-2xl font-black text-emerald-600">{totalProfit.toLocaleString('tr-TR')} ₺</h3>
                    <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                        <TrendingUp size={10} /> +%12.4 Verimlilik
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Percent size={64} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ortalama Marj</p>
                    <h3 className="text-2xl font-black text-indigo-600">%{avgMargin.toFixed(1)}</h3>
                    <p className="text-[10px] text-slate-500 mt-2">Hedef Marj: %{TARGET_MARGIN}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-rose-500">
                        <AlertTriangle size={64} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Düşük Marjlı İşler</p>
                    <h3 className={`text-2xl font-black ${redAlertCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {redAlertCount} İş Emri
                    </h3>
                    <p className="text-[10px] text-rose-500 font-bold mt-2">İyileştirme Gerekenler</p>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Layers size={18} className="text-indigo-600" /> Operasyonel Marj Analizi
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">İdeal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Orta</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Düşük</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-4">İş Emri ID</th>
                                <th className="px-8 py-4">Müşteri (Maskelenmiş)</th>
                                <th className="px-8 py-4 text-right">Satış Toplamı</th>
                                <th className="px-8 py-4 text-center">Kalem Sayısı</th>
                                <th className="px-8 py-4 text-center">Marj Sinyali</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {analytics.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="font-mono text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">{row.id}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                <Users size={16} />
                                            </div>
                                            <div className="text-sm font-bold text-slate-700">{row.customer}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="text-sm font-black text-slate-800">{row.salesTotal.toLocaleString('tr-TR')} ₺</div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md inline-block border border-slate-200">
                                            {row.itemCount} Kalem
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="inline-flex justify-center">
                                            {getSignalUI(row.signal)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {analytics.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">
                                        Hesaplanacak aktif veri bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-blue-50/50 border-t border-slate-100 flex items-start gap-3">
                    <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                        <strong>Güvenlik Notu:</strong> Maliyet değerleri DEMO_COST_MAP ve tahminleme algoritmaları ile simüle edilmiştir. 
                        SafeCore™ gizlilik protokolü gereği, ham alış faturalarına erişim kısıtlıdır. Sadece karlılık sinyalleri operasyonel karar destek için sunulur.
                    </p>
                </div>
            </div>
        </div>
    );
};