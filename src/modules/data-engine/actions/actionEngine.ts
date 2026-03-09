/**
 * Vehicle Action Engine
 * Phase 11.1: Convert recommendations into structured operational action objects
 *
 * Design:
 * - Pure function: No side effects, no state mutations
 * - Deterministic mapping: Same recommendation type always produces same action
 * - Recommendation-driven: Converts Phase 10 recommendations into actionable operations
 * - Safe to use: No integration with reducer, events, or external systems yet
 * - Extensible: Action type enum can expand for new action categories
 *
 * Data flow:
 * Recommendations (Phase 10) → generateVehicleActionsFromRecommendations() → VehicleActions (Phase 11.1)
 *
 * Actions represent operational tasks that can be:
 * - Displayed in UI for user awareness
 * - Converted to work orders (future Phase 11.2+)
 * - Tracked in analytics
 * - Assigned to service teams
 */

import type { Recommendation } from '../recommendations/recommendationEngine';

/**
 * Vehicle Action
 * Structured operational task derived from a recommendation
 *
 * Phase 11.1: Lightweight action model for operational planning
 * Phase 11.4: Added lifecycle status for action tracking
 * Not yet persisted, not yet sent to external systems
 */
export interface VehicleAction {
  key: string;                                      // Unique action identifier (deterministic)
  title: string;                                    // User-facing action title (Turkish)
  summary: string;                                  // Brief description of what to do
  actionType: string;                               // Type of action (e.g., SCHEDULE_MAINTENANCE, INSPECT_MECHANICAL_SYSTEM)
  priority: 'high' | 'medium' | 'low';             // Operational priority (from recommendation severity)
  sourceRecommendationKey?: string;                 // Links back to original recommendation
  group?: 'maintenance' | 'risk' | 'insurance' | 'data-quality'; // Category for grouping (from recommendation)
  status?: 'NEW' | 'SEEN' | 'READY' | 'EXECUTED' | 'DISMISSED'; // Phase 11.4: Action lifecycle status
}

/**
 * Action type constants
 * Define all possible action types that can be generated from recommendations
 */
export enum ActionType {
  SCHEDULE_MAINTENANCE = 'SCHEDULE_MAINTENANCE',                   // For maintenance/service gap recommendations
  INSPECT_MECHANICAL_SYSTEM = 'INSPECT_MECHANICAL_SYSTEM',         // For mechanical/risk recommendations
  PRIORITIZE_SERVICE_APPOINTMENT = 'PRIORITIZE_SERVICE_APPOINTMENT', // For overdue service
  REVIEW_INSURANCE_POLICY = 'REVIEW_INSURANCE_POLICY',             // For insurance recommendations
  IMPROVE_DATA_QUALITY = 'IMPROVE_DATA_QUALITY',                   // For data-quality recommendations
}

/**
 * Generate vehicle actions from recommendations
 *
 * Pure function: Deterministic transformation of recommendations to actions.
 * Uses recommendation keys and groups to map to appropriate action types.
 *
 * Mapping Rules:
 * - 'service-overdue' or maintenance group → SCHEDULE_MAINTENANCE
 * - 'mechanical-inspection-urgent' or risk group → INSPECT_MECHANICAL_SYSTEM
 * - 'insurance-review-needed' or insurance group → REVIEW_INSURANCE_POLICY
 * - data-quality group (trust, confidence, data coverage) → IMPROVE_DATA_QUALITY
 * - Special case: serviceGapScore > 75 → PRIORITIZE_SERVICE_APPOINTMENT (higher urgency)
 *
 * Priority Semantics:
 * - high severity recommendation → high priority action
 * - medium severity recommendation → medium priority action
 * - low severity recommendation → low priority action
 *
 * @param recommendations - Array of recommendations from recommendation engine
 * @returns Array of actions ready for operational planning
 */
