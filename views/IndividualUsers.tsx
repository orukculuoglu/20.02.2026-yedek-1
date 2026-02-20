
import React, { useState } from 'react';
import { 
    Car, Wrench, AlertTriangle, Shield, CheckCircle, 
    Signal, Radio, MapPin, Activity, Zap, PackageSearch, 
    ArrowRight, X, Loader2, Info, ArrowLeft, Filter, 
    AlertOctagon, Clock, Calendar, CheckSquare, Eye, EyeOff,
    Thermometer, CloudRain, AlertCircle, ThumbsUp, Wallet, Barcode, Star, ShieldCheck,
    Navigation, Briefcase, ShoppingBag, CreditCard, Truck, CalendarCheck, UserCheck, Check
} from 'lucide-react';
import { ViewState } from '../types';

interface IndividualUsersProps {
    onNavigate?: (view: ViewState, id?: string) => void;
}

// --- CONSTITUTIONAL TYPES ---
type ContextState = 'IDLE' | 'CONTEXT_LOCKED' | 'INTENT_DECLARED' | 'SIGNAL_PROCESSING';
type IntentType = 'MAINTENANCE' | 'PART_NEED' | 'ISSUE';
type FlowStep = 'SELECTION' | 'DECISION' | 'PURCHASE' | 'SERVICE' | 'SUCCESS';
type SignalLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

interface PartTier {
    id: string;
    tier: 'OEM' | 'PREMIUM' | 'ECONOMIC';
    priceRange: string;
    availabilitySignal: SignalLevel;
    oemCode?: string; // Hidden by default
    techName?: string; // Hidden by default
}

interface ServiceNode {
    id: string;
    nodeName: string; // "Maslak Capacity Node" etc.
    loadSignal: SignalLevel;
    nextSlotSignal: string; // "Tomorrow", "Next Week"
    estPriceRange: string;
    distance: string;
    supportedTypes: string[];
}

interface Symptom {
    id: string;
    label: string;
    description: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    icon: any;
}

// --- MOCK SIGNAL SOURCES (No Raw Data) ---
const RAW_VEHICLES = [
    { id: 'ctx-01', brand: 'BMW', model: '320i', year: 2020, plate: '34 VM 228', km: 64500, healthScore: 85 },
    { id: 'ctx-02', brand: 'Fiat', model: 'Egea', year: 2022, plate: '34 ABC 123', km: 24000, healthScore: 92 },
];

const PART_CATEGORIES = [
    { id: 'cat-brake', name: 'Fren Sistemi', icon: AlertOctagon },
    { id: 'cat-filter', name: 'Filtre Seti', icon: Filter },
    { id: 'cat-oil', name: 'Sıvı & Yağ', icon: Zap },
    { id: 'cat-susp', name: 'Süspansiyon', icon: Activity },
];

const PART_TIERS: PartTier[] = [
    { id: 't-oem', tier: 'OEM', priceRange: '~4.200 - 4.500 ₺', availabilitySignal: 'HIGH', oemCode: '34116850', techName: 'Brake Disc Ventilated' },
    { id: 't-prem', tier: 'PREMIUM', priceRange: '~2.800 - 3.200 ₺', availabilitySignal: 'MEDIUM', oemCode: '09.C394.13', techName: 'Brembo Xtra Line' },
    { id: 't-eco', tier: 'ECONOMIC', priceRange: '~1.500 - 1.800 ₺', availabilitySignal: 'LOW', oemCode: 'DF6602', techName: 'Standard Disc' },
];

const SERVICE_NODES: ServiceNode[] = [
    { 
        id: 'srv-01', 
        nodeName: 'Maslak Kapasite Noktası', 
        loadSignal: 'HIGH', 
        nextSlotSignal: '3 Gün Sonra', 
        estPriceRange: '1.2k - 1.5k ₺',
        distance: '4.2 km',
        supportedTypes: ['Genel Bakım', 'Fren Sistemi']
    },
    { 
        id: 'srv-02', 
        nodeName: 'Bostancı Kapasite Noktası', 
        loadSignal: 'LOW', 
        nextSlotSignal: 'Yarın', 
        estPriceRange: '1.1k - 1.4k ₺',
        distance: '12.8 km',
        supportedTypes: ['Genel Bakım', 'Elektrik', 'Lastik']
    },
];

