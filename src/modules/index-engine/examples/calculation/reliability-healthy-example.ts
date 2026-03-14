import { IndexCalculationRequest } from '../../domain/calculation/schemas/index-calculation-request';
import { IndexCalculationResult } from '../../domain/calculation/schemas/index-calculation-result';
import { IndexType } from '../../domain/enums/index-type';
import { IndexBand } from '../../domain/enums/index-band';
import { vehicleInputExample } from '../vehicle-input-example';

/**
 * Example: RELIABILITY_INDEX Calculation - Healthy Vehicle
 * Scenario: Well-maintained vehicle with minimal failures and recent signals.
 * Expected result: High reliability score (OPTIMAL band)
 */
export const healthyVehicleReliabilityRequest: IndexCalculationRequest = {
  indexType: IndexType.RELIABILITY_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-healthy-001',
    inputId: 'VEHICLE:vehicle-healthy-001:2026-03-14T10:30:00Z',
    eventCount: 450,
    trustScore: 0.94,
    provenanceScore: 0.92,
    dataQualityScore: 0.93,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: false,
      freshnessSeconds: 300,
      dataCompletenessPercent: 95,
    },
    featureSet: {
      repeatedFailureCount: 0,
      unresolvedSignalCount: 0,
      eventRecencyScore: 0.95,
      trustWeightedEvidenceScore: 0.93,
      provenanceStrength: 0.91,
      sourceDiversity: 0.88,
      customFeatures: { dataQualityScore: 0.93 },
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
 * Example: RELIABILITY_INDEX Result - Healthy Vehicle
 * Calculated result showing high reliability score with optimal band.
 */
export const healthyVehicleReliabilityResult: IndexCalculationResult = {
  indexType: IndexType.RELIABILITY_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-healthy-001',
  rawScore: 92.5,
  normalizedScore: 0.925,
  band: IndexBand.OPTIMAL,
  confidence: 0.94,
  breakdown: {
    baseScore: 92.5,
    weightedScore: 92.1,
    penaltyScore: 0,
    finalScore: 0.921,
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
      rawValue: 0,
      normalizedValue: 1.0,
      weight: 0.25,
      contribution: 0.25,
      confidence: 0.95,
      category: 'failure-history',
    },
    {
      factorId: 'signal-resolution',
      label: 'Signal Resolution Status',
      rawValue: 0,
      normalizedValue: 1.0,
      weight: 0.20,
      contribution: 0.20,
      confidence: 0.90,
      category: 'signal-resolution',
    },
    {
      factorId: 'data-recency',
      label: 'Data Recency',
      rawValue: 0.95,
      normalizedValue: 0.95,
      weight: 0.15,
      contribution: 0.1425,
      confidence: 0.95,
      category: 'data-recency',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.93,
      normalizedValue: 0.93,
      weight: 0.20,
      contribution: 0.186,
      confidence: 0.93,
      category: 'trust-evidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.91,
      normalizedValue: 0.91,
      weight: 0.10,
      contribution: 0.091,
      confidence: 0.91,
      category: 'provenance',
    },
    {
      factorId: 'source-diversity',
      label: 'Data Source Diversity',
      rawValue: 0.88,
      normalizedValue: 0.88,
      weight: 0.05,
      contribution: 0.044,
      confidence: 0.88,
      category: 'source-diversity',
    },
    {
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: 0.93,
      normalizedValue: 0.93,
      weight: 0.05,
      contribution: 0.0465,
      confidence: 0.93,
      category: 'data-quality',
    },
  ],
  penalties: [],
  explanation: {
    summary: 'Reliability Index: 92.5% (Band: OPTIMAL). Excellent vehicle reliability. Minimal failure risk detected.',
    positiveFactors: [
      'Repeated Failure History (+25.0%)',
      'Signal Resolution Status (+20.0%)',
    ],
    negativeFactors: [],
    recommendedActions: ['Continue regular preventive maintenance. No immediate actions required.'],
    comparison: 'Score above 75% benchmark',
    trend: 'stable',
  },
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  metadata: {
    calculator: 'ReliabilityIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'reliability-standard-v1',
  },
};