export function generateVehicleActionsFromRecommendations(
  recommendations: Recommendation[]
): VehicleAction[] {
  const actions: VehicleAction[] = [];

  for (const rec of recommendations) {
    let action: VehicleAction | null = null;

    // Mapping by recommendation key (most specific)
    if (rec.key === 'service-overdue') {
      // Rule 5: Service gap with high urgency
      action = {
        key: `action-prioritize-service-${rec.key}`,
        title: 'Hızlı Servis Randevusu Oluştur',
        summary: rec.summary,
        actionType: ActionType.PRIORITIZE_SERVICE_APPOINTMENT,
        priority: rec.severity,
        sourceRecommendationKey: rec.key,
        group: rec.group,
        status: 'NEW',  // Phase 11.4: Action lifecycle
      };
    } else if (rec.key === 'mechanical-inspection-urgent') {
      // Rule 3: Mechanical risk
      action = {
        key: `action-inspect-mechanical-${rec.key}`,
        title: 'Mekanik Sistem Kontrolü Yap',
        summary: rec.summary,
        actionType: ActionType.INSPECT_MECHANICAL_SYSTEM,
        priority: rec.severity,
        sourceRecommendationKey: rec.key,
        group: rec.group,
        status: 'NEW',  // Phase 11.4: Action lifecycle
      };
    } else if (rec.key === 'insurance-review-needed') {
      // Rule 4: Insurance risk
      action = {
        key: `action-review-insurance-${rec.key}`,
        title: 'Sigorta Poliçesi Gözden Geçir',
        summary: rec.summary,
        actionType: ActionType.REVIEW_INSURANCE_POLICY,
        priority: rec.severity,
        sourceRecommendationKey: rec.key,
        group: rec.group,
        status: 'NEW',  // Phase 11.4: Action lifecycle
      };
    } else if (rec.key === 'maintenance-discipline-low') {
      // Rule 2: Maintenance discipline
      action = {
        key: `action-schedule-maintenance-${rec.key}`,
        title: 'Bakım Planı Oluştur',
        summary: rec.summary,
        actionType: ActionType.SCHEDULE_MAINTENANCE,
        priority: rec.severity,
        sourceRecommendationKey: rec.key,
        group: rec.group,
        status: 'NEW',  // Phase 11.4: Action lifecycle
      };
    } else if (rec.key === 'reliability-check-recommended') {
      // Rule 7: Low reliability
      action = {
        key: `action-inspect-mechanical-${rec.key}`,
        title: 'Güvenilirlik Kontrolü Yapılması Gerekli',
        summary: rec.summary,
        actionType: ActionType.INSPECT_MECHANICAL_SYSTEM,
        priority: rec.severity,
        sourceRecommendationKey: rec.key,
        group: rec.group,
        status: 'NEW',  // Phase 11.4: Action lifecycle
      };
    } else if (
      rec.key === 'data-quality-low-trust' ||
      rec.key === 'data-coverage-low' ||
      rec.key === 'analysis-low-confidence'
    ) {
      // Rules 1, 6, 8: Data quality issues
      action = {
        key: `action-improve-data-quality-${rec.key}`,
        title: 'Veri Kalitesini Artır',
        summary: rec.summary,
        actionType: ActionType.IMPROVE_DATA_QUALITY,
        priority: rec.severity,
        sourceRecommendationKey: rec.key,
        group: rec.group,
        status: 'NEW',  // Phase 11.4: Action lifecycle
      };
    }

    // Fallback mapping by group (less specific, for extensibility)
    if (!action && rec.group) {
      if (rec.group === 'maintenance') {
        action = {
          key: `action-schedule-maintenance-${rec.key}`,
          title: 'Bakım İşlemi Planla',
          summary: rec.summary,
          actionType: ActionType.SCHEDULE_MAINTENANCE,
          priority: rec.severity,
          sourceRecommendationKey: rec.key,
          group: rec.group,
          status: 'NEW',  // Phase 11.4: Action lifecycle
        };
      } else if (rec.group === 'risk') {
        action = {
          key: `action-inspect-mechanical-${rec.key}`,
          title: 'Risk Değerlendirmesi Yap',
          summary: rec.summary,
          actionType: ActionType.INSPECT_MECHANICAL_SYSTEM,
          priority: rec.severity,
          sourceRecommendationKey: rec.key,
          group: rec.group,
          status: 'NEW',  // Phase 11.4: Action lifecycle
        };
      } else if (rec.group === 'insurance') {
        action = {
          key: `action-review-insurance-${rec.key}`,
          title: 'Sigorta İncelemesi Yap',
          summary: rec.summary,
          actionType: ActionType.REVIEW_INSURANCE_POLICY,
          priority: rec.severity,
          sourceRecommendationKey: rec.key,
          group: rec.group,
          status: 'NEW',  // Phase 11.4: Action lifecycle
        };
      } else if (rec.group === 'data-quality') {
        action = {
          key: `action-improve-data-quality-${rec.key}`,
          title: 'Veri Kalitesini Artır',
          summary: rec.summary,
          actionType: ActionType.IMPROVE_DATA_QUALITY,
          priority: rec.severity,
          sourceRecommendationKey: rec.key,
          group: rec.group,
          status: 'NEW',  // Phase 11.4: Action lifecycle
        };
      }
    }

    // Add action if mapped
    if (action) {
      actions.push(action);
    }
  }

  // Deduplicate actions by key (in case mapping produces duplicates)
  // Preserve order (severity → priority score sorting from recommendations is maintained)
  const deduplicatedMap = new Map<string, VehicleAction>();
  for (const action of actions) {
    deduplicatedMap.set(action.key, action);
  }

  const deduplicated = Array.from(deduplicatedMap.values());

  if (import.meta.env.DEV && deduplicated.length < actions.length) {
    console.debug(
      `[ActionEngine] ✓ Deduplication: ${actions.length} → ${deduplicated.length} actions`
    );
  }

  return deduplicated;
}

