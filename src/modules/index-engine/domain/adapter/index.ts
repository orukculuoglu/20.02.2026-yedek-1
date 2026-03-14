/**
 * Graph → Index Adapter Layer
 * 
 * Transforms Vehicle Intelligence Graph artifacts into Index Engine inputs.
 * Provides deterministic, explainable conversion from Graph data to IndexInput schema.
 * 
 * ARCHITECTURE:
 * - GraphIndexAdapter: Main orchestration class
 * - GraphIndexRefBuilder: Traceability reference creation
 * - GraphIndexEvidenceBuilder: Evidence packaging
 * - GraphIndexSnapshotBuilder: Freshness/coverage/completeness metadata
 * - GraphIndexFeatureExtractor: 9-factor feature extraction
 */

export { GraphIndexAdapter } from './graph-index-adapter';
export { GraphIndexRefBuilder } from './graph-index-ref-builder';
export { GraphIndexEvidenceBuilder } from './graph-index-evidence-builder';
export { GraphIndexSnapshotBuilder } from './graph-index-snapshot-builder';
export { GraphIndexFeatureExtractor } from './graph-index-feature-extractor';
