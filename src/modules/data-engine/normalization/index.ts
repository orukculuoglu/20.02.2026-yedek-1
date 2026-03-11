/**
 * Data Engine Phase 4: Normalization Layer
 *
 * Semantic normalization of bound feeds into canonical entities.
 * Converts source-specific feed payloads to standardized Data Engine entities.
 *
 * INCLUDED:
 * ✓ Deterministic semantic transformation
 * ✓ Source-aware payload mapping
 * ✓ Schema version handling
 * ✓ Comprehensive issue tracking (16 issue codes)
 * ✓ Audit trail with candidate references
 * ✓ Quality metrics and completeness scoring
 *
 * NOT INCLUDED:
 * ✗ Identity resolution or creation
 * ✗ VIN resolution or validation
 * ✗ Data cleaning or format fixing
 * ✗ Persistence or storage
 * ✗ Graph construction or relationships
 * ✗ Signal generation or scoring
 *
 * Architecture follows Phase 3 binding patterns:
 * - Issue-based decision logic
 * - Severity levels (BLOCKING, LIMITING, WARNING)
 * - Comprehensive result objects with audit trails
 * - No external dependencies, deterministic evaluation
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type { DataEngineNormalizationStatus } from './types/DataEngineNormalizationStatus';
export type { DataEngineNormalizationIssueCode } from './types/DataEngineNormalizationIssueCode';

// ─────────────────────────────────────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────────────────────────────────────

export type { DataEngineNormalizationIssue } from './models/DataEngineNormalizationIssue';
export type { DataEngineNormalizationCandidate } from './models/DataEngineNormalizationCandidate';
export type { DataEngineEntity } from './models/DataEngineEntity';
export type { DataEngineNormalizationResult } from './models/DataEngineNormalizationResult';

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export { normalizeFeedToEntity } from './engine/normalizeFeedToEntity';

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────

export {
  serviceCenterMaintenanceNormalized,
  insuranceClaimNormalized,
  telematicsDiagnosticWithWarnings,
  incompleteMaintenanceWithWarnings,
  malformedPayloadRejected,
  inspectionRecordNormalized,
  exampleNormalizationCases,
} from './examples/exampleNormalizationCases';