/**
 * Phase 11.1 Action Mapping Reference
 *
 * Recommendation Key → Action Type Mapping:
 *
 * Rule 1 (Data Quality - Trust)
 *   key: 'data-quality-low-trust'
 *   → ActionType: IMPROVE_DATA_QUALITY
 *   → Reason: Address unreliable data sources
 *
 * Rule 2 (Maintenance Discipline)
 *   key: 'maintenance-discipline-low'
 *   → ActionType: SCHEDULE_MAINTENANCE
 *   → Reason: Create proactive maintenance plan
 *
 * Rule 3 (Mechanical Risk)
 *   key: 'mechanical-inspection-urgent'
 *   → ActionType: INSPECT_MECHANICAL_SYSTEM
 *   → Reason: Immediate diagnostic required
 *
 * Rule 4 (Insurance Risk)
 *   key: 'insurance-review-needed'
 *   → ActionType: REVIEW_INSURANCE_POLICY
 *   → Reason: Adjust coverage and terms
 *
 * Rule 5 (Service Gap)
 *   key: 'service-overdue'
 *   → ActionType: PRIORITIZE_SERVICE_APPOINTMENT
 *   → Reason: Schedule urgent service now
 *
 * Rule 6 (Data Coverage)
 *   key: 'data-coverage-low'
 *   → ActionType: IMPROVE_DATA_QUALITY
 *   → Reason: Integrate more data sources
 *
 * Rule 7 (Reliability Index)
 *   key: 'reliability-check-recommended'
 *   → ActionType: INSPECT_MECHANICAL_SYSTEM
 *   → Reason: Comprehensive reliability assessment
 *
 * Rule 8 (Analysis Confidence)
 *   key: 'analysis-low-confidence'
 *   → ActionType: IMPROVE_DATA_QUALITY
 *   → Reason: Improve analysis data quality
 *
 * Priority Preservation:
 * - Recommendation severity (high/medium/low) → Action priority (1:1 mapping)
 * - Recommendation priorityScore not used here (future for action ranking)
 *
 * Group Preservation:
 * - Recommendation group → Action group (passed through unchanged)
 * - Enables future UI filtering by action group
 */
