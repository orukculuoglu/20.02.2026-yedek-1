/**
 * Recommendation Rules Extension
 * Adds cross-domain rule evaluation for fraud review and policy verification
 * 
 * Design:
 * - Recommend actions based on cross-domain fusion findings
 * - Each rule has actionType, priorityScore, and trigger condition
 * - Can be called from RiskAnalysis or WorkOrder contexts
 */

import type { CrossDomainFusionResult } from "../modules/cross-domain";

/**
 * Recommendation action types
 */
export type RecommendationActionType =
  | "FRAUD_REVIEW"
  | "POLICY_VERIFICATION"
  | "CLAIM_DAMAGE_RECONCILIATION"
  | "EXPERTISE_INSPECTION"
  | "INFO_ONLY";

/**
 * Recommendation object
 */
export interface Recommendation {
  id: string;
  actionType: RecommendationActionType;
  priorityScore: number;                // 0-100, higher = more urgent
  reason: string;                       // Turkish
  recommendation: string;               // Turkish recommendation text
  relatedFinding?: string;              // Finding code if applicable
  severity: "info" | "warn" | "high";
  generatedAt: string;
}

/**
 * Evaluate cross-domain fusion and generate recommendations
 */
export function buildCrossDomainRecommendations(
  vehicleId: string,
  fusionResult: CrossDomainFusionResult
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Rule 1: CROSS_DOMAIN_RISK_CONVERGENCE
  if (fusionResult.findings.some((f) => f.code === "CROSS_DOMAIN_RISK_CONVERGENCE")) {
    recommendations.push({
      id: `REC-${vehicleId}-CONVERGENCE-${Date.now()}`,
      actionType: "FRAUD_REVIEW",
      priorityScore: 90,
      reason:
        "Sigorta ve risk endeksleri arasında yüksek uyumsuzluk (convergence)",
      recommendation:
        "Uzman incelemesi önerilir. Tahrif veya iddialı dosya riski yüksek.",
      relatedFinding: "CROSS_DOMAIN_RISK_CONVERGENCE",
      severity: "high",
      generatedAt: new Date().toISOString(),
    });
  }

  // Rule 2: POLICY_STATUS_TRUST_CONFLICT
  if (fusionResult.findings.some((f) => f.code === "POLICY_STATUS_TRUST_CONFLICT")) {
    recommendations.push({
      id: `REC-${vehicleId}-POLICY-${Date.now()}`,
      actionType: "POLICY_VERIFICATION",
      priorityScore: 70,
      reason: "Sigorta durumu (iptal/bilinmeyen) ile güven endeksi uyumsuzluğu",
      recommendation:
        "Sigorta poliçesi doğrulanmalıdır. Geçerliliği kontrol edilmelidir.",
      relatedFinding: "POLICY_STATUS_TRUST_CONFLICT",
      severity: "warn",
      generatedAt: new Date().toISOString(),
    });
  }

  // Rule 3: CLAIMS_WITHOUT_DAMAGE_RISK
  if (
    fusionResult.findings.some((f) => f.code === "CLAIMS_WITHOUT_DAMAGE_RISK")
  ) {
    recommendations.push({
      id: `REC-${vehicleId}-CLAIMS-${Date.now()}`,
      actionType: "CLAIM_DAMAGE_RECONCILIATION",
      priorityScore: 75,
      reason: "Kaza talepleri var fakat hasarat riski yoktur (uyumsuzluk)",
      recommendation:
        "Kaza talepleri ve araç durumu mutabakat yapılmalıdır. Hasar belgeleri gözden geçirilmelidir.",
      relatedFinding: "CLAIMS_WITHOUT_DAMAGE_RISK",
      severity: "warn",
      generatedAt: new Date().toISOString(),
    });
  }

  // Rule 4: CROSS_DOMAIN_SUSPICION_INDICES
  if (
    fusionResult.findings.some((f) =>
      f.code === "CROSS_DOMAIN_SUSPICION_INDICES"
    )
  ) {
    recommendations.push({
      id: `REC-${vehicleId}-SUSPICION-${Date.now()}`,
      actionType: "FRAUD_REVIEW",
      priorityScore: 95,
      reason:
        "Kilometre anomalisi ve sigorta inconsistency aynı anda tespit edildi",
      recommendation:
        "Acil inceleme gerekir. Tahrif belirtileri güçlü. Polis raporu talep edilmelidir.",
      relatedFinding: "CROSS_DOMAIN_SUSPICION_INDICES",
      severity: "high",
      generatedAt: new Date().toISOString(),
    });
  }

  // Add info-level recommendation if high fusion score but no specific findings
  if (fusionResult.fusionScore >= 60 && recommendations.length === 0) {
    recommendations.push({
      id: `REC-${vehicleId}-HIGHFUSION-${Date.now()}`,
      actionType: "EXPERTISE_INSPECTION",
      priorityScore: 80,
      reason: `Domain arası risk puanı yüksek: ${fusionResult.fusionScore}/100`,
      recommendation:
        "Değerlendirme tavsiye edilir. Tüm raporlar tekrar gözden geçirilmelidir.",
      severity: "warn",
      generatedAt: new Date().toISOString(),
    });
  }

  if (import.meta.env.DEV) {
    console.debug("[Recommendation Rules] Built recommendations", {
      vehicleId,
      count: recommendations.length,
      fusionScore: fusionResult.fusionScore,
    });
  }

  return recommendations;
}

/**
 * Get highest priority recommendation for display
 */
export function getTopRecommendation(
  recommendations: Recommendation[]
): Recommendation | undefined {
  if (recommendations.length === 0) return undefined;
  return recommendations.reduce((max, rec) =>
    rec.priorityScore > (max?.priorityScore ?? 0) ? rec : max
  );
}
