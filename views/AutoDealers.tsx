
import React, { useEffect, useState } from 'react';
import { 
    Store, TrendingUp, Users, CarFront, Star, ShieldCheck, MapPin, 
    BarChart3, LayoutDashboard, Key, LogOut, DollarSign, Calendar, 
    MessageCircle, Search, Filter, Plus, Tag, CheckCircle, Clock, X,
    ArrowUpRight, Phone, Mail, User
} from 'lucide-react';
import { getDealers } from '../services/dataService';
import { DealerProfile, ViewState } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

interface AutoDealersProps {
    onNavigate?: (view: ViewState, id?: string) => void;
}

type DealerSubView = 'DASHBOARD' | 'SHOWROOM' | 'CRM' | 'FINANCE';

// --- MOCK DEALER DATA ---
const MOCK_INVENTORY = [
    { id: 'INV-001', brand: 'BMW', model: '320i M Sport', year: 2021, km: 45000, price: 2150000, status: 'AVAILABLE', daysOnLot: 12, interest: 'HIGH' },
    { id: 'INV-002', brand: 'Mercedes', model: 'C200d AMG', year: 2020, km: 62000, price: 2450000, status: 'RESERVED', daysOnLot: 4, interest: 'VERY_HIGH' },
    { id: 'INV-003', brand: 'Volkswagen', model: 'Passat Business', year: 2019, km: 88000, price: 1450000, status: 'AVAILABLE', daysOnLot: 45, interest: 'LOW' },
    { id: 'INV-004', brand: 'Audi', model: 'A3 Sportback', year: 2022, km: 15000, price: 1950000, status: 'SOLD', daysOnLot: 8, interest: 'HIGH' },
];

const MOCK_LEADS = [
    { id: 'L-101', name: 'Ahmet Yılmaz', interest: 'BMW 320i', source: 'UserCore App', date: 'Bugün 10:45', status: 'NEW', offer: 2100000 },
    { id: 'L-102', name: 'Ayşe Demir', interest: 'Audi A3', source: 'Sahibinden', date: 'Dün 14:20', status: 'NEGOTIATION', offer: 1900000 },
    { id: 'L-103', name: 'Mehmet Öz', interest: 'Takas Teklifi', source: 'UserCore App', date: '2 Gün Önce', status: 'PENDING', offer: null },
];

