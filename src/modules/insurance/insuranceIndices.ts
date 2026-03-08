/**
 * Insurance Domain Indices Builder
 * Converts insurance aggregate into standardized DataEngineIndex format
 * 
 * Indices produced:
 * - insuranceFraudRisk: Fraud likelihood assessment
 * - coverageContinuity: Coverage gap penalties
 * - claimFrequency: Claim activity level
 */

import type { DataEngineIndex } from "../data-engine/indexing";
import type { InsuranceDomainAggregate } from "./types";

/**
 * Build insurance domain indices
 * 
 * Creates three risk-domain indices for fraud assessment and coverage analysis
 * All indices use default 60% confidence (observational, not deterministic)
 * No PII included in metadata
 */
export function buildInsuranceDomainIndices(
  aggregate: InsuranceDomainAggregate
): DataEngineIndex[] {
  const indices: DataEngineIndex[] = [];
  const now = new Date().toISOString();

  // Index 1: Fraud Risk Score
  indices.push({
    domain: "risk",
    key: "insuranceFraudRisk",
    value: aggregate.fraudRiskScore,
    confidence: 60,
    updatedAt: now,
    meta: {
      description: "Insurance fraud risk assessment (0=low, 100=critical)",
      claimCount: aggregate.claims.length,
      policyCount: aggregate.policies.length,
    },
  });

  // Index 2: Coverage Continuity Score
  indices.push({
    domain: "risk",
    key: "coverageContinuity",
    value: aggregate.coverageContinuityScore,
    confidence: 60,
    updatedAt: now,
    meta: {
      description: "Coverage period continuity (0=gaps detected, 100=continuous)",
      policyCount: aggregate.policies.length,
    },
  });

  // Index 3: Claim Frequency Score
  indices.push({
    domain: "risk",
    key: "claimFrequency",
    value: aggregate.claimFrequencyScore,
    confidence: 60,
    updatedAt: now,
    meta: {
      description: "Claim frequency assessment (0=high frequency, 100=low)",
      claimCount: aggregate.claims.length,
    },
  });

  if (import.meta.env.DEV) {
    console.debug("[Insurance Indices] Built indices", {
      count: indices.length,
      vehicleId: aggregate.vehicleId,
    });
  }

  return indices;
}
