/**
 * PHASE 8.3: Composite Vehicle Score Calculation
 * 
 * Unifies risk, insurance, and part domain metrics into a single authoritative score.
 * Single Source of Truth: VehicleState Snapshot
 * 
 * Formula:
 * - Risk Component (50% weight): trust, reliability, maintenance discipline, structural/mechanical/insurance risk
 * - Insurance Component (30% weight): continuity, claim frequency, coverage adequacy, fraud likelihood
 * - Part Component (20% weight): critical parts count, supply stress, price volatility, estimated maintenance cost
 * 
 * Final Score: 0-100, deterministic, replay-safe
 */

import type { VehicleStateSnapshot } from '../../../modules/vehicle-state/vehicleStateSnapshotStore';

/**
 * Result type for composite vehicle score calculation
 */
export type CompositeVehicleScoreResult = {
  score: number; // 0-100, main authoritative score
  level: 'high-risk' | 'medium-risk' | 'low-risk'; // Risk categorization
  breakdown: {
    risk: number; // 0-100, risk component contribution
    insurance: number; // 0-100, insurance component contribution
    part: number; // 0-100, part component contribution
  };
  reasons: string[]; // Top risk reasons (max 5)
  version: string; // Formula version
  updatedAt: string; // ISO timestamp
};

/**
 * Scoring constants and thresholds
 */
const SCORING_CONFIG = {
  // Component weights
  RISK_WEIGHT: 0.5,
  INSURANCE_WEIGHT: 0.3,
  PART_WEIGHT: 0.2,

  // Risk component breakdown
  RISK_TRUST_WEIGHT: 0.35,
  RISK_RELIABILITY_WEIGHT: 0.25,
  RISK_MAINTENANCE_WEIGHT: 0.2,
  RISK_STRUCTURAL_WEIGHT: 0.2,

  // Insurance component breakdown
  INSURANCE_CONTINUITY_WEIGHT: 0.3,
  INSURANCE_CLAIM_WEIGHT: 0.25,
  INSURANCE_COVERAGE_WEIGHT: 0.2,
  INSURANCE_FRAUD_WEIGHT: 0.25,

  // Part component breakdown
  PART_CRITICAL_WEIGHT: 0.3,
  PART_SUPPLY_WEIGHT: 0.3,
  PART_VOLATILITY_WEIGHT: 0.2,
  PART_COST_WEIGHT: 0.2,

  // Risk level thresholds
  HIGH_RISK_THRESHOLD: 30,
  MEDIUM_RISK_THRESHOLD: 60,

  // Critical parts scoring
  CRITICAL_PARTS_MULTIPLIER: 15, // Each critical part reduces score by 15

  // Estimated cost thresholds (for normalization)
  ESTIMATED_COST_MAX: 10000, // Baseline max cost for 0 points
};

/**
 * Extract a metric value from snapshot by key name
 * Searches across all domains (risk, insurance, part)
 */
function extractMetricValue(
  snapshot: VehicleStateSnapshot | null,
  metricKey: string,
  defaultValue: number = 0
): number {
  if (!snapshot) return defaultValue;

  // Search in risk domain
  if (snapshot.risk?.indices) {
    const found = snapshot.risk.indices.find((idx) => idx.key === metricKey);
    if (found !== undefined) return found.value;
  }

  // Search in insurance domain
  if (snapshot.insurance?.indices) {
    const found = snapshot.insurance.indices.find((idx) => idx.key === metricKey);
    if (found !== undefined) return found.value;
  }

  // Search in part domain
  if (snapshot.part?.indices) {
    const found = snapshot.part.indices.find((idx) => idx.key === metricKey);
    if (found !== undefined) return found.value;
  }

  return defaultValue;
}

/**
 * Clamp value between 0 and 100
 */
function clamp(value: number, min = 0, max = 100): number {
  return Math.max(Math.min(value, max), min);
}

