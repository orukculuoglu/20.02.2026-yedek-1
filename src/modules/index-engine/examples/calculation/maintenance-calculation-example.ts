import { IndexCalculationRequest, IndexCalculationResult } from '../../domain/calculation/schemas';
import { IndexType } from '../../domain/enums/index-type';
import { IndexBand } from '../../domain/enums/index-band';
import { componentInputExample } from '../component-input-example';
import { IndexCalculationResultValidator } from '../../domain/calculation/index-calculation-result-validator';

/**
 * Example: MAINTENANCE_INDEX calculation request
 */
export const maintenanceCalculationRequestExample: IndexCalculationRequest = {
  indexType: IndexType.MAINTENANCE_INDEX,
  input: componentInputExample,
  calculationContext: 'alert-driven',
  weightingProfile: {
    profileId: 'maintenance-standard-v1',
    weights: {
      'service-urgency': 0.40,
      'overdue-days': 0.35,
      'failure-risk': 0.15,
      'data-quality': 0.10,
    },
    lowConfidenceMultiplier: 0.75,
  },
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: MAINTENANCE_INDEX calculation result
 */
export const maintenanceCalculationResultExample: IndexCalculationResult = {
  indexType: IndexType.MAINTENANCE_INDEX,
  subjectType: componentInputExample.subjectType,
  subjectId: componentInputExample.subjectId,
  rawScore: 35.0,
  normalizedScore: 0.35,
  band: IndexBand.HIGH,
  confidence: 0.85,
  breakdown: {
    baseScore: 0.38,
    weightedScore: 0.36,
    penaltyScore: 0.01,
    finalScore: 0.35,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 100,
    },
  },
  factors: [
    {
      factorId: 'factor-001-service-urgency',
      label: 'Service Urgency Score',
      rawValue: 'high',
      normalizedValue: 0.45,
      weight: 0.40,
      contribution: 0.18,
      confidence: 0.89,
      evidenceRefIds: ['signal-engine-anomaly'],
      category: 'service-urgency',
    },
    {
      factorId: 'factor-002-overdue-days',
      label: 'Service Overdue Days',
      rawValue: 187,
      normalizedValue: 0.35,
      weight: 0.35,
      contribution: 0.1225,
      confidence: 0.99,
      category: 'overdue-days',
    },
    {
      factorId: 'factor-003-failure-risk',
      label: 'Component Failure Risk',
      rawValue: 0.23,
      normalizedValue: 0.23,
      weight: 0.15,
      contribution: 0.0345,
      confidence: 0.85,
      category: 'failure-risk',
    },
    {
      factorId: 'factor-004-data-quality',
      label: 'Data Quality Score',
      rawValue: 0.91,
      normalizedValue: 0.91,
      weight: 0.10,
      contribution: 0.091,
      confidence: 0.91,
      category: 'data-quality',
    },
  ],
  penalties: [
    {
      penaltyType: 'STALE_DATA',
      label: 'Snapshot freshness penalty',
      penaltyValue: 0.01,
      reason: 'Data freshness 300 seconds exceeds optimal threshold',
    },
  ],
  explanation: {
    summary: 'Engine oil change service is URGENTLY REQUIRED. Oil analysis shows viscosity degradation and elevated wear metal concentrations.',
    positiveFactors: [
      'Oil filter condition acceptable',
      'Engine block temperature under control',
    ],
    negativeFactors: [
      'Oil viscosity degraded by 23% from baseline',
      'Iron wear metals elevated to 87 ppm (warning threshold 100 ppm)',
      'Service interval exceeded by 2,340 miles',
      'Last service was 187 days ago (interval: 180 days)',
    ],
    recommendedActions: [
      'URGENT: Schedule oil and filter change within 5 days',
      'Inspect engine filter head for contamination',
      'Run diagnostic on fuel injectors',
      'Document maintenance action in service record',
      'Plan follow-up inspection after service',
    ],
    comparison: '47% more urgent than fleet average for this component type',
    trend: 'Degrading - progressed from MEDIUM band 14 days ago to HIGH today',
    nextReviewDate: new Date('2026-03-21T10:30:00Z'),
  },
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  metadata: {
    calculationModel: 'maintenance-engine-v1.8',
    executionTimeMs: 98,
  },
};

/**
 * Validate the example to ensure it's correct
 */
IndexCalculationResultValidator.validate(maintenanceCalculationResultExample);
