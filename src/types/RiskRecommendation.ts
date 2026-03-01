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

export interface RiskRecommendation {
  id: string;
  vehicleId: string;
  actionType: ActionType;
  priorityScore: number; // 0-100, where 100 = most critical
  recommendation: string; // Actionable recommendation message (Turkish)
  reason: string; // Why this recommendation was generated
  reasonCodes?: string[]; // Associated reason codes if available
  explain?: string[]; // Optional detailed explanation (max 3 items)
  generatedAt: string; // ISO 8601 timestamp
  source: "DATA_ENGINE";
}

export interface RecommendationInput {
  vehicleId: string;
  trustIndex?: number;
  reliabilityIndex?: number;
  maintenanceDiscipline?: number;
  reasonCodes?: Array<{
    code: string;
    severity?: string;
    message?: string;
  }>;
  signals?: Array<{
    code: string;
    severity?: string;
    confidence?: number;
  }>;
  evidenceSourcesCount?: number;
}
