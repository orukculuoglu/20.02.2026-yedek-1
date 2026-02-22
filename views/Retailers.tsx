import React, { useEffect, useState } from 'react';
import { 
    ShoppingBag, Truck, Package, Search, Filter, Globe, Server, Star, 
    ChevronRight, MapPin, Building, Activity, Box, Layout, ArrowUpRight, 
    TrendingUp, LogOut, ClipboardList, CheckCircle, Clock, AlertCircle, 
    Barcode, Plane, Anchor, Loader2, Zap, ShieldAlert, Tag, Layers, X, Plus, Info
} from 'lucide-react';
import { getRetailers, getAftermarketHistory30d, getAftermarketInventory, getAftermarketOpsSummary, createPurchaseRequest } from '../services/dataService';
import { aftermarketOpsStore } from '../services/aftermarketOpsStore';
import { RetailerProfile, ViewState, AftermarketProductCard, AftermarketHistory30d, AftermarketOrder, AftermarketInventoryItem, AftermarketOperationsDashboard } from '../types';
import { mockDataEngineV1 } from '../data/dataEngine.mock';
import { createAftermarketMetrics, getRiskLabel, getRiskColor, type AftermarketMetricsOutput } from '../utils/aftermarketMetrics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface RetailersProps {
    onNavigate?: (view: ViewState, id?: string) => void;
}

type RetailerSubView = 'DASHBOARD' | 'INVENTORY' | 'ORDERS' | 'LOGISTICS' | 'NETWORK';
type AftermarketRole = 'DISTRIBUTOR' | 'RETAIL';