/**
 * Calculate Risk Component
 * Weights: trust (35%), reliability (25%), maintenance (20%), inverse structural/mechanical/insurance (20%)
 */
function calculateRiskComponent(snapshot: VehicleStateSnapshot): number {
  const trustIndex = extractMetricValue(snapshot, 'trustIndex', 0);
  const reliabilityIndex = extractMetricValue(snapshot, 'reliabilityIndex', 0);
  const maintenanceDiscipline = extractMetricValue(snapshot, 'maintenanceDiscipline', 0);
  const structuralRisk = extractMetricValue(snapshot, 'structuralRisk', 0);
  const mechanicalRisk = extractMetricValue(snapshot, 'mechanicalRisk', 0);
  const insuranceRisk = extractMetricValue(snapshot, 'insuranceRisk', 0);

  // Average the risk metrics and invert (higher risk = lower score)
  const averageRisk = (structuralRisk + mechanicalRisk + insuranceRisk) / 3;
  const inverseRisk = 100 - averageRisk;

  const component =
    SCORING_CONFIG.RISK_TRUST_WEIGHT * trustIndex +
    SCORING_CONFIG.RISK_RELIABILITY_WEIGHT * reliabilityIndex +
    SCORING_CONFIG.RISK_MAINTENANCE_WEIGHT * maintenanceDiscipline +
    SCORING_CONFIG.RISK_STRUCTURAL_WEIGHT * inverseRisk;

  return clamp(component);
}

/**
 * Calculate Insurance Component
 * Weights: continuity (30%), claim frequency (25%), coverage (20%), inverse fraud (25%)
 */
function calculateInsuranceComponent(snapshot: VehicleStateSnapshot): number {
  const policyContinuityIndex = extractMetricValue(snapshot, 'policyContinuityIndex', 0);
  const claimFrequencyIndex = extractMetricValue(snapshot, 'claimFrequencyIndex', 0);
  const coverageAdequacyIndex = extractMetricValue(snapshot, 'coverageAdequacyIndex', 0);
  const fraudLikelihoodIndex = extractMetricValue(snapshot, 'fraudLikelihoodIndex', 0);

  const component =
    SCORING_CONFIG.INSURANCE_CONTINUITY_WEIGHT * policyContinuityIndex +
    SCORING_CONFIG.INSURANCE_CLAIM_WEIGHT * (100 - claimFrequencyIndex) +
    SCORING_CONFIG.INSURANCE_COVERAGE_WEIGHT * coverageAdequacyIndex +
    SCORING_CONFIG.INSURANCE_FRAUD_WEIGHT * (100 - fraudLikelihoodIndex);

  return clamp(component);
}

/**
 * Calculate Part Component
 * Considers: critical parts count, supply stress, price volatility, estimated maintenance cost
 */
function calculatePartComponent(snapshot: VehicleStateSnapshot): number {
  const criticalPartsCount = extractMetricValue(snapshot, 'criticalPartsCount', 0);
  const supplyStressIndex = extractMetricValue(snapshot, 'supplyStressIndex', 0);
  const priceVolatilityIndex = extractMetricValue(snapshot, 'priceVolatilityIndex', 0);
  const estimatedMaintenanceCost = extractMetricValue(snapshot, 'estimatedMaintenanceCost', 0);

  // Critical parts score: reduces by MULTIPLIER per critical part
  const criticalPartsScore = clamp(100 - criticalPartsCount * SCORING_CONFIG.CRITICAL_PARTS_MULTIPLIER);

  // Estimated cost score: normalize to 0-100 based on max threshold
  const estimatedCostScore = clamp(100 - (estimatedMaintenanceCost / SCORING_CONFIG.ESTIMATED_COST_MAX) * 100);

  const component =
    SCORING_CONFIG.PART_CRITICAL_WEIGHT * criticalPartsScore +
    SCORING_CONFIG.PART_SUPPLY_WEIGHT * (100 - supplyStressIndex) +
    SCORING_CONFIG.PART_VOLATILITY_WEIGHT * (100 - priceVolatilityIndex) +
    SCORING_CONFIG.PART_COST_WEIGHT * estimatedCostScore;

  return clamp(component);
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score: number): 'high-risk' | 'medium-risk' | 'low-risk' {
  if (score <= SCORING_CONFIG.HIGH_RISK_THRESHOLD) return 'high-risk';
  if (score <= SCORING_CONFIG.MEDIUM_RISK_THRESHOLD) return 'medium-risk';
  return 'low-risk';
}

