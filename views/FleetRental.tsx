
import React, { useEffect, useState } from 'react';
import { 
    Briefcase, Car, TrendingUp, Search, Calendar, MapPin, Wrench, 
    ChevronRight, Activity, Zap, ShieldAlert, Layout, LogOut, 
    PieChart, Navigation, Settings, Bell, User, Layers, Filter,
    CheckCircle, AlertTriangle, FileText, Download, DollarSign, Clock, Map,
    ListChecks, Plus, Loader2, ArrowRight, Timer, AlertOctagon, BarChart3
} from 'lucide-react';
import { getFleetVehicles, getFleetMaintenanceRecords, getFleetContracts, getBatchJobs, submitBatchJob } from '../services/dataService';
import { FleetVehicle, ViewState, BatchJob, PriorityLevel, JobStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface FleetRentalProps {
    onNavigate: (view: ViewState, id?: string) => void;
}

type FleetSubView = 'DASHBOARD' | 'INVENTORY' | 'BATCH_JOBS' | 'MAINTENANCE' | 'CONTRACTS';

export const FleetRental: React.FC<FleetRentalProps> = ({ onNavigate }) => {
    const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
    const [maintenance, setMaintenance] = useState<any[]>([]);
    const [contracts, setContracts] = useState<any[]>([]);
    const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
    const [activeView, setActiveView] = useState<FleetSubView>('DASHBOARD');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        refreshData();
    }, []);

    // Polling for batch status
    useEffect(() => {
        const timer = setInterval(() => {
            getBatchJobs().then(setBatchJobs);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const refreshData = () => {
        Promise.all([getFleetVehicles(), getFleetMaintenanceRecords(), getFleetContracts(), getBatchJobs()]).then(([veh, maint, cont, jobs]) => {
            setVehicles(veh);
            setMaintenance(maint);
            setContracts(cont);
            setBatchJobs(jobs);
            setIsLoading(false);
        });
    };

    const handleNewBatch = async () => {
        const vins = Array.from({length: 150}, (_, i) => `VIN-${i}`); // Simulated large list
        setIsSubmitting(true);
        try {
            await submitBatchJob("Piyasa Değerleme Taraması (150 Araç)", vins, PriorityLevel.NORMAL);
            setActiveView('BATCH_JOBS');
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Derived Metrics
    const totalFleet = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'MAINTENANCE').length;
    const utilizationRate = Math.round((activeVehicles / totalFleet) * 100) || 0;
    const totalMonthlyCost = contracts.reduce((acc, c) => acc + c.monthly, 0);

    // --- SUB-COMPONENTS ---

    const FleetSidebar = () => (
        <div className="w-64 bg-indigo-900 text-indigo-100 h-screen fixed left-0 top-0 flex flex-col z-20 shadow-2xl">
            <div className="p-6 flex items-center gap-3 border-b border-indigo-800/50">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <Briefcase size={22} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">FleetCore</h1>
                    <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">Kurumsal Filo Paneli</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {[
                    { id: 'DASHBOARD', label: 'Genel Bakış', icon: Layout },
                    { id: 'BATCH_JOBS', label: 'Toplu İşlemler', icon: ListChecks },
                    { id: 'INVENTORY', label: 'Araç Envanteri', icon: Car },
                    { id: 'MAINTENANCE', label: 'Servis & Bakım', icon: Wrench },
                    { id: 'CONTRACTS', label: 'Sözleşmeler', icon: Layers },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveView(item.id as FleetSubView)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            activeView === item.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                            : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                        }`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-indigo-800/50">
                <button 
                    onClick={() => onNavigate(ViewState.DASHBOARD)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-950 hover:bg-slate-900 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-indigo-800"
                >
                    <LogOut size={16} />
                    Süper Admin'e Dön
                </button>
            </div>
        </div>
    );

    const FleetHeader = () => (
        <header className="h-20 bg-white border-b border-indigo-50 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    {activeView === 'DASHBOARD' && 'Operasyon Paneli'}
                    {activeView === 'INVENTORY' && 'Araç Listesi & Zimmet'}
                    {activeView === 'BATCH_JOBS' && 'Asenkron İş Kuyruğu'}
                    {activeView === 'MAINTENANCE' && 'Bakım Planlama'}
                    {activeView === 'CONTRACTS' && 'Finansal Sözleşmeler'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">AVIS Filo Yönetimi • ID: FL-TR-34</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3">
                    <Timer size={16} className="text-indigo-500" />
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Rate Limit</p>
                        <div className="h-1 w-20 bg-slate-200 rounded-full mt-1 overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{width: '35%'}}></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-700">Worker Aktif</span>
                </div>
            </div>
        </header>
    );

    const BatchJobsContent = () => (
        <div className="animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">Toplu Analiz Merkezi</h3>
                    <p className="text-slate-500 text-sm mt-1">Yüksek hacimli veri setlerini asenkron kuyrukta işleyin.</p>
                </div>
                <button 
                    onClick={handleNewBatch}
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                    Yeni Toplu İş Başlat
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {batchJobs.map(job => (
                    <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-1/4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`w-2 h-2 rounded-full ${job.status === JobStatus.COMPLETED ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></span>
                                <h4 className="font-bold text-slate-800">{job.name}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                                    job.priority === PriorityLevel.URGENT ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                    job.priority === PriorityLevel.NORMAL ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                    {job.priority} PRIORITY
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">{job.id}</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-500 font-bold uppercase">İşlem Durumu: {job.status}</span>
                                <span className="text-slate-900 font-black">%{Math.round((job.processedItems / job.totalItems) * 100)}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-700 ${job.status === JobStatus.COMPLETED ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                    style={{width: `${(job.processedItems / job.totalItems) * 100}%`}}
                                ></div>
                            </div>
                            <div className="flex gap-4 mt-3">
                                <span className="text-[10px] text-slate-400 font-bold">TOPLAM: {job.totalItems}</span>
                                <span className="text-[10px] text-emerald-600 font-bold">BAŞARILI: {job.successCount}</span>
                                <span className="text-[10px] text-rose-500 font-bold">HATA: {job.errorCount}</span>
                            </div>
                        </div>

                        <div className="w-full md:w-1/5 text-right border-l border-slate-100 pl-8">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Oluşturma</p>
                            <p className="text-xs text-slate-700 font-bold">{job.createdAt}</p>
                            {job.status === JobStatus.PROCESSING && (
                                <div className="mt-2 text-indigo-600 font-black text-[10px] flex items-center justify-end gap-1">
                                    <Clock size={10} /> ETA: {job.estimatedTimeRemaining || 'Hesaplanıyor...'}
                                </div>
                            )}
                            {job.status === JobStatus.COMPLETED && (
                                <button className="mt-2 text-emerald-600 font-bold text-xs flex items-center justify-end gap-1 hover:underline">
                                    <Download size={14} /> Sonuçları İndir
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <FleetSidebar />
            
            <div className="ml-64 flex-1 flex flex-col">
                <FleetHeader />
                
                <main className="flex-1 mt-20 p-8 overflow-y-auto">
                    {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center text-slate-400">
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p>FleetCore Verileri Yükleniyor...</p>
                        </div>
                    ) : (
                        <>
                            {activeView === 'DASHBOARD' && (
                                <div className="animate-in fade-in duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Toplam Filo</p>
                                                    <h3 className="text-3xl font-bold text-slate-800">{totalFleet} <span className="text-sm font-normal text-slate-400">Araç</span></h3>
                                                </div>
                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Car size={24} /></div>
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <span className="text-emerald-600 font-bold flex items-center gap-1"><TrendingUp size={12}/> +2</span> bu ay eklendi
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Doluluk Oranı</p>
                                                    <h3 className="text-3xl font-bold text-emerald-600">%{utilizationRate}</h3>
                                                </div>
                                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Activity size={24} /></div>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full" style={{width: `${utilizationRate}%`}}></div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Aktif Bakım</p>
                                                    <h3 className="text-3xl font-bold text-rose-600">{maintenanceVehicles}</h3>
                                                </div>
                                                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Wrench size={24} /></div>
                                            </div>
                                            <div className="text-xs text-rose-600 font-bold flex items-center gap-1 bg-rose-50 px-2 py-1 rounded w-fit border border-rose-100">
                                                <ShieldAlert size={12} /> Serviste
                                            </div>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase">Aylık Ciro</p>
                                                    <h3 className="text-3xl font-bold text-indigo-600">{(totalMonthlyCost / 1000).toFixed(1)}k ₺</h3>
                                                </div>
                                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><DollarSign size={24} /></div>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Bitiş Yaklaşan: <strong>{contracts.filter(c => c.status === 'EXPIRING_SOON').length} Sözleşme</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><BarChart3 size={150} /></div>
                                            <h4 className="text-2xl font-bold mb-4">Toplu Analiz Gücü</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                                Tüm filonuzu aynı anda analiz edin. Parça ömrü, arıza frekansı ve bölgesel risk skorlarını tek bir batch işiyle asenkron olarak hesaplayın.
                                            </p>
                                            <button 
                                                onClick={() => setActiveView('BATCH_JOBS')}
                                                className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-50 transition-all"
                                            >
                                                Analiz Kuyruğunu Aç <ArrowRight size={16} />
                                            </button>
                                        </div>
                                        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10">
                                            <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Clock size={20} className="text-indigo-500" /> Yaklaşan Bakımlar</h4>
                                            <div className="space-y-4">
                                                {maintenance.slice(0, 3).map(m => (
                                                    <div key={m.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                        <div>
                                                            <p className="font-bold text-slate-800">{m.plate}</p>
                                                            <p className="text-xs text-slate-500">{m.type}</p>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">{m.date}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeView === 'BATCH_JOBS' && <BatchJobsContent />}
                            {activeView === 'INVENTORY' && <div className="p-8 text-center text-slate-400 italic">Envanter listesi yükleniyor...</div>}
                            {activeView === 'MAINTENANCE' && <div className="p-8 text-center text-slate-400 italic">Bakım kayıtları yükleniyor...</div>}
                            {activeView === 'CONTRACTS' && <div className="p-8 text-center text-slate-400 italic">Sözleşme verileri yükleniyor...</div>}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
