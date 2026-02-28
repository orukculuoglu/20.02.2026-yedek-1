/**
 * Auto-Expert Module - Confidence Engine
 * Computes coverage, consistency, and overall confidence scores
 * Provides explanations for confidence levels
 * Version: 2.1
 */

import type { VehicleAggregate } from '../../vehicle-intelligence/types';

/**
 * Compute coverage score (0-100) based on data source presence
 * Weighted formula:
 * - KM History: 25%
 * - Service Records: 25%
 * - OBD Records: 15%
 * - Insurance Records: 20%
 * - Damage Records: 15%
 */
export function computeCoverageScore(aggregate: VehicleAggregate): number {
  const { kmHistory, serviceRecords, obdRecords, insuranceRecords, damageRecords } = aggregate.dataSources;

  let score = 0;

  // KM History: 25 points (foundation)
  if (kmHistory.length > 0) {
    const kmWeight = Math.min(25, 5 + kmHistory.length); // scale with count
    score += kmWeight;
  }

  // Service Records: 25 points (maintenance tracking)
  if (serviceRecords.length > 0) {
    const serviceWeight = Math.min(25, 5 + serviceRecords.length);
    score += serviceWeight;
  }

  // OBD Records: 15 points (mechanical health)
  if (obdRecords.length > 0) {
    const obdWeight = Math.min(15, 3 + obdRecords.length);
    score += obdWeight;
  }

  // Insurance Records: 20 points (risk history)
  if (insuranceRecords.length > 0) {
    const insuranceWeight = Math.min(20, 4 + insuranceRecords.length);
    score += insuranceWeight;
  }

  // Damage Records: 15 points (structural history)
  if (damageRecords.length > 0) {
    const damageWeight = Math.min(15, 3 + damageRecords.length);
    score += damageWeight;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Compute consistency score (0-100) based on anomaly flags and risk levels
 * Starts at 100, applies penalties for inconsistencies
 */
export function computeConsistencyScore(aggregate: VehicleAggregate): number {
  let score = 100;
  const { derived } = aggregate;

  // Odometer anomaly: high penalty (-35)
  if (derived.odometerAnomaly) {
    score -= 35;
  }

  // Service gap: moderate penalty (-15)
  if (derived.serviceGapScore > 60) {
    score -= 15;
  }

  // Insurance risk: moderate penalty (-10)
  if (derived.insuranceRisk > 60) {
    score -= 10;
  }

  // Structural risk: moderate penalty (-15)
  if (derived.structuralRisk > 70) {
    score -= 15;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Compute overall confidence (0-100)
 * Formula: 60% coverage + 40% consistency
 * Higher coverage + higher consistency = higher confidence
 */
export function computeOverallConfidence(aggregate: VehicleAggregate): number {
  const coverage = computeCoverageScore(aggregate);
  const consistency = computeConsistencyScore(aggregate);

  const overall = Math.round(0.6 * coverage + 0.4 * consistency);
  return Math.min(100, Math.max(0, overall));
}

/**
 * Build human-readable confidence explanation
 */
export interface ConfidenceExplanationInput {
  coverageScore: number;
  consistencyScore: number;
  aggregate: VehicleAggregate;
}

export function buildConfidenceExplanation(input: ConfidenceExplanationInput): string {
  const { coverageScore, consistencyScore, aggregate } = input;
  const overall = Math.round(0.6 * coverageScore + 0.4 * consistencyScore);

  const parts: string[] = [];

  // Coverage part
  const coverageParts: string[] = [];
  if (aggregate.dataSources.kmHistory.length > 0) {
    coverageParts.push(`KM (${aggregate.dataSources.kmHistory.length})`);
  }
  if (aggregate.dataSources.serviceRecords.length > 0) {
    coverageParts.push(`Service (${aggregate.dataSources.serviceRecords.length})`);
  }
  if (aggregate.dataSources.obdRecords.length > 0) {
    coverageParts.push(`OBD (${aggregate.dataSources.obdRecords.length})`);
  }
  if (aggregate.dataSources.insuranceRecords.length > 0) {
    coverageParts.push(`Insurance (${aggregate.dataSources.insuranceRecords.length})`);
  }
  if (aggregate.dataSources.damageRecords.length > 0) {
    coverageParts.push(`Damage (${aggregate.dataSources.damageRecords.length})`);
  }

  if (coverageParts.length > 0) {
    parts.push(`Coverage: ${coverageParts.join(', ')} (${coverageScore}%)`);
  } else {
    parts.push(`Coverage: Minimal data (${coverageScore}%)`);
  }

  // Consistency part
  const consistencyIssues: string[] = [];
  if (aggregate.derived.odometerAnomaly) {
    consistencyIssues.push('Odometer anomaly');
  }
  if (aggregate.derived.serviceGapScore > 60) {
    consistencyIssues.push(`Service gap (${aggregate.derived.serviceGapScore})`);
  }
  if (aggregate.derived.insuranceRisk > 60) {
    consistencyIssues.push(`Insurance risk (${aggregate.derived.insuranceRisk})`);
  }
  if (aggregate.derived.structuralRisk > 70) {
    consistencyIssues.push(`Structural issues (${aggregate.derived.structuralRisk})`);
  }

  if (consistencyIssues.length > 0) {
    parts.push(`Issues: ${consistencyIssues.join(', ')} (Score: ${consistencyScore}%)`);
  } else {
    parts.push(`No major issues detected (Score: ${consistencyScore}%)`);
  }

  parts.push(`Overall: ${overall}%`);

  return parts.join(' | ');
}

/**
 * Adjust confidence for specific index based on data availability
 */
export function adjustConfidenceForTrustIndex(
  baseConfidence: number,
  kmHistoryCount: number
): number {
  // Trust Index heavily depends on KM History
  if (kmHistoryCount === 0) {
    return Math.max(30, baseConfidence - 20);
  }
  return baseConfidence;
}

/**
 * Adjust confidence for mechanical risk index based on OBD data
 */
export function adjustConfidenceForMechanicalRisk(
  baseConfidence: number,
  obdRecordsCount: number
): number {
  // Mechanical Risk depends heavily on OBD data
  if (obdRecordsCount === 0) {
    return Math.max(30, baseConfidence - 25);
  }
  return baseConfidence;
}

/**
 * Adjust confidence for insurance risk index based on insurance records
 */
export function adjustConfidenceForInsuranceRisk(
  baseConfidence: number,
  insuranceRecordsCount: number
): number {
  // Insurance Risk depends on insurance records
  if (insuranceRecordsCount === 0) {
    return Math.max(30, baseConfidence - 25);
  }
  return baseConfidence;
}

/**
 * Adjust signal confidence based on severity and evidence count
 */
export function adjustSignalConfidence(
  baseConfidence: number,
  severity: 'low' | 'medium' | 'high',
  evidenceCount: number
): number {
  let adjusted = baseConfidence;

  // High severity signals need strong evidence
  if (severity === 'high') {
    // High confidence if evidence >= 3
    if (evidenceCount < 3) {
      adjusted = Math.min(80, baseConfidence);
    }
  }

  // No evidence = low confidence
  if (evidenceCount === 0) {
    adjusted = Math.min(30, baseConfidence);
  }

  return Math.max(0, Math.min(100, adjusted));
}
