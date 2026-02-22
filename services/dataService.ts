
import { 
    VehicleProfile, NotificationItem, UserProfile, SlaMetric, TenantStats, 
    BatchJob, JobStatus, PriorityLevel, ServiceWorkOrder, OperationalDetails,
    WorkOrder, RetailerProfile, FleetVehicle, ExpertiseProfile, InsurancePolicy,
    DealerProfile, OEMPart, DamageRecord, PartRiskAnalysis, ServicePoint,
    SubscriptionDetails, Invoice, UsageLog, ViewState, AutoOrderConfig, AutoOrderSuggestion,
    ErpSyncLog, ServiceIntakePolicy, DEFAULT_SERVICE_INTAKE_POLICY, B2BNetworkState
} from '../types';
import * as b2bNetworkService from './b2bNetworkService';
import { dataEngine } from './dataEngine/dataEngine';

// --- PERSISTENCE KEYS ---
export const REPAIR_DASH_FEED_KEY = "LENT_REPAIR_DASH_FEED_V1";

// --- MOCK STORAGE ---
const MOCK_VAULT_AUDIT: any[] = [];
const MOCK_TENANT_VAULT: Map<string, Map<string, OperationalDetails>> = new Map();

// Service Orders (Public Metadata Only - No PII)
const MOCK_SERVICE_ORDERS: ServiceWorkOrder[] = [
    { 
        id: 'SWO-9921', 
        sourceEventId: 'EVT-112', 
        operationalHash: 'OP-HASH-8821', 
        status: 'DIAGNOSIS', 
        intakeChecklist: [{id:'c1', label:'Araç Kabul', checked:true}, {id:'c2', label:'Ekspertiz', checked:false}],
        diagnosisItems: [{id:'d1', item:'Fren Balatası', type:'PART', signalCost: 3500}],
        createdAt: '2024-05-24 09:30',
        updatedAt: '2024-05-24 10:15',
        operationalDetails: undefined,
        erpState: 'SYNCED',
        erpLastAttempt: '2024-05-24 10:15'
    },
    { 
        id: 'SWO-9922', 
        sourceEventId: 'EVT-113', 
        operationalHash: 'OP-HASH-8822', 
        status: 'INTAKE_PENDING', 
        intakeChecklist: [{id:'c1', label:'Araç Kabul', checked:false}],
        diagnosisItems: [],
        createdAt: '2024-05-24 11:00',
        updatedAt: '2024-05-24 11:00',
        operationalDetails: undefined,
        erpState: 'PENDING'
    },
    { 
        id: 'SWO-9923', 
        sourceEventId: 'EVT-114', 
        operationalHash: 'OP-HASH-8823', 
        status: 'WAITING_APPROVAL', 
        intakeChecklist: [{id:'c1', label:'Araç Kabul', checked:true}],
        diagnosisItems: [{id:'d1', item:'Triger Seti', type:'PART', signalCost: 8500}, {id:'d2', item:'İşçilik', type:'LABOR', signalCost: 4000}],
        createdAt: '2023-05-23 14:00',
        updatedAt: '2024-05-24 09:00',
        operationalDetails: undefined,
        erpState: 'ERROR',
        erpLastError: 'Connection Timeout: S/4HANA Endpoint Unreachable'
    },
    { 
        id: 'SWO-9924', 
        sourceEventId: 'EVT-115', 
        operationalHash: 'OP-HASH-8824', 
        status: 'APPROVED', 
        intakeChecklist: [{id:'c1', label:'Araç Kabul', checked:true}],
        diagnosisItems: [{id:'d1', item:'Yağ Bakımı', type:'PART', signalCost: 3200}],
        createdAt: '2023-05-23 16:30',
        updatedAt: '2024-05-24 08:45',
        operationalDetails: undefined,
        erpState: 'SYNCED',
        erpLastAttempt: '2024-05-24 08:45'
    },
    { 
        id: 'SWO-9925', 
        sourceEventId: 'EVT-116', 
        operationalHash: 'OP-HASH-8825', 
        status: 'READY_FOR_DELIVERY', 
        intakeChecklist: [{id:'c1', label:'Araç Kabul', checked:true}],
        diagnosisItems: [{id:'d1', item:'Lastik Değişimi', type:'PART', signalCost: 12000}],
        createdAt: '2024-05-22 10:00',
        updatedAt: '2024-05-24 12:00',
        operationalDetails: undefined,
        erpState: 'SYNCED',
        erpLastAttempt: '2024-05-24 12:00'
    }
];

// Initialize Mock Vault Data for Demo Tenant
const initMockVault = () => {
    const demoTenantId = 'LENT-CORP-SECURE';
    if (!MOCK_TENANT_VAULT.has(demoTenantId)) {
        MOCK_TENANT_VAULT.set(demoTenantId, new Map());
    }
    const tenantMap = MOCK_TENANT_VAULT.get(demoTenantId);
    if (tenantMap) {
        tenantMap.set('SWO-9921', { customerName: 'Gizli Müşteri A', customerPhone: '532*******', plate: '34 VM 228', consentStatus: 'GRANTED', internalNotes: 'VIP Müşteri' });
        tenantMap.set('SWO-9922', { customerName: 'Gizli Müşteri B', customerPhone: '533*******', plate: '06 AB 991', consentStatus: 'GRANTED', internalNotes: 'Yeni Kayıt' });
        tenantMap.set('SWO-9923', { customerName: 'Gizli Müşteri C', customerPhone: '535*******', plate: '35 KS 442', consentStatus: 'PENDING', internalNotes: 'Onay Bekliyor' });
        tenantMap.set('SWO-9924', { customerName: 'Gizli Müşteri D', customerPhone: '536*******', plate: '16 BRS 16', consentStatus: 'GRANTED', internalNotes: 'Parça bekleniyor' });
        tenantMap.set('SWO-9925', { customerName: 'Gizli Müşteri E', customerPhone: '537*******', plate: '07 ANT 07', consentStatus: 'GRANTED', internalNotes: 'Yıkama yapılacak' });
    }
};
initMockVault();

const MOCK_VEHICLES: VehicleProfile[] = [
    { vehicle_id: 'WBALZ7C5-XXXX-1', brand: 'BMW', model: '320i', year: 2020, engine: '1.6L Turbo', engine_code: 'B48B16', transmission: 'ZF 8HP', last_query: '2024-05-20', total_queries: 15, mileage: 64500, average_part_life_score: 85, failure_frequency_index: 0.8, risk_score: 42, resale_value_prediction: 1850000, damage_probability: 12, compatible_parts_count: 1450, institutionId: 'LENT-CORP-SECURE' },
    { vehicle_id: 'WBAVM135-XXXX-2', brand: 'Mercedes', model: 'C200d', year: 2021, engine: '1.6L Diesel', engine_code: 'OM654', transmission: '9G-Tronic', last_query: '2024-05-22', total_queries: 8, mileage: 42000, average_part_life_score: 92, failure_frequency_index: 0.4, risk_score: 15, resale_value_prediction: 2450000, damage_probability: 5, compatible_parts_count: 1200, institutionId: 'LENT-CORP-SECURE' },
    { vehicle_id: 'VVWZZZ3C-XXXX-3', brand: 'Volkswagen', model: 'Passat', year: 2019, engine: '1.5 TSI', engine_code: 'DADA', transmission: 'DSG 7', last_query: '2024-05-18', total_queries: 45, mileage: 110000, average_part_life_score: 65, failure_frequency_index: 2.1, risk_score: 68, resale_value_prediction: 1350000, damage_probability: 25, compatible_parts_count: 2100, institutionId: 'LENT-CORP-SECURE' },
    { vehicle_id: 'JTDKN3DU-XXXX-4', brand: 'Toyota', model: 'Corolla', year: 2022, engine: '1.8 Hybrid', engine_code: '2ZR-FXE', transmission: 'e-CVT', last_query: '2024-05-24', total_queries: 5, mileage: 25000, average_part_life_score: 98, failure_frequency_index: 0.1, risk_score: 8, resale_value_prediction: 1450000, damage_probability: 3, compatible_parts_count: 850, institutionId: 'LENT-CORP-SECURE' },
];

