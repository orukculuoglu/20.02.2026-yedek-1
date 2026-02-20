
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
  Percent as PercentIcon, Tag as TagIcon
} from 'lucide-react';
import { 
  getDashboardMetricsSync, getWorkOrders, getRetailers, 
  getFleetCompanies, getExpertiseCenters, getInsuranceData, 
  getIndividualUsers, getDealers, getProductIntelligenceData,
  getServiceWorkOrders
} from '../services/dataService';
import { ViewState, ServiceWorkOrder } from '../types';
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

  const fetchDynamicData = async () => {
    const [wo, ret, fl, exp, ins, ind, dlr, intel, swo] = await Promise.all([
      getWorkOrders(), 
      getRetailers(), 
      getFleetCompanies(), 
      getExpertiseCenters(), 
      getInsuranceData(), 
      getIndividualUsers(), 
      getDealers(),
      getProductIntelligenceData(),
      getServiceWorkOrders(currentUser.institutionId)
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

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-8 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity"><WrenchIcon size={160} /></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                      <LayersIcon size={24} className="text-indigo-600" /> Bakım Merkezi - Operasyon Özeti
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 font-medium italic">Gerçek zamanlı iş emri sinyal analitiği</p>
              </div>
              <button onClick={() => onChangeView(ViewState.REPAIR_SHOPS)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2">
                  Bakım Paneline Git <ChevronRightIcon size={14} />
              </button>
          </div>
          {serviceWorkOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium italic">Henüz iş emri verisi yok.</div>
          ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors group-hover:border-indigo-100 group-hover:shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam İş Emri</p>
                      <p className="text-3xl font-black text-slate-800">{opMetrics.total}</p>
                  </div>
                  <div className="p-5 bg-amber-50/30 rounded-2xl border border-amber-100/50 group-hover:bg-white transition-colors group-hover:border-amber-200 group-hover:shadow-sm">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Onay Bekleyen</p>
                      <p className="text-3xl font-black text-amber-600">{opMetrics.approvalWaiting}</p>
                  </div>
                  <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50 group-hover:bg-white transition-colors group-hover:border-blue-200 group-hover:shadow-sm">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Teslimata Hazır</p>
                      <p className="text-3xl font-black text-blue-600">{opMetrics.readyForDelivery}</p>
                  </div>
                  <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 group-hover:bg-white transition-colors group-hover:border-indigo-200 group-hover:shadow-sm">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">ERP Bekleyen</p>
                      <p className="text-3xl font-black text-indigo-600">{opMetrics.erpPending}</p>
                  </div>
              </div>
          )}
          {serviceWorkOrders.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap items-center gap-x-10 gap-y-4 relative z-10">
                  {[
                      { label: 'Araç Kabul', key: 'INTAKE', color: 'bg-slate-400' },
                      { label: 'Teşhis', key: 'DIAGNOSIS', color: 'bg-blue-500' },
                      { label: 'Onay', key: 'APPROVAL', color: 'bg-purple-500' },
                      { label: 'İşlemde', key: 'IN_PROGRESS', color: 'bg-amber-500' },
                      { label: 'Teslimat', key: 'DELIVERY', color: 'bg-emerald-500' },
                  ].map(b => (
                      <div key={b.key} className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${b.color} shadow-sm`} />
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{b.label}:</span>
                          <span className="text-[11px] font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{opMetrics.buckets[b.key as any]}</span>
                      </div>
                  ))}
              </div>
          )}
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

                  <div className="flex justify-between items-center mb-6 pt-6 border-t border-slate-50">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <ActivityIcon size={18} className="text-blue-500" /> Aktif İş Emri Takibi
                    </h4>
                    <button onClick={() => onChangeView(ViewState.REPAIR_SHOPS)} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">Tümünü Yönet <ChevronRightIcon size={14}/></button>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3">İş Emri</th>
                        <th className="px-4 py-3">Araç</th>
                        <th className="px-4 py-3">Müşteri / Servis</th>
                        <th className="px-4 py-3">İlerleme</th>
                        <th className="px-4 py-3 text-right">Maliyet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {workOrders.map(wo => (
                        <tr key={wo.id} className="hover:bg-slate-50 transition-colors text-sm">
                          <td className="px-4 py-4 font-mono text-xs text-slate-500">{wo.id}</td>
                          <td className="px-4 py-4 font-bold text-slate-700">{wo.vehicleName}</td>
                          <td className="px-4 py-4 text-slate-600">{wo.serviceName}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full" style={{width: `${wo.progress}%`}}></div>
                              </div>
                              <span className="text-[10px] font-bold">%{wo.progress}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-slate-800">{wo.estimatedCost.toLocaleString()} ₺</td>
                        </tr>
                      ))}
                      {workOrders.length === 0 && (
                          <tr><td colSpan={5} className="py-12 text-center text-slate-400 italic">Aktif iş emri bulunmuyor.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'AFTERMARKET' && (
                <div className="animate-in slide-in-from-left-2 duration-300">
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
