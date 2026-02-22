

import React, { useState, useEffect } from 'react';
import { 
    Wrench, CheckCircle, Clock, AlertCircle, Search, Filter, 
    ChevronRight, Eye, EyeOff, FileText, User, Calendar,
    Package, BarChart3, Settings, Play, Send, CheckSquare, 
    XCircle, ArrowRight, ShieldCheck, Share2, Loader2,
    MoreHorizontal, ClipboardList, PenTool, Layout, Plus,
    Copy, ExternalLink, Link, TrendingUp, TrendingDown, Activity, Minus,
    Globe, ShoppingCart, Truck, Shield, Zap, ToggleLeft, ToggleRight, List,
    Cpu, Lock, Info, Server, RefreshCw, Monitor, Maximize2, Minimize2, Grid, Car,
    Bot, MessageSquare, Sparkles, X, Lightbulb, Box, Link2, Timer, RefreshCcw, Save, RotateCcw,
    ThumbsUp, ThumbsDown, Activity as ActivityIcon, Layers
} from 'lucide-react';
import { 
    getServiceWorkOrders, getOperationalDetails, logVaultAccess, 
    updateServiceWorkOrder, createServiceWorkOrder, searchNetworkParts, 
    placeNetworkOrder, getAutoOrderSystemStatus, toggleAutoOrderSystem,
    getAutoOrderConfigs, updateAutoOrderConfig, getAutoOrderSuggestions,
    approveAutoOrderSuggestion, getProfitabilityMetrics, getErpSyncHistory,
    triggerErpSync, getVehicleList, getServiceIntakePolicy, updateServiceIntakePolicy,
    REPAIR_DASH_FEED_KEY, DEMO_COST_MAP
} from '../services/dataService';
// Fix: Use consistent lowercase casing for erpOutbox to resolve casing conflict
import { enqueueEvent, getWorkOrderSyncState, retryWorkOrderNow } from '../services/erp/erpOutbox';
import { getCurrentUserSecurity } from '../services/securityService';
import { ServiceWorkOrder, ViewState, OperationalDetails, ServiceWorkOrderStatus, AutoOrderConfig, AutoOrderSuggestion, ErpSyncLog, DiagnosisItem, ServiceIntakePolicy, DEFAULT_SERVICE_INTAKE_POLICY, ServiceIntakeMode, ErpSyncPolicy, AssistantPrivilege } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts';
import ServiceAssistantOverlay from '../components/ServiceAssistantOverlay';
import ServiceIntakeOverlay from '../components/ServiceIntakeOverlay';
import { B2BAlternativesPanel } from '../components/B2BAlternativesPanel';
import { AutoOrderPanel } from '../components/AutoOrderPanel';
import B2BNetwork from './B2BNetwork';
import { PartStockSignals } from './PartStockSignals';
import { FinanceProfitability } from './FinanceProfitability';
import { ERPBridgePanel } from './ERPBridgePanel';
import { SettingsPanel } from './SettingsPanel';
import { OperationalReports } from '../components/OperationalReports';

interface RepairShopsProps {
    onNavigate?: (view: ViewState, id?: string) => void;
}

export type ErpSyncRule = 'INTAKE' | 'OUTBOX' | 'CUSTOMER_APPROVAL';

// Dashboard Analiz Key
export const REPAIR_WORKORDERS_FEED_KEY = "LENT_REPAIR_WORKORDERS_FEED_V1";

const TABS = [
    { id: 'REPAIR', label: 'Bakım Merkezi', icon: Wrench },
    { id: 'WORK_ORDERS', label: 'İş Emirleri (Kanban)', icon: Layout },
    { id: 'INVENTORY', label: 'Parça & Stok Sinyalleri', icon: Package },
    { id: 'AUTO_ORDER', label: 'Otomatik Sipariş', icon: Zap },
    { id: 'NETWORK', label: 'Parça Ağı (B2B)', icon: Globe },
    { id: 'FINANCE', label: 'Finans & Kârlılık', icon: TrendingUp },
    { id: 'ERP', label: 'ERP Köprüsü', icon: Server },
    { id: 'REPORTS', label: 'Operasyonel Raporlar', icon: BarChart3 },
    { id: 'SETTINGS', label: 'Ayarlar', icon: Settings }
] as const;

type TabId = typeof TABS[number]['id'];

