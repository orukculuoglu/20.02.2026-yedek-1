/**
 * Risk Recommendation Engine
 * Enterprise-grade recommendation engine for vehicle risk assessment
 * Implements priority-based rules for actionable recommendations
 */

import type {
  RiskRecommendation,
  ActionType,
  RecommendationInput,
} from "../types/RiskRecommendation";

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
 * Normalize reason codes to uppercase strings
 */
function normalizeReasonCodes(
  reasonCodes?: Array<{ code: string; severity?: string; message?: string }>,
  signals?: Array<{ code: string; severity?: string; confidence?: number }>
): string[] {
  const codes = new Set<string>();

  if (reasonCodes && Array.isArray(reasonCodes)) {
    reasonCodes.forEach((item) => {
      if (item.code) {
        codes.add(item.code.toUpperCase());
      }
    });
  }

  if (signals && Array.isArray(signals)) {
    signals.forEach((item) => {
      if (item.code) {
        codes.add(item.code.toUpperCase());
      }
    });
  }

  return Array.from(codes);
}

/**
 * Check if code exists in reason codes or signals (case-insensitive)
 */
function hasReasonCode(
  pattern: string | RegExp,
  reasonCodes?: string[]
): boolean {
  if (!reasonCodes || reasonCodes.length === 0) return false;

  if (typeof pattern === "string") {
    return reasonCodes.some(
      (code) => code.toUpperCase() === pattern.toUpperCase()
    );
  } else {
    // RegExp pattern
    return reasonCodes.some((code) => pattern.test(code));
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
 */
export function buildRiskRecommendation(
  input: RecommendationInput
): RiskRecommendation {
  const normalizedCodes = normalizeReasonCodes(input.reasonCodes, input.signals);
  const trustIndex = input.trustIndex ?? 50;
  const reliabilityIndex = input.reliabilityIndex ?? 50;
  const maintenanceDiscipline = input.maintenanceDiscipline ?? 50;

  let actionType: ActionType = "NONE";
  let priorityScore = 10;
  let recommendation = "Aksiyon gerekmiyor.";
  let reason = "Risk eşik altında";
  const explain: string[] = [];

  // RULE 1: Insurance/Damage Mismatch (Priority: CRITICAL)
  if (
    hasReasonCode(/INSURANCE.*DAMAGE.*INCONSISTENCY|INSURANCE.*DAMAGE.*MISMATCH|CLAIM.*WITHOUT.*DAMAGE.*RECORD/i, normalizedCodes) ||
    hasReasonCode("INSURANCE_DAMAGE_INCONSISTENCY", normalizedCodes) ||
    hasReasonCode("INSURANCE_DAMAGE_MISMATCH", normalizedCodes) ||
    hasReasonCode("CLAIM_WITHOUT_DAMAGE_RECORD", normalizedCodes)
  ) {
    actionType = "INSURANCE_REVIEW";
    priorityScore = trustIndex <= 40 ? 92 : 85;
    recommendation =
      "Sigorta/hasar kayıtlarında uyumsuzluk var. İnceleme önerilir.";
    reason = "Sigorta-hasar korelasyon uyuşmazlığı";
    explain.push("Mismatch reasonCodes detected");
    if (trustIndex <= 40) {
      explain.push(`Critical trust level: ${trustIndex.toFixed(1)}`);
    }
  }
  // RULE 2: KM Anomaly / Rollback (Priority: CRITICAL)
  else if (
    hasReasonCode(/KM.*ANOMALY|ODOMETER.*ANOMALY|KM.*ROLLBACK/i, normalizedCodes) ||
    hasReasonCode("KM_ANOMALY", normalizedCodes) ||
    hasReasonCode("ODOMETER_ANOMALY_DETECTED", normalizedCodes) ||
    hasReasonCode("KM_ROLLBACK_DETECTED", normalizedCodes)
  ) {
    actionType = "DATA_QUALITY_REVIEW";
    priorityScore = 90;
    recommendation =
      "KM verisinde anomali/rollback şüphesi var. Veri doğrulama önerilir.";
    reason = "Kilometre verisi tutarsız";
    explain.push("KM anomaly or rollback signal detected");
  }
  // RULE 3: Maintenance Discipline Low
  else if (maintenanceDiscipline < 70) {
    actionType = "MAINTENANCE_CHECK";
    priorityScore = clamp100(60 + (70 - maintenanceDiscipline));
    recommendation =
      "Bakım geçmişi düzensiz görünüyor. Detaylı servis kontrolü önerilir.";
    reason = "maintenanceDiscipline eşik altında";
    explain.push(`Maintenance score: ${maintenanceDiscipline.toFixed(1)}`);
  }
  // RULE 4: Reliability Low
  else if (reliabilityIndex < 70) {
    actionType = "DIAGNOSTIC_CHECK";
    priorityScore = clamp100(65 + (70 - reliabilityIndex));
    recommendation =
      "Güvenilirlik düşük. Diyagnostik kontrol önerilir.";
    reason = "reliabilityIndex eşik altında";
    explain.push(`Reliability score: ${reliabilityIndex.toFixed(1)}`);
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
    explain.push(`Evidence sources: ${input.evidenceSourcesCount}`);
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
    reasonCodes:
      normalizedCodes.length > 0 ? normalizedCodes : undefined,
    explain: explain.length > 0 ? explain : undefined,
    generatedAt: new Date().toISOString(),
    source: "DATA_ENGINE",
  };
}
