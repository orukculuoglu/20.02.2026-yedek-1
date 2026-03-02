/**
 * Insurance Domain Types (PII-Safe)
 * 
 * Models policy status, claims timeline, and coverage risk
 * STRICT: vehicleId only, NO VIN, plate, name, or identity
 */

/**
 * Insurance policy type
 */
export type InsurancePolicyType = "CASCO" | "TRAFFIC" | "UNKNOWN";

/**
 * Insurance policy operational status
 */
export type InsurancePolicyStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "UNKNOWN";

/**
 * Insurance event type (claim, lapse, inquiry)
 */
export type InsuranceEventType = "CLAIM" | "LAPSE" | "INQUIRY";

/**
 * Policy snapshot (point-in-time)
 * Safe to display (no PII)
 */
export interface InsurancePolicySnapshot {
  policyType: InsurancePolicyType;
  status: InsurancePolicyStatus;
  endDate?: string;               // ISO date (YYYY-MM-DD)
  insurerName?: string;           // Company name (safe)
}

/**
 * Insurance event (claim, lapse, inquiry)
 * Represents historical insurance activity
 */
export interface InsuranceEvent {
  type: InsuranceEventType;
  date: string;                   // ISO date
  amountTRY?: number;             // Optional amount (for claims)
  severity?: "minor" | "major";   // Event severity
  meta?: Record<string, any>;     // Custom data (MUST sanitize before display)
}

/**
 * Reason code for index adjustments (explainability)
 */
export interface InsuranceReasonCode {
  code: string;
  severity: "info" | "warn" | "high";
  message: string;
  meta?: Record<string, any>;
}

/**
 * Insurance Domain Aggregate
 * Complete insurance snapshot with derived metrics and coverage risk
 */
export interface InsuranceDomainAggregate {
  vehicleId: string;                          // REQUIRED: Safe identifier only
  policy: InsurancePolicySnapshot;            // Current policy
  events: InsuranceEvent[];                   // Historical events
  derived: {
    claimCount12m: number;                    // Claims in past 365d
    lapseCount12m: number;                    // Lapses in past 365d
    inquiryCount6m: number;                   // Inquiries in past 180d
    lastClaimDate?: string;                   // Most recent claim
  };
  indexes: {
    coverageRiskIndex: number;                // 0-100 (higher = riskier)
  };
  confidence: number;                         // 0-100 (data quality)
  explain?: {
    reasonCodes?: InsuranceReasonCode[];
  };
  generatedAt: string;                        // ISO timestamp
}

/**
 * Input for building insurance aggregate
 * Flexible schema for various data sources
 */
export interface InsuranceDomainInput {
  vehicleId: string;
  policy?: InsurancePolicySnapshot;
  events?: InsuranceEvent[];
  generatedAt: string;
}

/**
 * Event payload for Data Engine emission
 * PII-safe: vehicleId only
 */
export interface InsuranceDomainEventPayload {
  insurance: {
    policyType: InsurancePolicyType;
    status: InsurancePolicyStatus;
    endDate?: string;
    derived: {
      claimCount12m: number;
      lapseCount12m: number;
      inquiryCount6m: number;
      lastClaimDate?: string;
    };
    coverageRiskIndex: number;
    confidence: number;
  };
}
