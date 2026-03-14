import { DataQualityIndexCalculator } from '../../domain/calculation/calculators/data-quality-index-calculator';
import { IndexCalculationRequest } from '../../domain/calculation/schemas/index-calculation-request';
import { IndexCalculationResult } from '../../domain/calculation/schemas/index-calculation-result';
import { IndexType } from '../../domain/enums/index-type';
import { IndexBand } from '../../domain/enums/index-band';
import { vehicleInputExample } from '../vehicle-input-example';

/**
 * Example: DATA_QUALITY_INDEX Calculation - High Quality Data
 * Scenario: Comprehensive, fresh, trustworthy data from diverse sources.
 * Expected result: High data quality score - OPTIMAL band
 */
export const highQualityDataRequest: IndexCalculationRequest = {
  indexType: IndexType.DATA_QUALITY_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-high-quality-data',
    inputId: 'VEHICLE:vehicle-high-quality-data:2026-03-14T10:30:00Z',
    eventCount: 450,
    trustScore: 0.95,
    provenanceScore: 0.93,
    dataQualityScore: 0.96,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: false,
      freshnessSeconds: 60,
      dataCompletenessPercent: 99,
    },
    featureSet: {
      unresolvedSignalCount: 0,
      maintenanceDelayDays: 0,
      repeatedFailureCount: 0,
      eventRecencyScore: 0.99,
      trustWeightedEvidenceScore: 0.95,
      provenanceStrength: 0.92,
      utilizationRate: 0.48,
      entityAgeInDays: 1095, // ~3 years
      customFeatures: { 
        dataQualityScore: 0.96,
        sourceDiversity: 0.92,
      },
    },
  },
  weightingProfile: {
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
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: DATA_QUALITY_INDEX Result - High Quality Data
 * Calculated result showing excellent data quality with optimal band.
 */
export const highQualityDataResult: IndexCalculationResult = {
  indexType: IndexType.DATA_QUALITY_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-high-quality-data',
  rawScore: 94.0,
  normalizedScore: 0.940,
  band: IndexBand.OPTIMAL,
  confidence: 0.96,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 94.0,
    weightedScore: 93.2,
    penaltyScore: 0,
    finalScore: 0.932,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'data-quality',
      label: 'Data Quality Score',
      rawValue: 0.96,
      normalizedValue: 0.96,
      weight: 0.25,
      contribution: 0.24,
      confidence: 0.96,
      category: 'data-quality',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.95,
      normalizedValue: 0.95,
      weight: 0.20,
      contribution: 0.19,
      confidence: 0.95,
      category: 'measurement-confidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.92,
      normalizedValue: 0.92,
      weight: 0.18,
      contribution: 0.17,
      confidence: 0.92,
      category: 'data-lineage',
    },
    {
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: 0.99,
      normalizedValue: 0.99,
      weight: 0.12,
      contribution: 0.12,
      confidence: 0.99,
      category: 'data-freshness',
    },
    {
      factorId: 'source-diversity',
      label: 'Source Diversity',
      rawValue: 0.92,
      normalizedValue: 0.92,
      weight: 0.10,
      contribution: 0.09,
      confidence: 0.92,
      category: 'evidence-breadth',
    },
    {
      factorId: 'evidence-completeness',
      label: 'Evidence Completeness',
      rawValue: 0,
      normalizedValue: 1.0,
      weight: 0.08,
      contribution: 0.08,
      confidence: 0.90,
      category: 'coverage-complete',
    },
    {
      factorId: 'coverage-consistency',
      label: 'Coverage Consistency',
      rawValue: 0,
      normalizedValue: 1.0,
      weight: 0.05,
      contribution: 0.05,
      confidence: 0.85,
      category: 'detection-stability',
    },
    {
      factorId: 'integration-quality',
      label: 'Data Integration Quality',
      rawValue: 0.48,
      normalizedValue: 0.76,
      weight: 0.03,
      contribution: 0.02,
      confidence: 0.80,
      category: 'coverage-density',
    },
    {
      factorId: 'maintenance-coverage',
      label: 'Maintenance Event Coverage',
      rawValue: 0,
      normalizedValue: 1.0,
      weight: 0.01,
      contribution: 0.01,
      confidence: 0.85,
      category: 'operational-coverage',
    },
  ],
  penalties: [],
  explanation: {
    summary: 'Data Quality Index: 94.0% (Band: OPTIMAL). Excellent data quality. Data is comprehensive, fresh, trustworthy, and from diverse sources.',
    positiveFactors: [
      'Event Recency Score (quality strength)',
      'Data Quality Score (quality strength)',
    ],
    negativeFactors: [],
    recommendedActions: ['Data is suitable for all analytical and decision-making purposes. Maintain current data collection practices.'],
    comparison: 'Data quality level: Excellent Quality',
    trend: 'stable',
  },
  metadata: {
    calculator: 'DataQualityIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'data-quality-standard-v1',
  },
};

