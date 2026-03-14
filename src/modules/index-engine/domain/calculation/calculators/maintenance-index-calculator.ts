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
 * MaintenanceIndexCalculator implements deterministic calculation of vehicle maintenance urgency.
 * 
 * Maintenance scoring considers:
 * - Maintenance delay in days (how overdue is maintenance)
 * - Historical failure patterns (failures indicate maintenance need)
 * - Signal completeness (unresolved signals indicate maintenance issues)
 * - Data recency (fresh data improves confidence)
 * - Trust-weighted evidence (graph trust metrics)
 * - Provenance strength (data lineage quality)
 * - Utilization rate (higher usage = more maintenance needed)
 * - Entity age (older vehicles need more maintenance)
 * - Overall data quality (from snapshot)
 * 
 * Score interpretation:
 * - 0.9-1.0 (OPTIMAL): Maintenance not urgent, well-maintained
 * - 0.7-0.9 (LOW): Maintenance upcoming but not urgent
 * - 0.4-0.7 (MEDIUM): Maintenance should be scheduled soon
 * - 0.2-0.4 (HIGH): Maintenance is urgent, should be prioritized
 * - 0.0-0.2 (CRITICAL): Maintenance is overdue, immediate action required
 */
export class MaintenanceIndexCalculator implements IIndexCalculator {
  /**
   * Calculate maintenance index for a vehicle or component.
   */
  calculate(request: IndexCalculationRequest): IndexCalculationResult {
    // Validate request
    if (request.indexType !== IndexType.MAINTENANCE_INDEX) {
      throw new Error(`MaintenanceIndexCalculator can only handle MAINTENANCE_INDEX, got ${request.indexType}`);
    }

    const { input, weightingProfile } = request;
    const featureSet = input.featureSet;

    // ========================================================================
    // Step 1: Extract Maintenance Factors
    // ========================================================================
    const factors = this.deriveMaintenanceFactors(featureSet, weightingProfile?.weights);

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
      ...this.deriveMaintenancePenalties(featureSet, input),
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
      indexType: IndexType.MAINTENANCE_INDEX,
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
        calculator: 'MaintenanceIndexCalculator',
        version: '1.0.0',
        weightingProfile: profile.profileId,
      },
    };
  }

  /**
   * Derive maintenance factors from IndexInputFeatureSet.
   * Each factor represents a different aspect of maintenance urgency.
   */
  private deriveMaintenanceFactors(featureSet: any, weights?: Record<string, number>): IndexFactor[] {
    const factors: IndexFactor[] = [];

    // Factor 1: Maintenance Delay (days overdue)
    // More delay = higher urgency (inverted: higher value = worse)
    const delayDays = featureSet.maintenanceDelayDays || 0;
    const delayScore = Math.max(0, Math.min(100, delayDays / 10 * 100)) / 100; // 10 days = 100% urgency
    factors.push({
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: delayDays,
      normalizedValue: delayScore,
      weight: weights?.['maintenance-delay'] || 0.30,
      contribution: 0,
      confidence: delayDays <= 30 ? 0.95 : 0.80,
      category: 'maintenance-delay',
    });

    // Factor 2: Repeated Failures
    // More failures = higher maintenance need
    const failureCount = featureSet.repeatedFailureCount || 0;
    const failureScore = Math.max(0, Math.min(100, failureCount * 15)) / 100;
    factors.push({
      factorId: 'repeated-failures',
      label: 'Repeated Failure Count',
      rawValue: failureCount,
      normalizedValue: failureScore,
      weight: weights?.['repeated-failures'] || 0.20,
      contribution: 0,
      confidence: failureCount <= 5 ? 0.90 : 0.70,
      category: 'repeated-failures',
    });

    // Factor 3: Unresolved Signals
    // More signals = higher maintenance need
    const unresolvedSignals = featureSet.unresolvedSignalCount || 0;
    const signalScore = Math.max(0, Math.min(100, unresolvedSignals * 10)) / 100;
    factors.push({
      factorId: 'unresolved-signals',
      label: 'Unresolved Signal Count',
      rawValue: unresolvedSignals,
      normalizedValue: signalScore,
      weight: weights?.['unresolved-signals'] || 0.15,
      contribution: 0,
      confidence: unresolvedSignals <= 5 ? 0.90 : 0.70,
      category: 'unresolved-signals',
    });

    // Factor 4: Event Recency
    // Older events = less confidence in maintenance schedule
    const recencyScore = featureSet.eventRecencyScore || 0;
    factors.push({
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: recencyScore,
      normalizedValue: 1 - recencyScore, // Invert: old = bad
      weight: weights?.['event-recency'] || 0.10,
      contribution: 0,
      confidence: recencyScore || 0.5,
      category: 'event-recency',
    });

    // Factor 5: Trust-Weighted Evidence
    // Lower trust = less confidence in maintenance data
    const trustScore = featureSet.trustWeightedEvidenceScore || 0;
    factors.push({
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: trustScore,
      normalizedValue: 1 - trustScore, // Invert: low trust = bad
      weight: weights?.['trust-evidence'] || 0.10,
      contribution: 0,
      confidence: trustScore || 0.6,
      category: 'trust-evidence',
    });

    // Factor 6: Provenance Strength
    // Poor provenance = less reliable maintenance prediction
    const provenanceScore = featureSet.provenanceStrength || 0;
    factors.push({
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: provenanceScore,
      normalizedValue: 1 - provenanceScore, // Invert: poor provenance = bad
      weight: weights?.['provenance'] || 0.05,
      contribution: 0,
      confidence: provenanceScore || 0.65,
      category: 'provenance',
    });

    // Factor 7: Utilization Rate
    // Higher utilization = more maintenance needed
    const utilizationRate = featureSet.utilizationRate || 0.5;
    factors.push({
      factorId: 'utilization-rate',
      label: 'Utilization Rate',
      rawValue: utilizationRate,
      normalizedValue: utilizationRate,
      weight: weights?.['utilization-rate'] || 0.05,
      contribution: 0,
      confidence: utilizationRate || 0.75,
      category: 'utilization-rate',
    });

    // Factor 8: Entity Age
    // Older vehicles need more maintenance
    const entityAge = featureSet.entityAgeInDays || 0;
    const ageScore = Math.min(100, (entityAge / 3650) * 100) / 100; // Scale to vehicle age (assume 10 years = high maintenance need)
    factors.push({
      factorId: 'entity-age',
      label: 'Entity Age (Days)',
      rawValue: entityAge,
      normalizedValue: ageScore,
      weight: weights?.['entity-age'] || 0.03,
      contribution: 0,
      confidence: 0.85,
      category: 'entity-age',
    });

    // Factor 9: Data Quality
    // Lower quality = less confidence in maintenance assessment
    const qualityScore = (featureSet.customFeatures?.['dataQualityScore'] as number) || 0.75;
    factors.push({
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: qualityScore,
      normalizedValue: 1 - qualityScore, // Invert: low quality = bad
      weight: weights?.['data-quality'] || 0.02,
      contribution: 0,
      confidence: qualityScore || 0.75,
      category: 'data-quality',
    });

    return factors;
  }

  /**
   * Derive maintenance-specific penalties.
   */
  private deriveMaintenancePenalties(featureSet: any, input: any) {
    const penalties = [];

    // Penalty: Stale snapshot
    if (input.snapshot.stale) {
      penalties.push({
        penaltyType: PenaltyType.STALE_DATA,
        label: 'Stale maintenance data',
        penaltyValue: 0.12,
        reason: 'No recent maintenance records or service data',
      });
    }

    // Penalty: Missing maintenance flags
    if ((featureSet.repeatedFailureCount || 0) > 0) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Active failure patterns',
        penaltyValue: 0.10,
        reason: 'Repeated failures indicate immediate maintenance need',
      });
    }

    // Penalty: Low trust in maintenance evidence
    if ((featureSet.trustWeightedEvidenceScore || 0) < 0.4) {
      penalties.push({
        penaltyType: PenaltyType.LOW_CONFIDENCE,
        label: 'Low confidence in maintenance data',
        penaltyValue: 0.08,
        reason: 'Trust metrics suggest uncertain maintenance schedule',
      });
    }

    // Penalty: Missing maintenance evidence
    if ((featureSet.provenanceStrength || 0) < 0.3) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Missing maintenance evidence',
        penaltyValue: 0.06,
        reason: 'Insufficient maintenance history or service records',
      });
    }

    return penalties;
  }

  /**
   * Default weighting profile for maintenance calculation.
   */
  private defaultWeightingProfile() {
    return {
      profileId: 'maintenance-standard-v1',
      weights: {
        'maintenance-delay': 0.30,
        'repeated-failures': 0.20,
        'unresolved-signals': 0.15,
        'event-recency': 0.10,
        'trust-evidence': 0.10,
        'provenance': 0.05,
        'utilization-rate': 0.05,
        'entity-age': 0.03,
        'data-quality': 0.02,
      },
      lowConfidenceMultiplier: 0.85,
    };
  }

  /**
   * Generate human-readable explanation.
   */
  private generateExplanation(
    score: number,
    band: IndexBand,
    factors: IndexFactor[],
    penalties: any[],
  ): IndexExplanation {
    const sortedByContribution = [...factors].sort((a, b) => (b.contribution || 0) - (a.contribution || 0));
    const topPositive = sortedByContribution.slice(0, 2);
    const topNegative = sortedByContribution.slice(-2).reverse();

    let interpretation = '';
    let recommendation = '';
    let maintenanceUrgency = '';

    if (band === IndexBand.OPTIMAL) {
      interpretation = 'Maintenance not urgent. Vehicle is well-maintained.';
      recommendation = 'Continue regular scheduled maintenance. No immediate action required.';
      maintenanceUrgency = 'Non-urgent';
    } else if (band === IndexBand.LOW) {
      interpretation = 'Maintenance upcoming but not immediate. Schedule for next service window.';
      recommendation = 'Plan maintenance within the next 30 days. Monitor for changes.';
      maintenanceUrgency = 'Planned';
    } else if (band === IndexBand.MEDIUM) {
      interpretation = 'Maintenance should be scheduled soon. Address identified issues.';
      recommendation = 'Schedule maintenance within the next 10-14 days. Review unresolved signals.';
      maintenanceUrgency = 'Upcoming';
    } else if (band === IndexBand.HIGH) {
      interpretation = 'Maintenance is urgent. Multiple issues detected that require attention.';
      recommendation = 'Schedule maintenance within the next 5-7 days. Prioritize failed components.';
      maintenanceUrgency = 'Urgent';
    } else {
      interpretation = 'Maintenance is critically overdue. Vehicle operation is at risk.';
      recommendation = 'Schedule maintenance immediately. Consider reduction of operational load.';
      maintenanceUrgency = 'Critical';
    }

    const positiveFactors = topPositive.map((f) => `${f.label} (+${((f.contribution || 0) * 100).toFixed(1)}%)`);
    const negativeFactors = topNegative.map((f) => `${f.label} (${((f.contribution || 0) * 100).toFixed(1)}%)`);

    return {
      summary: `Maintenance Index: ${(score * 100).toFixed(1)}% (Band: ${band}). ${interpretation}`,
      positiveFactors,
      negativeFactors,
      recommendedActions: [recommendation],
      comparison: `Maintenance urgency: ${maintenanceUrgency}`,
      trend: 'stable',
    };
  }
}
