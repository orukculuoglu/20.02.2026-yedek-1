/**
 * Data Engine Scoring Module
 *
 * Phase 11 — Deterministic Intelligence Score Calculation
 *
 * Module exports the scoring engine and related utilities.
 */

// Types
export {
  COMPONENT_HEALTH_SCORE,
  SERVICE_DEPENDENCY_SCORE,
  ACTOR_CONCENTRATION_SCORE,
  USAGE_INTENSITY_SCORE,
  COMPOSITE_RISK_SCORE,
  ALL_SCORE_TYPES,
  SCORE_TYPE_DESCRIPTIONS,
  type DataEngineScoreType,
} from './types/DataEngineScoreType';

// Models
export {
  createScore,
  type DataEngineScore,
} from './models/DataEngineScore';

export {
  getPriorityCandidatesByType,
  countPriorityCandidatesByType,
  type DataEngineScoreCandidate,
  type PriorityCandidateInput,
} from './models/DataEngineScoreCandidate';

export {
  calculateScoreSummary,
  createScoreResult,
  type DataEngineScoreResult,
  type ScoreSummary,
  type ScoreDistribution,
} from './models/DataEngineScoreResult';

// Engine
export { calculateVehicleScores } from './engine/calculateVehicleScores';

// Examples
export {
  exampleComponentFocusedScoring,
  exampleMultiDomainScoring,
  exampleServiceFocusedScoring,
  exampleHighConfidenceConvergence,
  demonstratePhase11Scoring,
} from './examples/exampleScoreCalculationCases';
