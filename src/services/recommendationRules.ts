/**
 * Recommendation Rules Engine
 * Policy-driven configuration for extensible risk recommendation generation
 * Rules are evaluated in priority order to generate actionable recommendations
 */

import type { ActionType, StructuredReasonCode } from "../types/RiskRecommendation";

/**
 * Recommendation context for rule evaluation
 * Contains all data needed to assess and generate recommendations
 */
export interface RecommendationContext {
  // Indices (0-100 scale)
  trustIndex: number;
  reliabilityIndex: number;
  maintenanceDiscipline: number;
  insuranceRisk: number;

  // Reason codes and signals from event
  reasonCodes?: StructuredReasonCode[];
  signals?: Array<{ code: string; severity?: string; confidence?: number; meta?: any }>;

  // Indices map for quick access by key
  indexMap?: Record<string, number>;

  // Count of evidence sources (number of separate data sources)
  evidenceSourcesCount?: number;

  // Confidence summary from parent event
  confidenceSummary?: {
    average?: number;
    min?: number;
    max?: number;
  };

  // Event traceability (from generatedFrom)
  source?: string;
  eventTime?: string;
  eventId?: string;

  // Vehicle context
  vehicleId: string;
}

/**
 * Single recommendation rule
 * Encapsulates decision logic, priority calculation, and output generation
 */
export interface RecommendationRule {
  id: string; // Unique rule identifier (e.g., "INSURANCE_MISMATCH")
  actionType: ActionType; // The action type this rule produces
  title?: string; // Human-readable rule name
  when: (ctx: RecommendationContext) => boolean; // Rule matching condition
  priority: (ctx: RecommendationContext) => number; // Returns priority score (0-100)
  reason: (ctx: RecommendationContext) => string; // Explanation of why this rule matched
  recommendation: (ctx: RecommendationContext) => string; // The actionable recommendation text
  evidenceKeys?: string[]; // Indices used by this rule (e.g., ["maintenanceDiscipline"])
}

/**
 * Helper: Check if code exists in reason codes (case-insensitive)
 */
function hasReasonCode(
  pattern: string | RegExp,
  reasonCodes?: string[] | StructuredReasonCode[]
): boolean {
  if (!reasonCodes || reasonCodes.length === 0) return false;

  const codes = reasonCodes.map((item) =>
    typeof item === "string" ? item : item.code
  );

  if (typeof pattern === "string") {
    return codes.some((code) => code.toUpperCase() === pattern.toUpperCase());
  } else {
    return codes.some((code) => pattern.test(code));
  }
}

/**
 * Helper: Count reason codes by severity
 */
function countBySeverity(reasonCodes?: StructuredReasonCode[]) {
  const result = { high: 0, warn: 0, info: 0 };
  if (!reasonCodes) return result;

  reasonCodes.forEach((code) => {
    if (code.severity === "high") result.high++;
    else if (code.severity === "warn") result.warn++;
    else result.info++;
  });

  return result;
}

/**
 * Clamp value to 0-100 range
 */
function clamp100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * RECOMMENDATION RULES - Policy Configuration
 * Define all rules for generating risk recommendations
 * Rules are evaluated in order; matching rules produce recommendation candidates
 *
 * Rule Priority Guide:
 * - Insurance/Damage mismatch: 85-95 (CRITICAL)
 * - KM Anomaly: 85-95 (CRITICAL)
 * - Maintenance discipline low: 60-80 (HIGH)
 * - Reliability low: 65-80 (HIGH)
 * - Trust index low: 55-75 (MEDIUM-HIGH)
 * - Structural/Mechanical risk: 70-85 (HIGH)
 * - Data quality low: 50-65 (MEDIUM)
 * - Default fallback: 10-30 (LOW)
 */
