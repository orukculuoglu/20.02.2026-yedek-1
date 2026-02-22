import React, { useState, useEffect } from 'react';
import { 
    Plus, X, Shield, Eye, EyeOff, FileText, 
    Wrench, Search, ArrowRight, Zap, CheckCircle,
    Play, Send, Link, Copy, AlertCircle, ChevronRight,
    Loader2, Package, Bot
} from 'lucide-react';
import { ServiceWorkOrder } from '../types';

interface ServiceIntakeOverlayProps {
    workOrderId?: string | null;
    onOpen?: () => void;
    workOrders: ServiceWorkOrder[];
    assistantSuggestions: Record<string, any[]>;
    onApplySuggestion: (orderId: string, suggestion: any) => Promise<void>;
}

/**
 * sha256Hex
 * WebCrypto API kullanarak veriyi geri döndürülemez şekilde mühürler.
 */
async function sha256Hex(text: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function ServiceIntakeOverlay({ 
    workOrderId, 
    onOpen, 
    workOrders, 
    assistantSuggestions,
    onApplySuggestion 
}: ServiceIntakeOverlayProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSecureMode, setIsSecureMode] = useState(true); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State (UI level only)
    const [vin, setVin] = useState('');
    const [plate, setPlate] = useState('');
    const [customer, setCustomer] = useState('');
    const [mileage, setMileage] = useState(0);
    
    // Local flow tracking
    const [lastCreatedWorkOrderId, setLastCreatedWorkOrderId] = useState<string | null>(null);
    const [magicLink, setMagicLink] = useState<string | null>(null);

    // Derive current active order
    const activeOrderId = workOrderId || lastCreatedWorkOrderId;
    const activeOrder = workOrders.find(o => o.id === activeOrderId);
    const pendingSuggestions = activeOrderId ? (assistantSuggestions[activeOrderId] || []) : [];

    useEffect(() => {
        if (workOrderId) {
            setLastCreatedWorkOrderId(workOrderId);
        }
    }, [workOrderId]);

    const handleCreateWorkOrder = async () => {
        if (!vin || vin.length !== 17) {
            alert("Lütfen geçerli bir 17 haneli Şase No giriniz.");
            return;
        }
        if (!mileage || mileage < 0) {
            alert("Lütfen geçerli bir kilometre değeri giriniz.");
            return;
        }

        setIsSubmitting(true);
        try {
            // PATENT MODU: VIN değerini asla gönderme, sadece hash gönder.
            const vHash = await sha256Hex(vin.trim().toUpperCase());
            const vLast4 = vin.slice(-4);

            const detail = {
                type: 'CREATE_WORK_ORDER_FROM_INTAKE',
                source: 'SERVICE_INTAKE_OVERLAY',
                data: {
                    vinHash: vHash,
                    vinLast4: vLast4,
                    plate: plate.trim().toUpperCase(),
                    customer: customer.trim(),
                    mileage: mileage,
                    hasContext: true
                },
                timestamp: Date.now()
            };

            window.dispatchEvent(new CustomEvent('LENT_INTENT', { detail }));
            
            // UI Temizliği (VIN bellekte tutulmasın)
            setVin('');
        } catch (error) {
            console.error("[SafeCore] Mühürleme hatası:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickStatus = (status: 'INTAKE' | 'DIAGNOSIS' | 'OFFER' | 'APPROVAL') => {
        const activeId = activeOrderId;
        if (!activeId) return;

        if (status === 'APPROVAL') {
            const link = `https://lent.plus/approve/${activeId}?t=${Date.now()}`;
            setMagicLink(link);
            window.dispatchEvent(new CustomEvent('LENT_INTENT', {
                detail: {
                    type: 'APPROVAL_LINK_GENERATED',
                    workOrderId: activeId,
                    source: 'INTAKE_OVERLAY',
                    linkHash: 'HASHED_LINK',
                    timestamp: Date.now()
                }
            }));
        } else {
            setMagicLink(null);
        }

        const detail = {
            type: 'WORK_ORDER_SET_STATUS',
            workOrderId: activeId,
            nextStatus: status,
            source: 'INTAKE_OVERLAY',
            createdAt: Date.now()
        };
        window.dispatchEvent(new CustomEvent('LENT_INTENT', { detail }));
    };

    const handleInternalOpen = () => {
        setIsOpen(true);
        if (onOpen) onOpen();
    };

    if (!isOpen) {
        return (
            <button 
                onClick={handleInternalOpen}
                className="fixed bottom-8 left-8 z-[60] bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-3 font-bold group"
            >
                <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                <span className="hidden md:inline">Araç Kabul</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="text-indigo-600" /> Hızlı Araç Kabul
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 font-medium">SafeCore™ Patent Modu v3 (Zero-VIN Storage)</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    
                    {/* Zone 1: Quick Intake */}
                    <div className="w-1/3 bg-white p-8 border-r border-slate-100 flex flex-col gap-6 overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-700">Kimlik & Bağlam</h3>
                            <button 
                                onClick={() => setIsSecureMode(!isSecureMode)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isSecureMode ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                            >
                                {isSecureMode ? <Shield size={14} /> : <EyeOff size={14} />}
                                {isSecureMode ? 'Gizli Mod' : 'Açık Mod'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">VIN (Şase No)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        maxLength={17}
                                        value={vin}
                                        onChange={e => setVin(e.target.value.toUpperCase())}
                                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${isSecureMode ? 'blur-sm focus:blur-none transition-all' : ''}`}
                                        placeholder="WBA..."
                                    />
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Plaka</label>
                                <input 
                                    type="text" 
                                    value={plate}
                                    onChange={e => setPlate(e.target.value.toUpperCase())}
                                    className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none ${isSecureMode ? 'blur-sm focus:blur-none transition-all' : ''}`}
                                    placeholder="34..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Müşteri</label>
                                <input 
                                    type="text" 
                                    value={customer}
                                    onChange={e => setCustomer(e.target.value)}
                                    className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none ${isSecureMode ? 'blur-sm focus:blur-none transition-all' : ''}`}
                                    placeholder="Ad Soyad"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kilometre (KM)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={mileage}
                                    onChange={e => setMileage(parseInt(e.target.value, 10) || 0)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="64500"
                                />
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex gap-2">
                                <Shield className="text-indigo-600 shrink-0" size={16} />
                                <p className="text-[10px] text-indigo-700 leading-tight">
                                    Patent Modu: Şase numarası sistemde asla ham halde saklanmaz. Sadece SHA-256 mühürleri ile bağlam kurulur.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Zone 2: Sync Zone (Applied Parts & Suggestions) */}
                    <div className="w-1/3 bg-slate-50/50 p-8 border-r border-slate-100 flex flex-col overflow-y-auto">
                        <h3 className="font-bold text-slate-700 mb-4">Sinyal ve Kayıtlar</h3>
                        
                        {activeOrder && (
                            <div className="space-y-6">
                                {/* Applied Items Section */}
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                                        <Package size={12} /> Kayıtlı Kalemler ({activeOrder.diagnosisItems.length})
                                    </h4>
                                    <div className="space-y-2">
                                        {activeOrder.diagnosisItems.map(item => (
                                            <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{item.item}</p>
                                                    <p className="text-[10px] text-emerald-600 font-bold">{item.signalCost.toLocaleString()} ₺</p>
                                                </div>
                                                <div className="text-emerald-500"><CheckCircle size={16} /></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Assistant Suggestions Section */}
                                <div>
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-3 flex items-center gap-2">
                                        <Bot size={12} /> Asistan Sinyalleri ({pendingSuggestions.length})
                                    </h4>
                                    <div className="space-y-3">
                                        {pendingSuggestions.length > 0 ? pendingSuggestions.map((item, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm animate-in slide-in-from-right-2">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">{item.kind}</span>
                                                    <button 
                                                        onClick={() => onApplySuggestion(activeOrderId, item)}
                                                        className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold hover:bg-indigo-700"
                                                    >
                                                        Uygula
                                                    </button>
                                                </div>
                                                <p className="text-xs font-bold text-slate-800 mt-1">{item.title}</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{item.priceRange}</p>
                                            </div>
                                        )) : (
                                            <div className="text-center py-6 text-slate-400 text-[10px] italic border-2 border-dashed border-slate-200 rounded-xl">
                                                Ek bekleyen sinyal yok.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!activeOrder && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                <Package size={48} className="opacity-10 mb-4" />
                                <p className="text-sm">Asenkron parça ve asistan sinyalleri için bir iş emri aktif olmalıdır.</p>
                            </div>
                        )}
                    </div>

                    {/* Zone 3: Work Order Bridge & Quick Flow */}
                    <div className="w-1/3 bg-white p-8 flex flex-col overflow-y-auto">
                        
                        {!activeOrderId ? (
                            <div className="flex flex-col justify-center items-center text-center h-full">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                                    <Wrench size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">İş Emri Başlat</h3>
                                <p className="text-sm text-slate-500 mb-8 max-w-xs">
                                    Girilmiş olan bağlam ve seçilen aksiyonlarla yeni bir iş emri oluşturulacaktır.
                                </p>
                                
                                <button 
                                    onClick={handleCreateWorkOrder}
                                    disabled={!vin || vin.length < 17 || !mileage || mileage < 0 || isSubmitting}
                                    className="w-full max-w-xs py-4 bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="animate-spin" size={20} /> Mühürleniyor...</>
                                    ) : (
                                        <>İş Emri Oluştur <ArrowRight size={20} /></>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full animate-in slide-in-from-right-4">
                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle size={20} className="text-emerald-600" />
                                        <h4 className="font-bold text-emerald-800">İş Emri Aktif</h4>
                                    </div>
                                    <p className="text-xs text-emerald-700 font-mono">ID: {activeOrderId}</p>
                                </div>

                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Play size={14} className="text-indigo-600"/> Hızlı Akış
                                </h3>

                                <div className="space-y-3">
                                    <button onClick={() => handleQuickStatus('INTAKE')} className="w-full p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 rounded-xl text-left flex items-center justify-between transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 font-bold">1</div>
                                            <span className="font-bold text-slate-700 text-sm">Kabul Al</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500"/>
                                    </button>

                                    <button onClick={() => handleQuickStatus('DIAGNOSIS')} className="w-full p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 rounded-xl text-left flex items-center justify-between transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 font-bold">2</div>
                                            <span className="font-bold text-slate-700 text-sm">Teşhise Başla</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500"/>
                                    </button>

                                    <button onClick={() => handleQuickStatus('OFFER')} className="w-full p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 rounded-xl text-left flex items-center justify-between transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 font-bold">3</div>
                                            <span className="font-bold text-slate-700 text-sm">Teklif Oluştur</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500"/>
                                    </button>

                                    <button onClick={() => handleQuickStatus('APPROVAL')} className="w-full p-3 bg-slate-900 text-white rounded-xl text-left flex items-center justify-between transition-all hover:bg-black shadow-lg group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">4</div>
                                            <span className="font-bold text-sm">Onaya Gönder</span>
                                        </div>
                                        <Send size={16} className="text-indigo-200 group-hover:text-white"/>
                                    </button>
                                </div>

                                {magicLink && (
                                    <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                            <Link size={10} /> Müşteri Onay Linki
                                        </label>
                                        <div className="flex gap-2">
                                            <input readOnly value={magicLink} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 outline-none" />
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText(magicLink); alert("Link kopyalandı!"); }}
                                                className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
