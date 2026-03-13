/**
 * Data Engine Scoring Engine
 *
 * Transforms priority candidates into deterministic intelligence scores.
 *
 * Core responsibilities:
 * - Calculate 5 score families from priority candidates
 * - Generate deterministic IDs (SHA-256)
 * - Preserve full traceability
 * - Provide confidence indicators
 * - Return comprehensive summary
 *
 * Determinism guarantee:
 * Same input → same output (reproducible)
 * No randomness, no timestamps in ID generation
 */

import { createHash } from 'crypto';
import type { DataEngineScoreCandidate, PriorityCandidateInput } from '../models/DataEngineScoreCandidate';
import {
  countPriorityCandidatesByType,
  getPriorityCandidatesByType,
} from '../models/DataEngineScoreCandidate';
import { DataEnginePriorityCandidateType } from '../../prioritization/types/DataEnginePriorityCandidateType';
import type { DataEngineScore } from '../models/DataEngineScore';
import { createScore } from '../models/DataEngineScore';
import type { DataEngineScoreResult } from '../models/DataEngineScoreResult';
import { createScoreResult } from '../models/DataEngineScoreResult';
import {
  COMPONENT_HEALTH_SCORE,
  SERVICE_DEPENDENCY_SCORE,
  ACTOR_CONCENTRATION_SCORE,
  USAGE_INTENSITY_SCORE,
  COMPOSITE_RISK_SCORE,
} from '../types/DataEngineScoreType';

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC ID GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate deterministic score ID
 *
 * Formula: SHA-256(identityId + scoreType + sourceEntityRef)
 *
 * Ensures:
 * - Same input always produces same ID
 * - No collisions (cryptographically secure)
 * - No timestamp dependency
 */
