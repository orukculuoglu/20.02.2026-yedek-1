
import React, { useEffect, useState } from 'react';
import { 
    ClipboardCheck, ShieldCheck, FileText, Search, Award, MapPin, Gauge, 
    Activity, LogOut, CheckCircle2, AlertTriangle, Printer, Calendar, 
    User, Settings, Car, PenTool, Wifi, Bluetooth, Share2, Eye, X, Filter,
    Loader2, CheckSquare, Layers, ArrowLeft
} from 'lucide-react';
import { getExpertiseCenters } from '../services/dataService';
import { ExpertiseProfile, ViewState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ExpertiseCentersProps {
    onNavigate?: (view: ViewState, id?: string) => void;
}

type ExpertiseSubView = 'DASHBOARD' | 'REPORTS' | 'APPOINTMENTS' | 'TECHNICIANS' | 'DEVICES';

// --- MOCK DATA ---
const MOCK_REPORTS = [
    { id: 'EXP-2024-882', plate: '34 VM 228', vehicle: 'BMW 320i 2020', date: 'Bugün 10:30', status: 'COMPLETED', fraudScore: 12, package: 'Gold Plus', technician: 'Ahmet Usta' },
    { id: 'EXP-2024-883', plate: '06 AD 991', vehicle: 'Ford Focus 2018', date: 'Bugün 11:45', status: 'IN_PROGRESS', fraudScore: 45, package: 'Silver', technician: 'Mehmet Şef' },
    { id: 'EXP-2024-881', plate: '35 KS 442', vehicle: 'Toyota Corolla 2021', date: 'Dün 16:20', status: 'COMPLETED', fraudScore: 8, package: 'Bronze', technician: 'Caner Bey' },
    { id: 'EXP-2024-880', plate: '34 AB 123', vehicle: 'VW Passat 2015', date: 'Dün 14:00', status: 'COMPLETED', fraudScore: 88, package: 'Gold Plus', technician: 'Ahmet Usta' }, // High Fraud
];

const MOCK_APPOINTMENTS = [
    { id: 'APT-101', customer: 'Ali Yılmaz', vehicle: 'Mercedes C200', time: '14:00', status: 'CONFIRMED' },
    { id: 'APT-102', customer: 'Ayşe Demir', vehicle: 'Fiat Egea', time: '15:30', status: 'PENDING' },
    { id: 'APT-103', customer: 'Galerici Mustafa', vehicle: 'Audi A3', time: '16:45', status: 'CONFIRMED' },
];

const MOCK_DEVICES = [
    { id: 'D1', name: 'Maha Dyno 4WD', type: 'Dinamometre', status: 'ONLINE', lastCalib: '12.04.2024' },
    { id: 'D2', name: 'Bosch Fren Test', type: 'Fren Testi', status: 'ONLINE', lastCalib: '10.04.2024' },
    { id: 'D3', name: 'Würth OBD Diag', type: 'OBD', status: 'OFFLINE', lastCalib: '01.05.2024' },
    { id: 'D4', name: 'Boya Kalınlık (El)', type: 'Kaporta', status: 'ONLINE', lastCalib: '15.05.2024' },
];

export const ExpertiseCenters: React.FC<ExpertiseCentersProps> = ({ onNavigate }) => {
    const [activeView, setActiveView] = useState<ExpertiseSubView>('DASHBOARD');
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<typeof MOCK_REPORTS[0] | null>(null);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 600);
    }, []);

    // --- SUB-COMPONENTS ---

    const ExpSidebar = () => (
        <div className="w-64 bg-violet-900 text-violet-100 h-screen fixed left-0 top-0 flex flex-col z-20 shadow-2xl">
            <div className="p-6 flex items-center gap-3 border-b border-violet-800/50">
                <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                    <ClipboardCheck size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">ExpertiseCore</h1>
                    <p className="text-[10px] text-violet-300 font-medium uppercase tracking-wider">Oto Ekspertiz Sistemi</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {[
                    { id: 'DASHBOARD', label: 'Genel Bakış', icon: Gauge },
                    { id: 'REPORTS', label: 'Rapor Yönetimi', icon: FileText },
                    { id: 'APPOINTMENTS', label: 'Randevular', icon: Calendar },
                    { id: 'TECHNICIANS', label: 'Eksper Kadrosu', icon: User },
                    { id: 'DEVICES', label: 'Cihaz & IoT', icon: Settings },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => { setActiveView(item.id as ExpertiseSubView); setSelectedReport(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            activeView === item.id 
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' 
                            : 'text-violet-300 hover:bg-violet-800 hover:text-white'
                        }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-violet-800/50">
                <button 
                    onClick={() => onNavigate && onNavigate(ViewState.DASHBOARD)}
                    className="w-full flex items-center justify-center gap-2 bg-violet-950 hover:bg-slate-900 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-violet-800"
                >
                    <LogOut size={16} />
                    Süper Admin'e Dön
                </button>
            </div>
        </div>
    );

    const ExpHeader = () => (
        <header className="h-20 bg-white border-b border-violet-50 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    {activeView === 'DASHBOARD' && 'Merkez Operasyon Paneli'}
                    {activeView === 'REPORTS' && 'Ekspertiz Rapor Arşivi'}
                    {activeView === 'APPOINTMENTS' && 'Randevu Takvimi'}
                    {activeView === 'TECHNICIANS' && 'Teknisyen Performansı'}
                    {activeView === 'DEVICES' && 'Cihaz Bağlantı Durumu (IoT)'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Pilot Garage Maslak • TSE-HYB 12047</p>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <Activity size={16} className="text-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700">TSE Entegrasyonu Aktif</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold border-2 border-violet-50">
                        EX
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-slate-700">Baş Eksper</p>
                        <p className="text-[10px] text-slate-400">Yetkili İmza</p>
                    </div>
                </div>
            </div>
        </header>
    );

    // --- VIEWS ---

    const DashboardView = () => {
        const stats = [
            { label: 'Günlük Rapor', value: 24, icon: FileText, color: 'bg-blue-50 text-blue-600' },
            { label: 'Fraud Tespiti', value: 3, icon: ShieldCheck, color: 'bg-rose-50 text-rose-600' },
            { label: 'Randevular', value: 8, icon: Calendar, color: 'bg-violet-50 text-violet-600' },
            { label: 'Ciro (Tahmini)', value: '42.5K ₺', icon: Activity, color: 'bg-emerald-50 text-emerald-600' },
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">Paket Tercihleri</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Gold', value: 45 }, { name: 'Silver', value: 30 }, { name: 'Bronze', value: 15 }, { name: 'VIP', value: 10 }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4,4,0,0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Bekleyen Randevular</h3>
                            <button onClick={() => setActiveView('APPOINTMENTS')} className="text-xs font-bold text-violet-600 hover:underline">Tümünü Gör</button>
                        </div>
                        <div className="space-y-3">
                            {MOCK_APPOINTMENTS.map(apt => (
                                <div key={apt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-slate-500 border border-slate-200">{apt.time}</div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{apt.customer}</p>
                                            <p className="text-xs text-slate-500">{apt.vehicle}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {apt.status === 'CONFIRMED' ? 'ONAYLI' : 'BEKLİYOR'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ReportsView = () => {
        if (selectedReport) {
            return (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 h-full flex flex-col">
                    <button onClick={() => setSelectedReport(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium w-fit">
                        <ArrowLeft size={20} /> Listeye Dön
                    </button>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 flex justify-between items-start">
                        <div className="flex gap-6">
                            <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-700 border-2 border-slate-200">
                                <Car size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{selectedReport.vehicle}</h2>
                                <p className="text-lg font-mono text-slate-600 bg-slate-50 px-2 rounded w-fit mt-1 border border-slate-100">{selectedReport.plate}</p>
                                <div className="flex gap-2 mt-3">
                                    <span className="px-2 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded border border-violet-100">{selectedReport.package} Paket</span>
                                    <span className="px-2 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded border border-slate-200">{selectedReport.technician}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Rapor ID: {selectedReport.id}</p>
                            <div className={`text-xl font-bold flex items-center justify-end gap-2 ${selectedReport.fraudScore > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {selectedReport.fraudScore > 50 ? <AlertTriangle size={24}/> : <CheckCircle2 size={24}/>}
                                {selectedReport.fraudScore > 50 ? 'YÜKSEK RİSK' : 'TEMİZ'}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Fraud Skoru: {selectedReport.fraudScore}/100</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pb-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><PenTool size={18}/> Kaporta Boya Durumu</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between p-2 bg-emerald-50 rounded border border-emerald-100"><span>Tavan</span><span className="font-bold text-emerald-700">ORİJİNAL</span></div>
                                <div className="flex justify-between p-2 bg-emerald-50 rounded border border-emerald-100"><span>Kaput</span><span className="font-bold text-emerald-700">ORİJİNAL</span></div>
                                <div className="flex justify-between p-2 bg-amber-50 rounded border border-amber-100"><span>Sol Ön Çamurluk</span><span className="font-bold text-amber-700">BOYALI</span></div>
                                <div className="flex justify-between p-2 bg-rose-50 rounded border border-rose-100"><span>Sağ Ön Kapı</span><span className="font-bold text-rose-700">DEĞİŞEN</span></div>
                                <div className="flex justify-between p-2 bg-emerald-50 rounded border border-emerald-100"><span>Bagaj</span><span className="font-bold text-emerald-700">ORİJİNAL</span></div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Gauge size={18}/> Motor Performans</h3>
                            <div className="flex items-center justify-center h-48">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" width={250} height={200} data={[
                                    { subject: 'Motor', A: 92, fullMark: 100 },
                                    { subject: 'Şanzıman', A: 88, fullMark: 100 },
                                    { subject: 'Turbo', A: 75, fullMark: 100 },
                                    { subject: 'Enjektör', A: 85, fullMark: 100 },
                                    { subject: 'Soğutma', A: 95, fullMark: 100 },
                                ]}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={{fontSize: 10}} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Skor" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                                    <Tooltip />
                                </RadarChart>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-slate-800">%91</p>
                                <p className="text-xs text-slate-500">Dyno Test Sonucu</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800 mb-4">Aksiyonlar</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all">
                                        <Printer size={18} /> Raporu Yazdır
                                    </button>
                                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all">
                                        <Share2 size={18} /> Müşteriye Gönder (SMS/Email)
                                    </button>
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-xs mt-4">
                                <p className="font-bold flex items-center gap-2 mb-1"><ShieldCheck size={14}/> TSE Onaylı</p>
                                Bu rapor, TSE-HYB 12047 standartlarına uygun olarak dijital imzalanmıştır.
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="animate-in fade-in duration-300 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Plaka, Rapor No veya Müşteri Ara..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full" />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm"><Filter size={16}/> Filtrele</button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold text-sm shadow-md shadow-violet-200"><PenTool size={16}/> Yeni Rapor Başlat</button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">Rapor No</th>
                                <th className="px-6 py-4">Araç / Plaka</th>
                                <th className="px-6 py-4">Tarih</th>
                                <th className="px-6 py-4">Paket</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">Fraud Skoru</th>
                                <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_REPORTS.map(r => (
                                <tr key={r.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setSelectedReport(r)}>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{r.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{r.plate}</div>
                                        <div className="text-xs text-slate-500">{r.vehicle}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{r.date}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded border border-slate-200">{r.package}</span></td>
                                    <td className="px-6 py-4">
                                        {r.status === 'COMPLETED' 
                                            ? <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold border border-emerald-100">TAMAMLANDI</span>
                                            : <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded font-bold border border-amber-100">İŞLENİYOR</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${r.fraudScore > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${r.fraudScore}%`}}></div>
                                            </div>
                                            <span className={`text-xs font-bold ${r.fraudScore > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>{r.fraudScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-violet-600 bg-transparent hover:bg-violet-50 rounded-lg transition-colors"><Eye size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    const DevicesView = () => (
        <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Wifi size={20} className="text-slate-500"/> IoT Cihaz Yönetimi
                </h3>
                <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                    <RefreshCw size={16}/> Yenile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_DEVICES.map(dev => (
                    <div key={dev.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 ${dev.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${dev.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {dev.type === 'OBD' ? <Bluetooth size={24}/> : <Settings size={24}/>}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${dev.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {dev.status}
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-800">{dev.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{dev.type} Cihazı</p>
                        <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-slate-400 flex justify-between">
                            <span>Son Kalibrasyon:</span>
                            <span className="font-mono text-slate-600">{dev.lastCalib}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl"><Layers size={24} className="text-violet-400"/></div>
                    <div>
                        <h4 className="font-bold text-lg">Otomatik Veri Aktarımı</h4>
                        <p className="text-sm text-slate-400">Dyno ve Fren test sonuçları, ölçüm bittiği an otomatik olarak rapora işlenir.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 font-bold text-sm">
                    <Activity size={16} className="animate-pulse"/> Sistem Çalışıyor
                </div>
            </div>
        </div>
    );

    function RefreshCw({size, className}: {size?: number, className?: string}) {
        return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
    }

    // --- MAIN RENDER ---

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <ExpSidebar />
            
            <div className="ml-64 flex-1 flex flex-col">
                <ExpHeader />
                
                <main className="flex-1 mt-20 p-8 overflow-y-auto bg-slate-50 h-[calc(100vh-80px)]">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Loader2 size={48} className="text-violet-600 animate-spin mb-4" />
                            <p className="font-medium text-slate-600">ExpertiseCore Yükleniyor...</p>
                        </div>
                    ) : (
                        <>
                            {activeView === 'DASHBOARD' && <DashboardView />}
                            {activeView === 'REPORTS' && <ReportsView />}
                            {activeView === 'DEVICES' && <DevicesView />}
                            {['APPOINTMENTS', 'TECHNICIANS'].includes(activeView) && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                                    <Settings size={48} className="mb-4 opacity-20" />
                                    <h3 className="text-lg font-bold text-slate-600">Modül Geliştirme Aşamasında</h3>
                                    <p className="text-sm">Bu özellik bir sonraki ExpertiseCore güncellemesinde aktif olacaktır.</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};
