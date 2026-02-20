
import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Download, Zap, Database, Server, Calendar, Loader2, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { getSubscriptionDetails, getBillingHistory } from '../services/dataService';
import { SubscriptionDetails, Invoice } from '../types';

export const Subscription: React.FC = () => {
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [subData, billData] = await Promise.all([
                getSubscriptionDetails(),
                getBillingHistory()
            ]);
            setDetails(subData);
            setInvoices(billData);
        } catch (error) {
            console.error("Failed to load subscription data");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  if (loading) {
      return (
          <div className="h-full flex items-center justify-center flex-col text-slate-400">
              <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
              <p>Paket bilgileri yükleniyor...</p>
          </div>
      );
  }

  if (!details) return null;

  const usagePercent = (used: number, total: number) => Math.min(100, (used / total) * 100);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Paket ve Kullanım</h2>
            <p className="text-slate-500 mt-1">Abonelik durumunuz, kullanım limitleriniz ve fatura geçmişiniz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Left Column: Current Plan & Usage */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Active Plan Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Mevcut Plan</p>
                        <h3 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                            {details.planName}
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide">Aktif</span>
                        </h3>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-slate-800">{details.price} {details.currency}<span className="text-sm text-slate-400 font-normal">/ay</span></p>
                        <p className="text-xs text-slate-500 mt-1">Yenilenme: {details.renewalDate}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="font-medium text-slate-600 flex items-center gap-1"><Database size={12} /> VIN Sorgusu</span>
                            <span className="text-slate-400">{details.limits.vinQueries.used.toLocaleString()} / {details.limits.vinQueries.total.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${usagePercent(details.limits.vinQueries.used, details.limits.vinQueries.total)}%`}}></div>
                        </div>
                    </div>
                    <div>
                         <div className="flex justify-between text-xs mb-2">
                            <span className="font-medium text-slate-600 flex items-center gap-1"><Zap size={12} /> API Çağrısı</span>
                            <span className="text-slate-400">{(details.limits.apiCalls.used / 1000).toFixed(0)}k / {(details.limits.apiCalls.total / 1000).toFixed(0)}k</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${usagePercent(details.limits.apiCalls.used, details.limits.apiCalls.total)}%`}}></div>
                        </div>
                    </div>
                    <div>
                         <div className="flex justify-between text-xs mb-2">
                            <span className="font-medium text-slate-600 flex items-center gap-1"><Server size={12} /> Depolama</span>
                            <span className="text-slate-400">{details.limits.storage.used} / {details.limits.storage.total} {details.limits.storage.unit}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-2 rounded-full" style={{width: `${usagePercent(details.limits.storage.used, details.limits.storage.total)}%`}}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Fatura Geçmişi</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Fatura No</th>
                            <th className="px-6 py-4">Tarih</th>
                            <th className="px-6 py-4">Tutar</th>
                            <th className="px-6 py-4">Durum</th>
                            <th className="px-6 py-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-sm text-slate-600">{inv.id}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{inv.date}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-800">{inv.amount} {inv.currency}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {inv.status === 'PAID' ? 'Ödendi' : 'Bekliyor'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <Download size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>

        {/* Right Column: Payment & Upgrade */}
        <div className="space-y-6">
            
            {/* Payment Method */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">Ödeme Yöntemi</h3>
                    <button className="text-sm text-emerald-600 font-medium hover:underline">Düzenle</button>
                </div>
                <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="w-12 h-8 bg-white border border-slate-200 rounded flex items-center justify-center">
                        <CreditCard size={20} className="text-slate-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">•••• •••• •••• {details.paymentMethod.last4}</p>
                        <p className="text-xs text-slate-500">Son Kullanma: {details.paymentMethod.expiry}</p>
                    </div>
                </div>
            </div>

            {/* Upgrade Options */}
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <Star className="text-yellow-400 fill-yellow-400" size={18} /> Enterprise Plan
                    </h3>
                    <p className="text-slate-300 text-sm mb-6">Daha yüksek limitler, özel destek ve gelişmiş API özellikleri için kurumsal plana geçin.</p>
                    
                    <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-sm text-slate-200">
                            <Check size={16} className="text-emerald-400" /> Sınırsız VIN Sorgusu
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-200">
                            <Check size={16} className="text-emerald-400" /> Dedicated API Server
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-200">
                            <Check size={16} className="text-emerald-400" /> 7/24 Öncelikli Destek
                        </li>
                    </ul>

                    <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                        Planı Yükselt <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                <ShieldCheck size={32} className="text-emerald-600 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 mb-1">Kurumsal Destek</h4>
                <p className="text-sm text-slate-500 mb-4">Özel entegrasyon ihtiyaçlarınız için teknik ekibimizle görüşün.</p>
                <button className="text-sm font-medium text-emerald-600 border border-emerald-200 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                    Satış Ekibiyle İletişime Geç
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};
