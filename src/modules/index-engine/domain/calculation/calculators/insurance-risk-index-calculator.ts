import { IIndexCalculator } from '../index-calculator';
import { IndexCalculationRequest } from '../schemas/index-calculation-request';
import { IndexCalculationResult } from '../schemas/index-calculation-result';
import { IndexFactor } from '../schemas/index-factor';
import { IndexType } from '../../enums/index-type';
import { IndexBand } from '../../enums/index-band';
import { IndexExplanation } from '../../schemas/index-explanation';

import {
  ScoreNormalizationService,
  FactorWeightingService,
  ConfidenceNormalizationService,
  PenaltyApplicationService,
  BandDerivationService,
} from '../services';
import { IndexNormalizationRule } from '../schemas/index-normalization-rule';
import { NormalizationStrategy } from '../enums/normalization-strategy';
import { PenaltyType } from '../enums/penalty-type';

/**
 * InsuranceRiskIndexCalculator implements deterministic calculation of vehicle insurance risk.
 * 
 * Insurance risk scoring is purely vehicle-centric and considers:
 * - Repeated failure history (failures indicate mechanical/structural risks)
 * - Unresolved signals (outstanding issues affect insurability)
 * - Maintenance delay (overdue maintenance increases risk)
 * - Data recency (fresh data improves confidence in assessment)
 * - Trust-weighted evidence (graph trust metrics inform confidence)
 * - Provenance strength (data lineage quality)
 * - Utilization rate (higher usage may increase accident/wear risk)
 * - Entity age (older vehicles have higher mechanical risk)
 * - Overall data quality (impacts confidence in final assessment)
 * 
 * Score interpretation (vehicle-only risk model):
 * - 0.9-1.0 (OPTIMAL): Low insurance risk, excellent vehicle condition
 * - 0.7-0.9 (LOW): Acceptable insurance risk, minor concerns
 * - 0.4-0.7 (MEDIUM): Moderate insurance risk, standard underwriting
 * - 0.2-0.4 (HIGH): Elevated insurance risk, requires review
 * - 0.0-0.2 (CRITICAL): Very high insurance risk, may be uninsurable
 * 
 * Note: This calculator uses ONLY vehicle-centric features. No driver, person, or usage-pattern data.
 */
