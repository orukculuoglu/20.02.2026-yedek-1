import { IndexCalculationRequest, IndexCalculationResult } from '../../domain/calculation/schemas';
import { IndexType } from '../../domain/enums/index-type';
import { IndexBand } from '../../domain/enums/index-band';
import { vehicleInputExample } from '../vehicle-input-example';
import { IndexCalculationResultValidator } from '../../domain/calculation/index-calculation-result-validator';

/**
 * Example: INSURANCE_RISK_INDEX calculation request
 */
export const insuranceRiskCalculationRequestExample: IndexCalculationRequest = {
  indexType: IndexType.INSURANCE_RISK_INDEX,
  input: vehicleInputExample,
  calculationContext: 'underwriting',
  weightingProfile: {
    profileId: 'insurance-risk-standard-v1',
    weights: {
      'claims-history': 0.35,
      'safety-systems': 0.25,
      'driver-behavior': 0.20,
      'reliability': 0.15,
      'data-quality': 0.05,
    },
    lowConfidenceMultiplier: 0.85,
  },
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: INSURANCE_RISK_INDEX calculation result
 */
export const insuranceRiskCalculationResultExample: IndexCalculationResult = {
  indexType: IndexType.INSURANCE_RISK_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: vehicleInputExample.subjectId,
  rawScore: 82.0,
  normalizedScore: 0.82,
  band: IndexBand.LOW,
  confidence: 0.91,
  breakdown: {
    baseScore: 0.84,
    weightedScore: 0.83,
    penaltyScore: 0.01,
    finalScore: 0.82,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 100,
    },
  },
  factors: [
    {
      factorId: 'factor-001-claims-history',
      label: 'Claims History Score',
      rawValue: 'clean-5yr',
      normalizedValue: 0.95,
      weight: 0.35,
      contribution: 0.3325,
      confidence: 0.99,
      category: 'claims-history',
    },
    {
      factorId: 'factor-002-safety-systems',
      label: 'Safety Systems Functionality',
      rawValue: 'full-operational',
      normalizedValue: 0.98,
      weight: 0.25,
      contribution: 0.245,
      confidence: 0.99,
      evidenceRefIds: ['source-obd2-001'],
      category: 'safety-systems',
    },
    {
      factorId: 'factor-003-driver-behavior',
      label: 'Driver Behavior Rating',
      rawValue: 'excellent',
      normalizedValue: 0.88,
      weight: 0.20,
      contribution: 0.176,
      confidence: 0.87,
      category: 'driver-behavior',
    },
    {
      factorId: 'factor-004-reliability',
      label: 'Vehicle Reliability',
      rawValue: 0.78,
      normalizedValue: 0.78,
      weight: 0.15,
      contribution: 0.117,
      confidence: 0.88,
      category: 'reliability',
    },
    {
      factorId: 'factor-005-data-quality',
      label: 'Data Quality',
      rawValue: 0.88,
      normalizedValue: 0.88,
      weight: 0.05,
      contribution: 0.044,
      confidence: 0.89,
      category: 'data-quality',
    },
  ],
  penalties: [
    {
      penaltyType: 'TEMPORAL_DECAY',
      label: 'Historical aging penalty',
      penaltyValue: 0.01,
      reason: 'One weather-related incident from 8 years ago: minor historical impact',
    },
  ],
  explanation: {
    summary: 'Vehicle presents LOW insurance risk profile. Clean claims history over 5 years with excellent safety system functionality and consistent driver behavior.',
    positiveFactors: [
      'Zero insurance claims in last 5 years',
      'Complete functional safety system (ABS, ESC, airbags active)',
      'Excellent driver behavior indicators',
      'No accident history in insurance records',
      'Comprehensive maintenance record maintained',
      'Vehicle operates in lower-risk operational pattern',
    ],
    negativeFactors: [
      'Vehicle occasionally operates in urban congestion (minor risk factor)',
      'One weather-related incident 8 years ago (not at-fault)',
    ],
    recommendedActions: [
      'Maintain current safety system functionality',
      'Continue good driving practices',
      'Consider annual safety inspection',
      'Qualify for usage-based insurance premium reduction',
      'Maintain documentation of maintenance history',
    ],
    comparison: '19% lower risk than fleet average for this vehicle class',
    trend: 'Improving - showing positive 24-month trend',
    nextReviewDate: new Date('2026-06-14T10:30:00Z'),
  },
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  metadata: {
    calculationModel: 'insurance-risk-v3.2',
    executionTimeMs: 145,
    underwritingTier: 'preferred',
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexCalculationResultValidator.validate(insuranceRiskCalculationResultExample);
