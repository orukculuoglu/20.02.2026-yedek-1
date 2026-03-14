import { OperationalReadinessIndexCalculator } from '../../domain/calculation/calculators/operational-readiness-index-calculator';
import { IndexCalculationRequest } from '../../domain/calculation/schemas/index-calculation-request';
import { IndexCalculationResult } from '../../domain/calculation/schemas/index-calculation-result';
import { IndexType } from '../../domain/enums/index-type';
import { IndexBand } from '../../domain/enums/index-band';
import { vehicleInputExample } from '../vehicle-input-example';

/**
 * Example: OPERATIONAL_READINESS_INDEX Calculation - Ready Vehicle
 * Scenario: Operationally ready vehicle with no blockers, recent events, complete operational data.
 * Expected result: High readiness score - OPTIMAL band
 */
export const readyOperationalRequest: IndexCalculationRequest = {
  indexType: IndexType.OPERATIONAL_READINESS_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-ready-operational',
    inputId: 'VEHICLE:vehicle-ready-operational:2026-03-14T10:30:00Z',
    eventCount: 410,
    trustScore: 0.93,
    provenanceScore: 0.91,
    dataQualityScore: 0.94,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: false,
      freshnessSeconds: 120,
      dataCompletenessPercent: 97,
    },
    featureSet: {
      unresolvedSignalCount: 0,
      maintenanceDelayDays: 1,
      repeatedFailureCount: 0,
      eventRecencyScore: 0.97,
      trustWeightedEvidenceScore: 0.92,
      provenanceStrength: 0.89,
      utilizationRate: 0.40,
      entityAgeInDays: 1095, // ~3 years
      customFeatures: { dataQualityScore: 0.95 },
    },
  },
  weightingProfile: {
    profileId: 'operational-readiness-standard-v1',
    weights: {
      'unresolved-signals': 0.25,
      'maintenance-delay': 0.22,
      'repeated-failures': 0.20,
      'event-recency': 0.08,
      'trust-evidence': 0.08,
      'provenance': 0.06,
      'utilization-rate': 0.05,
      'entity-age': 0.04,
      'data-quality': 0.02,
    },
    lowConfidenceMultiplier: 0.85,
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: OPERATIONAL_READINESS_INDEX Result - Ready Vehicle
 * Calculated result showing high operational readiness with optimal band.
 */
export const readyOperationalResult: IndexCalculationResult = {
  indexType: IndexType.OPERATIONAL_READINESS_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-ready-operational',
  rawScore: 90.5,
  normalizedScore: 0.905,
  band: IndexBand.OPTIMAL,
  confidence: 0.93,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 90.5,
    weightedScore: 89.8,
    penaltyScore: 0,
    finalScore: 0.898,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'unresolved-signals',
      label: 'Unresolved Operational Signals',
      rawValue: 0,
      normalizedValue: 0.0,
      weight: 0.25,
      contribution: 0.0,
      confidence: 0.90,
      category: 'operational-blockers',
    },
    {
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: 1,
      normalizedValue: 0.01,
      weight: 0.22,
      contribution: 0.0,
      confidence: 0.92,
      category: 'service-readiness',
    },
    {
      factorId: 'repeated-failures',
      label: 'Repeated Failure History',
      rawValue: 0,
      normalizedValue: 0.0,
      weight: 0.20,
      contribution: 0.0,
      confidence: 0.90,
      category: 'reliability-blockers',
    },
    {
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: 0.97,
      normalizedValue: 0.03,
      weight: 0.08,
      contribution: 0.0,
      confidence: 0.97,
      category: 'event-recency',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.92,
      normalizedValue: 0.08,
      weight: 0.08,
      contribution: 0.01,
      confidence: 0.92,
      category: 'trust-evidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.89,
      normalizedValue: 0.11,
      weight: 0.06,
      contribution: 0.01,
      confidence: 0.89,
      category: 'data-provenance',
    },
    {
      factorId: 'utilization-rate',
      label: 'Current Utilization Rate',
      rawValue: 0.40,
      normalizedValue: 0.20,
      weight: 0.05,
      contribution: 0.01,
      confidence: 0.75,
      category: 'operational-load',
    },
    {
      factorId: 'entity-age',
      label: 'Entity Age (Days)',
      rawValue: 1095,
      normalizedValue: 0.20,
      weight: 0.04,
      contribution: 0.01,
      confidence: 0.85,
      category: 'baseline-risk',
    },
    {
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: 0.95,
      normalizedValue: 0.05,
      weight: 0.02,
      contribution: 0.0,
      confidence: 0.95,
      category: 'data-quality',
    },
  ],
  penalties: [],
  explanation: {
    summary: 'Operational Readiness Index: 90.5% (Band: OPTIMAL). Ready to operate. All systems functional, no operational blockers detected.',
    positiveFactors: [
      'Event Recency Score (operational booster)',
      'Overall Data Quality (operational booster)',
    ],
    negativeFactors: [],
    recommendedActions: ['Vehicle/fleet can be deployed immediately. Continue regular monitoring.'],
    comparison: 'Readiness status: Fully Operational',
    trend: 'stable',
  },
  metadata: {
    calculator: 'OperationalReadinessIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'operational-readiness-standard-v1',
  },
};

