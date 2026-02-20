import React, { useState, useRef, useEffect } from 'react';
import { 
    Bot, X, Send, Sparkles, Lock, Unlock, 
    Box, Wrench, CheckCircle, AlertCircle, 
    ChevronRight, ChevronDown, Plus, ShoppingCart,
    BarChart3, TrendingUp, XCircle, Package, Activity, Zap
} from 'lucide-react';

interface ServiceAssistantProps {
    role: 'ADVISOR' | 'OWNER' | 'MANAGER';
    // Fix: Added missing workOrderId property to satisfy type check in RepairShops.tsx
    workOrderId?: string | null;
    onAddPart?: (part: any) => void;
}

type MessageType = 'TEXT' | 'PART_CARD' | 'PACKAGE_CARD' | 'STATS_CARD';

interface Message {
    id: number;
    sender: 'USER' | 'SYSTEM';
    type: MessageType;
    text?: string;
    data?: any;
}

// D) COMMAND NORMALIZATION MAP
const NORMALIZATION_MAP: Record<string, string> = {
    "fren balatası": "Fren Balatası",
    "ön balata": "Ön Fren Balatası",
    "arka balata": "Arka Fren Balatası",
    "debriyaj seti": "Debriyaj Seti",
    "yağ bakımı": "Yağ Bakım Paketi",
    "filtre seti": "Periyodik Filtre Seti"
};

// 1) Helper function for Stock Signal
const getStockSignal = (textOrPartName: string) => {
    const lower = (textOrPartName || '').toLowerCase();
    
    // Explicit keywords for Green (Available)
    if (lower.includes('stok var') || lower.includes('available') || lower.includes('var')) {
        return { icon: <CheckCircle size={12} />, label: 'Var', style: 'bg-emerald-50 text-emerald-700 border-emerald-100', iconColor: 'text-emerald-500' };
    }
    
    // Explicit keywords for Red (Out of Stock)
    if (lower.includes('stok yok') || lower.includes('not available') || lower.includes('out') || lower.includes('yok')) {
        return { icon: <XCircle size={12} />, label: 'Yok', style: 'bg-rose-50 text-rose-700 border-rose-100', iconColor: 'text-rose-500' };
    }
    
    // Default => Yellow (Limited)
    return { icon: <AlertCircle size={12} />, label: 'Sınırlı', style: 'bg-amber-50 text-amber-700 border-amber-100', iconColor: 'text-amber-500' };
};

