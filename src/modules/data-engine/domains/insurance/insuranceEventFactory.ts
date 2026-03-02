/// <reference types="vite/client" />

/**
 * Insurance Event Factory
 * Generates mock insurance events for testing + demo
 * PII-safe: vehicleId only
 */

import type { InsuranceEventPayload } from "./index.js";
import { buildInsuranceDomainIndices } from "./index.js";

/**
 * Build mock insurance event
 * Deterministic mock data (no PII)
 */
export function buildMockInsuranceEvent(
  vehicleId: string,
  timestamp: string = new Date().toISOString()
): InsuranceEventPayload {
  // Deterministic pseudo-random based on vehicleId
  const seed = vehicleId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const activePolicyCount = (seed % 3) + 1; // 1-3 policies
  const lapseCount12m = seed % 2; // 0-1 lapses
  const claimCount12m = (seed % 4); // 0-3 claims
  const highSeveritySignalCount = (seed % 3); // 0-2 high-severity signals

  // Build payload with summary
  const payload: InsuranceEventPayload = {
    vehicleId,
    generatedAt: timestamp,
    provider: (["SBM", "INSURER", "BROKER"] as const)[seed % 3],

    policySummary: {
      activePolicyCount,
      lapseCount12m,
      totalPolicyCoverage: 250000 + seed * 1000, // Mock TRY amount
    },

    claimSummary: {
      claimCount12m,
      totalClaimAmount12m: claimCount12m > 0 ? 15000 + seed * 2000 : undefined,
      settledClaimCount: Math.max(0, claimCount12m - 1),
    },

    signals: [
      ...(lapseCount12m > 0
        ? [
            {
              code: "MULTIPLE_LAPSES",
              severity: "high" as const,
              confidence: 85,
              meta: { lapseCount: lapseCount12m },
            },
          ]
        : []),
      ...(claimCount12m >= 2
        ? [
            {
              code: "HIGH_CLAIM_FREQUENCY",
              severity: "medium" as const,
              confidence: 75,
              meta: { claimCount: claimCount12m },
            },
          ]
        : []),
      ...(highSeveritySignalCount > 1
        ? [
            {
              code: "POTENTIAL_FRAUD_PATTERN",
              severity: "high" as const,
              confidence: 70,
              meta: { signalCount: highSeveritySignalCount },
            },
          ]
        : []),
    ],

    trace: {
      eventId: `INS-${vehicleId}-${timestamp}`,
      source: "MOCK_INSURANCE_ADAPTER",
      version: "1.0",
    },

    // Built indices will be added below
    indices: [],
  };

  // Compute indices
  payload.indices = buildInsuranceDomainIndices(payload);

  if (import.meta.env.MODE === 'development') {
    console.debug("[Insurance Event Factory] Mock event built", {
      vehicleId,
      activePolicyCount,
      lapseCount12m,
      claimCount12m,
      indexCount: payload.indices.length,
    });
  }

  return payload;
}

/**
 * Build a batch of mock insurance events (for testing)
 */
export function buildMockInsuranceEvents(
  vehicleIds: string[],
  timestamp?: string
): InsuranceEventPayload[] {
  return vehicleIds.map((vid) => buildMockInsuranceEvent(vid, timestamp));
}