/**
 * Example: OPERATIONAL_READINESS_INDEX Calculation - Degraded Readiness Vehicle
 * Scenario: Vehicle with operational concerns, maintenance delays, unresolved signals.
 * Expected result: Degraded readiness score - HIGH band
 */
export const degradedOperationalRequest: IndexCalculationRequest = {
  indexType: IndexType.OPERATIONAL_READINESS_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-degraded-operational',
    inputId: 'VEHICLE:vehicle-degraded-operational:2026-03-14T10:30:00Z',
    eventCount: 260,
    trustScore: 0.62,
    provenanceScore: 0.58,
    dataQualityScore: 0.70,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: false,
      freshnessSeconds: 900,
      dataCompletenessPercent: 75,
    },
    featureSet: {
      unresolvedSignalCount: 4,
      maintenanceDelayDays: 28,
      repeatedFailureCount: 3,
      eventRecencyScore: 0.58,
      trustWeightedEvidenceScore: 0.60,
      provenanceStrength: 0.55,
      utilizationRate: 0.68,
      entityAgeInDays: 2920, // ~8 years
      customFeatures: { dataQualityScore: 0.68 },
    },
  },
  weightingProfile: {
    profileId: 'operational-readiness-standard-v1',
    weights: {
      'unresolved-signals': 0.25,
      'maintenance-delay': 0.22,
      'repeated-failures': 0.20,
      'event-recency': 0.08,
      'trust-evidence': 0.08,
      'provenance': 0.06,
      'utilization-rate': 0.05,
      'entity-age': 0.04,
      'data-quality': 0.02,
    },
    lowConfidenceMultiplier: 0.85,
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: OPERATIONAL_READINESS_INDEX Result - Degraded Readiness Vehicle
 * Calculated result showing degraded operational readiness with HIGH band.
 */
export const degradedOperationalResult: IndexCalculationResult = {
  indexType: IndexType.OPERATIONAL_READINESS_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-degraded-operational',
  rawScore: 32.5,
  normalizedScore: 0.325,
  band: IndexBand.HIGH,
  confidence: 0.68,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 32.5,
    weightedScore: 32.0,
    penaltyScore: 0.18,
    finalScore: 0.325,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'unresolved-signals',
      label: 'Unresolved Operational Signals',
      rawValue: 4,
      normalizedValue: 0.40,
      weight: 0.25,
      contribution: 0.10,
      confidence: 0.70,
      category: 'operational-blockers',
    },
    {
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: 28,
      normalizedValue: 0.28,
      weight: 0.22,
      contribution: 0.06,
      confidence: 0.78,
      category: 'service-readiness',
    },
    {
      factorId: 'repeated-failures',
      label: 'Repeated Failure History',
      rawValue: 3,
      normalizedValue: 0.36,
      weight: 0.20,
      contribution: 0.07,
      confidence: 0.75,
      category: 'reliability-blockers',
    },
    {
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: 0.58,
      normalizedValue: 0.42,
      weight: 0.08,
      contribution: 0.03,
      confidence: 0.58,
      category: 'event-recency',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.60,
      normalizedValue: 0.40,
      weight: 0.08,
      contribution: 0.03,
      confidence: 0.60,
      category: 'trust-evidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.55,
      normalizedValue: 0.45,
      weight: 0.06,
      contribution: 0.03,
      confidence: 0.55,
      category: 'data-provenance',
    },
    {
      factorId: 'utilization-rate',
      label: 'Current Utilization Rate',
      rawValue: 0.68,
      normalizedValue: 0.34,
      weight: 0.05,
      contribution: 0.02,
      confidence: 0.75,
      category: 'operational-load',
    },
    {
      factorId: 'entity-age',
      label: 'Entity Age (Days)',
      rawValue: 2920,
      normalizedValue: 0.53,
      weight: 0.04,
      contribution: 0.02,
      confidence: 0.85,
      category: 'baseline-risk',
    },
    {
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: 0.68,
      normalizedValue: 0.32,
      weight: 0.02,
      contribution: 0.01,
      confidence: 0.68,
      category: 'data-quality',
    },
  ],
  penalties: [
    {
      penaltyType: 'low-confidence',
      label: 'Low confidence in operational status',
      penaltyValue: 0.09,
      reason: 'Trust metrics suggest uncertain operational readiness assessment',
    },
    {
      penaltyType: 'data-quality',
      label: 'Missing operational evidence',
      penaltyValue: 0.08,
      reason: 'Insufficient operational or service history to confirm readiness',
    },
  ],
  explanation: {
    summary: 'Operational Readiness Index: 32.5% (Band: HIGH). Reduced operational capability. Significant issues present that limit readiness.',
    positiveFactors: [],
    negativeFactors: [
      'Unresolved Operational Signals (+10.0% impact)',
      'Repeated Failure History (+7.0% impact)',
    ],
    recommendedActions: ['Do not deploy without resolving critical issues. Prioritize maintenance/repairs.'],
    comparison: 'Readiness status: Limited Readiness',
    trend: 'stable',
  },
  metadata: {
    calculator: 'OperationalReadinessIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'operational-readiness-standard-v1',
  },
};

