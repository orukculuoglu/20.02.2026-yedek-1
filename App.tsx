

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VinInputModal } from './components/VinInputModal';
import { Dashboard } from './views/Dashboard';
import { VehicleList } from './views/VehicleList';
import { VehicleDetail } from './views/VehicleDetail';
import { UsageHistory } from './views/UsageHistory';
import { Settings } from './views/Settings';
import { PartLifeAnalysis } from './views/PartLifeAnalysis';
import { RiskAnalysis } from './views/RiskAnalysis';
import { DataEngine } from './views/DataEngine';
import B2BNetwork from './views/B2BNetwork';
import { SpareParts } from './views/SpareParts';
import { Subscription } from './views/Subscription';
import { UserManagement } from './views/UserManagement';
import { RepairShops } from './views/RepairShops';
import { Retailers } from './views/Retailers';
import { FleetRental } from './views/FleetRental'; 
import { ExpertiseCenters } from './views/ExpertiseCenters';
import { InsuranceCenter } from './views/InsuranceCenter';
import { IndividualUsers } from './views/IndividualUsers';
import { AutoDealers } from './views/AutoDealers';
import { ManagerPanel } from './views/ManagerPanel';
import { Kvkk } from './views/Kvkk';
import { ViewState } from './types';
import { Plus, ShieldAlert, Lock, EyeOff, ShieldBan, MonitorX } from 'lucide-react';
import { logSecurityEvent, checkQueryLimit } from './services/securityService';
// Fix: Use consistent lowercase casing for erpWorker to resolve casing conflict
import { startERPWorker } from './services/erp/erpWorker';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isVinModalOpen, setIsVinModalOpen] = useState(false);
  const [securityOverlay, setSecurityOverlay] = useState(false);
  
  const workerStarted = useRef(false);

  /**
   * ENTERPRISE ERP SYNC WORKER
   */
  useEffect(() => {
    if (!workerStarted.current) {
      console.info("[SYSTEM] Starting Global ERP Sync Worker...");
      const stopWorker = startERPWorker();
      workerStarted.current = true;
      return () => {
        stopWorker();
        workerStarted.current = false;
      };
    }
  }, []);

  /**
   * DATA LEAK PROTECTION
   * 1. Detect PrintScreen
   * 2. Detect Tab Focus Change (Anti-Recording)
   */
  useEffect(() => {
    const handleKeyDetection = (e: KeyboardEvent) => {
        if (e.key === 'PrintScreen' || e.keyCode === 44) {
            logSecurityEvent('SCREEN_CAPTURE', 'CRITICAL', 'Kullanıcı PrintScreen komutu ile ekran görüntüsü almaya çalıştı.');
            alert('GÜVENLİK İHLALİ: SafeCore™ dökümanları kopyalanamaz. Eyleminiz zaman ve kimlik mühürüyle loglanmıştır.');
        }
    };

    const handleWindowBlur = () => {
        // Automatically blur when switching windows/recording
        setSecurityOverlay(true);
    };

    const handleWindowFocus = () => {
        setSecurityOverlay(false);
    };

    window.addEventListener('keyup', handleKeyDetection);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
        window.removeEventListener('keyup', handleKeyDetection);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const handleViewChange = (view: ViewState, vehicleId?: string) => {
    setCurrentView(view);
    // Fix: Correct typo in ViewState.SPARE_PARTS
    if (view !== ViewState.DETAILS && view !== ViewState.SPARE_PARTS) {
      setSelectedVehicleId(null);
    }
    if (vehicleId) {
        setSelectedVehicleId(vehicleId);
        if (view === ViewState.DETAILS) setCurrentView(ViewState.DETAILS);
    }
  };

  const handleVehicleFound = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setCurrentView(ViewState.SPARE_PARTS);
  };

  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setCurrentView(ViewState.DETAILS);
  };

  const handleNavigationFromHeader = (view: ViewState, id?: string) => {
      if (id) {
          setSelectedVehicleId(id);
      } else if (view !== ViewState.DETAILS && view !== ViewState.SPARE_PARTS) {
          setSelectedVehicleId(null);
      }
      setCurrentView(view);
  };

  const handleOpenVinModal = () => {
      const { allowed } = checkQueryLimit();
      if (!allowed) {
          logSecurityEvent('LIMIT_EXCEEDED', 'CRITICAL', 'Kota Sonu Sorgu Denemesi: Kullanıcı limitini aşmaya çalıştı.');
          alert('Günlük sorgu limitiniz dolmuştur. Yarın tekrar deneyebilir veya yöneticinizden yetki artırımı isteyebilirsiniz.');
          return;
      }
      setIsVinModalOpen(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD: return <Dashboard onChangeView={handleViewChange} />;
      case ViewState.MANAGER_PANEL: return <ManagerPanel />;
      case ViewState.LIBRARY: return <VehicleList onSelectVehicle={handleSelectVehicle} />;
      case ViewState.DETAILS: return selectedVehicleId ? <VehicleDetail vehicleId={selectedVehicleId} onBack={() => handleViewChange(ViewState.LIBRARY)} onNavigate={handleViewChange}/> : <Dashboard onChangeView={handleViewChange} />;
      case ViewState.PART_LIFE_ANALYSIS: return <PartLifeAnalysis />;
      case ViewState.RISK_ANALYSIS: return <RiskAnalysis />;
      case ViewState.DATA_ENGINE: return <DataEngine />;
      case ViewState.SPARE_PARTS: return <SpareParts preSelectedVehicleId={selectedVehicleId} />;
      case ViewState.B2B_NETWORK: return <B2BNetwork />;
      case ViewState.HISTORY: return <UsageHistory />;
      case ViewState.SETTINGS: return <Settings />;
      case ViewState.SUBSCRIPTION: return <Subscription />;
      case ViewState.USERS: return <UserManagement />;
      case ViewState.KVKK: return <Kvkk />;
      case ViewState.REPAIR_SHOPS: return <RepairShops onNavigate={handleViewChange} />;
      case ViewState.RETAILERS: return <Retailers onNavigate={handleViewChange} />;
      case ViewState.FLEET_RENTAL: return <FleetRental onNavigate={handleViewChange} />;
      case ViewState.EXPERTISE: return <ExpertiseCenters onNavigate={handleViewChange} />;
      case ViewState.INSURANCE: return <InsuranceCenter onNavigate={handleViewChange} />;
      case ViewState.INDIVIDUAL: return <IndividualUsers onNavigate={handleViewChange} />;
      case ViewState.DEALERS: return <AutoDealers onNavigate={handleViewChange} />;
      default: return <Dashboard onChangeView={handleViewChange} />;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 transition-all duration-700 ${securityOverlay ? 'blur-[50px] grayscale brightness-50' : ''}`}>
      <Sidebar currentView={currentView} onChangeView={(v) => handleViewChange(v)} />

      <div className="ml-64 relative">
        <Header onNavigate={handleNavigationFromHeader} />
        <main className="pt-16 pb-20">{renderContent()}</main>
        
        <button 
          onClick={handleOpenVinModal}
          className="fixed bottom-8 right-8 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 z-40 group"
          title="Yeni Araç Sorgula"
        >
          <Plus size={24} />
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-10 transition-opacity whitespace-nowrap pointer-events-none">VIN Sorgula</span>
        </button>
      </div>

      {/* PRIVACY SHIELD OVERLAY */}
      {securityOverlay && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-white bg-slate-950/40 backdrop-blur-3xl animate-in fade-in duration-500">
              <EyeOff size={100} className="mb-6 text-emerald-400 animate-pulse" />
              <h2 className="text-4xl font-black uppercase tracking-[0.4em]">Gizlilik Kalkanı</h2>
              <p className="mt-4 text-xl font-bold text-slate-300">Veri sızıntısını önlemek için içerik gizlendi.</p>
              <div className="mt-12 flex items-center gap-2 px-6 py-3 bg-white/10 rounded-2xl border border-white/20">
                  <Lock size={18} className="text-emerald-500" />
                  <span className="text-xs font-black uppercase tracking-widest">SafeCore™ End-to-End Secure Session</span>
              </div>
          </div>
      )}

      <VinInputModal isOpen={isVinModalOpen} onClose={() => setIsVinModalOpen(false)} onVehicleFound={handleVehicleFound} />
    </div>
  );
}