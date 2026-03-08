/**
 * Vehicle Intelligence Recommendation Engine
 * Phase 9.3: Lightweight pure recommendation generation
 *
 * Design:
 * - Pure function: No side effects, no state mutations
 * - Snapshot-driven: Reads only from snapshot data
 * - Safe to call async: No integration with event ingestion or reducer
 * - Simple rules: Based on snapshot metrics and thresholds
 * - Ready for UI/event integration: In Phase 9.4+
 *
 * This engine can be called:
 * 1) On-demand by UI components
 * 2) Async after snapshot updates (future Phase 9.4)
 * 3) For batch analysis without blocking event pipeline
 */

import type { VehicleStateSnapshot } from '../../vehicle-state/vehicleStateSnapshotStore';

/**
 * Vehicle Intelligence Recommendation
 * Safe to render in UI or log to timeline
 */
export interface Recommendation {
  key: string;                                    // Unique recommendation ID
  title: string;                                  // User-facing title (Turkish)
  summary: string;                                // Brief description
  severity: 'high' | 'medium' | 'low';           // Priority level
  rationale?: string[];                           // Why this recommendation (optional, for explainability)
}

/**
 * Generate vehicle intelligence recommendations from snapshot
 *
 * Pure function: No side effects, no mutations
 * Input: Snapshot with intelligence summary and domain indices
 * Output: Array of actionable recommendations
 *
 * Rules implemented:
 * 1) Data Quality (trustIndex < 50) → data gathering recommendation
 * 2) Maintenance Planning (maintenanceDiscipline < 40) → preventive maintenance
 * 3) Mechanical Inspection (mechanicalRisk > 60) → technical inspection
 * 4) Insurance Review (insuranceRisk > 70) → insurance policy review
 * 5) Service Schedule (serviceGapScore > 60) → overdue maintenance
 * 6) Part Availability (low dataSourceCount) → part inventory check
 * 7) Reliability Check (reliabilityIndex < 45) → technical inspection
 * 8) Low Analysis Confidence (confidence < 50) → gather more data
 *
 * @param snapshot - Vehicle state snapshot (or null)
 * @returns Array of recommendations (empty if insufficient data)
 */
