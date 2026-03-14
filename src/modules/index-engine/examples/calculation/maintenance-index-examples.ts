import { MaintenanceIndexCalculator } from '../../domain/calculation/calculators/maintenance-index-calculator';
import { IndexCalculationRequest } from '../../domain/calculation/schemas/index-calculation-request';
import { IndexCalculationResult } from '../../domain/calculation/schemas/index-calculation-result';
import { IndexType } from '../../domain/enums/index-type';
import { IndexBand } from '../../domain/enums/index-band';
import { vehicleInputExample } from '../vehicle-input-example';

/**
 * Example: MAINTENANCE_INDEX Calculation - Healthy Maintenance Profile
 * Scenario: Well-maintained vehicle with no delays and recent service records.
 * Expected result: High maintenance score - not urgent (OPTIMAL band)
 */
export const healthyMaintenanceRequest: IndexCalculationRequest = {
  indexType: IndexType.MAINTENANCE_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-healthy-maintenance',
    inputId: 'VEHICLE:vehicle-healthy-maintenance:2026-03-14T10:30:00Z',
    eventCount: 380,
    trustScore: 0.92,
    provenanceScore: 0.90,
    dataQualityScore: 0.91,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: false,
      freshnessSeconds: 300,
      dataCompletenessPercent: 95,
    },
    featureSet: {
      maintenanceDelayDays: 0,
      repeatedFailureCount: 0,
      unresolvedSignalCount: 0,
      eventRecencyScore: 0.95,
      trustWeightedEvidenceScore: 0.90,
      provenanceStrength: 0.85,
      utilizationRate: 0.45,
      entityAgeInDays: 1460, // ~4 years
      customFeatures: { dataQualityScore: 0.92 },
    },
  },
  weightingProfile: {
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
    lowConfidenceMultiplier: 0.8,
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: MAINTENANCE_INDEX Result - Healthy Maintenance Profile
 * Calculated result showing high maintenance score with optimal (non-urgent) band.
 */
export const healthyMaintenanceResult: IndexCalculationResult = {
  indexType: IndexType.MAINTENANCE_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-healthy-maintenance',
  rawScore: 88.5,
  normalizedScore: 0.885,
  band: IndexBand.OPTIMAL,
  confidence: 0.91,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 88.5,
    weightedScore: 87.8,
    penaltyScore: 0,
    finalScore: 0.878,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: 0,
      normalizedValue: 0.0,
      weight: 0.30,
      contribution: 0.0,
      confidence: 1.0,
      category: 'maintenance-delay',
    },
    {
      factorId: 'repeated-failures',
      label: 'Repeated Failures',
      rawValue: 0,
      normalizedValue: 0.0,
      weight: 0.20,
      contribution: 0.0,
      confidence: 0.95,
      category: 'repeated-failures',
    },
    {
      factorId: 'unresolved-signals',
      label: 'Unresolved Signals',
      rawValue: 0,
      normalizedValue: 0.0,
      weight: 0.15,
      contribution: 0.0,
      confidence: 0.90,
      category: 'unresolved-signals',
    },
    {
      factorId: 'event-recency',
      label: 'Event Recency',
      rawValue: 0.95,
      normalizedValue: 0.05, // Inverted
      weight: 0.10,
      contribution: 0.005,
      confidence: 0.90,
      category: 'event-recency',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust in Evidence',
      rawValue: 0.90,
      normalizedValue: 0.10, // Inverted
      weight: 0.10,
      contribution: 0.01,
      confidence: 0.88,
      category: 'trust-evidence',
    },
  ],
  penalties: [],
  explanation: {
    summary: 'Vehicle maintenance is well-maintained with no urgent needs.',
    positiveFactors: [
      'No maintenance delay detected',
      'No recent failure patterns',
      'All signals resolved',
      'Recent event data available',
    ],
    negativeFactors: [],
    recommendedActions: ['Continue regular maintenance schedule', 'No action required'],
  },
};

/**
 * Example: MAINTENANCE_INDEX Calculation - Overdue Maintenance Profile
 * Scenario: Vehicle with significant maintenance delay and active failure patterns.
 * Expected result: Low maintenance score - urgent (HIGH band)
 */
