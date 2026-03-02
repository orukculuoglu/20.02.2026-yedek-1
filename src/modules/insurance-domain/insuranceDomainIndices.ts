/**
 * Insurance Domain Indices Builder
 * Builds DataEngineIndex entries from insurance domain aggregate
 */

import type { InsuranceDomainAggregate } from "./types";
import type { DataEngineIndex } from "../data-engine/contracts/dataEngineApiContract";

/**
 * Build insurance domain indices
 * 
 * Returns single index entry for coverageRiskIndex with full metadata
 */
export function buildInsuranceDomainIndices(
  aggregate: InsuranceDomainAggregate
): DataEngineIndex[] {
  // Sanitize metadata: Include policy info + metrics but NO VIN/plate/PII
  const indexMeta = {
    policyType: aggregate.policy.policyType,
    policyStatus: aggregate.policy.status,
    policyEndDate: aggregate.policy.endDate,
    insurerName: aggregate.policy.insurerName,
    claimCount12m: aggregate.derived.claimCount12m,
    lapseCount12m: aggregate.derived.lapseCount12m,
    inquiryCount6m: aggregate.derived.inquiryCount6m,
    lastClaimDate: aggregate.derived.lastClaimDate,
    reasonCodeCount: aggregate.explain?.reasonCodes?.length ?? 0,
  };

  const coverageRiskIndex: DataEngineIndex = {
    domain: "risk",
    key: "coverageRiskIndex",
    value: aggregate.indexes.coverageRiskIndex,
    confidence: aggregate.confidence,
    updatedAt: aggregate.generatedAt,
    meta: indexMeta,
  };

  if (import.meta.env.DEV) {
    console.debug("[Insurance Domain Indices] Built", { coverageRiskIndex });
  }

  return [coverageRiskIndex];
}
