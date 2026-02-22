
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp as TrendingUpIcon, Activity as ActivityIcon, Clock as ClockIcon, 
  ArrowRight as ArrowRightIcon, Database as DatabaseIcon, Wrench as WrenchIcon, 
  ShoppingBag as ShoppingBagIcon, Briefcase as BriefcaseIcon, 
  ClipboardCheck as ClipboardCheckIcon, Shield as ShieldIcon, 
  User as UserIcon, Store as StoreIcon, ChevronRight as ChevronRightIcon, 
  ExternalLink as ExternalLinkIcon, Box as BoxIcon, Truck as TruckIcon, 
  AlertTriangle as AlertTriangleIcon, Brain as BrainIcon, Target as TargetIcon, 
  DollarSign as DollarSignIcon, Building2 as Building2Icon,
  Layers as LayersIcon, Package as PackageIcon, ShieldCheck as ShieldCheckIcon,
  Percent as PercentIcon, Tag as TagIcon, Car, Loader2 as Loader2Icon, MapPin
} from 'lucide-react';
import { 
  getDashboardMetricsSync, getWorkOrders, getRetailers, 
  getFleetCompanies, getExpertiseCenters, getInsuranceData, 
  getIndividualUsers, getDealers, getProductIntelligenceData,
  getServiceWorkOrders, getTopPartBrandsFromWorkOrders, getTopVehiclesByConsumptionFromWorkOrders,
  getAftermarketHistory30d, getNationalBehaviorSummary, NationalBehaviorSummary
} from '../services/dataService';
import { ViewState, ServiceWorkOrder, AftermarketHistory30d } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import { computeOperationalMetrics } from '../utils/operationalMetrics';
import { computeRepairRevenueIntel } from '../utils/repairRevenueIntel';
import { getCurrentUserSecurity } from '../services/securityService';
import { REPAIR_WORKORDERS_FEED_KEY } from './RepairShops';

interface DashboardProps {
    onChangeView: (view: ViewState, id?: string) => void;
}

type TabType = 'REPAIR' | 'AFTERMARKET' | 'FLEET' | 'EXPERTISE' | 'INSURANCE' | 'INDIVIDUAL' | 'DEALERS' | 'PRODUCT_INTEL';

