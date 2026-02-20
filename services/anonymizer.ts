
/**
 * CORE ANONYMIZATION MODULE (SafeCore Vault)
 * 
 * Rules:
 * 1. VIN is never stored in main DB or Audit Logs in raw format.
 * 2. Multi-tenant isolation: Same VIN + Different Tenant = Different ID.
 * 3. Temporal isolation: Same VIN + Different Time Window = Different ID.
 * 4. Error Safety: No VIN leakage in stack traces or input dumps.
 */

const GLOBAL_SECRET = "AUTO_DATA_SAFE_CORE_SECRET_V1"; 

// Simulated Internal Vault Log Store
export let VAULT_AUDIT_LOGS: any[] = [];

/**
 * sanitizeTrace
 * Hata mesajları ve stack trace içindeki VIN benzeri hassas verileri temizler.
 */
const sanitizeTrace = (input: string, sensitiveValue?: string): string => {
    let sanitized = input;
    if (sensitiveValue && sensitiveValue.length > 5) {
        // Spesifik değeri temizle
        sanitized = sanitized.split(sensitiveValue).join("[REDACTED_VIN]");
    }
    // Genel 17 haneli VIN pattern temizliği (alphanumeric 17 karakter)
    const vinRegex = /[A-HJ-NPR-Z0-9]{17}/gi;
    return sanitized.replace(vinRegex, "[SENSITIVE_ID_MASKED]");
};

/**
 * generateVehicleId
 * @param vin Araç şase numarası
 * @param institutionId Sorguyu yapan kurumun kimliği (Tenant ID)
 * @param userId Sorguyu yapan kullanıcı
 */
export const generateVehicleId = async (
    vin: string, 
    institutionId: string = "default_inst", 
    userId: string = "system_user"
): Promise<string> => {
  // STRICT CONSTRAINT: Do not process partial signals.
  // Standard VIN must be 17 characters.
  if (!vin || vin.length !== 17) {
      throw new Error("Insufficient Signal: Input does not meet the 17-character VIN standard. Context cannot be established.");
  }

  const startTime = performance.now();
  const normalizedVin = vin.trim().toUpperCase();

  try {
    // 1. TEMPORAL ISOLATION
    const now = new Date();
    const timeWindow = `${now.getFullYear()}_H${now.getMonth() < 6 ? '1' : '2'}`;

    // 2. CONTEXT PREPARATION
    const contextPayload = normalizedVin + institutionId + GLOBAL_SECRET + timeWindow;
    const encoder = new TextEncoder();
    const data = encoder.encode(contextPayload);

    // 3. Hash (SHA-256) - Irreversible
    // Olası bir Crypto API hatası stack trace sızıntısına yol açabilir, bu yüzden try-catch içinde.
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 4. Format ID
    const resultId = `${hashHex.substring(0, 8)}-${hashHex.substring(8, 12)}-${hashHex.substring(12, 16)}`;

    // 5. ENHANCED SECURITY LOGGING (Blind Logging)
    const maskedVin = `${normalizedVin.substring(0, 3)}****${normalizedVin.slice(-2)}`;
    
    const auditEntry = {
        traceId: `TRX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        timestamp: new Date().toLocaleString('tr-TR'),
        accessor: userId,
        institutionId: institutionId,
        action: 'HASH_CREATE',
        maskedReference: maskedVin,
        timeContext: timeWindow,
        status: 'AUTHORIZED',
        executionTimeMs: Math.round(performance.now() - startTime)
    };

    VAULT_AUDIT_LOGS = [auditEntry, ...VAULT_AUDIT_LOGS].slice(0, 100);

    return resultId;

  } catch (error: any) {
    // ERROR DUMP PROTECTION
    // Hata nesnesini temizlemeden asla dışarıya (konsol veya log) sızdırma.
    const cleanMessage = sanitizeTrace(error.message || "Unknown Anonymizer Error", normalizedVin);
    const cleanStack = sanitizeTrace(error.stack || "", normalizedVin);
    
    console.error(`[SafeCore Protection] Anonymization failed. Reason: ${cleanMessage}`);
    
    // Güvenlik birimine temizlenmiş hata logu gönder
    VAULT_AUDIT_LOGS = [{
        traceId: 'ERR-' + Date.now(),
        action: 'HASH_FAILED',
        status: 'DENIED',
        timestamp: new Date().toLocaleString('tr-TR'),
        errorScrubbed: cleanMessage,
        stackScrubbed: cleanStack.substring(0, 100) + "..." // Sınırlı stack dump
    }, ...VAULT_AUDIT_LOGS].slice(0, 100);

    throw new Error("Araç kimliklendirme işlemi sırasında bir güvenlik istisnası oluştu. Lütfen teknik birimle iletişime geçiniz.");
  }
};
