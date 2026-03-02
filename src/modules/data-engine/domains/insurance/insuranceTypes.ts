/**
 * Insurance Domain Types
 * Contract for insurance indices and events in Data Engine
 * 
 * STRICT PII: vehicleId ONLY, NO VIN, plate, phone, email, identity numbers
 */

import type { DataEngineIndex } from "../../contracts/dataEngineApiContract";

/**
 * Insurance-specific index keys
 */
export type InsuranceIndexKey =
  | "policyContinuityIndex"      // 0-100: penalizes coverage lapses
  | "claimFrequencyIndex"         // 0-100: penalizes claim frequency
  | "coverageAdequacyIndex"       // 0-100: policy coverage adequacy
  | "fraudLikelihoodIndex";       // 0-100: fraud risk signal

/**
 * Insurance index (extends DataEngineIndex)
 * PII-safe: domain='insurance', vehicleId only in parent payload
 */
export interface InsuranceIndex extends DataEngineIndex {
  domain: "insurance";
  key: InsuranceIndexKey;
  value: number;                  // 0-100
  confidence: number;             // 0-100
  updatedAt: string;              // ISO 8601
  meta?: {
    calculationMethod?: string;
    ruleCount?: number;
    adjustments?: Array<{
      reason: string;
      delta: number;
    }>;
    [key: string]: any;
  };
}

/**
 * Insurance signal (finding/anomaly)
 */
export interface InsuranceSignal {
  code: string;                   // e.g., "MULTIPLE_CLAIMS", "POLICY_LAPSE"
  severity: "low" | "medium" | "high";
  confidence: number;             // 0-100
  meta?: Record<string, any>;
}

/**
 * Insurance event payload (PII-safe)
 * Ready for Data Engine ingestion
 */
export interface InsuranceEventPayload {
  vehicleId: string;              // ONLY identifier: safe
  generatedAt: string;            // ISO 8601 timestamp
  
  provider?: "SBM" | "INSURER" | "BROKER" | "UNKNOWN";  // Data source
  
  policySummary?: {
    activePolicyCount: number;    // Number of active policies
    lapseCount12m: number;        // Lapsed/expired in 12 months
    totalPolicyCoverage?: number; // Aggregate coverage (TRY)
  };
  
  claimSummary?: {
    claimCount12m: number;        // Claims filed in 12 months
    totalClaimAmount12m?: number; // Aggregate amount (TRY)
    settledClaimCount?: number;   // Resolved claims
  };
  
  signals?: InsuranceSignal[];    // Detected anomalies/risks
  
  indices: InsuranceIndex[];      // Computed indices (vectorized)
  
  trace?: {
    eventId?: string;             // Unique event ID
    source?: string;              // Data source identifier
    version?: string;             // Contract version (e.g., "1.0")
  };
}

/**
 * Request to get insurance domain indices
 */
export interface GetInsuranceIndicesRequest {
  vehicleId: string;
  generatedAt?: string;           // Optional override timestamp
}
