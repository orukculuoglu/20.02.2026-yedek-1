import React, { useEffect, useState } from 'react';
import { 
    ShoppingBag, Truck, Package, Search, Filter, Globe, Server, Star, 
    ChevronRight, MapPin, Building, Activity, Box, Layout, ArrowUpRight, 
    TrendingUp, LogOut, ClipboardList, CheckCircle, Clock, AlertCircle, 
    Barcode, Plane, Anchor, Loader2, Zap, ShieldAlert
} from 'lucide-react';
import { getRetailers } from '../services/dataService';
import { RetailerProfile, ViewState } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface RetailersProps {
    onNavigate?: (view: ViewState, id?: string) => void;
}

type RetailerSubView = 'DASHBOARD' | 'INVENTORY' | 'ORDERS' | 'LOGISTICS' | 'NETWORK';

// --- MOCK DATA FOR PARTSCORE ---
// Added 'last30Sales' to support Predictive Inventory Engine
const MOCK_INVENTORY = [
    { id: 'SKU-8821', name: 'LuK RepSet 2CT', brand: 'Schaeffler', category: 'Şanzıman', stock: 145, reserved: 20, price: 22850, status: 'HIGH', last30Sales: 150 },
    { id: 'SKU-9942', name: 'Brembo Ön Disk', brand: 'Brembo', category: 'Fren Sistemi', stock: 450, reserved: 12, price: 2450, status: 'NORMAL', last30Sales: 300 },
    { id: 'SKU-1102', name: 'Varta 72Ah Akü', brand: 'Varta', category: 'Elektronik', stock: 12, reserved: 8, price: 3200, status: 'LOW', last30Sales: 60 },
    { id: 'SKU-5521', name: 'Castrol Edge 5W30', brand: 'Castrol', category: 'Sıvılar', stock: 1200, reserved: 150, price: 950, status: 'HIGH', last30Sales: 1200 },
    { id: 'SKU-3321', name: 'Bosch Silecek Seti', brand: 'Bosch', category: 'Aksesuar', stock: 85, reserved: 5, price: 450, status: 'NORMAL', last30Sales: 150 },
    { id: 'SKU-4421', name: 'NGK BKR6EIX', brand: 'NGK', category: 'Ateşleme', stock: 4, reserved: 0, price: 180, status: 'LOW', last30Sales: 0 },
];

const MOCK_B2B_ORDERS = [
    { id: 'ORD-2024-001', customer: 'Maslak Oto Garaj', date: 'Bugün 10:30', items: 12, total: 45200, status: 'PREPARING', region: 'İstanbul' },
    { id: 'ORD-2024-002', customer: 'Erel VW Yetkili', date: 'Bugün 09:15', items: 4, total: 12500, status: 'SHIPPED', region: 'İstanbul' },
    { id: 'ORD-2024-003', customer: 'Ankara EuroMaster', date: 'Dün 16:45', items: 25, total: 185000, status: 'DELIVERED', region: 'Ankara' },
    { id: 'ORD-2024-004', customer: 'İzmir Teknik', date: 'Dün 14:20', items: 8, total: 22400, status: 'PENDING', region: 'İzmir' },
];

