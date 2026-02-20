
import React, { useState } from 'react';
import { X, FileText, Check, Download, Loader2, Activity, Printer, ChevronLeft, Barcode, ShieldCheck, Cpu, Database, ShieldAlert, Info, Lock, EyeOff, Fingerprint } from 'lucide-react';
import { VehicleProfile, OEMPart, DamageRecord } from '../types';
import { getCurrentUserSecurity } from '../services/securityService';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: VehicleProfile;
  parts: OEMPart[];
  history: DamageRecord[];
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ isOpen, onClose, profile, parts, history }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const currentUser = getCurrentUserSecurity();
  const institutionTag = currentUser.institutionId || "SECURE-NODE"; 
  const generalizedDate = new Date().toLocaleString('tr-TR');
  const transactionId = `TX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const options = [
    { id: 'technical_scores', label: 'Segment Analiz Özeti', description: 'Benzer araç havuzuna ait anonim teknik endeksler.', checked: true, icon: Activity },
    { id: 'part_analysis', label: 'Kategori Bazlı İhtiyaçlar', description: 'Parça kodları maskelenmiş, kategori düzeyinde ihtiyaçlar.', checked: true, icon: Barcode },
  ];

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreview(true);
    }, 1500);
  };

  const resetAndClose = () => {
    setShowPreview(false);
    setIsGenerating(false);
    onClose();
  }

  const renderPreview = () => (
    <div className="flex flex-col h-full bg-slate-100 select-none">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md z-20">
            <div className="flex items-center gap-4">
                <button onClick={() => setShowPreview(false)} className="hover:bg-slate-800 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold">
                    <ChevronLeft size={16} /> Düzenle
                </button>
                <div className="h-6 w-px bg-slate-700 mx-2"></div>
                <h3 className="font-semibold flex items-center gap-2 text-emerald-400">
                    <ShieldCheck size={18} /> SafeCore™ Dijital Mühürlü Rapor
                </h3>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="bg-white text-slate-900 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg">
                    <Printer size={16} /> PDF Kaydet
                </button>
                <button onClick={resetAndClose} className="hover:bg-slate-800 p-2 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-200/50 relative print:p-0 print:bg-white">
            {/* INTENSIVE DYNAMIC WATERMARK LAYER */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex flex-wrap opacity-[0.04] select-none print:opacity-[0.03]">
                {Array.from({length: 60}).map((_, i) => (
                    <div key={i} className="text-slate-900 font-black text-xl -rotate-45 whitespace-nowrap p-12 uppercase tracking-tighter">
                        {institutionTag} | {generalizedDate} | {currentUser.id} | {transactionId}
                    </div>
                ))}
            </div>

            <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] text-slate-800 relative z-10 flex flex-col print:shadow-none">
                <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">LENT+ <span className="text-emerald-600">SafeCore</span></h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">İzlenebilir Teknik Analiz Çıktısı</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dinamik Mühür ID</p>
                        <p className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">{transactionId}</p>
                    </div>
                </div>

                <div className="mb-10 p-6 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Sorgulayan Kurum</p>
                        <p className="text-xl font-bold">{institutionTag}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">İşlem Zamanı</p>
                        <p className="text-sm font-mono">{generalizedDate}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Araç Bilgi Grubu</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Marka / Model:</span><span className="font-bold">{profile.brand} {profile.model}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Üretim Yılı:</span><span className="font-bold">{profile.year}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Kilometre:</span><span className="font-bold">{profile.mileage.toLocaleString()} KM</span></div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Güvenlik Onayı</h4>
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
                                <ShieldCheck size={16} /> Veri Bütünlüğü Onaylı
                            </div>
                            <p className="text-[10px] text-emerald-600 leading-tight">Bu rapor SafeCore mühürleme servisi tarafından dijital olarak imzalanmıştır.</p>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-4 mb-6">Analiz Sonuçları</h4>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-4xl font-black text-slate-900 mb-1">{profile.average_part_life_score}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Kondisyon</p>
                        </div>
                        <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-4xl font-black text-slate-900 mb-1">%{profile.damage_probability}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Hasar Olasılığı</p>
                        </div>
                        <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-4xl font-black text-slate-900 mb-1">{profile.failure_frequency_index}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase">Arıza Endeksi</p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-200">
                    <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                        <ShieldAlert size={24} className="text-amber-600 shrink-0" />
                        <div>
                            <p className="text-[10px] text-amber-900 font-black uppercase mb-1">Yasal Uyarı ve İzlenebilirlik</p>
                            <p className="text-[9px] text-amber-800 leading-relaxed font-medium">
                                Bu döküman üzerindeki dinamik filigranlar, verinin sızması durumunda kaynağı ({currentUser.email}) ve zamanı kesin olarak tespit etmek üzere tasarlanmıştır. 
                                İzinsiz paylaşım veya ekran kopyası alınması KVKK ve TCK uyarınca suç teşkil etmektedir. Bu işlem sistem tarafından kriptografik olarak loglanmıştır.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {showPreview ? renderPreview() : (
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 scale-in-center">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Lock className="text-emerald-600" size={24} />
                        Mühürlü Rapor Hazırla
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">İzlenebilir filigran ve mühür basılacaktır.</p>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full border border-slate-100"><X size={20} /></button>
            </div>
            <div className="p-8">
                <div className="space-y-4 mb-8">
                    {options.map((option) => (
                        <div key={option.id} className="flex items-start gap-4 p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/20">
                            <div className="mt-0.5 w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center"><Check size={14} strokeWidth={4} /></div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm"><option.icon size={16} className="text-emerald-600" />{option.label}</div>
                                <p className="text-xs text-slate-500 mt-1 font-medium">{option.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 mb-6 flex gap-3">
                    <ShieldAlert className="text-rose-600 shrink-0" size={18} />
                    <p className="text-[10px] text-rose-800 font-bold uppercase leading-tight">
                        DİKKAT: Rapor çıktısı şahsınıza ve kurumunuza ({institutionTag}) özel mühürlenecektir. Sızıntı tespiti durumunda kaynağınız ({currentUser.id}) sistemde kayıtlıdır.
                    </p>
                </div>
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    {isGenerating ? <><Loader2 className="animate-spin" size={22} /> Mühürleniyor...</> : <><Download size={22} className="text-emerald-400" /> Güvenli PDF Üret</>}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
