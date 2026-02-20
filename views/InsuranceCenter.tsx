
import React, { useEffect, useState } from 'react';
import { 
    Shield, AlertTriangle, FileCheck, Search, Activity, ShieldCheck, Zap, 
    Layout, FileText, Siren, BarChart3, Database, LogOut, Filter, ArrowUpRight,
    Loader2, CheckCircle2, AlertOctagon, Car, Calendar, CreditCard, Layers
} from 'lucide-react';
import { getInsuranceData } from '../services/dataService';
import { InsurancePolicy, ViewState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface InsuranceCenterProps {
    onNavigate?: (view: ViewState, id?: string) => void;
}

type InsuranceSubView = 'DASHBOARD' | 'POLICIES' | 'CLAIMS' | 'RISK_MAP' | 'SBM';

// --- MOCK DATA ---
const MOCK_CLAIMS = [
    { id: 'CLM-2024-001', policyNo: '34912201', plate: '34 VM 228', date: '12.05.2024', status: 'EXPERTISE', type: 'Kaza - Çarpışma', amount: 45000, vehicleId: 'WBA8E9C5-XXXX-23456' },
    { id: 'CLM-2024-002', policyNo: '99102341', plate: '06 AD 991', date: '10.05.2024', status: 'PAYMENT_PENDING', type: 'Cam Kırılması', amount: 8500, vehicleId: 'WBAVM135-XXXX-6823' },
    { id: 'CLM-2024-003', policyNo: '11293844', plate: '35 KS 442', date: '01.05.2024', status: 'CLOSED', type: 'Mini Onarım', amount: 1200, vehicleId: 'TMBAG6NE-8F02-39523' },
];

export const InsuranceCenter: React.FC<InsuranceCenterProps> = ({ onNavigate }) => {
    const [activeView, setActiveView] = useState<InsuranceSubView>('DASHBOARD');
    const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
    const [claims, setClaims] = useState<any[]>(MOCK_CLAIMS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Simulate data fetch
        setTimeout(() => {
            getInsuranceData().then(data => {
                setPolicies(data);
                setLoading(false);
            });
        }, 600);
    }, []);

    // --- SUB-COMPONENTS ---

    const InsuranceSidebar = () => (
        <div className="w-64 bg-cyan-900 text-cyan-100 h-screen fixed left-0 top-0 flex flex-col z-20 shadow-2xl">
            <div className="p-6 flex items-center gap-3 border-b border-cyan-800/50">
                <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                    <Shield size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">InsuranceCore</h1>
                    <p className="text-[10px] text-cyan-300 font-medium uppercase tracking-wider">Sigorta & Risk Yönetimi</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {[
                    { id: 'DASHBOARD', label: 'Genel Bakış', icon: Layout },
                    { id: 'POLICIES', label: 'Poliçe Havuzu', icon: FileCheck },
                    { id: 'CLAIMS', label: 'Hasar Dosyaları', icon: Siren },
                    { id: 'RISK_MAP', label: 'Risk Analizi', icon: BarChart3 },
                    { id: 'SBM', label: 'SBM Olay Bildirimi', icon: Database },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveView(item.id as InsuranceSubView)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            activeView === item.id 
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                            : 'text-cyan-300 hover:bg-cyan-800 hover:text-white'
                        }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-cyan-800/50">
                <button 
                    onClick={() => onNavigate && onNavigate(ViewState.DASHBOARD)}
                    className="w-full flex items-center justify-center gap-2 bg-cyan-950 hover:bg-slate-900 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-cyan-800"
                >
                    <LogOut size={16} />
                    Süper Admin'e Dön
                </button>
            </div>
        </div>
    );

    const InsuranceHeader = () => (
        <header className="h-20 bg-white border-b border-cyan-50 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    {activeView === 'DASHBOARD' && 'Acente Operasyon Ekranı'}
                    {activeView === 'POLICIES' && 'Aktif Poliçe Yönetimi'}
                    {activeView === 'CLAIMS' && 'Hasar Dosya Takibi'}
                    {activeView === 'RISK_MAP' && 'Portföy Risk Dağılımı'}
                    {activeView === 'SBM' && 'SBM Olay Bildirim Akışı'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Allianz Sigorta Acentesi • A Tipi Yetkili</p>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <Activity size={16} className="text-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700">SBM Event Sync</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold border-2 border-cyan-50">
                        SA
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-slate-700">Sigorta Uzmanı</p>
                        <p className="text-[10px] text-slate-400">Hasar Departmanı</p>
                    </div>
                </div>
            </div>
        </header>
    );

    // --- VIEWS ---

    const DashboardView = () => {
        const stats = [
            { label: 'Aktif Poliçe', value: 1254, icon: FileCheck, color: 'bg-blue-50 text-blue-600' },
            { label: 'Açık Hasar', value: 18, icon: Siren, color: 'bg-rose-50 text-rose-600' },
            { label: 'Yüksek Risk', value: 42, icon: AlertOctagon, color: 'bg-amber-50 text-amber-600' },
            { label: 'Aylık Prim', value: '8.4M ₺', icon: CreditCard, color: 'bg-emerald-50 text-emerald-600' },
        ];

        return (
            <div className="animate-in fade-in duration-500 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">{s.label}</p>
                                <h3 className="text-2xl font-bold text-slate-800">{s.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${s.color}`}><s.icon size={24}/></div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-6">Hasar Dosya Analizi (Son 6 Ay)</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Oca', hasar: 12, risk: 5 },
                                    { name: 'Şub', hasar: 19, risk: 8 },
                                    { name: 'Mar', hasar: 15, risk: 4 },
                                    { name: 'Nis', hasar: 22, risk: 10 },
                                    { name: 'May', hasar: 28, risk: 12 },
                                    { name: 'Haz', hasar: 18, risk: 6 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                                    <Bar dataKey="hasar" fill="#0891b2" radius={[4,4,0,0]} barSize={30} name="Hasar Adedi" />
                                    <Bar dataKey="risk" fill="#f43f5e" radius={[4,4,0,0]} barSize={30} name="Yüksek Riskli" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Son İşlemler</h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Poliçe Yenileme', desc: '34 AB 123 - Kasko', time: '10 dk önce', type: 'success' },
                                { title: 'Hasar İhbarı', desc: '06 XYZ 99 - Çarpışma', time: '45 dk önce', type: 'danger' },
                                { title: 'Eksper Atama', desc: 'Dosya: #9921 - Mehmet Y.', time: '1 saat önce', type: 'info' },
                                { title: 'Risk Uyarısı', desc: 'SBM Skoru Düştü - 35 KB 11', time: '2 saat önce', type: 'warning' },
                            ].map((act, i) => (
                                <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                                        act.type === 'success' ? 'bg-emerald-500' : 
                                        act.type === 'danger' ? 'bg-rose-500' : 
                                        act.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{act.title}</p>
                                        <p className="text-xs text-slate-500">{act.desc}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{act.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const PoliciesView = () => (
        <div className="animate-in fade-in duration-300 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Plaka, Poliçe No veya TC/VKN Ara..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 w-full" />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm"><Filter size={16}/> Filtrele</button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-bold text-sm shadow-md shadow-cyan-200"><FileText size={16}/> Yeni Poliçe</button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Plaka</th>
                            <th className="px-6 py-4">Poliçe Türü</th>
                            <th className="px-6 py-4">Bitiş Tarihi</th>
                            <th className="px-6 py-4">Risk Skoru</th>
                            <th className="px-6 py-4 text-right">Durum</th>
                            <th className="px-6 py-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {policies.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{p.plate}</div>
                                    <div className="text-xs text-slate-500 font-mono">ID: {p.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${p.policyType === 'CASCO' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                        {p.policyType === 'CASCO' ? 'KASKO' : 'TRAFİK'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{p.endDate}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${p.riskScore > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${p.riskScore}%`}}></div>
                                        </div>
                                        <span className={`text-xs font-bold ${p.riskScore > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>{p.riskScore}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                                        {p.status === 'ACTIVE' ? 'YÜRÜRLÜKTE' : 'PASİF'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => onNavigate && onNavigate(ViewState.DETAILS)} // Would pass vehicle ID in real app
                                        className="text-xs font-bold text-slate-500 hover:text-cyan-600 border border-slate-200 hover:border-cyan-500 px-3 py-1.5 rounded transition-all"
                                    >
                                        Detay
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const ClaimsView = () => (
        <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Siren size={20} className="text-rose-500"/> Hasar Dosya Yönetimi
                </h3>
                <div className="flex gap-2">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 3 Dosya İnceleniyor
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {claims.map(claim => (
                    <div key={claim.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-rose-200 transition-colors group">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100">
                                <Car size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-bold text-slate-800 text-lg">{claim.plate}</h4>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">{claim.id}</span>
                                </div>
                                <p className="text-sm text-slate-600 flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400"/> {claim.date} • {claim.type}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Tahmini Tutar</p>
                                <p className="text-lg font-bold text-slate-800">{claim.amount.toLocaleString()} ₺</p>
                            </div>
                            <div>
                                <div className="text-right mb-1">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Dosya Durumu</p>
                                </div>
                                <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${
                                    claim.status === 'EXPERTISE' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    claim.status === 'PAYMENT_PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                    {claim.status === 'EXPERTISE' ? 'Eksper Atandı' : 
                                     claim.status === 'PAYMENT_PENDING' ? 'Ödeme Bekliyor' : 'Kapandı'}
                                </span>
                            </div>
                            <button 
                                onClick={() => onNavigate && onNavigate(ViewState.DETAILS, claim.vehicleId)}
                                className="p-2 bg-slate-50 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                            >
                                <ArrowUpRight size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const RiskView = () => (
        <div className="animate-in fade-in duration-300 h-full flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl w-full border border-slate-200 text-center">
                <div className="inline-block p-4 bg-rose-50 rounded-full text-rose-600 mb-6">
                    <ShieldCheck size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Bölgesel Risk Haritası</h2>
                <p className="text-slate-500 mb-8 max-w-xl mx-auto">
                    Sigortalı araçların kaza yoğunluk haritası ve risk skorlarına göre bölgesel prim analizleri. 
                    Bu modül şu anda <span className="font-bold text-cyan-600">SBM Event Notification API v2.0</span> ile anlık durum sinyallerini işlemektedir.
                </p>
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="p-4 border rounded-xl bg-slate-50">
                        <div className="text-4xl font-bold text-slate-800 mb-1">34</div>
                        <div className="text-xs font-bold text-rose-600 uppercase">İstanbul (Yüksek Risk)</div>
                    </div>
                    <div className="p-4 border rounded-xl bg-slate-50">
                        <div className="text-4xl font-bold text-slate-800 mb-1">06</div>
                        <div className="text-xs font-bold text-amber-600 uppercase">Ankara (Orta Risk)</div>
                    </div>
                    <div className="p-4 border rounded-xl bg-slate-50">
                        <div className="text-4xl font-bold text-slate-800 mb-1">35</div>
                        <div className="text-xs font-bold text-emerald-600 uppercase">İzmir (Düşük Risk)</div>
                    </div>
                </div>
                <button className="bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-900/20">
                    Detaylı Haritayı Aç
                </button>
            </div>
        </div>
    );

    const SbmView = () => (
        <div className="animate-in fade-in duration-300">
            <div className="bg-slate-900 text-white p-8 rounded-2xl mb-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-2xl">
                        <Database size={40} className="text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">Sigorta Bilgi ve Gözetim Merkezi</h3>
                        <p className="text-slate-400 mt-1">Olay bildirim akışı ve durum senkronizasyonu.</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-400/10 px-4 py-2 rounded-lg">
                        <Zap size={18} /> EVENT STREAM ACTIVE
                    </div>
                    <p className="text-xs text-slate-500">Son sinyal: 2 dk önce</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layers size={18} /> Olay Bildirim Paketleri</h4>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-600">Poliçe Durum Sinyali (Traffic)</span>
                            <span className="text-xs font-bold text-emerald-600">SENKRONİZE</span>
                        </li>
                        <li className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-600">Poliçe Durum Sinyali (Casco)</span>
                            <span className="text-xs font-bold text-emerald-600">SENKRONİZE</span>
                        </li>
                        <li className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-600">Hasar Olay Bildirimleri (Tramer)</span>
                            <span className="text-xs font-bold text-amber-600 animate-pulse">SİNYAL BEKLENİYOR...</span>
                        </li>
                    </ul>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings size={18} /> Manuel Tetikleyiciler</h4>
                    <div className="space-y-3">
                        <button className="w-full py-3 border border-cyan-200 bg-cyan-50 text-cyan-700 font-bold rounded-xl hover:bg-cyan-100 transition-colors text-sm">
                            Tramer Durum Sinyali İste
                        </button>
                        <button className="w-full py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                            Eksper Atama Bildirimlerini Yenile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    function Settings({size}: {size?:number}) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>}

    // --- MAIN RENDER ---

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <InsuranceSidebar />
            
            <div className="ml-64 flex-1 flex flex-col">
                <InsuranceHeader />
                
                <main className="flex-1 mt-20 p-8 overflow-y-auto bg-slate-50 h-[calc(100vh-80px)]">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Loader2 size={48} className="text-cyan-600 animate-spin mb-4" />
                            <p className="font-medium text-slate-600">InsuranceCore Yükleniyor...</p>
                        </div>
                    ) : (
                        <>
                            {activeView === 'DASHBOARD' && <DashboardView />}
                            {activeView === 'POLICIES' && <PoliciesView />}
                            {activeView === 'CLAIMS' && <ClaimsView />}
                            {activeView === 'RISK_MAP' && <RiskView />}
                            {activeView === 'SBM' && <SbmView />}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};
