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
 * DataQualityIndexCalculator implements deterministic calculation of vehicle intelligence data quality.
 * 
 * This calculator measures the trustworthiness and completeness of the underlying vehicle intelligence data,
 * NOT the vehicle condition itself. It provides a quality/confidence metric for all other index calculations.
 * 
 * Data quality scoring considers:
 * - Data quality score (primary direct measurement)
 * - Trust-weighted evidence (confidence in measurements)
 * - Provenance strength (data lineage and source reliability)
 * - Event recency (freshness of collected data)
 * - Source diversity (variety of evidence sources)
 * - Evidence completeness (unresolved signals indicate incomplete coverage)
 * - Coverage consistency (failure/maintenance patterns reveal weak detection)
 * - Data integration quality (utilization coverage relative to vehicle age)
 * - Maintenance event coverage (delay patterns affect data stability)
 * 
 * Score interpretation (data trustworthiness):
 * - 0.9-1.0 (OPTIMAL): Excellent data quality, comprehensive, fresh, trustworthy
 * - 0.7-0.9 (LOW): Good data quality with minor gaps
 * - 0.4-0.7 (MEDIUM): Adequate data quality with some concerns
 * - 0.2-0.4 (HIGH): Poor data quality, significant gaps or staleness
 * - 0.0-0.2 (CRITICAL): Very poor data quality, essentially unreliable
 * 
 * Note: This calculator measures data quality/confidence, not vehicle condition.
 * Other indices should adjust confidence scores based on this index's results.
 */
