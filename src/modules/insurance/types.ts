/**
 * Insurance Domain Types
 * PII-safe models for policy, claims, and fraud risk assessment
 * 
 * Key constraint: No VIN, plate, or personal identifiers
 * Subject identification uses vehicleId only
 */

/**
 * Insurance policy status enumeration
 */
export type InsurancePolicyStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "LAPSED";

/**
 * Insurance policy representation
 * Contains coverage info and validity period
 */
export interface InsurancePolicy {
  policyId: string;           // Policy identifier
  provider: string;            // Insurance company name
  startDate: string;           // ISO 8601 date
  endDate: string;             // ISO 8601 date
  status: InsurancePolicyStatus;
  coverageType: "TRAFFIC" | "FULL" | "UNKNOWN";
}

/**
 * Insurance claim record
 * Represents a claim event against a policy
 */
export interface InsuranceClaim {
  claimId: string;            // Claim identifier
  claimDate: string;          // ISO 8601 date
  claimAmount?: number;       // Claim amount in local currency
  claimType?: string;         // Type of claim (e.g., "COLLISION", "THEFT")
  approved: boolean;          // Approval status
}

/**
 * Insurance Domain Aggregate
 * Calculated snapshot of insurance posture for a vehicle
 * Used for fraud risk scoring and coverage analysis
 */
export interface InsuranceDomainAggregate {
  vehicleId: string;                    // Vehicle identifier (NO VIN/PLATE)
  policies: InsurancePolicy[];          // Active and historical policies
  claims: InsuranceClaim[];             // Associated claims
  fraudRiskScore: number;               // 0–100 scale
  coverageContinuityScore: number;      // 0–100 scale
  claimFrequencyScore: number;          // 0–100 scale
  generatedAt: string;                  // ISO 8601 timestamp
}

/**
 * Insurance-specific metadata for telemetry
 */
export interface InsuranceEventPayload {
  fraudRiskScore: number;
  coverageContinuityScore: number;
  claimFrequencyScore: number;
  policyCount: number;
  claimCount: number;
}
