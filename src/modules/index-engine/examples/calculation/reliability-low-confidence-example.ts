import { IndexCalculationRequest } from '../../domain/calculation/schemas/index-calculation-request';
import { IndexCalculationResult } from '../../domain/calculation/schemas/index-calculation-result';
import { IndexType } from '../../domain/enums/index-type';
import { IndexBand } from '../../domain/enums/index-band';
import { vehicleInputExample } from '../vehicle-input-example';

/**
 * Example: RELIABILITY_INDEX Calculation - Low-Confidence Vehicle
 * Scenario: Vehicle with insufficient data quality, limited evidence, and low trust scores.
 * Expected result: Unreliable assessment with low confidence (MEDIUM band).
 */
export const lowConfidenceVehicleReliabilityRequest: IndexCalculationRequest = {
  indexType: IndexType.RELIABILITY_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-low-confidence-001',
    inputId: 'VEHICLE:vehicle-low-confidence-001:2026-03-14T10:30:00Z',
    eventCount: 45,
    trustScore: 0.38,
    provenanceScore: 0.35,
    dataQualityScore: 0.42,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: true,
      freshnessSeconds: 7200,
      dataCompletenessPercent: 28,
    },
    featureSet: {
      repeatedFailureCount: 2,
      unresolvedSignalCount: 0,
      eventRecencyScore: 0.15,
      trustWeightedEvidenceScore: 0.32,
      provenanceStrength: 0.25,
      sourceDiversity: 0.18,
      customFeatures: { dataQualityScore: 0.38 },
    },
  },
  weightingProfile: {
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
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: RELIABILITY_INDEX Result - Low-Confidence Vehicle
 * Calculated result showing moderate score with LOW confidence - assessment unreliable.
 */
export const lowConfidenceVehicleReliabilityResult: IndexCalculationResult = {
  indexType: IndexType.RELIABILITY_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-low-confidence-001',
  rawScore: 48.5,
  normalizedScore: 0.485,
  band: IndexBand.MEDIUM,
  confidence: 0.38,
  breakdown: {
    baseScore: 48.5,
    weightedScore: 47.2,
    penaltyScore: 0.33,
    finalScore: 0.4687,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'failure-history',
      label: 'Repeated Failure History',
      rawValue: 2,
      normalizedValue: 0.70,
      weight: 0.25,
      contribution: 0.175,
      confidence: 0.40,
      category: 'failure-history',
    },
    {
      factorId: 'signal-resolution',
      label: 'Signal Resolution Status',
      rawValue: 0,
      normalizedValue: 1.0,
      weight: 0.20,
      contribution: 0.20,
      confidence: 0.25,
      category: 'signal-resolution',
    },
    {
      factorId: 'data-recency',
      label: 'Data Recency',
      rawValue: 0.15,
      normalizedValue: 0.15,
      weight: 0.15,
      contribution: 0.0225,
      confidence: 0.15,
      category: 'data-recency',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.32,
      normalizedValue: 0.32,
      weight: 0.20,
      contribution: 0.064,
      confidence: 0.32,
      category: 'trust-evidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.25,
      normalizedValue: 0.25,
      weight: 0.10,
      contribution: 0.025,
      confidence: 0.25,
      category: 'provenance',
    },
    {
      factorId: 'source-diversity',
      label: 'Data Source Diversity',
      rawValue: 0.18,
      normalizedValue: 0.18,
      weight: 0.05,
      contribution: 0.009,
      confidence: 0.18,
      category: 'source-diversity',
    },
    {
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: 0.38,
      normalizedValue: 0.38,
      weight: 0.05,
      contribution: 0.019,
      confidence: 0.38,
      category: 'data-quality',
    },
  ],
  penalties: [
    {
      penaltyType: 'MISSING_DATA',
      label: 'Insufficient data volume',
      penaltyValue: 0.15,
      reason: 'Very few events recorded (45 total) - insufficient for reliable assessment',
    },
    {
      penaltyType: 'STALE_DATA',
      label: 'Stale reliability assessment',
      penaltyValue: 0.10,
      reason: 'No recent events and stale data makes reliability assessment unreliable',
    },
    {
      penaltyType: 'LOW_CONFIDENCE',
      label: 'Low trust score evidence',
      penaltyValue: 0.08,
      reason: 'Graph trust metrics below 0.5 suggest incomplete reliability evidence',
    },
  ],
  explanation: {
    summary: 'Reliability Index: 48.5% (Band: MEDIUM). Assessment unreliable due to insufficient data quality and trust - confidence only 38%.',
    positiveFactors: [
      'Signal Resolution Status (+20.0%)',
    ],
    negativeFactors: [
      'Data Recency (+2.25%)',
      'Trust-Weighted Evidence Quality (+6.4%)',
    ],
    recommendedActions: [
      'CRITICAL: Collect more data before making reliability decisions. Current assessment has only 38% confidence.',
      'Update all data sources to obtain recent, trustworthy evidence.',
      'Re-calculate after improving data completeness above 60%.',
      'Do not rely on this assessment for maintenance or operational decisions.',
    ],
    comparison: 'Score below 75% benchmark',
    trend: 'unknown',
  },
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  metadata: {
    calculator: 'ReliabilityIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'reliability-standard-v1',
    confidenceCaveat: 'Result unreliable - insufficient data quality',
  },
};
