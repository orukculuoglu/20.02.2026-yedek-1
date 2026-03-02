/**
 * Mock Insurance Adapter
 * Provides insurance data by vehicleId (PII-safe)
 * 
 * NOTE: If raw mock includes plate/VIN, it stays ONLY in this adapter layer.
 * NEVER propagated to aggregate or Data Engine.
 */

import type {
  InsuranceDomainInput,
  InsurancePolicySnapshot,
  InsuranceEvent,
} from "../types";

/**
 * Mock insurance database
 * Raw data MAY include VIN/plate (for realism), but we filter to vehicleId only
 */
const MOCK_INSURANCE_POLICIES: Record<
  string,
  {
    vehicleId: string;
    vin?: string; // Raw data (not propagated)
    plate?: string; // Raw data (not propagated)
    policyType: "CASCO" | "TRAFFIC" | "UNKNOWN";
    policyStatus: "ACTIVE" | "EXPIRED" | "CANCELLED" | "UNKNOWN";
    policyEndDate?: string;
    insurerName?: string;
  }
> = {
  "vehicle-001": {
    vehicleId: "vehicle-001",
    vin: "WBADT43452G928411", // Mock VIN (stays in adapter)
    plate: "34ABC1234", // Mock plate (stays in adapter)
    policyType: "CASCO",
    policyStatus: "ACTIVE",
    policyEndDate: "2026-12-31",
    insurerName: "Acibadem Sigorta",
  },
  "vehicle-002": {
    vehicleId: "vehicle-002",
    vin: "JTHBF5C10E5007123", // Mock VIN
    plate: "06XYZ5678", // Mock plate
    policyType: "TRAFFIC",
    policyStatus: "EXPIRED",
    policyEndDate: "2024-06-30",
    insurerName: "Zurich Sigorta",
  },
  "vehicle-003": {
    vehicleId: "vehicle-003",
    policyType: "UNKNOWN",
    policyStatus: "UNKNOWN",
  },
};

/**
 * Mock insurance events (claims, lapses, inquiries)
 */
const MOCK_INSURANCE_EVENTS: Record<string, InsuranceEvent[]> = {
  "vehicle-001": [
    {
      type: "CLAIM",
      date: "2024-11-15",
      amountTRY: 25000,
      severity: "major",
      meta: { description: "Collision damage" },
    },
    {
      type: "INQUIRY",
      date: "2024-12-01",
      severity: "minor",
      meta: { description: "Coverage consultation" },
    },
    {
      type: "INQUIRY",
      date: "2024-12-10",
      severity: "minor",
      meta: { description: "Claim status check" },
    },
  ],
  "vehicle-002": [
    {
      type: "LAPSE",
      date: "2024-07-01",
      severity: "major",
      meta: { description: "Policy lapsed due to non-renewal" },
    },
    {
      type: "CLAIM",
      date: "2024-03-20",
      amountTRY: 15000,
      severity: "major",
      meta: { description: "Theft partial" },
    },
    {
      type: "CLAIM",
      date: "2024-09-05",
      amountTRY: 8000,
      severity: "minor",
      meta: { description: "Glass damage" },
    },
    {
      type: "LAPSE",
      date: "2024-10-15",
      severity: "major",
      meta: { description: "Policy lapsed again" },
    },
  ],
  "vehicle-003": [],
};

/**
 * Get insurance domain input for a vehicle
 * 
 * Filters data: vehicleId only, no VIN/plate propagation
 */
export function getInsuranceDomainInput(
  vehicleId: string,
  timestamp: string = new Date().toISOString()
): InsuranceDomainInput {
  // Look up policy by vehicleId (NOT by VIN/plate)
  const policyData = MOCK_INSURANCE_POLICIES[vehicleId];
  const eventsData = MOCK_INSURANCE_EVENTS[vehicleId] ?? [];

  // Build policy snapshot (PII-safe: type, status, endDate, insurer name only)
  let policy: InsurancePolicySnapshot | undefined;
  if (policyData) {
    policy = {
      policyType: policyData.policyType,
      status: policyData.policyStatus,
      endDate: policyData.policyEndDate,
      insurerName: policyData.insurerName,
      // VIN and plate stay INSIDE adapter - NOT propagated
    };
  }

  if (import.meta.env.DEV) {
    console.debug("[Mock Insurance Adapter] Loaded for vehicleId", {
      vehicleId,
      hasPolicyData: !!policyData,
      eventCount: eventsData.length,
      // VIN/plate NOT logged
    });
  }

  return {
    vehicleId,
    policy,
    events: eventsData,
    generatedAt: timestamp,
  };
}

/**
 * Register a test vehicle (DEV utility)
 * For testing with custom data
 */
export function registerMockVehicle(
  vehicleId: string,
  policy: InsurancePolicySnapshot,
  events?: InsuranceEvent[]
): void {
  MOCK_INSURANCE_POLICIES[vehicleId] = {
    vehicleId,
    policyType: policy.policyType,
    policyStatus: policy.status,
    policyEndDate: policy.endDate,
    insurerName: policy.insurerName,
  };
  MOCK_INSURANCE_EVENTS[vehicleId] = events ?? [];

  if (import.meta.env.DEV) {
    console.debug("[Mock Insurance Adapter] Registered test vehicle", {
      vehicleId,
    });
  }
}

/**
 * Clear mock data (DEV utility)
 */
export function clearMockInsuranceData(): void {
  Object.keys(MOCK_INSURANCE_POLICIES).forEach((key) => {
    if (key.startsWith("vehicle-")) delete MOCK_INSURANCE_POLICIES[key];
    if (key.startsWith("vehicle-")) delete MOCK_INSURANCE_EVENTS[key];
  });
}