const MOCK_NOTIFICATIONS: NotificationItem[] = [
    { id: 'not-1', title: 'Stok Uyarısı', message: 'Fren balatası stokları kritik seviyenin altında.', timestamp: '10 dk önce', type: 'WARNING', read: false, targetView: ViewState.RETAILERS },
    { id: 'not-2', title: 'Sistem Güncellemesi', message: 'SafeCore v2.4 başarıyla yüklendi.', timestamp: '1 saat önce', type: 'SUCCESS', read: false },
    { id: 'not-3', title: 'Şüpheli İşlem', message: 'Aynı IP adresinden çoklu sorgu tespit edildi.', timestamp: '2 saat önce', type: 'CRITICAL', read: false, targetView: ViewState.SETTINGS }
];

const MOCK_USERS: UserProfile[] = [
    { id: 'u1', name: 'Mustafa Cam', email: 'mustafa@sirket.com', role: 'ADMIN', department: 'IT', institutionId: 'LENT-CORP-SECURE', status: 'ACTIVE', lastLogin: 'Şimdi', accessLevel: 5, permissions: [], dailyLimit: 100, queriesToday: 12, aiQuotaUsed: 450 },
    { id: 'u2', name: 'Ayşe Yılmaz', email: 'ayse@sirket.com', role: 'MANAGER', department: 'Operasyon', institutionId: 'LENT-CORP-SECURE', status: 'ACTIVE', lastLogin: '1 saat önce', accessLevel: 4, permissions: [], dailyLimit: 50, queriesToday: 45, aiQuotaUsed: 120 },
];

const MOCK_WORK_ORDERS: WorkOrder[] = [
    { id: 'WO-1001', vehicleId: 'WBALZ7C5-XXXX-1', vehicleName: 'BMW 320i', serviceName: 'Borusan Oto İstinye', progress: 65, estimatedCost: 12500, status: 'IN_PROGRESS', operationType: 'Periyodik Bakım' },
    { id: 'WO-1002', vehicleId: 'VVWZZZ3C-XXXX-3', vehicleName: 'VW Passat', serviceName: 'Doğuş Oto Maslak', progress: 30, estimatedCost: 45000, status: 'IN_PROGRESS', operationType: 'Ağır Hasar Onarımı' },
];

const MOCK_RETAILERS: RetailerProfile[] = [
    { id: 'R-001', name: 'Martaş Otomotiv', city: 'İstanbul', type: 'Ana Dağıtıcı', inventoryCount: 45000 },
    { id: 'R-002', name: 'Üçler Yedek Parça', city: 'Ankara', type: 'Bayi', inventoryCount: 12000 },
];

const MOCK_FLEET: FleetVehicle[] = [
    { vehicle_id: 'FL-001', plate: '34 VM 228', brand: 'Fiat', model: 'Egea', year: 2023, status: 'ACTIVE', driverName: 'Ahmet Y.', location: { city: 'İstanbul' }, contractEnd: '2025-12-31' },
    { vehicle_id: 'FL-002', plate: '06 AB 991', brand: 'Renault', model: 'Clio', year: 2022, status: 'MAINTENANCE', driverName: 'Mehmet K.', location: { city: 'Ankara' }, contractEnd: '2024-06-30' },
];

// --- B2B NETWORK TYPES & DATA ---
export interface NetworkPart {
    id: string;
    name: string;
    category: string;
    compatibility: string[];
    availabilitySignal: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
    deliveryEstimate: string; 
    priceRange: string; 
    supplierAlias: string; 
}

const MOCK_NETWORK_PARTS: NetworkPart[] = [
    { id: 'NP-101', name: 'DSG Kavrama Seti (Gen. 2)', category: 'Şanzıman', compatibility: ['VW', 'Audi'], availabilitySignal: 'AVAILABLE', deliveryEstimate: '24-48 Saat', priceRange: '18.500 - 19.200 ₺', supplierAlias: 'LENT+ Supply Network' },
    { id: 'NP-102', name: 'LED Matrix Far (Sol)', category: 'Aydınlatma', compatibility: ['BMW G20'], availabilitySignal: 'LIMITED', deliveryEstimate: '3-5 Gün', priceRange: '42.000 - 45.000 ₺', supplierAlias: 'LENT+ Supply Network' },
    { id: 'NP-103', name: 'Turboşarj Ünitesi 1.6 TDI', category: 'Motor', compatibility: ['VW', 'Skoda'], availabilitySignal: 'AVAILABLE', deliveryEstimate: '24 Saat', priceRange: '12.000 - 13.500 ₺', supplierAlias: 'LENT+ Supply Network' },
    { id: 'NP-104', name: 'Ön Tampon (M Sport)', category: 'Kaporta', compatibility: ['BMW F30'], availabilitySignal: 'UNAVAILABLE', deliveryEstimate: 'Bilinmiyor', priceRange: '-', supplierAlias: 'LENT+ Supply Network' }
];

// --- AUTO ORDER MOCK DATA ---
let AUTO_ORDER_SYSTEM_ACTIVE = true;
const MOCK_AUTO_ORDER_CONFIGS: AutoOrderConfig[] = [
    { id: 'cfg-1', categoryName: 'Fren Sistemi', isActive: true, triggerThreshold: 'CRITICAL', orderBatchSize: 'MEDIUM' },
    { id: 'cfg-2', categoryName: 'Filtreler', isActive: true, triggerThreshold: 'LIMITED', orderBatchSize: 'LARGE' },
    { id: 'cfg-3', categoryName: 'Sıvı & Yağ', isActive: false, triggerThreshold: 'CRITICAL', orderBatchSize: 'LARGE' },
    { id: 'cfg-4', categoryName: 'Ateşleme', isActive: true, triggerThreshold: 'CRITICAL', orderBatchSize: 'SMALL' }
];

let MOCK_ORDER_SUGGESTIONS: AutoOrderSuggestion[] = [
    { id: 'sug-1', partName: 'Fren Balatası (Standart)', category: 'Fren Sistemi', currentSignal: 'CRITICAL', suggestedBatch: 'MEDIUM', generatedAt: '10 dk önce', status: 'PENDING' },
    { id: 'sug-2', partName: 'Hava Filtresi', category: 'Filtreler', currentSignal: 'LIMITED', suggestedBatch: 'LARGE', generatedAt: '1 saat önce', status: 'PENDING' },
];

// --- ERP INTEGRATION MOCK DATA ---
let MOCK_ERP_LOGS: ErpSyncLog[] = [
    { id: 'ERP-L1', workOrderId: 'SWO-9924', targetSystem: 'SAP S/4HANA', timestamp: '2024-05-24 09:15', payloadSummary: 'Invoice & Parts Sync', status: 'SUCCESS', retryCount: 0 },
    { id: 'ERP-L2', workOrderId: 'SWO-9923', targetSystem: 'SAP S/4HANA', timestamp: '2024-05-23 16:00', payloadSummary: 'Work Order Creation', status: 'FAILED', retryCount: 3 }
];

