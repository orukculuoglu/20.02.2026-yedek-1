/**
 * Phase 8.4: Score Explainability Layer
 *
 * Explains why the composite vehicle score is at its current value.
 * Identifies dominant drivers (factors pulling score up/down).
 * Does NOT recalculate score; only explains existing composite score result.
 *
 * Single Source of Truth: VehicleStateSnapshot only
 */

import { VehicleStateSnapshot } from '../../../modules/vehicle-state/vehicleStateSnapshotStore';

/**
 * Dominant driver factor with direction and magnitude
 */
export type DominantDriver = {
  /** Human-readable label in Turkish */
  label: string;
  /** Effect direction: negative=pulling score down, positive=pulling up, neutral=no impact */
  effect: 'negative' | 'positive' | 'neutral';
  /** Magnitude 0-100 indicating strength of effect */
  magnitude: number;
  /** Which domain this driver belongs to */
  sourceDomain: 'risk' | 'insurance' | 'part';
};

/**
 * Complete explainability result for composite vehicle score
 */
export type ScoreExplainabilityResult = {
  /** Final composite score 0-100 */
  score: number;
  /** Risk level categorization */
  level: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK';
  /** Component contributions to final score */
  domainContributions: {
    risk: number;        // 0-100 risk component
    insurance: number;   // 0-100 insurance component
    part: number;        // 0-100 part component
  };
  /** Top driving factors (sorted by magnitude) */
  dominantDrivers: DominantDriver[];
  /** Summary explanation in Turkish (3-5 bullet points) */
  summary: string[];
  /** Version identifier */
  version: string;
  /** Timestamp of snapshot used */
  updatedAt: string;
};

/**
 * Configuration constants for explainability thresholds
 */
const EXPLAINABILITY_CONFIG = {
  // Thresholds for identifying negative drivers
  NEGATIVE_THRESHOLDS: {
    trustIndex: 50,                    // Low trust below 50
    reliabilityIndex: 50,              // Low reliability below 50
    maintenanceDiscipline: 40,         // Poor discipline below 40
    structuralRisk: 40,                // High structural risk above 40
    mechanicalRisk: 40,                // High mechanical risk above 40
    insuranceRisk: 40,                 // High insurance risk above 40
    claimFrequencyIndex: 60,           // High claims above 60
    fraudLikelihoodIndex: 50,          // High fraud likelihood above 50
    criticalPartsCount: 5,             // Critical parts threshold
    supplyStressIndex: 60,             // Supply stress above 60
    priceVolatilityIndex: 60,          // Price volatility above 60
    estimatedMaintenanceCost: 70,      // High cost above 70
  },
  // Thresholds for identifying positive drivers
  POSITIVE_THRESHOLDS: {
    trustIndex: 75,                    // High trust above 75
    reliabilityIndex: 75,              // High reliability above 75
    maintenanceDiscipline: 80,         // Good discipline above 80
    policyContinuityIndex: 80,         // Strong policy above 80
    coverageAdequacyIndex: 80,         // Good coverage above 80
  },
  // Magnitude multipliers for driver strength
  MAGNITUDE_WEIGHTS: {
    critical: 25,  // Trust, Reliability, Maintenance impact
    high: 20,      // Risk factors and claims
    medium: 15,    // Supply, volatility
    low: 10,       // Cost estimates
  },
};

/**
 * Safe metric extraction from snapshot with default
 */
function extractMetricValue(
  snapshot: VehicleStateSnapshot | null,
  domain: string,
  metricsKey: string,
  defaultValue: number = 0
): number {
  try {
    if (!snapshot) return defaultValue;

    // Get domain data from snapshot based on domain type
    let indices: Array<{ key: string; value: number; confidence?: number }> | undefined;

    switch (domain.toLowerCase()) {
      case 'risk':
        indices = snapshot.risk?.indices;
        break;
      case 'insurance':
        indices = snapshot.insurance?.indices;
        break;
      case 'part':
        indices = snapshot.part?.indices;
        break;
      default:
        return defaultValue;
    }

    if (!indices) return defaultValue;

    // Find metric value by key
    const found = indices.find((idx) => idx.key === metricsKey);
    return found !== undefined ? found.value : defaultValue;
  } catch (error) {
    console.error(`[Explainability] Error extracting ${domain}.${metricsKey}:`, error);
    return defaultValue;
  }

}

