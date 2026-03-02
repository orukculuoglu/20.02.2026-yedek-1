/**
 * Market Valuation Domain Types
 * PII-safe models for resale value, price bands, and depreciation tracking
 * 
 * Key constraint: No VIN, plate, or personal identifiers
 * Subject identification uses vehicleId only
 */

/**
 * Source of valuation data
 */
export type ValuationSource = "MOCK" | "MARKET_API" | "INTERNAL_MODEL";

/**
 * Input parameters for valuation calculation
 * Combines vehicle specs with risk indicators
 */
export interface ValuationInput {
  vehicleId: string;
  brand?: string;
  model?: string;
  year?: number;
  mileageKm?: number;
  trustIndex?: number;            // Risk domain: 0-100
  reliabilityIndex?: number;      // Risk domain: 0-100
  structuralRisk?: number;        // Risk domain: 0-100
  insuranceRisk?: number;         // Insurance domain: 0-100
  generatedAt: string;            // ISO 8601 timestamp
}

/**
 * Price band representation
 * Defines valuation range in TRY
 */
export interface PriceBand {
  low: number;                    // Low estimate
  median: number;                 // Central estimate
  high: number;                   // High estimate
  currency: "TRY";
}

/**
 * Depreciation tracking point
 * Represents value at a historical month
 */
export interface DepreciationPoint {
  month: string;                  // ISO YYYY-MM format
  value: number;                  // Value in TRY
}

/**
 * Reason code for valuation adjustments
 * Explains confidence and adjustments applied
 */
export interface ValuationReasonCode {
  code: string;
  severity: "info" | "warn" | "high";
  message: string;
  meta?: Record<string, any>;
}

/**
 * Market Valuation Aggregate
 * Complete valuation snapshot with confidence and reasoning
 */
export interface MarketValuationAggregate {
  vehicleId: string;
  source: ValuationSource;
  priceBand: PriceBand;
  resaleValue: number;            // TRY, typically equals median
  depreciation12m: DepreciationPoint[];
  confidence: number;              // 0-100 confidence score
  explain?: {
    reasonCodes?: ValuationReasonCode[];
  };
  generatedAt: string;            // ISO 8601 timestamp
}

/**
 * Valuation event payload
 * Minimal PII-safe data for event emission
 */
export interface MarketValuationEventPayload {
  resaleValueTRY: number;
  band: {
    low: number;
    median: number;
    high: number;
    currency: "TRY";
  };
  confidence: number;
  source: ValuationSource;
}