// Fix: Destructure workOrderId from props to satisfy component signature used in RepairShops.tsx
export default function ServiceAssistantOverlay({ role, workOrderId, onAddPart }: ServiceAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (workOrderId) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [workOrderId]);
    
    // A) Explicit Manager Lock State (Default False)
    const [isManagerUnlocked, setIsManagerUnlocked] = useState(false);
    
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'SYSTEM', type: 'TEXT', text: 'LENT+ Servis Asistanı hazır. Parça sorgulayabilir veya "Genel Analiz" komutu ile yönetici özetini görebilirsiniz.' }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), sender: 'USER', type: 'TEXT', text: input };
        setMessages(prev => [...prev, userMsg]);
        
        processIntent(input);
        setInput('');
    };

    const processIntent = (text: string) => {
        const lower = text.toLowerCase();
        
        // Check Normalization
        let normalizedTitle = "";
        for (const [key, val] of Object.entries(NORMALIZATION_MAP)) {
            if (lower.includes(key)) {
                normalizedTitle = val;
                break;
            }
        }

        setTimeout(() => {
            let response: Message | null = null;

            // C) MANAGER INSIGHTS (Only if unlocked)
            // Updated to include specific requested metrics: "Ortalama parça ömrü, Arıza frekansı, Marka/model risk skoru"
            if ((role === 'OWNER' || role === 'MANAGER') && (lower.includes('analiz') || lower.includes('durum') || lower.includes('özet') || lower.includes('yönetici'))) {
                if (!isManagerUnlocked) {
                    response = {
                        id: Date.now() + 1,
                        sender: 'SYSTEM',
                        type: 'TEXT',
                        text: '🔒 Bu verileri görüntülemek için lütfen Yönetici Modu kilidini açınız.'
                    };
                } else {
                    response = {
                        id: Date.now() + 1,
                        sender: 'SYSTEM',
                        type: 'STATS_CARD',
                        data: { 
                            title: "Filo Performans Özeti", 
                            items: [
                                { label: 'Ortalama Parça Ömrü', value: '%85', trend: 'up', icon: <Activity size={12}/> },
                                { label: 'Arıza Frekansı', value: '1.2x', trend: 'down', icon: <Zap size={12}/> },
                                { label: 'Filo Risk Skoru', value: '42/100', trend: 'stable', icon: <AlertCircle size={12}/> },
                                { label: 'Aktif İş Emri', value: '18 Adet', trend: 'up', icon: <Wrench size={12}/> }
                            ]
                        }
                    };
                }
            }
            // PARTS - Updated Triggers per requirements
            else if (
                lower.includes('parça no') || 
                lower.includes('oem') || 
                lower.includes('premium') || 
                lower.includes('ekonomik') || 
                lower.includes('fren') || 
                lower.includes('debriyaj') || 
                lower.includes('balata') || 
                lower.includes('filtre')
            ) {
                // Determine stock availability based on input query for simulation
                let stockSim = 'AVAILABLE';
                if (lower.includes('stok yok')) stockSim = 'OUT';
                else if (lower.includes('sınırlı')) stockSim = 'LIMITED';

                response = {
                    id: Date.now() + 1,
                    sender: 'SYSTEM',
                    type: 'PART_CARD',
                    data: {
                        name: normalizedTitle || 'Ön Fren Disk Seti',
                        number: '09.C394.13',
                        brand: 'Brembo',
                        priceRange: '2.400 ₺ - 2.800 ₺',
                        stockStatus: stockSim
                    }
                };
            } 
            // MAINTENANCE PACKAGES
            else if (lower.includes('bakım') || lower.includes('yağ')) {
                response = {
                    id: Date.now() + 1,
                    sender: 'SYSTEM',
                    type: 'PACKAGE_CARD',
                    data: {
                        title: normalizedTitle || '60.000 KM Periyodik Bakım',
                        totalPrice: '4.200 ₺',
                        items: [
                            { name: 'Motor Yağı 5W30 (5L)', status: 'AVAILABLE' },
                            { name: 'Yağ Filtresi', status: 'AVAILABLE' },
                            { name: 'Hava Filtresi', status: 'LIMITED' },
                            { name: 'Polen Filtresi', status: 'AVAILABLE' }
                        ]
                    }
                };
            } 
            // DEFAULT FALLBACK
            else {
                response = {
                    id: Date.now() + 1,
                    sender: 'SYSTEM',
                    type: 'TEXT',
                    text: 'Anlaşılamadı. Parça adı, bakım paketi sorabilir veya "Genel Analiz" gibi yönetici komutları verebilirsiniz.'
                };
            }

            if (response) {
                setMessages(prev => [...prev, response!]);
            }
        }, 600);
    };

    const handleIntentAction = (action: string, payload: any) => {
        // Guard: Check if a work order is selected
        if (!workOrderId) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'SYSTEM',
                type: 'TEXT',
                text: '⚠️ HATA: İşlem yapabilmek için lütfen listeden bir iş emri seçiniz.'
            }]);
            return;
        }

        // Direct Callback to Parent (Ensures immediate UI update)
        if (onAddPart) {
            onAddPart(payload);
        }

        // Emit Custom Event to System (Legacy Architecture Support)
        const eventDetail = {
            type: 'ASSISTANT_RECOMMENDATION_CREATED', // Renamed from ADD_TO_WORK_ORDER to clarify intent
            source: 'SERVICE_ASSISTANT',
            item: {
                kind: action === 'ADD_PART_TO_ORDER' ? 'PART' : 'PACKAGE',
                title: payload.name || payload.title,
                partNumber: payload.number, // Undefined for packages
                tier: 'PREMIUM', // Defaulting for demo
                priceRange: payload.priceRange || payload.totalPrice,
                // Simple mapping: 'AVAILABLE' -> HIGH, 'OUT' -> NONE, else LIMITED
                stockSignal: payload.stockStatus === 'AVAILABLE' ? 'HIGH' : (payload.stockStatus === 'OUT' ? 'NONE' : 'LIMITED')
            },
            createdAt: Date.now()
        };

        window.dispatchEvent(new CustomEvent('LENT_INTENT', { detail: eventDetail }));

        // Visual feedback
        setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'SYSTEM',
            type: 'TEXT',
            text: '✅ Öneri onaya gönderildi. İş emri panelinden onaylayabilirsiniz.'
        }]);
    };

    const renderPartCard = (data: any) => {
        // B) Bind Stock Icon: Always call helper
        const stockSignal = getStockSignal(data.stockStatus || 'LIMITED');

        return (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm w-72 mt-2">
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Parça Kartı</span>
                        <h4 className="font-bold text-slate-800 text-sm">{data.name}</h4>
                    </div>
                    {/* Header Stock Indicator */}
                    <div className={`flex items-center gap-1 ${stockSignal.iconColor}`} title={`Stok: ${stockSignal.label}`}>
                        {stockSignal.icon}
                    </div>
                </div>
                <div className="p-3 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Parça No</span>
                        <span className="font-mono font-bold text-slate-700">{data.number}</span>
                    </div>
                    
                    {/* B) Inline Stock Row: Directly under part number */}
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Stok Durumu</span>
                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${stockSignal.style}`}>
                            {stockSignal.icon} Stok: {stockSignal.label}
                        </span>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Marka</span>
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{data.brand}</span>
                    </div>
                    
                    {/* A) Manager Lock: Mask Price */}
                    {isManagerUnlocked && (
                        <div className="flex justify-between text-xs pt-2 border-t border-slate-50 animate-in fade-in">
                            <span className="text-slate-500">Fiyat Aralığı</span>
                            <span className="font-bold text-slate-900">{data.priceRange}</span>
                        </div>
                    )}
                </div>
                <div className="p-2 bg-slate-50 flex gap-2">
                    <button 
                        onClick={() => handleIntentAction('ADD_PART_TO_ORDER', data)}
                        className="flex-1 bg-slate-900 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-1"
                    >
                        <Plus size={14} /> Öner
                    </button>
                    <button className="flex-1 bg-white border border-slate-200 text-slate-600 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100">
                        Alternatif
                    </button>
                </div>
            </div>
        );
    };

    const renderPackageCard = (data: any) => (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm w-72 mt-2">
            <div className="p-3 bg-purple-50 border-b border-purple-100">
                <h4 className="font-bold text-purple-900 text-sm">{data.title}</h4>
                {/* A) Manager Lock: Mask Total Price */}
                {isManagerUnlocked && (
                    <p className="text-xs text-purple-700 mt-0.5 animate-in fade-in">Toplam: <span className="font-bold">{data.totalPrice}</span></p>
                )}
            </div>
            <div className="p-2">
                {data.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 border-b border-slate-50 last:border-0 text-xs">
                        <div className="flex items-center gap-2">
                            {item.status === 'AVAILABLE' ? <div className="w-2 h-2 rounded-full bg-emerald-500"></div> : <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                            <span className="text-slate-700 font-medium">{item.name}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-2 bg-slate-50">
                <button 
                    onClick={() => handleIntentAction('APPLY_PACKAGE', data)}
                    className="w-full bg-purple-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                    <Wrench size={14} /> Öner
                </button>
            </div>
        </div>
    );

    const renderStatsCard = (data: any) => (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm w-72 mt-2">
            <div className="p-3 bg-slate-800 text-white border-b border-slate-700">
                <h4 className="font-bold text-sm flex items-center gap-2">
                    <BarChart3 size={16} className="text-emerald-400" /> {data.title}
                </h4>
            </div>
            <div className="p-3 space-y-2">
                {data.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs border-b border-slate-50 last:border-0 pb-1 last:pb-0">
                        <div className="flex items-center gap-2">
                            {item.icon}
                            <span className="text-slate-600 font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{item.value}</span>
                            {item.trend === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
                            {item.trend === 'down' && <TrendingUp size={12} className="text-rose-500 transform rotate-180" />}
                            {item.trend === 'stable' && <div className="w-2 h-0.5 bg-slate-300"></div>}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-2 bg-slate-50 text-[10px] text-center text-slate-400 italic">
                Veriler anonimleştirilmiştir.
            </div>
        </div>
    );

    return (
        <>
            {/* Floating Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 z-[210] bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 group flex items-center gap-3 pr-6"
            >
                <div className="relative">
                    <Bot size={28} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600"></span>
                </div>
                <div className="text-left leading-tight">
                    <span className="block text-sm font-bold">LENT+ Asistan</span>
                    <span className="block text-[10px] text-indigo-200 font-medium">SafeCore AI</span>
                </div>
            </button>

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[200] transform transition-transform duration-300 flex flex-col border-l border-slate-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header (A - Mode Labels & Lock Toggle) */}
                <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 transition-colors ${isManagerUnlocked ? 'bg-indigo-900 border-indigo-800 text-white' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isManagerUnlocked ? 'bg-white/10' : 'bg-indigo-50 text-indigo-600'}`}>
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className={`font-bold ${isManagerUnlocked ? 'text-white' : 'text-slate-800'}`}>LENT+ Asistan</h3>
                            <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isManagerUnlocked ? 'bg-emerald-400' : 'bg-emerald-50'}`}></span>
                                <p className={`text-xs ${isManagerUnlocked ? 'text-indigo-200' : 'text-slate-500'}`}>
                                    {isManagerUnlocked ? 'Açık Mod (Yönetici)' : 'Gizli Mod'}
                                </p>
                            </div>
                            <p className={`text-[9px] mt-0.5 ${isManagerUnlocked ? 'text-indigo-300' : 'text-slate-400'}`}>Service Assistant Overlay v3</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* A) Lock Toggle UI */}
                        {(role === 'OWNER' || role === 'MANAGER') && (
                            <button 
                                onClick={() => setIsManagerUnlocked(!isManagerUnlocked)} 
                                className={`p-2 rounded-lg transition-colors ${isManagerUnlocked ? 'hover:bg-white/10 text-indigo-200' : 'hover:bg-slate-100 text-slate-400'}`}
                                title={isManagerUnlocked ? "Gizli Moda Geç (Maskele)" : "Açık Moda Geç (Detay Gör)"}
                            >
                                {isManagerUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
                            </button>
                        )}
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className={`p-2 rounded-lg transition-colors ${isManagerUnlocked ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                
                {/* Helper Text for Mode */}
                <div className={`px-6 py-2 text-[10px] border-b ${isManagerUnlocked ? 'bg-indigo-800 border-indigo-700 text-indigo-200' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    {isManagerUnlocked 
                        ? 'Açık Mod: Yalnızca yetkili roller tüm finansal ve stok verilerini görüntüler.' 
                        : 'Gizli Mod: Müşteri yanında kullanım için hassas veriler maskelenir.'}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'SYSTEM' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 shrink-0">
                                    <Bot size={16} />
                                </div>
                            )}
                            <div className={`max-w-[85%] ${msg.sender === 'USER' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm' : ''}`}>
                                {msg.type === 'TEXT' && msg.sender === 'SYSTEM' && (
                                    <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm text-sm text-slate-600 shadow-sm">
                                        {msg.text}
                                    </div>
                                )}
                                {msg.type === 'TEXT' && msg.sender === 'USER' && msg.text}
                                
                                {msg.type === 'PART_CARD' && renderPartCard(msg.data)}
                                {msg.type === 'PACKAGE_CARD' && renderPackageCard(msg.data)}
                                {msg.type === 'STATS_CARD' && renderStatsCard(msg.data)}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Legend at Bottom */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-center gap-4 text-[10px] text-slate-500 border-b border-slate-100">
                    <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-500"/> Var</span>
                    <span className="flex items-center gap-1"><AlertCircle size={10} className="text-amber-500"/> Sınırlı</span>
                    <span className="flex items-center gap-1"><XCircle size={10} className="text-rose-500"/> Yok</span>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white">
                    
                    {/* C) Manager Insights Chips - With Lock Check and Placeholder */}
                    {(role === 'OWNER' || role === 'MANAGER') && (
                        isManagerUnlocked ? (
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide animate-in fade-in">
                                <button onClick={() => processIntent('genel analiz')} className="whitespace-nowrap px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1">
                                    <TrendingUp size={12} /> Genel Analiz
                                </button>
                                <button onClick={() => processIntent('usta performansı')} className="whitespace-nowrap px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1">
                                    <Box size={12} /> Usta Analizi
                                </button>
                            </div>
                        ) : (
                            <div className="mb-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-center gap-2 justify-center italic">
                                <Lock size={12} className="text-slate-400" /> Yönetici Modu Kilitli - Açmak için kilidi açın
                            </div>
                        )
                    )}

                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Parça ara veya komut ver..." 
                            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                        <button 
                            onClick={handleSend}
                            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    {/* Advisor Quick Chips */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                        <button onClick={() => processIntent('fren balatası')} className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">Fren Balatası</button>
                        <button onClick={() => processIntent('60 bin bakımı')} className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">60 Bin Bakımı</button>
                    </div>
                </div>
            </div>
        </>
    );
}