// --- SERVICE INTAKE POLICY ---
let MOCK_SERVICE_INTAKE_POLICY: ServiceIntakePolicy = { ...DEFAULT_SERVICE_INTAKE_POLICY };

export const getServiceIntakePolicy = async (tenantId: string): Promise<ServiceIntakePolicy> => {
    return Promise.resolve(MOCK_SERVICE_INTAKE_POLICY);
};

export const updateServiceIntakePolicy = async (tenantId: string, policy: ServiceIntakePolicy): Promise<void> => {
    MOCK_SERVICE_INTAKE_POLICY = { ...policy };
    return Promise.resolve();
};

// --- EXPORTED FUNCTIONS ---

// B2B Network Integration
export async function getB2BNetwork(): Promise<B2BNetworkState> {
  return await b2bNetworkService.getB2BNetwork();
}

// ERP Functions
export const getErpSyncHistory = async (): Promise<ErpSyncLog[]> => Promise.resolve(MOCK_ERP_LOGS);

export const triggerErpSync = async (workOrderId: string): Promise<{ success: boolean; message: string }> => {
    const success = Math.random() > 0.3; 
    const newLog: ErpSyncLog = {
        id: `ERP-L${Date.now()}`,
        workOrderId,
        targetSystem: 'SAP S/4HANA',
        timestamp: new Date().toLocaleString('tr-TR'),
        payloadSummary: 'Manual Sync Trigger',
        status: success ? 'SUCCESS' : 'FAILED',
        retryCount: 0
    };
    MOCK_ERP_LOGS.unshift(newLog);
    return Promise.resolve({ success, message: success ? 'ERP Senkronizasyonu Başarılı' : 'ERP Bağlantı Hatası (Non-blocking)' });
};

// Auto Order Functions
export const getAutoOrderSystemStatus = async () => Promise.resolve(AUTO_ORDER_SYSTEM_ACTIVE);
export const toggleAutoOrderSystem = async (status: boolean) => {
    AUTO_ORDER_SYSTEM_ACTIVE = status;
    return Promise.resolve(status);
};

export const getAutoOrderConfigs = async () => Promise.resolve(MOCK_AUTO_ORDER_CONFIGS);
export const updateAutoOrderConfig = async (config: AutoOrderConfig) => {
    const idx = MOCK_AUTO_ORDER_CONFIGS.findIndex(c => c.id === config.id);
    if(idx > -1) MOCK_AUTO_ORDER_CONFIGS[idx] = config;
    return Promise.resolve();
};

export const getAutoOrderSuggestions = async () => Promise.resolve(MOCK_ORDER_SUGGESTIONS);
export const approveAutoOrderSuggestion = async (id: string) => {
    MOCK_ORDER_SUGGESTIONS = MOCK_ORDER_SUGGESTIONS.map(s => s.id === id ? { ...s, status: 'APPROVED' as const } : s);
    return Promise.resolve({ success: true, message: 'AUTO_ORDER_APPROVED_EVENT emitted' });
};

// Advanced Profitability & Reports Data
export const getProfitabilityMetrics = async () => {
    return Promise.resolve({
        margins: { labor: 65, parts: 35 },
        completionEfficiency: { averageDays: 2.4, target: 2.0 },
        platformSourcingRatio: 42, 
        profitTrend: [
            { period: 'Ocak', index: 100 },
            { period: 'Şubat', index: 104 },
            { period: 'Mart', index: 102 },
            { period: 'Nisan', index: 108 },
            { period: 'Mayıs', index: 115 }
        ]
    });
};

// B2B Network Functions
export const searchNetworkParts = async (query: string): Promise<NetworkPart[]> => {
    if (!query) return Promise.resolve([]);
    const lowerQ = query.toLowerCase();
    return Promise.resolve(MOCK_NETWORK_PARTS.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.category.toLowerCase().includes(lowerQ) ||
        p.compatibility.some(c => c.toLowerCase().includes(lowerQ))
    ));
};

export const placeNetworkOrder = async (partId: string): Promise<{orderId: string, status: string}> => {
    return Promise.resolve({
        orderId: `NET-ORD-${Math.floor(Math.random() * 10000)}`,
        status: 'PENDING_SUPPLY_CONFIRMATION'
    });
};

// Notifications
export const getNotifications = async (): Promise<NotificationItem[]> => {
    return Promise.resolve(MOCK_NOTIFICATIONS);
};

// Vehicles
export const addSearchedVehicle = async (id: string, vin?: string): Promise<void> => {
    const newVehicle: VehicleProfile = {
        vehicle_id: id,
        brand: 'Bilinmiyor',
        model: 'Bilinmiyor',
        year: 2024,
        engine: '-',
        transmission: '-',
        last_query: 'Şimdi',
        total_queries: 1,
        mileage: 0,
        average_part_life_score: 50,
        failure_frequency_index: 0,
        risk_score: 0,
        resale_value_prediction: 0,
        damage_probability: 0,
        compatible_parts_count: 0,
        institutionId: 'CURRENT'
    };
    MOCK_VEHICLES.unshift(newVehicle);
    return Promise.resolve();
};

export const getVehicleList = async (): Promise<VehicleProfile[]> => Promise.resolve(MOCK_VEHICLES);
export const getVehicleProfile = async (id: string): Promise<VehicleProfile | undefined> => {
    return Promise.resolve(MOCK_VEHICLES.find(v => v.vehicle_id === id));
};

// Dashboard
export const getDashboardMetricsSync = () => ({
    monthlyVinUsage: 12450,
    usageLimit: 15000,
    matchedParts: 8942,
    timeSavedHours: 420
});

/**
 * getWorkOrders
 * Dashboard "Aktif İş Emri Takibi" tablosunu besleyen fonksiyon.
 * Önce RepairShops'tan gelen canlı feed'e bakar, yoksa mock data döner.
 */
export const getWorkOrders = async (): Promise<WorkOrder[]> => {
    const rawFeed = localStorage.getItem(REPAIR_DASH_FEED_KEY);
    if (rawFeed) {
        try {
            return JSON.parse(rawFeed);
        } catch (e) {
            console.error("Dashboard feed parse error", e);
        }
    }
    return Promise.resolve(MOCK_WORK_ORDERS);
};

export const getRetailers = async (): Promise<RetailerProfile[]> => Promise.resolve(MOCK_RETAILERS);
export const getFleetCompanies = async (): Promise<any[]> => Promise.resolve([{id:'C1', name:'AVIS Filo', region:'TR-Marmara', fleetSize: 4500, occupancyRate: 92}]);
export const getExpertiseCenters = async (): Promise<ExpertiseProfile[]> => Promise.resolve([{id:'E1', name:'Pilot Garage Maslak', city:'İstanbul', certificationLevel:'TSE-HYB', fraudDetectionRate: 12}]);
export const getInsuranceData = async (): Promise<InsurancePolicy[]> => Promise.resolve([
    { id: 'POL-1', plate: '34 VM 228', policyType: 'CASCO', endDate: '2025-01-12', riskScore: 15, status: 'ACTIVE' },
    { id: 'POL-2', plate: '06 AB 991', policyType: 'TRAFFIC', endDate: '2024-08-20', riskScore: 65, status: 'ACTIVE' }
]);
export const getIndividualUsers = async (): Promise<any[]> => Promise.resolve([{id:'U1', name:'Ahmet Yılmaz', membershipType:'Premium', appUsageScore: 85}]);

