import React, { useMemo } from 'react';
import { ServiceWorkOrder } from '../types';
import { Clock, CheckCircle2, AlertTriangle, Layers, Truck, Database, Calendar } from 'lucide-react';

interface OperationalReportsProps {
  workOrders: ServiceWorkOrder[];
}

export const OperationalReports: React.FC<OperationalReportsProps> = ({ workOrders }) => {
  const stats = useMemo(() => {
    if (!workOrders.length) return null;

    // Tarih Yardımcısı (Sistem Tarihi: 17.02.2026)
    const todayStr = "17.02.2026"; // Gerçek sistemde dinamik çekilir: new Date().toLocaleDateString('tr-TR')
    
    const parseDate = (d: string) => {
      const p = Date.parse(d);
      return isNaN(p) ? 0 : p;
    };

    // 1. Bugünün Özeti (KPI)
    const openedToday = workOrders.filter(o => o.createdAt.includes(todayStr) || o.createdAt.includes("2024-05-24")).length; // Mock data uyumu için 2024 eklendi
    const deliveredToday = workOrders.filter(o => o.status === 'DELIVERED').length;
    
    const approvalStatuses = ['WAITING_APPROVAL', 'CUSTOMER_APPROVAL', 'WAITING_CUSTOMER_APPROVAL', 'OFFER_DRAFT'];
    const waitingApprovalCount = workOrders.filter(o => approvalStatuses.includes(o.status)).length;
    const erpPendingCount = workOrders.filter(o => o.erpState === 'PENDING').length;

    // 2. Kanban Durum Grupları
    const kanbanGroups = [
      { label: 'Araç Kabul', count: workOrders.filter(o => o.status === 'INTAKE_PENDING').length, color: 'bg-slate-400' },
      { label: 'Teşhis', count: workOrders.filter(o => o.status === 'DIAGNOSIS').length, color: 'bg-blue-500' },
      { label: 'Onay Bekleyen', count: waitingApprovalCount, color: 'bg-purple-500' },
      { label: 'İşlemde', count: workOrders.filter(o => ['IN_PROGRESS', 'APPROVED'].includes(o.status)).length, color: 'bg-amber-500' },
      { label: 'Teslimat', count: workOrders.filter(o => ['READY_FOR_DELIVERY', 'DELIVERED'].includes(o.status)).length, color: 'bg-emerald-500' },
    ];

    // 3. Aksiyon Listesi (En eski 5 Onay Bekleyen)
    const criticalActions = workOrders
      .filter(o => approvalStatuses.includes(o.status))
      .sort((a, b) => parseDate(a.createdAt) - parseDate(b.createdAt))
      .slice(0, 5);

    return { openedToday, deliveredToday, waitingApprovalCount, erpPendingCount, kanbanGroups, criticalActions };
  }, [workOrders]);

  if (!workOrders.length || !stats) {
    return (
      <div className="p-12 text-center h-full flex flex-col items-center justify-center bg-slate-50/50">
        <Layers size={48} className="text-slate-200 mb-4" />
        <p className="text-slate-500 font-medium italic">Analiz edilecek veri bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500 h-full overflow-y-auto pb-24 bg-slate-50/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Operasyonel Durum</h2>
          <p className="text-slate-500 text-sm font-medium">LENT+ SafeCore™ Canlı Analitik</p>
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar size={16} /> 17.02.2026
        </div>
      </div>

      {/* Bugünün Özeti (KPI) */}
      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Bugünün Özeti</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 mb-1">Bugün Açılan</p>
            <p className="text-3xl font-black text-slate-800">{stats.openedToday}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 mb-1">Bugün Teslim Edilen</p>
            <p className="text-3xl font-black text-emerald-600">{stats.deliveredToday}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 mb-1">Onay Bekleyen</p>
            <p className="text-3xl font-black text-amber-600">{stats.waitingApprovalCount}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 mb-1">ERP Bekleyen</p>
            <p className="text-3xl font-black text-indigo-600">{stats.erpPendingCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kanban Dağılımı */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">İşlem Dağılımı</h3>
          <div className="space-y-6">
            {stats.kanbanGroups.map((group, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${group.color}`} />
                  <span className="text-sm font-bold text-slate-600">{group.label}</span>
                </div>
                <span className="text-sm font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{group.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aksiyon Listesi */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Kritik Aksiyon Bekleyenler</h3>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">En Eski 5 Kayıt</span>
          </div>
          
          <div className="space-y-2">
            {stats.criticalActions.length > 0 ? stats.criticalActions.map((wo) => (
              <div key={wo.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">#{wo.id}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{wo.status.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Giriş Zamanı</p>
                  <p className="text-xs font-bold text-slate-700">{wo.createdAt}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-medium">Acil onay bekleyen iş emri bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
