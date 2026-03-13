/**
 * Data Engine Acceptance Policy
 *
 * Deterministic thresholds for acceptance evaluation.
 *
 * Provides the rules that map scores to acceptance statuses:
 * score <= acceptedMax → ACCEPTED
 * score <= watchMax → WATCH
 * score <= escalateMax → ESCALATE
 * else → REJECTED
 */

import type { DataEngineAcceptanceEvaluationType } from '../types/DataEngineAcceptanceEvaluationType';

/**
 * Threshold configuration for one evaluation type
 */
export interface AcceptanceThresholds {
  /**
   * Score must be <= this value for ACCEPTED status
   */
  acceptedMax: number;

  /**
   * Score must be <= this value for WATCH status
   */
  watchMax: number;

  /**
   * Score must be <= this value for ESCALATE status
   */
  escalateMax: number;

  /**
   * Anything above escalateMax is REJECTED
   */
}

/**
 * Complete acceptance policy
 *
 * Maps each evaluation type to its thresholds
 */
export interface DataEngineAcceptancePolicy {
  componentHealth: AcceptanceThresholds;
  serviceDependency: AcceptanceThresholds;
  actorConcentration: AcceptanceThresholds;
  usageIntensity: AcceptanceThresholds;
  compositeRisk: AcceptanceThresholds;
  overall: AcceptanceThresholds;
}

/**
 * Default Acceptance Policy
 *
 * Provides sensible defaults for all evaluation types.
 *
 * Philosophy:
 * - ACCEPTED: Scores 0-40 (normal/low signals)
 * - WATCH: Scores 41-70 (elevated/moderate signals)
 * - ESCALATE: Scores 71-90 (high/concerning signals)
 * - REJECTED: Scores 91-100 (critical/severe signals)
 */
export const DEFAULT_ACCEPTANCE_POLICY: DataEngineAcceptancePolicy = {
  // Component health: Lower is better (0 = no degradation)
  // ACCEPTED: minimal degradation
  // WATCH: moderate degradation
  // ESCALATE: high degradation
  // REJECTED: critical degradation
  componentHealth: {
    acceptedMax: 40,
    watchMax: 70,
    escalateMax: 90,
  },

  // Service dependency: Higher numbers = more service-dependent
  // ACCEPTED: low service dependency
  // WATCH: moderate service dependency
  // ESCALATE: high service dependency
  // REJECTED: critical service dependency
  serviceDependency: {
    acceptedMax: 45,
    watchMax: 72,
    escalateMax: 88,
  },

  // Actor concentration: Higher = more concentrated to specific provider
  // ACCEPTED: distributed across providers
  // WATCH: moderate provider concentration
  // ESCALATE: high provider concentration
  // REJECTED: critical provider lock-in
  actorConcentration: {
    acceptedMax: 50,
    watchMax: 75,
    escalateMax: 92,
  },

  // Usage intensity: Higher = more concentrated temporal patterns
  // ACCEPTED: uniform usage over time
  // WATCH: some temporal clustering
  // ESCALATE: high temporal clustering
  // REJECTED: extreme temporal concentration
  usageIntensity: {
    acceptedMax: 42,
    watchMax: 68,
    escalateMax: 85,
  },

  // Composite risk: Multi-domain convergence risk
  // ACCEPTED: minimal convergence
  // WATCH: some convergence signals
  // ESCALATE: strong convergence
  // REJECTED: critical multi-domain alignment
  compositeRisk: {
    acceptedMax: 48,
    watchMax: 70,
    escalateMax: 88,
  },

  // Overall: Derived from most severe status
  // Used for overall vehicle acceptance
  overall: {
    acceptedMax: 40,
    watchMax: 70,
    escalateMax: 90,
  },
};

/**
 * Get thresholds for a specific evaluation type
 */
export function getThresholdsForType(
  policy: DataEngineAcceptancePolicy,
  evaluationType: string
): AcceptanceThresholds {
  switch (evaluationType) {
    case 'COMPONENT_HEALTH_EVALUATION':
      return policy.componentHealth;
    case 'SERVICE_DEPENDENCY_EVALUATION':
      return policy.serviceDependency;
    case 'ACTOR_CONCENTRATION_EVALUATION':
      return policy.actorConcentration;
    case 'USAGE_INTENSITY_EVALUATION':
      return policy.usageIntensity;
    case 'COMPOSITE_RISK_EVALUATION':
      return policy.compositeRisk;
    case 'OVERALL_ACCEPTANCE_EVALUATION':
      return policy.overall;
    default:
      // Fallback to overall
      return policy.overall;
  }
}