export const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const dashboardMetrics = getDashboardMetricsSync();
  const currentUser = getCurrentUserSecurity();
  const [activeTab, setActiveTab] = useState<TabType>('REPAIR');
  
  // Data States
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [serviceWorkOrders, setServiceWorkOrders] = useState<ServiceWorkOrder[]>([]);
  const [repairSourceData, setRepairSourceData] = useState<ServiceWorkOrder[]>([]);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [expertise, setExpertise] = useState<any[]>([]);
  const [insurance, setInsurance] = useState<any[]>([]);
  const [individuals, setIndividuals] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [productIntel, setProductIntel] = useState<any>(null);
  const [topPartBrands, setTopPartBrands] = useState<any[]>([]);
  const [topVehicleConsumption, setTopVehicleConsumption] = useState<any[]>([]);
  const [aftermarketHistory30d, setAftermarketHistory30d] = useState<AftermarketHistory30d | null>(null);
  const [loadingAftermarket, setLoadingAftermarket] = useState(false);
  const [nationalBehavior, setNationalBehavior] = useState<NationalBehaviorSummary | null>(null);
  const [loadingNationalBehavior, setLoadingNationalBehavior] = useState(false);
  const [nationalBehaviorDays, setNationalBehaviorDays] = useState(30);
  const [nationalBehaviorCity, setNationalBehaviorCity] = useState<string | undefined>(undefined);

  const fetchDynamicData = async () => {
    const [wo, ret, fl, exp, ins, ind, dlr, intel, swo, topBrands, topVehicles] = await Promise.all([
      getWorkOrders(), 
      getRetailers(), 
      getFleetCompanies(), 
      getExpertiseCenters(), 
      getInsuranceData(), 
      getIndividualUsers(), 
      getDealers(),
      getProductIntelligenceData(),
      getServiceWorkOrders(currentUser.institutionId),
      getTopPartBrandsFromWorkOrders(),
      getTopVehiclesByConsumptionFromWorkOrders()
    ]);
    setWorkOrders(wo);
    setRetailers(ret);
    setFleet(fl);
    setExpertise(exp);
    setInsurance(ins);
    setIndividuals(ind);
    setDealers(dlr);
    setProductIntel(intel);
    setServiceWorkOrders(swo);
    setTopPartBrands(topBrands);
    setTopVehicleConsumption(topVehicles);

    // 17.02.2026 - Ekonomik Zeka için ham kalemli feed'i oku
    const rawFeed = localStorage.getItem(REPAIR_WORKORDERS_FEED_KEY);
    if (rawFeed) {
      try { setRepairSourceData(JSON.parse(rawFeed)); } catch(e) {}
    }
  };

  useEffect(() => {
    fetchDynamicData();

    // 17.02.2026 - Canlı Feed Dinleyicisi
    const handleFeedUpdate = () => {
        fetchDynamicData();
    };

    window.addEventListener('REPAIR_DASH_FEED_UPDATED', handleFeedUpdate);
    return () => window.removeEventListener('REPAIR_DASH_FEED_UPDATED', handleFeedUpdate);
  }, [currentUser.institutionId]);

  // Fetch Aftermarket 30-day history when tab is active
  useEffect(() => {
    if (activeTab === 'AFTERMARKET') {
      setLoadingAftermarket(true);
      getAftermarketHistory30d().then(data => {
        setAftermarketHistory30d(data);
        setLoadingAftermarket(false);
      });

      // Fetch national behavior data
      setLoadingNationalBehavior(true);
      getNationalBehaviorSummary({ days: nationalBehaviorDays, city: nationalBehaviorCity }).then(data => {
        setNationalBehavior(data);
        setLoadingNationalBehavior(false);
      });
    }
  }, [activeTab, nationalBehaviorDays, nationalBehaviorCity]);

  const opMetrics = computeOperationalMetrics(serviceWorkOrders);
  const repairIntel = computeRepairRevenueIntel(repairSourceData);

  const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all border-b-2 ${
        activeTab === id 
          ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' 
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  const AftermarketSummarySection = () => {
    if (loadingAftermarket || !aftermarketHistory30d) {
      return (
        <div className="flex items-center justify-center h-96 text-slate-400">
          <Loader2Icon size={32} className="animate-spin" />
        </div>
      );
    }

    const kpis = [
      { label: '30 Gün Ciro', value: `₺${(aftermarketHistory30d.kpis.revenue30d / 1000).toFixed(0)}K`, icon: ShoppingBagIcon, color: 'blue' },
      { label: '30 Gün Sipariş', value: aftermarketHistory30d.kpis.orders30d, icon: ClipboardCheckIcon, color: 'orange' },
      { label: 'Stok Devir Endeksi', value: aftermarketHistory30d.kpis.turnoverIndex.toFixed(1), icon: TrendingUpIcon, color: 'emerald' },
      { label: 'İade Oranı (%)', value: aftermarketHistory30d.kpis.returnRate.toFixed(1), icon: AlertTriangleIcon, color: 'rose' }
    ];

    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-100',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      rose: 'bg-rose-50 text-rose-600 border-rose-100'
    };

    return (
      <div className="space-y-6 mb-8">
        <div>
          <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
            <BoxIcon size={18} className="text-orange-500" /> Aftermarket Özet (30 Gün)
          </h4>
          <p className="text-xs text-slate-500">Anonim agregasyon • kullanıcılar arası veri karıştırılmaz</p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            const bgColor = colorMap[kpi.color as keyof typeof colorMap];
            return (
              <div key={idx} className={`p-4 rounded-xl border ${bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold opacity-70 uppercase">{kpi.label}</p>
                    <p className="text-xl font-bold mt-2">{kpi.value}</p>
                  </div>
                  <Icon size={20} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 2 Column Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Brands */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <h5 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <TagIcon size={14} className="text-orange-500" /> En Çok Satılan Markalar (Top 5)
            </h5>
            <div className="space-y-2">
              {aftermarketHistory30d.topBrands.map((brand, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{brand.name}</span>
                  <span className="font-bold text-orange-600">₺{(brand.value / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <h5 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <LayersIcon size={14} className="text-blue-500" /> En Çok Satılan Kategoriler (Top 5)
            </h5>
            <div className="space-y-2">
              {aftermarketHistory30d.topCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{cat.name}</span>
                  <span className="font-bold text-blue-600">₺{(cat.value / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mini Vehicle Table */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <h5 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <Car size={14} className="text-slate-600" /> Araç Tüketim (Top 5)
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-2 font-bold text-slate-600">Araç</th>
                  <th className="text-left py-2 font-bold text-slate-600">Kategori</th>
                  <th className="text-center py-2 font-bold text-slate-600">Endeks</th>
                  <th className="text-left py-2 font-bold text-slate-600">Şehir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aftermarketHistory30d.topVehicleConsumption.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 font-medium text-slate-800">{row.vehicle}</td>
                    <td className="py-2 text-slate-600">{row.topCategory}</td>
                    <td className="py-2 text-center">
                      <span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold">
                        {row.index}
                      </span>
                    </td>
                    <td className="py-2 text-slate-600">{row.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
          <p className="text-xs text-emerald-700 font-medium text-center">
            💡 Bu veriler anonimleştirilmiş ve agregedir. Tekil kullanıcı bilgisi içermez.
          </p>
        </div>
      </div>
    );
  };

  const ProductIntelligenceView = () => {
      if (!productIntel) return <div className="p-8 text-center text-slate-400">Veriler Yükleniyor...</div>;
      return (
          <div className="animate-in slide-in-from-right-4 duration-300 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Toplam AI Sorgusu</p>
                          <h3 className="text-2xl font-bold text-slate-800">32.4K</h3>
                      </div>
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><BrainIcon size={24}/></div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Başarılı İşlem</p>
                          <h3 className="text-2xl font-bold text-emerald-600">%99.2</h3>
                      </div>
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TargetIcon size={24}/></div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Aylık Toplam Gelir</p>
                          <h3 className="text-2xl font-bold text-slate-800">1.2M ₺</h3>
                      </div>
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><DollarSignIcon size={24}/></div>
                  </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <BrainIcon size={18} className="text-purple-500" />
                          Hangi AI Çıktısı Daha Çok Kullanılıyor?
                      </h4>
                      <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={productIntel.aiUsage} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                  <XAxis type="number" hide />
                                  <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11, fill: '#64748b'}} />
                                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} name="Sorgu Sayısı" />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <DollarSignIcon size={18} className="text-emerald-500" />
                          Hangi Modül Daha Çok Kazandırıyor?
                      </h4>
                      <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="h-64 w-full md:w-1/2">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Pie data={productIntel.revenueByModule} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="revenue">
                                          {productIntel.revenueByModule.map((entry: any, index: number) => (
                                              <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} />
                                          ))}
                                      </Pie>
                                      <Tooltip />
                                  </PieChart>
                              </ResponsiveContainer>
                          </div>
                          <div className="w-full md:w-1/2 space-y-3">
                              {productIntel.revenueByModule.map((item: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center text-sm">
                                      <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][i % 4]}}></div>
                                          <span className="text-slate-600">{item.name}</span>
                                      </div>
                                      <span className="font-bold text-slate-800">{item.percentage}%</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sistem Genel Bakış</h2>
          <p className="text-slate-500 text-sm mt-1">LENT+ SafeCore™ ekosistemindeki anlık operasyonel veriler.</p>
        </div>
        <div className="text-sm font-medium text-slate-400 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
          Son Senkronizasyon: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Aylık VIN Sorgu</p>
                    <h3 className="text-3xl font-bold text-slate-800">{dashboardMetrics.monthlyVinUsage.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DatabaseIcon size={24} /></div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '74%' }}></div>
            </div>
            <p className="text-xs text-slate-500 font-medium">Limit: {dashboardMetrics.usageLimit.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Eşleşen Parça</p>
                    <h3 className="text-3xl font-bold text-emerald-600">{dashboardMetrics.matchedParts.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ActivityIcon size={24} /></div>
            </div>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><TrendingUpIcon size={14} /> %12 Artış (Bu Hafta)</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Süre Kazancı</p>
                    <h3 className="text-3xl font-bold text-amber-600">{dashboardMetrics.timeSavedHours} Saat</h3>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><ClockIcon size={24} /></div>
            </div>
             <p className="text-xs text-slate-500 font-medium">SafeCore™ Katalog hızı ile kazanılan zaman</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="bg-slate-50/50 border-b border-slate-200 flex flex-wrap scrollbar-hide overflow-x-auto">
          <TabButton id="REPAIR" label="Bakım Merkezi" icon={WrenchIcon} />
          <TabButton id="AFTERMARKET" label="Aftermarket" icon={ShoppingBagIcon} />
          <TabButton id="FLEET" label="Filo Kiralama" icon={BriefcaseIcon} />
          <TabButton id="EXPERTISE" label="Ekspertiz" icon={ClipboardCheckIcon} />
          <TabButton id="INSURANCE" label="Sigorta (SBM)" icon={ShieldIcon} />
          <TabButton id="INDIVIDUAL" label="Bireysel" icon={UserIcon} />
          <TabButton id="DEALERS" label="Galericiler" icon={StoreIcon} />
          <TabButton id="PRODUCT_INTEL" label="Ürün Zekası" icon={BrainIcon} />
        </div>

        <div className="p-6 flex-1">
          {activeTab === 'PRODUCT_INTEL' ? (
              <ProductIntelligenceView />
          ) : (
            <>
              {activeTab === 'REPAIR' && (
                <div className="animate-in slide-in-from-left-2 duration-300">
                  
                  {/* EKONOMIK OZET KARTI */}
                  <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1 bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUpIcon size={80} /></div>
                          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-6">Ekonomik Zeka</h4>
                          <div className="space-y-4 relative z-10">
                              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Toplam Ciro</span>
                                  <span className="text-xl font-black">{repairIntel.revenueTotal.toLocaleString('tr-TR')} ₺</span>
                              </div>
                              <div className="flex justify-between items-end border-b border-white/10 pb-3">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tahmini Kâr</span>
                                  <span className="text-xl font-black text-emerald-400">{repairIntel.profitTotal.toLocaleString('tr-TR')} ₺</span>
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Genel Marj</span>
                                  <span className={`px-2 py-1 rounded-lg font-black text-xs border ${
                                      repairIntel.marginPct >= 20 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                                      repairIntel.marginPct >= 10 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 
                                      'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                  }`}>
                                      %{repairIntel.marginPct.toFixed(1)}
                                  </span>
                              </div>
                          </div>
                          <div className="mt-6 flex items-center gap-4 text-[10px] font-bold text-slate-500 border-t border-white/5 pt-4">
                              <span className="flex items-center gap-1"><PackageIcon size={12}/> {repairIntel.partItems} Parça</span>
                              <span className="flex items-center gap-1"><WrenchIcon size={12}/> {repairIntel.laborItems} İşçilik</span>
                          </div>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <TagIcon size={14} className="text-indigo-600"/> En Kârlı Markalar
                          </h4>
                          <div className="space-y-3">
                              {repairIntel.topBrandsByProfit.map((b, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                      <div className="flex items-center gap-3">
                                          <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg text-[10px] font-black text-slate-500">{i+1}</span>
                                          <span className="text-xs font-bold text-slate-700">{b.brand}</span>
                                      </div>
                                      <div className="text-right">
                                          <span className="text-xs font-black text-slate-900">{b.profit.toLocaleString('tr-TR')} ₺</span>
                                          <span className="block text-[8px] font-bold text-emerald-600 uppercase">%{b.marginPct.toFixed(0)} Marj</span>
                                      </div>
                                  </div>
                              ))}
                              {repairIntel.topBrandsByProfit.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">Veri yok</p>}
                          </div>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <LayersIcon size={14} className="text-blue-600"/> Popüler Kategoriler
                          </h4>
                          <div className="space-y-3">
                              {repairIntel.topCategoriesByItems.map((c, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                      <span className="text-xs font-bold text-slate-700">{c.category}</span>
                                      <div className="flex items-center gap-3">
                                          <span className="text-[10px] font-black text-slate-400 uppercase">{c.items} Adet</span>
                                          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                              <div className="bg-blue-500 h-full" style={{width: `${Math.min(100, (c.items/10)*100)}%`}}></div>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                              {repairIntel.topCategoriesByItems.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">Veri yok</p>}
                          </div>
                      </div>
                  </div>

                  {/* Bakım Merkezi Verileri Kartı - Son 30 Gün */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mt-8">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-2">
                        <WrenchIcon size={24} className="text-indigo-600" /> Bakım Merkezi Verileri
                      </h3>
                      <p className="text-xs text-slate-500">Son 30 gün içinde kayıtlı veriler</p>
                    </div>

                    {/* Top 10 Başlık */}
                    {repairSourceData.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm italic">Henüz iş emri verisi yok.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* En Çok Ürün Satan Markalar */}
                        <div className="border border-slate-100 rounded-lg p-5 bg-slate-50/30">
                          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <BoxIcon size={16} className="text-orange-500" /> En Çok Ürün Satan Markalar (Top 10)
                          </h4>
                          {(() => {
                            const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                            const filtered = repairSourceData.filter(w => {
                              try {
                                const wDate = new Date(w.createdAt);
                                return wDate >= last30Days;
                              } catch {
                                return true;
                              }
                            });

                            const brandRevenue: Record<string, { count: number; revenue: number }> = {};
                            filtered.forEach(w => {
                              w.diagnosisItems?.forEach(item => {
                                const brand = item.item || 'Bilinmeyen';
                                if (!brandRevenue[brand]) {
                                  brandRevenue[brand] = { count: 0, revenue: 0 };
                                }
                                brandRevenue[brand].count += 1;
                                brandRevenue[brand].revenue += item.signalCost || 0;
                              });
                            });

                            const topBrands = Object.entries(brandRevenue)
                              .sort((a, b) => b[1].revenue - a[1].revenue)
                              .slice(0, 10)
                              .map(([brand, data]) => ({ brand, ...data }));

                            return topBrands.length > 0 ? (
                              <div className="space-y-2">
                                {topBrands.map((item, i) => (
                                  <div key={item.brand} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-2 flex-1">
                                      <span className="w-5 h-5 flex items-center justify-center bg-orange-100 rounded font-bold text-orange-600 text-[9px]">{i+1}</span>
                                      <span className="text-slate-700 font-medium">{item.brand}</span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[10px] text-slate-500">{item.count} Adet</p>
                                      <p className="font-bold text-orange-600">{item.revenue.toLocaleString('tr-TR', {maximumFractionDigits: 0})} ₺</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic text-center py-4">Veri yok</p>
                            );
                          })()}
                        </div>

                        {/* En Çok Satılan Kategoriler */}
                        <div className="border border-slate-100 rounded-lg p-5 bg-slate-50/30">
                          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <LayersIcon size={16} className="text-blue-500" /> En Çok Satılan Kategoriler (Top 10)
                          </h4>
                          {(() => {
                            const ITEM_CATEGORY_MAP: Record<string, string> = {
                              "Fren Balatası": "Fren",
                              "Triger Seti": "Motor",
                              "Yağ Bakımı": "Bakım",
                              "Lastik Değişimi": "Lastik",
                              "Disk Fren": "Fren",
                              "Motor Yağı": "Bakım",
                              "Filtru": "Bakım",
                              "Pil": "Elektrik",
                              "Şamandıra": "Elektrik",
                            };

                            const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                            const filtered = repairSourceData.filter(w => {
                              try {
                                const wDate = new Date(w.createdAt);
                                return wDate >= last30Days;
                              } catch {
                                return true;
                              }
                            });

                            const categoryRevenue: Record<string, { count: number; revenue: number }> = {};
                            filtered.forEach(w => {
                              w.diagnosisItems?.forEach(item => {
                                const category = ITEM_CATEGORY_MAP[item.item] || 'Diğer';
                                if (!categoryRevenue[category]) {
                                  categoryRevenue[category] = { count: 0, revenue: 0 };
                                }
                                categoryRevenue[category].count += 1;
                                categoryRevenue[category].revenue += item.signalCost || 0;
                              });
                            });

                            const topCategories = Object.entries(categoryRevenue)
                              .sort((a, b) => b[1].revenue - a[1].revenue)
                              .slice(0, 10)
                              .map(([category, data]) => ({ category, ...data }));

                            return topCategories.length > 0 ? (
                              <div className="space-y-2">
                                {topCategories.map((item, i) => (
                                  <div key={item.category} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-2 flex-1">
                                      <span className="w-5 h-5 flex items-center justify-center bg-blue-100 rounded font-bold text-blue-600 text-[9px]">{i+1}</span>
                                      <span className="text-slate-700 font-medium">{item.category}</span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[10px] text-slate-500">{item.count} Adet</p>
                                      <p className="font-bold text-blue-600">{item.revenue.toLocaleString('tr-TR', {maximumFractionDigits: 0})} ₺</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic text-center py-4">Veri yok</p>
                            );
                          })()}
                        </div>

                        {/* En Çok Bakıma Giren Araçlar */}
                        <div className="border border-slate-100 rounded-lg p-5 bg-slate-50/30">
                          <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Car size={16} className="text-teal-500" /> En Çok Bakıma Giren Araçlar (Top 10)
                          </h4>
                          {(() => {
                            const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                            const filtered = repairSourceData.filter(w => {
                              try {
                                const wDate = new Date(w.createdAt);
                                return wDate >= last30Days;
                              } catch {
                                return true;
                              }
                            });

                            const vehicleCount: Record<string, number> = {};
                            filtered.forEach(w => {
                              const vehicle = w.operationalDetails?.plate || 'Bilinmeyen Araç';
                              vehicleCount[vehicle] = (vehicleCount[vehicle] || 0) + 1;
                            });

                            const topVehicles = Object.entries(vehicleCount)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 10)
                              .map(([vehicle, count]) => ({ vehicle, count }));

                            return topVehicles.length > 0 ? (
                              <div className="space-y-2">
                                {topVehicles.map((item, i) => (
                                  <div key={item.vehicle} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                                    <div className="flex items-center gap-2 flex-1">
                                      <span className="w-5 h-5 flex items-center justify-center bg-teal-100 rounded font-bold text-teal-600 text-[9px]">{i+1}</span>
                                      <span className="text-slate-700 font-medium font-mono">{item.vehicle}</span>
                                    </div>
                                    <p className="font-bold text-teal-600">{item.count} İş Emri</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic text-center py-4">Veri yok</p>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'AFTERMARKET' && (
                <div className="animate-in slide-in-from-left-2 duration-300 space-y-6">
                  <AftermarketSummarySection />
                  
                  {/* National Behavior Statistics Block */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-100 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <BrainIcon size={20} className="text-blue-600" /> 
                        Ulusal Davranış İstatistiği (Anonim) — Son 30 Gün
                      </h3>
                      <p className="text-[10px] text-slate-500 italic">💡 Bu veri Dashboard'da gösterilir, kullanıcıya gösterilmez</p>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex gap-4 items-end bg-white p-4 rounded-xl border border-blue-100">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Zaman Aralığı</label>
                        <select 
                          value={nationalBehaviorDays}
                          onChange={(e) => setNationalBehaviorDays(parseInt(e.target.value))}
                          className="px-3 py-2 border border-blue-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500/30"
                        >
                          <option value={7}>Son 7 Gün</option>
                          <option value={30}>Son 30 Gün (Default)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase block mb-2">Şehir (Opsiyonel)</label>
                        <select 
                          value={nationalBehaviorCity || ''}
                          onChange={(e) => setNationalBehaviorCity(e.target.value || undefined)}
                          className="px-3 py-2 border border-blue-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500/30"
                        >
                          <option value="">Tümü</option>
                          <option value="İstanbul">İstanbul</option>
                          <option value="Ankara">Ankara</option>
                          <option value="İzmir">İzmir</option>
                          <option value="Bursa">Bursa</option>
                          <option value="Gaziantep">Gaziantep</option>
                          <option value="Antalya">Antalya</option>
                        </select>
                      </div>
                    </div>

                    {loadingNationalBehavior ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2Icon size={24} className="animate-spin text-blue-500" />
                      </div>
                    ) : nationalBehavior ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Districts */}
                        <div className="bg-white p-4 rounded-xl border border-blue-100">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <MapPin size={16} className="text-blue-600" /> En Çok Tüketim: Şehir/İlçe
                          </h4>
                          <div className="space-y-2">
                            {nationalBehavior.topDistricts.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100">
                                <span className="text-sm font-medium text-slate-700">{item.district}, {item.city}</span>
                                <span className="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Part Brands */}
                        <div className="bg-white p-4 rounded-xl border border-blue-100">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <TagIcon size={16} className="text-blue-600" /> En Çok Kullanılan Parça Markası
                          </h4>
                          <div className="space-y-2">
                            {nationalBehavior.topBrands.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100">
                                <span className="text-sm font-medium text-slate-700">{item.brand}</span>
                                <span className="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Vehicles */}
                        <div className="bg-white p-4 rounded-xl border border-blue-100">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Car size={16} className="text-blue-600" /> En Çok İşlem Gören Araç
                          </h4>
                          <div className="space-y-2">
                            {nationalBehavior.topVehicles.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100">
                                <span className="text-sm font-medium text-slate-700">{item.brand} {item.model}</span>
                                <span className="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Categories */}
                        <div className="bg-white p-4 rounded-xl border border-blue-100">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <BoxIcon size={16} className="text-blue-600" /> En Çok Satılan Kategori
                          </h4>
                          <div className="space-y-2">
                            {nationalBehavior.topCategories.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-100">
                                <span className="text-sm font-medium text-slate-700">{item.category}</span>
                                <span className="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        <p className="text-sm">Veri yüklemeye çalışılıyor...</p>
                      </div>
                    )}

                    {/* Stats Summary */}
                    {nationalBehavior && (
                      <div className="mt-4 pt-4 border-t border-blue-100 flex justify-between items-center text-xs text-slate-600">
                        <span>Toplam İşlem: <span className="font-bold text-slate-800">{nationalBehavior.totalEvents}</span></span>
                        <span className="italic">Dönem: {nationalBehavior.period}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <BoxIcon size={18} className="text-orange-500" /> Parça Tedarik Zinciri
                    </h4>
                    <button onClick={() => onChangeView(ViewState.RETAILERS)} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">Aftermarket Paneli <ChevronRightIcon size={14}/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {retailers.map(r => (
                      <div key={r.id} className="p-4 border border-slate-100 rounded-xl hover:border-emerald-200 transition-colors flex justify-between items-center bg-slate-50/30">
                        <div><p className="font-bold text-slate-800">{r.name}</p><p className="text-xs text-slate-500 mt-1">{r.city} • {r.type}</p></div>
                        <div className="text-right"><p className="text-sm font-bold text-emerald-600">{r.inventoryCount.toLocaleString()}</p><p className="text-[10px] text-slate-400">Kalem Stok</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'FLEET' && (
                <div className="animate-in slide-in-from-left-2 duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <BriefcaseIcon size={18} className="text-purple-500" /> Kurumsal Filo Doluluk
                    </h4>
                    <button onClick={() => onChangeView(ViewState.FLEET_RENTAL)} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">Filo Detayları <ChevronRightIcon size={14}/></button>
                  </div>
                  <div className="space-y-4">
                    {fleet.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold">{c.name.charAt(0)}</div>
                          <div><p className="text-sm font-bold text-slate-800">{c.name}</p><p className="text-xs text-slate-500">{c.region} • {c.fleetSize.toLocaleString()} Araç</p></div>
                        </div>
                        <div className="text-center"><p className="text-[10px] font-bold text-slate-400 uppercase">Doluluk</p><p className="text-sm font-bold text-emerald-600">%{c.occupancyRate}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'INSURANCE' && (
                <div className="animate-in slide-in-from-left-2 duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <ShieldIcon size={18} className="text-emerald-500" /> SBM Poliçe & Hasar Sorgu
                    </h4>
                    <button onClick={() => onChangeView(ViewState.INSURANCE)} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">SBM Entegrasyonu <ChevronRightIcon size={14}/></button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {insurance.map(p => (
                      <div key={p.id} className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-lg flex flex-col items-center justify-center font-mono"><span className="text-[10px] opacity-60">TR</span><span className="font-bold text-sm">{p.plate.split(' ')[0]}</span></div>
                          <div><p className="text-sm font-bold">{p.policyType} Poliçesi</p><p className="text-xs text-slate-400">Bitiş: {p.endDate}</p></div>
                        </div>
                        <div className="text-right"><p className="text-[10px] text-slate-400 font-bold uppercase">Risk Skoru</p><p className={`text-sm font-bold ${p.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>{p.riskScore}/100</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {activeTab !== 'PRODUCT_INTEL' && (
            <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center"><TruckIcon size={18} /></div>
                <p className="text-xs font-medium">Lojistik Birimi: <span className="text-emerald-400">4 adet</span> parça sevkiyatı yolda.</p>
              </div>
              <button className="text-xs font-bold hover:underline">Sevkiyat Panelini Aç</button>
            </div>
        )}
      </div>
    </div>
  );
};