// --- Helper: Safe numeric converter ---
const toNum = (v: any, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// --- MOCK DATA FOR PARTSCORE ---
// --- Helper: Kontrol simülasyon önerisi ---
const getSimulationSuggestion = (productCity?: string, productCategory?: string, minStock?: number) => {
  if (!productCity || !productCategory || !minStock) return undefined;
  
  // Search in all recommendations (today + thisWeek)
  const allRecs = [
    mockDataEngineV1.strategicRecommendations.today,
    ...mockDataEngineV1.strategicRecommendations.thisWeek,
  ];

  const matched = allRecs.find(rec =>
    rec.region?.toLowerCase() === productCity.toLowerCase() &&
    productCategory.toLowerCase().includes(rec.partGroup?.toLowerCase())
  );

  if (!matched) return undefined;
  
  return {
    region: matched.region || '',
    district: matched.district || '',
    partGroup: matched.partGroup || '',
    changePercent: toNum(matched.changePercent ?? matched.recommendedStockChange, 0),
    confidence: toNum(matched.confidence ?? matched.confidenceRatio, 0),
    impact: toNum(matched.impact ?? matched.impactScore, 0),
  };
};

// --- INITIAL MOCK DATA ---
const INITIAL_MOCK_INVENTORY: AftermarketProductCard[] = [
  {
    sku: 'SKU-8821',
    name: 'LuK RepSet 2CT',
    brand: 'Schaeffler',
    category: 'Şanzıman',
    oemCodes: ['21207599345', '21208600780'],
    tier: 'EQUIVALENT',
    segment: 'OEM',
    stock: 145,
    reserved: 20,
    price: 22850,
    purchasePrice: 18500,
    salePrice: 22850,
    last30Sales: 150,
    fitment: ['BMW 3 Series'],
    city: 'İstanbul',
    district: 'Maslak'
  },
  {
    sku: 'SKU-9942',
    name: 'Brembo Ön Disk',
    brand: 'Brembo',
    category: 'Fren Sistemi',
    oemCodes: ['34116864840'],
    tier: 'EQUIVALENT',
    segment: 'PREMIUM',
    stock: 450,
    reserved: 12,
    price: 2450,
    purchasePrice: 1900,
    salePrice: 2450,
    last30Sales: 300,
    fitment: ['Mercedes C Class'],
    city: 'İstanbul',
    district: 'Kuruçeşme',
    minStock: 100,
  },
  {
    sku: 'SKU-1102',
    name: 'Varta 72Ah Akü',
    brand: 'Varta',
    category: 'Elektronik',
    oemCodes: ['61217604862'],
    tier: 'OEM',
    segment: 'EQUIVALENT',
    stock: 12,
    reserved: 8,
    price: 3200,
    purchasePrice: 2500,
    salePrice: 3200,
    last30Sales: 60,
    fitment: ['BMW 3 Series'],
    city: 'Ankara',
    district: 'Çankaya'
  },
  {
    sku: 'SKU-5521',
    name: 'Castrol Edge 5W30',
    brand: 'Castrol',
    category: 'Sıvılar',
    oemCodes: ['CAST-5W30-EDGE'],
    tier: 'ECONOMY',
    segment: 'PREMIUM',
    stock: 1200,
    reserved: 150,
    price: 950,
    purchasePrice: 750,
    salePrice: 950,
    last30Sales: 1200,
    fitment: ['Volkswagen Passat'],
    city: 'İzmir',
    district: 'Karşıyaka'
  },
  {
    sku: 'SKU-3321',
    name: 'Bosch Silecek Seti',
    brand: 'Bosch',
    category: 'Aksesuar',
    oemCodes: ['3397014133'],
    tier: 'EQUIVALENT',
    segment: 'EQUIVALENT',
    stock: 85,
    reserved: 5,
    price: 450,
    purchasePrice: 350,
    salePrice: 450,
    last30Sales: 150,
    fitment: ['Toyota Corolla'],
    city: 'İstanbul',
    district: 'Beylikdüzü'
  },
  {
    sku: 'SKU-4421',
    name: 'NGK BKR6EIX',
    brand: 'NGK',
    category: 'Ateşleme',
    oemCodes: ['NGK-BKR6EIX'],
    tier: 'EQUIVALENT',
    segment: 'ECONOMY',
    stock: 4,
    reserved: 0,
    price: 180,
    purchasePrice: 140,
    salePrice: 180,
    last30Sales: 0,
    fitment: ['Honda Civic'],
    city: 'Bursa',
    district: 'Nilüfer'
  }
];

const MOCK_B2B_ORDERS = [
    { id: 'ORD-2024-001', customer: 'Maslak Oto Garaj', date: 'Bugün 10:30', items: 12, total: 45200, status: 'PREPARING', region: 'İstanbul' },
    { id: 'ORD-2024-002', customer: 'Erel VW Yetkili', date: 'Bugün 09:15', items: 4, total: 12500, status: 'SHIPPED', region: 'İstanbul' },
    { id: 'ORD-2024-003', customer: 'Ankara EuroMaster', date: 'Dün 16:45', items: 25, total: 185000, status: 'DELIVERED', region: 'Ankara' },
    { id: 'ORD-2024-004', customer: 'İzmir Teknik', date: 'Dün 14:20', items: 8, total: 22400, status: 'PENDING', region: 'İzmir' },
];

export const Retailers: React.FC<RetailersProps> = ({ onNavigate }) => {
    const [activeView, setActiveView] = useState<RetailerSubView>('DASHBOARD');
    const [activeRole, setActiveRole] = useState<AftermarketRole>('DISTRIBUTOR');
    const [mode, setMode] = useState<'LIVE' | 'HISTORY'>('LIVE');
    const [retailers, setRetailers] = useState<RetailerProfile[]>([]);
    const [loading, setLoading] = useState(false);

    // Aftermarket Operations - CANLI
    // V1: Bölge seçimi - iki kaynaktan bir kaynağa dönüştürüldü
    const [selectedCity, setSelectedCity] = useState('İstanbul');
    const [selectedDistrict, setSelectedDistrict] = useState('Maslak');
    const [orders, setOrders] = useState<AftermarketOrder[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    // Profitability state
    const [targetDaysStock, setTargetDaysStock] = useState(30);
    const [minDaysStock, setMinDaysStock] = useState(15);
    const [regionMultiplier, setRegionMultiplier] = useState(1.0);
    const [segmentMultipliers, setSegmentMultipliers] = useState({ OEM: 1.2, PREMIUM: 1.1, EQUIVALENT: 1.0, ECONOMY: 0.9 });
    const [selectedVehicleGroup, setSelectedVehicleGroup] = useState<'Genel' | 'BMW F30' | 'VW Golf 7' | 'Toyota Corolla'>('Genel');
    const [showSettings, setShowSettings] = useState(false);
    const [operationalStats, setOperationalStats] = useState<{ pendingAndPreparingCount: number; shippedCount: number; deliveredTotal: number }>({ pendingAndPreparingCount: 0, shippedCount: 0, deliveredTotal: 0 });

    // Circulation Engine - Operations Dashboard
    const [opsSummary, setOpsSummary] = useState<AftermarketOperationsDashboard | null>(null);
    const [loadingOpsSummary, setLoadingOpsSummary] = useState(false);

    // Inventory State with Stock Management
    const [inventory, setInventory] = useState<AftermarketProductCard[]>(INITIAL_MOCK_INVENTORY);

    useEffect(() => {
        getRetailers().then(data => setRetailers(data));
    }, []);

    // Fetch operations summary when DASHBOARD opened
    useEffect(() => {
        if (activeView === 'DASHBOARD') {
            setLoadingOpsSummary(true);
            getAftermarketOpsSummary(30, selectedCity, selectedDistrict)
                .then(data => {
                    setOpsSummary(data);
                    setLoadingOpsSummary(false);
                })
                .catch(() => setLoadingOpsSummary(false));
        }
    }, [activeView, selectedCity, selectedDistrict]);

    // Fetch orders and stats when LIVE mode
    useEffect(() => {
        if (mode === 'LIVE') {
            refreshOrders();
        }
    }, [mode]);

    const refreshOrders = async () => {
        const freshOrders = await aftermarketOpsStore.getOrders();
        setOrders(freshOrders);
        const stats = await aftermarketOpsStore.getOperationalStats();
        setOperationalStats(stats);
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // --- Rol Katmanı (Role Layer) ---
    type AftermarketRole = 'OPERATION' | 'STRATEGY';
    const CURRENT_ROLE: AftermarketRole = 'OPERATION';

    // --- Sub-Components ---



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

        const totalStockValue = inventory.reduce((sum, item) => sum + (item.price * item.stock), 0);
        const totalLast30Sales = inventory.reduce((sum, item) => sum + item.last30Sales, 0);
        const avgStockValue = totalStockValue / inventory.length;
        const turnoverScoreNum = avgStockValue > 0 ? (totalLast30Sales / avgStockValue * 100) : 0;
        const deadStockValue = inventory.filter(item => item.last30Sales === 0 && item.stock > 0).reduce((sum, item) => sum + (item.price * item.stock), 0);
        const deadStockRiskNum = totalStockValue > 0 ? ((deadStockValue / totalStockValue) * 100) : 0;

        // Real-time KPI calculations from orders state
        const pendingOrderCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING').length;
        const shippedOrderCount = orders.filter(o => o.status === 'SHIPPED').length;
        const deliveredOrderTotal = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.total, 0);

        return (
            <div className="space-y-6">
                {/* 4 KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Toplam Stok Değeri</p>
                                <h3 className="text-3xl font-bold text-slate-800">{(totalStockValue / 1000000).toFixed(1)}M ₺</h3>
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
                                <h3 className="text-3xl font-bold text-orange-600">{pendingOrderCount}</h3>
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><ClipboardList size={24}/></div>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full" style={{width: `${Math.min(100, (pendingOrderCount / 20) * 100)}%`}}></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Yoldaki Araç</p>
                                <h3 className="text-3xl font-bold text-purple-600">{shippedOrderCount}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Truck size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Şu an levazım distribüsiyon</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Stok Devir Skoru (30G)</p>
                                <h3 className="text-3xl font-bold text-blue-600">{turnoverScoreNum.toFixed(1)}%</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500">Satış/Stok Oranı (30 Gün)</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ölü Stok Riski (30G)</p>
                                <h3 className={`text-3xl font-bold ${deadStockRiskNum > 20 ? 'text-rose-600' : deadStockRiskNum > 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{deadStockRiskNum.toFixed(1)}%</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${deadStockRiskNum > 20 ? 'bg-rose-50 text-rose-600' : deadStockRiskNum > 10 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}><ShieldAlert size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500">Satılmayan Stok Oranı</p>
                    </div>
                </div>

                {/* Chart + Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-6">Haftalık Satış Trendi</h3>
                        <div style={{height: '300px', width: '100%'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
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
                            {inventory.filter(i => i.stock - i.reserved < 50).map(item => (
                                <div key={item.sku} className="p-3 border border-rose-100 bg-rose-50 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-rose-800">{item.name}</p>
                                        <p className="text-xs text-rose-600">{item.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-rose-700">{item.stock - item.reserved}</p>
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

                {/* Circulation Engine Blocks (D3) */}
                {opsSummary && (
                    <>
                        {/* En Hızlı Dönen 10 Ürün */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={20} className="text-emerald-600" />
                                <h3 className="font-bold text-slate-800">En Hızlı Dönen 10 Ürün (30 Gün)</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {opsSummary.topFastMoving10.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <p className="text-xs font-bold text-emerald-700 uppercase mb-1">{idx + 1}. Sıra</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                                        <p className="text-xs text-slate-600 mb-2">{item.brand}</p>
                                        <p className="text-lg font-bold text-emerald-600">{item.value.toFixed(2)}x</p>
                                        <p className="text-[10px] text-emerald-600 font-bold">Devir Hızı</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Kritik Kaplama (< 7 Gün) */}
                        {opsSummary.criticalCoverage.length > 0 && (
                            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertCircle size={20} className="text-rose-600" />
                                    <h3 className="font-bold text-slate-800">Kritik Kaplama ({opsSummary.summary.criticalCount} ürün)</h3>
                                    <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded-full ml-auto">Acil Sipariş Önerisi</span>
                                </div>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {opsSummary.criticalCoverage.map((item) => (
                                        <div key={item.sku} className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-800">{item.name}</p>
                                                <p className="text-xs text-slate-600">{item.brand} • {item.sku}</p>
                                                <div className="flex gap-4 mt-2">
                                                    <span className="text-xs"><strong>Stokta:</strong> {item.onHand} adet</span>
                                                    <span className="text-xs"><strong>Günlük:</strong> {item.dailyAvg.toFixed(1)} adet</span>
                                                    <span className="text-xs text-rose-600"><strong>Kaplama:</strong> {item.daysOfCover.toFixed(1)} gün</span>
                                                </div>
                                            </div>
                                            <button className="px-3 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap">
                                                +{item.suggestedOrderQty} Sipariş
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Kâr Fırsatı - Highest Margin */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Star size={20} className="text-amber-600" />
                                <h3 className="font-bold text-slate-800">Marj Fırsatı - En Yüksek Karlı 10 Ürün</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {opsSummary.highMarginOpportunities.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                        <p className="text-xs font-bold text-amber-700 uppercase mb-1">{idx + 1}. Sıra</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                                        <p className="text-xs text-slate-600 mb-2">{item.brand}</p>
                                        <p className="text-lg font-bold text-amber-600">₺{item.value.toFixed(0)}</p>
                                        <p className="text-[10px] text-amber-600 font-bold">Birim Marj</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <p className="text-xs font-bold text-blue-700 uppercase mb-2">Toplam Stok Değeri</p>
                                <p className="text-2xl font-bold text-blue-700">₺{(opsSummary.summary.totalInventoryValue / 1000000).toFixed(2)}M</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                <p className="text-xs font-bold text-emerald-700 uppercase mb-2">Ortalama Devir Hızı</p>
                                <p className="text-2xl font-bold text-emerald-700">{opsSummary.summary.avgTurnover.toFixed(2)}x</p>
                            </div>
                            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
                                <p className="text-xs font-bold text-rose-700 uppercase mb-2">Kritik Ürün Sayısı</p>
                                <p className="text-2xl font-bold text-rose-700">{opsSummary.summary.criticalCount}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                <p className="text-xs font-bold text-slate-700 uppercase mb-2">Toplam SKU</p>
                                <p className="text-2xl font-bold text-slate-700">{opsSummary.summary.totalSKUs}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Vehicle Demand Index - Araç Model Yoğunluk Katsayıları
    const vehicleDemandIndex: Record<string, number> = {
        'BMW 3 Series': 1.25,
        'Mercedes C Class': 1.18,
        'Volkswagen Passat': 1.05,
        'Toyota Corolla': 1.10,
        'Honda Civic': 0.95
    };

    // Anonymous Regional Demand Multipliers - Anonim Bölgesel Talep Katsayıları (C-2)
    type RegionKey = `${string}/${string}`; // "İstanbul/Maslak"
    const REGION_MULTIPLIERS: Record<RegionKey, number> = {
        // İstanbul
        'İstanbul/Maslak': 1.12,
        'İstanbul/Ataşehir': 1.08,
        'İstanbul/Ümraniye': 1.06,
        // Ankara
        'Ankara/Ostim': 1.09,
        'Ankara/Çankaya': 1.05,
        'Ankara/Keçiören': 1.04,
        // İzmir
        'İzmir/Bornova': 1.07,
        'İzmir/Karşıyaka': 1.05,
        'İzmir/Buca': 1.06,
    };

    const CITY_DISTRICTS: Record<string, string[]> = {
        'İstanbul': ['Maslak', 'Ataşehir', 'Ümraniye'],
        'Ankara': ['Ostim', 'Çankaya', 'Keçiören'],
        'İzmir': ['Bornova', 'Karşıyaka', 'Buca']
    };

    const DEFAULT_REGION_MULTIPLIER = 1.00;

    function getRegionMultiplier(city: string, district: string): number {
        const key = `${city}/${district}` as RegionKey;
        return REGION_MULTIPLIERS[key] ?? DEFAULT_REGION_MULTIPLIER;
    }

    const InventoryView = () => {
        // Parametrized Optimization Engine
        const [targetDaysStock, setTargetDaysStock] = useState<number>(30);
        const [minDaysStock, setMinDaysStock] = useState(15);
        const [regionMultiplier, setRegionMultiplier] = useState(1.0);
        const [segmentMultipliers, setSegmentMultipliers] = useState({
            OEM: 1.20,
            PREMIUM: 1.10,
            EQUIVALENT: 1.00,
            ECONOMY: 0.90
        });
        const [showSettings, setShowSettings] = useState(false);
        const [selectedVehicleGroup, setSelectedVehicleGroup] = useState<'Genel' | 'BMW F30' | 'VW Golf 7' | 'Toyota Corolla'>('Genel');

        // NaN-safe helper
        const n = (v: any): number => (Number.isFinite(Number(v)) ? Number(v) : 0);

        // Vehicle Group Multiplier Calculator
        const getVehicleGroupMultiplier = (vehicleGroup: string, category: string): number => {
            if (vehicleGroup === 'Genel') return 1.00;
            
            if (vehicleGroup === 'BMW F30') {
                if (category.includes('Şanzıman') || category.includes('Debriyaj')) return 1.25;
                if (category.includes('Fren')) return 1.15;
                return 1.05;
            }
            
            if (vehicleGroup === 'VW Golf 7') {
                if (category.includes('Fren') || category.includes('Sıvılar')) return 1.10;
                return 1.03;
            }
            
            if (vehicleGroup === 'Toyota Corolla') {
                if (category.includes('Sıvılar')) return 1.15;
                if (category.includes('Elektronik')) return 1.05;
                return 1.02;
            }
            
            return 1.00;
        };

        // Calculation Logic with Parameters & Vehicle Demand Index & Vehicle Group Multiplier & Region Multiplier
        const processedInventory = inventory.map(item => {
            // 1. MANUEL KALKÜLASYONLARİ YAP (Eski Logic)
            const baseDailyAvg = item.last30Sales === 0 ? 0.1 : item.last30Sales / 30;
            
            // Calculate Vehicle Multiplier from fitment demand index
            let vehicleMultiplier = 1.0;
            const vehicleModels = (item.fitment || []) as string[];
            if (vehicleModels && vehicleModels.length > 0) {
                const matchedIndices = vehicleModels
                    .map(model => vehicleDemandIndex[model] || 1.0)
                    .filter(idx => idx !== undefined);
                
                if (matchedIndices.length > 0) {
                    vehicleMultiplier = matchedIndices.reduce((a, b) => a + b, 0) / matchedIndices.length;
                }
            }
            
            // Get Vehicle Group Multiplier (category-based)
            const vehicleGroupMultiplier = getVehicleGroupMultiplier(selectedVehicleGroup, item.category);
            
            // 2. createAftermarketMetrics'İ ÇAĞIR
            const metrics = createAftermarketMetrics(item, {
                selectedCity,
                selectedDistrict,
                targetDays: Number(targetDaysStock) || 30,
                modelGroup: selectedVehicleGroup !== 'Genel' ? selectedVehicleGroup : undefined
            });
            
            // 3. PROFITABILITY HESAPLAMASI (Değişmedi)
            const segment = item.segment || 'EQUIVALENT';
            const segmentMult = segmentMultipliers[segment as keyof typeof segmentMultipliers] || 1.0;
            
            const purchasePrice = (item as any).purchasePrice || item.price;
            const salePrice = (item as any).salePrice || item.price;
            const marginAmount = salePrice - purchasePrice;
            const marginPercent = purchasePrice > 0 ? (marginAmount / purchasePrice) * 100 : 0;
            const monthlyEstimatedProfit = item.last30Sales * marginAmount;
            const stockTurnover = item.stock > 0 ? item.last30Sales / item.stock : 0;
            
            // Product Classification
            let productClass = 'NORMAL';
            if (stockTurnover > 0.8 && marginPercent > 20) {
                productClass = 'STRATEJİK';
            } else if (stockTurnover > 0.8 && marginPercent < 15) {
                productClass = 'HACİM';
            } else if (stockTurnover < 0.5 && marginPercent > 25) {
                productClass = 'KÂR ODAKLI';
            }
            
            const turnoverScore = Math.max(0, Math.min(100, Math.round((item.last30Sales / Math.max(item.stock, 1)) * 100)));

            // 4. RETURN STATEMENT (createAftermarketMetrics'ten gelen metrikler artık burada)
            return {
                ...item,
                // Manual calculations
                baseDailyAvg,
                vehicleMultiplier,
                vehicleGroupMultiplier,
                dailyAvg: metrics.effectiveDailyDemand,
                
                // From createAftermarketMetrics
                ...metrics,
                
                // Profitability
                marginAmount,
                marginPercent,
                monthlyEstimatedProfit,
                stockTurnover,
                productClass,
                turnoverScore,
                
                // Uyumluluk için eski alanlar (NaN-safe)
                finalDailyAvg: n(metrics.effectiveDailyDemand),
                effectiveDailyAvg: n(metrics.effectiveDailyDemand),
                usableStock: n(metrics.usableStock),
                targetStock: n(metrics.minStock + metrics.orderSuggestionQty),
                daysToZero: n(metrics.daysLeftBeforeStockout),
                orderSuggestion: n(metrics.orderSuggestionQty),
                riskScore: n(metrics.riskScore),
                
                // V1: Simülasyon Önerisi
                simulationSuggestion: getSimulationSuggestion(item.city, item.category, metrics.minStock)
            };
        });

        // V1: Simülasyon uyarı göster
        const simulatedCount = processedInventory.filter(item => item.simulationSuggestion).length;
        if (simulatedCount > 0) {
            // Toast gösterilecek (componentte showToast varsa)
            setTimeout(() => {
                const toastEl = document.querySelector('[role="alert"]');
                if (!toastEl) {
                    const toast = document.createElement('div');
                    toast.className = 'fixed top-4 right-4 bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold z-50 flex items-center gap-2';
                    toast.setAttribute('role', 'alert');
                    toast.innerHTML = '<span>✓</span> <span>Simülasyon Aktif – Gerçek Stok Etkilenmedi (<strong>' + simulatedCount + '</strong> öğe)</span>';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 4000);
                }
            }, 300);
        }

        const handleCreateOrder = async (item: any) => {
            try {
                const orderQuantity = item.orderSuggestion || 0;
                const available = item.stock - item.reserved;
                
                // GUARD: Stok kontrolü #1 - Hiç stok yoksa
                if (available <= 0) {
                    showToast('⚠️ Yetersiz stok: Kullanılabilir 0. Önce ERP/LENT stoğu senkronize edin veya stok girin.');
                    return;
                }
                
                // GUARD: Stok kontrolü #2 - İstenen miktar mevcut stocktan fazlaysa
                if (orderQuantity > available) {
                    showToast(`⚠️ Yetersiz stok: İstenen ${orderQuantity}, kullanılabilir ${available}. Sipariş engellendi.`);
                    return;
                }
                
                const regionStr = `${selectedCity} / ${selectedDistrict}`;
                
                // Determine source based on available stock
                const source: 'LENT' | 'ERP' = available >= orderQuantity ? 'LENT' : 'ERP';
                
                // Update reserved stock (only for LENT source)
                if (source === 'LENT') {
                    const updatedInventory = inventory.map(invItem => {
                        if (invItem.sku === item.sku) {
                            const newReserved = invItem.reserved + orderQuantity;
                            const maxReserved = invItem.stock;
                            const cappedReserved = Math.min(newReserved, maxReserved);
                            
                            return {
                                ...invItem,
                                reserved: cappedReserved
                            };
                        }
                        return invItem;
                    });
                    
                    setInventory(updatedInventory);
                }
                
                // Create procurement order
                const newOrder = await aftermarketOpsStore.createOrderFromSuggestion(
                    item, 
                    orderQuantity, 
                    regionStr,
                    'PROCUREMENT',
                    source,
                    'Stok Tamamlama'
                );
                showToast(`✓ Tedarik talebi oluşturuldu: ${newOrder.id} (Kaynak: ${source})`);
                await refreshOrders();
                setActiveView('ORDERS');
            } catch (e) {
                showToast('❌ Tedarik talebi oluşturma başarısız');
            }
        };

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Settings Panel */}
                {showSettings && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Zap size={18} className="text-blue-600"/> TAHMİNLEME AYARLARI
                            </h3>
                            <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={18}/>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Hedef Stok Günü (7-90)</label>
                                <input 
                                    type="number" 
                                    min="7" 
                                    max="90" 
                                    value={targetDaysStock}
                                    onChange={(e) => setTargetDaysStock(Math.max(7, Math.min(90, parseInt(e.target.value) || 30)))}
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white text-slate-800 font-bold text-center focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Min Stok Günü (3-60)</label>
                                <input 
                                    type="number" 
                                    min="3" 
                                    max="60" 
                                    value={minDaysStock}
                                    onChange={(e) => setMinDaysStock(Math.max(3, Math.min(60, parseInt(e.target.value) || 15)))}
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white text-slate-800 font-bold text-center focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Bölge Çarpanı ({regionMultiplier.toFixed(2)}x)</label>
                                <input 
                                    type="range" 
                                    min="0.7" 
                                    max="1.5" 
                                    step="0.1" 
                                    value={regionMultiplier}
                                    onChange={(e) => setRegionMultiplier(parseFloat(e.target.value))}
                                    className="w-full focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Segment Çarpanları</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(segmentMultipliers).map(([seg, mult]) => (
                                        <div key={seg} className="flex items-center">
                                            <span className="text-[11px] font-bold text-slate-600 w-12">{seg}</span>
                                            <input 
                                                type="number" 
                                                min="0.5" 
                                                max="2.0" 
                                                step="0.1" 
                                                value={mult}
                                                onChange={(e) => setSegmentMultipliers({
                                                    ...segmentMultipliers,
                                                    [seg]: parseFloat(e.target.value) || 1.0
                                                })}
                                                className="w-10 px-1 py-0.5 border border-blue-200 rounded text-[11px] text-center bg-white focus:ring-2 focus:ring-blue-500/50"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Region Selector - Anonymous Regional Demand Effect (C) */}
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-4">
                    <div>
                        <label className="text-xs font-bold text-orange-700 uppercase block mb-1">Şehir</label>
                        <select value={selectedCity} onChange={(e) => {
                            const newCity = e.target.value;
                            const firstDistrictForCity = CITY_DISTRICTS[newCity]?.[0] || 'Maslak';
                            setSelectedCity(newCity);
                            setSelectedDistrict(firstDistrictForCity);
                        }} className="px-3 py-2 border border-orange-200 rounded-lg text-sm font-medium bg-white text-orange-700 focus:ring-2 focus:ring-orange-500/50">
                            <option>İstanbul</option>
                            <option>Ankara</option>
                            <option>İzmir</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-orange-700 uppercase block mb-1">İlçe</label>
                        <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="px-3 py-2 border border-orange-200 rounded-lg text-sm font-medium bg-white text-orange-700 focus:ring-2 focus:ring-orange-500/50">
                            {CITY_DISTRICTS[selectedCity]?.map(district => (
                                <option key={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-1">
                        <div className="text-xs text-orange-600 font-bold">
                            Seçili Bölge: <span className="text-orange-700 font-bold">{selectedCity} / {selectedDistrict}</span>
                        </div>
                        <div className="text-[10px] text-orange-500 italic">Anonim Bölgesel Etki: Aktif</div>
                    </div>
                </div>

                {/* Vehicle Group Model Selector */}
                <div className="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-6">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-purple-700 uppercase block mb-1">Araç Model Grubu</label>
                        <select value={selectedVehicleGroup} onChange={(e) => setSelectedVehicleGroup(e.target.value as 'Genel' | 'BMW F30' | 'VW Golf 7' | 'Toyota Corolla')} className="px-3 py-2 border border-purple-200 rounded-lg text-sm font-medium bg-white text-purple-700 focus:ring-2 focus:ring-purple-500/50">
                            <option>Genel</option>
                            <option>BMW F30 (3.16i)</option>
                            <option>VW Golf 7</option>
                            <option>Toyota Corolla</option>
                        </select>
                    </div>
                    {selectedVehicleGroup !== 'Genel' && (
                        <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-xl border border-purple-200">
                            <span className="text-xs font-bold text-purple-700 uppercase">Model Etkisi: Aktif ({selectedVehicleGroup})</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="SKU, Parça Adı veya Marka ara..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20 bg-white" />
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${showSettings ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} text-sm font-bold transition-colors`}
                        >
                            <Zap size={16} /> Ayarlar
                        </button>
                        {selectedVehicleGroup !== 'Genel' && (
                            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-xl border border-purple-200">
                                <span className="text-[10px] font-bold text-purple-700 uppercase">Model Etkisi: {selectedVehicleGroup}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-xl border border-orange-200">
                            <span className="text-[10px] font-bold text-orange-700 uppercase">Anonim Bölgesel Etki: {selectedCity}/{selectedDistrict}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 mr-2">
                            <Zap size={16} className="text-blue-600" />
                            <span className="text-xs font-bold text-blue-700 uppercase">Tahminleme Motoru Aktif</span>
                        </div>
                        <button className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm font-medium"><Filter size={16}/> Kategori</button>
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 text-sm font-medium shadow-md shadow-orange-200"><Server size={16}/> ERP Senkronize Et</button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-full overflow-x-auto">
                    <table className="min-w-[1400px] w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4">SKU / Parça Bilgisi</th>
                                <th className="px-6 py-4 text-center">Günlük Ortalama</th>
                                <th className="px-6 py-4 text-center">Tahmini Tükenme (Gün)</th>
                                <th className="px-6 py-4 text-center">Risk Skoru</th>
                                <th className="px-6 py-4 text-center">Min Stok</th>
                                <th className="px-6 py-4 text-center">Devir Skoru</th>
                                <th className="px-6 py-4 text-center">Sipariş Önerisi</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">Marj %</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">Aylık Kâr (₺)</th>
                                <th className="px-6 py-4 text-center">Devir Hızı</th>
                                <th className="px-6 py-4 text-center">Sınıf</th>
                                <th className="px-6 py-4">Stok Durumu</th>
                                <th className="px-6 py-4 text-center whitespace-nowrap">Veri Motoru Önerisi (Simülasyon)</th>
                                <th className="px-6 py-4 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {processedInventory.map(item => (
                                <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 rounded">{item.sku}</div>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                        item.segment === 'OEM' ? 'bg-blue-100 text-blue-700' :
                                                        item.segment === 'PREMIUM' ? 'bg-purple-100 text-purple-700' :
                                                        item.segment === 'EQUIVALENT' ? 'bg-slate-100 text-slate-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {item.segment || 'N/A'}
                                                    </span>
                                                    {item.oemCodes.length > 0 && (
                                                        <span className="text-[9px] text-slate-500 bg-slate-100 px-1 rounded">{item.oemCodes[0]}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-black text-slate-800 text-sm">{n(item.finalDailyAvg).toFixed(2)}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Adet/Gün</span>
                                            <div className="flex gap-1 mt-0.5">
                                                {item.vehicleGroupMultiplier !== 1.0 && (
                                                    <span className="text-[7px] text-purple-600 font-bold bg-purple-50 px-1 py-0.5 rounded">Model {(item.vehicleGroupMultiplier * 100).toFixed(0)}%</span>
                                                )}
                                                {item.regionMultiplier !== 1.0 && (
                                                    <span className="text-[7px] text-orange-600 font-bold bg-orange-50 px-1 py-0.5 rounded">Bölge {(item.regionMultiplier * 100).toFixed(0)}%</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`font-black text-sm ${n(item.daysToZero) < 10 ? 'text-rose-600' : 'text-slate-800'}`}>
                                                {Math.round(n(item.daysToZero))}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Gün Kaldı</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black border uppercase tracking-tighter ${
                                                n(item.riskScore) >= 80 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                n(item.riskScore) >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                                {n(item.riskScore) >= 80 ? 'KRİTİK' : n(item.riskScore) >= 50 ? 'YÜKSEK' : 'GÜVENLİ'} ({Math.round(n(item.riskScore))})
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                            {Math.round(n(item.minStock))} adet
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                            item.turnoverScore >= 71 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            item.turnoverScore >= 41 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                            {item.turnoverScore}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {n(item.orderSuggestion) > 0 ? (
                                            <div className="flex flex-col items-center gap-1">
                                                {(() => {
                                                    const availableStock = item.stock - item.reserved;
                                                    const isNoStock = availableStock <= 0;
                                                    const isInsufficient = item.orderSuggestion > availableStock && availableStock > 0;
                                                    
                                                    return (
                                                        <>
                                                            <div className="relative">
                                                                <button 
                                                                    onClick={() => handleCreateOrder(item)}
                                                                    disabled={isNoStock || isInsufficient}
                                                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                                        isNoStock || isInsufficient
                                                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                                                                            : 'bg-orange-600 text-white hover:bg-orange-700'
                                                                    }`}
                                                                >
                                                                    <Plus size={14} /> Tedarik Talebi (+{item.orderSuggestion})
                                                                </button>
                                                                {(isNoStock || isInsufficient) && (
                                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none">
                                                                        {isNoStock ? '⚠️ Stok yok' : '⚠️ Yetersiz stok'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-[9px] text-slate-500">
                                                                Hedef: {targetDaysStock} gün
                                                            </div>
                                                            <div className="text-[9px] text-slate-500">
                                                                Segment: {item.segment}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                                                <CheckCircle size={12}/> Yeterli
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-slate-800 text-sm">{item.marginPercent.toFixed(1)}%</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">Marj</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <div className="flex flex-col items-center">
                                            <span className={`font-bold text-sm ${item.monthlyEstimatedProfit > 50000 ? 'text-emerald-700' : item.monthlyEstimatedProfit > 20000 ? 'text-blue-700' : 'text-slate-700'}`}>
                                                {(item.monthlyEstimatedProfit / 1000).toFixed(0)}K
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">Aylık</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-slate-800 text-sm">{item.stockTurnover.toFixed(2)}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">Devir</span>
                                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                                                item.stockTurnover > 1 ? 'bg-emerald-100 text-emerald-700' :
                                                item.stockTurnover > 0.5 ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {item.stockTurnover > 1 ? 'Yüksek' : item.stockTurnover > 0.5 ? 'Orta' : 'Düşük'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border ${
                                            item.productClass === 'STRATEJİK' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                            item.productClass === 'HACİM' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            item.productClass === 'KÂR ODAKLI' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            'bg-slate-100 text-slate-700 border-slate-200'
                                        }`}>
                                            {item.productClass}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex bg-slate-50 rounded py-2 px-2 gap-3 text-[10px]">
                                                <span className="font-bold text-slate-600">Stok: <strong className="text-slate-800">{item.stock}</strong></span>
                                                <span className="font-bold text-slate-600">Ayrılan: <strong className="text-orange-700">{item.reserved}</strong></span>
                                                <span className="font-bold text-slate-600">Kullanılabilir: <strong className="text-emerald-700">{item.stock - item.reserved}</strong></span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${item.daysToZero < 15 ? 'bg-rose-500' : item.daysToZero < 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                                        style={{width: `${Math.min(100, (item.stock / 1500) * 100)}%`}}
                                                    ></div>
                                                </div>
                                                {item.reserved > 0 && (
                                                    <div className="text-[9px] text-orange-600 font-bold">
                                                        {((item.reserved / item.stock) * 100).toFixed(0)}% ayrılmış
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    {/* Veri Motoru Simülasyon Önerisi */}
                                    <td className="px-6 py-4">
                                        {item.simulationSuggestion ? (() => {
                                                const suggestion = item.simulationSuggestion;
                                                const confPct = Math.round(toNum(suggestion.confidence, 0) * 100);
                                                const impactVal = Math.round(toNum(suggestion.impact, 0));
                                                const changePct = toNum(suggestion.changePercent, 0);
                                                const newMinStock = Math.round(item.minStock * (1 + changePct / 100));
                                                
                                                return (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-1">
                                                        <div className="flex items-center gap-1 font-bold text-blue-700 mb-2">
                                                            <Info size={12} />
                                                            Simülasyon Aktif
                                                        </div>
                                                        <div className="text-blue-900">
                                                            <p className="font-semibold">Min Stok: {Math.round(item.minStock)} → {newMinStock}</p>
                                                            <p className="text-blue-700">Değişim: <span className={changePct > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                                                {changePct > 0 ? '+' : ''}{changePct}%
                                                            </span></p>
                                                            <p className="text-blue-700">Güven: {confPct}%</p>
                                                            <p className="text-blue-700">Etki: {impactVal}</p>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 italic mt-2">
                                                            Gerçek stok etkilenmedi
                                                        </div>
                                                    </div>
                                                );
                                            })() : (
                                            <div className="text-slate-400 text-xs text-center py-2">
                                                Veri yok
                                            </div>
                                        )}
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
            </div>
        );
    };

    const OrdersView = () => {
        const statusLabels: Record<string, string> = {
            'PENDING': 'Onay Bekliyor',
            'PREPARING': 'Hazırlanıyor',
            'SHIPPED': 'Yola Çıktı',
            'DELIVERED': 'Teslim Edildi'
        };

        const statusColors: Record<string, string> = {
            'PENDING': 'bg-amber-50 border-amber-200 text-amber-600',
            'PREPARING': 'bg-blue-50 border-blue-200 text-blue-600',
            'SHIPPED': 'bg-purple-50 border-purple-200 text-purple-600',
            'DELIVERED': 'bg-emerald-50 border-emerald-200 text-emerald-600'
        };

        const handleAdvanceStatus = async (orderId: string) => {
            try {
                await aftermarketOpsStore.advanceOrderStatus(orderId);
                await refreshOrders();
                showToast('Sipariş durumu güncellendi');
            } catch (e) {
                showToast('Durum güncelleme başarısız');
            }
        };

        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 gap-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-bold text-slate-600">Sipariş yok</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-orange-300 transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${statusColors[order.status]}`}>
                                        {order.status === 'SHIPPED' ? <Truck size={20}/> : <ClipboardList size={20}/>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-slate-800 text-lg">
                                                {order.orderType === 'PROCUREMENT' ? '📦 Tedarik Talebi' : order.customer}
                                            </h4>
                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">{order.id}</span>
                                            {order.orderType === 'PROCUREMENT' && order.source && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    order.source === 'LENT' 
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                    {order.source}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><Clock size={14}/> {order.createdAt}</span>
                                            <span className="flex items-center gap-1"><MapPin size={14}/> {order.region}</span>
                                            {order.orderType === 'PROCUREMENT' && order.explanation && (
                                                <span className="font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded text-xs">
                                                    {order.explanation}
                                                </span>
                                            )}
                                            {order.orderType !== 'PROCUREMENT' && (
                                                <span className="font-bold text-slate-600">{order.items.length} Kalem Ürün</span>
                                            )}
                                            {order.orderType === 'PROCUREMENT' && (
                                                <span className="font-bold text-slate-600">{order.items[0]?.qty || 0} Adet</span>
                                            )}
                                            {order.status === 'SHIPPED' && order.etaMinutes && (
                                                <span className="flex items-center gap-1 text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded text-xs">
                                                    <Truck size={12}/> ETA: {order.etaMinutes} dk • {order.vehiclePlate}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-bold text-xl text-slate-800">{order.total.toLocaleString('tr-TR')} ₺</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-block ${statusColors[order.status]}`}>
                                            {statusLabels[order.status]}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => handleAdvanceStatus(order.id)}
                                        disabled={order.status === 'DELIVERED'}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                                            order.status === 'DELIVERED' 
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                                : 'bg-orange-600 text-white hover:bg-orange-700'
                                        }`}
                                    >
                                        İlerle
                                    </button>
                                    <button className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const LogisticsView = () => {
        const [logisticsFeed, setLogisticsFeed] = useState<any[]>([]);

        useEffect(() => {
            aftermarketOpsStore.getLogisticsFeed().then(setLogisticsFeed);
        }, [orders]);

        return (
            <div className="animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Yoldaki Araçlar (SHIPPED Siparişler)</h3>
                
                {logisticsFeed.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 border-4 border-orange-100">
                            <Truck size={40} className="text-orange-600 opacity-30" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-600 mb-2">Henüz yolda araç yok</h3>
                        <p className="text-sm text-slate-400">Siparişleri SHIPPED durumuna ilerletin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {logisticsFeed.map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Araç Plakası</p>
                                        <h4 className="text-xl font-bold text-slate-800">{item.plate}</h4>
                                    </div>
                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">YOLDA</span>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Truck size={14} className="text-slate-400" />
                                        <span className="text-xs text-slate-600">{item.route}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm font-bold text-orange-600 bg-orange-50 p-2 rounded">
                                        <Clock size={14} />
                                        <span className="text-xs">ETA: {item.etaMinutes} dakika</span>
                                    </div>
                                    
                                    <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2">
                                        <p className="font-mono text-slate-600">Sipariş: {item.orderId}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const HistoryAnalyticsView = () => {
        const [historyData, setHistoryData] = useState<AftermarketHistory30d | null>(null);
        const [historyLoading, setHistoryLoading] = useState(false);

        useEffect(() => {
            setHistoryLoading(true);
            getAftermarketHistory30d().then(data => {
                setHistoryData(data);
                setHistoryLoading(false);
            });
        }, []);

        if (historyLoading || !historyData) {
            return (
                <div className="flex items-center justify-center h-96 text-slate-400">
                    <Loader2 size={32} className="animate-spin" />
                </div>
            );
        }

        const kpis = [
            { label: '30 Gün Ciro', value: `₺${(historyData.kpis.revenue30d / 1000).toFixed(0)}K`, icon: ShoppingBag, color: 'blue' },
            { label: '30 Gün Sipariş', value: historyData.kpis.orders30d, icon: ClipboardList, color: 'orange' },
            { label: 'Stok Devir Hızı (Endeks)', value: historyData.kpis.turnoverIndex.toFixed(1), icon: TrendingUp, color: 'emerald' },
            { label: 'İade Oranı (%)', value: historyData.kpis.returnRate.toFixed(1), icon: AlertCircle, color: 'rose' }
        ];

        const colorMap = { blue: 'bg-blue-50 text-blue-600 border-blue-100', orange: 'bg-orange-50 text-orange-600 border-orange-100', emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100', rose: 'bg-rose-50 text-rose-600 border-rose-100' };

        return (
            <div className="space-y-6">
                {/* 4 KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {kpis.map((kpi, idx) => {
                        const Icon = kpi.icon as any;
                        const bgColor = colorMap[kpi.color as keyof typeof colorMap];
                        return (
                            <div key={idx} className={`p-4 rounded-xl border ${bgColor}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold opacity-70 uppercase">{kpi.label}</p>
                                        <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                                    </div>
                                    <Icon size={24} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Charts + Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Brands Chart */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">En Çok Satılan Markalar (Top 5)</h3>
                        <div style={{ height: '250px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={historyData.topBrands} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Categories Chart */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">En Çok Satılan Kategoriler (Top 5)</h3>
                        <div style={{ height: '250px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={historyData.topCategories} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Vehicle Consumption Table */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Araç Marka/Model Bazlı Tüketim (Top 10)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-slate-200">
                                <tr>
                                    <th className="text-left py-2 font-bold text-slate-600">Araç</th>
                                    <th className="text-left py-2 font-bold text-slate-600">En Çok Tüketilen Kategori</th>
                                    <th className="text-center py-2 font-bold text-slate-600">Tahmini Tüketim (Endeks)</th>
                                    <th className="text-left py-2 font-bold text-slate-600">Bölge</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {historyData.topVehicleConsumption.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 font-medium text-slate-800">{row.vehicle}</td>
                                        <td className="py-3 text-slate-600">{row.topCategory}</td>
                                        <td className="py-3 text-center">
                                            <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                                                {row.index}
                                            </span>
                                        </td>
                                        <td className="py-3 text-slate-600">{row.region}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Privacy Note */}
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <p className="text-xs text-emerald-700 font-medium text-center">
                        💡 Bu sayfa anonimleştirilmiş ve agregedir. Kullanıcılar arası tekil veri karıştırılmaz.
                    </p>
                </div>
            </div>
        );
    };

    // --- RETAIL ROLE VIEWS ---

    const RetailDashboardView = () => {
        const dailySales = 24500;
        const basketCount = 87;
        const topBrand = 'Bosch';
        const avgTurnoverScore = 65;

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Günlük Satış</p>
                                <h3 className="text-3xl font-bold text-slate-800">{(dailySales / 1000).toFixed(1)}K ₺</h3>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><ShoppingBag size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <ArrowUpRight size={12} className="text-emerald-500"/> %8.3 artış (Dün)
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Sepet Sayısı</p>
                                <h3 className="text-3xl font-bold text-orange-600">{basketCount}</h3>
                            </div>
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><ShoppingBag size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Ortalama Sepet: {(dailySales / basketCount).toFixed(0)} ₺</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">En Çok Satılan Marka</p>
                                <h3 className="text-3xl font-bold text-blue-600">{topBrand}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Tag size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Mağaza Favorisi</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Stok Devir Hızı</p>
                                <h3 className="text-3xl font-bold text-purple-600">{avgTurnoverScore}%</h3>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><TrendingUp size={24}/></div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Raf Stok Verimliliği</p>
                    </div>
                </div>

                {/* Insights */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-6 rounded-2xl">
                    <h3 className="font-bold text-slate-800 mb-3">💡 Mağaza İçgörüleri</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li>✓ {topBrand} ürünleriniz bu hafta %15 daha iyi performans gösterdi</li>
                        <li>✓ Servis taleplerinde %12 artış tespit edildi</li>
                        <li>✓ Stok seviyeleri optimal aralıkta</li>
                    </ul>
                </div>
            </div>
        );
    };

    const RetailOrdersView = () => {
        const retailOrders = MOCK_B2B_ORDERS.map(o => ({
            ...o,
            customer: `Servis: ${o.customer.split(' ')[0]}`
        }));

        const statusLabels: Record<string, string> = {
            'PENDING': 'BEKLİYOR',
            'PREPARING': 'HAZIR',
            'SHIPPED': 'TESLİM',
            'DELIVERED': 'SONUÇLANDI'
        };

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="font-bold text-slate-800 text-lg">Servisten Gelen Talepler</h2>
                        <p className="text-sm text-slate-500 mt-1">Son 30 günün talep listesi</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {retailOrders.map((order) => (
                            <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-slate-800">{order.customer}</span>
                                            <span className="text-xs text-slate-500">{order.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-3">
                                            Talep Kalemi: <span className="font-bold">{order.items} parça</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                order.status === 'PREPARING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                order.status === 'SHIPPED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}>
                                                {statusLabels[order.status]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-800">{(order.total / 1000).toFixed(0)}K ₺</p>
                                        <button className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-bold border-b border-orange-300 hover:border-orange-600">
                                            Detay →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const RetailPriceMarginView = () => {
        const priceData = inventory.map(item => {
            const costPrice = item.price;
            const salePrice = item.price * (
                item.segment === 'OEM' ? 1.35 :
                item.segment === 'PREMIUM' ? 1.30 :
                item.segment === 'EQUIVALENT' ? 1.20 :
                1.15
            );
            const margin = salePrice - costPrice;
            const marginPercent = ((margin / costPrice) * 100);

            return {
                sku: item.sku,
                name: item.name,
                brand: item.brand,
                costPrice,
                salePrice,
                margin,
                marginPercent,
                segment: item.segment || 'EQUIVALENT'
            };
        });

        const totalMarginPotential = priceData.reduce((sum, item) => sum + (item.margin * item.stock), 0) || 0;
        const avgMarginPercent = priceData.reduce((sum, item) => sum + item.marginPercent, 0) / priceData.length;

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-6 rounded-2xl">
                        <p className="text-xs font-bold text-emerald-700 uppercase mb-2">Toplam Potansiyel Marj</p>
                        <h3 className="text-4xl font-bold text-emerald-900">{(totalMarginPotential / 1000).toFixed(0)}K ₺</h3>
                        <p className="text-xs text-emerald-700 mt-2">Mevcut stokta</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-6 rounded-2xl">
                        <p className="text-xs font-bold text-blue-700 uppercase mb-2">Ortalama Marj %</p>
                        <h3 className="text-4xl font-bold text-blue-900">{avgMarginPercent.toFixed(1)}%</h3>
                        <p className="text-xs text-blue-700 mt-2">Ürün bazında</p>
                    </div>
                </div>

                {/* Price & Margin Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase">Ürün</th>
                                <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase">Marka</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase">Alış Fiyatı</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase">Satış Fiyatı</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase">Marj ₺</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase">Marj %</th>
                                <th className="px-6 py-4 text-center font-bold text-slate-600 uppercase">Kategori</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {priceData.map((row) => (
                                <tr key={row.sku} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{row.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{row.sku}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{row.brand}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800">{row.costPrice.toLocaleString('tr-TR')} ₺</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{row.salePrice.toLocaleString('tr-TR')} ₺</td>
                                    <td className="px-6 py-4 text-right font-bold text-orange-600">{row.margin.toLocaleString('tr-TR')} ₺</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-bold ${
                                            row.marginPercent >= 25 ? 'text-emerald-600' :
                                            row.marginPercent >= 15 ? 'text-orange-600' :
                                            'text-slate-600'
                                        }`}>
                                            {row.marginPercent.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${
                                            row.segment === 'OEM' ? 'bg-blue-100 text-blue-700' :
                                            row.segment === 'PREMIUM' ? 'bg-purple-100 text-purple-700' :
                                            row.segment === 'EQUIVALENT' ? 'bg-slate-100 text-slate-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {row.segment}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const tabs = activeRole === 'DISTRIBUTOR' 
        ? [
            { id: 'DASHBOARD', label: 'Genel Bakış' },
            { id: 'INVENTORY', label: 'Stok & Sinyaller' },
            { id: 'ORDERS', label: 'Siparişler' },
            { id: 'LOGISTICS', label: 'Lojistik' },
            { id: 'NETWORK', label: 'Bayi Ağı' },
        ]
        : [
            { id: 'DASHBOARD', label: 'Mağaza Genel Bakış' },
            { id: 'INVENTORY', label: 'Raf/Stok' },
            { id: 'ORDERS', label: 'Servisten Talepler' },
            { id: 'LOGISTICS', label: 'Tedarik Durumu' },
            { id: 'NETWORK', label: 'Fiyat & Marj' },
        ];

    const handleRoleChange = (newRole: AftermarketRole) => {
        setActiveRole(newRole);
        setActiveView('DASHBOARD');
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Aftermarket Yönetimi</h1>
                    <p className="text-sm text-slate-500 mt-2">
                        {activeRole === 'DISTRIBUTOR' 
                            ? 'Stok, sipariş, tedarik ve satış analitiği (varsayılan 30 gün)'
                            : 'Mağaza satış, servis talebi ve marj yönetimi'
                        }
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Role Switch */}
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => handleRoleChange('DISTRIBUTOR')}
                            className={`px-4 py-2 text-sm font-bold rounded transition-colors ${
                                activeRole === 'DISTRIBUTOR'
                                    ? 'bg-white text-orange-700 border border-orange-200 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            Dağıtıcı
                        </button>
                        <button
                            onClick={() => handleRoleChange('RETAIL')}
                            className={`px-4 py-2 text-sm font-bold rounded transition-colors ${
                                activeRole === 'RETAIL'
                                    ? 'bg-white text-orange-700 border border-orange-200 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            Perakende
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <Activity size={16} className="text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-700">ERP Bağlı</span>
                    </div>
                    <button className="px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-100 transition-colors">
                        Verileri Güncelle
                    </button>
                    {activeRole === 'DISTRIBUTOR' && (
                        <button className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors">
                            ERP Senkronize Et
                        </button>
                    )}
                </div>
            </div>

            {/* Mode Toggle: CANLI / GEÇMİŞ (Distributor Only) */}
            {activeRole === 'DISTRIBUTOR' && (
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setMode('LIVE')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                            mode === 'LIVE'
                            ? 'bg-orange-100 text-orange-700 border border-orange-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        CANLI
                    </button>
                    <button
                        onClick={() => setMode('HISTORY')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                            mode === 'HISTORY'
                            ? 'bg-orange-100 text-orange-700 border border-orange-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        GEÇMİŞ (30 Gün)
                    </button>
                </div>
            )}

            {/* LIVE Mode Tabs */}
            {(activeRole === 'RETAIL' || mode === 'LIVE') && (
                <>
                    <div className="flex gap-2 border-b border-slate-200 pb-0">
                        {tabs.map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveView(tab.id as RetailerSubView)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeView === tab.id
                                    ? 'border-orange-600 text-orange-600'
                                    : 'border-transparent text-slate-600 hover:text-slate-800'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <>
                        {activeRole === 'DISTRIBUTOR' ? (
                            <>
                                {activeView === 'DASHBOARD' && <DashboardView />}
                                {activeView === 'INVENTORY' && <InventoryView />}
                                {activeView === 'ORDERS' && <OrdersView />}
                                {activeView === 'LOGISTICS' && <LogisticsView />}
                                {activeView === 'NETWORK' && (
                                    <div className="h-96 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                                        <Globe size={48} className="mb-4 opacity-20" />
                                        <h3 className="text-lg font-bold text-slate-600">Global Bayi Haritası</h3>
                                        <p className="text-sm">Bu özellik bir sonraki güncellemede aktif olacaktır.</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {activeView === 'DASHBOARD' && <RetailDashboardView />}
                                {activeView === 'INVENTORY' && <InventoryView />}
                                {activeView === 'ORDERS' && <RetailOrdersView />}
                                {activeView === 'LOGISTICS' && <LogisticsView />}
                                {activeView === 'NETWORK' && <RetailPriceMarginView />}
                            </>
                        )}
                    </>
                </>
            )}

            {/* HISTORY Mode */}
            {mode === 'HISTORY' && <HistoryAnalyticsView />}
        </div>
    );
};
