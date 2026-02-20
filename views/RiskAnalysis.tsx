
import React, { useEffect, useState } from 'react';
import { ShieldAlert, TrendingUp, AlertOctagon, Car, Activity, Zap, Info, ArrowUpRight, BarChart3, AlertTriangle, X, CheckCircle, Gauge, Thermometer, DollarSign, Calendar, ArrowRight, FileText, Search, MapPin, Printer, Download, Wrench, History, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell } from 'recharts';
import { getVehicleList, getVehicleDamageHistory, getPartAnalysisForVehicle } from '../services/dataService';
import { VehicleProfile, DamageRecord, PartRiskAnalysis } from '../types';

export const RiskAnalysis: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Critical List Modal
  const [showCriticalList, setShowCriticalList] = useState(false);
  const [selectedRiskVehicle, setSelectedRiskVehicle] = useState<VehicleProfile | null>(null);

  // State for PDF Report Generation Flow
  const [isReportSelectionOpen, setIsReportSelectionOpen] = useState(false);
  const [reportData, setReportData] = useState<{
      vehicle: VehicleProfile;
      history: DamageRecord[];
      risks: PartRiskAnalysis[];
  } | null>(null);

  useEffect(() => {
    getVehicleList().then(data => {
        setVehicles(data);
        setLoading(false);
    });
  }, []);

  // --- REPORT LOGIC ---
  const handleSelectVehicleForReport = async (vehicle: VehicleProfile) => {
      // Close selection, show loading state if needed (omitted for speed), fetch data
      const history = await getVehicleDamageHistory(vehicle.vehicle_id);
      const risks = await getPartAnalysisForVehicle(vehicle.vehicle_id);
      
      setReportData({
          vehicle,
          history,
          risks
      });
      setIsReportSelectionOpen(false);
  };

  // Mock Aggregated Data Calculations
  const averageRiskScore = vehicles.length > 0 
    ? Math.round(vehicles.reduce((acc, v) => acc + v.risk_score, 0) / vehicles.length) 
    : 0;

  const highRiskVehiclesList = vehicles.filter(v => v.risk_score > 50);
  const highRiskVehiclesCount = vehicles.filter(v => v.risk_score > 60).length;
  const financialExposure = vehicles.reduce((acc, v) => acc + (v.risk_score > 50 ? v.resale_value_prediction * 0.15 : 0), 0);

  // Mock Chart Data
  const trendData = [
    { month: 'Ocak', risk: 45, exposure: 120 },
    { month: 'Şubat', risk: 48, exposure: 135 },
    { month: 'Mart', risk: 42, exposure: 110 },
    { month: 'Nisan', risk: 55, exposure: 160 },
    { month: 'Mayıs', risk: averageRiskScore, exposure: 180 },
  ];

  const categoryRiskData = [
    { subject: 'Mekanik', A: 85, fullMark: 100 },
    { subject: 'Elektronik', A: 65, fullMark: 100 },
    { subject: 'Yasal/Tramer', A: 45, fullMark: 100 },
    { subject: 'Kullanıcı', A: 70, fullMark: 100 },
    { subject: 'Çevresel', A: 50, fullMark: 100 },
  ];

  const distributionData = [
    { name: 'Düşük Risk', value: vehicles.filter(v => v.risk_score <= 30).length + 15 },
    { name: 'Orta Risk', value: vehicles.filter(v => v.risk_score > 30 && v.risk_score <= 60).length + 8 },
    { name: 'Yüksek Risk', value: highRiskVehiclesCount + 2 },
  ];
  
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  // --- SUB-COMPONENTS ---

  const ReportSelectionModal = () => {
      if (!isReportSelectionOpen) return null;
      
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="text-emerald-600" /> Raporlanacak Aracı Seçin
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Detaylı bakım ve risk raporu oluşturmak için listeden bir araç seçiniz.</p>
                    </div>
                    <button onClick={() => setIsReportSelectionOpen(false)}><X className="text-slate-400 hover:text-slate-600" /></button>
                </div>
                
                <div className="p-4 border-b border-slate-100 bg-white">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Plaka, Marka veya ID ile arayın..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                </div>

                <div className="overflow-y-auto p-2 space-y-2">
                    {vehicles.map(v => (
                        <div key={v.vehicle_id} 
                            onClick={() => handleSelectVehicleForReport(v)}
                            className="p-3 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-lg cursor-pointer transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600">
                                    <Car size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{v.brand} {v.model}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="font-mono bg-slate-100 px-1 rounded">{v.vehicle_id.substring(0,8)}...</span>
                                        <span>•</span>
                                        <span>{v.year}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${v.risk_score > 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    Risk: {v.risk_score}
                                </span>
                                <ChevronRight size={16} className="text-slate-300 ml-2 inline-block" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      );
  }

  const DetailedReportPreviewModal = () => {
      if (!reportData) return null;
      const { vehicle, history, risks } = reportData;

      // Filter risks to show only what needs changing
      const partsNeedChange = risks.filter(r => r.riskLevel !== 'LOW');

      return (
        <div className="fixed inset-0 z-[60] bg-slate-100 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
             <div className="bg-white w-full max-w-5xl h-[90vh] shadow-2xl rounded-xl flex flex-col overflow-hidden">
                
                {/* Modal Toolbar */}
                <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Detaylı Risk ve Bakım Raporu</h3>
                            <p className="text-slate-400 text-xs">Oluşturulma: {new Date().toLocaleDateString('tr-TR')} • {vehicle.brand} {vehicle.model}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
                            <Printer size={16} /> Yazdır
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20">
                            <Download size={16} /> PDF İndir
                        </button>
                        <button onClick={() => setReportData(null)} className="p-2 hover:bg-slate-700 rounded-full transition-colors ml-2">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Report Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
                    <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] p-10 shadow-sm text-slate-800">
                        
                        {/* Report Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">LENT+</h1>
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">SafeCore Intelligence</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-slate-400 uppercase">Araç Sağlık Karnesi</h2>
                                <p className="font-mono text-sm text-slate-600 mt-1">ID: {vehicle.vehicle_id}</p>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-10 grid grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Araç</p>
                                <p className="font-bold text-slate-900 text-lg">{vehicle.brand} {vehicle.model}</p>
                                <p className="text-sm text-slate-600">{vehicle.year} Model • {vehicle.engine}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Kilometre</p>
                                <p className="font-bold text-slate-900 text-lg">{vehicle.mileage.toLocaleString()} KM</p>
                                <p className="text-sm text-slate-600">Son Güncelleme: Bugün</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Genel Skor</p>
                                <div className="flex items-center gap-2">
                                    <span className={`text-2xl font-bold ${vehicle.average_part_life_score < 70 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {vehicle.average_part_life_score}
                                    </span>
                                    <span className="text-sm text-slate-400">/100</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Risk Durumu</p>
                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${vehicle.risk_score > 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {vehicle.risk_score > 50 ? 'YÜKSEK RİSK' : 'DÜŞÜK RİSK'}
                                </span>
                            </div>
                        </div>

                        {/* Section 1: Future Actions (Risks) */}
                        <div className="mb-10">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-rose-700 border-b border-rose-200 pb-2 mb-4">
                                <AlertTriangle size={20} /> 
                                Acil Değişim Gerektiren Parçalar (Mevcut Riskler)
                            </h3>
                            {partsNeedChange.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-rose-50 text-rose-900">
                                        <tr>
                                            <th className="p-3 rounded-tl-lg">Parça Adı</th>
                                            <th className="p-3">Risk Seviyesi</th>
                                            <th className="p-3">Tespit Nedeni</th>
                                            <th className="p-3 text-right rounded-tr-lg">Tahmini Maliyet</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {partsNeedChange.map((risk, i) => (
                                            <tr key={i}>
                                                <td className="p-3 font-medium text-slate-800">{risk.partName}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${risk.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {risk.riskLevel === 'CRITICAL' ? 'KRİTİK' : 'YÜKSEK'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-600">{risk.demographicImpact}</td>
                                                <td className="p-3 text-right font-mono">{(risk.partCost + risk.laborCost).toLocaleString()} ₺</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2">
                                    <CheckCircle size={20} /> Bu araç için acil değişim gerektiren kritik bir parça tespit edilmemiştir.
                                </div>
                            )}
                        </div>

                        {/* Section 2: Maintenance History */}
                        <div className="mb-10">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
                                <History size={20} className="text-slate-500" /> 
                                Bakım ve Onarım Geçmişi
                            </h3>
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-600">
                                        <tr>
                                            <th className="p-3 border-b border-slate-200">Tarih</th>
                                            <th className="p-3 border-b border-slate-200">Firma / Servis Noktası</th>
                                            <th className="p-3 border-b border-slate-200">İşlem Tipi</th>
                                            <th className="p-3 border-b border-slate-200">Değişen Parçalar / İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map((rec, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="p-3 text-slate-600 font-mono text-xs whitespace-nowrap align-top">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        {rec.date}
                                                    </div>
                                                </td>
                                                <td className="p-3 align-top">
                                                    <div className="font-medium text-slate-800">{rec.serviceProvider}</div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <MapPin size={10} /> {rec.source === 'SBM' ? 'Sigorta Kaydı' : 'Yetkili Servis'}
                                                    </div>
                                                </td>
                                                <td className="p-3 align-top">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        rec.type === 'MAINTENANCE' ? 'bg-blue-50 text-blue-700' :
                                                        rec.type === 'ACCIDENT' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                        {rec.type === 'MAINTENANCE' ? 'Periyodik Bakım' : rec.type === 'ACCIDENT' ? 'Kaza Onarımı' : 'Arıza'}
                                                    </span>
                                                </td>
                                                <td className="p-3 align-top">
                                                    <div className="text-slate-700 mb-1 font-medium">{rec.description}</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {rec.partsReplaced.map((part, idx) => (
                                                            <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                                                                <Wrench size={8} /> {part}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer Disclaimer */}
                        <div className="mt-auto pt-6 border-t border-slate-200">
                             <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                                <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    <strong>Yasal Uyarı:</strong> Bu rapor, LENT+ SafeCore algoritmaları tarafından aracın anonim ID'si üzerinden geçmiş servis verileri, sigorta kayıtları ve bölgesel kullanım istatistikleri harmanlanarak oluşturulmuştur. Tahmini maliyetler ve parça ömrü verileri tavsiye niteliğindedir. Kesin teşhis için yetkili servise başvurunuz.
                                </p>
                             </div>
                        </div>

                    </div>
                </div>
             </div>
        </div>
      );
  }

  const CriticalListModal = () => {
    if (!showCriticalList) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                <div className="bg-rose-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <AlertOctagon size={20} /> Kritik Seviyedeki Araçlar
                        </h3>
                        <p className="text-rose-100 text-xs mt-1">Risk skoru 50 ve üzeri olan araçların listesi.</p>
                    </div>
                    <button onClick={() => setShowCriticalList(false)} className="hover:bg-rose-700 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-0">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4">Araç ID</th>
                                <th className="px-6 py-4">Model</th>
                                <th className="px-6 py-4">Risk Skoru</th>
                                <th className="px-6 py-4">Tespit Edilen Sorun</th>
                                <th className="px-6 py-4 text-right">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* Combine real mock data with static high risk rows for demo visualization */}
                            {[...highRiskVehiclesList, 
                                { vehicle_id: 'WBALZ7C5-XXXX', brand: 'Ford', model: 'Focus 2017', risk_score: 85, reason: 'Kronik Şanzıman Hatası' },
                                { vehicle_id: 'WBAVM135-XXXX', brand: 'BMW', model: '520d 2018', risk_score: 72, reason: 'Yüksek KM / Turbo' },
                                { vehicle_id: 'JTDKN3DU-XXXX', brand: 'Toyota', model: 'Corolla 2021', risk_score: 65, reason: 'Ağır Hasar Kaydı' }
                            ].map((row: any, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{row.vehicle_id}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{row.brand} {row.model}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${row.risk_score > 75 ? 'text-rose-600' : 'text-amber-600'}`}>{row.risk_score}</span>
                                            <div className="w-20 h-1.5 bg-slate-100 rounded-full">
                                                <div className={`h-1.5 rounded-full ${row.risk_score > 75 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{width: `${row.risk_score}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-1 rounded inline-flex items-center gap-1">
                                            <AlertTriangle size={10} /> {row.reason || 'Çoklu Risk Faktörü'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                // Create a fuller profile object for the demo rows
                                                const fullProfile = vehicles.find(v => v.vehicle_id === row.vehicle_id) || {
                                                    ...vehicles[0], // fallback
                                                    vehicle_id: row.vehicle_id,
                                                    brand: row.brand,
                                                    model: row.model,
                                                    risk_score: row.risk_score
                                                };
                                                setSelectedRiskVehicle(fullProfile);
                                            }}
                                            className="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
                                        >
                                            İncele
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

  const DetailedRiskInspectionModal = () => {
      if (!selectedRiskVehicle) return null;

      const v = selectedRiskVehicle;
      
      return (
        <div className="fixed inset-0 z-[60] bg-slate-100 overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedRiskVehicle(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                        <X size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {v.brand} {v.model} <span className="text-slate-400 font-normal">|</span> {v.year}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-1">
                            <span className="bg-slate-100 px-2 py-0.5 rounded">ID: {v.vehicle_id}</span>
                            <span className="flex items-center gap-1"><Activity size={12} /> {v.mileage?.toLocaleString()} KM</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="text-right mr-4">
                        <p className="text-xs text-slate-500 uppercase font-bold">Risk Skoru</p>
                        <p className={`text-2xl font-bold ${v.risk_score > 70 ? 'text-rose-600' : 'text-amber-500'}`}>{v.risk_score}/100</p>
                    </div>
                    <button className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg shadow-sm hover:bg-rose-700 flex items-center gap-2">
                        <AlertTriangle size={18} /> Acil Durum Raporu Oluştur
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8 space-y-8">
                
                {/* Top Section: Analysis Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Risk Gauge & Summary */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"></div>
                        <h3 className="font-bold text-slate-700 mb-6 w-full text-left flex items-center gap-2">
                            <Gauge size={18} className="text-slate-400" /> Genel Risk Durumu
                        </h3>
                        
                        <div className="relative w-48 h-48 flex items-center justify-center">
                             {/* Mock Circular Progress */}
                             <svg className="w-full h-full transform -rotate-90">
                                <circle cx="96" cy="96" r="88" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                                <circle cx="96" cy="96" r="88" stroke={v.risk_score > 70 ? '#e11d48' : '#f59e0b'} strokeWidth="12" fill="none" strokeDasharray={552} strokeDashoffset={552 - (552 * v.risk_score) / 100} strokeLinecap="round" />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-slate-800">{v.risk_score}</span>
                                <span className={`text-sm font-medium ${v.risk_score > 70 ? 'text-rose-600' : 'text-amber-600'}`}>
                                    {v.risk_score > 70 ? 'KRİTİK' : 'YÜKSEK'}
                                </span>
                             </div>
                        </div>
                        
                        <div className="mt-6 w-full bg-rose-50 border border-rose-100 p-3 rounded-lg text-left">
                            <p className="text-xs font-bold text-rose-700 uppercase mb-1">Tespit Edilen Ana Sorun</p>
                            <p className="text-sm text-rose-900">
                                {v.brand === 'Ford' ? 'Powershift Şanzıman Kavrama Hatası riski %85 üzerinde.' : 
                                 v.brand === 'BMW' ? 'Zincir Sesi ve Turbo Basınç Düşüklüğü tespit edildi.' : 
                                 'Periyodik bakım aralığı 15.000 KM aşılmış.'}
                            </p>
                        </div>
                    </div>

                    {/* Detailed Component Analysis */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-slate-400" /> Bileşen Bazlı Risk Analizi
                        </h3>
                        <div className="space-y-6">
                            {[
                                { name: 'Motor Performansı & Turbo', score: v.risk_score > 60 ? 35 : 75, icon: Zap },
                                { name: 'Şanzıman & Aktarma', score: v.brand === 'Ford' ? 20 : 80, icon: Activity },
                                { name: 'Elektronik Aksam', score: 60, icon: AlertOctagon },
                                { name: 'Kaporta & Şasi Bütünlüğü', score: 90, icon: ShieldAlert },
                            ].map((comp, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                            <comp.icon size={16} className="text-slate-400" />
                                            {comp.name}
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${comp.score < 50 ? 'bg-rose-100 text-rose-700' : comp.score < 80 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {comp.score < 50 ? 'RİSKLİ' : comp.score < 80 ? 'ORTA' : 'İYİ'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${comp.score < 50 ? 'bg-rose-500' : comp.score < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                            style={{width: `${comp.score}%`}}
                                        ></div>
                                    </div>
                                    {comp.score < 50 && (
                                        <p className="text-[10px] text-rose-600 mt-1 pl-6">
                                            * Öngörülen arıza süresi: &lt; 2.500 KM
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Prediction & Financial Exposure (Uncertainty Principle Applied) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                             <TrendingUp className="text-emerald-400" /> Yapay Zeka Öngörüsü (6 Ay)
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                                <div>
                                    <p className="text-slate-400 text-xs">Risk Sinyal Gücü</p>
                                    <p className="text-2xl font-bold text-rose-400">%82 - %89</p>
                                    <p className="text-[10px] text-slate-500 italic mt-1">Güven Aralığı (Confidence Interval)</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-xs">Tahmini Masraf Aralığı</p>
                                    <p className="text-2xl font-bold text-white">40k - 45k ₺</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs mb-2">Arıza Zaman Çizelgesi</p>
                                <div className="flex justify-between items-end h-24 gap-2">
                                    {[10, 25, 45, 60, 85, 95].map((h, i) => (
                                        <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                                            <div className="w-full bg-gradient-to-t from-slate-700 to-rose-500/50 rounded-t-sm" style={{height: `${h}%`}}></div>
                                            <span className="text-[10px] text-slate-500 text-center">{i+1}. Ay</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                         <div>
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <CheckCircle className="text-emerald-600" /> Önerilen Aksiyon Planı
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">
                                SafeCore algoritması, bu aracın geçmiş verileri ve mevcut piyasa koşullarını analiz ederek aşağıdaki aksiyonu önermektedir.
                            </p>

                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-4">
                                <div className="bg-white p-2 rounded-lg shadow-sm h-fit">
                                    <DollarSign className="text-amber-600" size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">Elden Çıkarma / Satış</h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Aracın önümüzdeki 3 ay içerisindeki değer kaybı ve bakım maliyeti, potansiyel kârlılığı negatife düşürecektir.
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <span className="text-xs bg-white border border-amber-200 px-2 py-1 rounded text-amber-800 font-bold">
                                            Güven Endeksi: Düşük
                                        </span>
                                        <span className="text-xs bg-white border border-amber-200 px-2 py-1 rounded text-amber-800 font-bold">
                                            Aciliyet: Yüksek
                                        </span>
                                    </div>
                                </div>
                            </div>
                         </div>
                         
                         <div className="mt-6 flex justify-end gap-3">
                             <button className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Raporu Paylaş</button>
                             <button className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
                                 <Calendar size={16} /> Satış Planına Ekle
                             </button>
                         </div>
                    </div>
                </div>

            </div>
        </div>
      );
  }

  return (
    <div className="p-8 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Filo Risk Analizi</h2>
            <p className="text-slate-500 mt-1">Araç filonuzun genel sağlık durumu, finansal risk maruziyeti ve kritik uyarılar.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setIsReportSelectionOpen(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center gap-2"
            >
                <BarChart3 size={16} /> PDF Raporu İndir
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-10">
                 <ShieldAlert size={60} className="text-slate-900" />
             </div>
             <p className="text-sm font-medium text-slate-500 mb-1">Ortalama Filo Risk Skoru</p>
             <h3 className={`text-3xl font-bold ${averageRiskScore > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                 {averageRiskScore}<span className="text-lg font-normal text-slate-400">/100</span>
             </h3>
             <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <TrendingUp size={12} /> +2.4%
                </span>
                <span>Geçen aya göre</span>
             </div>
        </div>

        <div 
            onClick={() => setShowCriticalList(true)}
            className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md hover:border-rose-200 group"
        >
             <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100 transition-colors">
                     <AlertOctagon size={20} />
                 </div>
                 <h3 className="font-semibold text-slate-700 group-hover:text-rose-700 transition-colors">Kritik Araç Sayısı</h3>
             </div>
             <p className="text-3xl font-bold text-slate-800">{highRiskVehiclesCount + 3} <span className="text-sm font-normal text-slate-500">Araç</span></p>
             <p className="text-xs text-rose-500 mt-2 font-medium flex items-center gap-1">
                Acil aksiyon gerektirir <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
             </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                     <Activity size={20} />
                 </div>
                 <h3 className="font-semibold text-slate-700">Risk Maruziyeti</h3>
             </div>
             <p className="text-2xl font-bold text-slate-800">{(financialExposure + 450000).toLocaleString('tr-TR')} ₺</p>
             <p className="text-xs text-slate-500 mt-2">Potansiyel arıza maliyet tahmini</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                     <Zap size={20} />
                 </div>
                 <h3 className="font-semibold text-slate-700">Güvenlik Endeksi</h3>
             </div>
             <p className="text-3xl font-bold text-slate-800">A+</p>
             <p className="text-xs text-emerald-600 mt-2 font-medium">Sektör ortalamasının üzerinde</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-slate-400" />
                Dönemsel Risk Eğilimi
            </h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" name="Risk Skoru" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Risk Kategorizasyonu</h3>
            <p className="text-xs text-slate-500 mb-4">Filo genelindeki risklerin kaynak dağılımı.</p>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryRiskData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Risk" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Distribution Bar Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-6">Risk Seviyesi Dağılımı</h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} layout="vertical">
                         <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} />
                         <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                         <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                            {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                         </Bar>
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Detailed Risky Vehicles Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-rose-500" />
                        En Yüksek Riskli Araçlar
                    </h3>
                    <button onClick={() => setShowCriticalList(true)} className="text-sm text-emerald-600 font-medium hover:underline">Tümünü Gör</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Araç ID</th>
                                <th className="px-6 py-4">Model</th>
                                <th className="px-6 py-4">Risk Skoru</th>
                                <th className="px-6 py-4">Birincil Risk Faktörü</th>
                                <th className="px-6 py-4 text-right">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { id: 'WBALZ7C5-XXXX', model: 'Ford Focus 2017', score: 85, factor: 'Kronik Şanzıman Hatası', color: 'text-rose-600', brand: 'Ford' },
                                { id: 'WBAVM135-XXXX', model: 'BMW 520d 2018', score: 72, factor: 'Yüksek KM / Turbo', color: 'text-amber-600', brand: 'BMW' },
                                { id: 'JTDKN3DU-XXXX', model: 'Toyota Corolla 2021', score: 65, factor: 'Ağır Hasar Kaydı', color: 'text-amber-600', brand: 'Toyota' },
                                { id: 'WVWZZZ3C-XXXX', model: 'VW Passat 2019', score: 55, factor: 'Periyodik Bakım Gecikmesi', color: 'text-amber-600', brand: 'Volkswagen' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded inline-block border border-slate-200">
                                            {row.id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.model}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${row.color}`}>{row.score}</span>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full">
                                                <div className={`h-1.5 rounded-full ${row.score > 80 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{width: `${row.score}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-slate-600 bg-red-50 border border-red-100 px-2 py-1 rounded flex items-center gap-1 w-fit">
                                            <Info size={12} /> {row.factor}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                const mockProfile = { 
                                                    ...vehicles[0], 
                                                    vehicle_id: row.id, 
                                                    brand: row.brand, 
                                                    model: row.model, 
                                                    risk_score: row.score, 
                                                    year: parseInt(row.model.split(' ').pop() || '2020') 
                                                };
                                                setSelectedRiskVehicle(mockProfile);
                                            }}
                                            className="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ml-auto"
                                        >
                                            İncele <ArrowUpRight size={12} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
          </div>
      </div>
      
      {/* Modals */}
      <CriticalListModal />
      <DetailedRiskInspectionModal />
      <ReportSelectionModal />
      <DetailedReportPreviewModal />

    </div>
  );
};