export class InsuranceRiskIndexCalculator implements IIndexCalculator {
  /**
   * Calculate insurance risk index for a vehicle or component.
   */
  calculate(request: IndexCalculationRequest): IndexCalculationResult {
    // Validate request
    if (request.indexType !== IndexType.INSURANCE_RISK_INDEX) {
      throw new Error(`InsuranceRiskIndexCalculator can only handle INSURANCE_RISK_INDEX, got ${request.indexType}`);
    }

    const { input, weightingProfile } = request;
    const featureSet = input.featureSet;

    // ========================================================================
    // Step 1: Extract Insurance Risk Factors
    // ========================================================================
    const factors = this.deriveInsuranceRiskFactors(featureSet, weightingProfile?.weights);

    // Calculate base score as average of all factor normalized values
    const baseRawScore = factors.reduce((sum, f) => sum + (typeof f.rawValue === 'number' ? f.rawValue : 50), 0) / (factors.length || 1);

    // ========================================================================
    // Step 2: Apply Weighting Profile
    // ========================================================================
    const profile = weightingProfile || this.defaultWeightingProfile();
    const weightedScore = FactorWeightingService.calculateWeightedScore(factors, profile);

    // ========================================================================
    // Step 3: Apply Penalties
    // ========================================================================
    const penalties = [
      ...PenaltyApplicationService.evaluatePenalties(input),
      ...this.deriveInsuranceRiskPenalties(featureSet, input),
    ];

    const penaltyScore = penalties.reduce((sum, p) => sum + p.penaltyValue, 0);
    const scoreAfterPenalties = Math.max(0, weightedScore - penaltyScore);

    // ========================================================================
    // Step 4: Normalize Score (0.0 - 1.0)
    // ========================================================================
    const normalizationRule: IndexNormalizationRule = {
      normalizationStrategy: NormalizationStrategy.LINEAR,
      minValue: 0,
      maxValue: 1,
      clamp: true,
    };

    const normalizedScore = ScoreNormalizationService.normalize(scoreAfterPenalties, normalizationRule);

    // ========================================================================
    // Step 5: Derive Confidence
    // ========================================================================
    const confidence = ConfidenceNormalizationService.deriveConfidence(
      input.snapshot.dataCompletenessPercent || 75,
      weightedScore,
      penaltyScore
    );

    // ========================================================================
    // Step 6: Derive Band
    // ========================================================================
    const band = BandDerivationService.deriveBand(normalizedScore);

    // ========================================================================
    // Step 7: Build Score Breakdown
    // ========================================================================
    const breakdown = {
      baseScore: baseRawScore,
      weightedScore,
      penaltyScore,
      finalScore: normalizedScore,
      normalizationApplied: true,
      normalizationDetails: {
        strategy: NormalizationStrategy.LINEAR,
        minValue: 0,
        maxValue: 1,
      },
    };

    // ========================================================================
    // Step 8: Generate Explanation
    // ========================================================================
    const explanation = this.generateExplanation(normalizedScore, band, factors, penalties);

    // ========================================================================
    // Step 9: Build Result
    // ========================================================================
    return {
      indexType: IndexType.INSURANCE_RISK_INDEX,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      rawScore: baseRawScore,
      normalizedScore,
      band,
      confidence,
      breakdown,
      factors,
      penalties,
      explanation,
      calculatedAt: new Date(),
      metadata: {
        calculator: 'InsuranceRiskIndexCalculator',
        version: '1.0.0',
        weightingProfile: profile.profileId,
      },
    };
  }

