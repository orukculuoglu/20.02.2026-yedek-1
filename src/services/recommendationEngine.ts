/**
 * Risk Recommendation Engine
 * Enterprise-grade recommendation engine for vehicle risk assessment
 * Implements priority-based rules for actionable recommendations
 * Supports normalized, structured reason codes
 */

import type {
  RiskRecommendation,
  ActionType,
  RecommendationInput,
  StructuredReasonCode,
} from "../types/RiskRecommendation";
import {
  normalizeAndDeduplicateReasonCodes,
  countBySeverity,
  getHighestSeverity,
} from "../modules/data-engine/normalizers/reasonCodeNormalizer";

/**
 * Clamp value to 0-100 range
 */
function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Generate unique recommendation ID
 */
function generateRecommendationId(vehicleId: string): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for environments without crypto
    return `${vehicleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Normalize reason codes using the dedicated normalizer
 * Handles both objects and strings, applies deduplication and severity merging
 */
function normalizeReasonCodes(
  reasonCodes?: Array<{ code: string; severity?: string; message?: string; meta?: any }>,
  signals?: Array<{ code: string; severity?: string; confidence?: number; meta?: any }>
): StructuredReasonCode[] {
  // Combine reason codes and signals into a single array for processing
  const combined = [
    ...(reasonCodes || []).map((item) => ({
      code: item.code,
      severity: item.severity as any,
      message: item.message,
      meta: item.meta,
    })),
    ...(signals || []).map((item) => ({
      code: item.code,
      severity: item.severity as any,
      message: undefined,
      meta: { confidence: item.confidence, ...(item.meta || {}) },
    })),
  ];

  // Use the dedicated normalizer to deduplicate and merge severity
  return normalizeAndDeduplicateReasonCodes(combined);
}

/**
 * Check if code exists in reason codes (case-insensitive)
 * Works with both string arrays and StructuredReasonCode arrays
 */
function hasReasonCode(
  pattern: string | RegExp,
  reasonCodes?: string[] | StructuredReasonCode[]
): boolean {
  if (!reasonCodes || reasonCodes.length === 0) return false;

  // Extract code strings from structured objects if needed
  const codes = reasonCodes.map((item) =>
    typeof item === "string" ? item : item.code
  );

  if (typeof pattern === "string") {
    return codes.some(
      (code) => code.toUpperCase() === pattern.toUpperCase()
    );
  } else {
    // RegExp pattern
    return codes.some((code) => pattern.test(code));
  }
}

/**
 * Build structured risk recommendation
 * Implements priority-ordered rules:
 * 1. Insurance/Damage mismatch (highest priority)
 * 2. KM anomaly/rollback
 * 3. Maintenance discipline low
 * 4. Reliability low
 * 5. Data quality low
 * 6. Default (no action needed)
 *
 * Returns a single recommendation with normalized, deduplicated reason codes
 * and optional evidence of why this recommendation was generated
 */
export function buildRiskRecommendation(
  input: RecommendationInput
): RiskRecommendation {
  const normalizedCodes = normalizeReasonCodes(input.reasonCodes, input.signals);
  const trustIndex = input.trustIndex ?? 50;
  const reliabilityIndex = input.reliabilityIndex ?? 50;
  const maintenanceDiscipline = input.maintenanceDiscipline ?? 50;
  const insuranceRisk = input.insuranceRisk ?? 50;

  let actionType: ActionType = "NONE";
  let priorityScore = 10;
  let recommendation = "Aksiyon gerekmiyor.";
  let reason = "Risk eşik altında";
  const explain: string[] = [];

  // Calculate priority score bonus for high-severity reason codes
  const codesSeverityCount = countBySeverity(normalizedCodes);
  const highSeverityBonus = codesSeverityCount.high * 5; // +5 for each high-severity code

  // RULE 1: Insurance/Damage Mismatch (Priority: CRITICAL)
  if (
    hasReasonCode(
      /INSURANCE.*DAMAGE.*INCONSISTENCY|INSURANCE.*DAMAGE.*MISMATCH|CLAIM.*WITHOUT.*DAMAGE.*RECORD/i,
      normalizedCodes
    ) ||
    hasReasonCode("INSURANCE_DAMAGE_INCONSISTENCY", normalizedCodes) ||
    hasReasonCode("INSURANCE_DAMAGE_MISMATCH", normalizedCodes) ||
    hasReasonCode("CLAIM_WITHOUT_DAMAGE_RECORD", normalizedCodes)
  ) {
    actionType = "INSURANCE_REVIEW";
    priorityScore = trustIndex <= 40 ? 92 : 85;
    if (codesSeverityCount.high > 1) priorityScore = 95; // Extra critical if multiple high-severity codes
    recommendation =
      "Sigorta/hasar kayıtlarında uyumsuzluk var. İnceleme önerilir.";
    reason = "Sigorta-hasar korelasyon uyuşmazlığı";
    explain.push("Sigorta ve hasar kayıtları arasında tutarsızlık tespit edildi");
    if (trustIndex <= 40) {
      explain.push(`Güven endeksi kritik düzeyde: ${trustIndex.toFixed(1)}`);
    }
  }
  // RULE 2: KM Anomaly / Rollback (Priority: CRITICAL)
  else if (
    hasReasonCode(/KM.*ANOMALY|ODOMETER.*ANOMALY|KM.*ROLLBACK/i, normalizedCodes) ||
    hasReasonCode("KM_ANOMALY_DETECTED", normalizedCodes) ||
    hasReasonCode("ODOMETER_ANOMALY_DETECTED", normalizedCodes) ||
    hasReasonCode("KM_ROLLBACK_DETECTED", normalizedCodes)
  ) {
    actionType = "DATA_QUALITY_REVIEW";
    priorityScore = 90 + highSeverityBonus;
    recommendation =
      "KM verisinde anomali/rollback şüphesi var. Veri doğrulama önerilir.";
    reason = "Kilometre verisi tutarsız";
    explain.push("Kilometre verisi anomali veya geri alma sinyali tespit edildi");
  }
  // RULE 3: Maintenance Discipline Low
  else if (maintenanceDiscipline < 70) {
    actionType = "MAINTENANCE_CHECK";
    priorityScore = clamp100(60 + (70 - maintenanceDiscipline) + highSeverityBonus);
    recommendation =
      "Bakım geçmişi düzensiz görünüyor. Detaylı servis kontrolü önerilir.";
    reason = "Bakım disiplini eşik altında";
    explain.push(`Bakım skoru: ${maintenanceDiscipline.toFixed(1)}`);
    if (normalizedCodes.length > 0) {
      explain.push(`Tespit edilen sorunlar: ${normalizedCodes.map((c) => c.code).join(", ")}`);
    }
  }
  // RULE 4: Reliability Low
  else if (reliabilityIndex < 70) {
    actionType = "DIAGNOSTIC_CHECK";
    priorityScore = clamp100(65 + (70 - reliabilityIndex) + highSeverityBonus);
    recommendation =
      "Güvenilirlik düşük. Diyagnostik kontrol önerilir.";
    reason = "Güvenilirlik endeksi eşik altında";
    explain.push(`Güvenilirlik skoru: ${reliabilityIndex.toFixed(1)}`);
  }
  // RULE 5: Low Evidence / Data Quality
  else if (
    input.evidenceSourcesCount !== undefined &&
    input.evidenceSourcesCount <= 1
  ) {
    actionType = "DATA_QUALITY_REVIEW";
    priorityScore = 60;
    recommendation =
      "Veri kaynağı yetersiz. Ek veri doğrulaması önerilir.";
    reason = "Yetersiz veri kapsamı";
    explain.push(`Veri kaynağı sayısı: ${input.evidenceSourcesCount}`);
  }

  // Keep only top 3 explanations
  explain.splice(3);

  return {
    id: generateRecommendationId(input.vehicleId),
    vehicleId: input.vehicleId,
    actionType,
    priorityScore: clamp100(priorityScore),
    recommendation,
    reason,
    reasonCodes: normalizedCodes.length > 0 ? normalizedCodes : undefined,
    explain: explain.length > 0 ? explain : undefined,
    evidence:
      input.indices || input.signals_agg
        ? {
            indexes: input.indices,
            signals: input.signals_agg || input.signals,
          }
        : undefined,
    generatedAt: new Date().toISOString(),
    source: "DATA_ENGINE",
  };
}
/**
 * Generate recommendation from risk event data (with indices)
 * Extracts indices and reason codes from event, then builds recommendation
 * Used by UI components (e.g., WorkOrder) that have access to risk index data
 */
export function generateRiskRecommendation(input: {
  vehicleId: string;
  event?: any; // RiskIndexEvent or similar with indices array
}): RiskRecommendation | null {
  if (!input.vehicleId || !input.event) {
    if (import.meta.env.DEV) {
      console.debug('[generateRiskRecommendation] Missing vehicleId or event');
    }
    return null;
  }

  // Extract indices from event
  const indices = input.event.indices || [];
  
  if (!Array.isArray(indices) || indices.length === 0) {
    if (import.meta.env.DEV) {
      console.debug('[generateRiskRecommendation] No valid indices in event', {
        hasIndices: !!input.event.indices,
        isArray: Array.isArray(indices),
        length: indices.length
      });
    }
    return null;
  }

  const indexMap: Record<string, number> = {};
  const reasonCodes: any[] = [];

  // Process indices
  indices.forEach((idx: any) => {
    if (idx.key && typeof idx.value === 'number') {
      indexMap[idx.key] = idx.value;
    }
    // Collect reason codes from meta
    if (idx.meta?.reasonCodes && Array.isArray(idx.meta.reasonCodes)) {
      reasonCodes.push(...idx.meta.reasonCodes);
    }
  });

  // Require at least one index to generate recommendation
  if (Object.keys(indexMap).length === 0) {
    if (import.meta.env.DEV) {
      console.debug('[generateRiskRecommendation] No valid index keys extracted from indices');
    }
    return null;
  }

  // Build recommendation input from extracted data
  const recommendationInput: RecommendationInput = {
    vehicleId: input.vehicleId,
    trustIndex: indexMap.trustIndex,
    reliabilityIndex: indexMap.reliabilityIndex,
    maintenanceDiscipline: indexMap.maintenanceDiscipline,
    insuranceRisk: indexMap.insuranceRisk,
    reasonCodes: reasonCodes.length > 0 ? reasonCodes : undefined,
    evidenceSourcesCount: indices.length,
    indices: indexMap,
  };

  if (import.meta.env.DEV) {
    console.debug('[generateRiskRecommendation] Building with input:', {
      vehicleId: input.vehicleId,
      indicesCount: indices.length,
      indexKeys: Object.keys(indexMap),
      reasonCodesCount: reasonCodes.length
    });
  }

  return buildRiskRecommendation(recommendationInput);
}