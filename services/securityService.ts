
import { SecurityEventLog, UserProfile, SystemPermission, AccessAuditLog, PrivacyContext, ApiKeyMetadata } from '../types';

/**
 * IMMUTABLE STORE SIMULATION (Event Contract Model)
 * Events are signals, not records.
 */
let MOCK_SECURITY_LOGS: SecurityEventLog[] = [
    { id: 'SEC-001', timestamp: '24.05.2024 09:12', userId: 'u1', eventType: 'LIMIT_EXCEEDED', severity: 'WARNING', description: 'Signal: Daily quota saturation approaching (96%).', isSealed: true },
    { id: 'SEC-002', timestamp: '24.05.2024 10:45', userId: 'api_avis', eventType: 'ANOMALY_DETECTED', severity: 'CRITICAL', description: 'Signal: Rhythm variance below organic threshold (Synthetic Pattern).', isSealed: true }
];

let ACCESS_AUDIT_LOGS: AccessAuditLog[] = [
    { id: 'AUD-001', timestamp: 'Bugün 14:20', userId: 'u1', userEmail: 'mustafa@sirket.com', action: 'VIEW_ACCESS', resource: 'DASHBOARD', status: 'GRANTED', ipAddress: '192.168.1.42' },
];

let API_KEYS: ApiKeyMetadata[] = [
    { id: 'KEY-1', key: 'sk_live_8291...4421', label: 'Ana ERP Entegrasyonu', status: 'ACTIVE', createdAt: '12.01.2024', lastUsed: '3 dk önce' },
    { id: 'KEY-2', key: 'sk_test_1102...9921', label: 'Test Ortamı', status: 'ACTIVE', createdAt: '15.05.2024', lastUsed: 'Dün' }
];

let CURRENT_USER: UserProfile = {
    id: 'u1',
    name: 'Mustafa Cam',
    email: 'mustafa@sirket.com',
    role: 'SERVICE_OWNER',
    department: 'IT',
    institutionId: 'LENT-CORP-SECURE',
    status: 'ACTIVE',
    lastLogin: 'Şimdi',
    accessLevel: 5,
    permissions: [
        SystemPermission.READ_DASHBOARD,
        SystemPermission.READ_LIBRARY,
        SystemPermission.READ_DETAILS,
        SystemPermission.MANAGE_USERS,
        SystemPermission.MANAGE_SYSTEM,
        SystemPermission.EXECUTE_QUERIES,
        SystemPermission.ACCESS_FINANCE,
        SystemPermission.ACCESS_ECOSYSTEM
    ],
    dailyLimit: 50,
    queriesToday: 12,
    lastQueryTimestamp: Date.now(),
    aiQuotaUsed: 0
};

// Behavioral tracking states
let RECENT_QUERY_INTERVALS: number[] = [];
let LAST_QUERY_CONTEXT: string = "";

/**
 * calculatePrivacyContext
 * Determines differential privacy noise level based on query clustering.
 */
export const calculatePrivacyContext = (brand: string, model: string): PrivacyContext => {
    const contextKey = `${brand}_${model}`;
    let score = 0;
    
    // Mosaic Effect Prevention: Track repeated access to same segment
    if (contextKey === LAST_QUERY_CONTEXT) score += 40;
    
    let level: PrivacyContext['maskingLevel'] = 'NONE';
    if (score > 30) level = 'LOW';
    if (score > 70) level = 'MEDIUM';

    return {
        correlationScore: score,
        maskingLevel: level,
        isAggregateDataOnly: score > 60
    };
};

/**
 * recordQueryActivity (Behavioral Signal Engine)
 * Analyzes "HOW" the user queries, not just "WHAT".
 * Treats interactions as signals, not evidence.
 */
