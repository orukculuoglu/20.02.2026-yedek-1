/**
 * Data Engine Phase 5: Graph Attachment Layer
 *
 * Transform normalized DataEngineEntity to graph nodes/edges.
 * Constructs multi-family node taxonomy: Vehicle/Event/Observation/Actor/Asset.
 *
 * INCLUDED:
 * ✓ Deterministic node construction (5 node families)
 * ✓ Deterministic edge construction (7 edge types)
 * ✓ Semantic classification (forward compatible)
 * ✓ Deduplication (actors by role, assets by component)
 * ✓ Timestamp safety (fallback chain)
 * ✓ Strict TypeScript (no `any` types)
 * ✓ Audit statistics
 *
 * NOT INCLUDED:
 * ✗ Graph analytics or scoring
 * ✗ Persistence or storage
 * ✗ Query optimization or indexing
 * ✗ Link analysis or pattern detection
 * ✗ Clustering or temporal aggregation
 * ✗ External service calls
 *
 * CORRECTIONS APPLIED:
 * 1. extractActorInfo() uses strict DataEngineActorExtraction return type (no `any`)
 * 2. Asset node insertion includes node-level duplicate safety check
 * 3. Edge createdAt uses safe fallback chain (event → observed → ingested → now)
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type { DataEngineGraphNodeType } from './types/DataEngineGraphNodeType';
export type { DataEngineGraphEdgeType } from './types/DataEngineGraphEdgeType';

// ─────────────────────────────────────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────────────────────────────────────

export type { DataEngineGraphNode } from './models/DataEngineGraphNode';
export type { DataEngineGraphEdge } from './models/DataEngineGraphEdge';
export type { DataEngineActorExtraction } from './models/DataEngineActorExtraction';
export type { DataEngineGraphAttachmentCandidate } from './models/DataEngineGraphAttachmentCandidate';
export type { DataEngineGraphAttachmentResult } from './models/DataEngineGraphAttachmentResult';

// ─────────────────────────────────────────────────────────────────────────────
// ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export { attachEntityToGraph } from './engine/attachEntityToGraph';

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────

export {
  maintenanceEventExample,
  maintenanceEventAttached,
  diagnosticObservationExample,
  diagnosticObservationAttached,
  inspectionAssessmentExample,
  inspectionAssessmentAttached,
  damageIncidentExample,
  damageIncidentAttached,
  exampleGraphAttachmentCases,
} from './examples/exampleGraphAttachmentCases';