export const getUsers = async (): Promise<UserProfile[]> => Promise.resolve(MOCK_USERS);
export const getDealers = async (): Promise<DealerProfile[]> => Promise.resolve([{id:'D1', name:'Borusan Oto', city:'İstanbul', inventorySize: 120, turnoverRate: 15, customerSatisfaction: 98, membershipLevel: 'GOLD'}]);
export const getProductIntelligenceData = async (): Promise<any> => Promise.resolve({
    aiUsage: [{name:'Risk', count:1200}, {name:'Parça', count:3400}],
    revenueByModule: [{name:'Parça', revenue: 45000}, {name:'Servis', revenue: 22000}],
    topClients: [{id:'1', name:'AVIS', sector:'Rental', topFeature:'Risk', spend: 125000}],
    institutionalSplit: [{name:'Rental', value: 40, color:'#0088FE'}, {name:'Sigorta', value: 30, color:'#00C49F'}]
});

// Repair Shops & Operations (TENANT ISOLATED)
export const getServiceWorkOrders = async (tenantId: string): Promise<ServiceWorkOrder[]> => {
    return MOCK_SERVICE_ORDERS.map(o => {
        const { operationalDetails, ...safeOrder } = o;
        return JSON.parse(JSON.stringify(safeOrder));
    });
};

export const createServiceWorkOrder = async (tenantId: string, order: ServiceWorkOrder): Promise<void> => {
    const { operationalDetails, ...safeOrder } = order;
    MOCK_SERVICE_ORDERS.push(safeOrder as ServiceWorkOrder);
    if (operationalDetails) {
        await saveOperationalDetails(tenantId, order.id, operationalDetails);
    }
};

export const saveOperationalDetails = async (tenantId: string, workOrderId: string, details: OperationalDetails): Promise<void> => {
    if (!MOCK_TENANT_VAULT.has(tenantId)) {
        MOCK_TENANT_VAULT.set(tenantId, new Map());
    }
    const tenantPartition = MOCK_TENANT_VAULT.get(tenantId);
    if (tenantPartition) {
        tenantPartition.set(workOrderId, details);
    }
};

export const updateServiceWorkOrder = async (order: ServiceWorkOrder): Promise<void> => {
    const index = MOCK_SERVICE_ORDERS.findIndex(o => o.id === order.id);
    if (index !== -1) {
        const { operationalDetails, ...safeOrder } = order;
        MOCK_SERVICE_ORDERS[index] = { ...MOCK_SERVICE_ORDERS[index], ...safeOrder };
    }
};

export const getOperationalDetails = async (tenantId: string, workOrderId: string): Promise<OperationalDetails | undefined> => {
    const tenantPartition = MOCK_TENANT_VAULT.get(tenantId);
    if (tenantPartition) {
        return tenantPartition.get(workOrderId);
    }
    return undefined;
};

export const logVaultAccess = async (tenantId: string, workOrderId: string, role: string) => {
    const logEntry = {
        action: 'OPERATIONAL_DETAILS_ACCESSED',
        workOrderId,
        tenantId,
        role,
        timestamp: new Date().toISOString()
    };
    MOCK_VAULT_AUDIT.push(logEntry);
};

// Vehicle Details
export const getVehicleOEMParts = async (vehicleId: string): Promise<OEMPart[]> => {
    const vehicle = MOCK_VEHICLES.find(v => v.vehicle_id === vehicleId);
    
    const parts: OEMPart[] = [
        { id: 'P1', name: 'Fren Balatası Ön', oemCode: '34116850885', brand: 'Brembo', category: 'Fren Sistemi', price: 2450, stock: true, matchScore: 100 },
        { id: 'P2', name: 'Yağ Filtresi', oemCode: '11427566327', brand: 'Mann-Filter', category: 'Filtreler', price: 450, stock: true, matchScore: 100 },
        { id: 'P3', name: 'Debriyaj Seti', oemCode: '21207628091', brand: 'LuK', category: 'Şanzıman', price: 12500, stock: false, matchScore: 98 },
    ];

    // ========== Veri Motoru: Parça Arama Intent Kaydı ==========
    if (vehicle) {
        // Mock şehir ve ilçe (gerçek uygulamada GPS/lokasyon olacak)
        const cities: { [key: string]: { city: string; district: string } } = {
            'WBALZ7C5-XXXX-1': { city: 'İstanbul', district: 'Sarıyer' },
            'WBAVM135-XXXX-2': { city: 'Ankara', district: 'Çankaya' },
            'VVWZZZ3C-XXXX-3': { city: 'İzmir', district: 'Alsancak' },
            'JTDKN3DU-XXXX-4': { city: 'Gaziantep', district: 'Şahinbey' }
        };
        const location = cities[vehicleId] || { city: 'Bilinmiyor', district: 'Bilinmiyor' };

        // Her arama intent'i için kayıt yap
        parts.forEach(part => {
            dataEngine.logSearchIntent({
                oem: part.oemCode,
                vehicleModel: `${vehicle.brand} ${vehicle.model}`,
                city: location.city,
                district: location.district,
                lentStockAvailable: part.stock
            });
        });

        console.log(`[SearchIntent] ${parts.length} parça arama kaydedildi - ${vehicle.brand} ${vehicle.model} (${location.city})`);
    }

    return Promise.resolve(parts);
};

export const getVehicleDamageHistory = async (vehicleId: string): Promise<DamageRecord[]> => {
    return Promise.resolve([
        { id: 'D1', date: '2023-11-15', type: 'ACCIDENT', source: 'SBM', amount: 45000, description: 'Ön tampon ve far değişimi', serviceProvider: 'Yetkili Servis', partsReplaced: ['Ön Tampon', 'Sağ Far'] },
        { id: 'D2', date: '2023-05-20', type: 'MAINTENANCE', source: 'SERVICE', amount: 8500, description: '60.000 KM Bakımı', serviceProvider: 'Borusan Oto', partsReplaced: ['Yağ', 'Filtreler', 'Balata'] }
    ]);
};

// Analysis
export const getPartAnalysisForVehicle = async (vehicleId: string): Promise<PartRiskAnalysis[]> => {
    return Promise.resolve([
        { id: 'RA1', partName: 'Triger Kayışı', riskLevel: 'CRITICAL', healthScore: 15, demographicImpact: 'Yüksek KM', insuranceRef: 'IRC-992', regionName: 'Marmara', partCost: 4500, laborCost: 2000, estimatedTime: 240 },
        { id: 'RA2', partName: 'Fren Diskleri', riskLevel: 'HIGH', healthScore: 45, demographicImpact: 'Trafik Yoğunluğu', insuranceRef: 'IRC-102', regionName: 'İstanbul', partCost: 3000, laborCost: 800, estimatedTime: 90 },
        { id: 'RA3', partName: 'Amortisörler', riskLevel: 'LOW', healthScore: 85, demographicImpact: '-', insuranceRef: 'IRC-001', regionName: 'Genel', partCost: 0, laborCost: 0, estimatedTime: 0 },
    ]);
};

