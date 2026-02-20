export interface VehicleProfile {
  vehicle_id: string; 
  brand: string;
  model: string;
  year: number;
  engine: string;
  engine_code?: string; 
  transmission: string;
  last_query: string;
  total_queries: number;
  mileage: number; 
  plate_city_code?: number; 
  institutionId: string; // Multi-tenant field
  
  average_part_life_score: number; 
  failure_frequency_index: number; 
  risk_score: number; 
  resale_value_prediction: number; 
  damage_probability: number; 
  compatible_parts_count: number;
}

export interface SlaMetric {
    serviceName: string;
    status: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
    uptime: number;
    latencyMs: number;
    errorRate: number;
    lastChecked: string;
}

export interface TenantStats {
    id: string;
    name: string;
    totalQueries: number;
    activeUsers: number;
    totalCost: number;
    slaCompliance: number;
    planLimit: number;
}

export enum PriorityLevel {
    URGENT = 'URGENT',
    NORMAL = 'NORMAL',
    BACKGROUND = 'BACKGROUND'
}

export enum JobStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    THROTTLED = 'THROTTLED'
}

export interface BatchJob {
    id: string;
    name: string;
    status: JobStatus;
    priority: PriorityLevel;
    totalItems: number;
    processedItems: number;
    successCount: number;
    errorCount: number;
    createdAt: string;
    completedAt?: string;
    estimatedTimeRemaining?: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  MANAGER_PANEL = 'MANAGER_PANEL',
  LIBRARY = 'LIBRARY',
  USERS = 'USERS',
  REPAIR_SHOPS = 'REPAIR_SHOPS',
  RETAILERS = 'RETAILERS', 
  FLEET_RENTAL = 'FLEET_RENTAL',
  EXPERTISE = 'EXPERTISE',
  INSURANCE = 'INSURANCE',
  INDIVIDUAL = 'INDIVIDUAL',
  DEALERS = 'DEALERS',
  VIN_ENTRY = 'VIN_ENTRY',
  DETAILS = 'DETAILS',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  PART_LIFE_ANALYSIS = 'PART_LIFE_ANALYSIS',
  RISK_ANALYSIS = 'RISK_ANALYSIS',
  SPARE_PARTS = 'SPARE_PARTS',
  SUBSCRIPTION = 'SUBSCRIPTION',
  KVKK = 'KVKK',
  SYSTEM_HEALTH = 'SYSTEM_HEALTH'
}

export enum SystemPermission {
    READ_DASHBOARD = 'READ_DASHBOARD',
    READ_LIBRARY = 'READ_LIBRARY',
    READ_DETAILS = 'READ_DETAILS',
    MANAGE_USERS = 'MANAGE_USERS',
    MANAGE_SYSTEM = 'MANAGE_SYSTEM',
    EXECUTE_QUERIES = 'EXECUTE_QUERIES',
    ACCESS_FINANCE = 'ACCESS_FINANCE',
    ACCESS_ECOSYSTEM = 'ACCESS_ECOSYSTEM'
}

export interface AccessAuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userEmail: string;
    action: string;
    resource: string;
    status: 'GRANTED' | 'DENIED';
    ipAddress: string;
}

export interface SecurityEventLog {
  id: string;
  timestamp: string;
  userId: string;
  eventType: 'LIMIT_EXCEEDED' | 'ANOMALY_DETECTED' | 'SCREEN_CAPTURE' | 'UNAUTHORIZED_ACCESS' | 'CORRELATION_RISK' | 'SCRAPING_ATTEMPT';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
  isSealed: boolean; 
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER' | 'SERVICE_OWNER';
    department: string;
    institutionId: string; 
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    lastLogin: string;
    accessLevel: number; 
    permissions: SystemPermission[]; 
    
    dailyLimit: number;
    queriesToday: number;
    lastQueryTimestamp?: number;
    aiQuotaUsed: number;
}

export interface PrivacyContext {
    correlationScore: number; 
    maskingLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    isAggregateDataOnly: boolean;
}

export interface UsageLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  userId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  cost: number;
  tokensUsed?: number;
  details: string;
  latencyMs?: number;
  behavioralFlag?: 'NORMAL' | 'SUSPICIOUS' | 'RAPID' | 'PATTERN';
}