export const recordQueryActivity = async (brand?: string, model?: string) => {
    const now = Date.now();
    const currentContext = `${brand}_${model}`;
    
    // 1. BEHAVIORAL SIGNAL ANALYSIS: Rhythm Variance
    if (CURRENT_USER.lastQueryTimestamp) {
        const interval = now - CURRENT_USER.lastQueryTimestamp;
        RECENT_QUERY_INTERVALS.push(interval);
        if (RECENT_QUERY_INTERVALS.length > 5) RECENT_QUERY_INTERVALS.shift();

        // Calculate Variance (Standard Deviation of intervals)
        // High Variance = Organic/Human Signal. Low Variance = Synthetic/Mechanical Signal.
        if (RECENT_QUERY_INTERVALS.length === 5) {
            const mean = RECENT_QUERY_INTERVALS.reduce((a, b) => a + b) / 5;
            const variance = RECENT_QUERY_INTERVALS.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 5;
            
            // If variance is extremely low (< 5000), it implies mechanical rhythm
            // We flag this as a "Synthetic Signal", not a "Bot" (avoiding definitive labelling)
            if (variance < 5000 && mean < 2000) {
                await logSecurityEvent('ANOMALY_DETECTED', 'CRITICAL', 'Signal: Synthetic Rhythm Pattern Detected (Low Entropy).');
                throw new Error("SİNYAL ANALİZİ: Sorgu ritminiz mekanik bir desen (Sentetik) göstermektedir. Sistem sağlığı için işlem duraklatıldı.");
            }
        }

        if (interval < 800) {
            await logSecurityEvent('SCRAPING_ATTEMPT', 'WARNING', 'Signal: High-Velocity Request Stream.');
            throw new Error("SİSTEM KORUMASI: İşlem hızı güvenli sinyal aralığının üzerindedir. Lütfen yavaşlayınız.");
        }
    }

    // 2. CONTEXTUAL PATTERN ANALYSIS (Mosaic Defense)
    if (currentContext === LAST_QUERY_CONTEXT && LAST_QUERY_CONTEXT !== "") {
        // Sequential access to same context increases re-identification risk
        await logSecurityEvent('CORRELATION_RISK', 'INFO', `Signal: Context Cluster Density Increase (${currentContext}).`);
    }

    // 3. TENANT LIMIT ENFORCEMENT
    if (CURRENT_USER.queriesToday >= CURRENT_USER.dailyLimit) {
        await logSecurityEvent('LIMIT_EXCEEDED', 'CRITICAL', 'Signal: Tenant Quota Exhausted.');
        throw new Error("LİMİT SİNYALİ: Kurumsal sorgu kotanız dolmuştur.");
    }

    // Update state
    CURRENT_USER.queriesToday += 1;
    CURRENT_USER.lastQueryTimestamp = now;
    LAST_QUERY_CONTEXT = currentContext;
};

export const logSecurityEvent = async (type: SecurityEventLog['eventType'], severity: SecurityEventLog['severity'], description: string) => {
    const newLog: SecurityEventLog = {
        id: `SEC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        timestamp: new Date().toLocaleString('tr-TR'),
        userId: CURRENT_USER.id,
        eventType: type,
        severity: severity,
        description: description,
        isSealed: true // Event Contract: Once written, cannot be altered.
    };
    MOCK_SECURITY_LOGS = [newLog, ...MOCK_SECURITY_LOGS]; 
    return newLog;
};

export const canAccess = (permission: SystemPermission, resourceName: string): boolean => {
    const hasPerm = CURRENT_USER.permissions.includes(permission);
    const auditEntry: AccessAuditLog = {
        id: `AUD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        timestamp: new Date().toLocaleTimeString('tr-TR'),
        userId: CURRENT_USER.id,
        userEmail: CURRENT_USER.email,
        action: `AUTH_CHECK:${permission}`,
        resource: resourceName,
        status: hasPerm ? 'GRANTED' : 'DENIED',
        ipAddress: 'SafeCore-Node-TR'
    };
    ACCESS_AUDIT_LOGS = [auditEntry, ...ACCESS_AUDIT_LOGS].slice(0, 100);
    if (!hasPerm) logSecurityEvent('UNAUTHORIZED_ACCESS', 'WARNING', `Signal: Unauthorized Access Attempt on ${resourceName}`);
    return hasPerm;
};

// API Key Management (Tenant Isolated)
export const getApiKeys = async () => [...API_KEYS];
export const createApiKey = async (label: string) => {
    const newKey: ApiKeyMetadata = {
        id: `KEY-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        key: `sk_live_${Math.random().toString(36).substring(2, 12)}...${Math.random().toString(36).substring(2, 6)}`,
        label: label,
        status: 'ACTIVE',
        createdAt: new Date().toLocaleDateString('tr-TR'),
        lastUsed: 'Hiç kullanılmadı'
    };
    API_KEYS = [newKey, ...API_KEYS];
    return newKey;
};
export const revokeApiKey = async (id: string) => {
    API_KEYS = API_KEYS.map(k => k.id === id ? { ...k, status: 'REVOKED' } : k);
};

export const checkQueryLimit = (): { allowed: boolean; remaining: number } => {
    const allowed = CURRENT_USER.queriesToday < CURRENT_USER.dailyLimit;
    return { allowed, remaining: CURRENT_USER.dailyLimit - CURRENT_USER.queriesToday };
};

export const getSecurityLogs = async () => [...MOCK_SECURITY_LOGS];
export const getAccessAuditLogs = async () => [...ACCESS_AUDIT_LOGS];
export const getCurrentUserSecurity = () => ({ ...CURRENT_USER });