export const getServicePoints = async (cityCode: number): Promise<ServicePoint[]> => {
    return Promise.resolve([
        { id: 'SP1', name: 'Borusan Oto İstinye', district: 'Sarıyer', type: 'AUTHORIZED', nextAvailableSlot: 'Yarın 10:00' },
        { id: 'SP2', name: 'Maslak Bosch Car Service', district: 'Maslak', type: 'PRIVATE', nextAvailableSlot: 'Bugün 14:00' },
    ]);
};

// Parts & Orders
export const addToMaintenancePlan = async (vehicleId: string, part: OEMPart) => Promise.resolve({ success: true, message: 'Parça bakım planına eklendi.' });

/**
 * ERP Siparişi Oluştur
 * 
 * @param order Sipariş nesnesi (OEM, araç modeli, miktar vs.)
 */
export const createERPOrder = async (order: {
    oem?: string;
    vehicleId?: string;
    vehicleModel?: string;
    quantity?: number;
    unitPrice?: number;
    [key: string]: any;
}) => {
    // ========== Veri Motoru: Sipariş Yürütüm Kaydı (ERP) ==========
    if (order.oem && order.vehicleModel && order.quantity && order.unitPrice) {
        const cities: { [key: string]: { city: string; district: string } } = {
            'WBALZ7C5-XXXX-1': { city: 'İstanbul', district: 'Sarıyer' },
            'WBAVM135-XXXX-2': { city: 'Ankara', district: 'Çankaya' },
            'VVWZZZ3C-XXXX-3': { city: 'İzmir', district: 'Alsancak' },
            'JTDKN3DU-XXXX-4': { city: 'Gaziantep', district: 'Şahinbey' }
        };
        const location = cities[order.vehicleId || ''] || { city: 'Bilinmiyor', district: 'Bilinmiyor' };

        dataEngine.logOrderExecution({
            oem: order.oem,
            vehicleModel: order.vehicleModel,
            city: location.city,
            district: location.district,
            source: 'ERP',
            quantity: order.quantity,
            unitPrice: order.unitPrice
        });

        console.log(`[OrderExecution] ERP Sipariş: ${order.quantity}x ${order.oem} @ ${order.unitPrice}₺ (${location.city})`);
    }

    return Promise.resolve({ success: true, orderId: 'ERP-9921' });
};

/**
 * Lent Stoğundan Sipariş Al
 * Doğrudan Lent deposundan parça sipariş etme
 * 
 * @param order Sipariş nesnesi
 */
export const createLentOrder = async (order: {
    oem?: string;
    vehicleId?: string;
    vehicleModel?: string;
    quantity?: number;
    unitPrice?: number;
    [key: string]: any;
}) => {
    // ========== Veri Motoru: Sipariş Yürütüm Kaydı (LENT) ==========
    if (order.oem && order.vehicleModel && order.quantity && order.unitPrice) {
        const cities: { [key: string]: { city: string; district: string } } = {
            'WBALZ7C5-XXXX-1': { city: 'İstanbul', district: 'Sarıyer' },
            'WBAVM135-XXXX-2': { city: 'Ankara', district: 'Çankaya' },
            'VVWZZZ3C-XXXX-3': { city: 'İzmir', district: 'Alsancak' },
            'JTDKN3DU-XXXX-4': { city: 'Gaziantep', district: 'Şahinbey' }
        };
        const location = cities[order.vehicleId || ''] || { city: 'Bilinmiyor', district: 'Bilinmiyor' };

        dataEngine.logOrderExecution({
            oem: order.oem,
            vehicleModel: order.vehicleModel,
            city: location.city,
            district: location.district,
            source: 'LENT',
            quantity: order.quantity,
            unitPrice: order.unitPrice
        });

        console.log(`[OrderExecution] LENT Sipariş: ${order.quantity}x ${order.oem} @ ${order.unitPrice}₺ (${location.city})`);
    }

    return Promise.resolve({ success: true, orderId: 'LENT-9921' });
};

/**
 * Merkezi Veri Motoru İstatistiklerini Getir
 * (İç kullanım - Dashboard metrikleri için)
 */
export const getDataEngineStats = () => {
    return dataEngine.getStats();
};

/**
 * Son Arama Intentlerini Getir
 * (İç kullanım - Debug/monitoring için)
 */
export const getRecentSearchIntents = (count: number = 10) => {
    return dataEngine.getRecentSearchIntents(count);
};

/**
 * Son Siparişleri Getir
 * (İç kullanım - Debug/monitoring için)
 */
export const getRecentOrders = (count: number = 10) => {
    return dataEngine.getRecentOrders(count);
};

// System Stats
export const getUsageHistory = (): UsageLog[] => [
    { id: 'L1', timestamp: '2024-05-24 10:00', action: 'VIN_QUERY', user: 'Ahmet Y.', userId: 'u1', status: 'SUCCESS', cost: 0.5, details: 'BMW 320i Sorgusu', latencyMs: 240, behavioralFlag: 'NORMAL' },
    { id: 'L2', timestamp: '2024-05-24 10:05', action: 'RISK_ANALYSIS', user: 'Ahmet Y.', userId: 'u1', status: 'SUCCESS', cost: 1.2, details: 'Risk Raporu', latencyMs: 800, behavioralFlag: 'NORMAL' },
];

export const getSlaMetrics = async (): Promise<SlaMetric[]> => Promise.resolve([]);
export const getUsageStatsByTenant = async (): Promise<TenantStats> => Promise.resolve({ id: 'T1', name: 'LENT Corp', totalQueries: 12450, activeUsers: 15, totalCost: 4500, slaCompliance: 99.9, planLimit: 15000 });
export const getUserActivityMetrics = async (): Promise<any[]> => Promise.resolve([{name:'Ahmet', queries: 450}, {name:'Mehmet', queries: 320}]);

// Subscription & Users
export const getSubscriptionDetails = async (): Promise<SubscriptionDetails> => Promise.resolve({
    planName: 'Enterprise Gold',
    status: 'ACTIVE',
    renewalDate: '2025-01-01',
    price: 4999,
    currency: 'USD',
    limits: {
        vinQueries: { used: 12450, total: 50000 },
        apiCalls: { used: 450000, total: 1000000 },
        storage: { used: 45, total: 100, unit: 'GB' },
        aiTokens: { used: 250000, total: 1000000 }
    },
    paymentMethod: { last4: '4242', brand: 'Visa', expiry: '12/26' }
});

export const getBillingHistory = async (): Promise<Invoice[]> => Promise.resolve([
    { id: 'INV-2024-05', date: '2024-05-01', amount: 4999, currency: 'USD', status: 'PAID' },
    { id: 'INV-2024-04', date: '2024-04-01', amount: 4999, currency: 'USD', status: 'PAID' }
]);

export const createUser = async (user: UserProfile) => { MOCK_USERS.push({...user, id: `u${Date.now()}`}); return Promise.resolve(); };
export const deleteUser = async (id: string) => { const idx = MOCK_USERS.findIndex(u => u.id === id); if(idx > -1) MOCK_USERS.splice(idx, 1); return Promise.resolve(); };
export const updateUser = async (id: string, data: Partial<UserProfile>) => { 
    const idx = MOCK_USERS.findIndex(u => u.id === id); 
    if(idx > -1) MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...data }; 
    return Promise.resolve(); 
};

