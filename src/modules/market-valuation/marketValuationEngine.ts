/**
 * Market Valuation Engine
 * Calculates resale value, price bands, and depreciation curves
 * 
 * Pricing methodology:
 * - Base median by year band
 * - Mileage adjustment (condition indicator)
 * - Risk adjustment (soft penalty)
 * - Price band derivation
 * - 12-month depreciation curve
 * - Confidence scoring
 */

import type {
  ValuationInput,
  MarketValuationAggregate,
  PriceBand,
  DepreciationPoint,
  ValuationReasonCode,
} from "./types";

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get base median value by year
 * Returns values in TRY
 */
function getBaseMedianByYear(year?: number): number {
  if (!year) return 1_200_000;

  if (year >= 2023) return 1_600_000;
  if (year >= 2021) return 1_350_000;
  if (year >= 2019) return 1_150_000;
  return 900_000;
}

/**
 * Calculate mileage adjustment factor
 * Returns (adjustedValue, reasonCode if applicable)
 */
function getMileageAdjustment(
  basMedian: number,
  mileageKm?: number
): { adjusted: number; reasonCode?: ValuationReasonCode } {
  if (!mileageKm) {
    return {
      adjusted: basMedian,
      reasonCode: {
        code: "MISSING_MILEAGE",
        severity: "warn",
        message: "Mileage not provided; no condition adjustment applied",
      },
    };
  }

  let factor = 1.0;

  if (mileageKm <= 30_000) {
    factor = 1.06; // +6%
  } else if (mileageKm <= 80_000) {
    factor = 1.0; // No change
  } else if (mileageKm <= 140_000) {
    factor = 0.93; // -7%
  } else {
    factor = 0.88; // -12%
  }

  return {
    adjusted: Math.round(basMedian * factor),
  };
}

/**
 * Apply risk adjustments
 * Returns (adjustedValue, reasonCodes for each adjustment)
 */
function applyRiskAdjustments(
  baseValue: number,
  input: ValuationInput
): { adjusted: number; reasonCodes: ValuationReasonCode[] } {
  let adjustedValue = baseValue;
  const reasonCodes: ValuationReasonCode[] = [];

  // Trust index penalty
  if (input.trustIndex !== undefined && input.trustIndex <= 50) {
    const penalty = Math.round(adjustedValue * 0.06);
    adjustedValue -= penalty;
    reasonCodes.push({
      code: "LOW_TRUST_INDEX",
      severity: "warn",
      message: `Trust index ${input.trustIndex} indicates risk; -6% applied`,
      meta: { trustIndex: input.trustIndex, penaltyTRY: penalty },
    });
  }

  // Reliability index penalty
  if (input.reliabilityIndex !== undefined && input.reliabilityIndex <= 60) {
    const penalty = Math.round(adjustedValue * 0.04);
    adjustedValue -= penalty;
    reasonCodes.push({
      code: "LOW_RELIABILITY",
      severity: "warn",
      message: `Reliability index ${input.reliabilityIndex} indicates wear; -4% applied`,
      meta: { reliabilityIndex: input.reliabilityIndex, penaltyTRY: penalty },
    });
  }

  // Structural risk penalty
  if (input.structuralRisk !== undefined && input.structuralRisk >= 50) {
    const penalty = Math.round(adjustedValue * 0.08);
    adjustedValue -= penalty;
    reasonCodes.push({
      code: "HIGH_STRUCTURAL_RISK",
      severity: "high",
      message: `Structural risk ${input.structuralRisk} detected; -8% applied`,
      meta: { structuralRisk: input.structuralRisk, penaltyTRY: penalty },
    });
  }

  // Insurance risk penalty
  if (input.insuranceRisk !== undefined && input.insuranceRisk >= 60) {
    const penalty = Math.round(adjustedValue * 0.05);
    adjustedValue -= penalty;
    reasonCodes.push({
      code: "HIGH_INSURANCE_RISK",
      severity: "warn",
      message: `Insurance fraud risk ${input.insuranceRisk} detected; -5% applied`,
      meta: { insuranceRisk: input.insuranceRisk, penaltyTRY: penalty },
    });
  }

  return {
    adjusted: clamp(adjustedValue, 500_000, 2_500_000),
    reasonCodes,
  };
}

/**
 * Build price band from median
 * low = median * 0.92
 * high = median * 1.08
 */