export class DataQualityIndexCalculator implements IIndexCalculator {
  /**
   * Calculate data quality index for underlying vehicle intelligence data.
   */
  calculate(request: IndexCalculationRequest): IndexCalculationResult {
    // Validate request
    if (request.indexType !== IndexType.DATA_QUALITY_INDEX) {
      throw new Error(`DataQualityIndexCalculator can only handle DATA_QUALITY_INDEX, got ${request.indexType}`);
    }

    const { input, weightingProfile } = request;
    const featureSet = input.featureSet;

    // ========================================================================
    // Step 1: Extract Data Quality Factors
    // ========================================================================
    const factors = this.deriveDataQualityFactors(featureSet, weightingProfile?.weights);

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
      ...this.deriveDataQualityPenalties(featureSet, input),
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
    // For data quality index, confidence is self-referential but include snapshot freshness
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
      indexType: IndexType.DATA_QUALITY_INDEX,
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
        calculator: 'DataQualityIndexCalculator',
        version: '1.0.0',
        weightingProfile: profile.profileId,
      },
    };
  }

  /**
   * Derive data quality factors from IndexInputFeatureSet.
   * Each factor represents a different aspect of data trustworthiness and completeness.
   */
  private deriveDataQualityFactors(featureSet: any, weights?: Record<string, number>): IndexFactor[] {
    const factors: IndexFactor[] = [];

    // Factor 1: Data Quality Score (primary direct measurement)
    // Higher score = better data quality
    const qualityScore = (featureSet.customFeatures?.['dataQualityScore'] as number) || 0.75;
    factors.push({
      factorId: 'data-quality',
      label: 'Data Quality Score',
      rawValue: qualityScore,
      normalizedValue: qualityScore, // Direct: no transformation
      weight: weights?.['data-quality'] || 0.25,
      contribution: 0,
      confidence: qualityScore || 0.75,
      category: 'data-quality',
    });

    // Factor 2: Trust-Weighted Evidence Score (confidence in measurements)
    // Higher trust = better quality
    const trustScore = featureSet.trustWeightedEvidenceScore || 0;
    factors.push({
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: trustScore,
      normalizedValue: trustScore, // Direct: score already 0-1
      weight: weights?.['trust-evidence'] || 0.20,
      contribution: 0,
      confidence: trustScore || 0.6,
      category: 'measurement-confidence',
    });

    // Factor 3: Provenance Strength (data lineage and source reliability)
    // Higher provenance = better quality
    const provenanceScore = featureSet.provenanceStrength || 0;
    factors.push({
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: provenanceScore,
      normalizedValue: provenanceScore, // Direct: score already 0-1
      weight: weights?.['provenance'] || 0.18,
      contribution: 0,
      confidence: provenanceScore || 0.65,
      category: 'data-lineage',
    });

    // Factor 4: Event Recency Score (freshness of collected data)
    // Higher recency (fresher) = better quality
    const recencyScore = featureSet.eventRecencyScore || 0;
    factors.push({
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: recencyScore,
      normalizedValue: recencyScore, // Direct: recent = good
      weight: weights?.['event-recency'] || 0.12,
      contribution: 0,
      confidence: recencyScore || 0.5,
      category: 'data-freshness',
    });

    // Factor 5: Source Diversity (variety of evidence sources available)
    // Higher diversity = more comprehensive data
    const sourceDiversity = (featureSet.customFeatures?.['sourceDiversity'] as number) || 0.6;
    const diversityScore = Math.min(1.0, sourceDiversity / 1.0); // Normalize to 0-1
    factors.push({
      factorId: 'source-diversity',
      label: 'Source Diversity',
      rawValue: sourceDiversity,
      normalizedValue: diversityScore,
      weight: weights?.['source-diversity'] || 0.10,
      contribution: 0,
      confidence: sourceDiversity || 0.6,
      category: 'evidence-breadth',
    });

    // Factor 6: Evidence Completeness (unresolved signals indicate incomplete coverage)
    // More unresolved signals = less complete data collection
    const unresolvedSignals = featureSet.unresolvedSignalCount || 0;
    const completenessScore = Math.max(0, Math.min(100, 100 - unresolvedSignals * 8)) / 100;
    factors.push({
      factorId: 'evidence-completeness',
      label: 'Evidence Completeness',
      rawValue: unresolvedSignals,
      normalizedValue: completenessScore,
      weight: weights?.['evidence-completeness'] || 0.08,
      contribution: 0,
      confidence: unresolvedSignals <= 5 ? 0.90 : 0.70,
      category: 'coverage-complete',
    });

    // Factor 7: Coverage Consistency (failure/maintenance patterns reveal weak detection)
    // More consistent failures = better monitoring, but high repeated failures = gaps in detection
    const failureCount = featureSet.repeatedFailureCount || 0;
    const consistencyScore = Math.max(0, Math.min(100, 100 - failureCount * 5)) / 100;
    factors.push({
      factorId: 'coverage-consistency',
      label: 'Coverage Consistency',
      rawValue: failureCount,
      normalizedValue: consistencyScore,
      weight: weights?.['coverage-consistency'] || 0.05,
      contribution: 0,
      confidence: failureCount <= 5 ? 0.85 : 0.70,
      category: 'detection-stability',
    });

    // Factor 8: Data Integration Quality (utilization coverage relative to vehicle age)
    // High utilization needs dense monitoring; older vehicles need comprehensive historical data
    const utilizationRate = featureSet.utilizationRate || 0.5;
    const entityAge = featureSet.entityAgeInDays || 0;
    const ageInYears = entityAge / 365;
    const requiredCoverageLevel = Math.min(1.0, utilizationRate + (ageInYears / 15) * 0.3);
    const integrationScore = Math.max(0.3, 1.0 - requiredCoverageLevel * 0.5); // Scale down slightly
    factors.push({
      factorId: 'integration-quality',
      label: 'Data Integration Quality',
      rawValue: requiredCoverageLevel,
      normalizedValue: integrationScore,
      weight: weights?.['integration-quality'] || 0.03,
      contribution: 0,
      confidence: 0.80,
      category: 'coverage-density',
    });

    // Factor 9: Maintenance Event Coverage (delay patterns affect data stability)
    // Maintenance delays may indicate sparse operational data collection
    const maintenanceDelay = featureSet.maintenanceDelayDays || 0;
    const maintenanceImpact = Math.max(0, Math.min(100, 100 - maintenanceDelay)) / 100;
    factors.push({
      factorId: 'maintenance-coverage',
      label: 'Maintenance Event Coverage',
      rawValue: maintenanceDelay,
      normalizedValue: maintenanceImpact,
      weight: weights?.['maintenance-coverage'] || 0.01,
      contribution: 0,
      confidence: maintenanceDelay <= 30 ? 0.85 : 0.65,
      category: 'operational-coverage',
    });

    return factors;
  }

  /**
   * Derive data quality-specific penalties.
   */
  private deriveDataQualityPenalties(featureSet: any, input: any) {
    const penalties = [];

    // Penalty: Stale snapshot (no recent data collection)
    if (input.snapshot.stale) {
      penalties.push({
        penaltyType: PenaltyType.STALE_DATA,
        label: 'Stale data snapshot',
        penaltyValue: 0.12,
        reason: 'No recent data collection or update to vehicle intelligence',
      });
    }

    // Penalty: Low trust score (evidence reliability)
    if ((featureSet.trustWeightedEvidenceScore || 0) < 0.4) {
      penalties.push({
        penaltyType: PenaltyType.LOW_CONFIDENCE,
        label: 'Low trust in collected evidence',
        penaltyValue: 0.10,
        reason: 'Evidence quality metrics suggest unreliable or inconsistent measurements',
      });
    }

    // Penalty: Weak provenance (poor data lineage)
    if ((featureSet.provenanceStrength || 0) < 0.35) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Weak data provenance',
        penaltyValue: 0.09,
        reason: 'Data sources or lineage insufficiently documented or validated',
      });
    }

    // Penalty: Incomplete data flags
    if ((input.snapshot.dataCompletenessPercent || 100) < 60) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Incomplete data collection',
        penaltyValue: 0.08,
        reason: 'Missing critical data fields or attributes for complete vehicle intelligence',
      });
    }

    // Penalty: Low source diversity
    const sourceDiversity = (featureSet.customFeatures?.['sourceDiversity'] as number) || 0.6;
    if (sourceDiversity < 0.4) {
      penalties.push({
        penaltyType: PenaltyType.DATA_QUALITY,
        label: 'Low source diversity',
        penaltyValue: 0.07,
        reason: 'Data from limited sources; cross-validation not possible',
      });
    }

    return penalties;
  }

  /**
   * Default weighting profile for data quality calculation.
   */
  private defaultWeightingProfile() {
    return {
      profileId: 'data-quality-standard-v1',
      weights: {
        'data-quality': 0.25,
        'trust-evidence': 0.20,
        'provenance': 0.18,
        'event-recency': 0.12,
        'source-diversity': 0.10,
        'evidence-completeness': 0.08,
        'coverage-consistency': 0.05,
        'integration-quality': 0.03,
        'maintenance-coverage': 0.01,
      },
      lowConfidenceMultiplier: 0.85,
    };
  }

  /**
   * Generate human-readable explanation for data quality assessment.
   */
  private generateExplanation(
    score: number,
    band: IndexBand,
    factors: IndexFactor[],
    penalties: any[],
  ): IndexExplanation {
    const sortedByContribution = [...factors].sort((a, b) => (b.contribution || 0) - (a.contribution || 0));
    const topStrengths = sortedByContribution.slice(0, 2);
    const topWeaknesses = sortedByContribution.slice(-2).reverse();

    let interpretation = '';
    let recommendation = '';
    let qualityLevel = '';

    if (band === IndexBand.OPTIMAL) {
      interpretation = 'Excellent data quality. Data is comprehensive, fresh, trustworthy, and from diverse sources.';
      recommendation = 'Data is suitable for all analytical and decision-making purposes. Maintain current data collection practices.';
      qualityLevel = 'Excellent Quality';
    } else if (band === IndexBand.LOW) {
      interpretation = 'Good data quality with minor gaps. Generally suitable for analysis with appropriate context.';
      recommendation = 'Data adequacy is acceptable. Address minor gaps in coverage or recency when possible.';
      qualityLevel = 'Good Quality';
    } else if (band === IndexBand.MEDIUM) {
      interpretation = 'Adequate data quality with some concerns. Suitable for analysis but with caveats and validation.';
      recommendation = 'Validate findings with additional sources. Prioritize improving data freshness and coverage.';
      qualityLevel = 'Adequate Quality';
    } else if (band === IndexBand.HIGH) {
      interpretation = 'Poor data quality with significant gaps or staleness. Analysis results should be treated cautiously.';
      recommendation = 'Improve data collection frequency and coverage. Validate conclusions with external sources before decisions.';
      qualityLevel = 'Poor Quality';
    } else {
      interpretation = 'Very poor data quality. Data is insufficient for reliable analysis or decision-making.';
      recommendation = 'Data collection and quality must be significantly improved. Do not rely on analysis results until remediated.';
      qualityLevel = 'Unreliable Quality';
    }

    const strengths = topStrengths
      .filter(f => (f.contribution || 0) < 0.15)
      .map((f) => `${f.label} (quality strength)`);

    const weaknesses = topWeaknesses
      .map((f) => `${f.label} (${((f.contribution || 0) * 100).toFixed(1)}% impact)`);

    return {
      summary: `Data Quality Index: ${(score * 100).toFixed(1)}% (Band: ${band}). ${interpretation}`,
      positiveFactors: strengths,
      negativeFactors: weaknesses,
      recommendedActions: [recommendation],
      comparison: `Data quality level: ${qualityLevel}`,
      trend: 'stable',
    };
  }
}