/**
 * Generate reason codes based on metric thresholds
 * Returns up to 5 top reasons for current score
 */
function generateReasonCodes(snapshot: VehicleStateSnapshot): string[] {
  const reasons: string[] = [];

  const trustIndex = extractMetricValue(snapshot, 'trustIndex', 0);
  const reliabilityIndex = extractMetricValue(snapshot, 'reliabilityIndex', 0);
  const maintenanceDiscipline = extractMetricValue(snapshot, 'maintenanceDiscipline', 0);
  const structuralRisk = extractMetricValue(snapshot, 'structuralRisk', 0);
  const mechanicalRisk = extractMetricValue(snapshot, 'mechanicalRisk', 0);
  const fraudLikelihoodIndex = extractMetricValue(snapshot, 'fraudLikelihoodIndex', 0);
  const criticalPartsCount = extractMetricValue(snapshot, 'criticalPartsCount', 0);
  const estimatedMaintenanceCost = extractMetricValue(snapshot, 'estimatedMaintenanceCost', 0);

  // Risk reasons
  if (trustIndex < 30) {
    reasons.push('Düşük güven endeksi');
  }
  if (reliabilityIndex < 40) {
    reasons.push('Düşük güvenilirlik');
  }
  if (maintenanceDiscipline < 40) {
    reasons.push('Bakım disiplini yetersiz');
  }
  if (structuralRisk > 60) {
    reasons.push('Yapısal risk yüksek');
  }
  if (mechanicalRisk > 60) {
    reasons.push('Mekanik risk yüksek');
  }

  // Insurance reasons
  if (fraudLikelihoodIndex > 60) {
    reasons.push('Dolandırıcılık olasılığı yüksek');
  }

  // Part reasons
  if (criticalPartsCount >= 3) {
    reasons.push('Kritik parça baskısı yüksek');
  }
  if (estimatedMaintenanceCost > 7000) {
    reasons.push('Tahmini bakım maliyeti yüksek');
  }

  // Return max 5 reasons
  return reasons.slice(0, 5);
}

/**
 * PHASE 8.3: Main function - Compute composite vehicle score from snapshot
 *
 * @param snapshot VehicleStateSnapshot or null
 * @returns CompositeVehicleScoreResult with score, level, breakdown, and reasons
 */
export function computeCompositeVehicleScore(
  snapshot: VehicleStateSnapshot | null
): CompositeVehicleScoreResult | null {
  if (!snapshot) return null;

  try {
    // Calculate component scores
    const riskComponent = calculateRiskComponent(snapshot);
    const insuranceComponent = calculateInsuranceComponent(snapshot);
    const partComponent = calculatePartComponent(snapshot);

    // Calculate final composite score
    const finalScore = clamp(
      SCORING_CONFIG.RISK_WEIGHT * riskComponent +
        SCORING_CONFIG.INSURANCE_WEIGHT * insuranceComponent +
        SCORING_CONFIG.PART_WEIGHT * partComponent
    );

    // Determine risk level
    const riskLevel = getRiskLevel(finalScore);

    // Generate reasons
    const reasons = generateReasonCodes(snapshot);

    return {
      score: Math.round(finalScore),
      level: riskLevel,
      breakdown: {
        risk: Math.round(riskComponent),
        insurance: Math.round(insuranceComponent),
        part: Math.round(partComponent),
      },
      reasons,
      version: '1.0',
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[PHASE 8.3] Error computing composite score:', error);
    return null;
  }
}