function generateScoreId(
  identityId: string,
  scoreType: string,
  sourceEntityRef: string
): string {
  const input = `${identityId}:${scoreType}:${sourceEntityRef}`;
  return createHash('sha256').update(input).digest('hex').substring(0, 16);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT HEALTH SCORE CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate component health score
 *
 * Based on:
 * - Component candidate count (frequency)
 * - Recurrence patterns (high/medium/low)
 * - Evidence quality
 *
 * Score logic:
 * - 0-30: No degradation signals
 * - 31-60: Moderate component issues
 * - 61-85: High recurrence drivers
 * - 86-100: Critical degradation patterns
 */
function calculateComponentHealthScore(
  candidate: DataEngineScoreCandidate
): DataEngineScore | null {
  const componentCandidates = getPriorityCandidatesByType(
    candidate,
    DataEnginePriorityCandidateType.COMPONENT_PRIORITY_CANDIDATE
  );

  if (componentCandidates.length === 0) {
    return null; // No component signals
  }

  let scoreValue = 0;
  let confidence = 0.5;

  // Base score from candidate count
  const candidateCount = componentCandidates.length;
  if (candidateCount === 1) {
    scoreValue = 35;
    confidence = 0.5;
  } else if (candidateCount === 2) {
    scoreValue = 55;
    confidence = 0.65;
  } else if (candidateCount >= 3) {
    scoreValue = Math.min(80, 50 + candidateCount * 5);
    confidence = Math.min(0.9, 0.6 + candidateCount * 0.1);
  }

  // Adjust based on candidate properties
  for (const cand of componentCandidates) {
    const props = cand as Record<string, unknown>;
    // boost score if high recurrence
    if (props.recurrenceLevel === 'high_recurrence') {
      scoreValue = Math.min(100, scoreValue + 15);
      confidence = Math.min(1.0, confidence + 0.15);
    }
  }

  // Calculate average confidence from source candidates
  if (componentCandidates.length > 0) {
    const avgCandidateConfidence =
      componentCandidates.reduce((sum, c) => sum + (c.confidence || 0), 0) /
      componentCandidates.length;
    confidence = confidence * 0.7 + avgCandidateConfidence * 0.3;
  }

  const scoreBasis =
    `Component health based on ${candidateCount} degradation pattern(s): ` +
    `${scoreValue <= 30 ? 'no significant degradation' : scoreValue <= 60 ? 'moderate component issues' : scoreValue <= 85 ? 'high recurrence drivers' : 'critical degradation'}`;

  return createScore(
    generateScoreId(candidate.identityId, COMPONENT_HEALTH_SCORE, candidate.sourceEntityRef),
    COMPONENT_HEALTH_SCORE,
    candidate.identityId,
    candidate.sourceEntityRef,
    componentCandidates.map((c) => c.candidateId),
    Math.round(scoreValue),
    scoreBasis,
    Math.round(confidence * 100) / 100,
    { candidateCount, pattern: 'component_degradation' }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE DEPENDENCY SCORE CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate service dependency score
 *
 * Based on:
 * - Service cluster count and intensity
 * - Maintenance behavior patterns
 * - Service frequency
 */
function calculateServiceDependencyScore(
  candidate: DataEngineScoreCandidate
): DataEngineScore | null {
  const serviceCandidates = getPriorityCandidatesByType(candidate, DataEnginePriorityCandidateType.SERVICE_PRIORITY_CANDIDATE);

  if (serviceCandidates.length === 0) {
    return null; // No service signals
  }

  let scoreValue = 0;
  let confidence = 0.5;

  // Base score from candidate count
  const candidateCount = serviceCandidates.length;
  if (candidateCount === 1) {
    scoreValue = 40;
    confidence = 0.55;
  } else if (candidateCount === 2) {
    scoreValue = 60;
    confidence = 0.7;
  } else {
    scoreValue = Math.min(85, 50 + candidateCount * 8);
    confidence = Math.min(0.9, 0.65 + candidateCount * 0.1);
  }

  // Adjust based on intensity
  for (const cand of serviceCandidates) {
    const props = cand as Record<string, unknown>;
    if (props.intensity === 'dense_cluster') {
      scoreValue = Math.min(100, scoreValue + 12);
      confidence = Math.min(1.0, confidence + 0.12);
    }
  }

  // Average candidate confidence
  if (serviceCandidates.length > 0) {
    const avgCandidateConfidence =
      serviceCandidates.reduce((sum, c) => sum + (c.confidence || 0), 0) /
      serviceCandidates.length;
    confidence = confidence * 0.7 + avgCandidateConfidence * 0.3;
  }

  const scoreBasis =
    `Service dependency based on ${candidateCount} service cluster(s): ` +
    `${scoreValue <= 40 ? 'low dependency' : scoreValue <= 65 ? 'moderate service activity' : 'high maintenance intensity'}`;

  return createScore(
    generateScoreId(candidate.identityId, SERVICE_DEPENDENCY_SCORE, candidate.sourceEntityRef),
    SERVICE_DEPENDENCY_SCORE,
    candidate.identityId,
    candidate.sourceEntityRef,
    serviceCandidates.map((c) => c.candidateId),
    Math.round(scoreValue),
    scoreBasis,
    Math.round(confidence * 100) / 100,
    { candidateCount, pattern: 'service_clustering' }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTOR CONCENTRATION SCORE CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate actor concentration score
 *
 * Based on:
 * - Service provider dependency patterns
 * - Actor concentration levels
 * - Relationship intensity
 */
function calculateActorConcentrationScore(
  candidate: DataEngineScoreCandidate
): DataEngineScore | null {
  const actorCandidates = getPriorityCandidatesByType(candidate, DataEnginePriorityCandidateType.ACTOR_PRIORITY_CANDIDATE);

  if (actorCandidates.length === 0) {
    return null; // No actor signals
  }

  let scoreValue = 0;
  let confidence = 0.5;

  const candidateCount = actorCandidates.length;
  if (candidateCount === 1) {
    scoreValue = 55;
    confidence = 0.6;
  } else if (candidateCount === 2) {
    scoreValue = 70;
    confidence = 0.75;
  } else {
    scoreValue = Math.min(90, 60 + candidateCount * 7);
    confidence = Math.min(0.95, 0.7 + candidateCount * 0.12);
  }

  // Adjust for concentration level
  for (const cand of actorCandidates) {
    const props = cand as Record<string, unknown>;
    if (props.concentrationLevel === 'high_concentration') {
      scoreValue = Math.min(100, scoreValue + 15);
      confidence = Math.min(1.0, confidence + 0.15);
    }
  }

  // Average candidate confidence
  if (actorCandidates.length > 0) {
    const avgCandidateConfidence =
      actorCandidates.reduce((sum, c) => sum + (c.confidence || 0), 0) /
      actorCandidates.length;
    confidence = confidence * 0.7 + avgCandidateConfidence * 0.3;
  }

  const scoreBasis =
    `Actor concentration based on ${candidateCount} provider(s): ` +
    `${scoreValue <= 55 ? 'distributed providers' : scoreValue <= 75 ? 'moderate concentration' : 'high provider dependence'}`;

  return createScore(
    generateScoreId(
      candidate.identityId,
      ACTOR_CONCENTRATION_SCORE,
      candidate.sourceEntityRef
    ),
    ACTOR_CONCENTRATION_SCORE,
    candidate.identityId,
    candidate.sourceEntityRef,
    actorCandidates.map((c) => c.candidateId),
    Math.round(scoreValue),
    scoreBasis,
    Math.round(confidence * 100) / 100,
    { candidateCount, pattern: 'actor_dependency' }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USAGE INTENSITY SCORE CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate usage intensity score
 *
 * Based on:
 * - Temporal clustering patterns
 * - Usage density anomalies
 * - Time-window concentration
 */
function calculateUsageIntensityScore(
  candidate: DataEngineScoreCandidate
): DataEngineScore | null {
  const temporalCandidates = getPriorityCandidatesByType(
    candidate,
    DataEnginePriorityCandidateType.TEMPORAL_PRIORITY_CANDIDATE
  );

  if (temporalCandidates.length === 0) {
    return null; // No temporal signals
  }

  let scoreValue = 0;
  let confidence = 0.5;

  const candidateCount = temporalCandidates.length;
  if (candidateCount === 1) {
    scoreValue = 50;
    confidence = 0.58;
  } else if (candidateCount === 2) {
    scoreValue = 68;
    confidence = 0.72;
  } else {
    scoreValue = Math.min(88, 55 + candidateCount * 6);
    confidence = Math.min(0.92, 0.65 + candidateCount * 0.11);
  }

  // Adjust for density level
  for (const cand of temporalCandidates) {
    const props = cand as Record<string, unknown>;
    if (props.densityLevel === 'high_density') {
      scoreValue = Math.min(100, scoreValue + 18);
      confidence = Math.min(1.0, confidence + 0.18);
    }
  }

  // Average candidate confidence
  if (temporalCandidates.length > 0) {
    const avgCandidateConfidence =
      temporalCandidates.reduce((sum, c) => sum + (c.confidence || 0), 0) /
      temporalCandidates.length;
    confidence = confidence * 0.7 + avgCandidateConfidence * 0.3;
  }

  const scoreBasis =
    `Usage intensity based on ${candidateCount} temporal anomaly/anomalies: ` +
    `${scoreValue <= 50 ? 'uniform usage' : scoreValue <= 70 ? 'moderate concentration' : 'extreme temporal clustering'}`;

  return createScore(
    generateScoreId(candidate.identityId, USAGE_INTENSITY_SCORE, candidate.sourceEntityRef),
    USAGE_INTENSITY_SCORE,
    candidate.identityId,
    candidate.sourceEntityRef,
    temporalCandidates.map((c) => c.candidateId),
    Math.round(scoreValue),
    scoreBasis,
    Math.round(confidence * 100) / 100,
    { candidateCount, pattern: 'temporal_clustering' }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITE RISK SCORE CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate composite risk score
 *
 * Based on:
 * - Multi-domain convergence (how many domains align)
 * - Number of converging candidates
 * - Cross-domain signal strength
 *
 * Composite score triggers when:
 * - Component + Service + Actor signals align
 * - Component + Temporal signals intensify
 * - Service + Actor + Temporal all present
 */
function calculateCompositeRiskScore(
  candidate: DataEngineScoreCandidate
): DataEngineScore | null {
  const compositeCandidates = getPriorityCandidatesByType(
    candidate,
    DataEnginePriorityCandidateType.COMPOSITE_PRIORITY_CANDIDATE
  );

  if (compositeCandidates.length === 0) {
    return null; // No composite signals
  }

  // Count converging domains from composite candidates
  let totalConvergenceDomains = 0;
  for (const cand of compositeCandidates) {
    const props = cand as Record<string, unknown>;
    // Each composite candidate contributes domain count
    if (props.domainCount) {
      totalConvergenceDomains += props.domainCount as number;
    } else {
      // Default: assume 2-3 domains per composite candidate
      totalConvergenceDomains += 2;
    }
  }

  let scoreValue = 0;
  let confidence = 0.65;

  // Score based on convergence strength
  const candidateCount = compositeCandidates.length;
  if (candidateCount === 1) {
    scoreValue = 65; // Single composite convergence
    confidence = 0.7;
  } else if (candidateCount === 2) {
    scoreValue = 80; // Double convergence
    confidence = 0.82;
  } else {
    scoreValue = Math.min(95, 70 + candidateCount * 8);
    confidence = Math.min(0.98, 0.75 + candidateCount * 0.08);
  }

  // Boost for high convergence domain count
  if (totalConvergenceDomains >= 4) {
    scoreValue = Math.min(100, scoreValue + 10);
    confidence = Math.min(1.0, confidence + 0.1);
  }

  // Average candidate confidence
  if (compositeCandidates.length > 0) {
    const avgCandidateConfidence =
      compositeCandidates.reduce((sum, c) => sum + (c.confidence || 0), 0) /
      compositeCandidates.length;
    confidence = confidence * 0.75 + avgCandidateConfidence * 0.25;
  }

  const scoreBasis =
    `Multi-domain convergence: ${candidateCount} composite candidate(s) with ${totalConvergenceDomains} total converging domains. ` +
    `${scoreValue <= 65 ? 'Moderate convergence' : scoreValue <= 80 ? 'Strong multi-domain alignment' : 'Critical convergence risk'}`;

  return createScore(
    generateScoreId(candidate.identityId, COMPOSITE_RISK_SCORE, candidate.sourceEntityRef),
    COMPOSITE_RISK_SCORE,
    candidate.identityId,
    candidate.sourceEntityRef,
    compositeCandidates.map((c) => c.candidateId),
    Math.round(scoreValue),
    scoreBasis,
    Math.round(confidence * 100) / 100,
    { candidateCount, totalConvergenceDomains, pattern: 'multi_domain_convergence' }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate all vehicle intelligence scores
 *
 * Transforms priority candidates into 5 score families.
 * Calculation is deterministic and fully reproducible.
 *
 * @param candidate Score candidate with priority candidates from Phase 10
 * @returns Score result with all calculated scores and summary
 */
export function calculateVehicleScores(
  candidate: DataEngineScoreCandidate
): DataEngineScoreResult {
  const scores: DataEngineScore[] = [];

  // Calculate all score types
  const componentScore = calculateComponentHealthScore(candidate);
  if (componentScore) scores.push(componentScore);

  const serviceScore = calculateServiceDependencyScore(candidate);
  if (serviceScore) scores.push(serviceScore);

  const actorScore = calculateActorConcentrationScore(candidate);
  if (actorScore) scores.push(actorScore);

  const usageScore = calculateUsageIntensityScore(candidate);
  if (usageScore) scores.push(usageScore);

  const compositeScore = calculateCompositeRiskScore(candidate);
  if (compositeScore) scores.push(compositeScore);

  return createScoreResult(scores, new Date().toISOString());
}
