/**
 * Risk Recommendation Types
 * Enterprise-grade structured recommendation model for risk management
 * All vehicle references use vehicleId only (no VIN/Plate)
 */

export type ActionType =
  | "MAINTENANCE_CHECK"
  | "INSURANCE_REVIEW"
  | "DIAGNOSTIC_CHECK"
  | "DATA_QUALITY_REVIEW"
  | "NONE";

export type CodeSeverity = "high" | "warn" | "info";

export interface StructuredReasonCode {
  code: string;           // Canonical code (deduplicated, normalized)
  severity: CodeSeverity; // high | warn | info
  message?: string;       // Optional descriptive message
  meta?: Record<string, any>; // Rich metadata (e.g., correlationScore, matchedEvents)
}

export interface RiskRecommendation {
  id: string;
  vehicleId: string;
  actionType: ActionType;
  priorityScore: number; // 0-100, where 100 = most critical
  recommendation: string; // Actionable recommendation message (Turkish), 1 line
  reason: string; // Why this recommendation was generated, 1 line
  reasonCodes?: StructuredReasonCode[]; // Normalized, deduplicated reason codes with severity
  explain?: string[]; // Optional detailed explanation (max 3 items, why this action matters)
  evidence?: {
    indexes?: Record<string, any>; // e.g., trustIndex, reliabilityIndex values
    signals?: Record<string, any>; // e.g., insurance signals, KM anomaly signals
  };
  generatedAt: string; // ISO 8601 timestamp
  source: "DATA_ENGINE";
}

export interface RecommendationInput {
  vehicleId: string;
  trustIndex?: number;
  reliabilityIndex?: number;
  maintenanceDiscipline?: number;
  insuranceRisk?: number;
  reasonCodes?: Array<{
    code: string;
    severity?: CodeSeverity;
    message?: string;
    meta?: Record<string, any>;
  }>;
  signals?: Array<{
    code: string;
    severity?: CodeSeverity;
    confidence?: number;
    meta?: Record<string, any>;
  }>;
  evidenceSourcesCount?: number;
  indices?: Record<string, any>; // For evidence field
  signals_agg?: Record<string, any>; // For evidence field
}