const KANBAN_COLUMNS: {id: string, title: string, statuses: string[], color: string}[] = [
    { id: 'col-1', title: 'Araç Kabul', statuses: ['INTAKE_PENDING'], color: 'bg-slate-100 border-slate-200' },
    { id: 'col-2', title: 'Teşhis & Analiz', statuses: ['DIAGNOSIS'], color: 'bg-blue-50 border-blue-200' },
    { 
        id: 'col-3', 
        title: 'Müşteri Onayı', 
        statuses: [
            'OFFER_DRAFT', 
            'WAITING_APPROVAL', 
            'CUSTOMER_APPROVAL', 
            'CUSTOMER_CONFIRM', 
            'CUSTOMER_WAITING', 
            'WAITING_CUSTOMER_APPROVAL'
        ], 
        color: 'bg-purple-50 border-purple-200' 
    },
    { id: 'col-4', title: 'İşlemde', statuses: ['APPROVED', 'IN_PROGRESS'], color: 'bg-amber-50 border-amber-200' },
    { id: 'col-5', title: 'Teslimat', statuses: ['READY_FOR_DELIVERY', 'DELIVERED'], color: 'bg-emerald-50 border-emerald-200' }
];

interface PendingRecommendation {
    id: string;
    item: string;
    type: 'PART' | 'LABOR';
    price: number;
    stockSignal: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    reason: string;
    refNumber?: string;
    timestamp: number;
}

