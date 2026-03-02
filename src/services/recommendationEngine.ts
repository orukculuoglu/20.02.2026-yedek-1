/**
 * Risk Recommendation Engine
 * Enterprise-grade recommendation engine for vehicle risk assessment
 * Implements priority-based rule evaluation for actionable recommendations
 * Supports normalized, structured reason codes and rule-driven policies
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
import {
  RECOMMENDATION_RULES,
  type RecommendationContext,
} from "./recommendationRules";

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
 * Evaluate recommendation rules against context
 * Returns list of matched recommendations sorted by priority, deduplicated by actionType, max 3
 */
function evaluateRulesAndGenerateRecommendations(
  ctx: RecommendationContext,
  normalizedCodes: StructuredReasonCode[]
): RiskRecommendation[] {
  // Evaluate all rules and build candidates
  const candidates: RiskRecommendation[] = [];

  for (const rule of RECOMMENDATION_RULES) {
    try {
      // Check if this rule matches the context
      if (rule.when(ctx)) {
        // Calculate priority for this rule
        const priorityScore = rule.priority(ctx);

        // Build recommendation from rule
        const rec: RiskRecommendation = {
          id: generateRecommendationId(ctx.vehicleId),
          vehicleId: ctx.vehicleId,
          actionType: rule.actionType,
          priorityScore: clamp100(priorityScore),
          reason: rule.reason(ctx),
          recommendation: rule.recommendation(ctx),
          reasonCodes: normalizedCodes.length > 0 ? normalizedCodes : undefined,
          generatedAt: new Date().toISOString(),
          source: "DATA_ENGINE",
          // Always populate generatedFrom with source/time/id, using fallbacks if needed
          generatedFrom: {
            source: ctx.source ?? "Bilinmiyor",
            eventTime: ctx.eventTime,
            eventId: ctx.eventId,
          },
        };

        // Add rule evidence keys if available
        if (rule.evidenceKeys && rule.evidenceKeys.length > 0) {
          rec.evidence = {
            indexes: rule.evidenceKeys.reduce((acc, key) => {
              if (ctx.indexMap && key in ctx.indexMap) {
                acc[key] = ctx.indexMap[key];
              }
              return acc;
            }, {} as Record<string, number>),
          };
        }

        candidates.push(rec);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.debug(`[evaluateRules] Error evaluating rule ${rule.id}:`, err);
      }
    }
  }

  // Deduplicate by actionType (keep highest priority for each action type)
  const deduplicatedMap = new Map<string, RiskRecommendation>();
  for (const candidate of candidates) {
    const key = candidate.actionType;
    if (!deduplicatedMap.has(key) || candidate.priorityScore > (deduplicatedMap.get(key)?.priorityScore ?? 0)) {
      deduplicatedMap.set(key, candidate);
    }
  }

  // Sort by priority descending and return top 3
  const results = Array.from(deduplicatedMap.values())
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);

  return results;
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
 * Generate recommendations from risk event data (with indices)
 * Uses rule-based policy engine to evaluate all matching rules
 * Extracts indices and reason codes from event, then evaluates rules
 * Returns array of top 3 recommendations sorted by priority
 * Used by UI components (e.g., WorkOrder) that have access to risk index data
 *
 * RULES-BASED OUTPUT:
 * - If no rules match => return empty array [], UI shows "yeterli risk verisi yok"
 * - Otherwise => return 1-3 recommendations sorted by priority (highest first)
 */
export function generateRiskRecommendation(input: {
  vehicleId: string;
  event?: any; // RiskIndexEvent or similar with indices array
}): RiskRecommendation[] {
  if (!input.vehicleId || !input.event) {
    if (import.meta.env.DEV) {
      console.debug('[generateRiskRecommendation] Missing vehicleId or event');
    }
    return [];
  }

  // Extract indices from event
  const indices = input.event.indices || [];

  if (!Array.isArray(indices) || indices.length === 0) {
    if (import.meta.env.DEV) {
      console.debug('[generateRiskRecommendation] No valid indices in event', {
        hasIndices: !!input.event.indices,
        isArray: Array.isArray(indices),
        length: indices.length,
      });
    }
    return [];
  }

  const indexMap: Record<string, number> = {};
  const reasonCodesRaw: any[] = [];

  // Process indices
  indices.forEach((idx: any) => {
    if (idx.key && typeof idx.value === 'number') {
      indexMap[idx.key] = idx.value;
    }
    // Collect reason codes from meta
    if (idx.meta?.reasonCodes && Array.isArray(idx.meta.reasonCodes)) {
      reasonCodesRaw.push(...idx.meta.reasonCodes);
    }
  });

  // Require at least one index to generate recommendation
  if (Object.keys(indexMap).length === 0) {
    if (import.meta.env.DEV) {
      console.debug('[generateRiskRecommendation] No valid index keys extracted from indices');
    }
    return [];
  }

  // Normalize reason codes
  const normalizedCodes = normalizeReasonCodes(reasonCodesRaw);

  // Build recommendation context for rule evaluation
  const ctx: RecommendationContext = {
    vehicleId: input.vehicleId,
    trustIndex: indexMap.trustIndex ?? 50,
    reliabilityIndex: indexMap.reliabilityIndex ?? 50,
    maintenanceDiscipline: indexMap.maintenanceDiscipline ?? 50,
    insuranceRisk: indexMap.insuranceRisk ?? 50,
    reasonCodes: normalizedCodes,
    indexMap,
    evidenceSourcesCount: indices.length,
    confidenceSummary: input.event.confidenceSummary,
    // Extract event source with fallbacks
    source: input.event.source ?? input.event.dataSource ?? input.event.provider ?? undefined,
    // Extract event timestamp with fallbacks
    eventTime: input.event.generatedAt ?? input.event.timestamp ?? input.event.createdAt ?? undefined,
    // Extract event ID
    eventId: input.event.id ?? input.event.eventId ?? undefined,
  };

  if (import.meta.env.DEV) {
    console.debug('[generateRiskRecommendation] Context built:', {
      vehicleId: input.vehicleId,
      indicesCount: indices.length,
      indexKeys: Object.keys(indexMap),
      reasonCodesCount: normalizedCodes.length,
      trustIndex: ctx.trustIndex,
      maintenanceDiscipline: ctx.maintenanceDiscipline,
    });
  }

  // Evaluate rules and generate recommendations
  const recommendations = evaluateRulesAndGenerateRecommendations(ctx, normalizedCodes);

  if (import.meta.env.DEV) {
    console.debug('[generateRiskRecommendation] Recommendations generated:', {
      count: recommendations.length,
      actionTypes: recommendations.map((r) => r.actionType),
      scores: recommendations.map((r) => r.priorityScore),
    });
  }

  return recommendations;
}