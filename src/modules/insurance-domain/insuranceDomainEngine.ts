/**
 * Insurance Domain Engine
 * Calculates coverage risk index, derived metrics, reasonCodes
 * 
 * Scoring: coverageRiskIndex (0-100) based on policy status, claims, lapses, inquiries
 */

import type {
  InsuranceDomainInput,
  InsuranceDomainAggregate,
  InsuranceEvent,
  InsurancePolicySnapshot,
  InsuranceReasonCode,
} from "./types";

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parse ISO date to timestamp
 */
function parseDate(dateStr: string): number {
  return new Date(dateStr).getTime();
}

/**
 * Count events within time window
 */
function countEventsInWindow(
  events: InsuranceEvent[],
  type: string,
  daysBack: number
): number {
  const now = Date.now();
  const windowMs = daysBack * 24 * 60 * 60 * 1000;

  return events.filter((e) => {
    if (e.type !== type) return false;
    const timeSinceEvent = now - parseDate(e.date);
    return timeSinceEvent <= windowMs;
  }).length;
}

/**
 * Get most recent event of a type
 */
function getMostRecentEventDate(
  events: InsuranceEvent[],
  type: string
): string | undefined {
  const filtered = events
    .filter((e) => e.type === type)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));

  return filtered.length > 0 ? filtered[0].date : undefined;
}

/**
 * Calculate coverage risk index (0-100)
 * 
 * Start: 20 (baseline)
 * Adjustments:
 * - +30 per lapse (capped at +60)
 * - +15 per claim (capped at +45)
 * - +10 if inquiries > 2
 * - +25 if policy status is EXPIRED or UNKNOWN
 */
function calculateCoverageRiskIndex(
  policy: InsurancePolicySnapshot,
  claimCount: number,
  lapseCount: number,
  inquiryCount: number
): number {
  let risk = 20; // baseline

  // Lapse penalty: +30 per, capped at +60
  risk += Math.min(lapseCount * 30, 60);

  // Claim penalty: +15 per, capped at +45
  risk += Math.min(claimCount * 15, 45);

  // Inquiry penalty: +10 if > 2
  if (inquiryCount > 2) {
    risk += 10;
  }

  // Policy status penalty: +25 if not ACTIVE
  if (policy.status === "EXPIRED" || policy.status === "UNKNOWN") {
    risk += 25;
  }

  return clamp(risk, 0, 100);
}

/**
 * Calculate confidence score (0-100)
 * 
 * Start: 70
 * Penalties:
 * - No policy provided: -20
 * - No events provided: -10
 */
function calculateConfidence(
  hasPolicy: boolean,
  hasEvents: boolean
): { score: number; reasonCode?: InsuranceReasonCode } {
  let score = 70;

  if (!hasPolicy) score -= 20;
  if (!hasEvents) score -= 10;

  score = clamp(score, 0, 100);

  let reasonCode: InsuranceReasonCode | undefined;
  if (score < 55) {
    reasonCode = {
      code: "LOW_CONFIDENCE_INPUT_GAPS",
      severity: "warn",
      message: `Confidence only ${score}% due to missing input data`,
      meta: { missingPolicy: !hasPolicy, missingEvents: !hasEvents },
    };
  }

  return { score, reasonCode };
}

/**
 * Build reason codes based on metrics
 */
function buildReasonCodes(
  claimCount: number,
  lapseCount: number,
  inquiryCount: number,
  policyStatus: string,
  confidenceCode?: InsuranceReasonCode
): InsuranceReasonCode[] {
  const codes: InsuranceReasonCode[] = [];

  // Multiple lapses
  if (lapseCount >= 1) {
    codes.push({
      code: "MULTIPLE_LAPSES",
      severity: "warn",
      message: `${lapseCount} coverage lapse(s) detected in past 12 months`,
      meta: { lapseCount },
    });
  }

  // Multiple claims
  if (claimCount >= 2) {
    codes.push({
      code: "MULTIPLE_CLAIMS",
      severity: "warn",
      message: `${claimCount} claim(s) filed in past 12 months`,
      meta: { claimCount },
    });
  }

  // Expired or unknown policy
  if (policyStatus === "EXPIRED" || policyStatus === "UNKNOWN") {
    codes.push({
      code: "EXPIRED_OR_UNKNOWN_POLICY",
      severity: "high",
      message: `Policy status is ${policyStatus}; coverage may not be active`,
      meta: { status: policyStatus },
    });
  }

  // Excessive inquiries
  if (inquiryCount > 2) {
    codes.push({
      code: "EXCESSIVE_INQUIRIES",
      severity: "info",
      message: `${inquiryCount} inquiries made in past 6 months`,
      meta: { inquiryCount },
    });
  }

  // Add confidence reason code if applicable
  if (confidenceCode) {
    codes.push(confidenceCode);
  }

  return codes;
}

/**
 * Build insurance domain aggregate
 * 
 * Main entry point for insurance domain engine
 */
export function buildInsuranceDomainAggregate(
  input: InsuranceDomainInput
): InsuranceDomainAggregate {
  // Defaults
  const policy: InsurancePolicySnapshot = input.policy || {
    policyType: "UNKNOWN",
    status: "UNKNOWN",
  };
  const events = input.events || [];

  // Calculate derived metrics
  const claimCount12m = countEventsInWindow(events, "CLAIM", 365);
  const lapseCount12m = countEventsInWindow(events, "LAPSE", 365);
  const inquiryCount6m = countEventsInWindow(events, "INQUIRY", 180);
  const lastClaimDate = getMostRecentEventDate(events, "CLAIM");

  // Calculate coverage risk index
  const coverageRiskIndex = calculateCoverageRiskIndex(
    policy,
    claimCount12m,
    lapseCount12m,
    inquiryCount6m
  );

  // Calculate confidence
  const { score: confidence, reasonCode: confCode } = calculateConfidence(
    !!input.policy,
    events.length > 0
  );

  // Build reason codes
  const reasonCodes = buildReasonCodes(
    claimCount12m,
    lapseCount12m,
    inquiryCount6m,
    policy.status,
    confCode
  );

  if (import.meta.env.DEV) {
    console.debug("[Insurance Domain] Aggregate built", {
      vehicleId: input.vehicleId,
      policyStatus: policy.status,
      claimCount12m,
      lapseCount12m,
      inquiryCount6m,
      coverageRiskIndex,
      confidence,
      reasonCodeCount: reasonCodes.length,
    });
  }

  return {
    vehicleId: input.vehicleId,
    policy,
    events,
    derived: {
      claimCount12m,
      lapseCount12m,
      inquiryCount6m,
      lastClaimDate,
    },
    indexes: {
      coverageRiskIndex,
    },
    confidence,
    explain: reasonCodes.length > 0 ? { reasonCodes } : undefined,
    generatedAt: input.generatedAt,
  };
}

/**
 * Classify coverage risk level
 * DEV utility for UI display
 */
export function getCoverageRiskLevel(
  score: number
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score < 25) return "LOW";
  if (score < 50) return "MEDIUM";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}
