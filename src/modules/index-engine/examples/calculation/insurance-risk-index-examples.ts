import { InsuranceRiskIndexCalculator } from '../../domain/calculation/calculators/insurance-risk-index-calculator';
import { IndexCalculationRequest } from '../../domain/calculation/schemas/index-calculation-request';
import { IndexCalculationResult } from '../../domain/calculation/schemas/index-calculation-result';
import { IndexType } from '../../domain/enums/index-type';
import { IndexBand } from '../../domain/enums/index-band';
import { vehicleInputExample } from '../vehicle-input-example';

/**
 * Example: INSURANCE_RISK_INDEX Calculation - Low Risk Vehicle
 * Scenario: Well-maintained vehicle with minimal failures, good provenance, recent service history.
 * Expected result: Low insurance risk score - OPTIMAL band
 */
export const lowRiskInsuranceRequest: IndexCalculationRequest = {
  indexType: IndexType.INSURANCE_RISK_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-low-risk-insurance',
    inputId: 'VEHICLE:vehicle-low-risk-insurance:2026-03-14T10:30:00Z',
    eventCount: 420,
    trustScore: 0.94,
    provenanceScore: 0.92,
    dataQualityScore: 0.93,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: false,
      freshnessSeconds: 180,
      dataCompletenessPercent: 96,
    },
    featureSet: {
      maintenanceDelayDays: 2,
      repeatedFailureCount: 0,
      unresolvedSignalCount: 0,
      eventRecencyScore: 0.98,
      trustWeightedEvidenceScore: 0.93,
      provenanceStrength: 0.90,
      utilizationRate: 0.35,
      entityAgeInDays: 1095, // ~3 years
      customFeatures: { dataQualityScore: 0.94 },
    },
  },
  weightingProfile: {
    profileId: 'insurance-risk-standard-v1',
    weights: {
      'repeated-failures': 0.25,
      'unresolved-signals': 0.20,
      'maintenance-delay': 0.18,
      'event-recency': 0.08,
      'trust-evidence': 0.08,
      'provenance': 0.06,
      'utilization-rate': 0.06,
      'entity-age': 0.05,
      'data-quality': 0.04,
    },
    lowConfidenceMultiplier: 0.85,
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: INSURANCE_RISK_INDEX Result - Low Risk Vehicle
 * Calculated result showing low insurance risk with optimal band.
 */
export const lowRiskInsuranceResult: IndexCalculationResult = {
  indexType: IndexType.INSURANCE_RISK_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-low-risk-insurance',
  rawScore: 92.0,
  normalizedScore: 0.920,
  band: IndexBand.OPTIMAL,
  confidence: 0.94,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 92.0,
    weightedScore: 91.2,
    penaltyScore: 0,
    finalScore: 0.912,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'repeated-failures',
      label: 'Repeated Failure History',
      rawValue: 0,
      normalizedValue: 0.0,
      weight: 0.25,
      contribution: 0.0,
      confidence: 0.90,
      category: 'repeated-failures',
    },
    {
      factorId: 'unresolved-signals',
      label: 'Unresolved Signal Count',
      rawValue: 0,
      normalizedValue: 0.0,
      weight: 0.20,
      contribution: 0.0,
      confidence: 0.90,
      category: 'unresolved-signals',
    },
    {
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: 2,
      normalizedValue: 0.02,
      weight: 0.18,
      contribution: 0.01,
      confidence: 0.92,
      category: 'maintenance-delay',
    },
    {
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: 0.98,
      normalizedValue: 0.02,
      weight: 0.08,
      contribution: 0.0,
      confidence: 0.98,
      category: 'event-recency',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.93,
      normalizedValue: 0.07,
      weight: 0.08,
      contribution: 0.01,
      confidence: 0.93,
      category: 'trust-evidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.90,
      normalizedValue: 0.10,
      weight: 0.06,
      contribution: 0.01,
      confidence: 0.90,
      category: 'provenance',
    },
    {
      factorId: 'utilization-rate',
      label: 'Utilization Rate',
      rawValue: 0.35,
      normalizedValue: 0.14,
      weight: 0.06,
      contribution: 0.01,
      confidence: 0.75,
      category: 'utilization-rate',
    },
    {
      factorId: 'entity-age',
      label: 'Entity Age (Days)',
      rawValue: 1095,
      normalizedValue: 0.20,
      weight: 0.05,
      contribution: 0.01,
      confidence: 0.85,
      category: 'entity-age',
    },
    {
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: 0.94,
      normalizedValue: 0.06,
      weight: 0.04,
      contribution: 0.0,
      confidence: 0.94,
      category: 'data-quality',
    },
  ],
  penalties: [],
  explanation: {
    summary: 'Insurance Risk Index: 92.0% (Band: OPTIMAL). Low insurance risk. Vehicle is in excellent condition with clean maintenance history.',
    positiveFactors: [
      'Event Recency Score (contributes positively)',
      'Overall Data Quality (contributes positively)',
    ],
    negativeFactors: [],
    recommendedActions: ['Standard insurance rates applicable. No underwriting concerns.'],
    comparison: 'Risk assessment: Low Risk',
    trend: 'stable',
  },
  metadata: {
    calculator: 'InsuranceRiskIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'insurance-risk-standard-v1',
  },
};

