
import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, AlertCircle, Scan, Hash, Info, Calendar, Gauge, Check, ShieldCheck, ChevronRight, ZapOff } from 'lucide-react';
import { generateVehicleId } from '../services/anonymizer';
import { addSearchedVehicle } from '../services/dataService';
import { recordQueryActivity, getCurrentUserSecurity, calculatePrivacyContext } from '../services/securityService';

interface VinInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleFound: (vehicleId: string) => void;
}

export const VinInputModal: React.FC<VinInputModalProps> = ({ isOpen, onClose, onVehicleFound }) => {
  const [activeTab, setActiveTab] = useState<'VIN' | 'MANUAL'>('VIN');
  const [vin, setVin] = useState('');
  const [manualData, setManualData] = useState({
      brand: 'BMW',
      model: '',
      year: '2020',
      km: '',
      city: '34'
  });

  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'IDLE' | 'VALIDATING' | 'ANONYMIZING' | 'FETCHING'>('IDLE');
  const [error, setError] = useState('');

  // Get current user context for Multi-tenancy
  const currentUser = getCurrentUserSecurity();

  useEffect(() => {
    if(isOpen) {
        setVin('');
        setManualData({ brand: 'BMW', model: '', year: '2020', km: '', city: '34' });
        setConsent(false);
        setError('');
        setLoading(false);
        setStep('IDLE');
        setActiveTab('VIN');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!consent) {
      setError('Devam etmek için açık rıza beyanını onaylamanız gerekmektedir.');
      return;
    }
    
    if (activeTab === 'VIN' && vin.length < 10) {
      setError('Geçerli bir VIN numarası giriniz (En az 10 karakter).');
      return;
    }

    setLoading(true);
    try {
      setStep('VALIDATING');
      await new Promise(r => setTimeout(r, 600));

      // ANTI-CORRELATION CHECK: Segment bazlı risk denetimi
      const pCtx = calculatePrivacyContext(manualData.brand, manualData.model || "generic");
      if (pCtx.correlationScore > 95) {
          throw new Error("DOLAYLI TANIMLAMA RİSKİ: Bu segmentte çok fazla sorgu yaptınız. Güvenlik politikası gereği yeni sorgu geçici olarak durduruldu.");
      }

      setStep('ANONYMIZING');
      
      let vehicleId = '';
      if (activeTab === 'VIN') {
          vehicleId = await generateVehicleId(vin, currentUser.department, currentUser.id);
      } else {
          await new Promise(r => setTimeout(r, 500));
          const randomSuffix = Math.random().toString(16).substring(2, 6).toUpperCase();
          vehicleId = `MANUAL-${manualData.brand.substring(0,3).toUpperCase()}-${randomSuffix}`;
      }
      
      setStep('FETCHING');
      
      // SECURITY TRACKING with Cluster Awareness
      await recordQueryActivity(manualData.brand, manualData.model);
      
      await addSearchedVehicle(vehicleId, activeTab === 'VIN' ? vin : undefined);
      
      await new Promise(r => setTimeout(r, 600));
      setVin(''); 
      onVehicleFound(vehicleId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'İşlem sırasında beklenmedik bir hata oluştu veya limitiniz aşıldı.');
      setStep('IDLE');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
        
        <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Scan className="text-emerald-600" size={24} />
                Güvenli Araç Tanımla
            </h3>
            <p className="text-xs text-slate-500 mt-1">Sorgularınız Korelasyon Analizi (Anti-Mosaic) ile izlenmektedir.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-100">
            <button onClick={() => setActiveTab('VIN')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'VIN' ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><Hash size={16} /> Hızlı VIN Sorgu</button>
            <button onClick={() => setActiveTab('MANUAL')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${activeTab === 'MANUAL' ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}><Calendar size={16} /> Manuel Oluştur</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-8 space-y-6">
                 <div className="relative">
                     <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center"><Shield size={24} className="text-emerald-600" /></div>
                 </div>
                 <div className="text-center space-y-2">
                     <h4 className="text-lg font-bold text-slate-800">
                         {step === 'VALIDATING' && 'Korelasyon Analizi...'}
                         {step === 'ANONYMIZING' && 'SafeCore Şifreleme (SHA-256)...'}
                         {step === 'FETCHING' && 'Mühürlü Kayıt Hazırlanıyor...'}
                     </h4>
                     <p className="text-sm text-slate-500">Mosaic atak koruması devrede.</p>
                 </div>
             </div>
          ) : (
             <form onSubmit={handleSubmit}>
                {activeTab === 'VIN' ? (
                    <div className="mb-6 space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Şase Numarası (VIN)</label>
                            <input type="text" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} placeholder="WBA..." className="w-full text-2xl font-mono uppercase tracking-widest p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-200" />
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Marka</label>
                            <select className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={manualData.brand} onChange={(e) => setManualData({...manualData, brand: e.target.value})}>
                                <option value="BMW">BMW</option><option value="Mercedes">Mercedes-Benz</option><option value="Audi">Audi</option><option value="Volkswagen">Volkswagen</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Model Serisi</label>
                            <input type="text" placeholder="Örn: 320i" className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={manualData.model} onChange={(e) => setManualData({...manualData, model: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Kilometre</label>
                            <input type="number" className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={manualData.km} onChange={(e) => setManualData({...manualData, km: e.target.value})} />
                        </div>
                    </div>
                )}

                {/* CONSENT FORM */}
                <div className="mb-6 bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Gizlilik ve Korelasyon Onayı</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                        Bu sistemde yapılan sorgular, çıktıların birleştirilerek anlam üretilmesini (dolaylı tanımlanabilirlik) önlemek amacıyla diferansiyel gizlilik kalkanı ile korunmaktadır. Segment bazlı sorgu yoğunluğu arttıkça veriler otomatik olarak gürültü eklenmiş havuz verisine dönüşecektir.
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer group p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="relative flex items-center">
                            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-white/20 transition-all checked:border-emerald-500 checked:bg-emerald-500" />
                            <Check className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" size={14} strokeWidth={4} />
                        </div>
                        <span className="text-xs font-bold text-emerald-400">Prensibi anladım, onaylıyorum.</span>
                    </label>
                </div>

                {error && <div className="mb-4 flex items-center gap-2 text-rose-600 text-sm bg-rose-50 p-3 rounded-lg border border-rose-100 animate-in slide-in-from-top-2"><ZapOff size={16} /> {error}</div>}

                <button type="submit" disabled={!consent} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                    Sorgulamayı Başlat <ChevronRight size={18} />
                </button>
             </form>
          )}
        </div>
      </div>
    </div>
  );
};