export const overdueMaintenanceRequest: IndexCalculationRequest = {
  indexType: IndexType.MAINTENANCE_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-overdue-maintenance',
    inputId: 'VEHICLE:vehicle-overdue-maintenance:2026-03-14T10:30:00Z',
    eventCount: 520,
    trustScore: 0.65,
    provenanceScore: 0.55,
    dataQualityScore: 0.68,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: true,
      freshnessSeconds: 7200,
      dataCompletenessPercent: 72,
    },
    featureSet: {
      maintenanceDelayDays: 45,
      repeatedFailureCount: 3,
      unresolvedSignalCount: 5,
      eventRecencyScore: 0.55,
      trustWeightedEvidenceScore: 0.60,
      provenanceStrength: 0.50,
      utilizationRate: 0.80,
      entityAgeInDays: 2920, // ~8 years
      customFeatures: { dataQualityScore: 0.65 },
    },
  },
  weightingProfile: {
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
    lowConfidenceMultiplier: 0.8,
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: MAINTENANCE_INDEX Result - Overdue Maintenance Profile
 * Calculated result showing low maintenance score with high-urgency band.
 */
export const overdueMaintenanceResult: IndexCalculationResult = {
  indexType: IndexType.MAINTENANCE_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-overdue-maintenance',
  rawScore: 28.5,
  normalizedScore: 0.285,
  band: IndexBand.HIGH,
  confidence: 0.68,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 28.5,
    weightedScore: 35.2,
    penaltyScore: 0.22,
    finalScore: 0.285,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: 45,
      normalizedValue: 0.45,
      weight: 0.30,
      contribution: 0.135,
      confidence: 0.80,
      category: 'maintenance-delay',
    },
    {
      factorId: 'repeated-failures',
      label: 'Repeated Failures',
      rawValue: 3,
      normalizedValue: 0.45,
      weight: 0.20,
      contribution: 0.09,
      confidence: 0.70,
      category: 'repeated-failures',
    },
    {
      factorId: 'unresolved-signals',
      label: 'Unresolved Signals',
      rawValue: 5,
      normalizedValue: 0.50,
      weight: 0.15,
      contribution: 0.075,
      confidence: 0.65,
      category: 'unresolved-signals',
    },
  ],
  penalties: [
    {
      penaltyType: 'STALE_DATA',
      label: 'Stale maintenance data',
      penaltyValue: 0.12,
      reason: 'No recent maintenance records or service data',
    },
    {
      penaltyType: 'DATA_QUALITY',
      label: 'Active failure patterns',
      penaltyValue: 0.10,
      reason: 'Repeated failures indicate immediate maintenance need',
    },
  ],
  explanation: {
    summary: 'Vehicle maintenance is OVERDUE and requires immediate attention.',
    positiveFactors: [],
    negativeFactors: [
      '45 days overdue for maintenance',
      '3 recent failure patterns detected',
      '5 unresolved signals pending',
      'Low trust in maintenance data',
    ],
    recommendedActions: [
      'Schedule maintenance immediately',
      'Address active failures first',
      'Review maintenance history',
    ],
  },
};

/**
 * Example: MAINTENANCE_INDEX Calculation - Low Confidence Maintenance Profile
 * Scenario: Vehicle with uncertain maintenance status due to missing data.
 * Expected result: Medium maintenance score with low confidence (MEDIUM band)
 */
export const lowConfidenceMaintenanceRequest: IndexCalculationRequest = {
  indexType: IndexType.MAINTENANCE_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-low-confidence-maintenance',
    inputId: 'VEHICLE:vehicle-low-confidence-maintenance:2026-03-14T10:30:00Z',
    eventCount: 120,
    trustScore: 0.42,
    provenanceScore: 0.38,
    dataQualityScore: 0.45,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: false,
      freshnessSeconds: 1800,
      dataCompletenessPercent: 58,
    },
    featureSet: {
      maintenanceDelayDays: 15,
      repeatedFailureCount: 1,
      unresolvedSignalCount: 2,
      eventRecencyScore: 0.65,
      trustWeightedEvidenceScore: 0.35,
      provenanceStrength: 0.30,
      utilizationRate: 0.55,
      entityAgeInDays: 2190, // ~6 years
      customFeatures: { dataQualityScore: 0.40 },
    },
  },
  weightingProfile: {
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
    lowConfidenceMultiplier: 0.8,
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: MAINTENANCE_INDEX Result - Low Confidence Maintenance Profile
 * Calculated result showing medium maintenance score with low confidence level.
 */
export const lowConfidenceMaintenanceResult: IndexCalculationResult = {
  indexType: IndexType.MAINTENANCE_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-low-confidence-maintenance',
  rawScore: 48.5,
  normalizedScore: 0.485,
  band: IndexBand.MEDIUM,
  confidence: 0.58,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 48.5,
    weightedScore: 50.2,
    penaltyScore: 0.08,
    finalScore: 0.485,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: 15,
      normalizedValue: 0.15,
      weight: 0.30,
      contribution: 0.045,
      confidence: 0.55,
      category: 'maintenance-delay',
    },
    {
      factorId: 'repeated-failures',
      label: 'Repeated Failures',
      rawValue: 1,
      normalizedValue: 0.15,
      weight: 0.20,
      contribution: 0.03,
      confidence: 0.45,
      category: 'repeated-failures',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust in Evidence',
      rawValue: 0.35,
      normalizedValue: 0.65, // Inverted
      weight: 0.10,
      contribution: 0.065,
      confidence: 0.40,
      category: 'trust-evidence',
    },
  ],
  penalties: [
    {
      penaltyType: 'LOW_CONFIDENCE',
      label: 'Low confidence in maintenance data',
      penaltyValue: 0.08,
      reason: 'Trust metrics suggest uncertain maintenance schedule',
    },
  ],
  explanation: {
    summary: 'Vehicle maintenance status is uncertain due to incomplete maintenance records.',
    positiveFactors: ['No critical failures detected', 'Some recent event data available'],
    negativeFactors: [
      'Incomplete maintenance history',
      'Low trust in available data',
      'Limited visibility into maintenance schedule',
    ],
    recommendedActions: [
      'Gather additional maintenance records',
      'Obtain service history documentation',
      'Re-assess maintenance needs when more data is available',
    ],
  },
};