export const RepairShops: React.FC<RepairShopsProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<TabId>('REPAIR');
    const [workOrders, setWorkOrders] = useState<ServiceWorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isRightPanelOpen, setRightPanelOpen] = useState(false);
    const [intentToast, setIntentToast] = useState<string | null>(null);
    const [erpSyncRule, setErpSyncRule] = useState<ErpSyncRule>('OUTBOX');
    const [expandedPartId, setExpandedPartId] = useState<string | null>(null);
    const [pendingRecs, setPendingRecs] = useState<Record<string, PendingRecommendation[]>>({});
    const [linksMap, setLinksMap] = useState<Record<string, string>>({});
    const [policy, setPolicy] = useState<ServiceIntakePolicy>(DEFAULT_SERVICE_INTAKE_POLICY);
    const [summaryFilter, setSummaryFilter] = useState<'7days' | '30days' | 'month'>('30days');
    
    const currentUser = getCurrentUserSecurity();
    const selectedOrder = workOrders.find(o => o.id === selectedOrderId);

    // --- REPAIR DASH FEED SYNC ---
    useEffect(() => {
        if (workOrders.length === 0) return;

        const getProgress = (status: ServiceWorkOrderStatus): number => {
            if (status === 'INTAKE_PENDING') return 10;
            if (status === 'DIAGNOSIS') return 35;
            if (status.includes('APPROVAL') || status === 'OFFER_DRAFT') return 55;
            if (status === 'APPROVED' || status === 'IN_PROGRESS') return 75;
            if (status === 'READY_FOR_DELIVERY') return 90;
            if (status === 'DELIVERED') return 100;
            return 20;
        };

        // Feed'i map et (HAM VIN YOK, PATENT UYUMLU)
        const feed = workOrders.slice(0, 10).map(wo => {
            const vinLast4 = wo.operationalDetails?.vinLast4;
            const vehicleName = vinLast4 ? `Araç • ****${vinLast4}` : "Araç (Anonim)";
            const serviceName = wo.operationalDetails?.customerName || wo.customerName || "Mühürlü Servis";
            const estimatedCost = wo.diagnosisItems.reduce((acc, it) => acc + (it.signalCost || 0), 0);
            
            return {
                id: wo.id,
                vehicleName,
                serviceName,
                progress: getProgress(wo.status),
                estimatedCost,
                status: wo.status,
                updatedAt: wo.updatedAt
            };
        });

        localStorage.setItem(REPAIR_DASH_FEED_KEY, JSON.stringify(feed));
        
        // 17.02.2026 - Ekonomik Zeka için Kalem Detaylı Feed (No VIN)
        localStorage.setItem(REPAIR_WORKORDERS_FEED_KEY, JSON.stringify(workOrders));

        window.dispatchEvent(new Event('REPAIR_DASH_FEED_UPDATED'));
    }, [workOrders]);

    const applyWorkOrderPatch = (orderId: string, patch: Partial<ServiceWorkOrder>) => {
        setWorkOrders(prev => prev.map(o => o.id === orderId ? { 
            ...o, 
            ...patch, 
            updatedAt: new Date().toLocaleString('tr-TR') 
        } : o));
        
        if (patch.status) {
            enqueueEvent({
                tenantId: currentUser.institutionId,
                workOrderId: orderId,
                type: "WORK_ORDER_STATUS_CHANGED",
                payload: { toStatus: patch.status, timestamp: Date.now() }
            });
            setIntentToast(`🚚 Durum Güncellendi: ${patch.status}`);
            setTimeout(() => setIntentToast(null), 2500);
        }
    };

    const statusMap: Record<string, ServiceWorkOrderStatus> = {
        'INTAKE': 'DIAGNOSIS',
        'DIAGNOSIS': 'DIAGNOSIS',
        'OFFER': 'OFFER_DRAFT',
        'APPROVAL': 'WAITING_APPROVAL',
        'START_REPAIR': 'IN_PROGRESS',
        'FINISH': 'READY_FOR_DELIVERY',
        'DELIVER': 'DELIVERED',
        'APPROVE_SIMULATED': 'APPROVED'
    };

    const fetchOrders = async () => {
        setLoading(true);
        const data = await getServiceWorkOrders(currentUser.institutionId);
        setWorkOrders(prev => {
            if (prev.length === 0) return data;
            return data.map(fetched => {
                const local = prev.find(p => p.id === fetched.id);
                if (local && local.status !== fetched.status) return { ...fetched, ...local };
                return fetched;
            });
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        getServiceIntakePolicy(currentUser.institutionId).then(setPolicy);
    }, [currentUser.institutionId]);

    useEffect(() => {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent;
            const payload = customEvent.detail;
            if (!payload) return;

            switch (payload.type) {
                case 'CREATE_WORK_ORDER_FROM_INTAKE':
                    const newId = `SWO-${Math.floor(1000 + Math.random() * 9000)}`;
                    const timestamp = new Date().toLocaleString('tr-TR');
                    const initialErpState = erpSyncRule === 'INTAKE' ? 'PENDING' : undefined;

                    const newOrder: ServiceWorkOrder = {
                        id: newId,
                        sourceEventId: `EVT-INTAKE-${Date.now()}`,
                        operationalHash: `OP-${Math.random().toString(36).substring(7).toUpperCase()}`,
                        status: 'INTAKE_PENDING',
                        intakeChecklist: [{id:'c1', label:'Araç Kabul', checked:true}],
                        diagnosisItems: [],
                        customerName: payload.data?.customer || 'Hızlı Kabul Müşterisi',
                        createdAt: timestamp,
                        updatedAt: timestamp,
                        erpState: initialErpState,
                        operationalDetails: {
                            customerName: payload.data?.customer || 'Hızlı Kabul Müşterisi',
                            customerPhone: '',
                            plate: payload.data?.plate || 'GİRİLMEDİ',
                            mileage: payload.data?.mileage || 0,
                            consentStatus: 'GRANTED',
                            internalNotes: 'Hızlı kabul akışından otomatik mühürlendi.',
                            vinHash: payload.data?.vinHash,
                            vinLast4: payload.data?.vinLast4
                        }
                    };
                    setWorkOrders(prev => [newOrder, ...prev]);
                    setSelectedOrderId(newId);
                    setRightPanelOpen(true);
                    setIntentToast("✅ Mühürlü iş emri oluşturuldu.");
                    break;

                case 'WORK_ORDER_SET_STATUS':
                    if (payload.workOrderId && statusMap[payload.nextStatus]) {
                        const mappedStatus = statusMap[payload.nextStatus];
                        const patch: Partial<ServiceWorkOrder> = { status: mappedStatus };
                        if (erpSyncRule === 'OUTBOX' && mappedStatus === 'READY_FOR_DELIVERY') patch.erpState = 'PENDING';
                        else if (erpSyncRule === 'CUSTOMER_APPROVAL' && (mappedStatus === 'WAITING_APPROVAL' || mappedStatus === 'OFFER_DRAFT')) patch.erpState = 'PENDING';
                        applyWorkOrderPatch(payload.workOrderId, patch);
                        setSelectedOrderId(payload.workOrderId);
                        setRightPanelOpen(true);
                    }
                    break;

                case 'APPROVAL_LINK_GENERATED':
                    if (payload.workOrderId) {
                        const link = `https://lent.plus/approve/${payload.workOrderId}?t=${Date.now()}`;
                        setLinksMap(prev => ({ ...prev, [payload.workOrderId]: link }));
                    }
                    break;
                
                case 'ASSISTANT_RECOMMENDATION_CREATED':
                    if (selectedOrderId && payload.item) {
                        const rec: PendingRecommendation = {
                            id: `REC-${Date.now()}`,
                            item: payload.item.title,
                            type: payload.item.kind,
                            price: parseInt(payload.item.priceRange?.replace(/[^0-9]/g, '') || '0'),
                            stockSignal: payload.item.stockSignal,
                            reason: 'Asistan Önerisi',
                            refNumber: payload.item.partNumber,
                            timestamp: Date.now()
                        };
                        setPendingRecs(prev => ({
                            ...prev,
                            [selectedOrderId]: [...(prev[selectedOrderId] || []), rec]
                        }));
                    }
                    break;
            }
        };

        window.addEventListener('LENT_INTENT', handler);
        return () => window.removeEventListener('LENT_INTENT', handler);
    }, [selectedOrderId, erpSyncRule]);

    const handleApplyRecommendation = async (orderId: string, rec: PendingRecommendation) => {
        const order = workOrders.find(o => o.id === orderId);
        if (!order) return;
        const newItem: DiagnosisItem = { id: rec.id, item: rec.item, type: rec.type, signalCost: rec.price, recommendedPartRef: rec.refNumber };
        const updatedItems = [...order.diagnosisItems, newItem];
        applyWorkOrderPatch(orderId, { diagnosisItems: updatedItems });
        setPendingRecs(prev => ({ ...prev, [orderId]: prev[orderId].filter(r => r.id !== rec.id) }));
        enqueueEvent({ tenantId: currentUser.institutionId, workOrderId: orderId, type: "WORK_ORDER_PARTS_CHANGED", payload: { diagnosisItems: updatedItems } });
    };

    const renderOperationSummary = () => {
        // Date filter helper
        const getFilteredOrders = () => {
            const now = new Date();
            let daysBack = 30;
            
            if (summaryFilter === '7days') daysBack = 7;
            else if (summaryFilter === 'month') {
                daysBack = 31;
            }
            
            const cutoffDate = new Date(now);
            cutoffDate.setDate(cutoffDate.getDate() - daysBack);
            
            return workOrders.filter(w => {
                try {
                    const createdDate = new Date(w.createdAt);
                    return createdDate >= cutoffDate;
                } catch {
                    return true;
                }
            });
        };

        const filteredOrders = getFilteredOrders();
        
        // Active statuses
        const ACTIVE_STATUSES: ServiceWorkOrderStatus[] = [
            'INTAKE_PENDING', 'DIAGNOSIS', 'OFFER_DRAFT', 
            'WAITING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'READY_FOR_DELIVERY'
        ];
        
        const totalOrders = filteredOrders.length;
        const activeOrders = filteredOrders.filter(w => ACTIVE_STATUSES.includes(w.status)).length;
        
        // Today's orders
        const today = new Date().toLocaleDateString('tr-TR');
        const todayOrders = filteredOrders.filter(w => {
            try {
                const createdDate = new Date(w.createdAt).toLocaleDateString('tr-TR');
                return createdDate === today;
            } catch {
                return false;
            }
        }).length;

        // Categories mapping (item -> category)
        const ITEM_CATEGORY_MAP: Record<string, string> = {
            "Fren Balatası": "Fren",
            "Triger Seti": "Motor",
            "Yağ Bakımı": "Bakım",
            "Lastik Değişimi": "Lastik",
            "Disk Fren": "Fren",
            "Motor Yağı": "Bakım",
            "Filtru": "Bakım",
            "Pil": "Elektrik",
            "Şamandıra": "Elektrik",
        };

        // Top 10: Part brands
        const brandCounts: Record<string, number> = {};
        filteredOrders.forEach(w => {
            w.diagnosisItems?.forEach(item => {
                const brand = DEMO_BRAND_MAP[item.item] || item.item.split(' ')[0];
                brandCounts[brand] = (brandCounts[brand] || 0) + 1;
            });
        });
        const topBrands = Object.entries(brandCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([brand, count]) => ({ brand, count }));

        // Top 10: Categories
        const categoryCounts: Record<string, number> = {};
        filteredOrders.forEach(w => {
            w.diagnosisItems?.forEach(item => {
                const category = ITEM_CATEGORY_MAP[item.item] || "Diğer";
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });
        });
        const topCategories = Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([category, count]) => ({ category, count }));

        // Top 10: Vehicles (by plate)
        const vehicleCounts: Record<string, number> = {};
        filteredOrders.forEach(w => {
            const plate = w.operationalDetails?.plate || 'Bilinmiyor';
            vehicleCounts[plate] = (vehicleCounts[plate] || 0) + 1;
        });
        const topVehicles = Object.entries(vehicleCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([plate, count]) => ({ plate, count }));

        // Revenue calculations
        const totalCiro = filteredOrders.reduce((sum, w) => sum + (w.diagnosisItems?.reduce((acc, i) => acc + i.signalCost, 0) || 0), 0);
        const averageBasket = totalOrders > 0 ? totalCiro / totalOrders : 0;

        // Margin calculation
        let totalProfit = 0;
        filteredOrders.forEach(w => {
            const sales = w.diagnosisItems?.reduce((acc, i) => acc + i.signalCost, 0) || 0;
            const cost = w.diagnosisItems?.reduce((acc, i) => {
                const unitCost = DEMO_COST_MAP[i.item] || (i.signalCost * 0.85);
                return acc + unitCost;
            }, 0) || 0;
            totalProfit += (sales - cost);
        });
        const averageMargin = totalCiro > 0 ? (totalProfit / totalCiro) * 100 : 0;

        const filterLabel = summaryFilter === '7days' ? 'Son 7 Gün' : summaryFilter === '30days' ? 'Son 30 Gün' : 'Bu Ay';

        return (
            <div className="bg-white border-b border-slate-200">
                {/* KPI Kartları */}
                <div className="px-6 py-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2" style={{fontSize: '16px'}}>
                            <Truck size={18} className="text-indigo-600" /> Bakım Merkezi Operasyon Özeti
                        </h4>
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                            {(['7days', '30days', 'month'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setSummaryFilter(filter)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${
                                        summaryFilter === filter
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {filter === '7days' ? '7G' : filter === '30days' ? '30G' : 'Ay'}
                                </button>
                            ))}
                        </div>
                    </div>
                    {workOrders.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm italic">Henüz iş emri verisi yok.</div>
                    )}
                    {workOrders.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Toplam İş Emri</p>
                                <p className="text-2xl font-black text-slate-800">{totalOrders}</p>
                                <p className="text-[8px] text-slate-400 mt-1">{filterLabel}</p>
                            </div>
                            <div className="p-4 bg-emerald-50/30 rounded-lg border border-emerald-100/50">
                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Aktif</p>
                                <p className="text-2xl font-black text-emerald-700">{activeOrders}</p>
                            </div>
                            <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-100/50">
                                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-1">Bugün Açılan</p>
                                <p className="text-2xl font-black text-blue-700">{todayOrders}</p>
                            </div>
                            <div className="p-4 bg-purple-50/30 rounded-lg border border-purple-100/50">
                                <p className="text-[9px] font-bold text-purple-600 uppercase tracking-widest mb-1">Toplam Ciro</p>
                                <p className="text-lg font-black text-purple-700">{(totalCiro/1000).toFixed(1)}K ₺</p>
                            </div>
                            <div className="p-4 bg-orange-50/30 rounded-lg border border-orange-100/50">
                                <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest mb-1">Ort. Sepet</p>
                                <p className="text-lg font-black text-orange-700">{averageBasket.toLocaleString('tr-TR', {maximumFractionDigits: 0})} ₺</p>
                            </div>
                            <div className="p-4 bg-indigo-50/30 rounded-lg border border-indigo-100/50">
                                <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Ort. Marj</p>
                                <p className="text-lg font-black text-indigo-700">{totalOrders > 0 ? `%${averageMargin.toFixed(1)}` : '—'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top 10 Listeler */}
                {workOrders.length > 0 && (
                    <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Top Part Brands */}
                        <div className="bg-slate-50 rounded-lg border border-slate-100 p-4">
                            <h5 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                                <Box size={14} className="text-orange-500" /> En Çok Kullanılan Markalar
                            </h5>
                            {topBrands.length > 0 ? (
                                <div className="space-y-2">
                                    {topBrands.map((item, i) => (
                                        <div key={item.brand} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="w-5 h-5 flex items-center justify-center bg-white rounded-full border border-slate-200 font-bold text-[9px] text-slate-600">{i+1}</span>
                                                <span className="text-slate-700 font-medium">{item.brand}</span>
                                            </div>
                                            <span className="font-black text-orange-600 bg-white px-2 py-0.5 rounded">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic text-center py-4">Veri yok</p>
                            )}
                        </div>

                        {/* Top Categories */}
                        <div className="bg-slate-50 rounded-lg border border-slate-100 p-4">
                            <h5 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                                <Layers size={14} className="text-blue-500" /> En Çok Satılan Kategoriler
                            </h5>
                            {topCategories.length > 0 ? (
                                <div className="space-y-2">
                                    {topCategories.map((item, i) => (
                                        <div key={item.category} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="w-5 h-5 flex items-center justify-center bg-white rounded-full border border-slate-200 font-bold text-[9px] text-slate-600">{i+1}</span>
                                                <span className="text-slate-700 font-medium">{item.category}</span>
                                            </div>
                                            <span className="font-black text-blue-600 bg-white px-2 py-0.5 rounded">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic text-center py-4">Veri yok</p>
                            )}
                        </div>

                        {/* Top Vehicles */}
                        <div className="bg-slate-50 rounded-lg border border-slate-100 p-4">
                            <h5 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                                <Car size={14} className="text-teal-500" /> En Çok İşlem Gören Araçlar
                            </h5>
                            {topVehicles.length > 0 ? (
                                <div className="space-y-2">
                                    {topVehicles.map((item, i) => (
                                        <div key={item.plate} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="w-5 h-5 flex items-center justify-center bg-white rounded-full border border-slate-200 font-bold text-[9px] text-slate-600">{i+1}</span>
                                                <span className="text-slate-700 font-medium font-mono">{item.plate}</span>
                                            </div>
                                            <span className="font-black text-teal-600 bg-white px-2 py-0.5 rounded">{item.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic text-center py-4">Veri yok</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderActiveWorkOrdersPanel = () => {
        // Status to progress mapping
        const getProgressFromStatus = (status: ServiceWorkOrderStatus): number => {
            const statusProgressMap: Record<ServiceWorkOrderStatus, number> = {
                'INTAKE_PENDING': 10,
                'DIAGNOSIS': 30,
                'OFFER_DRAFT': 60,
                'WAITING_APPROVAL': 60,
                'APPROVED': 75,
                'IN_PROGRESS': 80,
                'READY_FOR_DELIVERY': 95,
                'DELIVERED': 100
            };
            return statusProgressMap[status] || 10;
        };

        // Status display helper
        const getStatusLabel = (status: ServiceWorkOrderStatus): { label: string; color: string } => {
            const statusMap: Record<ServiceWorkOrderStatus, { label: string; color: string }> = {
                'INTAKE_PENDING': { label: 'Araç Kabul', color: 'bg-slate-100 text-slate-700' },
                'DIAGNOSIS': { label: 'Teşhis', color: 'bg-blue-100 text-blue-700' },
                'OFFER_DRAFT': { label: 'Teklif', color: 'bg-purple-100 text-purple-700' },
                'WAITING_APPROVAL': { label: 'Onay Bekleyen', color: 'bg-amber-100 text-amber-700' },
                'APPROVED': { label: 'Onaylı', color: 'bg-indigo-100 text-indigo-700' },
                'IN_PROGRESS': { label: 'İşlemde', color: 'bg-orange-100 text-orange-700' },
                'READY_FOR_DELIVERY': { label: 'Teslimat Hazır', color: 'bg-emerald-100 text-emerald-700' },
                'DELIVERED': { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700' },
            };
            return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
        };

        return (
            <div className="px-6 py-6 bg-white border-b border-slate-200">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ActivityIcon size={18} className="text-blue-500" /> Aktif İş Emri Takibi
                </h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-max">
                        <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold">
                            <tr>
                                <th className="px-4 py-3">İş Emri</th>
                                <th className="px-4 py-3">Araç / Plaka</th>
                                <th className="px-4 py-3 text-center">KM</th>
                                <th className="px-4 py-3">Müşteri</th>
                                <th className="px-4 py-3">İlerleme</th>
                                <th className="px-4 py-3 text-center">Durum</th>
                                <th className="px-4 py-3 text-right">Maliyet</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {workOrders.map(so => {
                                const totalCost = so.diagnosisItems.reduce((acc, i) => acc + i.signalCost, 0);
                                const progress = getProgressFromStatus(so.status);
                                const statusInfo = getStatusLabel(so.status);
                                const mileage = so.operationalDetails?.mileage;
                                return (
                                    <tr key={so.id} className="hover:bg-slate-50 transition-colors text-sm">
                                        <td className="px-4 py-4 font-mono text-xs text-slate-500">{so.id}</td>
                                        <td className="px-4 py-4 font-bold text-slate-700">{so.operationalDetails?.plate || 'Bilinmiyor'}</td>
                                        <td className="px-4 py-4 text-center text-slate-600">
                                            {mileage ? mileage.toLocaleString('tr-TR') + ' km' : '—'}
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">{so.customerName || so.operationalDetails?.customerName || '—'}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="bg-emerald-500 h-full" style={{width: `${progress}%`}}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-600">%{progress}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right font-bold text-slate-800">{totalCost.toLocaleString('tr-TR')} ₺</td>
                                    </tr>
                                );
                            })}
                            {workOrders.length === 0 && (
                                <tr><td colSpan={7} className="py-12 text-center text-slate-400 italic">Aktif iş emri bulunmuyor.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderKanbanBoard = () => (
        <div className="h-full flex-1 overflow-x-auto p-6 gap-6 flex bg-slate-50/50">
            {KANBAN_COLUMNS.map(col => (
                <div key={col.id} className="w-80 shrink-0 flex flex-col h-full bg-slate-100/50 rounded-xl p-3 border border-slate-200">
                    <h3 className="font-bold text-slate-700 text-sm mb-3 px-1 flex justify-between items-center">
                        {col.title}
                        <span className="bg-slate-200 text-slate-500 text-[10px] px-1.5 rounded-full font-bold">
                            {workOrders.filter(o => col.statuses.includes(o.status)).length}
                        </span>
                    </h3>
                    <div className="space-y-3 overflow-y-auto pr-1">
                        {workOrders.filter(o => col.statuses.includes(o.status)).map(order => {
                            const sync = getWorkOrderSyncState(currentUser.institutionId, order.id);
                            return (
                                <div 
                                    key={order.id} 
                                    onClick={() => { 
                                        setSelectedOrderId(order.id); 
                                        setRightPanelOpen(true); 
                                    }} 
                                    className={`bg-white p-4 rounded-xl shadow-sm border transition-all group cursor-pointer ${selectedOrderId === order.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-400'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-mono text-slate-400">#{order.id}</span>
                                        <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${sync.state === 'SENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400'}`}>ERP {sync.state}</div>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{order.operationalHash}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">{order.operationalDetails?.plate || 'Plaka Belirtilmedi'}</p>
                                    <div className="mt-3 flex items-center justify-between text-[9px] text-slate-400 font-medium border-t pt-2 border-slate-50">
                                        <span>Güncelleme: {order.updatedAt.split(' ')[1] || order.updatedAt}</span>
                                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderRightPanel = () => {
        if (!selectedOrder) return null;
        const total = selectedOrder.diagnosisItems.reduce((acc, i) => acc + i.signalCost, 0);
        const statusStr = selectedOrder.status.replace('_', ' ').toUpperCase();

        return (
            <aside className={`fixed top-16 right-0 w-[450px] bottom-0 bg-white border-l border-slate-200 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-slate-400">#{selectedOrder.id}</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold uppercase">{statusStr}</span>
                        </div>
                        <h3 className="font-bold text-slate-800">{selectedOrder.operationalHash}</h3>
                    </div>
                    <button onClick={() => setRightPanelOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="space-y-2 pb-4 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Plaka</span>
                            <span className="text-sm font-bold text-slate-800">{selectedOrder.operationalDetails?.plate || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Kilometre</span>
                            <span className="text-sm font-bold text-slate-800">{selectedOrder.operationalDetails?.mileage !== undefined ? selectedOrder.operationalDetails.mileage.toLocaleString('tr-TR') + ' km' : '—'}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Durum Yönetimi</h4>
                        {selectedOrder.status === 'INTAKE_PENDING' && (
                            <button onClick={() => applyWorkOrderPatch(selectedOrder.id, { status: 'DIAGNOSIS' })} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200"><Wrench size={18}/> Teşhise Başla</button>
                        )}
                        {selectedOrder.status === 'DIAGNOSIS' && (
                            <button onClick={() => applyWorkOrderPatch(selectedOrder.id, { status: 'OFFER_DRAFT' })} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 shadow-lg shadow-purple-200"><FileText size={18}/> Teklif Hazırla</button>
                        )}
                        {selectedOrder.status === 'OFFER_DRAFT' && (
                            <button onClick={() => applyWorkOrderPatch(selectedOrder.id, { status: 'WAITING_APPROVAL' })} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200"><Send size={18}/> Onaya Gönder</button>
                        )}
                        {selectedOrder.status.includes('APPROVAL') || selectedOrder.status === 'WAITING_APPROVAL' ? (
                            <button onClick={() => applyWorkOrderPatch(selectedOrder.id, { status: 'APPROVED' })} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200 animate-pulse"><ThumbsUp size={18}/> Müşteri Onayını Simüle Et</button>
                        ) : null}
                        {selectedOrder.status === 'APPROVED' && (
                            <button onClick={() => applyWorkOrderPatch(selectedOrder.id, { status: 'IN_PROGRESS' })} className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-700 shadow-lg shadow-amber-200"><Play size={18}/> İşlemi Başlat</button>
                        )}
                        {selectedOrder.status === 'IN_PROGRESS' && (
                            <button onClick={() => applyWorkOrderPatch(selectedOrder.id, { status: 'READY_FOR_DELIVERY' })} className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-cyan-700 shadow-lg shadow-cyan-200"><CheckSquare size={18}/> İşlemi Bitir</button>
                        )}
                        {selectedOrder.status === 'READY_FOR_DELIVERY' && (
                            <button onClick={() => applyWorkOrderPatch(selectedOrder.id, { status: 'DELIVERED' })} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black shadow-lg shadow-slate-200"><Truck size={18}/> Aracı Teslim Et</button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                            <span>Sinyal Kalemleri</span>
                            <span>{selectedOrder.diagnosisItems.length} Kalem</span>
                        </h4>
                        <div className="space-y-3">
                            {selectedOrder.diagnosisItems.map(item => (
                                <div key={item.id} className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm hover:border-indigo-100 transition-all group overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{item.item}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{item.type === 'PART' ? 'Yedek Parça' : 'İşçilik'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-indigo-600">{item.signalCost.toLocaleString()} ₺</p>
                                            {item.type === 'PART' && (
                                                <button 
                                                    onClick={() => setExpandedPartId(expandedPartId === item.id ? null : item.id)}
                                                    className={`mt-2 text-[10px] font-black px-2 py-1 rounded transition-all flex items-center gap-1.5 ${
                                                        expandedPartId === item.id 
                                                        ? 'bg-indigo-600 text-white' 
                                                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                                    }`}
                                                >
                                                    <Globe size={12} /> {expandedPartId === item.id ? 'Paneli Kapat' : 'Alternatif Bul'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {expandedPartId === item.id && item.type === 'PART' && (
                                        <B2BAlternativesPanel 
                                            tenantId={currentUser.institutionId}
                                            partLabel={item.item}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] flex justify-between items-center mt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="text-xs font-bold text-indigo-800">Toplam Öngörü</span>
                            </div>
                            <span className="text-2xl font-black text-indigo-900">{total.toLocaleString()} ₺</span>
                        </div>
                    </div>
                </div>
            </aside>
        );
    };

    const renderDebugOverlay = () => (
        <div className="fixed bottom-4 left-4 z-[300] bg-slate-900/90 text-white p-3 rounded-lg border border-white/10 text-[9px] font-mono pointer-events-none">
            <p className="font-bold border-b border-white/10 pb-1 mb-1 text-emerald-400">System Signals (z-300)</p>
            <p>Active Order ID: {selectedOrderId || 'None'}</p>
            <p>Active Status: {selectedOrder?.status || 'N/A'}</p>
            <p>ERP Sync Rule: {erpSyncRule}</p>
            <p>ERP Connection: OK (200)</p>
            <p>Patent Mode: ENABLED (Zero-VIN Storage)</p>
        </div>
    );
    
    return (
        <div className="p-0 flex flex-col h-screen overflow-hidden bg-slate-50">
            <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-8 shrink-0 overflow-x-auto">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-700'}`}><tab.icon size={18} /> {tab.label}</button>
                ))}
            </div>

            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'REPAIR' && (
                    <div className="flex flex-col h-full overflow-y-auto">
                        {renderOperationSummary()}
                        {renderActiveWorkOrdersPanel()}
                    </div>
                )}
                {activeTab === 'WORK_ORDERS' && (
                    <div className="flex flex-col h-full">
                        {renderKanbanBoard()}
                    </div>
                )}
                {activeTab === 'AUTO_ORDER' && <AutoOrderPanel tenantId={currentUser.institutionId} />}
                {activeTab === 'NETWORK' && <B2BNetwork />}
                {activeTab === 'INVENTORY' && <PartStockSignals />}
                {activeTab === 'FINANCE' && <FinanceProfitability workOrders={workOrders} />}
                {activeTab === 'ERP' && <ERPBridgePanel workOrders={workOrders} />}
                {activeTab === 'REPORTS' && <OperationalReports workOrders={workOrders} />}
                {activeTab === 'SETTINGS' && (
                    <SettingsPanel 
                        tenantId={currentUser.institutionId} 
                        erpSyncRule={erpSyncRule}
                        onChangeErpSyncRule={setErpSyncRule}
                    />
                )}
                
                {activeTab !== 'WORK_ORDERS' &&
                 activeTab !== 'AUTO_ORDER' &&
                 activeTab !== 'NETWORK' &&
                 activeTab !== 'INVENTORY' &&
                 activeTab !== 'FINANCE' &&
                 activeTab !== 'ERP' &&
                 activeTab !== 'REPORTS' &&
                 activeTab !== 'SETTINGS' && (
                  <div className="p-12 text-center text-slate-400 h-full flex items-center justify-center">
                    <p>Modül geliştirme aşamasındadır.</p>
                  </div>
                )}
                
                {renderRightPanel()}
                {renderDebugOverlay()}

                <ServiceAssistantOverlay 
                    role="ADVISOR" 
                    workOrderId={selectedOrderId}
                />
                
                <ServiceIntakeOverlay 
                    workOrderId={selectedOrderId}
                    workOrders={workOrders}
                    assistantSuggestions={pendingRecs}
                    onApplySuggestion={async (id, rec) => handleApplyRecommendation(id, rec as any)}
                />
            </div>
            {intentToast && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-slate-700"><Zap size={16} className="text-amber-400 fill-amber-400 animate-pulse"/> {intentToast}</div>}
        </div>
    );
};