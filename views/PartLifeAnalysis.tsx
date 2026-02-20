import React, { useState, useEffect } from 'react';
import { Box, Activity, AlertTriangle, TrendingDown, Wrench, CheckCircle, Clock, ChevronDown, Calendar, ArrowRight, BrainCircuit, Shield, X, Loader2, MapPin, CheckSquare, Square, Building2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell } from 'recharts';
import { getVehicleList, getPartAnalysisForVehicle, getServicePoints } from '../services/dataService';
import { VehicleProfile, PartRiskAnalysis, ServicePoint } from '../types';

export const PartLifeAnalysis: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<PartRiskAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals / Overlays
  const [showCriticalDetails, setShowCriticalDetails] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPartForService, setSelectedPartForService] = useState<PartRiskAnalysis | null>(null);

  useEffect(() => {
    getVehicleList().then(list => {
        setVehicles(list);
        if (list.length > 0) setSelectedVehicleId(list[0].vehicle_id);
    });
  }, []);

  useEffect(() => {
    if (!selectedVehicleId) return;
    setLoading(true);
    getPartAnalysisForVehicle(selectedVehicleId).then(data => {
        setAnalysisData(data);
        setLoading(false);
    });
  }, [selectedVehicleId]);

  const currentVehicle = vehicles.find(v => v.vehicle_id === selectedVehicleId);

  // Dynamic Chart Data based on selected vehicle KM
  const getDegradationData = (mileage: number) => {
    const baseCurve = (start: number, rate: number) => Math.max(10, start - (mileage / 1000 * rate));
    return [
        { mileage: '0k', brake: 100, engine: 100, transmission: 100 },
        { mileage: '20k', brake: 85, engine: 98, transmission: 99 },
        { mileage: '40k', brake: 60, engine: 95, transmission: 97 },
        { mileage: '60k', brake: 40, engine: 90, transmission: 94 },
        { mileage: `${(mileage/1000).toFixed(0)}k (Mevcut)`, brake: baseCurve(90, 0.8), engine: baseCurve(100, 0.2), transmission: baseCurve(100, 0.15) },
        { mileage: `${(mileage/1000 + 20).toFixed(0)}k`, brake: baseCurve(90, 1.2), engine: baseCurve(100, 0.25), transmission: baseCurve(100, 0.2) },
    ];
  };

  const degradationData = currentVehicle ? getDegradationData(currentVehicle.mileage) : [];
  const criticalCount = analysisData.filter(p => p.riskLevel === 'CRITICAL').length;
  const totalEstimatedCost = analysisData.filter(p => p.riskLevel !== 'LOW').reduce((acc, curr) => acc + curr.partCost + curr.laborCost, 0);

  // --- SUB-COMPONENTS (Keep in same file for cohesion as requested) ---

  const ServiceAppointmentModal = () => {
    const [selectedCityCode, setSelectedCityCode] = useState<number>(currentVehicle?.plate_city_code || 34);
    const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
    const [selectedPointId, setSelectedPointId] = useState<string>('');
    const [isLoadingPoints, setIsLoadingPoints] = useState(false);

    useEffect(() => {
        setIsLoadingPoints(true);
        getServicePoints(selectedCityCode).then(points => {
            setServicePoints(points);
            // Auto select first one or reset
            if(points.length > 0) setSelectedPointId(points[0].id);
            setIsLoadingPoints(false);
        });
    }, [selectedCityCode]);

    if (!appointmentModalOpen) return null;

    const cities = [
        { code: 34, name: 'İstanbul' },
        { code: 6, name: 'Ankara' },
        { code: 35, name: 'İzmir' },
        { code: 1, name: 'Adana' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Calendar size={20} /> Servis Randevusu Planla
                    </h3>
                    <button onClick={() => setAppointmentModalOpen(false)} className="hover:bg-emerald-700 p-1 rounded"><X size={20} /></button>
                </div>
                <div className="p-6">
                    <div className="mb-4 bg-slate-50 p-3 rounded border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Seçilen İşlem</p>
                        <p className="font-bold text-slate-800">{selectedPartForService?.partName || 'Genel Bakım'}</p>
                    </div>

                    {/* City Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Hizmet Bölgesi (İl)</label>
                        <div className="relative">
                            <select 
                                value={selectedCityCode}
                                onChange={(e) => setSelectedCityCode(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                {cities.map(c => (
                                    <option key={c.code} value={c.code}>{c.name}</option>
                                ))}
                            </select>
                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Service Point List */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Anlaşmalı Servis Noktaları</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {isLoadingPoints ? (
                                <div className="text-center py-4 text-slate-400"><Loader2 className="animate-spin inline mr-2" /> Servisler yükleniyor...</div>
                            ) : servicePoints.length > 0 ? (
                                servicePoints.map(sp => (
                                    <div 
                                        key={sp.id}
                                        onClick={() => setSelectedPointId(sp.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between ${
                                            selectedPointId === sp.id 
                                            ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                                            : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-medium text-slate-800 text-sm flex items-center gap-2">
                                                {sp.name}
                                                {sp.type === 'AUTHORIZED' && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">YETKİLİ</span>}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1">{sp.district} - En Erken: <span className="text-emerald-600 font-medium">{sp.nextAvailableSlot}</span></div>
                                        </div>
                                        {selectedPointId === sp.id && <CheckCircle size={18} className="text-emerald-600 mt-1" />}
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-500 italic p-2 border border-dashed rounded">Bu bölgede anlaşmalı servis bulunamadı.</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-2 mb-6">
                         <Clock className="text-amber-600 shrink-0" size={18} />
                         <p className="text-xs text-amber-800">
                             Tahmini işlem süresi: <strong>{selectedPartForService ? selectedPartForService.estimatedTime : 60} dakika</strong>. 
                             Seçilen servis noktasındaki yoğunluğa göre değişiklik gösterebilir.
                         </p>
                    </div>

                    <button 
                        onClick={() => {alert('Randevu ERP sistemine işlendi.'); setAppointmentModalOpen(false);}}
                        disabled={!selectedPointId}
                        className="w-full py-3 bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-md"
                    >
                        Randevuyu Onayla
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const MaintenancePlanModal = () => {
    // Mock Data Definition
    const planItems = [
        { id: 1, month: 'Haziran 2024', title: 'Periyodik Yağ Bakımı', priority: 'NORMAL', cost: 4200, detail: '15.000 KM dolmak üzere.' },
        { id: 2, month: 'Ağustos 2024', title: 'Fren Balatası Değişimi', priority: 'HIGH', cost: 3500, detail: 'AI Analizi: Trafik yoğunluğuna bağlı erken aşınma tespit edildi.' },
        { id: 3, month: 'Kasım 2024', title: 'Kış Lastiği & Antifriz', priority: 'NORMAL', cost: 8000, detail: 'Mevsimsel zorunluluk.' },
        { id: 4, month: 'Şubat 2025', title: 'Akü Kontrolü', priority: 'LOW', cost: 0, detail: 'Soğuk hava performans düşüşü riski.' },
    ];

    const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>([1, 2, 3, 4]);

    // Service & Location State
    const [planCityCode, setPlanCityCode] = useState<number>(currentVehicle?.plate_city_code || 34);
    const [planServicePoints, setPlanServicePoints] = useState<ServicePoint[]>([]);
    const [planSelectedServiceId, setPlanSelectedServiceId] = useState<string>('');
    const [loadingPoints, setLoadingPoints] = useState(false);

    useEffect(() => {
        if (planModalOpen) {
            setLoadingPoints(true);
            getServicePoints(planCityCode).then(data => {
                setPlanServicePoints(data);
                if (data.length > 0) {
                    setPlanSelectedServiceId(data[0].id);
                } else {
                    setPlanSelectedServiceId('');
                }
                setLoadingPoints(false);
            });
        }
    }, [planCityCode, planModalOpen]);

    const cities = [
        { code: 34, name: 'İstanbul' },
        { code: 6, name: 'Ankara' },
        { code: 35, name: 'İzmir' },
        { code: 1, name: 'Adana' },
    ];

    const togglePlan = (id: number) => {
        if (selectedPlanIds.includes(id)) {
            setSelectedPlanIds(selectedPlanIds.filter(pid => pid !== id));
        } else {
            setSelectedPlanIds([...selectedPlanIds, id]);
        }
    };

    const totalSelectedCost = planItems
        .filter(item => selectedPlanIds.includes(item.id))
        .reduce((sum, item) => sum + item.cost, 0);

    if (!planModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <h3 className="font-semibold flex items-center gap-2">
                        <BrainCircuit size={20} className="text-purple-400" /> 
                        LENT+ Bakım Projeksiyonu
                    </h3>
                    <button onClick={() => setPlanModalOpen(false)} className="hover:bg-slate-700 p-1 rounded"><X size={20} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Top Stats & Configuration Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <p className="text-xs text-purple-600 font-bold uppercase mb-1">Analiz Edilen Veri</p>
                            <p className="text-sm text-slate-700">
                                Bölgesel trafik yoğunluğu ({currentVehicle?.plate_city_code === 34 ? 'İstanbul' : 'Anadolu'}), 
                                kullanım alışkanlıkları ve {currentVehicle?.mileage.toLocaleString()} KM geçmişi baz alındı.
                            </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Tahmini Maliyet</p>
                            <p className="text-2xl font-bold text-slate-800">{totalSelectedCost.toLocaleString()} ₺</p>
                            <p className="text-xs text-blue-500 mt-1">{selectedPlanIds.length} işlem seçili</p>
                        </div>
                        
                        {/* New Service Selection Tab */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                                <Building2 size={14} /> Servis & Lokasyon
                             </div>
                             
                             <div className="space-y-2">
                                <div className="relative">
                                    <select 
                                        value={planCityCode}
                                        onChange={(e) => setPlanCityCode(Number(e.target.value))}
                                        className="w-full text-sm pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none appearance-none"
                                    >
                                        {cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                    </select>
                                    <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                                
                                <div className="relative">
                                    <select 
                                        value={planSelectedServiceId}
                                        onChange={(e) => setPlanSelectedServiceId(e.target.value)}
                                        className="w-full text-sm pl-2 pr-3 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 outline-none"
                                        disabled={loadingPoints}
                                    >
                                        {loadingPoints ? (
                                            <option>Yükleniyor...</option>
                                        ) : planServicePoints.length > 0 ? (
                                            planServicePoints.map(sp => (
                                                <option key={sp.id} value={sp.id}>{sp.name} ({sp.district})</option>
                                            ))
                                        ) : (
                                            <option>Servis Bulunamadı</option>
                                        )}
                                    </select>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                        {planItems.map((item) => {
                            const isSelected = selectedPlanIds.includes(item.id);
                            return (
                                <div key={item.id} className="relative pl-8">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${item.priority === 'HIGH' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                    
                                    <div 
                                        onClick={() => togglePlan(item.id)}
                                        className={`bg-white p-4 rounded-lg border shadow-sm transition-all cursor-pointer flex gap-4 items-start group ${isSelected ? 'border-slate-300' : 'border-slate-100 opacity-60 grayscale'}`}
                                    >
                                        <div className="mt-1 text-emerald-600">
                                            {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-300" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{item.month}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${item.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {item.priority === 'HIGH' ? 'KRİTİK' : 'NORMAL'}
                                                </span>
                                            </div>
                                            <h4 className={`font-bold mb-1 transition-colors ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>{item.title}</h4>
                                            <p className="text-sm text-slate-600 mb-2">{item.detail}</p>
                                            <div className="flex items-center gap-1 text-xs font-mono text-slate-500">
                                                Tahmini Bütçe: <span className={`font-bold ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>{item.cost > 0 ? `${item.cost} ₺` : 'Ücretsiz'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
                    <button onClick={() => setPlanModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium">Kapat</button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium flex items-center gap-2">
                        <CheckCircle size={16} /> 
                        {selectedPlanIds.length} Planı Onayla
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const CriticalDetailsOverlay = () => {
    if (!showCriticalDetails) return null;
    const criticals = analysisData.filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH');
    
    return (
        <div className="fixed inset-0 z-40 bg-white flex flex-col animate-in slide-in-from-right duration-300">
             <div className="bg-rose-50 px-8 py-6 border-b border-rose-100 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-rose-700 flex items-center gap-2">
                        <AlertTriangle size={28} /> Kritik Değişim Analizi
                    </h2>
                    <p className="text-rose-600 mt-1">Bu parçalar için acil aksiyon alınmazsa %85 olasılıkla yolda kalma riski bulunmaktadır.</p>
                </div>
                <button onClick={() => setShowCriticalDetails(false)} className="bg-white text-rose-700 px-4 py-2 rounded-lg font-bold shadow-sm border border-rose-200 hover:bg-rose-100">
                    Analize Dön
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <div className="max-w-5xl mx-auto grid gap-6">
                    {criticals.map(part => (
                        <div key={part.id} className="bg-white p-6 rounded-xl border-l-4 border-rose-500 shadow-sm flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-slate-800">{part.partName}</h3>
                                    <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded font-bold uppercase">Kritik Seviye</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Bölgesel Tespit</p>
                                        <p className="text-sm font-medium text-slate-700 mt-1">{part.demographicImpact}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Sağlık Skoru</p>
                                        <div className="w-full bg-slate-200 h-2 rounded-full mt-2">
                                            <div className="bg-rose-500 h-2 rounded-full" style={{width: `${part.healthScore}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Sigorta Ref Kodu: <span className="font-mono bg-slate-100 px-1 rounded text-slate-700">{part.insuranceRef}</span>
                                </p>
                            </div>
                            
                            <div className="w-full md:w-64 border-l border-slate-100 pl-6 flex flex-col justify-center">
                                <p className="text-xs text-slate-400 mb-1">Toplam Onarım Maliyeti</p>
                                <p className="text-2xl font-bold text-slate-800">{(part.partCost + part.laborCost).toLocaleString()} ₺</p>
                                <p className="text-xs text-slate-400 mb-4">+ KDV Dahil (Parça + İşçilik)</p>
                                <button 
                                    onClick={() => {
                                        setSelectedPartForService(part);
                                        setAppointmentModalOpen(true);
                                    }}
                                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-colors"
                                >
                                    Hemen Randevu Al
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
    );
  };

  return (
    <div className="p-8 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Parça Ömrü Analizi</h2>
        </div>
        <div className="flex gap-3">
             {/* Vehicle Selector */}
             <div className="relative">
                <select 
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 text-slate-700 pl-4 pr-10 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    {vehicles.map(v => (
                        <option key={v.vehicle_id} value={v.vehicle_id}>{v.brand} {v.model} - {v.vehicle_id.substring(0,6)}...</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
             </div>

            <button 
                onClick={() => setPlanModalOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-2 text-sm font-medium shadow-sm transition-all hover:scale-105"
            >
                <BrainCircuit size={16} className="text-purple-400" /> Bakım Planı Oluştur
            </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center flex-col text-slate-400">
            <Loader2 size={40} className="animate-spin text-emerald-600 mb-4" />
            <p>Bölgesel veriler ve parça durumu analiz ediliyor...</p>
        </div>
      ) : (
        <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Araç Sağlık Skoru</p>
                        <h3 className="text-3xl font-bold text-slate-800">
                            {currentVehicle?.average_part_life_score} 
                            <span className="text-lg text-slate-400 font-normal">/100</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            {currentVehicle?.plate_city_code === 34 ? 'İstanbul Bölgesi - Yoğun Aşınma' : 'Standart Bölge Çarpanı'}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <Activity size={24} />
                    </div>
                </div>

                <div 
                    onClick={() => criticalCount > 0 && setShowCriticalDetails(true)}
                    className={`p-6 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${criticalCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`}
                >
                    <div>
                        <p className={`text-sm font-medium mb-1 ${criticalCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>Kritik Değişim Uyarısı</p>
                        <h3 className={`text-3xl font-bold ${criticalCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{criticalCount} Parça</h3>
                        <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${criticalCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            {criticalCount > 0 ? (
                                <>Detayları incelemek için tıklayın <ArrowRight size={12} /></>
                            ) : 'Her şey yolunda'}
                        </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${criticalCount > 0 ? 'bg-white text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                        <AlertTriangle size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Tahmini Onarım Bütçesi</p>
                        <h3 className="text-3xl font-bold text-slate-800">{totalEstimatedCost.toLocaleString()} ₺</h3>
                        <p className="text-xs text-slate-400 mt-1">Parça + İşçilik (Yetkili Servis)</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                        <Box size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Degradation Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Kilometreye Göre Parça Aşınma Eğrisi</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={degradationData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="mileage" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} label={{ value: 'Sağlık Skoru (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="top" height={36}/>
                                <Line type="monotone" name="Fren Sistemi" dataKey="brake" stroke="#f59e0b" strokeWidth={2} dot={true} />
                                <Line type="monotone" name="Motor" dataKey="engine" stroke="#10b981" strokeWidth={2} dot={true} />
                                <Line type="monotone" name="Şanzıman" dataKey="transmission" stroke="#3b82f6" strokeWidth={2} dot={true} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 flex gap-2">
                        <BrainCircuit size={16} className="shrink-0 text-purple-500" />
                        <span><strong>AI Analizi:</strong> {currentVehicle?.plate_city_code === 34 ? 'İstanbul' : 'Bölge'} verilerine göre, bu araçtaki fren aşınma hızı standart sapmanın %15 üzerindedir.</span>
                    </div>
                </div>

                {/* Risk Distribution */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Risk Dağılımı</h3>
                    <div className="space-y-4">
                        {analysisData.map(part => (
                            <div key={part.id}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-slate-700">{part.partName}</span>
                                    <span className={part.riskLevel === 'CRITICAL' ? 'text-rose-600 font-bold' : 'text-slate-500'}>%{part.healthScore}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${
                                            part.riskLevel === 'CRITICAL' ? 'bg-rose-500' : 
                                            part.riskLevel === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`} 
                                        style={{width: `${part.healthScore}%`}}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                        <Shield size={16} className="mb-2" />
                        Bu veriler, bölgenizdeki {vehicles.length} benzer aracın geçmiş bakım verileri ile çaprazlanarak oluşturulmuştur.
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-rose-500" />
                        Acil Müdahale Gerektiren Parçalar ve Maliyet Analizi
                    </h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Sigorta Ref Kodu (IRC)</th>
                            <th className="px-6 py-4">Parça Adı</th>
                            <th className="px-6 py-4">Bölgesel Etki Faktörü</th>
                            <th className="px-6 py-4">Risk</th>
                            <th className="px-6 py-4">Tahmini Maliyet (Parça+İşçilik)</th>
                            <th className="px-6 py-4 text-right">Aksiyon</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {analysisData.filter(p => p.riskLevel !== 'LOW').map((part, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded inline-block border border-slate-200">
                                        {part.insuranceRef}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-800">{part.partName}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">{part.regionName}</span>
                                        <span className="text-[10px] text-slate-500">{part.demographicImpact}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                                        part.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-700 animate-pulse' : 
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {part.riskLevel === 'CRITICAL' ? 'KRİTİK' : 'YÜKSEK'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-slate-800">{(part.partCost + part.laborCost).toLocaleString()} ₺</div>
                                    <div className="text-[10px] text-slate-400">
                                        {part.partCost} P + {part.laborCost} İ
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => {
                                        setSelectedPartForService(part);
                                        setAppointmentModalOpen(true);
                                    }}
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors shadow-sm"
                                >
                                    Servis Planla
                                </button>
                                </td>
                            </tr>
                        ))}
                        {analysisData.filter(p => p.riskLevel !== 'LOW').length === 0 && (
                             <tr>
                                 <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                     Bu araç için şu an acil müdahale gerektiren bir parça tespit edilmedi.
                                 </td>
                             </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
      )}

      {/* RENDER MODALS */}
      <ServiceAppointmentModal />
      <MaintenancePlanModal />
      <CriticalDetailsOverlay />

    </div>
  );
};