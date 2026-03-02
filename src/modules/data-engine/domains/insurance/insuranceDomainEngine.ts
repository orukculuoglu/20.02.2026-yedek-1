/**
 * Insurance Domain Engine
 * Builds insurance indices from policy/claim data
 * 
 * Deterministic rules for now (mockable for testing)
 */

import type {
  InsuranceIndex,
  InsuranceIndexKey,
  InsuranceEventPayload,
} from "./insuranceTypes";

/**
 * Clamp value between 0-100
 */
function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/**
 * Build policyContinuityIndex
 * Penalizes coverage lapses
 * Formula: max(0, 100 - lapseCount12m * 20)
 */
function buildPolicyContinuityIndex(
  lapseCount12m: number
): { value: number; confidence: number } {
  const value = clamp(100 - lapseCount12m * 20);
  // Confidence high if we have lapse count, else medium
  const confidence = lapseCount12m >= 0 ? 85 : 60;

  return { value, confidence };
}

/**
 * Build claimFrequencyIndex
 * Penalizes claim frequency in 12 months
 * Formula: max(0, 100 - claimCount12m * 15)
 */
function buildClaimFrequencyIndex(
  claimCount12m: number
): { value: number; confidence: number } {
  const value = clamp(100 - claimCount12m * 15);
  // Confidence high if we have claim count
  const confidence = claimCount12m >= 0 ? 85 : 60;

  return { value, confidence };
}

/**
 * Build coverageAdequacyIndex
 * Baseline 50, improved if policies active
 * Formula: 50 + (activePolicyCount > 0 ? 20 : 0)
 */
function buildCoverageAdequacyIndex(
  activePolicyCount: number
): { value: number; confidence: number } {
  let value = 50;
  if (activePolicyCount > 0) {
    value += Math.min(activePolicyCount * 10, 30); // Cap at 80
  }

  value = clamp(value);
  const confidence = activePolicyCount > 0 ? 80 : 50;

  return { value, confidence };
}

/**
 * Build fraudLikelihoodIndex
 * Based on high-severity signals count
 * Formula: signalCount * 25 (higher = higher fraud risk, 0-100)
 * Invert semantics: 100 = high risk, 0 = low risk
 */
function buildFraudLikelihoodIndex(
  highSeveritySignalCount: number
): { value: number; confidence: number } {
  // Each high-severity signal adds 25 to fraud risk
  const value = clamp(highSeveritySignalCount * 25);
  const confidence = highSeveritySignalCount > 0 ? 80 : 60;

  return { value, confidence };
}

/**
 * Build all insurance indices from event payload
 */
export function buildInsuranceDomainIndices(
  input: InsuranceEventPayload
): InsuranceIndex[] {
  const indices: InsuranceIndex[] = [];

  const now = input.generatedAt || new Date().toISOString();

  // Extract values with defaults
  const lapseCount12m = input.policySummary?.lapseCount12m ?? 0;
  const activePolicyCount = input.policySummary?.activePolicyCount ?? 0;
  const claimCount12m = input.claimSummary?.claimCount12m ?? 0;
  const highSeveritySignalCount =
    input.signals?.filter((s) => s.severity === "high").length ?? 0;

  // Build policyContinuityIndex
  const policyContinuity = buildPolicyContinuityIndex(lapseCount12m);
  indices.push({
    domain: "insurance",
    key: "policyContinuityIndex",
    value: policyContinuity.value,
    confidence: policyContinuity.confidence,
    updatedAt: now,
    meta: {
      calculationMethod: "penalty-based",
      ruleCount: 1,
      adjustments: [
        {
          reason: `${lapseCount12m} lapses in 12 months`,
          delta: -lapseCount12m * 20,
        },
      ],
    },
  });

  // Build claimFrequencyIndex
  const claimFrequency = buildClaimFrequencyIndex(claimCount12m);
  indices.push({
    domain: "insurance",
    key: "claimFrequencyIndex",
    value: claimFrequency.value,
    confidence: claimFrequency.confidence,
    updatedAt: now,
    meta: {
      calculationMethod: "penalty-based",
      ruleCount: 1,
      adjustments: [
        {
          reason: `${claimCount12m} claims in 12 months`,
          delta: -claimCount12m * 15,
        },
      ],
    },
  });

  // Build coverageAdequacyIndex
  const coverageAdequacy = buildCoverageAdequacyIndex(activePolicyCount);
  indices.push({
    domain: "insurance",
    key: "coverageAdequacyIndex",
    value: coverageAdequacy.value,
    confidence: coverageAdequacy.confidence,
    updatedAt: now,
    meta: {
      calculationMethod: "policy-count-based",
      ruleCount: 1,
      adjustments: [
        {
          reason: `${activePolicyCount} active policies`,
          delta: activePolicyCount > 0 ? 20 : -10,
        },
      ],
    },
  });

  // Build fraudLikelihoodIndex
  const fraudLikelihood = buildFraudLikelihoodIndex(highSeveritySignalCount);
  indices.push({
    domain: "insurance",
    key: "fraudLikelihoodIndex",
    value: fraudLikelihood.value,
    confidence: fraudLikelihood.confidence,
    updatedAt: now,
    meta: {
      calculationMethod: "signal-count-based",
      ruleCount: 1,
      highSeveritySignalCount,
      adjustments: [
        {
          reason: `${highSeveritySignalCount} high-severity signals`,
          delta: highSeveritySignalCount * 25,
        },
      ],
    },
  });

  if (import.meta.env.DEV) {
    console.debug("[Insurance Domain Engine] Indices built", {
      vehicleId: input.vehicleId,
      indexCount: indices.length,
      scores: {
        policyContinuity: policyContinuity.value,
        claimFrequency: claimFrequency.value,
        coverageAdequacy: coverageAdequacy.value,
        fraudLikelihood: fraudLikelihood.value,
      },
    });
  }

  return indices;
}