const SYMPTOMS: Symptom[] = [
    { id: 'sym-eng', label: 'Motor İkazı', description: 'Motor arıza lambası yanıyor veya performans düşük.', riskLevel: 'MEDIUM', icon: Zap },
    { id: 'sym-brk', label: 'Fren Sesi', description: 'Frenleme sırasında ses veya titreme.', riskLevel: 'HIGH', icon: AlertOctagon },
    { id: 'sym-liq', label: 'Sıvı Eksiltme', description: 'Alt kısımda su veya yağ lekesi.', riskLevel: 'MEDIUM', icon: CloudRain },
    { id: 'sym-unk', label: 'Bilinmeyen Ses', description: 'Yürüyen aksamdan gelen tıkırtı veya uğultu.', riskLevel: 'LOW', icon: Activity },
];

// --- STATIC CONTEXT MAPPING (No Personalization) ---
const SEASONAL_CONTEXT_MAP = [
    { 
        id: 'ctx-static-winter', 
        title: 'Kış Bakım Sinyali', 
        description: 'Düşük sıcaklıklar için antifriz ve servis kontrolü.', 
        actionLabel: 'Servis Durumu', 
        staticIntentMap: 'MAINTENANCE' as IntentType, 
        icon: Thermometer,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
    },
    { 
        id: 'ctx-static-rain', 
        title: 'Görüş Güvenliği', 
        description: 'Yağışlı sezon için silecek ve aydınlatma parçaları.', 
        actionLabel: 'Parçaları İncele', 
        staticIntentMap: 'PART_NEED' as IntentType, 
        icon: CloudRain,
        color: 'text-slate-500',
        bg: 'bg-slate-100'
    }
];

// Helper for user-friendly descriptions
const getTierDescription = (tier: string) => {
    switch(tier) {
        case 'OEM': return "Fabrika montajında kullanılan orijinal parça. Garantiyi korur, en uzun ömürlüdür.";
        case 'PREMIUM': return "Orijinal üreticilerle aynı standartta, yüksek performanslı önerilen tercih.";
        case 'ECONOMIC': return "Standart kalite testlerinden geçmiş, bütçe dostu güvenli alternatif.";
        default: return "";
    }
}