export const RECOMMENDATION_RULES: RecommendationRule[] = [
  /**
   * RULE 1: Insurance/Damage Mismatch (CRITICAL)
   * Detect conflicts between insurance records and actual damage
   * This is fraud-risk indicator and requires immediate review
   */
  {
    id: "INSURANCE_DAMAGE_MISMATCH",
    actionType: "INSURANCE_REVIEW",
    title: "Insurance/Damage Record Discrepancy",
    when: (ctx) =>
      hasReasonCode(
        /INSURANCE.*DAMAGE.*INCONSISTENCY|INSURANCE.*DAMAGE.*MISMATCH|CLAIM.*WITHOUT.*DAMAGE.*RECORD/i,
        ctx.reasonCodes
      ) ||
      hasReasonCode("INSURANCE_DAMAGE_INCONSISTENCY", ctx.reasonCodes) ||
      hasReasonCode("INSURANCE_DAMAGE_MISMATCH", ctx.reasonCodes) ||
      hasReasonCode("CLAIM_WITHOUT_DAMAGE_RECORD", ctx.reasonCodes),
    priority: (ctx) => {
      const codesSeverityCount = countBySeverity(ctx.reasonCodes);
      const baseScore = ctx.trustIndex <= 40 ? 92 : 85;
      const extraCritical = codesSeverityCount.high > 1 ? 10 : 0;
      return clamp100(baseScore + extraCritical);
    },
    reason: (ctx) =>
      "Sigorta-hasar korelasyon uyuşmazlığı",
    recommendation: (ctx) =>
      "Sigorta/hasar kayıtlarında uyumsuzluk var. İnceleme önerilir.",
    evidenceKeys: ["trustIndex"],
  },

  /**
   * RULE 2: KM Anomaly / Odometer Rollback (CRITICAL)
   * Detect impossible kilometre readings or suspected rollback
   * This is fraud-risk indicator requiring investigation
   */
  {
    id: "KM_ANOMALY_DETECTED",
    actionType: "DATA_QUALITY_REVIEW",
    title: "Kilometre Reading Anomaly",
    when: (ctx) =>
      hasReasonCode(/KM.*ANOMALY|ODOMETER.*ANOMALY|KM.*ROLLBACK/i, ctx.reasonCodes) ||
      hasReasonCode("KM_ANOMALY_DETECTED", ctx.reasonCodes) ||
      hasReasonCode("ODOMETER_ANOMALY_DETECTED", ctx.reasonCodes) ||
      hasReasonCode("KM_ROLLBACK_DETECTED", ctx.reasonCodes),
    priority: (ctx) => {
      const codesSeverityCount = countBySeverity(ctx.reasonCodes);
      const highSeverityBonus = codesSeverityCount.high * 5;
      return clamp100(90 + highSeverityBonus);
    },
    reason: (ctx) =>
      "Kilometre verisi tutarsız",
    recommendation: (ctx) =>
      "KM verisinde anomali/rollback şüphesi var. Veri doğrulama önerilir.",
    evidenceKeys: [],
  },

  /**
   * RULE 3: Maintenance Discipline Low (HIGH)
   * Detect vehicles with irregular maintenance history
   * Indicates higher risk of mechanical failure
   */
  {
    id: "MAINTENANCE_DISCIPLINE_LOW",
    actionType: "MAINTENANCE_CHECK",
    title: "Low Maintenance Discipline",
    when: (ctx) => ctx.maintenanceDiscipline < 70,
    priority: (ctx) => {
      const codesSeverityCount = countBySeverity(ctx.reasonCodes);
      const highSeverityBonus = codesSeverityCount.high * 5;
      return clamp100(60 + (70 - ctx.maintenanceDiscipline) + highSeverityBonus);
    },
    reason: (ctx) =>
      "Bakım disiplini eşik altında",
    recommendation: (ctx) =>
      "Bakım geçmişi düzensiz görünüyor. Detaylı servis kontrolü önerilir.",
    evidenceKeys: ["maintenanceDiscipline"],
  },

  /**
   * RULE 4: Reliability Index Low (HIGH)
   * Detect vehicles with low reliability scores
   * Suggests propensity for mechanical issues
   */
  {
    id: "RELIABILITY_INDEX_LOW",
    actionType: "DIAGNOSTIC_CHECK",
    title: "Low Reliability Index",
    when: (ctx) => ctx.reliabilityIndex < 70,
    priority: (ctx) => {
      const codesSeverityCount = countBySeverity(ctx.reasonCodes);
      const highSeverityBonus = codesSeverityCount.high * 5;
      return clamp100(65 + (70 - ctx.reliabilityIndex) + highSeverityBonus);
    },
    reason: (ctx) =>
      "Güvenilirlik endeksi eşik altında",
    recommendation: (ctx) =>
      "Güvenilirlik düşük. Diyagnostik kontrol önerilir.",
    evidenceKeys: ["reliabilityIndex"],
  },

  /**
   * RULE 5: Structural/Mechanical Risk High (HIGH)
   * Detect signals indicating structural or mechanical damage
   * Requires specialist inspection
   */
  {
    id: "STRUCTURAL_MECHANICAL_RISK",
    actionType: "MECHANICAL_DIAG",
    title: "High Structural/Mechanical Risk",
    when: (ctx) =>
      hasReasonCode(/STRUCTURAL|FRAME|WELDING|MECHANICAL|OBD.*FAULT/i, ctx.reasonCodes) ||
      countBySeverity(ctx.reasonCodes).high > 0,
    priority: (ctx) => {
      const codesSeverityCount = countBySeverity(ctx.reasonCodes);
      const baseScore = 70 + codesSeverityCount.high * 3;
      return clamp100(baseScore);
    },
    reason: (ctx) =>
      "Yapısal/mekanik risk tespit edildi",
    recommendation: (ctx) =>
      "Araç yapısal ve mekanik durumu detaylı incelenmeli.",
    evidenceKeys: [],
  },

  /**
   * RULE 6: Insurance Risk High (MEDIUM-HIGH)
   * Detect high insurance risk signals
   * May indicate hidden damage or claim history patterns
   */
  {
    id: "INSURANCE_RISK_HIGH",
    actionType: "RISK_ASSESSMENT",
    title: "High Insurance Risk",
    when: (ctx) => ctx.insuranceRisk > 80,
    priority: (ctx) => clamp100(75 + (ctx.insuranceRisk - 80)),
    reason: (ctx) =>
      "Sigorta riski yüksek",
    recommendation: (ctx) =>
      "Araç sigorta profili derinlemesine incelenmelidir.",
    evidenceKeys: ["insuranceRisk"],
  },

  /**
   * RULE 7: Insufficient Evidence (MEDIUM)
   * Detect when there aren't enough data sources to make confident recommendations
   * Suggests additional data gathering
   */
  {
    id: "INSUFFICIENT_EVIDENCE",
    actionType: "DATA_QUALITY_REVIEW",
    title: "Insufficient Evidence Sources",
    when: (ctx) =>
      ctx.evidenceSourcesCount !== undefined && ctx.evidenceSourcesCount <= 1,
    priority: (ctx) => 60,
    reason: (ctx) =>
      "Yetersiz veri kapsamı",
    recommendation: (ctx) =>
      "Veri kaynağı yetersiz. Ek veri doğrulaması önerilir.",
    evidenceKeys: [],
  },

  /**
   * RULE 8: Trust Index Low - Fallback (MEDIUM)
   * Detect low overall trust score (confidence in data)
   * Fallback rule when other specific issues aren't matched
   * Suggests comprehensive review
   */
  {
    id: "TRUST_INDEX_LOW",
    actionType: "RISK_ASSESSMENT",
    title: "Low Trust Index",
    when: (ctx) => ctx.trustIndex < 50 && ctx.reliabilityIndex >= 70 && ctx.maintenanceDiscipline >= 70,
    priority: (ctx) => clamp100(55 + (50 - ctx.trustIndex)),
    reason: (ctx) =>
      "Genel güven endeksi düşük",
    recommendation: (ctx) =>
      "Araç verilerinin güvenilirliği düşük. Kapsamlı inceleme önerilir.",
    evidenceKeys: ["trustIndex"],
  },

  /**
   * RULE 9: Comprehensive Risk Assessment Fallback
   * Ultimate fallback when trust index is marginally low
   * Ensures no vehicle is left without at least some level of review recommendation
   */
  {
    id: "GENERAL_RISK_ASSESSMENT",
    actionType: "RISK_ASSESSMENT",
    title: "General Risk Assessment Required",
    when: (ctx) => ctx.trustIndex < 60,
    priority: (ctx) => clamp100(35 + (60 - ctx.trustIndex)),
    reason: (ctx) =>
      "Genel risk değerlendirmesi önerilir",
    recommendation: (ctx) =>
      "Araç kapsamlı risk değerlendirmesinden geçmelidir.",
    evidenceKeys: ["trustIndex"],
  },
];

export default RECOMMENDATION_RULES;