  /**
   * Derive insurance risk factors from IndexInputFeatureSet.
   * Each factor represents a different aspect of vehicle insurance risk.
   * Vehicle-centric only: no driver, person, or usage-pattern data.
   */
  private deriveInsuranceRiskFactors(featureSet: any, weights?: Record<string, number>): IndexFactor[] {
    const factors: IndexFactor[] = [];

    // Factor 1: Repeated Failures (mechanical/structural risk indicator)
    // More failures = higher insurance risk
    const failureCount = featureSet.repeatedFailureCount || 0;
    const failureScore = Math.max(0, Math.min(100, failureCount * 12)) / 100;
    factors.push({
      factorId: 'repeated-failures',
      label: 'Repeated Failure History',
      rawValue: failureCount,
      normalizedValue: failureScore,
      weight: weights?.['repeated-failures'] || 0.25,
      contribution: 0,
      confidence: failureCount <= 5 ? 0.90 : 0.75,
      category: 'repeated-failures',
    });

    // Factor 2: Unresolved Signals (outstanding issues that affect coverage)
    // More signals = higher insurance risk
    const unresolvedSignals = featureSet.unresolvedSignalCount || 0;
    const signalScore = Math.max(0, Math.min(100, unresolvedSignals * 8)) / 100;
    factors.push({
      factorId: 'unresolved-signals',
      label: 'Unresolved Signal Count',
      rawValue: unresolvedSignals,
      normalizedValue: signalScore,
      weight: weights?.['unresolved-signals'] || 0.20,
      contribution: 0,
      confidence: unresolvedSignals <= 5 ? 0.90 : 0.70,
      category: 'unresolved-signals',
    });

    // Factor 3: Maintenance Delay (deferred maintenance indicates risk)
    // More delay = higher insurance risk
    const delayDays = featureSet.maintenanceDelayDays || 0;
    const delayScore = Math.max(0, Math.min(100, delayDays / 12 * 100)) / 100; // 12 days = 100% risk
    factors.push({
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: delayDays,
      normalizedValue: delayScore,
      weight: weights?.['maintenance-delay'] || 0.18,
      contribution: 0,
      confidence: delayDays <= 30 ? 0.92 : 0.80,
      category: 'maintenance-delay',
    });

    // Factor 4: Event Recency (recent data improves confidence assessment)
    // Older events = less confidence in risk assessment
    const recencyScore = featureSet.eventRecencyScore || 0;
    factors.push({
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: recencyScore,
      normalizedValue: 1 - recencyScore, // Invert: old = less confidence
      weight: weights?.['event-recency'] || 0.08,
      contribution: 0,
      confidence: recencyScore || 0.5,
      category: 'event-recency',
    });

    // Factor 5: Trust-Weighted Evidence (affects confidence in risk assessment)
    // Lower trust = less confidence in underwriting
    const trustScore = featureSet.trustWeightedEvidenceScore || 0;
    factors.push({
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: trustScore,
      normalizedValue: 1 - trustScore, // Invert: low trust = less confidence
      weight: weights?.['trust-evidence'] || 0.08,
      contribution: 0,
      confidence: trustScore || 0.6,
      category: 'trust-evidence',
    });

    // Factor 6: Provenance Strength (data lineage quality affects confidence)
    // Poor provenance = less reliable risk assessment
    const provenanceScore = featureSet.provenanceStrength || 0;
    factors.push({
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: provenanceScore,
      normalizedValue: 1 - provenanceScore, // Invert: poor provenance = less confidence
      weight: weights?.['provenance'] || 0.06,
      contribution: 0,
      confidence: provenanceScore || 0.65,
      category: 'provenance',
    });

    // Factor 7: Utilization Rate (higher usage may increase exposure/wear risk)
    // Higher utilization = moderate increase in risk
    const utilizationRate = featureSet.utilizationRate || 0.5;
    factors.push({
      factorId: 'utilization-rate',
      label: 'Utilization Rate',
      rawValue: utilizationRate,
      normalizedValue: utilizationRate * 0.4, // Scale down: not primary risk factor
      weight: weights?.['utilization-rate'] || 0.06,
      contribution: 0,
      confidence: utilizationRate || 0.75,
      category: 'utilization-rate',
    });

    // Factor 8: Entity Age (older vehicles have higher mechanical risk)
    // Older vehicles = higher insurance risk
    const entityAge = featureSet.entityAgeInDays || 0;
    const ageScore = Math.min(100, (entityAge / 5475) * 100) / 100; // Scale to vehicle lifecycle (assume 15 years = high risk)
    factors.push({
      factorId: 'entity-age',
      label: 'Entity Age (Days)',
      rawValue: entityAge,
      normalizedValue: ageScore,
      weight: weights?.['entity-age'] || 0.05,
      contribution: 0,
      confidence: 0.85,
      category: 'entity-age',
    });

    // Factor 9: Data Quality (impacts confidence in overall risk assessment)
    // Lower quality = less confidence in risk determination
    const qualityScore = (featureSet.customFeatures?.['dataQualityScore'] as number) || 0.75;
    factors.push({
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: qualityScore,
      normalizedValue: 1 - qualityScore, // Invert: low quality = less confidence
      weight: weights?.['data-quality'] || 0.04,
      contribution: 0,
      confidence: qualityScore || 0.75,
      category: 'data-quality',
    });

    return factors;
  }

