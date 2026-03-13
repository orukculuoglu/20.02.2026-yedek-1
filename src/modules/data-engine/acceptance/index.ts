/**
 * Data Engine Acceptance Module
 *
 * Phase 12 — Deterministic Acceptance Criteria Evaluation
 *
 * Module exports the acceptance evaluation engine and related utilities.
 */

// Types
export {
  ACCEPTED,
  WATCH,
  ESCALATE,
  REJECTED,
  ALL_ACCEPTANCE_STATUSES,
  ACCEPTANCE_SEVERITY,
  getMostSevereStatus,
  type DataEngineAcceptanceStatus,
} from './types/DataEngineAcceptanceStatus';

export {
  COMPONENT_HEALTH_EVALUATION,
  SERVICE_DEPENDENCY_EVALUATION,
  ACTOR_CONCENTRATION_EVALUATION,
  USAGE_INTENSITY_EVALUATION,
  COMPOSITE_RISK_EVALUATION,
  OVERALL_ACCEPTANCE_EVALUATION,
  ALL_EVALUATION_TYPES,
  EVALUATION_TYPE_DESCRIPTIONS,
  type DataEngineAcceptanceEvaluationType,
} from './types/DataEngineAcceptanceEvaluationType';

// Models
export {
  createEvaluation,
  type DataEngineAcceptanceEvaluation,
} from './models/DataEngineAcceptanceEvaluation';

export {
  DEFAULT_ACCEPTANCE_POLICY,
  getThresholdsForType,
  type DataEngineAcceptancePolicy,
  type AcceptanceThresholds,
} from './models/DataEngineAcceptancePolicy';

export {
  getScoresByType,
  getScoreByType,
  type DataEngineAcceptanceCandidate,
} from './models/DataEngineAcceptanceCandidate';

export {
  calculateAcceptanceSummary,
  createAcceptanceResult,
  type DataEngineAcceptanceResult,
  type AcceptanceSummary,
  type AcceptanceStatusDistribution,
} from './models/DataEngineAcceptanceResult';

// Engine
export { evaluateAcceptanceCriteria } from './engine/evaluateAcceptanceCriteria';

// Examples
export {
  exampleAllAccepted,
  exampleMixedStatuses,
  exampleHighSeverityComposite,
  exampleHighConfidenceWatch,
  demonstratePhase12Evaluation,
} from './examples/exampleAcceptanceCriteriaCases';