// Fleet
export const getFleetVehicles = async (): Promise<FleetVehicle[]> => Promise.resolve(MOCK_FLEET);
export const getFleetMaintenanceRecords = async (): Promise<any[]> => Promise.resolve([{id:'M1', plate:'34 VM 228', type:'Periyodik', date:'2024-06-15'}]);
export const getFleetContracts = async (): Promise<any[]> => Promise.resolve([{id:'C1', customer:'ABC Lojistik', monthly: 24500, status:'ACTIVE'}]);
export const getBatchJobs = async (): Promise<BatchJob[]> => Promise.resolve([
    { id: 'JOB-1', name: 'Filo Risk Analizi', status: JobStatus.COMPLETED, priority: PriorityLevel.NORMAL, totalItems: 150, processedItems: 150, successCount: 148, errorCount: 2, createdAt: '10 dk önce' }
]);
export const submitBatchJob = async (name: string, items: any[], priority: PriorityLevel) => Promise.resolve({ jobId: 'JOB-NEW', status: 'QUEUED' });
// --- DEMO BRAND MAPPING FOR PARTS ---
const DEMO_BRAND_MAP: Record<string, string> = {
    'Fren Balatası': 'Textar',
    'Triger Seti': 'INA',
    'Yağ Bakımı': 'Castrol',
    'Lastik': 'Michelin',
    'İşçilik': 'SERVICE',
    'Disk Fren': 'Brembo',
    'Motor Yağı': 'Mobil',
    'Filtru': 'Mann',
    'Pil': 'Varta',
    'Şamandıra': 'OEM',
};

// --- DEMO COST MAPPING FOR PROFIT CALCULATION ---
export const DEMO_COST_MAP: Record<string, number> = {
    "Fren Balatası": 1800,
    "Triger Seti": 5200,
    "Yağ Bakımı": 2100,
    "Lastik Değişimi": 8500,
    "İşçilik": 500,
};

// --- DASHBOARD ANALYTICS ---
export interface PartBrandSummary {
    brand: string;
    count: number;
    percentage: number;
}

export interface VehicleConsumptionSummary {
    vehicleName: string;
    itemCount: number;
    totalCost: number;
}

/**
 * getTopPartBrandsFromWorkOrders
 * Aggregates part brands from work orders and returns top 5
 */
