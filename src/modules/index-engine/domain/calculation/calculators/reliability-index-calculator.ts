import { IIndexCalculator } from '../index-calculator';
import { IndexCalculationRequest } from '../schemas/index-calculation-request';
import { IndexCalculationResult } from '../schemas/index-calculation-result';
import { IndexFactor } from '../schemas/index-factor';
import { IndexType } from '../../enums/index-type';
import { IndexBand, calculateIndexBand } from '../../enums/index-band';
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
 * ReliabilityIndexCalculator implements deterministic calculation of vehicle reliability.
 * 
 * Reliability scoring considers:
 * - Historical failure patterns (repeated failures indicate lower reliability)
 * - Signal completeness (unresolved signals indicate potential issues)
 * - Data recency (fresh data improves confidence)
 * - Trust-weighted evidence (graph trust metrics)
 * - Provenance strength (data lineage quality)
 * - Source diversity (multiple independent sources = higher confidence)
 * - Overall data quality (from snapshot)
 * 
 * Score interpretation:
 * - 0.9-1.0 (OPTIMAL): Excellent reliability, minimal failure risk
 * - 0.7-0.9 (LOW): Good reliability, acceptable risk profile
 * - 0.4-0.7 (MEDIUM): Moderate reliability, monitoring recommended
 * - 0.2-0.4 (HIGH): Poor reliability, issues detected
 * - 0.0-0.2 (CRITICAL): Severe reliability issues, immediate attention needed
 */