/**
 * Example: OPERATIONAL_READINESS_INDEX Calculation - Low Confidence Readiness
 * Scenario: Vehicle with moderate readiness but poor data quality, low evidence, stale snapshot.
 * Expected result: Moderate readiness with LOW confidence
 */
export const lowConfidenceOperationalRequest: IndexCalculationRequest = {
  indexType: IndexType.OPERATIONAL_READINESS_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-low-confidence-operational',
    inputId: 'VEHICLE:vehicle-low-confidence-operational:2026-03-14T10:30:00Z',
    eventCount: 145,
    trustScore: 0.38,
    provenanceScore: 0.25,
    dataQualityScore: 0.42,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: true,
      freshnessSeconds: 3600,
      dataCompletenessPercent: 48,
    },
    featureSet: {
      unresolvedSignalCount: 2,
      maintenanceDelayDays: 15,
      repeatedFailureCount: 1,
      eventRecencyScore: 0.32,
      trustWeightedEvidenceScore: 0.35,
      provenanceStrength: 0.20,
      utilizationRate: 0.62,
      entityAgeInDays: 2190, // ~6 years
      customFeatures: { dataQualityScore: 0.40 },
    },
  },
  weightingProfile: {
    profileId: 'operational-readiness-standard-v1',
    weights: {
      'unresolved-signals': 0.25,
      'maintenance-delay': 0.22,
      'repeated-failures': 0.20,
      'event-recency': 0.08,
      'trust-evidence': 0.08,
      'provenance': 0.06,
      'utilization-rate': 0.05,
      'entity-age': 0.04,
      'data-quality': 0.02,
    },
    lowConfidenceMultiplier: 0.85,
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: OPERATIONAL_READINESS_INDEX Result - Low Confidence Readiness
 * Calculated result showing moderate readiness with LOW confidence due to poor data quality.
 */
export const lowConfidenceOperationalResult: IndexCalculationResult = {
  indexType: IndexType.OPERATIONAL_READINESS_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-low-confidence-operational',
  rawScore: 54.8,
  normalizedScore: 0.548,
  band: IndexBand.MEDIUM,
  confidence: 0.56,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 54.8,
    weightedScore: 54.2,
    penaltyScore: 0.36,
    finalScore: 0.548,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'unresolved-signals',
      label: 'Unresolved Operational Signals',
      rawValue: 2,
      normalizedValue: 0.20,
      weight: 0.25,
      contribution: 0.05,
      confidence: 0.70,
      category: 'operational-blockers',
    },
    {
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: 15,
      normalizedValue: 0.15,
      weight: 0.22,
      contribution: 0.03,
      confidence: 0.92,
      category: 'service-readiness',
    },
    {
      factorId: 'repeated-failures',
      label: 'Repeated Failure History',
      rawValue: 1,
      normalizedValue: 0.12,
      weight: 0.20,
      contribution: 0.02,
      confidence: 0.90,
      category: 'reliability-blockers',
    },
    {
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: 0.32,
      normalizedValue: 0.68,
      weight: 0.08,
      contribution: 0.05,
      confidence: 0.32,
      category: 'event-recency',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.35,
      normalizedValue: 0.65,
      weight: 0.08,
      contribution: 0.05,
      confidence: 0.35,
      category: 'trust-evidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.20,
      normalizedValue: 0.80,
      weight: 0.06,
      contribution: 0.05,
      confidence: 0.20,
      category: 'data-provenance',
    },
    {
      factorId: 'utilization-rate',
      label: 'Current Utilization Rate',
      rawValue: 0.62,
      normalizedValue: 0.31,
      weight: 0.05,
      contribution: 0.02,
      confidence: 0.75,
      category: 'operational-load',
    },
    {
      factorId: 'entity-age',
      label: 'Entity Age (Days)',
      rawValue: 2190,
      normalizedValue: 0.40,
      weight: 0.04,
      contribution: 0.02,
      confidence: 0.85,
      category: 'baseline-risk',
    },
    {
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: 0.40,
      normalizedValue: 0.60,
      weight: 0.02,
      contribution: 0.01,
      confidence: 0.40,
      category: 'data-quality',
    },
  ],
  penalties: [
    {
      penaltyType: 'stale-data',
      label: 'Stale operational data',
      penaltyValue: 0.12,
      reason: 'No recent operational or service events recorded',
    },
    {
      penaltyType: 'low-confidence',
      label: 'Low confidence in operational status',
      penaltyValue: 0.09,
      reason: 'Trust metrics suggest uncertain operational readiness assessment',
    },
    {
      penaltyType: 'data-quality',
      label: 'Missing operational evidence',
      penaltyValue: 0.08,
      reason: 'Insufficient operational or service history to confirm readiness',
    },
    {
      penaltyType: 'data-quality',
      label: 'Incomplete operational data',
      penaltyValue: 0.07,
      reason: 'Missing critical operational or readiness indicators',
    },
  ],
  explanation: {
    summary: 'Operational Readiness Index: 54.8% (Band: MEDIUM). Conditional readiness. Some operational concerns require attention before deployment.',
    positiveFactors: [],
    negativeFactors: [
      'Unresolved Operational Signals (+5.0% impact)',
      'Repeated Failure History (+2.0% impact)',
    ],
    recommendedActions: ['Address identified issues before planned deployment. Conduct fresh operational assessment to improve confidence.'],
    comparison: 'Readiness status: Conditionally Ready - Low Confidence',
    trend: 'stable',
  },
  metadata: {
    calculator: 'OperationalReadinessIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'operational-readiness-standard-v1',
  },
};
