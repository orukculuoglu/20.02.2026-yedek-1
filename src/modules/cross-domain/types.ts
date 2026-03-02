/**
 * Cross-Domain Fusion Types
 * Contracts for Insurance ↔ Expertize/Risk integration
 * 
 * STRICT PII: vehicleId only, NO VIN/plate/identity
 */

/**
 * Source domain identifier
 */
export type DomainSource = "EXPERTISE" | "INSURANCE_DOMAIN" | "RISK_ENGINE" | "DATA_ENGINE";

/**
 * Cross-domain context aggregating key metrics from all domains
 * Used for fusion scoring and converging risk signals
 */
export interface CrossDomainContext {
  vehicleId: string;
  
  // Risk domain metrics (from DataEngineIndex)
  risk?: {
    trustIndex?: number;                  // 0-100
    reliabilityIndex?: number;            // 0-100
    maintenanceDiscipline?: number;       // 0-100
    insuranceRisk?: number;               // 0-100
    structuralRisk?: number;              // 0-100
    mechanicalRisk?: number;              // 0-100
    confidenceAvg?: number;               // 0-100
    reasonCodes?: Array<{
      code: string;
      severity?: string;
      message?: string;
    }>;
  };
  
  // Insurance domain metrics (from InsuranceDomainAggregate)
  insurance?: {
    coverageRiskIndex?: number;           // 0-100
    policyStatus?: "ACTIVE" | "EXPIRED" | "CANCELLED" | "UNKNOWN";
    claimCount12m?: number;
    lapseCount12m?: number;
    confidence?: number;                  // 0-100
    reasonCodes?: Array<{
      code: string;
      severity?: string;
      message?: string;
    }>;
  };
  
  generatedAt: string;                    // ISO 8601 timestamp
}

/**
 * Finding from cross-domain analysis
 */
export interface CrossDomainFinding {
  code: string;                           // e.g., "CLAIMS_WITHOUT_DAMAGE_RISK"
  severity: "info" | "warn" | "high";
  message: string;
  meta?: Record<string, any>;             // Custom data (sanitize before UI display)
}

/**
 * Cross-domain fusion analysis result
 */
export interface CrossDomainFusionResult {
  vehicleId: string;
  findings: CrossDomainFinding[];
  fusionScore: number;                    // 0-100 (higher = more suspicious/anomalous)
  confidence: number;                     // 0-100 (data quality signal)
  generatedAt: string;                    // ISO 8601 timestamp
}

/**
 * Cross-domain fusion event payload for Data Engine
 */
export interface CrossDomainFusionEventPayload {
  fusionScore: number;
  confidence: number;
  findings: Array<{
    code: string;
    severity: string;
    message: string;
  }>;
  riskMetrics?: Record<string, number>;
  insuranceMetrics?: Record<string, number>;
}
