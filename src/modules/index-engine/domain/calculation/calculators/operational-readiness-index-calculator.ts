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
 * OperationalReadinessIndexCalculator implements deterministic calculation of vehicle/fleet operational availability.
 * 
 * Operational readiness measures the ability of a vehicle or fleet to be available for service delivery.
 * This is vehicle-centric but structured to support fleet-level aggregation in later phases.
 * 
 * Operational readiness scoring considers:
 * - Unresolved signals (outstanding operational issues)
 * - Maintenance delay (deferred maintenance prevents operation)
 * - Repeated failures (reliability issues affect readiness)
 * - Data recency (fresh operational data improves confidence)
 * - Trust-weighted evidence (graph trust metrics inform confidence)
 * - Provenance strength (data lineage quality)
 * - Utilization rate (high utilization + issues = reduced readiness)
 * - Entity age (older vehicles more likely to have readiness issues)
 * - Overall data quality (impacts confidence in assessment)
 * 
 * Score interpretation (operational availability):
 * - 0.9-1.0 (OPTIMAL): Ready to operate, all systems functional
 * - 0.7-0.9 (LOW): Minor issues, operationally ready with conditions
 * - 0.4-0.7 (MEDIUM): Some concerns, conditional readiness
 * - 0.2-0.4 (HIGH): Significant issues, reduced operational capability
 * - 0.0-0.2 (CRITICAL): Not ready to operate, major blockers present
 * 
 * Note: Vehicle-centric implementation with fleet aggregation support design.
 */
