import { IndexCalculationRequest, IndexCalculationResult } from '../../domain/calculation/schemas';
import { IndexType } from '../../domain/enums/index-type';
import { IndexBand } from '../../domain/enums/index-band';
import { vehicleInputExample } from '../vehicle-input-example';
import { IndexCalculationResultValidator } from '../../domain/calculation/index-calculation-result-validator';

/**
 * Example: RELIABILITY_INDEX calculation request
 */
export const reliabilityCalculationRequestExample: IndexCalculationRequest = {
  indexType: IndexType.RELIABILITY_INDEX,
  input: vehicleInputExample,
  calculationContext: 'daily',
  weightingProfile: {
    profileId: 'reliability-standard-v1',
    weights: {
      'reliability': 0.35,
      'history': 0.25,
      'age': 0.15,
      'maintenance': 0.15,
      'data-quality': 0.1,
    },
    lowConfidenceMultiplier: 0.8,
  },
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: RELIABILITY_INDEX calculation result
 */
export const reliabilityCalculationResultExample: IndexCalculationResult = {
  indexType: IndexType.RELIABILITY_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: vehicleInputExample.subjectId,
  rawScore: 78.5,
  normalizedScore: 0.785,
  band: IndexBand.LOW,
  confidence: 0.88,
  breakdown: {
    baseScore: 0.82,
    weightedScore: 0.80,
    penaltyScore: 0.015,
    finalScore: 0.785,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 100,
    },
  },
  factors: [
    {
      factorId: 'factor-001-engine-health',
      label: 'Engine Health Index',
      rawValue: 94,
      normalizedValue: 0.94,
      weight: 0.35,
      contribution: 0.329,
      confidence: 0.92,
      evidenceRefIds: ['signal-001-maintenance-risk'],
      category: 'reliability',
    },
    {
      factorId: 'factor-002-service-history',
      label: 'Service History Compliance',
      rawValue: 0.87,
      normalizedValue: 0.87,
      weight: 0.25,
      contribution: 0.2175,
      confidence: 0.94,
      evidenceRefIds: ['source-service-history'],
      category: 'history',
    },
    {
      factorId: 'factor-003-vehicle-age',
      label: 'Vehicle Age Factor',
      rawValue: 1857,
      normalizedValue: 0.65,
      weight: 0.15,
      contribution: 0.0975,
      confidence: 0.99,
      category: 'age',
    },
    {
      factorId: 'factor-004-maintenance-urgency',
      label: 'Maintenance Urgency Score',
      rawValue: 0.35,
      normalizedValue: 0.35,
      weight: 0.15,
      contribution: 0.0525,
      confidence: 0.87,
      category: 'maintenance',
    },
    {
      factorId: 'factor-005-data-quality',
      label: 'Data Quality Score',
      rawValue: 0.88,
      normalizedValue: 0.88,
      weight: 0.1,
      contribution: 0.088,
      confidence: 0.89,
      category: 'data-quality',
    },
  ],
  penalties: [
    {
      penaltyType: 'STALE_DATA',
      label: 'Data freshness penalty',
      penaltyValue: 0.015,
      reason: 'Data freshness score indicates moderate age',
      evidenceRefIds: ['snapshot-vehicle-001-20260314'],
    },
  ],
  explanation: {
    summary: 'Vehicle demonstrates good overall reliability with stable component performance. Engine system shows 94% health indicator.',
    positiveFactors: [
      'Engine health metric is excellent (94)',
      'Service history compliance is strong (87%)',
      'All critical systems operational',
      'Transmission performance stable',
    ],
    negativeFactors: [
      'Vehicle age (1857 days) reduces future reliability prediction',
      'Minor data freshness gap (180 seconds)',
    ],
    recommendedActions: [
      'Continue standard maintenance schedule',
      'Monitor engine oil quality at next service',
      'Update diagnostic data within 7 days for higher confidence',
    ],
    comparison: 'Above fleet average of 0.72 for this model/year',
    trend: 'Stable over last 90 days',
    nextReviewDate: new Date('2026-04-14T10:30:00Z'),
  },
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  metadata: {
    calculationModel: 'reliability-engine-v2.1',
    executionTimeMs: 125,
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexCalculationResultValidator.validate(reliabilityCalculationResultExample);