export const Retailers: React.FC<RetailersProps> = ({ onNavigate }) => {
    const [activeView, setActiveView] = useState<RetailerSubView>('DASHBOARD');
    const [retailers, setRetailers] = useState<RetailerProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            getRetailers().then(data => {
                setRetailers(data);
                setLoading(false);
            });
        }, 600);
    }, []);

    // --- Sub-Components ---

    const PartsSidebar = () => (
        <div className="w-64 bg-orange-900 text-orange-100 h-screen fixed left-0 top-0 flex flex-col z-20 shadow-2xl">
            <div className="p-6 flex items-center gap-3 border-b border-orange-800/50">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                    <Box size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">PartsCore</h1>
                    <p className="text-[10px] text-orange-300 font-medium uppercase tracking-wider">B2B Dağıtım Paneli</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {[
                    { id: 'DASHBOARD', label: 'Genel Bakış', icon: Layout },
                    { id: 'INVENTORY', label: 'Parça ve Stok Sinyalleri', icon: Package },
                    { id: 'ORDERS', label: 'Sipariş Yönetimi', icon: ClipboardList },
                    { id: 'LOGISTICS', label: 'Lojistik Takibi', icon: Truck },
                    { id: 'NETWORK', label: 'Bayi Ağı', icon: Globe },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveView(item.id as RetailerSubView)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            activeView === item.id 
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
                            : 'text-orange-300 hover:bg-orange-800 hover:text-white'
                        }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-orange-800/50">
                <button 
                    onClick={() => onNavigate && onNavigate(ViewState.DASHBOARD)}
                    className="w-full flex items-center justify-center gap-2 bg-orange-950 hover:bg-slate-900 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-orange-800"
                >
                    <LogOut size={16} />
                    Süper Admin'e Dön
                </button>
            </div>
        </div>
    );

    const PartsHeader = () => (
        <header className="h-20 bg-white border-b border-orange-50 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    {activeView === 'DASHBOARD' && 'Dağıtım Operasyon Merkezi'}
                    {activeView === 'INVENTORY' && 'Parça ve Stok Sinyalleri (Tahminleme)'}
                    {activeView === 'ORDERS' && 'Gelen Siparişler (B2B)'}
                    {activeView === 'LOGISTICS' && 'Sevkiyat Planlama'}
                    {activeView === 'NETWORK' && 'Global Bayi Yönetimi'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Martaş Otomotiv Ana Depo • Bölge: Marmara</p>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <Activity size={16} className="text-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700">ERP Bağlantısı Aktif</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold border-2 border-orange-50">
                        PC
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-slate-700">Depo Müdürü</p>
                        <p className="text-[10px] text-slate-400">Lojistik Birimi</p>
                    </div>
                </div>
            </div>
        </header>
    );

    // --- Content Views ---

    const DashboardView = () => {
        const salesData = [
            { name: 'Pzt', value: 40000 },
            { name: 'Sal', value: 30000 },
            { name: 'Çar', value: 55000 },
            { name: 'Per', value: 48000 },
            { name: 'Cum', value: 62000 },
            { name: 'Cmt', value: 25000 },
        ];

        return (
            <div className="animate-in fade-in duration-500 space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Toplam Stok Değeri</p>
                                <h3 className="text-3xl font-bold text-slate-800">12.4M ₺</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <ArrowUpRight size={12} className="text-emerald-500"/> %4.2 artış (Geçen Ay)
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Bekleyen Sipariş</p>
                                <h3 className="text-3xl font-bold text-orange-600">42</h3>
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><ClipboardList size={24}/></div>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full" style={{width: '65%'}}></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Bugünkü Ciro</p>
                                <h3 className="text-3xl font-bold text-emerald-600">62.0K ₺</h3>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Activity size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500">Hedefin %102'si</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Yoldaki Araç</p>
                                <h3 className="text-3xl font-bold text-slate-800">8</h3>
                            </div>
                            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Truck size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500">3 araç dönüş yolunda</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-6">Haftalık Satış Trendi</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                    <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Kritik Stok Uyarıları</h3>
                        <div className="space-y-3">
                            {MOCK_INVENTORY.filter(i => i.status === 'LOW').map(item => (
                                <div key={item.id} className="p-3 border border-rose-100 bg-rose-50 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-rose-800">{item.name}</p>
                                        <p className="text-xs text-rose-600">{item.id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-rose-700">{item.stock}</p>
                                        <p className="text-[10px] text-rose-500 uppercase font-bold">Adet Kaldı</p>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setActiveView('INVENTORY')} className="w-full mt-2 py-2 text-xs font-bold text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                                Tüm Stokları İncele
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const InventoryView = () => {
        // Predictive Inventory Engine Logic - SCOPE LOCKED IMPLEMENTATION
        const processedInventory = MOCK_INVENTORY.map(item => {
            // 1) dailyAvg = last30Sales / 30. If last30Sales is 0, set dailyAvg = 0.1
            const dailyAvg = item.last30Sales === 0 ? 0.1 : item.last30Sales / 30;
            
            // 2) daysToZero = stock / dailyAvg
            const daysToZero = Math.round(item.stock / dailyAvg);
            
            // 3) riskScore: < 7 -> 90, < 15 -> 60, < 30 -> 30, else -> 10
            let riskScore = 10;
            if (daysToZero < 7) riskScore = 90;
            else if (daysToZero < 15) riskScore = 60;
            else if (daysToZero < 30) riskScore = 30;

            // 4) targetStock = dailyAvg * 30, orderSuggestion = Math.max(0, Math.round(targetStock - stock))
            const targetStock = dailyAvg * 30;
            const orderSuggestion = Math.max(0, Math.round(targetStock - item.stock));

            return {
                ...item,
                dailyAvg,
                daysToZero,
                riskScore,
                orderSuggestion
            };
        });

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="SKU, Parça Adı veya Marka ara..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20 bg-white" />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 mr-2">
                            <Zap size={16} className="text-blue-600" />
                            <span className="text-xs font-bold text-blue-700 uppercase">Tahminleme Motoru Aktif</span>
                        </div>
                        <button className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm font-medium"><Filter size={16}/> Kategori</button>
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 text-sm font-medium shadow-md shadow-orange-200"><Server size={16}/> ERP Senkronize Et</button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">SKU / Parça Bilgisi</th>
                                <th className="px-6 py-4 text-center">Günlük Ortalama</th>
                                <th className="px-6 py-4 text-center">Tahmini Tükenme (Gün)</th>
                                <th className="px-6 py-4 text-center">Risk Skoru</th>
                                <th className="px-6 py-4 text-center">Sipariş Önerisi</th>
                                <th className="px-6 py-4">Stok Durumu</th>
                                <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {processedInventory.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                                                <div className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 rounded w-fit mt-0.5">{item.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-black text-slate-800 text-sm">{item.dailyAvg.toFixed(2)}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Adet/Gün</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`font-black text-sm ${item.daysToZero < 10 ? 'text-rose-600' : 'text-slate-800'}`}>
                                                {item.daysToZero}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Gün Kaldı</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black border uppercase tracking-tighter ${
                                                item.riskScore >= 80 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                item.riskScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                {item.riskScore >= 80 ? 'KRİTİK' : item.riskScore >= 50 ? 'YÜKSEK' : 'GÜVENLİ'} ({item.riskScore})
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {item.orderSuggestion > 0 ? (
                                            <div className="inline-flex flex-col items-center bg-orange-50 border border-orange-100 px-3 py-1 rounded-lg">
                                                <span className="text-orange-700 font-black text-sm">+{item.orderSuggestion}</span>
                                                <span className="text-[8px] text-orange-600 font-black uppercase">Sipariş Önerisi</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                                                <CheckCircle size={12}/> Yeterli
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                                <span>Stok: {item.stock}</span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${item.daysToZero < 15 ? 'bg-rose-500' : item.daysToZero < 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                                    style={{width: `${Math.min(100, (item.stock / 1500) * 100)}%`}}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs font-bold text-slate-500 hover:text-orange-600 border border-slate-200 hover:border-orange-500 px-3 py-1.5 rounded transition-all">
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
    };

    const OrdersView = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 gap-4">
                {MOCK_B2B_ORDERS.map(order => (
                    <div key={order.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-orange-300 transition-colors group">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${
                                order.status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                                order.status === 'PREPARING' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                order.status === 'SHIPPED' ? 'bg-purple-50 border-purple-200 text-purple-600' :
                                'bg-emerald-50 border-emerald-200 text-emerald-600'
                            }`}>
                                {order.status === 'SHIPPED' ? <Truck size={20}/> : <ClipboardList size={20}/>}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-slate-800 text-lg">{order.customer}</h4>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">{order.id}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><Clock size={14}/> {order.date}</span>
                                    <span className="flex items-center gap-1"><MapPin size={14}/> {order.region}</span>
                                    <span className="font-bold text-slate-600">{order.items} Kalem Ürün</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="font-bold text-xl text-slate-800">{order.total.toLocaleString()} ₺</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                    order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                    order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' :
                                    order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                                    'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {order.status === 'PENDING' ? 'Onay Bekliyor' : order.status === 'PREPARING' ? 'Hazırlanıyor' : order.status === 'SHIPPED' ? 'Yola Çıktı' : 'Teslim Edildi'}
                                </span>
                            </div>
                            <button className="p-2 bg-slate-50 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const LogisticsView = () => (
        <div className="h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 border-4 border-orange-100">
                <Truck size={40} className="text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Canlı Sevkiyat Haritası</h3>
            <p className="text-slate-500 max-w-md mb-8">Şu an yolda olan 8 aracın konumu ve tahmini varış süreleri (ETA) burada görüntülenir.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800">34 VM 228</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Hareket Halinde</span>
                    </div>
                    <p className="text-xs text-slate-500">Rota: İstanbul Depo {'>'} Maslak Sanayi</p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-orange-600">
                        <Clock size={12}/> ETA: 15 dk
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800">06 AB 991</span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">Mola</span>
                    </div>
                    <p className="text-xs text-slate-500">Rota: İstanbul {'>'} Ankara Merkez</p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-orange-600">
                        <Clock size={12}/> ETA: 4s 30dk
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left opacity-60">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800">Kargo Entegrasyonu</span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">API</span>
                    </div>
                    <p className="text-xs text-slate-500">Yurtiçi Kargo Takip No: 4421...</p>
                </div>
            </div>
        </div>
    );

    // --- MAIN RENDER ---

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <PartsSidebar />
            
            <div className="ml-64 flex-1 flex flex-col">
                <PartsHeader />
                
                <main className="flex-1 mt-20 p-8 overflow-y-auto bg-slate-50 h-[calc(100vh-80px)]">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <Loader2 size={48} className="text-orange-600 animate-spin mb-4" />
                            <p className="font-medium text-slate-600">PartsCore Yükleniyor...</p>
                        </div>
                    ) : (
                        <>
                            {activeView === 'DASHBOARD' && <DashboardView />}
                            {activeView === 'INVENTORY' && <InventoryView />}
                            {activeView === 'ORDERS' && <OrdersView />}
                            {activeView === 'LOGISTICS' && <LogisticsView />}
                            {activeView === 'NETWORK' && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                                    <Globe size={48} className="mb-4 opacity-20" />
                                    <h3 className="text-lg font-bold text-slate-600">Global Bayi Haritası</h3>
                                    <p className="text-sm">Bu özellik bir sonraki güncellemede aktif olacaktır.</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};