function buildPriceBand(median: number): PriceBand {
  return {
    low: Math.round(median * 0.92),
    median,
    high: Math.round(median * 1.08),
    currency: "TRY",
  };
}

/**
 * Generate 12-month depreciation curve
 * Starting 11 months ago at median/0.94, ending today at median
 * Linear interpolation
 */
function generateDepreciation12m(
  median: number,
  currentDate: string
): DepreciationPoint[] {
  const points: DepreciationPoint[] = [];
  const date = new Date(currentDate);

  // Start value (11 months ago, assumed 6% more valuable)
  const startValue = Math.round(median / 0.94);

  for (let i = 11; i >= 0; i--) {
    const pointDate = new Date(date);
    pointDate.setMonth(pointDate.getMonth() - i);

    // Linear interpolation: start at startValue, end at median
    const progress = (11 - i) / 11;
    const value = Math.round(startValue + (median - startValue) * progress);

    points.push({
      month: pointDate.toISOString().slice(0, 7), // YYYY-MM
      value,
    });
  }

  return points;
}

/**
 * Calculate confidence score (0-100)
 * Starts at 70, penalties for missing data
 */
function calculateConfidence(input: ValuationInput): {
  score: number;
  reasonCode?: ValuationReasonCode;
} {
  let score = 70;

  // Missing year penalty
  if (!input.year) {
    score -= 15;
  }

  // Missing mileage penalty
  if (!input.mileageKm) {
    score -= 10;
  }

  // Missing risk indicators penalty
  if (!input.trustIndex) {
    score -= 5;
  }

  score = clamp(score, 0, 100);

  let reasonCode: ValuationReasonCode | undefined;
  if (score < 55) {
    reasonCode = {
      code: "LOW_CONFIDENCE_INPUT_GAPS",
      severity: "warn",
      message: `Confidence only ${score}% due to missing input data`,
      meta: { gaps: { year: !input.year, mileage: !input.mileageKm, trustIndex: !input.trustIndex } },
    };
  }

  return { score, reasonCode };
}

/**
 * Build market valuation aggregate
 * 
 * Main entry point for valuation engine
 * Returns complete pricing snapshot with depreciation and reasoning
 */
export function buildMarketValuationAggregate(
  input: ValuationInput
): MarketValuationAggregate {
  const allReasonCodes: ValuationReasonCode[] = [];

  // Step 1: Base median by year
  const baseMedian = getBaseMedianByYear(input.year);

  // Step 2: Mileage adjustment
  const { adjusted: mileageAdjusted, reasonCode: mileageReason } =
    getMileageAdjustment(baseMedian, input.mileageKm);

  if (mileageReason) {
    allReasonCodes.push(mileageReason);
  }

  // Step 3: Risk adjustments
  const { adjusted: finalMedian, reasonCodes: riskReasons } = applyRiskAdjustments(
    mileageAdjusted,
    input
  );

  allReasonCodes.push(...riskReasons);

  // Step 4: Build price band
  const priceBand = buildPriceBand(finalMedian);

  // Step 5: Generate depreciation curve
  const depreciation12m = generateDepreciation12m(finalMedian, input.generatedAt);

  // Step 6: Confidence score
  const { score: confidence, reasonCode: confidenceReason } = calculateConfidence(input);

  if (confidenceReason) {
    allReasonCodes.push(confidenceReason);
  }

  if (import.meta.env.DEV) {
    console.debug("[Market Valuation] Aggregate built", {
      vehicleId: input.vehicleId,
      baseMedian,
      mileageAdjusted,
      finalMedian,
      confidence,
      reasonCodeCount: allReasonCodes.length,
    });
  }

  return {
    vehicleId: input.vehicleId,
    source: "MOCK",
    priceBand,
    resaleValue: finalMedian,
    depreciation12m,
    confidence,
    explain: allReasonCodes.length > 0 ? { reasonCodes: allReasonCodes } : undefined,
    generatedAt: input.generatedAt,
  };
}

/**
 * Normalize TRY value to 0-100 scale
 * Band: 600k-2.5M TRY
 */
export function normalizeTRYToIndex(tryValue: number): number {
  const MIN_BAND = 600_000;
  const MAX_BAND = 2_500_000;

  if (tryValue <= MIN_BAND) return 0;
  if (tryValue >= MAX_BAND) return 100;

  return Math.round(((tryValue - MIN_BAND) / (MAX_BAND - MIN_BAND)) * 100);
}