export interface SubscriptionDetails {
  planName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  renewalDate: string;
  price: number;
  currency: string;
  limits: {
    vinQueries: { used: number; total: number };
    apiCalls: { used: number; total: number };
    storage: { used: number; total: number; unit: string };
    aiTokens: { used: number; total: number };
  };
  paymentMethod: {
    last4: string;
    brand: string;
    expiry: string;
  };
}

export interface ApiKeyMetadata {
    id: string;
    key: string;
    label: string;
    status: 'ACTIVE' | 'REVOKED';
    createdAt: string;
    lastUsed: string;
}

export interface MatchingServiceAuditLog {
    id: string;
    timestamp: string;
    action: string;
    user: string;
    status: string;
}

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
    read: boolean;
    targetView?: ViewState;
    targetId?: string;
}

export interface OEMPart {
    id: string;
    name: string;
    oemCode: string;
    brand: string;
    category: string;
    price: number;
    stock: boolean;
    matchScore: number;
}

export interface DamageRecord {
    id: string;
    date: string;
    type: 'MAINTENANCE' | 'ACCIDENT' | 'REPAIR';
    source: 'SBM' | 'SERVICE';
    amount: number;
    description: string;
    serviceProvider: string;
    partsReplaced: string[];
}

export interface PartRiskAnalysis {
    id: string;
    partName: string;
    riskLevel: 'LOW' | 'HIGH' | 'CRITICAL';
    healthScore: number;
    demographicImpact: string;
    insuranceRef: string;
    regionName: string;
    partCost: number;
    laborCost: number;
    estimatedTime: number;
}

export interface ServicePoint {
    id: string;
    name: string;
    district: string;
    type: 'AUTHORIZED' | 'PRIVATE';
    nextAvailableSlot: string;
}

export interface Invoice {
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: 'PAID' | 'PENDING';
}

export interface RepairShopProfile {
    id: string;
    name: string;
    city: string;
    district: string;
    rating: number;
    occupancyRate: number;
    specialty: string[];
}

export interface WorkOrder {
    id: string;
    vehicleId: string;
    vehicleName: string;
    serviceName: string;
    progress: number;
    estimatedCost: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    operationType: string;
}

export interface RetailerProfile {
    id: string;
    name: string;
    city: string;
    type: string;
    inventoryCount: number;
}

export interface ExpertiseProfile {
    id: string;
    name: string;
    city: string;
    certificationLevel: string;
    fraudDetectionRate: number;
}

export interface InsurancePolicy {
    id: string;
    plate: string;
    policyType: 'CASCO' | 'TRAFFIC';
    endDate: string;
    riskScore: number;
    status: 'ACTIVE' | 'EXPIRED';
}

export interface DealerProfile {
    id: string;
    name: string;
    city: string;
    inventorySize: number;
    turnoverRate: number;
    customerSatisfaction: number;
    membershipLevel: 'GOLD' | 'SILVER' | 'BRONZE';
}

export interface FleetVehicle {
    vehicle_id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    status: 'ACTIVE' | 'MAINTENANCE' | 'IDLE';
    driverName: string;
    location: { city: string };
    contractEnd: string;
}

export interface AiPromptConfig {
    id: string;
    taskName: 'RISK_ANALYSIS' | 'PART_LIFE' | 'VALUATION';
    activeVersion: string;
    model: string;
    temperature: number;
    promptTemplate: string;
    updatedAt: string;
    isEncrypted: boolean;
    monthlyTokenLimit: number;
    costPerQuery: number;
}

// --- SERVICE OPS TYPES ---

export type ServiceWorkOrderStatus = 
    | 'INTAKE_PENDING' 
    | 'DIAGNOSIS' 
    | 'OFFER_DRAFT' 
    | 'WAITING_APPROVAL' 
    | 'APPROVED' 
    | 'IN_PROGRESS' 
    | 'READY_FOR_DELIVERY' 
    | 'DELIVERED';