export class OperationalReadinessIndexCalculator implements IIndexCalculator {
  /**
   * Calculate operational readiness index for a vehicle or fleet component.
   */
  calculate(request: IndexCalculationRequest): IndexCalculationResult {
    // Validate request
    if (request.indexType !== IndexType.OPERATIONAL_READINESS_INDEX) {
      throw new Error(`OperationalReadinessIndexCalculator can only handle OPERATIONAL_READINESS_INDEX, got ${request.indexType}`);
    }

    const { input, weightingProfile } = request;
    const featureSet = input.featureSet;

    // ========================================================================
    // Step 1: Extract Operational Readiness Factors
    // ========================================================================
    const factors = this.deriveOperationalReadinessFactors(featureSet, weightingProfile?.weights);

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
      ...this.deriveOperationalReadinessPenalties(featureSet, input),
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
      indexType: IndexType.OPERATIONAL_READINESS_INDEX,
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
        calculator: 'OperationalReadinessIndexCalculator',
        version: '1.0.0',
        weightingProfile: profile.profileId,
      },
    };
  }

  /**
   * Derive operational readiness factors from IndexInputFeatureSet.
   * Each factor represents a different aspect of operational availability.
   */
  private deriveOperationalReadinessFactors(featureSet: any, weights?: Record<string, number>): IndexFactor[] {
    const factors: IndexFactor[] = [];

    // Factor 1: Unresolved Signals (operational blockers)
    // More signals = less ready
    const unresolvedSignals = featureSet.unresolvedSignalCount || 0;
    const signalScore = Math.max(0, Math.min(100, unresolvedSignals * 10)) / 100;
    factors.push({
      factorId: 'unresolved-signals',
      label: 'Unresolved Operational Signals',
      rawValue: unresolvedSignals,
      normalizedValue: signalScore,
      weight: weights?.['unresolved-signals'] || 0.25,
      contribution: 0,
      confidence: unresolvedSignals <= 5 ? 0.90 : 0.70,
      category: 'operational-blockers',
    });

    // Factor 2: Maintenance Delay (service readiness)
    // More delay = less ready
    const delayDays = featureSet.maintenanceDelayDays || 0;
    const delayScore = Math.max(0, Math.min(100, delayDays / 10 * 100)) / 100; // 10 days = max impact
    factors.push({
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: delayDays,
      normalizedValue: delayScore,
      weight: weights?.['maintenance-delay'] || 0.22,
      contribution: 0,
      confidence: delayDays <= 30 ? 0.92 : 0.78,
      category: 'service-readiness',
    });

    // Factor 3: Repeated Failures (reliability blocker)
    // More failures = less ready
    const failureCount = featureSet.repeatedFailureCount || 0;
    const failureScore = Math.max(0, Math.min(100, failureCount * 12)) / 100;
    factors.push({
      factorId: 'repeated-failures',
      label: 'Repeated Failure History',
      rawValue: failureCount,
      normalizedValue: failureScore,
      weight: weights?.['repeated-failures'] || 0.20,
      contribution: 0,
      confidence: failureCount <= 5 ? 0.90 : 0.75,
      category: 'reliability-blockers',
    });

    // Factor 4: Event Recency (operational data freshness)
    // Older events = less confidence in readiness assessment
    const recencyScore = featureSet.eventRecencyScore || 0;
    factors.push({
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: recencyScore,
      normalizedValue: 1 - recencyScore, // Invert: old = less ready confidence
      weight: weights?.['event-recency'] || 0.08,
      contribution: 0,
      confidence: recencyScore || 0.5,
      category: 'event-recency',
    });

    // Factor 5: Trust-Weighted Evidence (operational assessment reliability)
    // Lower trust = less confidence in readiness determination
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

    // Factor 6: Provenance Strength (operational data reliability)
    // Poor provenance = less reliable readiness assessment
    const provenanceScore = featureSet.provenanceStrength || 0;
    factors.push({
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: provenanceScore,
      normalizedValue: 1 - provenanceScore, // Invert: poor provenance = less confidence
      weight: weights?.['provenance'] || 0.06,
      contribution: 0,
      confidence: provenanceScore || 0.65,
      category: 'data-provenance',
    });

    // Factor 7: Utilization Rate (operational stress)
    // Higher utilization with issues = reduced readiness
    const utilizationRate = featureSet.utilizationRate || 0.5;
    factors.push({
      factorId: 'utilization-rate',
      label: 'Current Utilization Rate',
      rawValue: utilizationRate,
      normalizedValue: utilizationRate * 0.5, // Scale down: high utilization stresses readiness
      weight: weights?.['utilization-rate'] || 0.05,
      contribution: 0,
      confidence: utilizationRate || 0.75,
      category: 'operational-load',
    });

    // Factor 8: Entity Age (readiness baseline)
    // Older vehicles have higher operational risk baseline
    const entityAge = featureSet.entityAgeInDays || 0;
    const ageScore = Math.min(100, (entityAge / 5475) * 100) / 100; // 15 years = baseline risk
    factors.push({
      factorId: 'entity-age',
      label: 'Entity Age (Days)',
      rawValue: entityAge,
      normalizedValue: ageScore,
      weight: weights?.['entity-age'] || 0.04,
      contribution: 0,
      confidence: 0.85,
      category: 'baseline-risk',
    });

    // Factor 9: Data Quality (readiness assessment confidence)
    // Lower quality = less confidence in readiness determination
    const qualityScore = (featureSet.customFeatures?.['dataQualityScore'] as number) || 0.75;
    factors.push({
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: qualityScore,
      normalizedValue: 1 - qualityScore, // Invert: low quality = less confidence
      weight: weights?.['data-quality'] || 0.02,
      contribution: 0,
      confidence: qualityScore || 0.75,
      category: 'data-quality',
    });

    return factors;
  }

  /**
   * Derive operational readiness-specific penalties.
   */
  private deriveOperationalReadinessPenalties(featureSet: any, input: any) {
    const penalties = [];

    // Penalty: Stale snapshot (no recent operational data)
    if (input.snapshot.stale) {
      penalties.push({
        penaltyType: PenaltyType.STALE_DATA,
        label: 'Stale operational data',
        penaltyValue: 0.12,
        reason: 'No recent operational or service events recorded',
      });
    }

    // Penalty: Low trust score (affects readiness confidence)
    if ((featureSet.trustWeightedEvidenceScore || 0) < 0.4) {
      penalties.push({
        penaltyType: PenaltyType.LOW_CONFIDENCE,
        label: 'Low confidence in operational status',
        penaltyValue: 0.09,
        reason: 'Trust metrics suggest uncertain operational readiness assessment',
      });
    }

    // Penalty: Missing operational/service evidence
    if ((featureSet.provenanceStrength || 0) < 0.35) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Missing operational evidence',
        penaltyValue: 0.08,
        reason: 'Insufficient operational or service history to confirm readiness',
      });
    }

    // Penalty: Incomplete operational data
    if ((input.snapshot.dataCompletenessPercent || 100) < 60) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Incomplete operational data',
        penaltyValue: 0.07,
        reason: 'Missing critical operational or readiness indicators',
      });
    }

    return penalties;
  }

  /**
   * Default weighting profile for operational readiness calculation.
   */
  private defaultWeightingProfile() {
    return {
      profileId: 'operational-readiness-standard-v1',
      weights: {
        'unresolved-signals': 0.25,
        'maintenance-delay': 0.22,
        'repeated-failures': 0.20,
        'event-recency': 0.08,
        'trust-evidence': 0.08,
        'provenance': 0.06,
        'utilization-rate': 0.05,
        'entity-age': 0.04,
        'data-quality': 0.02,
      },
      lowConfidenceMultiplier: 0.85,
    };
  }

  /**
   * Generate human-readable explanation for operational readiness assessment.
   */
  private generateExplanation(
    score: number,
    band: IndexBand,
    factors: IndexFactor[],
    penalties: any[],
  ): IndexExplanation {
    const sortedByContribution = [...factors].sort((a, b) => (b.contribution || 0) - (a.contribution || 0));
    const topBlockers = sortedByContribution.slice(0, 2);
    const topBoosters = sortedByContribution.slice(-2).reverse();

    let interpretation = '';
    let recommendation = '';
    let readinessStatus = '';

    if (band === IndexBand.OPTIMAL) {
      interpretation = 'Ready to operate. All systems functional, no operational blockers detected.';
      recommendation = 'Vehicle/fleet can be deployed immediately. Continue regular monitoring.';
      readinessStatus = 'Fully Operational';
    } else if (band === IndexBand.LOW) {
      interpretation = 'Operationally ready with minor conditions. No critical blockers present.';
      recommendation = 'Vehicle/fleet can be deployed. Monitor identified conditions. Schedule routine maintenance.';
      readinessStatus = 'Operationally Ready';
    } else if (band === IndexBand.MEDIUM) {
      interpretation = 'Conditional readiness. Some operational concerns require attention before deployment.';
      recommendation = 'Address identified issues before planned deployment. Review operational constraints.';
      readinessStatus = 'Conditionally Ready';
    } else if (band === IndexBand.HIGH) {
      interpretation = 'Reduced operational capability. Significant issues present that limit readiness.';
      recommendation = 'Do not deploy without resolving critical issues. Prioritize maintenance/repairs.';
      readinessStatus = 'Limited Readiness';
    } else {
      interpretation = 'Not ready to operate. Critical blockers prevent safe or efficient operation.';
      recommendation = 'Take vehicle/fleet out of service. Address all critical issues before return to operation.';
      readinessStatus = 'Not Operational';
    }

    const boosters = topBoosters
      .filter(f => (f.contribution || 0) < 0.15)
      .map((f) => `${f.label} (operational booster)`);

    const blockers = topBlockers
      .map((f) => `${f.label} (+${((f.contribution || 0) * 100).toFixed(1)}% impact)`);

    return {
      summary: `Operational Readiness Index: ${(score * 100).toFixed(1)}% (Band: ${band}). ${interpretation}`,
      positiveFactors: boosters,
      negativeFactors: blockers,
      recommendedActions: [recommendation],
      comparison: `Readiness status: ${readinessStatus}`,
      trend: 'stable',
    };
  }
}