/**
 * Example: INSURANCE_RISK_INDEX Calculation - Elevated Risk Vehicle
 * Scenario: Vehicle with multiple failures, maintenance delays, older age, moderate evidence quality issues.
 * Expected result: Elevated insurance risk score - HIGH band
 */
export const elevatedRiskInsuranceRequest: IndexCalculationRequest = {
  indexType: IndexType.INSURANCE_RISK_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-elevated-risk-insurance',
    inputId: 'VEHICLE:vehicle-elevated-risk-insurance:2026-03-14T10:30:00Z',
    eventCount: 285,
    trustScore: 0.68,
    provenanceScore: 0.55,
    dataQualityScore: 0.72,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: false,
      freshnessSeconds: 600,
      dataCompletenessPercent: 80,
    },
    featureSet: {
      maintenanceDelayDays: 32,
      repeatedFailureCount: 4,
      unresolvedSignalCount: 3,
      eventRecencyScore: 0.62,
      trustWeightedEvidenceScore: 0.65,
      provenanceStrength: 0.52,
      utilizationRate: 0.72,
      entityAgeInDays: 3285, // ~9 years
      customFeatures: { dataQualityScore: 0.68 },
    },
  },
  weightingProfile: {
    profileId: 'insurance-risk-standard-v1',
    weights: {
      'repeated-failures': 0.25,
      'unresolved-signals': 0.20,
      'maintenance-delay': 0.18,
      'event-recency': 0.08,
      'trust-evidence': 0.08,
      'provenance': 0.06,
      'utilization-rate': 0.06,
      'entity-age': 0.05,
      'data-quality': 0.04,
    },
    lowConfidenceMultiplier: 0.85,
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: INSURANCE_RISK_INDEX Result - Elevated Risk Vehicle
 * Calculated result showing elevated insurance risk with HIGH band.
 */
export const elevatedRiskInsuranceResult: IndexCalculationResult = {
  indexType: IndexType.INSURANCE_RISK_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-elevated-risk-insurance',
  rawScore: 35.2,
  normalizedScore: 0.352,
  band: IndexBand.HIGH,
  confidence: 0.72,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 35.2,
    weightedScore: 34.8,
    penaltyScore: 0.19,
    finalScore: 0.352,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'repeated-failures',
      label: 'Repeated Failure History',
      rawValue: 4,
      normalizedValue: 0.48,
      weight: 0.25,
      contribution: 0.12,
      confidence: 0.75,
      category: 'repeated-failures',
    },
    {
      factorId: 'unresolved-signals',
      label: 'Unresolved Signal Count',
      rawValue: 3,
      normalizedValue: 0.24,
      weight: 0.20,
      contribution: 0.05,
      confidence: 0.70,
      category: 'unresolved-signals',
    },
    {
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: 32,
      normalizedValue: 0.27,
      weight: 0.18,
      contribution: 0.05,
      confidence: 0.80,
      category: 'maintenance-delay',
    },
    {
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: 0.62,
      normalizedValue: 0.38,
      weight: 0.08,
      contribution: 0.03,
      confidence: 0.62,
      category: 'event-recency',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.65,
      normalizedValue: 0.35,
      weight: 0.08,
      contribution: 0.03,
      confidence: 0.65,
      category: 'trust-evidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.52,
      normalizedValue: 0.48,
      weight: 0.06,
      contribution: 0.03,
      confidence: 0.52,
      category: 'provenance',
    },
    {
      factorId: 'utilization-rate',
      label: 'Utilization Rate',
      rawValue: 0.72,
      normalizedValue: 0.29,
      weight: 0.06,
      contribution: 0.02,
      confidence: 0.75,
      category: 'utilization-rate',
    },
    {
      factorId: 'entity-age',
      label: 'Entity Age (Days)',
      rawValue: 3285,
      normalizedValue: 0.60,
      weight: 0.05,
      contribution: 0.03,
      confidence: 0.85,
      category: 'entity-age',
    },
    {
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: 0.68,
      normalizedValue: 0.32,
      weight: 0.04,
      contribution: 0.01,
      confidence: 0.68,
      category: 'data-quality',
    },
  ],
  penalties: [
    {
      penaltyType: 'low-confidence',
      label: 'Low trust in vehicle evidence',
      penaltyValue: 0.10,
      reason: 'Trust metrics suggest unreliable vehicle condition assessment',
    },
    {
      penaltyType: 'data-quality',
      label: 'Missing maintenance documentation',
      penaltyValue: 0.09,
      reason: 'Insufficient service history or maintenance proof',
    },
  ],
  explanation: {
    summary: 'Insurance Risk Index: 35.2% (Band: HIGH). Elevated insurance risk. Multiple mechanical or structural concerns detected.',
    positiveFactors: [],
    negativeFactors: [
      'Repeated Failure History (+12.0% risk)',
      'Unresolved Signal Count (+5.0% risk)',
    ],
    recommendedActions: ['Underwriting review required. Consider repair/replacement of critical components. Potential rate increase.'],
    comparison: 'Risk assessment: Elevated Risk',
    trend: 'stable',
  },
  metadata: {
    calculator: 'InsuranceRiskIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'insurance-risk-standard-v1',
  },
};

