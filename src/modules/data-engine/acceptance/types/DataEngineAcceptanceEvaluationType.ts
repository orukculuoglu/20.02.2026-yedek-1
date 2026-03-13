/**
 * Data Engine Acceptance Evaluation Type
 *
 * Defines the taxonomy of acceptance evaluation families.
 *
 * Each type represents one dimension of vehicle acceptance assessment.
 * Aligned with Phase 11 score families + overall status.
 */

/**
 * Component Health Evaluation
 *
 * Maps to COMPONENT_HEALTH_SCORE from Phase 11
 * Evaluates whether component degradation is at acceptable levels
 */
export const COMPONENT_HEALTH_EVALUATION = 'COMPONENT_HEALTH_EVALUATION' as const;

/**
 * Service Dependency Evaluation
 *
 * Maps to SERVICE_DEPENDENCY_SCORE from Phase 11
 * Evaluates whether service clustering is at acceptable levels
 */
export const SERVICE_DEPENDENCY_EVALUATION = 'SERVICE_DEPENDENCY_EVALUATION' as const;

/**
 * Actor Concentration Evaluation
 *
 * Maps to ACTOR_CONCENTRATION_SCORE from Phase 11
 * Evaluates whether provider concentration is at acceptable levels
 */
export const ACTOR_CONCENTRATION_EVALUATION = 'ACTOR_CONCENTRATION_EVALUATION' as const;

/**
 * Usage Intensity Evaluation
 *
 * Maps to USAGE_INTENSITY_SCORE from Phase 11
 * Evaluates whether usage patterns are at acceptable levels
 */
export const USAGE_INTENSITY_EVALUATION = 'USAGE_INTENSITY_EVALUATION' as const;

/**
 * Composite Risk Evaluation
 *
 * Maps to COMPOSITE_RISK_SCORE from Phase 11
 * Evaluates whether multi-domain convergence is at acceptable levels
 */
export const COMPOSITE_RISK_EVALUATION = 'COMPOSITE_RISK_EVALUATION' as const;

/**
 * Overall Acceptance Evaluation
 *
 * Derived from all other evaluations
 * Represents the vehicle's overall acceptance status
 * Determined by the most severe status across all dimensions
 */
export const OVERALL_ACCEPTANCE_EVALUATION = 'OVERALL_ACCEPTANCE_EVALUATION' as const;

/**
 * Union type of all evaluation types
 */
export type DataEngineAcceptanceEvaluationType =
  | typeof COMPONENT_HEALTH_EVALUATION
  | typeof SERVICE_DEPENDENCY_EVALUATION
  | typeof ACTOR_CONCENTRATION_EVALUATION
  | typeof USAGE_INTENSITY_EVALUATION
  | typeof COMPOSITE_RISK_EVALUATION
  | typeof OVERALL_ACCEPTANCE_EVALUATION;

/**
 * Array of all evaluation types for iteration
 */
export const ALL_EVALUATION_TYPES: DataEngineAcceptanceEvaluationType[] = [
  COMPONENT_HEALTH_EVALUATION,
  SERVICE_DEPENDENCY_EVALUATION,
  ACTOR_CONCENTRATION_EVALUATION,
  USAGE_INTENSITY_EVALUATION,
  COMPOSITE_RISK_EVALUATION,
  OVERALL_ACCEPTANCE_EVALUATION,
];

/**
 * Evaluation type descriptions
 */
export const EVALUATION_TYPE_DESCRIPTIONS: Record<
  DataEngineAcceptanceEvaluationType,
  string
> = {
  COMPONENT_HEALTH_EVALUATION: 'Component degradation acceptance',
  SERVICE_DEPENDENCY_EVALUATION: 'Service clustering acceptance',
  ACTOR_CONCENTRATION_EVALUATION: 'Provider concentration acceptance',
  USAGE_INTENSITY_EVALUATION: 'Usage pattern acceptance',
  COMPOSITE_RISK_EVALUATION: 'Multi-domain convergence acceptance',
  OVERALL_ACCEPTANCE_EVALUATION: 'Overall vehicle acceptance status',
};