export const IndividualUsers: React.FC<IndividualUsersProps> = ({ onNavigate }) => {
    const [state, setState] = useState<ContextState>('IDLE');
    const [activeContext, setActiveContext] = useState<any | null>(null);
    const [activeIntent, setActiveIntent] = useState<IntentType | null>(null);
    const [processing, setProcessing] = useState(false);
    
    // Flow States
    const [flowStep, setFlowStep] = useState<FlowStep>('SELECTION');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTier, setSelectedTier] = useState<PartTier | null>(null);
    const [showAdvancedParts, setShowAdvancedParts] = useState(false);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
    
    // Purchase & Booking Specific States
    const [deliveryMode, setDeliveryMode] = useState<'HOME' | 'SERVICE'>('HOME');
    const [bookingSlot, setBookingSlot] = useState<string | null>(null);
    const [consentGiven, setConsentGiven] = useState(false);

    // --- SIGNAL EMITTERS ---
    const emitSignal = (event: string, payload: any) => {
        console.info(`[SIGNAL_EMIT] ${event}`, payload);
    };

    // --- CONSTITUTIONAL HELPERS ---
    const maskIdentity = (vehicle: any) => ({
        ...vehicle,
        plate: `${vehicle.plate.substring(0, 2)} *** ${vehicle.plate.slice(-2)}`,
        id: `CTX-${vehicle.id.split('-')[1].toUpperCase()}`
    });

    const establishContext = (vehicle: any) => {
        setProcessing(true);
        setTimeout(() => {
            setActiveContext(maskIdentity(vehicle));
            setState('CONTEXT_LOCKED');
            setProcessing(false);
            emitSignal('VEHICLE_CONTEXT_ESTABLISHED', { model: vehicle.model, year: vehicle.year });
        }, 600);
    };

    const declareIntent = (intent: IntentType) => {
        setActiveIntent(intent);
        setState('INTENT_DECLARED');
        // Reset sub-states
        setSelectedCategory(null);
        setSelectedSymptom(null);
        setSelectedService(null);
        setSelectedTier(null);
        setFlowStep('SELECTION');
        setConsentGiven(false);
        setBookingSlot(null);
        emitSignal('USER_INTENT_DECLARED', { intent });
    };

    const resetContext = () => {
        setActiveContext(null);
        setActiveIntent(null);
        setSelectedCategory(null);
        setShowAdvancedParts(false);
        setSelectedService(null);
        setSelectedSymptom(null);
        setSelectedTier(null);
        setFlowStep('SELECTION');
        setState('IDLE');
    };

    const handleTierSelection = (tier: PartTier) => {
        setSelectedTier(tier);
        setFlowStep('DECISION');
        emitSignal('BRAND_TIER_SELECTED', { tier: tier.tier, category: selectedCategory });
    };

    const handleConfirmAction = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setFlowStep('SUCCESS');
            if (activeIntent === 'PART_NEED' && flowStep === 'PURCHASE') {
                emitSignal('PART_PURCHASE_INITIATED', { 
                    tier: selectedTier?.tier, 
                    delivery: deliveryMode 
                });
            } else if (flowStep === 'SERVICE') {
                emitSignal('SERVICE_APPOINTMENT_REQUESTED', { 
                    node: selectedService, 
                    slot: bookingSlot 
                });
            }
        }, 1500);
    };

    // --- VIEWS ---

    const ContextSelectionView = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Araç Seçimi</h2>
            <p className="text-slate-500 mb-8 max-w-lg">
                İşlem yapmak istediğiniz araç bağlamını seçin. Kimlik verileri maskelenerek anonim sinyal oturumu açılacaktır.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {RAW_VEHICLES.map((v) => (
                    <div 
                        key={v.id}
                        onClick={() => establishContext(v)}
                        className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Car size={100} />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{v.brand} {v.model}</h3>
                                <p className="text-sm font-mono text-slate-400 mt-1">{v.year}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Radio size={16} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase">Bağlam Hazır</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const IntentDashboard = () => {
        if (!activeContext) return null;

        return (
            <div className="animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col max-w-5xl mx-auto">
                {/* Active Context Header */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl mb-8 flex items-center justify-between shadow-lg relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Car size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wide border border-emerald-500/30">Bağlam Etkin</span>
                                <span className="text-[10px] font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1"><Shield size={10} /> Kimlik Gizli</span>
                            </div>
                            <h2 className="text-xl font-bold">{activeContext.brand} {activeContext.model}</h2>
                        </div>
                    </div>
                    <button onClick={resetContext} className="relative z-10 p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {state === 'CONTEXT_LOCKED' && (
                    <>
                        {/* Primary Intent Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <button 
                                onClick={() => declareIntent('PART_NEED')}
                                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-lg transition-all text-left group"
                            >
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <PackageSearch size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Parça İhtiyacı</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Kategori bazlı, teknik kod gerektirmeyen parça seçimi.
                                </p>
                            </button>

                            <button 
                                onClick={() => declareIntent('MAINTENANCE')}
                                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-lg transition-all text-left group"
                            >
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Wrench size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Servis & Bakım</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Bölgesel kapasite noktalarından randevu sinyali.
                                </p>
                            </button>

                            <button 
                                onClick={() => declareIntent('ISSUE')}
                                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-lg transition-all text-left group"
                            >
                                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Arıza Bildirimi</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Belirti bazlı arıza sinyali ve yönlendirme.
                                </p>
                            </button>
                        </div>

                        {/* Seasonal Offers */}
                        <div className="mt-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Calendar size={14} /> Mevsimsel Öneriler (Genel)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SEASONAL_CONTEXT_MAP.map(offer => (
                                    <div key={offer.id} className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between hover:border-emerald-400 transition-colors group shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${offer.bg} ${offer.color}`}>
                                                <offer.icon size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{offer.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">{offer.description}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                emitSignal('SEASONAL_OFFER_SELECTED', { contextId: offer.id, mappedIntent: offer.staticIntentMap });
                                                declareIntent(offer.staticIntentMap);
                                            }}
                                            className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-lg flex items-center gap-2 group-hover:bg-emerald-600 group-hover:text-white transition-all whitespace-nowrap"
                                        >
                                            {offer.actionLabel} <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {state === 'INTENT_DECLARED' && activeIntent === 'PART_NEED' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Unified Flow Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <button onClick={() => { 
                                if (flowStep === 'SELECTION') { setSelectedCategory(null); setState('CONTEXT_LOCKED'); }
                                else if (flowStep === 'DECISION') { setFlowStep('SELECTION'); setSelectedTier(null); }
                                else if (flowStep === 'PURCHASE' || flowStep === 'SERVICE') { setFlowStep('DECISION'); setBookingSlot(null); setConsentGiven(false); }
                                else { resetContext(); }
                            }} className="hover:bg-slate-100 p-2 rounded-lg transition-colors"><ArrowLeft size={20} className="text-slate-500" /></button>
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    {flowStep === 'SELECTION' && (selectedCategory ? 'Kalite ve Bütçe Seçimi' : 'Parça Kategorisi')}
                                    {flowStep === 'DECISION' && 'İşlem Tercihi'}
                                    {flowStep === 'PURCHASE' && 'Satın Alma Onayı'}
                                    {flowStep === 'SERVICE' && 'Servis Planlama'}
                                    {flowStep === 'SUCCESS' && 'İşlem Başarılı'}
                                </h3>
                                {selectedCategory && flowStep !== 'SUCCESS' && (
                                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                                        <ShieldCheck size={12} /> Şasi (VIN) Uyumlu Parçalar
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Step 1: Category Selection */}
                        {flowStep === 'SELECTION' && !selectedCategory && (
                            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {PART_CATEGORIES.map(cat => (
                                    <div 
                                        key={cat.id} 
                                        onClick={() => { setSelectedCategory(cat.id); emitSignal('PART_CATEGORY_SELECTED', { category: cat.name }); }}
                                        className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer transition-all gap-3 text-center group"
                                    >
                                        <div className="p-4 bg-slate-50 rounded-full text-slate-500 group-hover:bg-white group-hover:text-emerald-600 transition-colors shadow-sm">
                                            <cat.icon size={28} />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm group-hover:text-emerald-700">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Step 1.5: Tier Selection */}
                        {flowStep === 'SELECTION' && selectedCategory && (
                            <div className="p-6 space-y-4 bg-slate-50/50 flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-slate-500">Kategori: <strong>{PART_CATEGORIES.find(c => c.id === selectedCategory)?.name}</strong></p>
                                    <button 
                                        onClick={() => setShowAdvancedParts(!showAdvancedParts)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 border transition-colors ${showAdvancedParts ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                    >
                                        {showAdvancedParts ? <EyeOff size={14}/> : <Eye size={14}/>}
                                        {showAdvancedParts ? 'Uzman Modunu Kapat' : 'Uzman Modu (SKU Göster)'}
                                    </button>
                                </div>

                                {showAdvancedParts && (
                                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 flex items-start gap-2 mb-4 animate-in fade-in">
                                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                        <p>Bu bilgiler teknik seviyededir. OEM kodları ve teknik isimler, uzman olmayan kullanıcılar için yanıltıcı olabilir.</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {PART_TIERS.map(tier => (
                                        <div 
                                            key={tier.id} 
                                            onClick={() => handleTierSelection(tier)}
                                            className={`relative border rounded-xl p-5 cursor-pointer transition-all bg-white group ${
                                                tier.tier === 'PREMIUM' ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500 bg-emerald-50/10' : 'border-slate-200 hover:border-emerald-400 hover:shadow-sm'
                                            }`}
                                        >
                                            {tier.tier === 'PREMIUM' && (
                                                <div className="absolute -top-3 left-6 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" /> Önerilen Seçim
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start gap-4">
                                                    <div className={`mt-1 w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 ${
                                                        tier.tier === 'OEM' ? 'border-blue-100 bg-blue-50 text-blue-600' : 
                                                        tier.tier === 'PREMIUM' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 
                                                        'border-slate-100 bg-slate-50 text-slate-500'
                                                    }`}>
                                                        {tier.tier === 'OEM' ? <ShieldCheck size={24}/> : tier.tier === 'PREMIUM' ? <ThumbsUp size={24}/> : <Wallet size={24}/>}
                                                    </div>

                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-base">
                                                            {tier.tier === 'OEM' ? 'Orijinal (OEM)' : tier.tier === 'PREMIUM' ? 'Premium Muadil' : 'Ekonomik Seri'}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[280px] font-medium">
                                                            {getTierDescription(tier.tier)}
                                                        </p>
                                                        
                                                        {showAdvancedParts && (
                                                            <div className="mt-3 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1.5 rounded w-fit border border-slate-200 flex items-center gap-2">
                                                                <Barcode size={12}/>
                                                                {tier.oemCode} • {tier.techName}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-slate-800">{tier.priceRange}</p>
                                                    <div className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase mt-1 inline-flex items-center gap-1 ${
                                                        tier.availabilitySignal === 'HIGH' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                                                        tier.availabilitySignal === 'MEDIUM' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                                    }`}>
                                                        {tier.availabilitySignal === 'HIGH' ? <CheckCircle size={10}/> : <Clock size={10}/>}
                                                        {tier.availabilitySignal === 'HIGH' ? 'Hemen Teslim' : tier.availabilitySignal === 'MEDIUM' ? '2-3 Gün' : 'Stok Sorunuz'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Decision Fork */}
                        {flowStep === 'DECISION' && selectedTier && (
                            <div className="p-8 flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-300 h-full">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Nasıl Devam Etmek İstersiniz?</h2>
                                    <p className="text-slate-500">Seçilen parça: <strong>{selectedTier.tier === 'OEM' ? 'Orijinal' : selectedTier.tier === 'PREMIUM' ? 'Premium' : 'Ekonomik'} {PART_CATEGORIES.find(c => c.id === selectedCategory)?.name}</strong></p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                                    <button 
                                        onClick={() => setFlowStep('PURCHASE')}
                                        className="group p-8 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all text-left relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <ShoppingBag size={100} />
                                        </div>
                                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <PackageSearch size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Sadece Parça Satın Al</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                            Parçayı adresinize veya belirlediğiniz bir noktaya kargolatın. Montaj hizmeti dahil değildir.
                                        </p>
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                            Devam Et <ArrowRight size={16} />
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => setFlowStep('SERVICE')}
                                        className="group p-8 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all text-left relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Wrench size={100} />
                                        </div>
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <CalendarCheck size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Servis ve Montaj Planla</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed mb-4">
                                            Size en yakın SafeCore noktasından randevu alın. Parça doğrudan servise gönderilir.
                                        </p>
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                                            Randevu Al <ArrowRight size={16} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3A: Purchase Flow */}
                        {flowStep === 'PURCHASE' && selectedTier && (
                            <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <ShoppingBag size={20} className="text-blue-600"/> Sipariş Özeti
                                    </h4>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-200">
                                        <span className="text-sm text-slate-600">Ürün</span>
                                        <span className="font-bold text-slate-800">{PART_CATEGORIES.find(c => c.id === selectedCategory)?.name} ({selectedTier.tier})</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-200">
                                        <span className="text-sm text-slate-600">Uyumluluk</span>
                                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded flex items-center gap-1">
                                            <ShieldCheck size={12}/> Şasi Doğrulandı
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-4">
                                        <span className="text-sm font-bold text-slate-700">Toplam Tutar</span>
                                        <span className="text-xl font-black text-slate-900">{selectedTier.priceRange}</span>
                                    </div>
                                </div>

                                <div className="max-w-2xl mx-auto space-y-4">
                                    <div className="flex gap-4 mb-6">
                                        <button 
                                            onClick={() => setDeliveryMode('HOME')}
                                            className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMode === 'HOME' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-500'}`}
                                        >
                                            <Truck size={24} />
                                            <span className="font-bold text-sm">Eve Teslimat</span>
                                        </button>
                                        <button 
                                            onClick={() => setDeliveryMode('SERVICE')}
                                            className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${deliveryMode === 'SERVICE' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-500'}`}
                                        >
                                            <Wrench size={24} />
                                            <span className="font-bold text-sm">Servis Noktasına</span>
                                        </button>
                                    </div>

                                    <button 
                                        onClick={handleConfirmAction}
                                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <CreditCard size={20} /> Ödemeye Geç
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3B: Service Booking Flow */}
                        {flowStep === 'SERVICE' && selectedTier && (
                            <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300 flex-1 overflow-y-auto">
                                <div className="max-w-3xl mx-auto space-y-6">
                                    {/* Availability Nodes */}
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            <MapPin size={20} className="text-emerald-600"/> Uygun Servis Noktaları
                                        </h4>
                                        {SERVICE_NODES.map(srv => (
                                            <div 
                                                key={srv.id} 
                                                onClick={() => setSelectedService(srv.id)}
                                                className={`p-5 border rounded-xl cursor-pointer transition-all flex items-center justify-between group ${selectedService === srv.id ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-emerald-300'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedService === srv.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        <Navigation size={24} />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-800">{srv.nodeName}</h5>
                                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                                            <span className="font-bold text-slate-500">{srv.distance}</span>
                                                            <span className={`px-2 py-0.5 rounded font-bold ${srv.loadSignal === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                {srv.loadSignal === 'HIGH' ? 'YOĞUN' : 'MÜSAİT'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400 font-bold uppercase">En Erken</p>
                                                    <p className="font-bold text-slate-800">{srv.nextSlotSignal}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Slot Selection */}
                                    {selectedService && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                <Clock size={20} className="text-emerald-600"/> Zaman Seçimi
                                            </h4>
                                            <div className="flex gap-3 overflow-x-auto pb-2">
                                                {['Yarın 09:00', 'Yarın 14:00', 'Cuma 10:00', 'Cuma 15:30'].map((slot, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => setBookingSlot(slot)}
                                                        className={`px-4 py-3 rounded-xl border font-bold text-sm whitespace-nowrap transition-all ${bookingSlot === slot ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Consent & Confirm */}
                                    {bookingSlot && (
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-start gap-3 mb-6">
                                                <div className="relative flex items-center mt-1">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={consentGiven} 
                                                        onChange={(e) => setConsentGiven(e.target.checked)}
                                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:bg-emerald-600 checked:border-emerald-600 transition-all" 
                                                    />
                                                    <Check size={14} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none opacity-0 peer-checked:opacity-100" strokeWidth={3} />
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    Seçilen servis noktası ile randevu oluşturulabilmesi için iletişim bilgilerimin paylaşılmasına ve SafeCore üzerinden ilgili parçanın servise yönlendirilmesine onay veriyorum.
                                                </p>
                                            </div>

                                            <button 
                                                onClick={handleConfirmAction}
                                                disabled={!consentGiven}
                                                className="w-full py-4 bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                                            >
                                                Randevuyu Onayla <CheckCircle size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Success */}
                        {flowStep === 'SUCCESS' && (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95">
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                                    <CheckCircle size={48} />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-2">İşlem Başarılı!</h2>
                                <p className="text-slate-500 max-w-md mb-8">
                                    {bookingSlot 
                                        ? 'Servis randevunuz oluşturuldu. İlgili servis noktası onay için sizinle iletişime geçecektir.' 
                                        : 'Siparişiniz alındı. Hazırlık süreci başladığında bilgilendirileceksiniz.'}
                                </p>
                                <div className="flex gap-4">
                                    <button onClick={() => { declareIntent('PART_NEED'); }} className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Yeni İşlem</button>
                                    <button onClick={resetContext} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Ana Menü</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {state === 'INTENT_DECLARED' && activeIntent === 'MAINTENANCE' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Maintenance Flow (Simplified for brevity as PART_NEED is the focus) */}
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <button onClick={() => setState('CONTEXT_LOCKED')} className="hover:bg-slate-100 p-2 rounded-lg transition-colors"><ArrowLeft size={20} className="text-slate-500" /></button>
                            <h3 className="font-bold text-slate-800">Servis Kapasite Noktaları</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* ... reusing service nodes list from previous implementation if needed, or keeping it simple ... */}
                            <div className="p-8 text-center text-slate-400 italic">Bakım modülü güncelleniyor...</div>
                        </div>
                    </div>
                )}

                {state === 'INTENT_DECLARED' && activeIntent === 'ISSUE' && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <button onClick={() => setState('CONTEXT_LOCKED')} className="hover:bg-slate-100 p-2 rounded-lg transition-colors"><ArrowLeft size={20} className="text-slate-500" /></button>
                            <h3 className="font-bold text-slate-800">Sorun Tespiti (Semptom Analizi)</h3>
                        </div>
                        
                        {!selectedSymptom ? (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SYMPTOMS.map(sym => (
                                    <button 
                                        key={sym.id}
                                        onClick={() => setSelectedSymptom(sym)}
                                        className="p-6 border border-slate-200 rounded-xl hover:border-rose-400 hover:bg-rose-50 transition-all text-left flex items-start gap-4 group"
                                    >
                                        <div className={`p-3 rounded-full ${sym.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'} group-hover:bg-white`}>
                                            <sym.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-1">{sym.label}</h4>
                                            <p className="text-xs text-slate-500">{sym.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${selectedSymptom.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                    <AlertTriangle size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Sistem Tavsiyesi</h3>
                                <p className="text-slate-500 max-w-md mb-8">
                                    {selectedSymptom.riskLevel === 'HIGH' 
                                        ? 'Güvenlik riski tespit edildi. Sürüşe devam etmeniz önerilmez. En yakın noktadan çekici veya acil servis talep ediniz.' 
                                        : 'Sürüşe engel kritik bir durum öngörülmüyor. Ancak 500km içerisinde kontrol edilmelidir.'}
                                </p>
                                
                                <div className="flex gap-4">
                                    <button onClick={() => setSelectedSymptom(null)} className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Geri Dön</button>
                                    <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black flex items-center gap-2">
                                        {selectedSymptom.riskLevel === 'HIGH' ? 'Yol Yardım İste' : 'Servis Randevusu Al'} <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (processing) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 size={48} className="text-emerald-600 animate-spin mb-6" />
                <h3 className="text-lg font-bold text-slate-800">İşlem Yapılıyor</h3>
                <p className="text-slate-500 text-sm mt-2">Veriler güvenli bir şekilde işleniyor...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Global Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            UserCore <span className="text-emerald-600">Interface</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">Anonim Kullanıcı Arayüzü</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                            <Shield size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Identity Masked</span>
                        </div>
                    </div>
                </div>

                {state === 'IDLE' ? <ContextSelectionView /> : <IntentDashboard />}
            </div>
        </div>
    );
};