export const getTopPartBrandsFromWorkOrders = async (): Promise<PartBrandSummary[]> => {
    const workOrders = await getWorkOrders();
    const serviceOrders = await getServiceWorkOrders('LENT-CORP-SECURE');
    
    const brandCountMap: Record<string, number> = {};
    let totalItems = 0;

    // Aggregate from regular work orders if they have diagnosisItems
    workOrders.forEach(wo => {
        if ((wo as any).diagnosisItems && Array.isArray((wo as any).diagnosisItems)) {
            ((wo as any).diagnosisItems as any[]).forEach(item => {
                const itemName = item.item || 'Bilinmeyen';
                const brand = DEMO_BRAND_MAP[itemName] || itemName.split(' ')[0];
                brandCountMap[brand] = (brandCountMap[brand] || 0) + 1;
                totalItems++;
            });
        }
    });

    // Aggregate from service work orders
    serviceOrders.forEach(so => {
        if (so.diagnosisItems && Array.isArray(so.diagnosisItems)) {
            so.diagnosisItems.forEach(item => {
                const itemName = item.item || 'Bilinmeyen';
                const brand = DEMO_BRAND_MAP[itemName] || itemName.split(' ')[0];
                brandCountMap[brand] = (brandCountMap[brand] || 0) + 1;
                totalItems++;
            });
        }
    });

    // Convert to array and sort
    const brandSummaries: PartBrandSummary[] = Object.entries(brandCountMap)
        .map(([brand, count]) => ({
            brand,
            count,
            percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return Promise.resolve(brandSummaries);
};

/**
 * getTopVehiclesByConsumptionFromWorkOrders
 * Aggregates vehicle consumption (item count and total cost) from work orders and returns top 5
 */
export const getTopVehiclesByConsumptionFromWorkOrders = async (): Promise<VehicleConsumptionSummary[]> => {
    const workOrders = await getWorkOrders();
    const serviceOrders = await getServiceWorkOrders('LENT-CORP-SECURE');

    const vehicleConsumptionMap: Record<string, { itemCount: number; totalCost: number }> = {};

    // Aggregate from regular work orders
    workOrders.forEach(wo => {
        const vehicleName = wo.vehicleName || 'Bilinmeyen Araç';
        if (!vehicleConsumptionMap[vehicleName]) {
            vehicleConsumptionMap[vehicleName] = { itemCount: 0, totalCost: 0 };
        }
        if ((wo as any).diagnosisItems && Array.isArray((wo as any).diagnosisItems)) {
            ((wo as any).diagnosisItems as any[]).forEach(item => {
                vehicleConsumptionMap[vehicleName].itemCount++;
                vehicleConsumptionMap[vehicleName].totalCost += item.signalCost || 0;
            });
        }
        // Fallback to estimatedCost if available
        if ((wo as any).estimatedCost) {
            vehicleConsumptionMap[vehicleName].totalCost = Math.max(
                vehicleConsumptionMap[vehicleName].totalCost,
                (wo as any).estimatedCost
            );
        }
    });

    // Aggregate from service work orders
    serviceOrders.forEach(so => {
        const vehicleName = so.operationalDetails?.plate || 'Bilinmeyen Araç';
        if (!vehicleConsumptionMap[vehicleName]) {
            vehicleConsumptionMap[vehicleName] = { itemCount: 0, totalCost: 0 };
        }
        if (so.diagnosisItems && Array.isArray(so.diagnosisItems)) {
            so.diagnosisItems.forEach(item => {
                vehicleConsumptionMap[vehicleName].itemCount++;
                vehicleConsumptionMap[vehicleName].totalCost += item.signalCost || 0;
            });
        }
    });

    // Convert to array and sort by total cost (descending)
    const vehicleSummaries: VehicleConsumptionSummary[] = Object.entries(vehicleConsumptionMap)
        .map(([vehicleName, data]) => ({
            vehicleName,
            itemCount: data.itemCount,
            totalCost: data.totalCost
        }))
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, 5);

    return Promise.resolve(vehicleSummaries);
};

// --- AFTERMARKET HISTORY (30 DAYS ANALYTICS) ---
export const getAftermarketHistory30d = async () => {
    const { AftermarketHistory30d } = await import('../types');
    
    const mockData: import('../types').AftermarketHistory30d = {
        kpis: {
            revenue30d: 2850000,
            orders30d: 342,
            turnoverIndex: 78.5,
            returnRate: 5.2
        },
        topBrands: [
            { name: 'Bosch', value: 385000 },
            { name: 'Varta', value: 278000 },
            { name: 'Brembo', value: 652000 },
            { name: 'Castrol', value: 412000 },
            { name: 'NGK', value: 123000 }
        ],
        topCategories: [
            { name: 'Fren Sistemi', value: 652000 },
            { name: 'Sıvılar', value: 412000 },
            { name: 'Elektronik', value: 385000 },
            { name: 'Aksesuar', value: 278000 },
            { name: 'Ateşleme', value: 123000 }
        ],
        topVehicleConsumption: [
            { vehicle: 'BMW 3 Series', topCategory: 'Fren Sistemi', index: 95, region: 'İstanbul' },
            { vehicle: 'Mercedes C Class', topCategory: 'Fren Sistemi', index: 87, region: 'İstanbul' },
            { vehicle: 'VW Passat', topCategory: 'Sıvılar', index: 78, region: 'İzmir' },
            { vehicle: 'Toyota Corolla', topCategory: 'Aksesuar', index: 72, region: 'İstanbul' },
            { vehicle: 'Honda Civic', topCategory: 'Ateşleme', index: 65, region: 'Bursa' },
            { vehicle: 'Audi A4', topCategory: 'Elektronik', index: 62, region: 'Ankara' },
            { vehicle: 'Ford Focus', topCategory: 'Aksesuar', index: 58, region: 'İzmir' },
            { vehicle: 'Renault Megane', topCategory: 'Sıvılar', index: 55, region: 'İstanbul' },
            { vehicle: 'Peugeot 308', topCategory: 'Elektronik', index: 48, region: 'Ankara' },
            { vehicle: 'Opel Astra', topCategory: 'Aksesuar', index: 42, region: 'Bursa' }
        ]
    };

    return Promise.resolve(mockData);
};

// --- NATIONAL BEHAVIOR ANALYTICS (ANONYMOUS AGGREGATION) ---
export interface NationalBehaviorSummary {
    topDistricts: Array<{ district: string; city: string; count: number }>;
    topBrands: Array<{ brand: string; count: number }>;
    topVehicles: Array<{ brand: string; model: string; count: number }>;
    topCategories: Array<{ category: string; count: number }>;
    totalEvents: number;
    period: string;
}

export const getNationalBehaviorSummary = async (params: { days?: number; city?: string }): Promise<NationalBehaviorSummary> => {
    const days = params.days || 30;
    const cityFilter = params.city || undefined;

    // Generate mock events for the period
    const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Gaziantep', 'Antalya'];
    const citiesDistricts: Record<string, string[]> = {
        'İstanbul': ['Şişli', 'Maslak', 'Ümraniye', 'Beylikdüzü', 'Kuruçeşme'],
        'Ankara': ['Çankaya', 'Keçiören', 'Cebeci', 'Mamak'],
        'İzmir': ['Bornova', 'Karşıyaka', 'Alsancak', 'Balçova'],
        'Bursa': ['Nilüfer', 'Osmangazi', 'Yıldırım'],
        'Gaziantep': ['Şahinbey', 'Şehitkamil'],
        'Antalya': ['Muratpaşa', 'Kepez']
    };

    const vehicleBrands = [
        { brand: 'BMW', models: ['3 Series', '5 Series', '1 Series'] },
        { brand: 'Mercedes', models: ['C Class', 'E Class', 'A Class'] },
        { brand: 'Volkswagen', models: ['Passat', 'Golf', 'Polo'] },
        { brand: 'Toyota', models: ['Corolla', 'Camry', 'Yaris'] },
        { brand: 'Honda', models: ['Civic', 'Accord', 'CR-V'] },
        { brand: 'Audi', models: ['A4', 'A6', 'A3'] },
        { brand: 'Ford', models: ['Focus', 'Fiesta', 'Mondeo'] },
        { brand: 'Renault', models: ['Megane', 'Clio', 'Scenic'] }
    ];

    const partBrands = ['Bosch', 'TRW', 'Brembo', 'Varta', 'Castrol', 'NGK', 'Sachs', 'Monroe', 'Magneti Marelli', 'Denso'];
    const categories = ['Fren Sistemi', 'Sıvılar', 'Elektronik', 'Aksesuar', 'Şanzıman', 'Motor Parçaları', 'Ateşleme', 'Farlar'];

    // Generate mock behavioral events
    const events: Array<{
        city: string;
        district: string;
        vehicleBrand: string;
        vehicleModel: string;
        partBrand: string;
        category: string;
        timestamp: Date;
    }> = [];

    const now = new Date();
    const eventCount = 250 + Math.floor(Math.random() * 250); // 250-500 events

    for (let i = 0; i < eventCount; i++) {
        const daysAgo = Math.floor(Math.random() * days);
        const city = cityFilter || cities[Math.floor(Math.random() * cities.length)];
        const district = citiesDistricts[city][Math.floor(Math.random() * citiesDistricts[city].length)];
        const vehicleInfo = vehicleBrands[Math.floor(Math.random() * vehicleBrands.length)];
        const partBrand = partBrands[Math.floor(Math.random() * partBrands.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];

        const eventDate = new Date(now);
        eventDate.setDate(eventDate.getDate() - daysAgo);
        eventDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

        events.push({
            city,
            district,
            vehicleBrand: vehicleInfo.brand,
            vehicleModel: vehicleInfo.models[Math.floor(Math.random() * vehicleInfo.models.length)],
            partBrand,
            category,
            timestamp: eventDate
        });
    }

    // Aggregate data
    const districtMap = new Map<string, number>();
    const brandMap = new Map<string, number>();
    const vehicleMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();

    events.forEach(event => {
        const districtKey = `${event.district}|${event.city}`;
        const vehicleKey = `${event.vehicleBrand}|${event.vehicleModel}`;

        districtMap.set(districtKey, (districtMap.get(districtKey) || 0) + 1);
        brandMap.set(event.partBrand, (brandMap.get(event.partBrand) || 0) + 1);
        vehicleMap.set(vehicleKey, (vehicleMap.get(vehicleKey) || 0) + 1);
        categoryMap.set(event.category, (categoryMap.get(event.category) || 0) + 1);
    });

    // Sort and get top 5
    const topDistricts = Array.from(districtMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, count]) => {
            const [district, city] = key.split('|');
            return { district, city, count };
        });

    const topBrands = Array.from(brandMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([brand, count]) => ({ brand, count }));

    const topVehicles = Array.from(vehicleMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, count]) => {
            const [brand, model] = key.split('|');
            return { brand, model, count };
        });

    const topCategories = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

    return Promise.resolve({
        topDistricts,
        topBrands,
        topVehicles,
        topCategories,
        totalEvents: events.length,
        period: `Son ${days} Gün`
    });
};

// ========== AFTERMARKET CIRCULATION ENGINE (D2-D5) ==========

import {
    AftermarketInventoryItem, AftermarketOperationsDashboard, CriticalCoverageItem,
    TopProduct, PurchaseRequest, UserRetailerRole
} from '../types';

