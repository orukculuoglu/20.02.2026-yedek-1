import React, { useState, useEffect } from 'react';
import { 
    Settings, Shield, Zap, Save, RefreshCcw, 
    CheckSquare, Square, Info, Server, Cpu, 
    ToggleLeft, ToggleRight, Loader2, CheckCircle2 
} from 'lucide-react';
import { getServiceIntakePolicy, updateServiceIntakePolicy } from '../services/dataService';
import { ServiceIntakePolicy, ServiceIntakeMode, ErpSyncPolicy, AssistantPrivilege } from '../types';
import { ErpSyncRule } from './RepairShops';

interface SettingsPanelProps {
    tenantId: string;
    erpSyncRule: ErpSyncRule;
    onChangeErpSyncRule: (rule: ErpSyncRule) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    tenantId, 
    erpSyncRule, 
    onChangeErpSyncRule 
}) => {
    const [policy, setPolicy] = useState<ServiceIntakePolicy | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setLoading(true);
        getServiceIntakePolicy(tenantId).then(data => {
            setPolicy(data);
            setLoading(false);
        });
    }, [tenantId]);

    const handleSave = async () => {
        if (!policy) return;
        setSaving(true);
        await updateServiceIntakePolicy(tenantId, policy);
        setSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const toggleField = (field: keyof ServiceIntakePolicy['requiredFields']) => {
        if (!policy) return;
        setPolicy({
            ...policy,
            requiredFields: {
                ...policy.requiredFields,
                [field]: !policy.requiredFields[field]
            }
        });
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="font-bold">Ayarlar Yükleniyor...</p>
            </div>
        );
    }

    if (!policy) return null;

    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500 space-y-8 pb-20">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Settings size={28} className="text-slate-600" /> Operasyonel Ayarlar
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Servis kabul süreçleri ve sistem entegrasyon kurallarını yapılandırın.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Değişiklikleri Kaydet
                </button>
            </div>

            {showSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-800 animate-in slide-in-from-top-2">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                    <span className="font-bold text-sm">Ayarlar başarıyla güncellendi ve ERP köprüsüne iletildi.</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kabul Süreci Ayarları */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Shield size={18} className="text-emerald-600" /> Kabul Zorunlulukları
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Zorunlu Alanlar</p>
                        {Object.entries(policy.requiredFields).map(([key, val]) => (
                            <div 
                                key={key}
                                onClick={() => toggleField(key as any)}
                                className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-slate-200 transition-all cursor-pointer group"
                            >
                                <span className="text-sm font-bold text-slate-700 capitalize">
                                    {key === 'vin' ? 'Şase No (VIN)' : 
                                     key === 'plate' ? 'Plaka' : 
                                     key === 'km' ? 'Kilometre' : 
                                     key === 'damageNote' ? 'Hasar Notu' : 
                                     key === 'photos' ? 'Araç Fotoğrafları' : 
                                     key === 'customerConsent' ? 'KVKK Onayı' : key}
                                </span>
                                {val ? (
                                    <ToggleRight size={28} className="text-indigo-600" />
                                ) : (
                                    <ToggleLeft size={28} className="text-slate-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Akış Politikası */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Zap size={18} className="text-amber-500" /> Akış Modu
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Varsayılan Giriş Modu</label>
                                <select 
                                    value={policy.defaultMode}
                                    onChange={(e) => setPolicy({...policy, defaultMode: e.target.value as ServiceIntakeMode})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="FAST_OVERLAY">Hızlı Katman (Fast Overlay)</option>
                                    <option value="CLASSIC">Klasik Form (Classic)</option>
                                    <option value="AI_ASSISTED">AI Destekli (Otomatik Tanıma)</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Asistan Yetki Seviyesi</label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'CAN_ADD_TO_WORKORDER', label: 'Doğrudan Kalem Ekleme' },
                                        { id: 'SUGGEST_ONLY', label: 'Yalnızca Öneri Sunma' },
                                        { id: 'NONE', label: 'Asistanı Devre Dışı Bırak' }
                                    ].map(opt => (
                                        <div 
                                            key={opt.id}
                                            onClick={() => setPolicy({...policy, assistantPrivilege: opt.id as AssistantPrivilege})}
                                            className={`p-3 rounded-xl border text-sm font-bold cursor-pointer transition-all ${
                                                policy.assistantPrivilege === opt.id 
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                                : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ERP Senkronizasyon Politikası */}
                    <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <h3 className="font-bold text-white flex items-center gap-2 mb-6">
                            <Server size={18} className="text-indigo-400" /> ERP Senkronizasyon Kuralı
                        </h3>
                        <div className="space-y-3">
                            {[
                                { id: 'INTAKE', label: 'Araç Kabul Anında (Real-time)', desc: 'İş emri açıldığı an ERP verisi oluşur.' },
                                { id: 'OUTBOX', label: 'Outbox (Offline First)', desc: 'Veriler kuyruğa alınır, asenkron iletilir.' },
                                { id: 'CUSTOMER_APPROVAL', label: 'Müşteri Onayı Sonrası', desc: 'Sadece onaylanan kalemler ERPye aktarılır.' }
                            ].map(opt => (
                                <div 
                                    key={opt.id}
                                    onClick={() => onChangeErpSyncRule(opt.id as ErpSyncRule)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                        erpSyncRule === opt.id 
                                        ? 'bg-white/10 border-indigo-500 ring-1 ring-indigo-500' 
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold">{opt.label}</span>
                                        {erpSyncRule === opt.id && <CheckCircle2 size={16} className="text-emerald-400" />}
                                    </div>
                                    <p className="text-[10px] text-slate-400">{opt.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-start gap-4">
                <Info size={24} className="text-blue-500 shrink-0 mt-1" />
                <div>
                    <h4 className="font-black text-blue-900 uppercase text-xs mb-1">Güvenlik ve Uyumluluk Notu</h4>
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">
                        Zorunlu alan değişiklikleri tüm yeni kabul işlemlerini anında etkiler. "KVKK Onayı" alanı kapatıldığında, sistem dijital mühürlü PDF rapor üretimine izin vermeyebilir. Tüm değişiklikler SafeCore™ Audit Log mekanizması tarafından mühürlenir.
                    </p>
                </div>
            </div>
        </div>
    );
};