export interface OperationalDetails {
    customerName: string;
    customerPhone: string;
    plate: string;
    consentStatus: 'GRANTED' | 'PENDING' | 'DENIED';
    internalNotes: string;
    vinHash?: string;
    vinLast4?: string;
}

export interface DiagnosisItem {
    id: string;
    item: string;
    type: 'PART' | 'LABOR';
    signalCost: number;
    recommendedPartRef?: string;
}

export interface ServiceWorkOrder {
    id: string;
    sourceEventId: string;
    operationalHash: string;
    status: ServiceWorkOrderStatus;
    intakeChecklist: { id: string; label: string; checked: boolean }[];
    diagnosisItems: DiagnosisItem[];
    operationalDetails?: OperationalDetails; // Loaded on demand from Vault
    customerName?: string; // Root level shadow for list views
    createdAt: string;
    updatedAt: string;
    erpState?: 'PENDING' | 'SYNCED' | 'ERROR' | 'OFFLINE';
    erpLastAttempt?: string;
    erpLastError?: string;
}

// --- AUTO ORDER TYPES ---

export type AvailabilitySignal = 'AVAILABLE' | 'LIMITED' | 'CRITICAL' | 'OUT_OF_STOCK';
export type OrderBatchSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export interface AutoOrderConfig {
    id: string;
    categoryName: string;
    isActive: boolean;
    triggerThreshold: AvailabilitySignal; // e.g. If signal becomes CRITICAL, trigger order
    orderBatchSize: OrderBatchSize; // e.g. MEDIUM batch
}

export interface AutoOrderSuggestion {
    id: string;
    partName: string;
    category: string;
    currentSignal: AvailabilitySignal;
    suggestedBatch: OrderBatchSize;
    generatedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ErpSyncLog {
    id: string;
    workOrderId: string;
    targetSystem: string;
    timestamp: string;
    payloadSummary: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    retryCount: number;
}

// --- SERVICE INTAKE POLICY TYPES ---

export type ServiceIntakeMode = 'FAST_OVERLAY' | 'CLASSIC' | 'AI_ASSISTED';
export type ErpSyncPolicy = 'ON_ACCEPT' | 'OUTBOX_OFFLINE_FIRST' | 'POST_APPROVAL';
export type AssistantPrivilege = 'CAN_ADD_TO_WORKORDER' | 'SUGGEST_ONLY' | 'NONE';

export interface ServiceIntakePolicy {
    enabledModes: ServiceIntakeMode[];
    defaultMode: ServiceIntakeMode;
    requiredFields: {
        vin: boolean;
        plate: boolean;
        km: boolean;
        damageNote: boolean;
        photos: boolean;
        customerConsent: boolean;
    };
    autoWorkOrderCreateAt: 'ON_ACCEPT' | 'ON_DIAGNOSIS' | 'NONE';
    erpSync: ErpSyncPolicy;
    assistantPrivilege: AssistantPrivilege;
    consultantFinalSay: boolean;
}

// --- B2B NETWORK TYPES ---

export type Supplier = { 
  id: string; 
  name: string; 
  city?: string; 
  score?: number;
  type?: 'WHOLESALER' | 'DISTRIBUTOR' | 'MANUFACTURER';
};

export type B2BPart = { 
  id: string; 
  name: string; 
  brand?: string; 
  sku?: string; 
  price?: number; 
  stock?: number;
  category?: string;
};

export type B2BEdge = { 
  supplierId: string; 
  partId: string; 
  leadDays?: number;
  active?: boolean;
};

export type B2BNetworkState = { 
  suppliers: Supplier[]; 
  parts: B2BPart[]; 
  edges: B2BEdge[] 
};

export const DEFAULT_SERVICE_INTAKE_POLICY: ServiceIntakePolicy = {
    enabledModes: ['FAST_OVERLAY', 'CLASSIC'],
    defaultMode: 'FAST_OVERLAY',
    requiredFields: {
        vin: true,
        plate: true,
        km: true,
        damageNote: false,
        photos: false,
        customerConsent: true
    },
    autoWorkOrderCreateAt: 'ON_ACCEPT',
    erpSync: 'OUTBOX_OFFLINE_FIRST',
    assistantPrivilege: 'SUGGEST_ONLY',
    consultantFinalSay: true
};