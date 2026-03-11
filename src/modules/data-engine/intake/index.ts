/**
 * Data Engine Intake Layer - Phase 2 Public API
 *
 * Unified export point for all intake evaluation structures and functions.
 *
 * Folder Organization:
 * - types/ : Type definitions (status codes, issue codes, candidate structure)
 * - models/ : Structural models (issue, policy, result) + evaluation function
 * - examples/ : Realistic intake evaluation scenarios
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export type { DataEngineIntakeStatus } from './types/DataEngineIntakeStatus';
export type { DataEngineIntakeIssueCode } from './types/DataEngineIntakeIssueCode';
export type { DataEngineFeedCandidate } from './types/DataEngineFeedCandidate';

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export type { DataEngineIntakeIssue } from './models/DataEngineIntakeIssue';
export type { DataEngineIntakePolicy } from './models/DataEngineIntakePolicy';
export { defaultIntakePolicy } from './models/DataEngineIntakePolicy';
export type { DataEngineIntakeResult } from './models/DataEngineIntakeResult';

// ═══════════════════════════════════════════════════════════════════════════════
// EVALUATION FUNCTION EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export { evaluateFeedIntake } from './models/evaluateFeedIntake';

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMPLE EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  caseModernServiceClean,
  caseModernServiceCleanResult,
  caseFleetMissingOptionalMetadata,
  caseLegacyInsuranceOldSchema,
  caseTelematicsMalformedTimestamp,
  caseNoIdentityId,
  caseEmptyPayload,
} from './examples/exampleIntakeCases';