/**
 * Example: INSURANCE_RISK_INDEX Calculation - Low Confidence Insurance Risk
 * Scenario: Vehicle with moderate risk profile but poor data quality, low provenance, incomplete information.
 * Expected result: Moderate-to-high risk score with LOW confidence due to data quality issues
 */
export const lowConfidenceInsuranceRiskRequest: IndexCalculationRequest = {
  indexType: IndexType.INSURANCE_RISK_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-low-confidence-insurance',
    inputId: 'VEHICLE:vehicle-low-confidence-insurance:2026-03-14T10:30:00Z',
    eventCount: 165,
    trustScore: 0.42,
    provenanceScore: 0.28,
    dataQualityScore: 0.48,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: true,
      freshnessSeconds: 2400,
      dataCompletenessPercent: 52,
    },
    featureSet: {
      maintenanceDelayDays: 18,
      repeatedFailureCount: 2,
      unresolvedSignalCount: 2,
      eventRecencyScore: 0.35,
      trustWeightedEvidenceScore: 0.38,
      provenanceStrength: 0.22,
      utilizationRate: 0.65,
      entityAgeInDays: 2190, // ~6 years
      customFeatures: { dataQualityScore: 0.45 },
    },
  },
  weightingProfile: {
    profileId: 'insurance-risk-standard-v1',
    weights: {
      'repeated-failures': 0.25,
      'unresolved-signals': 0.20,
      'maintenance-delay': 0.18,
      'event-recency': 0.08,
      'trust-evidence': 0.08,
      'provenance': 0.06,
      'utilization-rate': 0.06,
      'entity-age': 0.05,
      'data-quality': 0.04,
    },
    lowConfidenceMultiplier: 0.85,
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: INSURANCE_RISK_INDEX Result - Low Confidence Insurance Risk
 * Calculated result showing moderate risk with LOW confidence due to poor data quality and stale snapshots.
 */
export const lowConfidenceInsuranceRiskResult: IndexCalculationResult = {
  indexType: IndexType.INSURANCE_RISK_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-low-confidence-insurance',
  rawScore: 52.8,
  normalizedScore: 0.528,
  band: IndexBand.MEDIUM,
  confidence: 0.58,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 52.8,
    weightedScore: 52.2,
    penaltyScore: 0.32,
    finalScore: 0.528,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'repeated-failures',
      label: 'Repeated Failure History',
      rawValue: 2,
      normalizedValue: 0.24,
      weight: 0.25,
      contribution: 0.06,
      confidence: 0.75,
      category: 'repeated-failures',
    },
    {
      factorId: 'unresolved-signals',
      label: 'Unresolved Signal Count',
      rawValue: 2,
      normalizedValue: 0.16,
      weight: 0.20,
      contribution: 0.03,
      confidence: 0.70,
      category: 'unresolved-signals',
    },
    {
      factorId: 'maintenance-delay',
      label: 'Maintenance Delay (Days)',
      rawValue: 18,
      normalizedValue: 0.15,
      weight: 0.18,
      contribution: 0.03,
      confidence: 0.92,
      category: 'maintenance-delay',
    },
    {
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: 0.35,
      normalizedValue: 0.65,
      weight: 0.08,
      contribution: 0.05,
      confidence: 0.35,
      category: 'event-recency',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.38,
      normalizedValue: 0.62,
      weight: 0.08,
      contribution: 0.05,
      confidence: 0.38,
      category: 'trust-evidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.22,
      normalizedValue: 0.78,
      weight: 0.06,
      contribution: 0.05,
      confidence: 0.22,
      category: 'provenance',
    },
    {
      factorId: 'utilization-rate',
      label: 'Utilization Rate',
      rawValue: 0.65,
      normalizedValue: 0.26,
      weight: 0.06,
      contribution: 0.02,
      confidence: 0.75,
      category: 'utilization-rate',
    },
    {
      factorId: 'entity-age',
      label: 'Entity Age (Days)',
      rawValue: 2190,
      normalizedValue: 0.40,
      weight: 0.05,
      contribution: 0.02,
      confidence: 0.85,
      category: 'entity-age',
    },
    {
      factorId: 'data-quality',
      label: 'Overall Data Quality',
      rawValue: 0.45,
      normalizedValue: 0.55,
      weight: 0.04,
      contribution: 0.02,
      confidence: 0.45,
      category: 'data-quality',
    },
  ],
  penalties: [
    {
      penaltyType: 'stale-data',
      label: 'Stale vehicle data',
      penaltyValue: 0.14,
      reason: 'No recent vehicle inspection or service records',
    },
    {
      penaltyType: 'low-confidence',
      label: 'Low trust in vehicle evidence',
      penaltyValue: 0.10,
      reason: 'Trust metrics suggest unreliable vehicle condition assessment',
    },
    {
      penaltyType: 'data-quality',
      label: 'Missing maintenance documentation',
      penaltyValue: 0.09,
      reason: 'Insufficient service history or maintenance proof',
    },
  ],
  explanation: {
    summary: 'Insurance Risk Index: 52.8% (Band: MEDIUM). Moderate insurance risk. Vehicle has some identified concerns requiring underwriting review.',
    positiveFactors: [],
    negativeFactors: [
      'Repeated Failure History (+6.0% risk)',
      'Unresolved Signal Count (+3.0% risk)',
    ],
    recommendedActions: ['Standard rates with possible surcharge. Complete vehicle inspection required to improve confidence. Address identified maintenance issues to reduce risk.'],
    comparison: 'Risk assessment: Moderate Risk - Low Confidence',
    trend: 'stable',
  },
  metadata: {
    calculator: 'InsuranceRiskIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'insurance-risk-standard-v1',
  },
};