export const AutoDealers: React.FC<AutoDealersProps> = ({ onNavigate }) => {
    const [dealers, setDealers] = useState<DealerProfile[]>([]);
    const [selectedDealer, setSelectedDealer] = useState<DealerProfile | null>(null);
    const [activeView, setActiveView] = useState<DealerSubView>('DASHBOARD');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getDealers().then(setDealers);
    }, []);

    // --- SUB-COMPONENTS ---

    const AdminView = () => (
        <div className="p-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Oto Galericiler & Showroom Yönetimi</h2>
                    <p className="text-slate-500 mt-1">Ekosistemdeki kurumsal satıcıların performans ve envanter takibi.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {dealers.map(d => (
                    <div key={d.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${d.membershipLevel === 'GOLD' ? 'text-amber-500' : 'text-slate-500'}`}>
                            <Store size={80} />
                        </div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-slate-50 rounded-2xl text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <Store size={24} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                                d.membershipLevel === 'GOLD' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                                {d.membershipLevel} MEMBER
                            </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{d.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-6"><MapPin size={12}/> {d.city}</p>

                        <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Envanter</p>
                                <p className="text-lg font-bold text-slate-800 flex justify-center items-center gap-1"><CarFront size={16} className="text-emerald-500" /> {d.inventorySize}</p>
                            </div>
                            <div className="text-center border-l border-slate-50">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Devir Hızı</p>
                                <p className="text-lg font-bold text-slate-800 flex justify-center items-center gap-1"><TrendingUp size={16} className="text-blue-500" /> {d.turnoverRate}g</p>
                            </div>
                            <div className="text-center border-l border-slate-50">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Memnuniyet</p>
                                <p className="text-lg font-bold text-amber-500 flex justify-center items-center gap-1"><Star size={16} fill="currentColor" /> %{d.customerSatisfaction}</p>
                            </div>
                        </div>
                        <div className="mt-8">
                             <button 
                                onClick={() => { setLoading(true); setTimeout(() => { setSelectedDealer(d); setLoading(false); }, 800); }}
                                className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                             >
                                <Key size={16} /> Yönetim Paneline Giriş
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- DEALER APP COMPONENTS ---

    const DealerSidebar = () => (
        <div className="w-64 bg-cyan-950 text-cyan-100 h-screen fixed left-0 top-0 flex flex-col z-20 shadow-2xl">
            <div className="p-6 flex items-center gap-3 border-b border-cyan-900">
                <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
                    <Store size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">DealerCore</h1>
                    <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">Galeri Yönetim</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {[
                    { id: 'DASHBOARD', label: 'Genel Bakış', icon: LayoutDashboard },
                    { id: 'SHOWROOM', label: 'Showroom & Stok', icon: CarFront },
                    { id: 'CRM', label: 'Müşteri & Teklifler', icon: Users },
                    { id: 'FINANCE', label: 'Finansal Durum', icon: DollarSign },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveView(item.id as DealerSubView)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            activeView === item.id 
                            ? 'bg-cyan-700 text-white shadow-lg shadow-cyan-900/50' 
                            : 'text-cyan-300 hover:bg-cyan-900 hover:text-white'
                        }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-cyan-900">
                <button 
                    onClick={() => setSelectedDealer(null)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-slate-300 hover:text-white px-4 py-3 rounded-xl text-sm font-medium transition-all border border-cyan-900"
                >
                    <LogOut size={16} />
                    Admin Paneline Dön
                </button>
            </div>
        </div>
    );

    const DealerHeader = () => (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    {activeView === 'DASHBOARD' && 'Galeri Performans Özeti'}
                    {activeView === 'SHOWROOM' && 'Dijital Showroom Yönetimi'}
                    {activeView === 'CRM' && 'Müşteri İlişkileri & Teklifler'}
                    {activeView === 'FINANCE' && 'Finansal Raporlar'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDealer?.name} • {selectedDealer?.city}</p>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{selectedDealer?.membershipLevel} Üyelik</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold border-2 border-cyan-50">
                        {selectedDealer?.name.substring(0,2).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );

    // --- VIEWS ---

    const DashboardView = () => {
        const salesData = [
            { name: 'Oca', sales: 4 }, { name: 'Şub', sales: 6 }, { name: 'Mar', sales: 8 }, 
            { name: 'Nis', sales: 5 }, { name: 'May', sales: 9 }, { name: 'Haz', sales: 12 }
        ];

        return (
            <div className="animate-in fade-in duration-500 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Stok Değeri</p>
                                <h3 className="text-2xl font-bold text-slate-800">42.5M ₺</h3>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={24}/></div>
                        </div>
                        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><TrendingUp size={12}/> %8.5 Artış</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Sıcak Satış</p>
                                <h3 className="text-2xl font-bold text-cyan-600">3 Araç</h3>
                            </div>
                            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl"><CarFront size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500">Noter aşamasında</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Gelen Teklif</p>
                                <h3 className="text-2xl font-bold text-amber-500">12</h3>
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><MessageCircle size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500">5 tanesi takas teklifi</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Ort. Stok Günü</p>
                                <h3 className="text-2xl font-bold text-slate-800">{selectedDealer?.turnoverRate} Gün</h3>
                            </div>
                            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Calendar size={24}/></div>
                        </div>
                        <p className="text-xs text-emerald-600 font-bold">Pazar ortalamasından iyi</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-6">Aylık Satış Performansı</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                                    <Area type="monotone" dataKey="sales" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">Son Müşteri Talepleri</h3>
                        <div className="space-y-4">
                            {MOCK_LEADS.slice(0,3).map(lead => (
                                <div key={lead.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800">{lead.name}</p>
                                        <p className="text-xs text-slate-500">{lead.interest}</p>
                                    </div>
                                    <span className="text-[10px] bg-cyan-100 text-cyan-700 px-2 py-1 rounded font-bold">{lead.status}</span>
                                </div>
                            ))}
                            <button onClick={() => setActiveView('CRM')} className="w-full py-2 text-xs font-bold text-cyan-700 border border-cyan-200 rounded-lg hover:bg-cyan-50 transition-colors">
                                Tüm Talepleri Gör
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ShowroomView = () => (
        <div className="animate-in fade-in duration-300 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Marka, Model veya Stok Kodu Ara..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-bold text-sm shadow-md shadow-cyan-200">
                    <Plus size={16}/> Araç Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 overflow-y-auto pb-4">
                {MOCK_INVENTORY.map(car => (
                    <div key={car.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-all group">
                        <div className="h-48 bg-slate-100 relative flex items-center justify-center">
                            <CarFront size={64} className="text-slate-300" />
                            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm ${
                                    car.status === 'AVAILABLE' ? 'bg-emerald-500 text-white' : 
                                    car.status === 'RESERVED' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
                                }`}>
                                    {car.status === 'AVAILABLE' ? 'SATIŞTA' : car.status === 'RESERVED' ? 'REZERVE' : 'SATILDI'}
                                </span>
                            </div>
                            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-mono">
                                {car.id}
                            </div>
                        </div>
                        <div className="p-5">
                            <h4 className="font-bold text-slate-800 text-lg mb-1">{car.brand} {car.model}</h4>
                            <p className="text-sm text-slate-500 mb-4">{car.year} • {car.km.toLocaleString()} KM</p>
                            
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-xl font-bold text-cyan-700">{car.price.toLocaleString()} ₺</p>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                    <Clock size={12} /> {car.daysOnLot} Gün
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button className="py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">Düzenle</button>
                                <button 
                                    onClick={() => onNavigate && onNavigate(ViewState.DETAILS)} // Would pass vehicle ID
                                    className="py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-1"
                                >
                                    Analiz <ArrowUpRight size={12}/>
                                </button>
                            </div>
                        </div>
                        {car.interest === 'VERY_HIGH' && (
                            <div className="bg-rose-50 px-4 py-2 text-center text-xs font-bold text-rose-600 border-t border-rose-100 flex items-center justify-center gap-1">
                                <TrendingUp size={12} /> Yüksek Müşteri İlgisi!
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const CrmView = () => (
        <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg"><User size={24}/></div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">24</p>
                        <p className="text-xs text-slate-500 uppercase font-bold">Aktif Görüşme</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={24}/></div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">8</p>
                        <p className="text-xs text-slate-500 uppercase font-bold">Bu Hafta Satılan</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Phone size={24}/></div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">15</p>
                        <p className="text-xs text-slate-500 uppercase font-bold">Geri Dönüş Beklenen</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Müşteri</th>
                            <th className="px-6 py-4">İlgilendiği Araç / Durum</th>
                            <th className="px-6 py-4">Kaynak</th>
                            <th className="px-6 py-4">Son Teklif</th>
                            <th className="px-6 py-4">Statü</th>
                            <th className="px-6 py-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_LEADS.map(lead => (
                            <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{lead.name}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                        <span className="flex items-center gap-1"><Phone size={10}/> 0532...</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-700">{lead.interest}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${lead.source.includes('App') ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                        {lead.source}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-800">{lead.offer ? `${lead.offer.toLocaleString()} ₺` : '-'}</td>
                                <td className="px-6 py-4">
                                    {lead.status === 'NEW' && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">YENİ</span>}
                                    {lead.status === 'NEGOTIATION' && <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded font-bold">PAZARLIK</span>}
                                    {lead.status === 'PENDING' && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">BEKLEMEDE</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 text-slate-400 transition-colors"><Phone size={16}/></button>
                                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-colors"><MessageCircle size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // --- MAIN RENDER ---

    if (selectedDealer) {
        return (
            <div className="min-h-screen bg-slate-50 flex">
                <DealerSidebar />
                <div className="ml-64 flex-1 flex flex-col">
                    <DealerHeader />
                    <main className="flex-1 mt-20 p-8 overflow-y-auto bg-slate-50 h-[calc(100vh-80px)]">
                        {activeView === 'DASHBOARD' && <DashboardView />}
                        {activeView === 'SHOWROOM' && <ShowroomView />}
                        {activeView === 'CRM' && <CrmView />}
                        {activeView === 'FINANCE' && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                                <DollarSign size={48} className="mb-4 opacity-20" />
                                <h3 className="text-lg font-bold text-slate-600">Finans Modülü Hazırlanıyor</h3>
                                <p className="text-sm">Fatura kesimi ve kâr/zarar raporları yakında eklenecek.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        );
    }

    // Default View: Admin List
    return <AdminView />;
};
