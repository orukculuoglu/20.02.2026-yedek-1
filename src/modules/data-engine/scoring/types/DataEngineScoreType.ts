/**
 * Data Engine Score Type
 *
 * Defines the taxonomy of intelligence score families.
 * Each type represents a specific dimension of vehicle intelligence.
 *
 * Used to classify and organize deterministic vehicle scores.
 */

/**
 * Component Health Score
 *
 * Measures degradation patterns and component recurrence.
 * Based on:
 * - Component degradation frequency
 * - Cross-pattern evidence
 * - Failure probability indicators
 *
 * Range: 0-100 (0 = no degradation, 100 = critical degradation)
 */
export const COMPONENT_HEALTH_SCORE = 'COMPONENT_HEALTH_SCORE' as const;

/**
 * Service Dependency Score
 *
 * Measures service clustering intensity and maintenance patterns.
 * Based on:
 * - Service frequency and intensity
 * - Cluster density signals
 * - Maintenance behavior patterns
 *
 * Range: 0-100 (0 = no patterns, 100 = highly dependent on services)
 */
export const SERVICE_DEPENDENCY_SCORE = 'SERVICE_DEPENDENCY_SCORE' as const;

/**
 * Actor Concentration Score
 *
 * Measures service provider/actor dependency concentration.
 * Based on:
 * - Actor dependency patterns
 * - Service concentration levels
 * - Provider relationship intensity
 *
 * Range: 0-100 (0 = distributed, 100 = highly concentrated)
 */
export const ACTOR_CONCENTRATION_SCORE = 'ACTOR_CONCENTRATION_SCORE' as const;

/**
 * Usage Intensity Score
 *
 * Measures temporal usage patterns and anomaly density.
 * Based on:
 * - Usage temporal clustering
 * - Density anomalies
 * - Time-window concentration
 *
 * Range: 0-100 (0 = uniform usage, 100 = extreme temporal concentration)
 */
export const USAGE_INTENSITY_SCORE = 'USAGE_INTENSITY_SCORE' as const;

/**
 * Composite Risk Score
 *
 * Multi-domain convergence indicator.
 * Represents risk when multiple domains converge (component + service + temporal + actor).
 * Based on:
 * - Number of converging domains
 * - Cross-domain signal strength
 * - Convergence confidence
 *
 * Range: 0-100 (0 = no convergence, 100 = high convergence risk)
 */
export const COMPOSITE_RISK_SCORE = 'COMPOSITE_RISK_SCORE' as const;

/**
 * Union type of all score types
 */
export type DataEngineScoreType =
  | typeof COMPONENT_HEALTH_SCORE
  | typeof SERVICE_DEPENDENCY_SCORE
  | typeof ACTOR_CONCENTRATION_SCORE
  | typeof USAGE_INTENSITY_SCORE
  | typeof COMPOSITE_RISK_SCORE;

/**
 * Array of all score types for iteration
 */
export const ALL_SCORE_TYPES: DataEngineScoreType[] = [
  COMPONENT_HEALTH_SCORE,
  SERVICE_DEPENDENCY_SCORE,
  ACTOR_CONCENTRATION_SCORE,
  USAGE_INTENSITY_SCORE,
  COMPOSITE_RISK_SCORE,
];

/**
 * Score type descriptions
 */
export const SCORE_TYPE_DESCRIPTIONS: Record<DataEngineScoreType, string> = {
  COMPONENT_HEALTH_SCORE: 'Component degradation and health indicator',
  SERVICE_DEPENDENCY_SCORE: 'Service clustering and maintenance intensity',
  ACTOR_CONCENTRATION_SCORE: 'Service provider dependency concentration',
  USAGE_INTENSITY_SCORE: 'Temporal usage pattern concentration',
  COMPOSITE_RISK_SCORE: 'Multi-domain convergence risk indicator',
};
