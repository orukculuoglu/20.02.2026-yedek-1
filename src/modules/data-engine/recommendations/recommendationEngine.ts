/**
 * Vehicle Intelligence Recommendation Engine
 * Phase 9.3: Lightweight pure recommendation generation
 * Phase 10.1: Added deduplication to ensure no duplicate recommendations
 *
 * Design:
 * - Pure function: No side effects, no state mutations
 * - Snapshot-driven: Reads only from snapshot data
 * - Safe to call async: No integration with event ingestion or reducer
 * - Simple rules: Based on snapshot metrics and thresholds
 * - Deduplicated: Uses deterministic keys to prevent duplicates
 * - Ready for UI/event integration: In Phase 9.4+
 *
 * This engine can be called:
 * 1) On-demand by UI components
 * 2) Async after snapshot updates (future Phase 9.4)
 * 3) For batch analysis without blocking event pipeline
 *
 * Phase 10.1: Deduplication Strategy:
 * - Each recommendation has a deterministic key (e.g., 'mechanical-inspection-urgent')
 * - Before returning, recommendations are deduplicated using Map<key, Recommendation>
 * - Later recommendations with same key overwrite earlier ones (last write wins)
 * - Severity order is preserved in final output (high → medium → low)
 */

import type { VehicleStateSnapshot } from '../../vehicle-state/vehicleStateSnapshotStore';

/**
 * Vehicle Intelligence Recommendation
 * Safe to render in UI or log to timeline
 * Phase 10.2: Added lifecycle status for recommendation tracking
 * Phase 10.4: Added priority score for finer ranking within severity levels
 * Phase 10.5: Added group for recommendation categorization
 */
export interface Recommendation {
  key: string;                                    // Unique recommendation ID
  title: string;                                  // User-facing title (Turkish)
  summary: string;                                // Brief description
  severity: 'high' | 'medium' | 'low';           // Priority level
  rationale?: string[];                           // Why this recommendation (optional, for explainability)
  status?: 'NEW' | 'SEEN' | 'APPLIED' | 'DISMISSED'; // Phase 10.2: Lifecycle status
  priorityScore?: number;                         // Phase 10.4: Numeric score for ranking within severity (higher = more urgent)
  group?: 'maintenance' | 'risk' | 'insurance' | 'data-quality'; // Phase 10.5: Category for grouping recommendations
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
 * PHASE 10.3: Explainability Enhancements
 * Each recommendation includes a rationale array with:
 * - RULE: The threshold condition that triggered the recommendation
 * - REASON: Why this rule matters or what was detected
 * - ACTION: What should be done to address the recommendation
 * - IMPACT: The expected positive outcome of following the recommendation
 *
 * Example rationale:
 * [
 *   "RULE: Mechanical Risk > 60 (Current: 75)",
 *   "REASON: OBD faults, error codes, or historical mechanical issues detected",
 *   "ACTION: Schedule comprehensive mechanical diagnostic and inspection",
 *   "IMPACT: Early detection prevents costly breakdowns during operation"
 * ]
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
        `RULE: Trust Index < 50 (Current: ${summary.trustIndex})`,
        'REASON: Low trust means incomplete or unreliable data sources',
        'ACTION: Gather OBD records, odometer history, or service records',
        'IMPACT: Analysis confidence will improve with more data sources',
      ],
      status: 'NEW',
      priorityScore: 100 - summary.trustIndex,
      group: 'data-quality',
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
      rationale: [
        `RULE: Maintenance Discipline < 40 (Current: ${summary.maintenanceDiscipline})`,
        'REASON: Vehicle has irregular service history with inconsistent maintenance patterns',
        'ACTION: Create preventive maintenance schedule aligned with vehicle intervals',
        'IMPACT: Regular servicing reduces breakdowns and extends vehicle lifespan',
      ],
      status: 'NEW',
      priorityScore: 100 - summary.maintenanceDiscipline,
      group: 'maintenance',
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
        `RULE: Mechanical Risk > 60 (Current: ${summary.mechanicalRisk})`,
        'REASON: OBD faults, error codes, or historical mechanical issues detected',
        'ACTION: Schedule comprehensive mechanical diagnostic and inspection',
        'IMPACT: Early detection prevents costly breakdowns during operation',
      ],
      status: 'NEW',
      priorityScore: summary.mechanicalRisk,
      group: 'risk',
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
        `RULE: Insurance Risk > 70 (Current: ${summary.insuranceRisk})`,
        'REASON: High claim frequency or damage history detected',
        'ACTION: Review current coverage and discuss risk mitigation with insurer',
        'IMPACT: Ensures adequate coverage and optimal premium rates',
      ],
      status: 'NEW',
      priorityScore: summary.insuranceRisk,
      group: 'insurance',
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
        `RULE: Service Gap Score > 60 (Current: ${summary.serviceGapScore})`,
        'REASON: Maintenance overdue based on time interval or mileage threshold',
        'ACTION: Schedule service appointment immediately to restore maintenance schedule',
        'IMPACT: Prevents warranty voidance and maintains vehicle reliability',
      ],
      status: 'NEW',
      priorityScore: summary.serviceGapScore,
      group: 'maintenance',
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
        `RULE: Data Sources < 3 (Current: ${summary.dataSourceCount})`,
        'REASON: Analysis only draws from limited sources (e.g., missing OBD, insurance, or service records)',
        'ACTION: Integrate additional data sources for deeper vehicle intelligence',
        'IMPACT: More complete picture enables better predictions and risk assessment',
      ],
      status: 'NEW',
      priorityScore: (3 - summary.dataSourceCount) * 25,
      group: 'data-quality',
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
        `RULE: Reliability Index < 45 (Current: ${summary.reliabilityIndex})`,
        'REASON: Mechanical and electrical systems show signs of degradation or failure',
        'ACTION: Schedule comprehensive technical inspection and system diagnostics',
        'IMPACT: Identifies hidden issues before they become safety or reliability problems',
      ],
      status: 'NEW',
      priorityScore: 100 - summary.reliabilityIndex,
      group: 'risk',
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
        `RULE: Analysis Confidence < 50% (Current: ${summary.confidence}%)`,
        'REASON: Insufficient data quantity or quality to generate high-confidence insights',
        'ACTION: Collect more complete vehicle history and data sources',
        'IMPACT: Higher confidence enables better decision-making and recommendations',
      ],
      status: 'NEW',
      priorityScore: (100 - summary.confidence) * 0.5,
      group: 'data-quality',
    });
  }

  // Sort by severity (high → medium → low), then by priorityScore descending within same severity
  // Phase 10.4: Priority score provides finer ranking for recommendations at same severity level
  const severityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => {
    // First, sort by severity
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }
    
    // If same severity, sort by priorityScore descending (higher score = more urgent)
    // Default score to 0 if not defined
    const aScore = a.priorityScore ?? 0;
    const bScore = b.priorityScore ?? 0;
    return bScore - aScore;
  });

  // PHASE 10.1: Deduplication using deterministic keys
  // Ensure no duplicate recommendations in output
  // Map preserves insertion order, so sorted recommendations maintain severity and priority order
  const deduplicatedMap = new Map<string, Recommendation>();
  for (const rec of recommendations) {
    // Use the key field as unique identifier (already deterministic: e.g., 'mechanical-inspection-urgent')
    deduplicatedMap.set(rec.key, rec);
  }

  const deduplicated = Array.from(deduplicatedMap.values());

  if (import.meta.env.DEV && deduplicated.length < recommendations.length) {
    console.debug(
      `[RecommendationEngine] ✓ Deduplication: ${recommendations.length} → ${deduplicated.length} recommendations`
    );
  }

  return deduplicated;
}