export class ReliabilityIndexCalculator implements IIndexCalculator {
  /**
   * Calculate reliability index for a vehicle or component.
   */
  calculate(request: IndexCalculationRequest): IndexCalculationResult {
    // Validate request
    if (request.indexType !== IndexType.RELIABILITY_INDEX) {
      throw new Error(`ReliabilityIndexCalculator can only handle RELIABILITY_INDEX, got ${request.indexType}`);
    }

    const { input, weightingProfile } = request;
    const featureSet = input.featureSet;

    // ========================================================================
    // Step 1: Extract Reliability Factors
    // ========================================================================
    const factors = this.deriveReliabilityFactors(featureSet, weightingProfile?.weights);

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
      ...this.deriveReliabilityPenalties(featureSet, input),
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
      indexType: IndexType.RELIABILITY_INDEX,
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
        calculator: 'ReliabilityIndexCalculator',
        version: '1.0.0',
        weightingProfile: profile.profileId,
      },
    };
  }

  /**
   * Derive reliability factors from IndexInputFeatureSet.
   * Each factor represents a different aspect of vehicle reliability.
   */
  private deriveReliabilityFactors(featureSet: any, weights?: Record<string, number>): IndexFactor[] {
    const factors: IndexFactor[] = [];

    // Factor 1: Repeated Failure History
    // Lower failure count = higher score
    const failureCount = featureSet.repeatedFailureCount || 0;
    const failureScore = Math.max(0, 100 - failureCount * 15) / 100; // Normalize 0-1
    factors.push({
      factorId: 'failure-history',
      label: 'Repeated Failure History',
      rawValue: failureCount,
      normalizedValue: failureScore,
      weight: weights?.['failure-history'] || 0.25,
      contribution: 0,
      confidence: failureCount <= 2 ? 0.95 : 0.75,
      category: 'failure-history',
    });

    // Factor 2: Unresolved Signals
    // More unresolved signals = lower reliability
    const unresolvedSignals = featureSet.unresolvedSignalCount || 0;
    const signalScore = Math.max(0, 100 - unresolvedSignals * 10) / 100;
    factors.push({
      factorId: 'signal-resolution',
      label: 'Signal Resolution Status',
      rawValue: unresolvedSignals,
      normalizedValue: signalScore,
      weight: weights?.['signal-resolution'] || 0.20,
      contribution: 0,
      confidence: unresolvedSignals <= 5 ? 0.90 : 0.70,
      category: 'signal-resolution',
    });

    // Factor 3: Event Recency
    // More recent events = higher confidence in reliability assessment
    const recencyScore = (featureSet.eventRecencyScore || 0);
    factors.push({
      factorId: 'data-recency',
      label: 'Data Recency',
      rawValue: recencyScore,
      normalizedValue: recencyScore,
      weight: weights?.['data-recency'] || 0.15,
      contribution: 0,
      confidence: recencyScore || 0.5,
      category: 'data-recency',
    });

    // Factor 4: Trust-Weighted Evidence
    // Higher trust score = better reliability assessment quality
    const trustScore = (featureSet.trustWeightedEvidenceScore || 0);
    factors.push({
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: trustScore,
      normalizedValue: trustScore,
      weight: weights?.['trust-evidence'] || 0.20,
      contribution: 0,
      confidence: trustScore || 0.6,
      category: 'trust-evidence',
    });

    // Factor 5: Provenance Strength
    // Better data lineage = more reliable assessment
    const provenanceScore = (featureSet.provenanceStrength || 0);
    factors.push({
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: provenanceScore,
      normalizedValue: provenanceScore,
      weight: weights?.['provenance'] || 0.10,
      contribution: 0,
      confidence: provenanceScore || 0.65,
      category: 'provenance',
    });

    // Factor 6: Source Diversity
    // More diverse sources = higher confidence but not directly reliability indicator
    const diversityScore = (featureSet.sourceDiversity || 0.5);
    factors.push({
      factorId: 'source-diversity',
      label: 'Data Source Diversity',
      rawValue: diversityScore,
      normalizedValue: diversityScore,
      weight: weights?.['source-diversity'] || 0.05,
      contribution: 0,
      confidence: diversityScore || 0.7,
      category: 'source-diversity',
    });

    // Factor 7: Data Quality (from input directly)
    // Higher data quality = more reliable assessment
    const qualityScore = (featureSet.customFeatures?.['dataQualityScore'] as number) || 0.75;
    factors.push({
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: qualityScore,
      normalizedValue: qualityScore,
      weight: weights?.['data-quality'] || 0.05,
      contribution: 0,
      confidence: qualityScore || 0.75,
      category: 'data-quality',
    });

    return factors;
  }

  /**
   * Derive reliability-specific penalties.
   */
  private deriveReliabilityPenalties(featureSet: any, input: any) {
    const penalties = [];

    // Penalty: Stale data without recent signals
    if (input.snapshot.stale && featureSet.eventRecencyScore < 0.3) {
      penalties.push({
        penaltyType: PenaltyType.STALE_DATA,
        label: 'Stale reliability assessment',
        penaltyValue: 0.10,
        reason: 'No recent events and stale data makes reliability assessment unreliable',
      });
    }

    // Penalty: Missing trust signals (indicates incomplete network)
    if ((featureSet.trustWeightedEvidenceScore || 0) < 0.5) {
      penalties.push({
        penaltyType: PenaltyType.LOW_CONFIDENCE,
        label: 'Low trust score evidence',
        penaltyValue: 0.08,
        reason: 'Graph trust metrics below 0.5 suggest incomplete reliability evidence',
      });
    }

    // Penalty: No provenance (data source integrity issues)
    if ((featureSet.provenanceStrength || 0) < 0.4) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Weak data provenance',
        penaltyValue: 0.05,
        reason: 'Poor data lineage quality reduces reliability assessment confidence',
      });
    }

    return penalties;
  }

  /**
   * Default weighting profile for reliability calculation.
   */
  private defaultWeightingProfile() {
    return {
      profileId: 'reliability-standard-v1',
      weights: {
        'failure-history': 0.25,
        'signal-resolution': 0.20,
        'data-recency': 0.15,
        'trust-evidence': 0.20,
        'provenance': 0.10,
        'source-diversity': 0.05,
        'data-quality': 0.05,
      },
      lowConfidenceMultiplier: 0.8,
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
    // Identify top positive and negative factors
    const sortedByContribution = [...factors].sort((a, b) => (b.contribution || 0) - (a.contribution || 0));
    const topPositive = sortedByContribution.slice(0, 2);
    const topNegative = sortedByContribution.slice(-2).reverse();

    // Interpretation
    let interpretation = '';
    let recommendation = '';

    if (band === IndexBand.OPTIMAL) {
      interpretation = 'Excellent vehicle reliability. Minimal failure risk detected.';
      recommendation = 'Continue regular preventive maintenance. No immediate actions required.';
    } else if (band === IndexBand.LOW) {
      interpretation = 'Good vehicle reliability. Acceptable risk profile for operation.';
      recommendation = 'Monitor performance metrics regularly. Schedule preventive maintenance as planned.';
    } else if (band === IndexBand.MEDIUM) {
      interpretation = 'Moderate vehicle reliability. Some issues detected that warrant attention.';
      recommendation = 'Review unresolved signals. Consider diagnostic inspection for failing systems.';
    } else if (band === IndexBand.HIGH) {
      interpretation = 'Poor vehicle reliability. Notable reliability issues detected.';
      recommendation = 'Investigate failure patterns immediately. Prioritize diagnosis and repair.';
    } else {
      interpretation = 'Critical reliability issues. Significant failure risk.';
      recommendation = 'Immediate inspection and repair required. Consider vehicle removal from service.';
    }

    const positiveFactors = topPositive.map((f) => `${f.label} (+${((f.contribution || 0) * 100).toFixed(1)}%)`);
    const negativeFactors = topNegative.map((f) => `${f.label} (${((f.contribution || 0) * 100).toFixed(1)}%)`);

    return {
      summary: `Reliability Index: ${(score * 100).toFixed(1)}% (Band: ${band}). ${interpretation}`,
      positiveFactors,
      negativeFactors,
      recommendedActions: [recommendation],
      comparison: `Score ${score >= 0.75 ? 'above' : 'below'} 75% benchmark`,
      trend: 'stable',
    };
  }
}