export function generateVehicleIntelligenceRecommendations(
  snapshot: VehicleStateSnapshot | null
): Recommendation[] {
  if (!snapshot || !snapshot.vehicleIntelligenceSummary) {
    // Not enough data to generate recommendations
    return [];
  }

  const recommendations: Recommendation[] = [];
  const summary = snapshot.vehicleIntelligenceSummary;

  // Rule 1: Data Quality Issues (Low Trust Index)
  if (typeof summary.trustIndex === 'number' && summary.trustIndex < 50) {
    recommendations.push({
      key: 'data-quality-low-trust',
      title: 'Veri Kalite Sorunu',
      summary: `Veri güvenilirliği düşük (Trust Index: ${summary.trustIndex}). Daha fazla verinin toplanması önerilmektedir.`,
      severity: 'medium',
      rationale: [
        `Trust Index ${summary.trustIndex} < 50 eşiği`,
        'OBD, kilometre veya servis kayıt eksikliği olabilir',
      ],
    });
  }

  // Rule 2: Maintenance Discipline Issues (Low Maintenance Score)
  if (
    typeof summary.maintenanceDiscipline === 'number' &&
    summary.maintenanceDiscipline < 40
  ) {
    recommendations.push({
      key: 'maintenance-discipline-low',
      title: 'Bakım Planlaması Gerekli',
      summary: `Bakım disiplini düşük (${summary.maintenanceDiscipline}). Düzenli bakım takvimi oluşturulması önerilmektedir.`,
      severity: 'high',
      rationale: [`Bakım Disiplini Skoru ${summary.maintenanceDiscipline} < 40`, 'Servis geçmişinde düzensizlik tespit edilmiştir'],
    });
  }

  // Rule 3: Mechanical Risk (High Mechanical Risk)
  if (typeof summary.mechanicalRisk === 'number' && summary.mechanicalRisk > 60) {
    recommendations.push({
      key: 'mechanical-inspection-urgent',
      title: 'Teknik Muayene Gerekli',
      summary: `Mekanik risk seviyesi yüksek (${summary.mechanicalRisk}). Uygulanmış açılı teknik muayene önerilmektedir.`,
      severity: 'high',
      rationale: [
        `Mekanik Risk ${summary.mechanicalRisk} > 60`,
        'OBD kodları veya arıza geçmişi tespit edilmiştir',
      ],
    });
  }

  // Rule 4: Insurance Risk (High Insurance Risk)
  if (typeof summary.insuranceRisk === 'number' && summary.insuranceRisk > 70) {
    recommendations.push({
      key: 'insurance-review-needed',
      title: 'Sigorta Poliçesi İncelemesi',
      summary: `Sigorta riski yüksek (${summary.insuranceRisk}). Poliçe kapsamının gözden geçirilmesi önerilmektedir.`,
      severity: 'medium',
      rationale: [
        `Sigorta Risk ${summary.insuranceRisk} > 70`,
        'Hasar geçmişi veya talep altyapısı tespit edilmiştir',
      ],
    });
  }

  // Rule 5: Service Gap (High Service Gap Score)
  if (typeof summary.serviceGapScore === 'number' && summary.serviceGapScore > 60) {
    recommendations.push({
      key: 'service-overdue',
      title: 'Vadesi Geçmiş Bakım',
      summary: `Bakım açığı tespit edildi (Skor: ${summary.serviceGapScore}). Hızlı bir şekilde servise alınması önerilmektedir.`,
      severity: 'high',
      rationale: [
        `Servis Boşluğu Skoru ${summary.serviceGapScore} > 60`,
        'Son bakımdan bu yana belirlenen süre veya kilometre aşılmıştır',
      ],
    });
  }

  // Rule 6: Insufficient Data Sources
  if (typeof summary.dataSourceCount === 'number' && summary.dataSourceCount < 3) {
    recommendations.push({
      key: 'data-coverage-low',
      title: 'Veri Kapsamı Sınırlı',
      summary: `Kapsanmış veri kaynakları azlık (${summary.dataSourceCount}). Daha kapsamlı analiz için ek veriler toplanmalıdır.`,
      severity: 'low',
      rationale: [
        `Veri Kaynakları ${summary.dataSourceCount} < 3`,
        'KM geçmişi, OBD, sigorta veya servis verilerinden bazıları eksik olabilir',
      ],
    });
  }

  // Rule 7: Low Reliability Index
  if (typeof summary.reliabilityIndex === 'number' && summary.reliabilityIndex < 45) {
    recommendations.push({
      key: 'reliability-check-recommended',
      title: 'Güvenilirlik Kontrolü Önerilir',
      summary: `Araç güvenilirliği düşük (${summary.reliabilityIndex}). Derinlemesine teknik inceleme yapılması önerilmektedir.`,
      severity: 'medium',
      rationale: [
        `Güvenilirlik İndeksi ${summary.reliabilityIndex} < 45`,
        'Mekanik ve elektrik sistemlerinde sorun işaretleri tespit edilmiştir',
      ],
    });
  }

  // Rule 8: Low Confidence in Analysis
  if (typeof summary.confidence === 'number' && summary.confidence < 50) {
    recommendations.push({
      key: 'analysis-low-confidence',
      title: 'Analiz Güvenilirliği Düşük',
      summary: `Analiz güvenilirliği sınırlı (${summary.confidence}%). Daha kapsamlı veri toplanarak analiz tekrarlanmalıdır.`,
      severity: 'low',
      rationale: [
        `Analiz Güveni ${summary.confidence}% < 50`,
        'Yeterli veri miktarı ve çeşitliliği kazanılmamıştır',
      ],
    });
  }

  // Sort by severity (high → medium → low)
  const severityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );

  return recommendations;
}

/**
 * Check if snapshot has sufficient data for recommendations
 * Useful to avoid generating recommendations from empty or partial snapshots
 *
 * Criteria: Must have vehicleIntelligenceSummary with at least some metrics
 *
 * @param snapshot - Snapshot to check
 * @returns true if safe to generate recommendations
 */
export function isSnapshotSufficientForRecommendations(
  snapshot: VehicleStateSnapshot | null
): boolean {
  if (!snapshot || !snapshot.vehicleIntelligenceSummary) {
    return false;
  }

  const summary = snapshot.vehicleIntelligenceSummary;

  // Require at least a few of the key metrics
  const hasCompositeScore = typeof summary.compositeScore === 'number';
  const hasTrustIndex = typeof summary.trustIndex === 'number';
  const hasMaintenanceDiscipline = typeof summary.maintenanceDiscipline === 'number';
  const hasRiskMetrics = 
    typeof summary.mechanicalRisk === 'number' || 
    typeof summary.insuranceRisk === 'number' ||
    typeof summary.structuralRisk === 'number';

  // At least 2 of the above conditions
  const scoreCount = [
    hasCompositeScore,
    hasTrustIndex,
    hasMaintenanceDiscipline,
    hasRiskMetrics,
  ].filter(Boolean).length;

  return scoreCount >= 2;
}
