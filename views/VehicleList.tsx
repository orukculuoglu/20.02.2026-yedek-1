
import React, { useEffect, useState } from 'react';
import { Search, Filter, FileText, Settings, Eye, MoreHorizontal, Globe, Cpu } from 'lucide-react';
import { ViewState } from '../types';
import { getVehicleList } from '../services/dataService';

interface VehicleListProps {
  onSelectVehicle: (id: string) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({ onSelectVehicle }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    getVehicleList().then(setVehicles);
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Araç Kütüphanesi</h2>
            <p className="text-slate-500 mt-1">Anonim ID'ye dönüştürülmüş geçmiş sorgularınız ve dış entegrasyonlar.</p>
        </div>
        <div className="flex gap-3">
            <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                <Filter size={18} /> Filtrele
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                <FileText size={18} /> Dışa Aktar (CSV)
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Vehicle ID veya Şase Hash ara..." 
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
            </div>
        </div>

        {/* Table */}
        <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Marka / Model</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Motor Kodu</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle ID (SafeCore™)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Yıl</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk / Kaynak</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">İşlemler</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                    <tr key={v.vehicle_id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onSelectVehicle(v.vehicle_id)}>
                        <td className="px-6 py-4">
                            <div className="text-sm font-bold text-slate-800">{v.brand} {v.model}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{v.engine} • {v.transmission}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                <Cpu size={12} /> {v.engine_code}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block">
                                {v.vehicle_id.substring(0, 18)}...
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">{v.year}</td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${v.risk_score > 40 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {v.risk_score > 40 ? 'RİSKLİ' : 'DÜŞÜK'}
                                </span>
                                {v.last_query === 'RepXpert Canlı' && (
                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                        <Globe size={10} /> RepXpert Entegre
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectVehicle(v.vehicle_id);
                                    }}
                                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Detaylı Analiz"
                                >
                                    <Eye size={18} />
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/30">
            <span className="text-sm text-slate-500 font-medium">Toplam {vehicles.length} kayıt gösteriliyor</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 transition-colors">Önceki</button>
                <button className="px-3 py-1 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 transition-colors">Sonraki</button>
            </div>
        </div>
      </div>
    </div>
  );
};
