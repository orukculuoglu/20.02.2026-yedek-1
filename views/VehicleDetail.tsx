
import React, { useEffect, useState } from 'react';
import { 
    ArrowLeft, CheckCircle, AlertOctagon, Wrench, DollarSign, Activity, 
    FileText, Share2, Info, ChevronDown, ChevronUp, Package, Calendar, 
    TurkishLira, ClipboardList, ShieldAlert, BadgeCheck, Loader2, 
    ExternalLink, Cpu, Brain, Shield, Lock, ShieldCheck, Fingerprint, EyeOff, ZapOff 
} from 'lucide-react';
import { VehicleProfile, OEMPart, DamageRecord, ViewState, PrivacyContext } from '../types';
import { getVehicleProfile, getVehicleOEMParts, getVehicleDamageHistory } from '../services/dataService';
import { calculatePrivacyContext } from '../services/securityService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { PdfExportModal } from '../components/PdfExportModal';

interface VehicleDetailProps {
  vehicleId: string;
  onBack: () => void;
  onNavigate: (view: ViewState, id?: string) => void;
}

export const VehicleDetail: React.FC<VehicleDetailProps> = ({ vehicleId, onBack, onNavigate }) => {
  const [profile, setProfile] = useState<VehicleProfile | null | undefined>(null); // undefined means loaded but not found
  const [privacyCtx, setPrivacyCtx] = useState<PrivacyContext | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Parts State
  const [showParts, setShowParts] = useState(false);
  const [parts, setParts] = useState<OEMPart[]>([]);
  const [partsLoading, setPartsLoading] = useState(true);
  
  // Damage History State
  const [showDamage, setShowDamage] = useState(false);
  const [damageHistory, setDamageHistory] = useState<DamageRecord[]>([]);

  // PDF Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    setLoadingProfile(true);
    // Fetch profile data
    getVehicleProfile(vehicleId).then(data => {
        setProfile(data); // data can be undefined now
        setLoadingProfile(false);
        // Calculate Privacy Context based on this vehicle segment
        if (data) {
            setPrivacyCtx(calculatePrivacyContext(data.brand, data.model));
        }
    });
    
    getVehicleDamageHistory(vehicleId).then(setDamageHistory);

    setPartsLoading(true);
    getVehicleOEMParts(vehicleId).then(data => {
        setParts(data);
        setPartsLoading(false);
    });

  }, [vehicleId]);

  // UNCERTAINTY HANDLING: If profile is undefined after loading, we do NOT show empty charts.
  // We show an explicit "Signal Insufficient" screen.
  if (!loadingProfile && !profile) {
      return (
          <div className="p-8 h-full flex flex-col items-center justify-center text-center">
              <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <EyeOff size={48} className="text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Sinyal Yetersiz / Bağlam Bilinmiyor</h2>
              <p className="text-slate-500 max-w-md mt-2 mb-6">
                  Girilen ID için sistemde doğrulanmış bir olay kaydı bulunamadı. 
                  SafeCore™ mimarisi, eksik veriyi tamamlamaz veya varsayımda bulunmaz.
              </p>
              <button onClick={onBack} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <ArrowLeft size={18} /> Geri Dön
              </button>
          </div>
      );
  }

  if (loadingProfile || !profile || !privacyCtx) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

  /**
   * APPLY DIFFERENTIAL PRIVACY (NOISE INJECTION)
   * Korelasyon riskine göre veriye "gürültü" eklenir.
   */
  const applyPrivacyMask = (value: number, type: 'SCORE' | 'PRICE' | 'INDEX'): number => {
      if (privacyCtx.maskingLevel === 'NONE') return value;

      const randomJitter = (Math.random() - 0.5); // -0.5 to 0.5
      
      switch (privacyCtx.maskingLevel) {
          case 'LOW':
              // %1 sapma
              return type === 'PRICE' ? Math.round(value * (1 + randomJitter * 0.02)) : value + (randomJitter * 2);
          case 'MEDIUM':
              // %3 sapma + Yuvarlama
              const val = type === 'PRICE' ? Math.round(value * (1 + randomJitter * 0.06) / 500) * 500 : Math.round(value + (randomJitter * 5));
              return val;
          case 'HIGH':
              // %5 sapma + Agresif Yuvarlama
              const highVal = type === 'PRICE' ? Math.round(value * (1 + randomJitter * 0.1) / 1000) * 1000 : Math.round((value + (randomJitter * 10)) / 5) * 5;
              return highVal;
          default:
              return value;
      }
  };

  const maskedPrice = applyPrivacyMask(profile.resale_value_prediction, 'PRICE');
  const maskedHealth = applyPrivacyMask(profile.average_part_life_score, 'SCORE');

  const resaleData = [
    { year: 'Bugün', price: maskedPrice },
    { year: '2025', price: maskedPrice * 0.92 },
    { year: '2026', price: maskedPrice * 0.85 },
    { year: '2027', price: maskedPrice * 0.79 },
    { year: '2028', price: maskedPrice * 0.74 },
  ];

  const radarData = [
    { subject: 'Motor', A: applyPrivacyMask(120, 'SCORE'), fullMark: 150 },
    { subject: 'Şanzıman', A: applyPrivacyMask(98, 'SCORE'), fullMark: 150 },
    { subject: 'Fren', A: applyPrivacyMask(86, 'SCORE'), fullMark: 150 },
    { subject: 'Kaporta', A: applyPrivacyMask(99, 'SCORE'), fullMark: 150 },
    { subject: 'Elektrik', A: applyPrivacyMask(65, 'SCORE'), fullMark: 150 },
    { subject: 'Yürüyen', A: applyPrivacyMask(85, 'SCORE'), fullMark: 150 },
  ];

  return (
    <div className="p-8">
      {/* Header Navigation */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium">
        <ArrowLeft size={20} />
        Araç Kütüphanesine Dön
      </button>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-800">{profile.brand} {profile.model} Serisi Analizi</h1>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-semibold rounded-full border border-slate-200">
                    {profile.year} Üretim
                </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 inline-flex uppercase">
                <Lock size={12} />
                Anonim ID: {profile.vehicle_id.substring(0, 8)}...
            </div>
        </div>
        
        {/* PRIVACY SHIELD INDICATOR (Anti-Correlation Display) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[300px]">
            <div className={`p-3 rounded-xl ${privacyCtx.maskingLevel === 'NONE' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                {privacyCtx.maskingLevel === 'NONE' ? <ShieldCheck size={24}/> : <ZapOff size={24}/>}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Korelasyon Koruması</p>
                    <span className={`text-[10px] font-bold ${privacyCtx.maskingLevel === 'HIGH' ? 'text-rose-600' : 'text-slate-600'}`}>
                        {privacyCtx.maskingLevel === 'NONE' ? 'NORMAL' : `MASKING: ${privacyCtx.maskingLevel}`}
                    </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${privacyCtx.correlationScore > 70 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                        style={{width: `${privacyCtx.correlationScore}%`}}
                    ></div>
                </div>
                <p className="text-[9px] text-slate-400 mt-1 italic">Mosaic atak riskine karşı gürültü (DP) seviyesi: {privacyCtx.maskingLevel}</p>
            </div>
        </div>
      </div>

      {/* Aggregated AI Insights Banner */}
      <div className={`mb-8 p-4 border rounded-2xl flex items-center gap-4 transition-all ${
          privacyCtx.isAggregateDataOnly ? 'bg-amber-50 border-amber-100' : 'bg-teal-50 border-teal-100'
      }`}>
          <div className={`p-2 rounded-lg shadow-sm ${privacyCtx.isAggregateDataOnly ? 'bg-amber-600' : 'bg-teal-600'} text-white`}>
              {privacyCtx.isAggregateDataOnly ? <EyeOff size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
              <h4 className={`text-sm font-bold ${privacyCtx.isAggregateDataOnly ? 'text-amber-900' : 'text-teal-900'}`}>
                  {privacyCtx.isAggregateDataOnly ? 'Kısıtlı Veri Modu Aktif (Indirect Identification Prevention)' : 'Grup Bazlı Analiz Modu Aktif'}
              </h4>
              <p className={`text-xs ${privacyCtx.isAggregateDataOnly ? 'text-amber-700' : 'text-teal-700'} font-medium`}>
                  {privacyCtx.isAggregateDataOnly 
                    ? 'Bu segmentte çok fazla sorgu yaptığınız tespit edildi. Veriler dolaylı tanımlanabilirliği önlemek için gürültü eklenmiş (jittered) havuz verisi olarak gösterilmektedir.'
                    : 'Bu ekrandaki tüm veriler, dolaylı ifşa riskine karşı benzer araç havuzları üzerinden hesaplanmış teknik tahminlerdir.'
                  }
              </p>
          </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={20} /></div>
                <h3 className="font-semibold text-slate-700">Kondisyon Skoru</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{maskedHealth}<span className="text-lg text-slate-400">/100</span></p>
            {privacyCtx.maskingLevel !== 'NONE' && <p className="text-[9px] text-orange-500 font-bold mt-1 animate-pulse">DP MASKED</p>}
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><AlertOctagon size={20} /></div>
                <h3 className="font-semibold text-slate-700">Arıza Eğilimi</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{profile.failure_frequency_index}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Wrench size={20} /></div>
                <h3 className="font-semibold text-slate-700">Hasar Olasılığı</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">%{profile.damage_probability}</p>
        </div>

         <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TurkishLira size={20} /></div>
                <h3 className="font-semibold text-slate-700">Piyasa Endeksi</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800">{maskedPrice.toLocaleString('tr-TR')} ₺</p>
            {privacyCtx.maskingLevel !== 'NONE' && <p className="text-[9px] text-orange-500 font-bold mt-1">ROUNDED FOR PRIVACY</p>}
        </div>
      </div>

      {/* LIABILITY BANNER */}
      <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl mb-8 flex items-center justify-between border-l-4 border-amber-500 shadow-lg">
          <div className="flex items-center gap-4">
              <Shield className="text-amber-500" size={24} />
              <div>
                  <p className="text-sm font-bold uppercase tracking-tight">Dolaylı Tanımlanabilirlik Koruması</p>
                  <p className="text-xs text-slate-400">Çıktıların birleştirilerek anlam üretilmesi riski algoritmik olarak izlenmektedir. {privacyCtx.maskingLevel !== 'NONE' ? 'Veri güvenliği için dinamik gürültü eklenmiştir.' : 'Veriler şu an standart gizlilik seviyesindedir.'}</p>
              </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
              <Fingerprint size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Mosaic Block Active</span>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest text-slate-400">Grup Sağlık Analizi</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="Skor" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">Değer Tahmini (Grup Ortalaması)</h3>
            </div>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={resaleData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `${val/1000}k`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <Tooltip formatter={(val: number) => `${val.toLocaleString()} ₺`} />
                        <Area type="monotone" dataKey="price" stroke="#10b981" fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
          <button 
                onClick={() => setIsPdfModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-black font-bold shadow-xl transition-all active:scale-95"
            >
                <FileText size={18} className="text-emerald-400" /> Mühürlü Rapor Üret
          </button>
      </div>

      {profile && (
        <PdfExportModal 
            isOpen={isPdfModalOpen} 
            onClose={() => setIsPdfModalOpen(false)} 
            profile={profile}
            parts={parts}
            history={damageHistory}
        />
      )}
    </div>
  );
};
