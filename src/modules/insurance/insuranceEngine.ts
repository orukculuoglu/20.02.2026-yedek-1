/**
 * Insurance Domain Engine
 * Calculates fraud risk, coverage continuity, and claim frequency scores
 * 
 * Scoring methodology:
 * - Fraud Risk: Multi-factor assessment (claim density, coverage gaps, claim frequency)
 * - Coverage Continuity: Penalizes gaps in coverage > 30 days
 * - Claim Frequency: Assesses how many claims per policy
 */

import type {
  InsurancePolicy,
  InsuranceClaim,
  InsuranceDomainAggregate,
  InsurancePolicyStatus,
} from "./types";

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parse ISO date string to timestamp
 */
function parseDate(dateStr: string): number {
  return new Date(dateStr).getTime();
}

/**
 * Check if a date is within a coverage period
 */
function isDateCovered(
  claimDate: string,
  policies: InsurancePolicy[]
): boolean {
  const claimTime = parseDate(claimDate);

  for (const policy of policies) {
    const startTime = parseDate(policy.startDate);
    const endTime = parseDate(policy.endDate);

    if (
      claimTime >= startTime &&
      claimTime <= endTime &&
      (policy.status === "ACTIVE" || policy.status === "EXPIRED")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate coverage continuity score
 * 
 * Evaluates if there are gaps in coverage exceeding 30 days
 * Perfect continuous coverage = 100
 * Each major gap (>30 days) = -20 points
 */
function calculateContinuityScore(policies: InsurancePolicy[]): number {
  if (policies.length === 0) {
    return 0; // No coverage at all
  }

  // Sort policies by start date
  const sorted = [...policies].sort(
    (a, b) => parseDate(a.startDate) - parseDate(b.startDate)
  );

  let score = 100;
  const GAP_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  // Check for gaps between consecutive policies
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = parseDate(sorted[i].endDate);
    const nextStart = parseDate(sorted[i + 1].startDate);

    const gap = nextStart - currentEnd;

    if (gap > GAP_THRESHOLD_MS) {
      score -= 20;
    }
  }

  return clamp(score, 0, 100);
}

/**
 * Calculate claim frequency score
 * 
 * 0 claims = 100
 * 1–2 claims = 70
 * 3+ claims = 40
 */
function calculateFrequencyScore(claims: InsuranceClaim[]): number {
  const count = claims.length;

  if (count === 0) {
    return 100;
  }

  if (count <= 2) {
    return 70;
  }

  return 40;
}

/**
 * Calculate fraud risk score (0–100)
 * 
 * Risk factors:
 * 1. High claim count (>3) → +30 risk
 * 2. Claim without matching coverage → +25 risk per claim
 * 3. High claim density (2+ claims within 30 days) → +20 risk
 * 
 * Higher score = higher risk
 */
function calculateFraudRiskScore(
  policies: InsurancePolicy[],
  claims: InsuranceClaim[]
): number {
  let riskScore = 0;

  // Factor 1: Excessive claims
  if (claims.length > 3) {
    riskScore += 30;
  }

  // Factor 2: Claims without coverage period match
  const suspiciousClaims = claims.filter(
    (claim) => !isDateCovered(claim.claimDate, policies)
  );

  riskScore += suspiciousClaims.length * 25;

  // Factor 3: High claim density (2 or more within 30 days)
  if (claims.length >= 2) {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const DENSITY_WINDOW = 30 * DAY_MS;

    const sortedClaims = [...claims].sort(
      (a, b) => parseDate(a.claimDate) - parseDate(b.claimDate)
    );

    for (let i = 0; i < sortedClaims.length - 1; i++) {
      const timeBetween =
        parseDate(sortedClaims[i + 1].claimDate) -
        parseDate(sortedClaims[i].claimDate);

      if (timeBetween < DENSITY_WINDOW) {
        riskScore += 20;
        break; // Count once per instance
      }
    }
  }

  return clamp(riskScore, 0, 100);
}

/**
 * Build insurance domain aggregate
 * 
 * Main entry point for insurance scoring
 * Returns complete snapshot with all scores
 */
export function buildInsuranceAggregate(
  vehicleId: string,
  policies: InsurancePolicy[],
  claims: InsuranceClaim[]
): InsuranceDomainAggregate {
  const fraudRiskScore = calculateFraudRiskScore(policies, claims);
  const coverageContinuityScore = calculateContinuityScore(policies);
  const claimFrequencyScore = calculateFrequencyScore(claims);

  if (import.meta.env.DEV) {
    console.debug("[Insurance] Aggregate built", {
      vehicleId,
      fraudRiskScore,
      coverageContinuityScore,
      claimFrequencyScore,
      policyCount: policies.length,
      claimCount: claims.length,
    });
  }

  return {
    vehicleId,
    policies,
    claims,
    fraudRiskScore,
    coverageContinuityScore,
    claimFrequencyScore,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Classify fraud risk level
 * DEV utility for display
 */
export function getInsuranceFraudRiskLevel(
  score: number
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score < 25) return "LOW";
  if (score < 50) return "MEDIUM";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}
