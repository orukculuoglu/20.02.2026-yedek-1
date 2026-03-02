/**
 * Mock Insurance Data Provider
 * Generates deterministic insurance data for testing and demo
 * 
 * Data is derived from vehicleId hash for reproducibility
 * No randomness - same vehicleId always produces same data
 */

import type { InsurancePolicy, InsuranceClaim } from "./types";

/**
 * Simple deterministic hash from string
 * Used for seeding mock data generation
 */
function hashVehicleId(vehicleId: string): number {
  let hash = 0;

  for (let i = 0; i < vehicleId.length; i++) {
    const char = vehicleId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash);
}

/**
 * Generate deterministic mock policies for a vehicle
 * Distribution based on vehicleId
 */
function generateMockPolicies(vehicleId: string): InsurancePolicy[] {
  const seed = hashVehicleId(vehicleId);
  const now = new Date();

  // Determine number of policies based on hash
  const policyCount = (seed % 3) + 1; // 1-3 policies

  const policies: InsurancePolicy[] = [];
  const providers = ["Sigorta A", "Sigorta B", "Sigorta C", "Sigorta D"];

  for (let i = 0; i < policyCount; i++) {
    const providerIdx = (seed + i) % providers.length;
    const monthOffset = (seed + i * 10) % 24; // 0-23 months back

    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - monthOffset);

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Determine status
    let status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "LAPSED" = "ACTIVE";
    if (endDate < now) {
      status = "EXPIRED";
    }
    if ((seed + i) % 7 === 0) {
      status = "CANCELLED";
    }

    policies.push({
      policyId: `POL-${vehicleId.substring(0, 8)}-${i}`,
      provider: providers[providerIdx],
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      status,
      coverageType:
        (seed + i) % 3 === 0 ? "FULL" : (seed + i) % 3 === 1 ? "TRAFFIC" : "UNKNOWN",
    });
  }

  return policies;
}

/**
 * Generate deterministic mock claims for a vehicle
 * Distribution and timing based on vehicleId
 */
function generateMockClaims(vehicleId: string): InsuranceClaim[] {
  const seed = hashVehicleId(vehicleId);
  const now = new Date();

  // Determine number of claims
  const claimCount = (seed % 6); // 0-5 claims

  const claims: InsuranceClaim[] = [];
  const claimTypes = ["COLLISION", "THEFT", "FIRE", "VANDALISM", "OTHER"];

  for (let i = 0; i < claimCount; i++) {
    const typeIdx = (seed + i) % claimTypes.length;
    const daysBack = (seed + i * 15) % 365; // 0-365 days back

    const claimDate = new Date(now);
    claimDate.setDate(claimDate.getDate() - daysBack);

    const amount = claimCount > 0 ? (seed + i) % 50000 + 5000 : undefined;
    const approved = (seed + i) % 2 === 0;

    claims.push({
      claimId: `CLM-${vehicleId.substring(0, 8)}-${i}`,
      claimDate: claimDate.toISOString().split("T")[0],
      claimAmount: amount,
      claimType: claimTypes[typeIdx],
      approved,
    });
  }

  return claims;
}

/**
 * Get mock insurance data for a vehicle
 * 
 * Returns deterministic policies and claims based on vehicleId
 * Same vehicleId always produces same output
 */
export function getMockInsuranceData(
  vehicleId: string
): {
  policies: InsurancePolicy[];
  claims: InsuranceClaim[];
} {
  const policies = generateMockPolicies(vehicleId);
  const claims = generateMockClaims(vehicleId);

  if (import.meta.env.DEV) {
    console.debug("[Insurance Mock] Generated data", {
      vehicleId,
      policyCount: policies.length,
      claimCount: claims.length,
    });
  }

  return { policies, claims };
}

/**
 * Get sample vehicle IDs for testing
 * DEV utility
 */
export function getSampleVehicleIds(): string[] {
  return [
    "VEH-001-SEDAN-BLUE",
    "VEH-002-SUV-RED",
    "VEH-003-PICKUP-BLACK",
    "VEH-004-COUPE-WHITE",
    "VEH-005-HATCHBACK-GRAY",
  ];
}
