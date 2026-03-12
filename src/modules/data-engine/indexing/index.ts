/**
 * Data Engine - Indexing Module
 * Phase 6: Index Preparation Layer
 * Converts vehicle data to machine-readable index format
 */

// Legacy exports
export type { DataEngineIndex } from './indicesDomainEngine';
export {
  buildRiskDomainIndicesFromVIO,
  buildRiskDomainIndices,
} from './indicesDomainEngine';

// Phase 6 — Index Preparation Layer exports
// Types and models (safe for all contexts)
export { DataEngineIndexRecordType } from './types/DataEngineIndexRecordType';
export type { DataEngineIndexRecord } from './models/DataEngineIndexRecord';
export type { DataEngineIndexPreparationCandidate } from './models/DataEngineIndexPreparationCandidate';
export type { DataEngineIndexPreparationResult } from './models/DataEngineIndexPreparationResult';

// Engine function NOT exported here (requires Node.js crypto module)
// Import directly from engine module in backend/server-only code:
// import { prepareGraphIndexes } from '@/modules/data-engine/indexing/engine/prepareGraphIndexes';
