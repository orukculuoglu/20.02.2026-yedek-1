import { IndexCalculationRequest } from '../../domain/calculation/schemas/index-calculation-request';
import { IndexCalculationResult } from '../../domain/calculation/schemas/index-calculation-result';
import { IndexType } from '../../domain/enums/index-type';
import { IndexBand } from '../../domain/enums/index-band';
import { vehicleInputExample } from '../vehicle-input-example';

/**
 * Example: RELIABILITY_INDEX Calculation - Degraded Vehicle
 * Scenario: Vehicle with multiple failures, unresolved signals, and declining performance.
 * Expected result: Poor reliability score (HIGH band)
 */
export const degradedVehicleReliabilityRequest: IndexCalculationRequest = {
  indexType: IndexType.RELIABILITY_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-degraded-001',
    inputId: 'VEHICLE:vehicle-degraded-001:2026-03-14T10:30:00Z',
    eventCount: 180,
    trustScore: 0.72,
    provenanceScore: 0.65,
    dataQualityScore: 0.68,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: true,
      freshnessSeconds: 3600,
      dataCompletenessPercent: 52,
    },
    featureSet: {
      repeatedFailureCount: 4,
      unresolvedSignalCount: 7,
      eventRecencyScore: 0.35,
      trustWeightedEvidenceScore: 0.58,
      provenanceStrength: 0.52,
      sourceDiversity: 0.42,
      customFeatures: { dataQualityScore: 0.61 },
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
 * Example: RELIABILITY_INDEX Result - Degraded Vehicle
 * Calculated result showing poor reliability score with HIGH band (risk).
 */
export const degradedVehicleReliabilityResult: IndexCalculationResult = {
  indexType: IndexType.RELIABILITY_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-degraded-001',
  rawScore: 32.8,
  normalizedScore: 0.328,
  band: IndexBand.HIGH,
  confidence: 0.71,
  breakdown: {
    baseScore: 32.8,
    weightedScore: 31.5,
    penaltyScore: 0.23,
    finalScore: 0.3127,
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
      rawValue: 4,
      normalizedValue: 0.40,
      weight: 0.25,
      contribution: 0.10,
      confidence: 0.75,
      category: 'failure-history',
    },
    {
      factorId: 'signal-resolution',
      label: 'Signal Resolution Status',
      rawValue: 7,
      normalizedValue: 0.30,
      weight: 0.20,
      contribution: 0.06,
      confidence: 0.70,
      category: 'signal-resolution',
    },
    {
      factorId: 'data-recency',
      label: 'Data Recency',
      rawValue: 0.35,
      normalizedValue: 0.35,
      weight: 0.15,
      contribution: 0.0525,
      confidence: 0.35,
      category: 'data-recency',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.58,
      normalizedValue: 0.58,
      weight: 0.20,
      contribution: 0.116,
      confidence: 0.58,
      category: 'trust-evidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.52,
      normalizedValue: 0.52,
      weight: 0.10,
      contribution: 0.052,
      confidence: 0.52,
      category: 'provenance',
    },
    {
      factorId: 'source-diversity',
      label: 'Data Source Diversity',
      rawValue: 0.42,
      normalizedValue: 0.42,
      weight: 0.05,
      contribution: 0.021,
      confidence: 0.42,
      category: 'source-diversity',
    },
    {
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: 0.61,
      normalizedValue: 0.61,
      weight: 0.05,
      contribution: 0.0305,
      confidence: 0.61,
      category: 'data-quality',
    },
  ],
  penalties: [
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
    {
      penaltyType: 'DATA_QUALITY',
      label: 'Weak data provenance',
      penaltyValue: 0.05,
      reason: 'Poor data lineage quality reduces reliability assessment confidence',
    },
  ],
  explanation: {
    summary: 'Reliability Index: 32.8% (Band: HIGH). Poor vehicle reliability. Notable reliability issues detected.',
    positiveFactors: [
      'Trust-Weighted Evidence Quality (+11.6%)',
    ],
    negativeFactors: [
      'Repeated Failure History (+10.0%)',
      'Signal Resolution Status (+6.0%)',
    ],
    recommendedActions: [
      'Investigate failure patterns immediately. Prioritize diagnosis and repair.',
      'Review unresolved signals and prioritize critical issues.',
      'Update data sources - current assessment confidence is low due to stale data.',
    ],
    comparison: 'Score below 75% benchmark',
    trend: 'declining',
  },
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  metadata: {
    calculator: 'ReliabilityIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'reliability-standard-v1',
  },
};