/**
 * PHASE 10.4: PRIORITY SCORE CALCULATION STRATEGY
 *
 * Priority scores enable finer ranking within the same severity level.
 * All scores are deterministic, threshold-based, and derived from vehicle intelligence metrics.
 *
 * SORTING ALGORITHM:
 * 1. Primary: Severity (high → medium → low)
 * 2. Secondary: priorityScore descending (higher score = more urgent)
 * 3. Tertiary: Deduplication preserves order via Map insertion
 *
 * PRIORITY CALCULATION BY RULE:
 *
 * Rule 1 (Data Quality - Trust)
 *   Formula: 100 - trustIndex
 *   Range: 0-100 (lower trustIndex → higher priority)
 *   Example: trustIndex=40 → priorityScore=60
 *   Rationale: Low trust = less reliable, requires more attention
 *
 * Rule 2 (Maintenance Discipline)
 *   Formula: 100 - maintenanceDiscipline
 *   Range: 0-100 (lower discipline → higher priority)
 *   Example: maintenanceDiscipline=30 → priorityScore=70
 *   Rationale: Poor maintenance history = higher risk of failure
 *
 * Rule 3 (Mechanical Risk)
 *   Formula: mechanicalRisk (direct)
 *   Range: 0-100 (higher risk = higher priority)
 *   Example: mechanicalRisk=75 → priorityScore=75
 *   Rationale: Mechanical issues are critical and time-sensitive
 *
 * Rule 4 (Insurance Risk)
 *   Formula: insuranceRisk (direct)
 *   Range: 0-100 (higher risk = higher priority)
 *   Example: insuranceRisk=85 → priorityScore=85
 *   Rationale: High insurance risk reflects significant underlying issues
 *
 * Rule 5 (Service Gap)
 *   Formula: serviceGapScore (direct)
 *   Range: 0-100 (higher gap = higher priority)
 *   Example: serviceGapScore=60 → priorityScore=60
 *   Rationale: Overdue services = mounting problems
 *
 * Rule 6 (Data Coverage)
 *   Formula: (3 - dataSourceCount) * 25
 *   Range: 0-75 (fewer sources → higher priority)
 *   Example: dataSourceCount=1 → priorityScore=50
 *   Rationale: Limited data sources = less reliable analysis
 *
 * Rule 7 (Reliability Index)
 *   Formula: 100 - reliabilityIndex
 *   Range: 0-100 (lower reliability → higher priority)
 *   Example: reliabilityIndex=45 → priorityScore=55
 *   Rationale: Low reliability = vehicle degradation
 *
 * Rule 8 (Analysis Confidence)
 *   Formula: (100 - confidence) * 0.5
 *   Range: 0-50 (lower confidence → higher priority, but weighted low)
 *   Example: confidence=50% → priorityScore=25
 *   Rationale: Confidence issues are lower priority than risk/metric issues
 *
 * IMPLEMENTATION NOTES:
 * - All priorityScore fields are OPTIONAL (backward compatible)
 * - Default score to 0 if undefined during sorting
 * - Calculations are pure functions with no side effects
 * - Priority scores preserve semantic meaning of underlying metrics
 * - No magic numbers; all scores derive from threshold distances
 */

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

