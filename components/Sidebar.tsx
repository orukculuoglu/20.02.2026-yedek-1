import React from 'react';
import { LayoutDashboard, Car, Database, Settings, ShieldCheck, History, Box, FileText, Wrench, Users, ShoppingBag, ClipboardCheck, Shield, User, Store, Component, Briefcase, Scale, PieChart, Cpu } from 'lucide-react';
import { ViewState, SystemPermission } from '../types';
import { getCurrentUserSecurity } from '../services/securityService';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const currentUser = getCurrentUserSecurity();
  
  const hasPermission = (p: SystemPermission) => currentUser.permissions.includes(p);

  const navClass = (view: ViewState) => 
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer mb-1 ${
      currentView === view 
        ? 'bg-emerald-50 text-emerald-700' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-30 flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
          <Car size={18} />
        </div>
        <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">LENT+</h1>
            <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-wider">SafeCore System</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        
        {/* PLATFORM YONETIMI */}
        <div className="mb-6">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Platform Yönetimi</p>
            {hasPermission(SystemPermission.READ_DASHBOARD) && (
                <>
                    <div onClick={() => onChangeView(ViewState.DASHBOARD)} className={navClass(ViewState.DASHBOARD)}>
                        <LayoutDashboard size={18} /> Dashboard
                    </div>
                    <div onClick={() => onChangeView(ViewState.MANAGER_PANEL)} className={navClass(ViewState.MANAGER_PANEL)}>
                        <PieChart size={18} /> Yönetici Konsolu
                    </div>
                </>
            )}
             {hasPermission(SystemPermission.MANAGE_USERS) && (
                <div onClick={() => onChangeView(ViewState.USERS)} className={navClass(ViewState.USERS)}>
                    <Users size={18} /> Kullanıcı Yönetimi
                </div>
             )}
        </div>

        {/* EKOSISTEM */}
        {hasPermission(SystemPermission.ACCESS_ECOSYSTEM) && (
            <div className="mb-6">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Ekosistem & Paydaşlar</p>
                <div onClick={() => onChangeView(ViewState.REPAIR_SHOPS)} className={navClass(ViewState.REPAIR_SHOPS)}>
                    <Wrench size={18} /> Bakım Merkezi
                </div>
                <div onClick={() => onChangeView(ViewState.RETAILERS)} className={navClass(ViewState.RETAILERS)}>
                    <ShoppingBag size={18} /> Aftermarket Yönetimi
                </div>
                <div onClick={() => onChangeView(ViewState.FLEET_RENTAL)} className={navClass(ViewState.FLEET_RENTAL)}>
                    <Briefcase size={18} /> Filo Kiralama
                </div>
                <div onClick={() => onChangeView(ViewState.EXPERTISE)} className={navClass(ViewState.EXPERTISE)}>
                    <ClipboardCheck size={18} /> Oto Ekspertiz
                </div>
                <div onClick={() => onChangeView(ViewState.INSURANCE)} className={navClass(ViewState.INSURANCE)}>
                    <Shield size={18} /> Sigorta (SBM)
                </div>
                <div onClick={() => onChangeView(ViewState.INDIVIDUAL)} className={navClass(ViewState.INDIVIDUAL)}>
                    <User size={18} /> Bireysel Kullanıcı
                </div>
                <div onClick={() => onChangeView(ViewState.DEALERS)} className={navClass(ViewState.DEALERS)}>
                    <Store size={18} /> Oto Galericiler
                </div>
            </div>
        )}

        {/* VERI VE ANALIZ */}
        <div className="mb-6">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Veri & Analiz</p>
            {hasPermission(SystemPermission.READ_LIBRARY) && (
                <div onClick={() => onChangeView(ViewState.LIBRARY)} className={navClass(ViewState.LIBRARY)}>
                    <Database size={18} /> Araç Kütüphanesi
                </div>
            )}
            <div onClick={() => onChangeView(ViewState.SPARE_PARTS)} className={navClass(ViewState.SPARE_PARTS)}>
                <Component size={18} /> Yedek Parça
            </div>
            <div onClick={() => onChangeView(ViewState.PART_LIFE_ANALYSIS)} className={navClass(ViewState.PART_LIFE_ANALYSIS)}>
                <Box size={18} /> Parça Ömrü
            </div>
            <div onClick={() => onChangeView(ViewState.RISK_ANALYSIS)} className={navClass(ViewState.RISK_ANALYSIS)}>
                <ShieldCheck size={18} /> Risk Analizi
            </div>
            <div onClick={() => onChangeView(ViewState.DATA_ENGINE)} className={navClass(ViewState.DATA_ENGINE)}>
                <Cpu size={18} /> Veri Motoru
            </div>
        </div>

        {/* SISTEM */}
        <div>
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sistem</p>
            {hasPermission(SystemPermission.ACCESS_FINANCE) && (
                <div onClick={() => onChangeView(ViewState.SUBSCRIPTION)} className={navClass(ViewState.SUBSCRIPTION)}>
                    <FileText size={18} /> Paket ve Kullanım
                </div>
            )}
            <div onClick={() => onChangeView(ViewState.KVKK)} className={navClass(ViewState.KVKK)}>
                <Scale size={18} /> KVKK Metni & Uyum
            </div>
            {hasPermission(SystemPermission.MANAGE_SYSTEM) && (
                <div onClick={() => onChangeView(ViewState.SETTINGS)} className={navClass(ViewState.SETTINGS)}>
                    <Settings size={18} /> LENT+ Kontrol Merkezi
                </div>
            )}
        </div>

      </nav>
    </aside>
  );
};