/**
 * Example: DATA_QUALITY_INDEX Calculation - Degraded Data Quality
 * Scenario: Stale data, low trust evidence, weak provenance, incomplete collection.
 * Expected result: Degraded data quality score - HIGH band
 */
export const degradedDataQualityRequest: IndexCalculationRequest = {
  indexType: IndexType.DATA_QUALITY_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-degraded-data-quality',
    inputId: 'VEHICLE:vehicle-degraded-data-quality:2026-03-14T10:30:00Z',
    eventCount: 180,
    trustScore: 0.52,
    provenanceScore: 0.45,
    dataQualityScore: 0.55,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: true,
      freshnessSeconds: 4800,
      dataCompletenessPercent: 62,
    },
    featureSet: {
      unresolvedSignalCount: 5,
      maintenanceDelayDays: 25,
      repeatedFailureCount: 4,
      eventRecencyScore: 0.48,
      trustWeightedEvidenceScore: 0.50,
      provenanceStrength: 0.42,
      utilizationRate: 0.70,
      entityAgeInDays: 3650, // ~10 years
      customFeatures: { 
        dataQualityScore: 0.53,
        sourceDiversity: 0.38,
      },
    },
  },
  weightingProfile: {
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
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: DATA_QUALITY_INDEX Result - Degraded Data Quality
 * Calculated result showing degraded data quality with HIGH band (poor quality).
 */
export const degradedDataQualityResult: IndexCalculationResult = {
  indexType: IndexType.DATA_QUALITY_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-degraded-data-quality',
  rawScore: 38.5,
  normalizedScore: 0.385,
  band: IndexBand.HIGH,
  confidence: 0.65,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 38.5,
    weightedScore: 38.0,
    penaltyScore: 0.46,
    finalScore: 0.385,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'data-quality',
      label: 'Data Quality Score',
      rawValue: 0.53,
      normalizedValue: 0.53,
      weight: 0.25,
      contribution: 0.13,
      confidence: 0.53,
      category: 'data-quality',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.50,
      normalizedValue: 0.50,
      weight: 0.20,
      contribution: 0.10,
      confidence: 0.50,
      category: 'measurement-confidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.42,
      normalizedValue: 0.42,
      weight: 0.18,
      contribution: 0.08,
      confidence: 0.42,
      category: 'data-lineage',
    },
    {
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: 0.48,
      normalizedValue: 0.48,
      weight: 0.12,
      contribution: 0.06,
      confidence: 0.48,
      category: 'data-freshness',
    },
    {
      factorId: 'source-diversity',
      label: 'Source Diversity',
      rawValue: 0.38,
      normalizedValue: 0.38,
      weight: 0.10,
      contribution: 0.04,
      confidence: 0.38,
      category: 'evidence-breadth',
    },
    {
      factorId: 'evidence-completeness',
      label: 'Evidence Completeness',
      rawValue: 5,
      normalizedValue: 0.60,
      weight: 0.08,
      contribution: 0.05,
      confidence: 0.70,
      category: 'coverage-complete',
    },
    {
      factorId: 'coverage-consistency',
      label: 'Coverage Consistency',
      rawValue: 4,
      normalizedValue: 0.80,
      weight: 0.05,
      contribution: 0.04,
      confidence: 0.70,
      category: 'detection-stability',
    },
    {
      factorId: 'integration-quality',
      label: 'Data Integration Quality',
      rawValue: 1.00,
      normalizedValue: 0.50,
      weight: 0.03,
      contribution: 0.02,
      confidence: 0.80,
      category: 'coverage-density',
    },
    {
      factorId: 'maintenance-coverage',
      label: 'Maintenance Event Coverage',
      rawValue: 25,
      normalizedValue: 0.75,
      weight: 0.01,
      contribution: 0.01,
      confidence: 0.65,
      category: 'operational-coverage',
    },
  ],
  penalties: [
    {
      penaltyType: 'stale-data',
      label: 'Stale data snapshot',
      penaltyValue: 0.12,
      reason: 'No recent data collection or update to vehicle intelligence',
    },
    {
      penaltyType: 'low-confidence',
      label: 'Low trust in collected evidence',
      penaltyValue: 0.10,
      reason: 'Evidence quality metrics suggest unreliable or inconsistent measurements',
    },
    {
      penaltyType: 'data-quality',
      label: 'Weak data provenance',
      penaltyValue: 0.09,
      reason: 'Data sources or lineage insufficiently documented or validated',
    },
    {
      penaltyType: 'data-quality',
      label: 'Incomplete data collection',
      penaltyValue: 0.08,
      reason: 'Missing critical data fields or attributes for complete vehicle intelligence',
    },
    {
      penaltyType: 'data-quality',
      label: 'Low source diversity',
      penaltyValue: 0.07,
      reason: 'Data from limited sources; cross-validation not possible',
    },
  ],
  explanation: {
    summary: 'Data Quality Index: 38.5% (Band: HIGH). Poor data quality with significant gaps or staleness. Analysis results should be treated cautiously.',
    positiveFactors: [],
    negativeFactors: [
      'Trust-Weighted Evidence Quality (10.0% impact)',
      'Data Quality Score (13.0% impact)',
    ],
    recommendedActions: ['Improve data collection frequency and coverage. Validate conclusions with external sources before decisions.'],
    comparison: 'Data quality level: Poor Quality',
    trend: 'stable',
  },
  metadata: {
    calculator: 'DataQualityIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'data-quality-standard-v1',
  },
};