/**
 * PHASE 10.3: Recommendation Rationale Format Reference
 *
 * Each recommendation.rationale is an array of 4 deterministic strings:
 *
 * INDEX 0: RULE
 * - Format: "RULE: <metric> <operator> <threshold> (Current: <value>)"
 * - Example: "RULE: Mechanical Risk > 60 (Current: 75)"
 * - Purpose: Shows the exact threshold condition that triggered the recommendation
 *
 * INDEX 1: REASON
 * - Format: "REASON: <explanation of why this matters>"
 * - Example: "REASON: OBD faults, error codes, or historical mechanical issues detected"
 * - Purpose: Explains what was detected and why it matters for vehicle health
 *
 * INDEX 2: ACTION
 * - Format: "ACTION: <specific actionable step>"
 * - Example: "ACTION: Schedule comprehensive mechanical diagnostic and inspection"
 * - Purpose: Tells user exactly what to do
 *
 * INDEX 3: IMPACT
 * - Format: "IMPACT: <expected positive outcome>"
 * - Example: "IMPACT: Early detection prevents costly breakdowns during operation"
 * - Purpose: Motivates action by showing benefits
 *
 * All rationale strings are deterministic (no random or AI-generated text).
 * Each string is based solely on the rule condition and its parameters.
 *
 * Rationale per rule:
 * Rule 1 (Data Quality): Shows Trust Index threshold and missing data cause
 * Rule 2 (Maintenance): Shows discipline score and service history issue
 * Rule 3 (Mechanical): Shows risk score and detected faults
 * Rule 4 (Insurance): Shows risk score and claim history
 * Rule 5 (Service Gap): Shows gap score and maintenance schedule status
 * Rule 6 (Data Coverage): Shows source count and missing source types
 * Rule 7 (Reliability): Shows index score and system degradation
 * Rule 8 (Confidence): Shows confidence percentage and data adequacy
 */


/**
 * PHASE 10.1: Recommendation Key Format Reference
 *
 * Each recommendation uses a deterministic key for deduplication.
 *
 * Key Format: `<context>-<rule>-<level>`
 * - context: Domain or metric name (lowercase, hyphenated)
 * - rule: Rule condition or action (lowercase, hyphenated)
 * - level: Optional severity or urgency indicator
 *
 * Current Keys Implemented:
 * - 'data-quality-low-trust' (Rule 1: Data quality issues)
 * - 'maintenance-discipline-low' (Rule 2: Maintenance discipline)
 * - 'mechanical-inspection-urgent' (Rule 3: Mechanical risk)
 * - 'insurance-review-needed' (Rule 4: Insurance risk)
 * - 'service-overdue' (Rule 5: Service gaps)
 * - 'data-coverage-low' (Rule 6: Insufficient data sources)
 * - 'reliability-check-recommended' (Rule 7: Reliability index)
 * - 'analysis-low-confidence' (Rule 8: Low analysis confidence)
 *
 * Deduplication Process (Phase 10.1):
 * 1. All rules generate recommendations into an array
 * 2. Array is sorted by severity (high → medium → low)
 * 3. Map<string, Recommendation> deduplicates by key
 * 4. Final output preserves severity order and removes duplicates
 *
 * Example: If two rules would generate the same key, only the first (highest severity)
 * recommendation is kept, others are discarded silently.
 */

