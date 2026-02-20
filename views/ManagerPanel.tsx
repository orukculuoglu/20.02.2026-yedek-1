
import React, { useEffect, useState } from 'react';
import { 
    Activity, TrendingUp, AlertTriangle, Shield, 
    BarChart3, PieChart as PieIcon, Layers, Zap,
    ArrowUpRight, ArrowDownRight, Lock, EyeOff,
    Briefcase, FileText, Info, Building2, BrainCircuit,
    Gauge, Target
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell, RadarChart, PolarGrid, 
    PolarAngleAxis, PolarRadiusAxis, Radar, Legend, 
    ScatterChart, Scatter, ZAxis
} from 'recharts';
import { getVehicleList } from '../services/dataService';
import { VehicleProfile } from '../types';

interface BrandAggregate {
    brand: string;
    avgRisk: number;
    avgLife: number;
    avgFail: number;
    count: number;
}

export const ManagerPanel: React.FC = () => {
    const [metrics, setMetrics] = useState<BrandAggregate[]>([]);
    const [fleetSize, setFleetSize] = useState(0);
    const [loading, setLoading] = useState(true);
    const [insufficientSignal, setInsufficientSignal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getVehicleList();
                
                if (!data || data.length < 2) {
                    setInsufficientSignal(true);
                    setLoading(false);
                    return;
                }

                setFleetSize(data.length);

                const brandGroups = data.reduce((acc, curr) => {
                    if (!acc[curr.brand]) acc[curr.brand] = { totalRisk: 0, count: 0, totalLife: 0, totalFail: 0 };
                    acc[curr.brand].totalRisk += curr.risk_score;
                    acc[curr.brand].totalLife += curr.average_part_life_score;
                    acc[curr.brand].totalFail += curr.failure_frequency_index;
                    acc[curr.brand].count += 1;
                    return acc;
                }, {} as Record<string, any>);

                const aggregated = Object.keys(brandGroups).map(brand => ({
                    brand,
                    avgRisk: Math.round(brandGroups[brand].totalRisk / brandGroups[brand].count),
                    avgLife: Math.round(brandGroups[brand].totalLife / brandGroups[brand].count),
                    avgFail: parseFloat((brandGroups[brand].totalFail / brandGroups[brand].count).toFixed(2)),
                    count: brandGroups[brand].count
                }));

                // Sort by Risk descending by default
                aggregated.sort((a, b) => b.avgRisk - a.avgRisk);

                setMetrics(aggregated);
                setLoading(false);
            } catch (e) {
                console.error("Aggregation failed", e);
                setInsufficientSignal(true);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Yönetici Paneli Verileri Hesaplanıyor...</p>
                </div>
            </div>
        );
    }

    if (insufficientSignal) {
        return (
            <div className="p-12 flex flex-col items-center justify-center h-screen bg-slate-50 text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-6">
                    <EyeOff size={48} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Yetersiz Sinyal</h2>
                <p className="text-slate-500 max-w-lg mt-3 leading-relaxed">
                    İstatistiksel anlamlılık için yeterli veri havuzu oluşmamıştır.
                </p>
            </div>
        );
    }

    const globalRisk = Math.round(metrics.reduce((acc, m) => acc + m.avgRisk, 0) / metrics.length);
    const globalLife = Math.round(metrics.reduce((acc, m) => acc + m.avgLife, 0) / metrics.length);
    const globalFail = parseFloat((metrics.reduce((acc, m) => acc + m.avgFail, 0) / metrics.length).toFixed(2));
    
    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900 animate-in fade-in duration-500">
            
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Briefcase size={32} className="text-slate-700" />
                        Yönetici Analiz Paneli
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 max-w-2xl">
                        Filo geneli için <span className="font-bold text-slate-700">Parça Ömrü</span>, <span className="font-bold text-slate-700">Arıza Frekansı</span> ve <span className="font-bold text-slate-700">Risk Skorları</span> analizi.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Building2 size={18} className="text-slate-400" />
                    <span className="font-bold text-slate-700">{fleetSize} Araç İzleniyor</span>
                </div>
            </div>

            {/* 1. KEY METRICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Part Life Metric */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ortalama Parça Ömrü</p>
                            <h3 className="text-4xl font-black text-emerald-600 flex items-baseline gap-1">
                                {globalLife}<span className="text-lg text-emerald-400 font-bold">%</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                            <Activity size={28} />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{width: `${globalLife}%`}}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 font-medium">
                        Sektör ortalamasının %{globalLife > 80 ? 'üzerinde' : 'altında'} performans.
                    </p>
                </div>

                {/* Failure Frequency Metric */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Arıza Frekansı</p>
                            <h3 className="text-4xl font-black text-amber-500 flex items-baseline gap-1">
                                {globalFail}<span className="text-lg text-amber-300 font-bold">x</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                            <Zap size={28} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 w-fit">
                        <AlertTriangle size={14} /> 
                        {globalFail > 1.5 ? 'Yüksek Frekans' : 'Normal Seviye'}
                    </div>
                    <p className="text-xs text-slate-500 mt-3 font-medium">
                        Her 10.000 KM başına düşen plansız servis giriş katsayısı.
                    </p>
                </div>

                {/* Risk Score Metric */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Filo Risk Skoru</p>
                            <h3 className={`text-4xl font-black flex items-baseline gap-1 ${globalRisk > 50 ? 'text-rose-600' : 'text-blue-600'}`}>
                                {globalRisk}<span className="text-lg text-slate-300 font-bold">/100</span>
                            </h3>
                        </div>
                        <div className={`p-3 rounded-xl ${globalRisk > 50 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Shield size={28} />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${globalRisk > 50 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{width: `${globalRisk}%`}}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 font-medium">
                        Model kronik sorunları ve kaza geçmişi bazlı ağırlıklı risk endeksi.
                    </p>
                </div>
            </div>

            {/* 2. CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Brand Risk Distribution (Bar Chart) */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-slate-400"/> Marka Bazlı Risk Dağılımı
                    </h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="brand" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="avgRisk" name="Risk Skoru" radius={[0, 4, 4, 0]} barSize={24}>
                                    {metrics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.avgRisk > 60 ? '#e11d48' : entry.avgRisk > 30 ? '#f59e0b' : '#10b981'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Correlation: Life vs Failure (Scatter Chart) */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Layers size={20} className="text-slate-400"/> Ömür vs. Arıza Korelasyonu
                        </h3>
                        <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> İdeal Bölge</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Risk Bölgesi</div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" dataKey="avgLife" name="Parça Ömrü" unit="%" domain={[0, 100]} label={{ value: 'Ortalama Parça Ömrü (%)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis type="number" dataKey="avgFail" name="Arıza F." unit="x" domain={[0, 'auto']} label={{ value: 'Arıza Frekansı (x)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-xl text-xs">
                                                <p className="font-bold text-slate-800 mb-1">{data.brand}</p>
                                                <p className="text-slate-500">Ömür: <span className="font-bold text-emerald-600">%{data.avgLife}</span></p>
                                                <p className="text-slate-500">Arıza: <span className="font-bold text-amber-600">{data.avgFail}x</span></p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                                <Scatter name="Markalar" data={metrics} fill="#8884d8">
                                    {metrics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.avgLife < 50 || entry.avgFail > 1.5 ? '#ef4444' : '#10b981'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. DETAILED DATA TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <BrainCircuit size={20} className="text-indigo-600" />
                            Stratejik Sinyal Tablosu
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Karar destek mekanizması için birleştirilmiş marka verileri.</p>
                    </div>
                    <button className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 transition-colors">
                        <FileText size={14} /> Rapor Al
                    </button>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-8 py-5">Marka Grubu</th>
                            <th className="px-8 py-5 text-center">Veri Güvenilirliği (Count)</th>
                            <th className="px-8 py-5 text-center">Arıza Frekansı</th>
                            <th className="px-8 py-5 text-center">Ortalama Ömür</th>
                            <th className="px-8 py-5 text-right">Risk Durumu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {metrics.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="font-bold text-slate-800 text-sm">{row.brand}</div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-mono font-bold border border-slate-200">
                                        n = {row.count}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className={`text-sm font-bold ${row.avgFail > 1.5 ? 'text-rose-600' : 'text-slate-700'}`}>
                                        {row.avgFail}x
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full" style={{width: `${row.avgLife}%`}}></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">%{row.avgLife}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    {row.avgRisk > 60 ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                                            <AlertTriangle size={14} /> Kritik
                                        </div>
                                    ) : row.avgRisk > 30 ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                                            <Activity size={14} /> İzlenmeli
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                            <Shield size={14} /> Güvenli
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};