/**
 * Example: DATA_QUALITY_INDEX Calculation - Low Confidence Data Quality
 * Scenario: Moderate data quality but with uncertainty, incomplete flags, unknown sources.
 * Expected result: Adequate data quality but LOW confidence
 */
export const lowConfidenceDataQualityRequest: IndexCalculationRequest = {
  indexType: IndexType.DATA_QUALITY_INDEX,
  input: {
    ...vehicleInputExample,
    subjectId: 'vehicle-low-confidence-data-quality',
    inputId: 'VEHICLE:vehicle-low-confidence-data-quality:2026-03-14T10:30:00Z',
    eventCount: 280,
    trustScore: 0.58,
    provenanceScore: 0.52,
    dataQualityScore: 0.65,
    snapshot: {
      ...vehicleInputExample.snapshot,
      stale: false,
      freshnessSeconds: 1200,
      dataCompletenessPercent: 55,
    },
    featureSet: {
      unresolvedSignalCount: 3,
      maintenanceDelayDays: 12,
      repeatedFailureCount: 2,
      eventRecencyScore: 0.65,
      trustWeightedEvidenceScore: 0.55,
      provenanceStrength: 0.48,
      utilizationRate: 0.60,
      entityAgeInDays: 2190, // ~6 years
      customFeatures: { 
        dataQualityScore: 0.63,
        sourceDiversity: 0.32,
      },
    },
  },
  weightingProfile: {
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
  },
  calculationContext: 'daily',
  requestedAt: new Date('2026-03-14T10:30:00Z'),
};

/**
 * Example: DATA_QUALITY_INDEX Result - Low Confidence Data Quality
 * Calculated result showing adequate data quality with LOW confidence.
 */