  /**
   * Derive insurance-specific penalties.
   */
  private deriveInsuranceRiskPenalties(featureSet: any, input: any) {
    const penalties = [];

    // Penalty: Stale snapshot
    if (input.snapshot.stale) {
      penalties.push({
        penaltyType: PenaltyType.STALE_DATA,
        label: 'Stale vehicle data',
        penaltyValue: 0.14,
        reason: 'No recent vehicle inspection or service records',
      });
    }

    // Penalty: Low trust score (affects underwriting confidence)
    if ((featureSet.trustWeightedEvidenceScore || 0) < 0.4) {
      penalties.push({
        penaltyType: PenaltyType.LOW_CONFIDENCE,
        label: 'Low trust in vehicle evidence',
        penaltyValue: 0.10,
        reason: 'Trust metrics suggest unreliable vehicle condition assessment',
      });
    }

    // Penalty: Missing critical maintenance evidence
    if ((featureSet.provenanceStrength || 0) < 0.35) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Missing maintenance documentation',
        penaltyValue: 0.09,
        reason: 'Insufficient service history or maintenance proof',
      });
    }

    // Penalty: Incomplete data flags
    if ((input.snapshot.dataCompletenessPercent || 100) < 60) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Incomplete vehicle data',
        penaltyValue: 0.08,
        reason: 'Missing critical vehicle attributes or condition indicators',
      });
    }

    return penalties;
  }

  /**
   * Default weighting profile for insurance risk calculation.
   */
  private defaultWeightingProfile() {
    return {
      profileId: 'insurance-risk-standard-v1',
      weights: {
        'repeated-failures': 0.25,
        'unresolved-signals': 0.20,
        'maintenance-delay': 0.18,
        'event-recency': 0.08,
        'trust-evidence': 0.08,
        'provenance': 0.06,
        'utilization-rate': 0.06,
        'entity-age': 0.05,
        'data-quality': 0.04,
      },
      lowConfidenceMultiplier: 0.85,
    };
  }

  /**
   * Generate human-readable explanation for insurance risk assessment.
   */
  private generateExplanation(
    score: number,
    band: IndexBand,
    factors: IndexFactor[],
    penalties: any[],
  ): IndexExplanation {
    const sortedByContribution = [...factors].sort((a, b) => (b.contribution || 0) - (a.contribution || 0));
    const topRiskFactors = sortedByContribution.slice(0, 2);
    const topMitigatingFactors = sortedByContribution.slice(-2).reverse();

    let interpretation = '';
    let recommendation = '';
    let riskLevel = '';

    if (band === IndexBand.OPTIMAL) {
      interpretation = 'Low insurance risk. Vehicle is in excellent condition with clean maintenance history.';
      recommendation = 'Standard insurance rates applicable. No underwriting concerns.';
      riskLevel = 'Low Risk';
    } else if (band === IndexBand.LOW) {
      interpretation = 'Acceptable insurance risk. Vehicle shows normal wear patterns and maintenance compliance.';
      recommendation = 'Standard insurance rates with optional discounts for good condition. Annual review recommended.';
      riskLevel = 'Acceptable Risk';
    } else if (band === IndexBand.MEDIUM) {
      interpretation = 'Moderate insurance risk. Vehicle has some identified concerns requiring underwriting review.';
      recommendation = 'Standard rates with possible surcharge. Address identified maintenance issues to reduce risk.';
      riskLevel = 'Moderate Risk';
    } else if (band === IndexBand.HIGH) {
      interpretation = 'Elevated insurance risk. Multiple mechanical or structural concerns detected.';
      recommendation = 'Underwriting review required. Consider repair/replacement of critical components. Potential rate increase.';
      riskLevel = 'Elevated Risk';
    } else {
      interpretation = 'Very high insurance risk. Vehicle condition makes it potentially uninsurable without major repairs.';
      recommendation = 'Urgent underwriting review required. Major repairs or decommissioning may be necessary.';
      riskLevel = 'Critical Risk';
    }

    const positiveFactors = topMitigatingFactors
      .filter(f => (f.contribution || 0) < 0.15)
      .map((f) => `${f.label} (contributes positively)`);
    
    const negativeFactors = topRiskFactors
      .map((f) => `${f.label} (+${((f.contribution || 0) * 100).toFixed(1)}% risk)`);

    return {
      summary: `Insurance Risk Index: ${(score * 100).toFixed(1)}% (Band: ${band}). ${interpretation}`,
      positiveFactors,
      negativeFactors,
      recommendedActions: [recommendation],
      comparison: `Risk assessment: ${riskLevel}`,
      trend: 'stable',
    };
  }
}
