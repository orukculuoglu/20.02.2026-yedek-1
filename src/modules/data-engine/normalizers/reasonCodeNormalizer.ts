/**
 * Reason Code Normalizer
 * Normalizes, deduplicates, and merges severity levels for reason codes
 * Canonical mapping of insurance/damage and other concept duplicates
 */

export type CodeSeverity = 'high' | 'warn' | 'info';

export interface NormalizedReasonCode {
  code: string;           // Canonical code
  severity: CodeSeverity; // high | warn | info
  message?: string;       // Optional message
  sourceCount?: number;   // How many original codes mapped here
  meta?: Record<string, any>; // Rich metadata
}

/**
 * Canonical code mappings for concept duplicates
 * Maps similar codes to a single canonical representation
 */
const CANONICAL_MAPPINGS: Record<string, string> = {
  // Insurance/Damage related
  INSURANCE_DAMAGE_MISMATCH: 'INSURANCE_DAMAGE_INCONSISTENCY',
  INSURANCE_CLAIM_MISMATCH: 'INSURANCE_DAMAGE_INCONSISTENCY',
  INSURANCE_DAMAGE_INCONSISTENCY: 'INSURANCE_DAMAGE_INCONSISTENCY',
  CLAIM_WITHOUT_DAMAGE_RECORD: 'INSURANCE_DAMAGE_INCONSISTENCY',
  DAMAGE_WITHOUT_CLAIM_RECORD: 'INSURANCE_DAMAGE_INCONSISTENCY',

  // KM/Odometer related
  KM_ANOMALY: 'KM_ANOMALY_DETECTED',
  ODOMETER_ANOMALY: 'KM_ANOMALY_DETECTED',
  ODOMETER_ANOMALY_DETECTED: 'KM_ANOMALY_DETECTED',
  KM_ROLLBACK: 'KM_ROLLBACK_DETECTED',
  KM_ROLLBACK_DETECTED: 'KM_ROLLBACK_DETECTED',

  // Maintenance related
  LOW_MAINTENANCE_DISCIPLINE: 'MAINTENANCE_DISCIPLINE_LOW',
  MAINTENANCE_DISCIPLINE_LOW: 'MAINTENANCE_DISCIPLINE_LOW',
  IRREGULAR_MAINTENANCE: 'MAINTENANCE_DISCIPLINE_LOW',

  // Data quality related
  INSUFFICIENT_DATA_SOURCES: 'DATA_QUALITY_LOW',
  DATA_QUALITY_LOW: 'DATA_QUALITY_LOW',
  WEAK_EVIDENCE_BASE: 'DATA_QUALITY_LOW',

  // Reliability related
  LOW_RELIABILITY_INDEX: 'RELIABILITY_INDEX_LOW',
  RELIABILITY_INDEX_LOW: 'RELIABILITY_INDEX_LOW',
  POOR_RELIABILITY_SIGNAL: 'RELIABILITY_INDEX_LOW',
};

/**
 * Default severity for codes (if not specified)
 */
const DEFAULT_SEVERITY_MAP: Record<string, CodeSeverity> = {
  INSURANCE_DAMAGE_INCONSISTENCY: 'high',
  KM_ANOMALY_DETECTED: 'high',
  KM_ROLLBACK_DETECTED: 'high',
  MAINTENANCE_DISCIPLINE_LOW: 'warn',
  RELIABILITY_INDEX_LOW: 'warn',
  DATA_QUALITY_LOW: 'info',
};

/**
 * Get canonical code for a given code
 * If no mapping exists, returns uppercase version
 */
export function getCanonicalCode(code: string): string {
  const upperCode = code.toUpperCase();
  return CANONICAL_MAPPINGS[upperCode] || upperCode;
}

/**
 * Normalize a single reason code with metadata
 */
export function normalizeReasonCode(
  code: string,
  severity?: CodeSeverity,
  message?: string,
  meta?: Record<string, any>
): NormalizedReasonCode {
  const canonical = getCanonicalCode(code);
  const resolvedSeverity = severity || DEFAULT_SEVERITY_MAP[canonical] || 'info';

  return {
    code: canonical,
    severity: resolvedSeverity,
    message,
    sourceCount: 1,
    meta,
  };
}

/**
 * Compare two severity levels
 * Returns the more critical one: high > warn > info
 */
function mergeSeverities(s1: CodeSeverity, s2: CodeSeverity): CodeSeverity {
  const severityRank: Record<CodeSeverity, number> = { high: 3, warn: 2, info: 1 };
  return severityRank[s1] >= severityRank[s2] ? s1 : s2;
}

/**
 * Merge metadata objects, keeping richer metadata
 */
function mergeMetadata(m1?: Record<string, any>, m2?: Record<string, any>): Record<string, any> | undefined {
  if (!m1) return m2;
  if (!m2) return m1;
  // Merge: m2 overrides m1 for same keys, but keep all keys
  return { ...m1, ...m2 };
}

/**
 * Normalize and deduplicate reason codes
 * Input: array of codes with optional metadata
 * Output: array of deduplicated normalized codes with merged severity
 */
export function normalizeAndDeduplicateReasonCodes(
  codes?: Array<{
    code: string;
    severity?: CodeSeverity;
    message?: string;
    meta?: Record<string, any>;
  }>
): NormalizedReasonCode[] {
  if (!codes || codes.length === 0) {
    return [];
  }

  // Step 1: Normalize all codes and create a map by canonical code
  const codeMap = new Map<string, NormalizedReasonCode>();

  codes.forEach((item) => {
    const canonical = getCanonicalCode(item.code);
    const severity = item.severity || DEFAULT_SEVERITY_MAP[canonical] || 'info';

    if (codeMap.has(canonical)) {
      // Already have this code, merge severity and metadata
      const existing = codeMap.get(canonical)!;
      existing.severity = mergeSeverities(existing.severity, severity);
      existing.meta = mergeMetadata(existing.meta, item.meta);
      existing.sourceCount = (existing.sourceCount || 1) + 1;
    } else {
      // New canonical code
      codeMap.set(canonical, {
        code: canonical,
        severity,
        message: item.message,
        sourceCount: 1,
        meta: item.meta,
      });
    }
  });

  // Step 2: Convert map to array and sort by severity (high first)
  const severityRank: Record<CodeSeverity, number> = { high: 3, warn: 2, info: 1 };
  return Array.from(codeMap.values()).sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
}

/**
 * Normalize reason codes for display
 * Takes string array of raw codes and normalizes to structured format
 */
export function normalizeStringReasonCodes(codes?: string[]): NormalizedReasonCode[] {
  if (!codes || codes.length === 0) {
    return [];
  }

  const normalized = codes.map((code) => normalizeReasonCode(code));
  return normalizeAndDeduplicateReasonCodes(normalized);
}

/**
 * Count codes by severity
 */
export function countBySeverity(
  codes: NormalizedReasonCode[]
): { high: number; warn: number; info: number } {
  return codes.reduce(
    (acc, code) => {
      acc[code.severity]++;
      return acc;
    },
    { high: 0, warn: 0, info: 0 }
  );
}

/**
 * Get highest severity in a code list
 */
export function getHighestSeverity(codes: NormalizedReasonCode[]): CodeSeverity | null {
  if (codes.length === 0) return null;
  return codes[0]?.severity || null;
}