export const lowConfidenceDataQualityResult: IndexCalculationResult = {
  indexType: IndexType.DATA_QUALITY_INDEX,
  subjectType: vehicleInputExample.subjectType,
  subjectId: 'vehicle-low-confidence-data-quality',
  rawScore: 60.2,
  normalizedScore: 0.602,
  band: IndexBand.MEDIUM,
  confidence: 0.59,
  calculatedAt: new Date('2026-03-14T10:30:00Z'),
  breakdown: {
    baseScore: 60.2,
    weightedScore: 59.5,
    penaltyScore: 0.25,
    finalScore: 0.602,
    normalizationApplied: true,
    normalizationDetails: {
      strategy: 'LINEAR',
      minValue: 0,
      maxValue: 1,
    },
  },
  factors: [
    {
      factorId: 'data-quality',
      label: 'Data Quality Score',
      rawValue: 0.63,
      normalizedValue: 0.63,
      weight: 0.25,
      contribution: 0.16,
      confidence: 0.63,
      category: 'data-quality',
    },
    {
      factorId: 'trust-evidence',
      label: 'Trust-Weighted Evidence Quality',
      rawValue: 0.55,
      normalizedValue: 0.55,
      weight: 0.20,
      contribution: 0.11,
      confidence: 0.55,
      category: 'measurement-confidence',
    },
    {
      factorId: 'provenance',
      label: 'Data Provenance Strength',
      rawValue: 0.48,
      normalizedValue: 0.48,
      weight: 0.18,
      contribution: 0.09,
      confidence: 0.48,
      category: 'data-lineage',
    },
    {
      factorId: 'event-recency',
      label: 'Event Recency Score',
      rawValue: 0.65,
      normalizedValue: 0.65,
      weight: 0.12,
      contribution: 0.08,
      confidence: 0.65,
      category: 'data-freshness',
    },
    {
      factorId: 'source-diversity',
      label: 'Source Diversity',
      rawValue: 0.32,
      normalizedValue: 0.32,
      weight: 0.10,
      contribution: 0.03,
      confidence: 0.32,
      category: 'evidence-breadth',
    },
    {
      factorId: 'evidence-completeness',
      label: 'Evidence Completeness',
      rawValue: 3,
      normalizedValue: 0.76,
      weight: 0.08,
      contribution: 0.06,
      confidence: 0.70,
      category: 'coverage-complete',
    },
    {
      factorId: 'coverage-consistency',
      label: 'Coverage Consistency',
      rawValue: 2,
      normalizedValue: 0.90,
      weight: 0.05,
      contribution: 0.05,
      confidence: 0.85,
      category: 'detection-stability',
    },
    {
      factorId: 'integration-quality',
      label: 'Data Integration Quality',
      rawValue: 0.77,
      normalizedValue: 0.62,
      weight: 0.03,
      contribution: 0.02,
      confidence: 0.80,
      category: 'coverage-density',
    },
    {
      factorId: 'maintenance-coverage',
      label: 'Maintenance Event Coverage',
      rawValue: 12,
      normalizedValue: 0.88,
      weight: 0.01,
      contribution: 0.01,
      confidence: 0.85,
      category: 'operational-coverage',
    },
  ],
  penalties: [
    {
      penaltyType: 'data-quality',
      label: 'Incomplete data collection',
      penaltyValue: 0.08,
      reason: 'Missing critical data fields or attributes for complete vehicle intelligence',
    },
    {
      penaltyType: 'data-quality',
      label: 'Low source diversity',
      penaltyValue: 0.07,
      reason: 'Data from limited sources; cross-validation not possible',
    },
    {
      penaltyType: 'low-confidence',
      label: 'Low trust in collected evidence',
      penaltyValue: 0.10,
      reason: 'Evidence quality metrics suggest unreliable or inconsistent measurements',
    },
  ],
  explanation: {
    summary: 'Data Quality Index: 60.2% (Band: MEDIUM). Adequate data quality with some concerns. Suitable for analysis but with caveats and validation.',
    positiveFactors: [],
    negativeFactors: [
      'Data Quality Score (16.0% impact)',
      'Trust-Weighted Evidence Quality (11.0% impact)',
    ],
    recommendedActions: ['Validate findings with additional sources. Prioritize improving data freshness and coverage.'],
    comparison: 'Data quality level: Adequate Quality - Low Confidence',
    trend: 'stable',
  },
  metadata: {
    calculator: 'DataQualityIndexCalculator',
    version: '1.0.0',
    weightingProfile: 'data-quality-standard-v1',
  },
};
