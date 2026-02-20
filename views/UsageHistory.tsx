
import React from 'react';
import { Download, Filter, Search, CheckCircle, XCircle, Clock, DollarSign, Zap, Timer, Fingerprint, ShieldAlert } from 'lucide-react';
import { getUsageHistory } from '../services/dataService';

export const UsageHistory: React.FC = () => {
  const logs = getUsageHistory();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Kullanım ve Davranış Geçmişi</h2>
            <p className="text-slate-500 mt-1">Sistem üzerindeki tüm işlemlerin teknik ve davranışsal dökümü.</p>
        </div>
        <div className="flex gap-3">
            <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                <Filter size={18} /> Filtrele
            </button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black flex items-center gap-2 font-bold shadow-sm">
                <Download size={18} /> Mühürlü Log Dökümü
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Zaman / Kullanıcı</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">İşlem</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Davranış Analizi</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gecikme</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Mühür</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors text-sm">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{log.user}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{log.timestamp} • {log.id}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">{log.action}</span>
                            <div className="text-xs text-slate-500 mt-1 truncate max-w-[150px]">{log.details}</div>
                        </td>
                        <td className="px-6 py-4">
                            {log.behavioralFlag === 'SUSPICIOUS' ? (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded text-[10px] font-black border border-rose-100 animate-pulse">
                                    <ShieldAlert size={10} /> SCRAPING_RISK
                                </span>
                            ) : log.behavioralFlag === 'RAPID' ? (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded text-[10px] font-black border border-amber-100">
                                    <Clock size={10} /> RAPID_QUERY
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-black border border-emerald-100">
                                    <Fingerprint size={10} /> HUMAN_NATURAL
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                            {log.latencyMs}ms
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="text-emerald-600 font-bold text-xs flex items-center justify-end gap-1">
                                <CheckCircle size={14}/> SEALED
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