// Mock Aftermarket Inventory
const MOCK_AFTERMARKET_INVENTORY: AftermarketInventoryItem[] = [
    {
        sku: 'SKU-001',
        name: 'Fren Balatası Ön',
        brand: 'Bosch',
        category: 'Frenler',
        onHand: 45,
        reserved: 5,
        last30SalesUnits: 120,
        cogs: 180,
        price: 450,
        segment: 'OEM',
        stockTurnover30: 2.67, // 120 / 45
        daysOfCover: 11.25, // 45 / 4
        dailyAvg: 4,
        leadTimeDays: 7,
        safetyStock: 28,
        reorderPoint: 28, // 4 * 7
        suggestedOrderQty: 11 // max(0, 28+28-45)
    },
    {
        sku: 'SKU-002',
        name: 'Hava Filtresi',
        brand: 'Mann Filter',
        category: 'Filtreler',
        onHand: 120,
        reserved: 10,
        last30SalesUnits: 300,
        cogs: 45,
        price: 120,
        segment: 'PREMIUM',
        stockTurnover30: 2.5, // 300 / 120
        daysOfCover: 12, // 120 / 10
        dailyAvg: 10,
        leadTimeDays: 7,
        safetyStock: 70,
        reorderPoint: 70, // 10 * 7
        suggestedOrderQty: 0 // max(0, 70+70-120)
    },
    {
        sku: 'SKU-003',
        name: 'Yağ Filtresi',
        brand: 'Fram',
        category: 'Filtreler',
        onHand: 8,
        reserved: 2,
        last30SalesUnits: 200,
        cogs: 25,
        price: 75,
        segment: 'EQUIVALENT',
        stockTurnover30: 25, // 200 / 8
        daysOfCover: 1.2, // 8 / 6.67 (200/30)
        dailyAvg: 6.67,
        leadTimeDays: 14,
        safetyStock: 46.69,
        reorderPoint: 93.38, // 6.67 * 14
        suggestedOrderQty: 131 // max(0, 93.38+46.69-8)
    },
    {
        sku: 'SKU-004',
        name: 'Kaporta Üst',
        brand: 'Aftermarket Auto',
        category: 'Karoseri',
        onHand: 15,
        reserved: 0,
        last30SalesUnits: 18,
        cogs: 600,
        price: 1500,
        segment: 'EQUIVALENT',
        stockTurnover30: 1.2, // 18 / 15
        daysOfCover: 25, // 15 / 0.6 (18/30)
        dailyAvg: 0.6,
        leadTimeDays: 21,
        safetyStock: 4.2,
        reorderPoint: 12.6, // 0.6 * 21
        suggestedOrderQty: 0 // max(0, 12.6+4.2-15)
    },
    {
        sku: 'SKU-005',
        name: 'Mumluk Seti',
        brand: 'NGK',
        category: 'İIgnisyon',
        onHand: 60,
        reserved: 8,
        last30SalesUnits: 240,
        cogs: 120,
        price: 350,
        segment: 'OEM',
        stockTurnover30: 4, // 240 / 60
        daysOfCover: 7.5, // 60 / 8
        dailyAvg: 8,
        leadTimeDays: 7,
        safetyStock: 56,
        reorderPoint: 56, // 8 * 7
        suggestedOrderQty: 52 // max(0, 56+56-60)
    },
    {
        sku: 'SKU-006',
        name: 'Soğutucu Sıvısı 1L',
        brand: 'Shell',
        category: 'Sıvılar',
        onHand: 200,
        reserved: 30,
        last30SalesUnits: 420,
        cogs: 35,
        price: 99,
        segment: 'ECONOMY',
        stockTurnover30: 2.1, // 420 / 200
        daysOfCover: 14.29, // 200 / 14
        dailyAvg: 14,
        leadTimeDays: 3,
        safetyStock: 98,
        reorderPoint: 42, // 14 * 3
        suggestedOrderQty: 0 // max(0, 42+98-200)
    },
    {
        sku: 'SKU-007',
        name: 'Yağ 5W30 5L',
        brand: 'Castrol',
        category: 'Sıvılar',
        onHand: 25,
        reserved: 5,
        last30SalesUnits: 180,
        cogs: 150,
        price: 400,
        segment: 'OEM',
        stockTurnover30: 7.2, // 180 / 25
        daysOfCover: 4.17, // 25 / 6 (180/30)
        dailyAvg: 6,
        leadTimeDays: 14,
        safetyStock: 42,
        reorderPoint: 84, // 6 * 14
        suggestedOrderQty: 101 // max(0, 84+42-25)
    },
    {
        sku: 'SKU-008',
        name: 'Klima Şarjı 500g',
        brand: 'Waeco',
        category: 'Klima',
        onHand: 35,
        reserved: 3,
        last30SalesUnits: 90,
        cogs: 80,
        price: 280,
        segment: 'PREMIUM',
        stockTurnover30: 2.57, // 90 / 35
        daysOfCover: 11.67, // 35 / 3
        dailyAvg: 3,
        leadTimeDays: 7,
        safetyStock: 21,
        reorderPoint: 21, // 3 * 7
        suggestedOrderQty: 0 // max(0, 21+21-35)
    }
];

export const getAftermarketInventory = (role: 'DISTRIBUTOR' | 'RETAIL'): Promise<AftermarketInventoryItem[]> => {
    // Distributors see full inventory; Retailers may have limited visibility
    let inventory = [...MOCK_AFTERMARKET_INVENTORY];
    
    if (role === 'RETAIL') {
        // Retailers see summary without ERP integration details
        inventory = inventory.map(item => ({
            ...item,
            reorderPoint: undefined,
            safetyStock: undefined
        }));
    }
    
    return new Promise(resolve => setTimeout(() => resolve(inventory), 300));
};

export const getAftermarketOpsSummary = (
    days: number = 30,
    city?: string,
    district?: string
): Promise<AftermarketOperationsDashboard> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const inventory = MOCK_AFTERMARKET_INVENTORY;
            
            // Top 10 fastest moving
            const topFastMoving10: TopProduct[] = inventory
                .sort((a, b) => b.stockTurnover30 - a.stockTurnover30)
                .slice(0, 10)
                .map(item => ({
                    sku: item.sku,
                    name: item.name,
                    brand: item.brand,
                    value: parseFloat(item.stockTurnover30.toFixed(2)),
                    label: `${item.stockTurnover30.toFixed(2)}x devir`
                }));
            
            // Critical coverage (daysOfCover < 7)
            const criticalCoverage: CriticalCoverageItem[] = inventory
                .filter(item => item.daysOfCover < 7)
                .sort((a, b) => a.daysOfCover - b.daysOfCover)
                .map(item => ({
                    sku: item.sku,
                    name: item.name,
                    brand: item.brand,
                    daysOfCover: parseFloat(item.daysOfCover.toFixed(2)),
                    onHand: item.onHand,
                    dailyAvg: parseFloat(item.dailyAvg.toFixed(2)),
                    reorderPoint: parseFloat(item.reorderPoint.toFixed(2)),
                    suggestedOrderQty: item.suggestedOrderQty
                }));
            
            // High margin opportunities
            const highMarginOpportunities: TopProduct[] = inventory
                .map(item => ({
                    ...item,
                    margin: (item.price - item.cogs)
                }))
                .sort((a, b) => (b.margin || 0) - (a.margin || 0))
                .slice(0, 10)
                .map(item => ({
                    sku: item.sku,
                    name: item.name,
                    brand: item.brand,
                    value: item.margin || 0,
                    label: `₺${item.margin?.toFixed(0) || '0'} margin`
                }));
            
            // Summary stats
            const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.onHand * item.cogs), 0);
            const avgTurnover = inventory.reduce((sum, item) => sum + item.stockTurnover30, 0) / inventory.length;
            const criticalCount = inventory.filter(item => item.daysOfCover < 7).length;
            
            resolve({
                topFastMoving10,
                criticalCoverage,
                highMarginOpportunities,
                summary: {
                    totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
                    avgTurnover: parseFloat(avgTurnover.toFixed(2)),
                    criticalCount,
                    totalSKUs: inventory.length
                }
            });
        }, 200);
    });
};

export const createPurchaseRequest = (
    skuId: string,
    qty: number,
    preferredSupplier: 'LENT' | 'ERP'
): Promise<PurchaseRequest> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const request: PurchaseRequest = {
                id: `PR-${Date.now()}`,
                sku: skuId,
                qty,
                preferredSupplier,
                createdAt: new Date().toISOString(),
                status: 'PENDING',
                eta: preferredSupplier === 'LENT' ? '2026-02-25' : '2026-03-03', // Mock ETA
                cost: Math.random() * 5000 + 1000
            };
            resolve(request);
        }, 150);
    });
};