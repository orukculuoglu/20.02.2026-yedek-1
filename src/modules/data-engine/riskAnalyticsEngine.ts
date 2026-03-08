/**
 * Risk Analytics Engine
 * In-memory analytics for rule trigger metrics, risk distribution, and reason code aggregation
 * Supports operational intelligence without backend requirements
 * ALL-ZERO-PII: No vehicle IDs, VINs, plates, or identity information included
 */

import type { RiskRecommendation } from "../../types/RiskRecommendation";
import type { DataEngineIndex } from "./indexing";

/**
 * Statistics for a single fired recommendation rule
 */
export interface RuleTriggerStat {
  ruleId: string;
  triggerCount: number;
}

/**
 * Distribution of risk scores across severity bands
 */
export interface RiskDistribution {
  veryLow: number;    // trustIndex/priorityScore: 80–100 (safe/low risk)
  medium: number;     // trustIndex/priorityScore: 50–79 (moderate risk)
  high: number;       // trustIndex/priorityScore: 20–49 (high risk)
  critical: number;   // trustIndex/priorityScore: 0–19 (critical risk)
}

/**
 * Top-level aggregation of a reason code
 */
export interface ReasonCodeStat {
  code: string;
  count: number;
}

/**
 * Complete risk analytics summary (in-memory)
 */
export interface RiskAnalyticsSummary {
  totalEvents: number;
  ruleStats: RuleTriggerStat[];           // Sorted by triggerCount desc
  distribution: RiskDistribution;          // Buckets by risk severity
  topReasonCodes: ReasonCodeStat[];        // Top 5 reason codes by frequency
}

/**
 * Build risk analytics from a collection of recommendation events
 * 
 * @param events - Recommendation events (from recommendation event log)
 * @returns RiskAnalyticsSummary with rule stats, distribution, and top reason codes
 * 
 * Algorithm:
 * - Count rule triggers: each recommendation's actionType/source → rule attribution
 * - Calculate risk distribution: bucket priorityScore into severity bands
 * - Aggregate reason codes: extract from reasonCodes[], deduplicate, count
 * - Sort results: ruleStats and topReasonCodes by count desc
 * - Top reason codes limited to 5 results
 */
export function buildRiskAnalytics(events: RiskRecommendation[]): RiskAnalyticsSummary {
  // Count rule triggers by actionType
  const ruleTriggerMap = new Map<string, number>();
  const distributionBuckets = {
    veryLow: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  const reasonCodeMap = new Map<string, number>();

  events.forEach((event) => {
    // Count rule trigger (using actionType as proxy for rule)
    // In real implementation, could map actionType → ruleId mappings
    const ruleId = event.actionType;
    const count = ruleTriggerMap.get(ruleId) || 0;
    ruleTriggerMap.set(ruleId, count + 1);

    // Distribute by priorityScore (0-100 scale)
    const score = event.priorityScore ?? 50;
    if (score >= 80) {
      distributionBuckets.veryLow++;
    } else if (score >= 50) {
      distributionBuckets.medium++;
    } else if (score >= 20) {
      distributionBuckets.high++;
    } else {
      distributionBuckets.critical++;
    }

    // Aggregate reason codes
    if (event.reasonCodes && Array.isArray(event.reasonCodes)) {
      event.reasonCodes.forEach((reasonCode) => {
        const code = reasonCode.code || "UNKNOWN";
        const codeCount = reasonCodeMap.get(code) || 0;
        reasonCodeMap.set(code, codeCount + 1);
      });
    }
  });

  // Convert maps to sorted arrays
  const ruleStats = Array.from(ruleTriggerMap.entries())
    .map(([ruleId, count]) => ({ ruleId, triggerCount: count }))
    .sort((a, b) => b.triggerCount - a.triggerCount);

  const topReasonCodes = Array.from(reasonCodeMap.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 only

  return {
    totalEvents: events.length,
    ruleStats,
    distribution: distributionBuckets,
    topReasonCodes,
  };
}

/**
 * Format risk distribution as percentage breakdown
 * Useful for visual representations
 */
export function formatRiskDistributionPercent(dist: RiskDistribution): {
  veryLowPercent: number;
  mediumPercent: number;
  highPercent: number;
  criticalPercent: number;
} {
  const total = dist.veryLow + dist.medium + dist.high + dist.critical;
  if (total === 0) {
    return {
      veryLowPercent: 0,
      mediumPercent: 0,
      highPercent: 0,
      criticalPercent: 0,
    };
  }

  return {
    veryLowPercent: Math.round((dist.veryLow / total) * 100),
    mediumPercent: Math.round((dist.medium / total) * 100),
    highPercent: Math.round((dist.high / total) * 100),
    criticalPercent: Math.round((dist.critical / total) * 100),
  };
}
