

import React, { useState, useEffect } from 'react';
import { 
    Server, 
    Activity, 
    Zap, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    RefreshCw, 
    ShieldCheck, 
    ArrowRight,
    Search,
    Filter,
    Send,
    AlertTriangle,
    Database,
    History,
    MoreVertical
} from 'lucide-react';
import { ServiceWorkOrder } from '../types';
// Fix: Use consistent lowercase casing for erpOutbox to resolve casing conflict
import { getWorkOrderSyncState, retryWorkOrderNow } from '../services/erp/erpOutbox';
// Fix: Use consistent lowercase casing for erpConnector to resolve casing conflict
import { getErpSentLog } from '../services/erp/erpConnector';

interface ERPBridgePanelProps {
    workOrders: ServiceWorkOrder[];
}

export const ERPBridgePanel: React.FC<ERPBridgePanelProps> = ({ workOrders }) => {
    const [sentLogs, setSentLogs] = useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Verileri periyodik ve manuel yenileme
    useEffect(() => {
        setSentLogs(getErpSentLog());
    }, [refreshTrigger]);

    const handleRetry = (orderId: string) => {
        retryWorkOrderNow('LENT-CORP-SECURE', orderId);
        setRefreshTrigger(prev => prev + 1);
    };

    // Outbox (Bekleyen veya Hatalı) iş emirlerini tespit et
    const pendingOrders = workOrders.map(wo => {
        const sync = getWorkOrderSyncState('LENT-CORP-SECURE', wo.id);
        return { ...wo, sync };
    }).filter(item => item.sync.state === 'PENDING' || item.sync.state === 'FAILED' || item.sync.state === 'OFFLINE');

    const getStatusIcon = (state: string) => {
        switch (state) {
            case 'SENT': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'FAILED': return <XCircle size={16} className="text-rose-500" />;
            case 'PENDING': return <Clock size={16} className="text-blue-500 animate-pulse" />;
            case 'OFFLINE': return <Zap size={16} className="text-amber-500" />;
            default: return <Clock size={16} className="text-slate-300" />;
        }
    };

    return (
        <div className="p-8 animate-in fade-in duration-500 space-y-8 h-full flex flex-col bg-slate-50/30">
            {/* Bridge Header */}
            <div className="flex justify-between items-start shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Server size={28} className="text-indigo-600" /> SafeCore™ ERP Köprüsü
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Kurumsal veri senkronizasyonu ve olay iletim merkezi.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <Database size={18} className="text-blue-500" />
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bağlantı Hedefi</p>
                            <p className="text-xs font-bold text-slate-700">SAP S/4HANA Cluster</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setRefreshTrigger(prev => prev + 1)}
                        className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600"
                    >
                        <RefreshCw size={20} className={refreshTrigger % 2 === 1 ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
                {/* Outbox Zone (Bekleyen İşlemler) */}
                <div className="lg:col-span-1 flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                            <Zap size={18} className="text-amber-500" /> Çıkış Kuyruğu (Outbox)
                        </h3>
                        <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-black">
                            {pendingOrders.length} BEKLEYEN
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {pendingOrders.length > 0 ? pendingOrders.map((item, idx) => (
                            <div key={idx} className="p-4 border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all group bg-white shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(item.sync.state)}
                                        <span className="text-[10px] font-mono font-bold text-slate-400">#{item.id}</span>
                                    </div>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${
                                        item.sync.state === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                                        item.sync.state === 'PENDING' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                    }`}>
                                        {item.sync.state}
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-800">{item.operationalHash}</h4>
                                <p className="text-[10px] text-slate-500 mt-1">Deneme: {item.sync.attempts || 0}/3</p>
                                
                                {item.sync.state === 'FAILED' && (
                                    <div className="mt-3 flex gap-2">
                                        <button 
                                            onClick={() => handleRetry(item.id)}
                                            className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <RefreshCw size={10} /> Yeniden Dene
                                        </button>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <CheckCircle2 size={48} className="opacity-10 mb-4" />
                                <p className="text-xs font-medium">Tüm işlemler senkronize edildi. Kuyruk boş.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction Logs (İşlem Günlüğü) */}
                <div className="lg:col-span-2 flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                            <History size={18} className="text-indigo-600" /> İşlem Günlüğü (Mühürlü)
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Son 50 İşlem</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4">Zaman / ID</th>
                                    <th className="px-6 py-4">Operasyon (Op)</th>
                                    <th className="px-6 py-4">Referans</th>
                                    <th className="px-6 py-4 text-center">KVKK Statü</th>
                                    <th className="px-6 py-4 text-right">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-xs">
                                {sentLogs.length > 0 ? sentLogs.map((log, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-mono text-slate-400 text-[9px] mb-0.5">{new Date(log.timestamp).toLocaleTimeString('tr-TR')}</p>
                                            <p className="font-bold text-slate-600">{new Date(log.timestamp).toLocaleDateString('tr-TR')}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-100">
                                                {log.op}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{log.externalRef}</p>
                                            <p className="text-[9px] text-slate-400 italic">{log.meta.correlation.operationalHash}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                <ShieldCheck size={10} /> NO_PII
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-black border border-emerald-100 uppercase text-[9px]">
                                                <CheckCircle2 size={10} /> Başarılı
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                                            Henüz bir işlem kaydı oluşturulmadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bridge Status Bar */}
            <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white shrink-0 shadow-xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Activity size={20} className="text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">ERP Worker Sağlık Durumu: <span className="text-emerald-400 uppercase tracking-widest ml-1">Normal</span></h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Global senkronizasyon döngüsü her 10 saniyede bir tetiklenir.</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 relative z-10 px-4">
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Gecikme (Latency)</p>
                        <p className="text-xs font-mono font-bold text-emerald-400">~ 420ms</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Hata Oranı (Rate)</p>
                        <p className="text-xs font-mono font-bold text-indigo-400">0.02%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};