/**
 * Calculate risk domain contribution (50% of final score)
 * Returns component value (0-100)
 */
function getRiskComponentValue(snapshot: VehicleStateSnapshot): number {
  const trustIndex = extractMetricValue(snapshot, 'risk', 'trust', 50);
  const reliabilityIndex = extractMetricValue(snapshot, 'risk', 'reliability', 50);
  const maintenanceDiscipline = extractMetricValue(snapshot, 'risk', 'maintenanceDiscipline', 50);
  const structuralRisk = extractMetricValue(snapshot, 'risk', 'structuralRisk', 50);
  const mechanicalRisk = extractMetricValue(snapshot, 'risk', 'mechanicalRisk', 50);
  const insuranceRisk = extractMetricValue(snapshot, 'risk', 'insuranceRisk', 50);

  const inverseRiskAvg = (100 - structuralRisk + 100 - mechanicalRisk + 100 - insuranceRisk) / 3;
  const score =
    trustIndex * 0.35 +
    reliabilityIndex * 0.25 +
    maintenanceDiscipline * 0.2 +
    inverseRiskAvg * 0.2;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate insurance domain contribution (30% of final score)
 * Returns component value (0-100)
 */
function getInsuranceComponentValue(snapshot: VehicleStateSnapshot): number {
  const policyContinuityIndex = extractMetricValue(snapshot, 'insurance', 'policyContinuity', 50);
  const claimFrequencyIndex = extractMetricValue(snapshot, 'insurance', 'claimFrequency', 50);
  const coverageAdequacyIndex = extractMetricValue(snapshot, 'insurance', 'coverageAdequacy', 50);
  const fraudLikelihoodIndex = extractMetricValue(snapshot, 'insurance', 'fraudLikelihood', 50);

  const score =
    policyContinuityIndex * 0.3 +
    (100 - claimFrequencyIndex) * 0.25 +
    coverageAdequacyIndex * 0.2 +
    (100 - fraudLikelihoodIndex) * 0.25;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate part domain contribution (20% of final score)
 * Returns component value (0-100)
 */
function getPartComponentValue(snapshot: VehicleStateSnapshot): number {
  const criticalPartsCount = extractMetricValue(snapshot, 'part', 'criticalPartsCount', 3);
  const supplyStressIndex = extractMetricValue(snapshot, 'part', 'supplyStressIndex', 50);
  const priceVolatilityIndex = extractMetricValue(snapshot, 'part', 'priceVolatilityIndex', 50);
  const estimatedMaintenanceCost = extractMetricValue(
    snapshot,
    'part',
    'estimatedMaintenanceCostNormalized',
    50
  );

  const score =
    (100 - Math.min(criticalPartsCount * 15, 100)) * 0.3 +
    (100 - supplyStressIndex) * 0.3 +
    (100 - priceVolatilityIndex) * 0.2 +
    estimatedMaintenanceCost * 0.2;

  return Math.max(0, Math.min(100, score));
}

/**
 * Identify dominant drivers (top factors affecting score)
 * Returns sorted by magnitude (descending)
 */
function identifyDominantDrivers(snapshot: VehicleStateSnapshot): DominantDriver[] {
  const drivers: DominantDriver[] = [];

  // Risk domain drivers
  const trustIndex = extractMetricValue(snapshot, 'risk', 'trust', 50);
  const reliabilityIndex = extractMetricValue(snapshot, 'risk', 'reliability', 50);
  const maintenanceDiscipline = extractMetricValue(snapshot, 'risk', 'maintenanceDiscipline', 50);
  const structuralRisk = extractMetricValue(snapshot, 'risk', 'structuralRisk', 50);

  if (trustIndex < EXPLAINABILITY_CONFIG.NEGATIVE_THRESHOLDS.trustIndex) {
    drivers.push({
      label: 'Güven endeksi düşük',
      effect: 'negative',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.critical * (1 - trustIndex / 100),
      sourceDomain: 'risk',
    });
  } else if (trustIndex > EXPLAINABILITY_CONFIG.POSITIVE_THRESHOLDS.trustIndex) {
    drivers.push({
      label: 'Güven endeksi yüksek',
      effect: 'positive',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.critical * (trustIndex / 100 - 0.75),
      sourceDomain: 'risk',
    });
  }

  if (reliabilityIndex < EXPLAINABILITY_CONFIG.NEGATIVE_THRESHOLDS.reliabilityIndex) {
    drivers.push({
      label: 'Güvenilirlik düşük',
      effect: 'negative',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.critical * (1 - reliabilityIndex / 100),
      sourceDomain: 'risk',
    });
  } else if (reliabilityIndex > EXPLAINABILITY_CONFIG.POSITIVE_THRESHOLDS.reliabilityIndex) {
    drivers.push({
      label: 'Güvenilirlik yüksek',
      effect: 'positive',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.critical * (reliabilityIndex / 100 - 0.75),
      sourceDomain: 'risk',
    });
  }

  if (maintenanceDiscipline < EXPLAINABILITY_CONFIG.NEGATIVE_THRESHOLDS.maintenanceDiscipline) {
    drivers.push({
      label: 'Bakım disiplini düşük',
      effect: 'negative',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.critical * (1 - maintenanceDiscipline / 100),
      sourceDomain: 'risk',
    });
  } else if (maintenanceDiscipline > EXPLAINABILITY_CONFIG.POSITIVE_THRESHOLDS.maintenanceDiscipline) {
    drivers.push({
      label: 'Bakım disiplini iyi',
      effect: 'positive',
      magnitude:
        EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.critical *
        (maintenanceDiscipline / 100 - 0.8),
      sourceDomain: 'risk',
    });
  }

  if (structuralRisk > EXPLAINABILITY_CONFIG.NEGATIVE_THRESHOLDS.structuralRisk) {
    drivers.push({
      label: 'Yapısal risk yüksek',
      effect: 'negative',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.high * (structuralRisk / 100),
      sourceDomain: 'risk',
    });
  }

  // Insurance domain drivers
  const claimFrequencyIndex = extractMetricValue(snapshot, 'insurance', 'claimFrequency', 50);
  const fraudLikelihoodIndex = extractMetricValue(snapshot, 'insurance', 'fraudLikelihood', 50);
  const policyContinuityIndex = extractMetricValue(snapshot, 'insurance', 'policyContinuity', 50);

  if (claimFrequencyIndex > EXPLAINABILITY_CONFIG.NEGATIVE_THRESHOLDS.claimFrequencyIndex) {
    drivers.push({
      label: 'Harita sıklığı yüksek',
      effect: 'negative',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.high * (claimFrequencyIndex / 100),
      sourceDomain: 'insurance',
    });
  }

  if (fraudLikelihoodIndex > EXPLAINABILITY_CONFIG.NEGATIVE_THRESHOLDS.fraudLikelihoodIndex) {
    drivers.push({
      label: 'Dolandırıcılık olasılığı yüksek',
      effect: 'negative',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.high * (fraudLikelihoodIndex / 100),
      sourceDomain: 'insurance',
    });
  }

  if (policyContinuityIndex > EXPLAINABILITY_CONFIG.POSITIVE_THRESHOLDS.policyContinuityIndex) {
    drivers.push({
      label: 'Poliçe sürekliliği güçlü',
      effect: 'positive',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.medium * (policyContinuityIndex / 100 - 0.8),
      sourceDomain: 'insurance',
    });
  }

  // Part domain drivers
  const criticalPartsCount = extractMetricValue(snapshot, 'part', 'criticalPartsCount', 3);
  const supplyStressIndex = extractMetricValue(snapshot, 'part', 'supplyStressIndex', 50);
  const estimatedMaintenanceCost = extractMetricValue(
    snapshot,
    'part',
    'estimatedMaintenanceCostNormalized',
    50
  );

  if (criticalPartsCount > EXPLAINABILITY_CONFIG.NEGATIVE_THRESHOLDS.criticalPartsCount) {
    drivers.push({
      label: 'Kritik parça baskısı yüksek',
      effect: 'negative',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.medium * (criticalPartsCount / 10),
      sourceDomain: 'part',
    });
  }

  if (supplyStressIndex > EXPLAINABILITY_CONFIG.NEGATIVE_THRESHOLDS.supplyStressIndex) {
    drivers.push({
      label: 'Tedarik zinciri stres yüksek',
      effect: 'negative',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.medium * (supplyStressIndex / 100),
      sourceDomain: 'part',
    });
  }

  if (estimatedMaintenanceCost > EXPLAINABILITY_CONFIG.NEGATIVE_THRESHOLDS.estimatedMaintenanceCost) {
    drivers.push({
      label: 'Tahmini bakım maliyeti yüksek',
      effect: 'negative',
      magnitude: EXPLAINABILITY_CONFIG.MAGNITUDE_WEIGHTS.low * (estimatedMaintenanceCost / 100),
      sourceDomain: 'part',
    });
  }

  // Sort by magnitude descending and limit to top 7
  return drivers
    .sort((a, b) => b.magnitude - a.magnitude)
    .slice(0, 7);
}

/**
 * Generate summary explanation in Turkish (3-5 bullet points)
 */
function generateSummary(
  score: number,
  drivers: DominantDriver[],
  domainContributions: { risk: number; insurance: number; part: number }
): string[] {
  const summary: string[] = [];

  // Overall level
  if (score < 30) {
    summary.push('🚨 Araç yüksek riske maruz - dikkat gerektiriyor');
  } else if (score < 60) {
    summary.push('⚠️ Araç orta düzeyde risk içeriyor');
  } else {
    summary.push('✓ Araç düşük riske sahip');
  }

  // Domain balance
  const maxDomain = Math.max(domainContributions.risk, domainContributions.insurance, domainContributions.part);
  const minDomain = Math.min(domainContributions.risk, domainContributions.insurance, domainContributions.part);

  if (maxDomain - minDomain > 30) {
    const primary =
      maxDomain === domainContributions.risk ? 'Risk' :
      maxDomain === domainContributions.insurance ? 'Sigorta' : 'Parça';
    summary.push(`${primary} alanı skoru önemli ölçüde etkiliyor`);
  }

  // Top negative drivers
  const negativeDrivers = drivers.filter(d => d.effect === 'negative').slice(0, 2);
  if (negativeDrivers.length > 0) {
    const labels = negativeDrivers.map(d => d.label.toLowerCase()).join(', ');
    summary.push(`Puanı en çok düşüren faktörler: ${labels}`);
  }

  // Top positive drivers
  const positiveDrivers = drivers.filter(d => d.effect === 'positive');
  if (positiveDrivers.length > 0) {
    const labels = positiveDrivers.map(d => d.label.toLowerCase()).join(', ');
    summary.push(`Puanı destekleyen faktörler: ${labels}`);
  }

  return summary.slice(0, 5);
}

/**
 * Get risk level from score
 */
function getRiskLevel(score: number): 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK' {
  if (score <= 30) return 'HIGH_RISK';
  if (score <= 60) return 'MEDIUM_RISK';
  return 'LOW_RISK';
}

/**
 * Main export: Explain why composite score is at current value
 */
export function explainCompositeScore(
  snapshot: VehicleStateSnapshot | null
): ScoreExplainabilityResult | null {
  try {
    if (!snapshot) {
      return null;
    }

    // Get component values
    const riskComponent = getRiskComponentValue(snapshot);
    const insuranceComponent = getInsuranceComponentValue(snapshot);
    const partComponent = getPartComponentValue(snapshot);

    // Calculate final score (same formula as Phase 8.3)
    const compositeScore = 0.5 * riskComponent + 0.3 * insuranceComponent + 0.2 * partComponent;
    const score = Math.max(0, Math.min(100, compositeScore));

    // Identify drivers
    const dominantDrivers = identifyDominantDrivers(snapshot);

    // Generate summary
    const summary = generateSummary(score, dominantDrivers, {
      risk: riskComponent,
      insurance: insuranceComponent,
      part: partComponent,
    });

    return {
      score,
      level: getRiskLevel(score),
      domainContributions: {
        risk: riskComponent,
        insurance: insuranceComponent,
        part: partComponent,
      },
      dominantDrivers,
      summary,
      version: '8.4',
      updatedAt: snapshot.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Explainability] Error explaining composite score:', error);
    return null;
  }
}
